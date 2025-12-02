#!/usr/bin/env python3
import json
import sqlite3
import time
import urllib.request
import urllib.parse
import os
from datetime import datetime

DB_FILE = 'energy_data.db'
API_BASE_URL = "https://api.boverket.se/energideklarationer"
API_KEY_ENV = "BOVERKET_API_KEY"
BATCH_SIZE = 20

def get_api_key():
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
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print(f"  RATE LIMITED! Quota may be reached.")
            return "RATE_LIMITED"
        print(f"  HTTP Error {e.code} for {fastighet}")
    except Exception as e:
        print(f"  Error fetching {fastighet}: {e}")
    return None

def save_to_db(kommun, fastighet, adress_from_list, data):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    energiklass = None
    datum = None
    primarenergital = None
    energiprestanda = None
    adress = adress_from_list

    if data.get('energideklarationer'):
        decl = data['energideklarationer'][0]
        energiklass = decl.get('energiklass')
        datum = decl.get('utford')
        primarenergital = decl.get('primarenergital')
        energiprestanda = decl.get('energiprestanda')

        if decl.get('fastigheter') and decl['fastigheter'][0].get('adresser'):
             adress = decl['fastigheter'][0]['adresser'][0].get('adress', adress)

    fetched_at = datetime.now().isoformat()

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
    return energiklass

def get_processed_properties():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT fastighetsbeteckning FROM properties WHERE kommun = 'Malmö' AND energiklass IS NOT NULL")
    processed = set(row[0] for row in c.fetchall())
    conn.close()
    return processed

def main():
    api_key = get_api_key()
    if not api_key:
        print("API Key not found!")
        return

    with open('data/malmo_properties_clean.json', 'r', encoding='utf-8') as f:
        all_properties = json.load(f)

    processed = get_processed_properties()
    print(f"Already processed: {len(processed)} properties with energiklass")

    pending = [p for p in all_properties if p['fastighetsbeteckning'] not in processed]
    print(f"Pending: {len(pending)} properties")

    batch = pending[:BATCH_SIZE]
    print(f"\nProcessing batch of {len(batch)} properties:\n")

    success = 0
    no_data = 0

    for i, prop in enumerate(batch, 1):
        fastighet = prop['fastighetsbeteckning']
        adress = prop['adress']
        kommun = prop['kommun']

        print(f"[{i}/{len(batch)}] {fastighet}...")

        data = fetch_property(api_key, kommun, fastighet)

        if data == "RATE_LIMITED":
            print("\n*** QUOTA REACHED! Stopping. ***")
            break

        if data and data.get('energideklarationer'):
            ek = save_to_db(kommun, fastighet, adress, data)
            if ek:
                success += 1
        else:
            print(f"  No energideklaration found")
            no_data += 1

        time.sleep(0.5)

    print(f"\n=== Summary ===")
    print(f"Successfully fetched: {success}")
    print(f"No data found: {no_data}")

    remaining = len(pending) - len(batch)
    print(f"Remaining after this batch: {remaining}")

if __name__ == "__main__":
    main()
