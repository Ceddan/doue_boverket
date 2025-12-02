import sqlite3
import re
import time
import urllib.request
import urllib.parse
import json
import os
from datetime import datetime

DB_FILE = "energy_data.db"
API_BASE_URL = "https://api.boverket.se/energideklarationer"
API_KEY_ENV = "BOVERKET_API_KEY"

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
        print("API Key not found.")
        exit(1)

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def get_base_names():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT DISTINCT fastighetsbeteckning, kommun FROM properties")
    rows = c.fetchall()
    conn.close()
    
    base_names = {}
    
    for row in rows:
        name = row['fastighetsbeteckning']
        kommun = row['kommun']
        
        # Regex to find "Name Number" pattern
        match = re.match(r'^(.+?)\s+(\d+)$', name)
        if match:
            base = match.group(1)
            num = int(match.group(2))
            
            key = (base, kommun)
            if key not in base_names:
                base_names[key] = []
            base_names[key].append(num)
            
    return base_names

def fetch_property(kommun, fastighet):
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
                data = json.loads(response.read().decode('utf-8'))
                return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} for {fastighet}")
    except Exception as e:
        print(f"Error fetching {fastighet}: {e}")
    return None

def save_to_db(kommun, fastighet, data):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if exists
    c.execute("SELECT id FROM properties WHERE fastighetsbeteckning = ? AND kommun = ?", (fastighet, kommun))
    row = c.fetchone()
    
    energiklass = None
    datum = None
    primarenergital = None
    energiprestanda = None
    adress = "" # We might get address from API
    
    if data.get('energideklarationer'):
        decl = data['energideklarationer'][0]
        energiklass = decl.get('energiklass')
        datum = decl.get('utford')
        primarenergital = decl.get('primarenergital')
        energiprestanda = decl.get('energiprestanda')
        
        # Try to get address from API response structure
        if decl.get('fastigheter'):
             fast_data = decl['fastigheter'][0]
             if fast_data.get('adresser'):
                 adress = fast_data['adresser'][0].get('adress', '')

    fetched_at = datetime.now().isoformat()

    if row:
        # Update
        c.execute('''UPDATE properties 
                     SET energiklass = ?, datum = ?, primarenergital = ?, energiprestanda = ?, fetched_at = ?
                     WHERE id = ?''',
                  (energiklass, datum, primarenergital, energiprestanda, fetched_at, row['id']))
        print(f"Updated {fastighet}")
    else:
        # Insert new
        c.execute('''INSERT INTO properties (fastighetsbeteckning, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  (fastighet, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at))
        print(f"Inserted new property: {fastighet}")
        
    # Retry commit in case of lock
    max_retries = 5
    for i in range(max_retries):
        try:
            conn.commit()
            break
        except sqlite3.OperationalError as e:
            if "locked" in str(e):
                time.sleep(1)
            else:
                raise e
    conn.close()

def main():
    base_names = get_base_names()
    
    print(f"Found {len(base_names)} base property groups.")
    
    for (base, kommun), numbers in base_names.items():
        # Start from 1
        current_num = 1
        consecutive_misses = 0
        max_misses = 10 # Stop after 10 empty responses in a row
        
        print(f"Processing {base} in {kommun}. Scanning from 1...")
        
        while consecutive_misses < max_misses:
            fastighet = f"{base} {current_num}"
            
            # Check if we already have it with data
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id FROM properties WHERE fastighetsbeteckning = ? AND kommun = ? AND energiklass IS NOT NULL", (fastighet, kommun))
            exists_with_data = c.fetchone()
            conn.close()
            
            if exists_with_data:
                print(f"Skipping {fastighet} (already has data)")
                current_num += 1
                consecutive_misses = 0 # Reset misses because we know this one exists
                continue
            
            print(f"Fetching {fastighet}...")
            data = fetch_property(kommun, fastighet)
            
            if data and data.get('energideklarationer'):
                save_to_db(kommun, fastighet, data)
                consecutive_misses = 0 # Reset misses
                print(f"FOUND: {fastighet}")
            else:
                consecutive_misses += 1
                # print(f"Miss: {fastighet} ({consecutive_misses}/{max_misses})")
            
            current_num += 1
            
            # Safety break to prevent infinite loops in weird cases
            if current_num > 500:
                break
                
            # Speed up slightly
            time.sleep(0.5)

if __name__ == "__main__":
    main()
