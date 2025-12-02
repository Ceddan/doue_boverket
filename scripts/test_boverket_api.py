import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error

# Configuration
API_BASE_URL = "https://api.boverket.se/energideklarationer"
INPUT_FILE = "result.json"
API_KEY_ENV = "BOVERKET_API_KEY"

def test_api():
    api_key = os.environ.get(API_KEY_ENV)
    
    # Try reading from .env file if not in environment
    if not api_key:
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith(f"{API_KEY_ENV}="):
                        api_key = line.split('=', 1)[1].strip()
                        break
        except FileNotFoundError:
            pass

    if not api_key:
        print(f"Error: {API_KEY_ENV} not found in environment or .env file.")
        print("Please paste your key in the .env file: BOVERKET_API_KEY=your_key")
        sys.exit(1)

    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {INPUT_FILE} not found.")
        sys.exit(1)

    print(f"Loaded {len(data)} records from {INPUT_FILE}. Testing first 5...")

    headers = {
        "Ocp-Apim-Subscription-Key": api_key
    }

    # Test first 20 unique entries
    tested_count = 0
    for entry in data:
        if tested_count >= 20:
            break

        kommun = entry.get("Kommunnamn")
        fastighet = entry.get("Fastighetsbeteckning")
        adress = entry.get("Adress")

        if not kommun:
            continue

        # Construct query parameters
        params = {"kommun": kommun}
        if fastighet:
            params["fastighetsbeteckning"] = fastighet
        elif adress:
            params["adress"] = adress
        else:
            continue

        query_string = urllib.parse.urlencode(params)
        url = f"{API_BASE_URL}?{query_string}"

        print(f"\nRequesting: {url}")
        
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                print(f"Status: {status}")
                # Pretty print a snippet of the JSON response
                try:
                    json_body = json.loads(body)
                    print("Response (snippet):")
                    print(json.dumps(json_body, indent=2)[:500] + "...")
                except:
                    print(f"Response body: {body[:200]}...")
                
                tested_count += 1
                
        except urllib.error.HTTPError as e:
            print(f"HTTP Error: {e.code} - {e.reason}")
            print(e.read().decode('utf-8')[:200])
        except urllib.error.URLError as e:
            print(f"URL Error: {e.reason}")
        
        # Be nice to the API rate limit (10 req / 2 sec)
        time.sleep(0.5)

if __name__ == "__main__":
    test_api()
