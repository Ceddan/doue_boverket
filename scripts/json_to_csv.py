import json
import csv

def json_to_csv(json_file, csv_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if not data:
        print("No data found.")
        return

    # Get headers from the first entry
    headers = list(data[0].keys())
    # Ensure specific order if desired: Fastighetsbeteckning, Adress, Kommunnamn
    desired_order = ['Fastighetsbeteckning', 'Adress', 'Kommunnamn']
    # Filter headers to only include desired ones if they exist, or just use all
    headers = [h for h in desired_order if h in headers]
    
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    json_to_csv('result.json', 'result.csv')
