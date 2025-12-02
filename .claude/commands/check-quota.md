Test if Boverket API quota has reset.

Run: `python3 check_quota.py`

This makes a single test API call and reports:
- OK: API is available, quota has reset
- QUOTA_EXCEEDED: Still blocked (403)
- RATE_LIMITED: Too many requests (429)
- ERROR: Other issue

Results are logged to `api_status.json` for tracking.
