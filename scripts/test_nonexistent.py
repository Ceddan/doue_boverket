import urllib.request
import urllib.parse
import os
import json

API_BASE_URL = "https://api.boverket.se/energideklarationer"
API_KEY_ENV = "BOVERKET_API_KEY"

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

def test_fetch(kommun, fastighet):
    params = urllib.parse.urlencode({
        "kommun": kommun,
        "fastighetsbeteckning": fastighet
    })
    url = f"{API_BASE_URL}?{params}"
    print(f"Fetching {url}")
    
    req = urllib.request.Request(url)
    req.add_header("Ocp-Apim-Subscription-Key", api_key)
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            data = response.read().decode('utf-8')
            print(f"Data: {data}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")

test_fetch("Solna", "Banken 9999")
