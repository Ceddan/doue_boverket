import re
import json

def parse_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The text seems to be broken into blocks.
    # We can split by "Skyddsrum:" or just iterate line by line looking for keys.
    
    entries = []
    current_entry = {}
    
    # Regex patterns
    # Using flexible spacing to handle the layout
    # The layout seems to be: Key (spaces) Value
    
    # We'll look for lines starting with specific keywords
    
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("Skyddsrum:"):
            # Start of a new block (or just a header, but usually indicates a new record context)
            # If we have a current entry with data, save it?
            # Actually, the blocks seem to be distinct.
            # Let's see if "Skyddsrum:" is the start.
            # Based on the view_file, "Skyddsrum:" is the first line of a block.
            if current_entry:
                # Check if we have the required fields before adding
                if 'Fastighetsbeteckning' in current_entry or 'Gatuadress' in current_entry:
                     entries.append(current_entry)
                current_entry = {}
            # We don't really need the Skyddsrum ID for the user request, but good to know we reset here.
            
        elif line.startswith("Gatuadress"):
            value = line.replace("Gatuadress", "", 1).strip()
            current_entry['Adress'] = value
            
        elif line.startswith("Fastighetsbeteckning"):
            value = line.replace("Fastighetsbeteckning", "", 1).strip()
            current_entry['Fastighetsbeteckning'] = value
            
        elif line.startswith("Kommunnamn"):
            value = line.replace("Kommunnamn", "", 1).strip()
            current_entry['Kommunnamn'] = value

    # Add the last entry
    if current_entry and ('Fastighetsbeteckning' in current_entry or 'Gatuadress' in current_entry):
        entries.append(current_entry)
        
    return entries

if __name__ == "__main__":
    data = parse_text('extracted_text.txt')
    print(json.dumps(data, indent=2, ensure_ascii=False))
