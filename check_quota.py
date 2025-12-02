#!/usr/bin/env python3
"""Check if Boverket API quota has reset by making a test call."""

import urllib.request
import urllib.parse
import json
import os
from datetime import datetime

API_BASE_URL = "https://api.boverket.se/energideklarationer"
API_KEY_ENV = "BOVERKET_API_KEY"
STATUS_FILE = "api_status.json"

# Known working property for testing
TEST_KOMMUN = "Malmö"
TEST_FASTIGHET = "Mariedal 2"

def get_api_key():
    """Load API key from environment or .env file."""
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

def check_api():
    """Make a test API call and return status."""
    api_key = get_api_key()
    if not api_key:
        return {
            'status': 'ERROR',
            'message': 'API key not found',
            'http_code': None
        }

    params = urllib.parse.urlencode({
        "kommun": TEST_KOMMUN,
        "fastighetsbeteckning": TEST_FASTIGHET
    })
    url = f"{API_BASE_URL}?{params}"

    req = urllib.request.Request(url)
    req.add_header("Ocp-Apim-Subscription-Key", api_key)

    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                return {
                    'status': 'OK',
                    'message': 'API is available',
                    'http_code': 200
                }
    except urllib.error.HTTPError as e:
        if e.code == 403:
            return {
                'status': 'QUOTA_EXCEEDED',
                'message': 'Daily quota exceeded (403 Forbidden)',
                'http_code': 403
            }
        elif e.code == 429:
            return {
                'status': 'RATE_LIMITED',
                'message': 'Too many requests (429)',
                'http_code': 429
            }
        elif e.code == 401:
            return {
                'status': 'UNAUTHORIZED',
                'message': 'Invalid API key (401)',
                'http_code': 401
            }
        else:
            return {
                'status': 'ERROR',
                'message': f'HTTP Error {e.code}',
                'http_code': e.code
            }
    except Exception as e:
        return {
            'status': 'ERROR',
            'message': str(e),
            'http_code': None
        }

def save_status(result):
    """Save status to JSON file."""
    result['timestamp'] = datetime.now().isoformat()
    result['test_property'] = f"{TEST_KOMMUN} / {TEST_FASTIGHET}"

    with open(STATUS_FILE, 'w') as f:
        json.dump(result, f, indent=2)

def main():
    print("Checking Boverket API quota status...")
    print(f"Test property: {TEST_KOMMUN} / {TEST_FASTIGHET}")
    print()

    result = check_api()
    save_status(result)

    # Display result
    status = result['status']
    if status == 'OK':
        print("✓ API STATUS: OK")
        print("  Quota has reset. You can run imports.")
    elif status == 'QUOTA_EXCEEDED':
        print("✗ API STATUS: QUOTA EXCEEDED")
        print("  Daily limit (1500 calls) reached.")
        print("  Try again after midnight Swedish time.")
    elif status == 'RATE_LIMITED':
        print("⚠ API STATUS: RATE LIMITED")
        print("  Too many requests. Wait a few seconds.")
    elif status == 'UNAUTHORIZED':
        print("✗ API STATUS: UNAUTHORIZED")
        print("  Check your API key in .env file.")
    else:
        print(f"✗ API STATUS: {status}")
        print(f"  {result['message']}")

    print()
    print(f"Status saved to: {STATUS_FILE}")

if __name__ == "__main__":
    main()
