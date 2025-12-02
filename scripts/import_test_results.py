import sqlite3
import json
import re
import os

DB_FILE = "energy_data.db"
TEST_OUTPUT_FILE = "api_test_output_20.txt"

def import_results():
    if not os.path.exists(DB_FILE):
        print(f"Database {DB_FILE} not found.")
        return

    if not os.path.exists(TEST_OUTPUT_FILE):
        print(f"File {TEST_OUTPUT_FILE} not found.")
        return

    print(f"Reading {TEST_OUTPUT_FILE}...")
    with open(TEST_OUTPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by "Requesting:" to separate blocks
    blocks = content.split("Requesting:")
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    count = 0
    
    for block in blocks:
        if not block.strip():
            continue
            
        # Extract URL to get fastighet and kommun
        url_match = re.search(r'https://api.boverket.se/energideklarationer\?kommun=([^&]+)&fastighetsbeteckning=([^\s]+)', block)
        if not url_match:
            continue
            
        kommun = urllib.parse.unquote(url_match.group(1))
        fastighet = urllib.parse.unquote(url_match.group(2)).replace('+', ' ')
        
        # Find JSON content
        json_start = block.find('{')
        json_end = block.rfind('}')
        
        if json_start != -1 and json_end != -1:
            json_str = block[json_start:json_end+1]
            try:
                data = json.loads(json_str)
                if data.get('energideklarationer'):
                    decl = data['energideklarationer'][0]
                    energiklass = decl.get('energiklass')
                    datum = decl.get('utford')
                    primarenergital = decl.get('primarenergital')
                    energiprestanda = decl.get('energiprestanda')
                    
                    # Update DB
                    # We need to match by fastighetsbeteckning and kommun
                    # Using LIKE for case insensitivity might be safer
                    c.execute('''UPDATE properties 
                                 SET energiklass = ?, datum = ?, primarenergital = ?, energiprestanda = ?, fetched_at = datetime('now')
                                 WHERE fastighetsbeteckning = ? AND kommun = ?''',
                              (energiklass, datum, primarenergital, energiprestanda, fastighet, kommun))
                    
                    if c.rowcount > 0:
                        count += 1
                        print(f"Updated {fastighet}")
                    else:
                        print(f"Property not found in DB: {fastighet}")
                        
            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Error processing block: {e}")

    conn.commit()
    conn.close()
    print(f"Imported {count} results.")

import urllib.parse

if __name__ == "__main__":
    import_results()
