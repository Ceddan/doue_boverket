import json
import argparse

def clean_json(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned_data = []
    seen = set()
    
    for item in data:
        fastighet = item.get('fastighetsbeteckning')
        kommun = item.get('kommun')
        adress = item.get('adress')
        
        # Validation rules
        if not fastighet or not kommun:
            continue
            
        if "http" in kommun or "msbgis" in kommun:
            continue
            
        # Deduplication (keep unique fastighet+kommun, but maybe update address if missing?)
        # For now, simple dedup on key
        key = (fastighet, kommun)
        if key in seen:
            continue
            
        seen.add(key)
        cleaned_data.append(item)
        
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
        
    print(f"Cleaned data saved to {output_file}. Removed {len(data) - len(cleaned_data)} entries.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('input_file')
    parser.add_argument('output_file')
    args = parser.parse_args()
    
    clean_json(args.input_file, args.output_file)
