import json
import argparse

def parse_text_file(filepath):
    properties = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = [l.strip() for l in content.split('\n')]
        
        current_fastighet = None
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            if line == "Fastighetsbeteckning":
                # Look ahead for value
                j = i + 1
                while j < len(lines) and not lines[j]:
                    j += 1
                if j < len(lines):
                    current_fastighet = lines[j]

            elif line == "Gatuadress":
                # Look ahead for value
                j = i + 1
                while j < len(lines) and not lines[j]:
                    j += 1
                if j < len(lines):
                    current_adress = lines[j]
            
            elif line == "Kommunnamn":
                # Look ahead for value
                j = i + 1
                while j < len(lines) and not lines[j]:
                    j += 1
                if j < len(lines):
                    kommun = lines[j]
                    if current_fastighet:
                        properties.append({
                            "fastighetsbeteckning": current_fastighet,
                            "adress": current_adress if 'current_adress' in locals() else None,
                            "kommun": kommun
                        })
                        current_fastighet = None # Reset
                        current_adress = None # Reset
            
            i += 1
            
    except Exception as e:
        print(f"Error parsing file: {e}")
        
    return properties

def main():
    parser = argparse.ArgumentParser(description='Convert text file to JSON properties.')
    parser.add_argument('input_file', help='Path to input text file')
    parser.add_argument('output_file', help='Path to output JSON file')
    args = parser.parse_args()

    print(f"Parsing {args.input_file}...")
    data = parse_text_file(args.input_file)
    
    print(f"Found {len(data)} properties.")
    
    with open(args.output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Saved to {args.output_file}")

if __name__ == "__main__":
    main()
