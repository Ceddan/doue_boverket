import http.server
import socketserver
import json
import os
import sqlite3
import urllib.request
import urllib.parse
from urllib.error import HTTPError
from datetime import datetime

PORT = 8081
API_BASE_URL = "https://api.boverket.se/energideklarationer"
API_KEY_ENV = "BOVERKET_API_KEY"
DB_FILE = "energy_data.db"

# Load API Key
api_key = os.environ.get(API_KEY_ENV)
if not api_key:
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith(f"{API_KEY_ENV}="):
                    api_key = line.split('=', 1)[1].strip()
                    break
    except FileNotFoundError:
        pass

class DBHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # API: Get all properties
        if self.path == '/api/properties':
            try:
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM properties")
                rows = c.fetchall()
                data = [dict(row) for row in rows]
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode('utf-8'))
            except Exception as e:
                self.send_error(500, str(e))
            return

        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        # API: Fetch and Update Energy Data
        if self.path == '/api/fetch':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_json = json.loads(post_data)
            
            prop_id = request_json.get('id')
            kommun = request_json.get('kommun')
            fastighet = request_json.get('fastighet')
            
            if not prop_id or not kommun:
                self.send_error(400, "Missing id or kommun")
                return

            # Call Boverket API
            params = {"kommun": kommun}
            if fastighet:
                params["fastighetsbeteckning"] = fastighet
            
            query_string = urllib.parse.urlencode(params)
            target_url = f"{API_BASE_URL}?{query_string}"
            
            print(f"Fetching: {target_url}")
            
            req = urllib.request.Request(target_url)
            req.add_header("Ocp-Apim-Subscription-Key", api_key)
            
            try:
                with urllib.request.urlopen(req) as response:
                    api_data = json.loads(response.read().decode('utf-8'))
                    
                    # Extract relevant fields
                    energiklass = None
                    datum = None
                    primarenergital = None
                    energiprestanda = None
                    
                    if api_data.get('energideklarationer'):
                        decl = api_data['energideklarationer'][0]
                        energiklass = decl.get('energiklass')
                        datum = decl.get('utford')
                        primarenergital = decl.get('primarenergital')
                        energiprestanda = decl.get('energiprestanda')
                    
                    # Update DB
                    conn = sqlite3.connect(DB_FILE)
                    c = conn.cursor()
                    c.execute('''UPDATE properties 
                                 SET energiklass = ?, datum = ?, primarenergital = ?, energiprestanda = ?, fetched_at = ?
                                 WHERE id = ?''',
                              (energiklass, datum, primarenergital, energiprestanda, datetime.now().isoformat(), prop_id))
                    conn.commit()
                    conn.close()
                    
                    # Return updated record
                    response_data = {
                        "success": True,
                        "energiklass": energiklass,
                        "datum": datum,
                        "primarenergital": primarenergital,
                        "energiprestanda": energiprestanda
                    }
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(response_data).encode('utf-8'))
                    
            except Exception as e:
                print(f"Error: {e}")
                self.send_error(500, str(e))
            return
        # API: Scan for properties and stream results
        elif self.path == '/api/scan':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data.decode('utf-8'))
            
            base_name = params.get('base_name')
            start = int(params.get('start', 1))
            end = int(params.get('end', 1))
            kommun = params.get('kommun')
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Transfer-Encoding', 'chunked')
            self.end_headers()
            
            def send_chunk(msg):
                chunk = f"{msg}\n".encode('utf-8')
                self.wfile.write(f"{len(chunk):x}\r\n".encode('utf-8'))
                self.wfile.write(chunk)
                self.wfile.write(b"\r\n")
                self.wfile.flush()

            conn = sqlite3.connect('energy_data.db')
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            try:
                for i in range(start, end + 1):
                    fastighet = f"{base_name} {i}"
                    send_chunk(f"Checking {fastighet}...")
                    
                    # Check DB first
                    c.execute("SELECT id FROM properties WHERE fastighetsbeteckning = ? AND kommun = ? AND energiklass IS NOT NULL", (fastighet, kommun))
                    if c.fetchone():
                        send_chunk(f"  -> Already in DB")
                        continue

                    # Fetch API
                    url_params = urllib.parse.urlencode({
                        "kommun": kommun,
                        "fastighetsbeteckning": fastighet
                    })
                    url = f"{API_BASE_URL}?{url_params}"
                    req = urllib.request.Request(url)
                    req.add_header("Ocp-Apim-Subscription-Key", api_key)
                    
                    try:
                        with urllib.request.urlopen(req) as response:
                            if response.status == 200:
                                data = json.loads(response.read().decode('utf-8'))
                                if data.get('energideklarationer'):
                                    decl = data['energideklarationer'][0]
                                    energiklass = decl.get('energiklass')
                                    datum = decl.get('utford')
                                    primarenergital = decl.get('primarenergital')
                                    energiprestanda = decl.get('energiprestanda')
                                    
                                    # Get address if available
                                    adress = ""
                                    if decl.get('fastigheter') and decl['fastigheter'][0].get('adresser'):
                                         adress = decl['fastigheter'][0]['adresser'][0].get('adress', '')

                                    fetched_at = datetime.now().isoformat()
                                    
                                    # Insert/Update
                                    # Check if exists (maybe empty)
                                    c.execute("SELECT id FROM properties WHERE fastighetsbeteckning = ? AND kommun = ?", (fastighet, kommun))
                                    row = c.fetchone()
                                    
                                    if row:
                                        c.execute('''UPDATE properties 
                                                     SET energiklass = ?, datum = ?, primarenergital = ?, energiprestanda = ?, fetched_at = ?, adress = ?
                                                     WHERE id = ?''',
                                                  (energiklass, datum, primarenergital, energiprestanda, fetched_at, adress, row['id']))
                                    else:
                                        c.execute('''INSERT INTO properties (fastighetsbeteckning, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at)
                                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                                                  (fastighet, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at))
                                    
                                    conn.commit()
                                    send_chunk(f"  -> FOUND! Class: {energiklass}")
                                else:
                                    send_chunk(f"  -> No declaration found")
                            else:
                                send_chunk(f"  -> API Error {response.status}")
                    except Exception as e:
                        send_chunk(f"  -> Error: {str(e)}")
                    
                    time.sleep(0.2) # Small delay
                
                send_chunk("Done.")
                self.wfile.write(b"0\r\n\r\n") # End of chunks
                
            except Exception as e:
                print(e)
            finally:
                conn.close()
            return

        # API: Get import log
        elif self.path == '/api/log':
            log_file = "import.log"
            try:
                if os.path.exists(log_file):
                    # Read last 50 lines
                    with open(log_file, 'r') as f:
                        lines = f.readlines()
                        last_lines = lines[-50:]
                        content = "".join(last_lines)
                else:
                    content = "Log file not found yet."
                
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_error(500, str(e))
            return

if __name__ == "__main__":
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DBHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print(f"Connected to {DB_FILE}")
        httpd.serve_forever()
