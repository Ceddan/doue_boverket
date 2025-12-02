import re
import sqlite3
import time
import urllib.request
import urllib.parse
import json
import os
from datetime import datetime

print("Script starting...", flush=True)

# Configuration
INPUT_FILE = 'rasunda_text.txt'
DB_FILE = 'energy_data.db'
API_BASE_URL = "https://api.boverket.se/energideklarationer"
API_KEY_ENV = "BOVERKET_API_KEY"

def get_api_key():
    print("Getting API key...", flush=True)
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
    return api_key

def parse_text_file(filepath):
    print(f"Reading {filepath}...", flush=True)
    properties = set() # (fastighet, kommun)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"Read {len(content)} chars.", flush=True)
            
        # The text structure seems to be:
        # Fastighetsbeteckning
        # <blank lines>
        # <Value>
        # ...
        # Kommunnamn
        # <blank lines>
        # <Value>
        
        # Let's try to find blocks.
        # Since it's a bit messy, maybe regex is best.
        # Pattern: Fastighetsbeteckning\s+([^\n]+) ... Kommunnamn\s+([^\n]+)
        # But there are newlines.
        
        # Alternative: Iterate and look for headers.
        lines = [l.strip() for l in content.split('\n')]
        print(f"Split into {len(lines)} lines.", flush=True)
        
        current_fastighet = None
        
        i = 0
        while i < len(lines):
            if i % 1000 == 0:
                print(f"Processing line {i}...", flush=True)
            line = lines[i]
            
            if line == "Fastighetsbeteckning":
                # Look ahead for value
                j = i + 1
                while j < len(lines) and not lines[j]:
                    j += 1
                if j < len(lines):
                    current_fastighet = lines[j]
            
            elif line == "Kommunnamn":
                # Look ahead for value
                j = i + 1
                while j < len(lines) and not lines[j]:
                    j += 1
                if j < len(lines):
                    kommun = lines[j]
                    if current_fastighet:
                        properties.add((current_fastighet, kommun))
                        current_fastighet = None # Reset
            
            i += 1
            if i > 14800:
                 print(f"  i={i}", flush=True)
            
    except Exception as e:
        print(f"Error parsing file: {e}", flush=True)
        
    print("Finished parsing.", flush=True)
    return list(properties)

def fetch_property(api_key, kommun, fastighet):
    params = urllib.parse.urlencode({
        "kommun": kommun,
        "fastighetsbeteckning": fastighet
    })
    url = f"{API_BASE_URL}?{params}"
    
    req = urllib.request.Request(url)
    req.add_header("Ocp-Apim-Subscription-Key", api_key)
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  Error fetching {fastighet}: {e}")
    return None

def save_to_db(kommun, fastighet, data):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    energiklass = None
    datum = None
    primarenergital = None
    energiprestanda = None
    adress = ""
    
    if data.get('energideklarationer'):
        decl = data['energideklarationer'][0]
        energiklass = decl.get('energiklass')
        datum = decl.get('utford')
        primarenergital = decl.get('primarenergital')
        energiprestanda = decl.get('energiprestanda')
        
        if decl.get('fastigheter') and decl['fastigheter'][0].get('adresser'):
             adress = decl['fastigheter'][0]['adresser'][0].get('adress', '')
    
    fetched_at = datetime.now().isoformat()
    
    # Check if exists
    c.execute("SELECT id FROM properties WHERE fastighetsbeteckning = ? AND kommun = ?", (fastighet, kommun))
    row = c.fetchone()
    
    if row:
        c.execute('''UPDATE properties 
                     SET energiklass = ?, datum = ?, primarenergital = ?, energiprestanda = ?, fetched_at = ?, adress = ?
                     WHERE id = ?''',
                  (energiklass, datum, primarenergital, energiprestanda, fetched_at, adress, row[0]))
        print(f"  Updated {fastighet} (Class: {energiklass})")
    else:
        c.execute('''INSERT INTO properties (fastighetsbeteckning, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  (fastighet, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at))
        print(f"  Inserted {fastighet} (Class: {energiklass})")
    
    conn.commit()
    conn.close()

def main():
    print("Entering main...", flush=True)
    api_key = get_api_key()
    print(f"API Key found: {bool(api_key)}", flush=True)
    if not api_key:
        print("API Key not found!")
        return

    print("Parsing text file...", flush=True)
    properties = parse_text_file(INPUT_FILE)
    print(f"Found {len(properties)} unique properties.", flush=True)
    
    for fastighet, kommun in properties:
        print(f"Processing {fastighet} in {kommun}...", flush=True)
        
        # Optional: Check if already has data to skip?
        # User probably wants to ensure they are added.
        
        data = fetch_property(api_key, kommun, fastighet)
        if data:
            save_to_db(kommun, fastighet, data)
        
        time.sleep(0.5) # Rate limit

if __name__ == "__main__":
    main()
