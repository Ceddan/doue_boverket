import sqlite3
import json
import os

DB_FILE = "energy_data.db"
JSON_FILE = "result.json"

def init_db():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"Removed existing {DB_FILE}")

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Create table
    c.execute('''CREATE TABLE properties (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fastighetsbeteckning TEXT,
                    adress TEXT,
                    kommun TEXT,
                    energiklass TEXT,
                    datum TEXT,
                    primarenergital TEXT,
                    energiprestanda TEXT,
                    fetched_at TIMESTAMP
                )''')
    
    # Load JSON data
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"Importing {len(data)} records...")
        
        for entry in data:
            c.execute('''INSERT INTO properties (fastighetsbeteckning, adress, kommun)
                         VALUES (?, ?, ?)''', 
                      (entry.get('Fastighetsbeteckning'), 
                       entry.get('Adress'), 
                       entry.get('Kommunnamn')))
        
        conn.commit()
        print("Import successful.")
        
    except Exception as e:
        print(f"Error importing data: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
