#!/usr/bin/env python3
"""Show Boverket import statistics and API quota status."""

import sqlite3
import json
import os
from datetime import datetime

DB_FILE = 'energy_data.db'
STATUS_FILE = 'api_status.json'

def get_db_stats():
    """Get property counts from database."""
    if not os.path.exists(DB_FILE):
        return {}

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Get counts per kommun
    c.execute('''
        SELECT kommun,
               COUNT(*) as total,
               SUM(CASE WHEN energiklass IS NOT NULL THEN 1 ELSE 0 END) as fetched
        FROM properties
        GROUP BY kommun
    ''')

    stats = {}
    for row in c.fetchall():
        kommun, total, fetched = row
        stats[kommun] = {'in_db': total, 'fetched': fetched or 0}

    conn.close()
    return stats

def get_source_counts():
    """Get property counts from source JSON files in data folder."""
    sources = {}
    data_dir = 'data'

    if not os.path.exists(data_dir):
        return sources

    # Check for Malmö source
    malmo_file = os.path.join(data_dir, 'malmo_properties_clean.json')
    if os.path.exists(malmo_file):
        with open(malmo_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            sources['Malmö'] = len(data)

    # Check for other source files
    for filename in os.listdir(data_dir):
        if filename.endswith('_properties_clean.json') and filename != 'malmo_properties_clean.json':
            kommun = filename.replace('_properties_clean.json', '').title()
            with open(os.path.join(data_dir, filename), 'r', encoding='utf-8') as f:
                data = json.load(f)
                sources[kommun] = len(data)

    return sources

def get_api_status():
    """Get last API status from status file."""
    if not os.path.exists(STATUS_FILE):
        return None

    with open(STATUS_FILE, 'r') as f:
        return json.load(f)

def main():
    print("=" * 50)
    print("       BOVERKET IMPORT STATISTICS")
    print("=" * 50)
    print()

    db_stats = get_db_stats()
    source_counts = get_source_counts()

    # Merge sources with DB stats
    all_kommuner = set(db_stats.keys()) | set(source_counts.keys())

    total_source = 0
    total_fetched = 0
    total_pending = 0

    for kommun in sorted(all_kommuner):
        source_count = source_counts.get(kommun, 0)
        db_info = db_stats.get(kommun, {'in_db': 0, 'fetched': 0})
        fetched = db_info['fetched']
        pending = source_count - fetched if source_count > 0 else 0

        total_source += source_count
        total_fetched += fetched
        total_pending += max(0, pending)

        if source_count > 0:
            progress = (fetched / source_count) * 100
            print(f"{kommun}:")
            print(f"  Source:   {source_count:>5} properties")
            print(f"  Fetched:  {fetched:>5} (with energiklass)")
            print(f"  Pending:  {pending:>5}")
            print(f"  Progress: {progress:>5.1f}%")
            print()
        elif db_info['in_db'] > 0:
            print(f"{kommun}:")
            print(f"  In DB:    {db_info['in_db']:>5} properties")
            print(f"  Fetched:  {fetched:>5} (with energiklass)")
            print()

    print("-" * 50)
    print(f"TOTAL:")
    print(f"  Source files: {total_source:>5} properties")
    print(f"  Fetched:      {total_fetched:>5}")
    print(f"  Pending:      {total_pending:>5}")
    if total_source > 0:
        print(f"  Progress:     {(total_fetched/total_source)*100:>5.1f}%")
    print()

    # API Status
    print("-" * 50)
    print("API STATUS:")
    status = get_api_status()
    if status:
        print(f"  Last check: {status.get('timestamp', 'unknown')}")
        print(f"  Status:     {status.get('status', 'unknown')}")
        if status.get('http_code'):
            print(f"  HTTP Code:  {status.get('http_code')}")
    else:
        print("  No status recorded. Run: python3 check_quota.py")
    print()

    # Estimate
    print("-" * 50)
    print("ESTIMATE:")
    print(f"  API calls needed: ~{total_pending}")
    days_needed = (total_pending // 1500) + 1
    print(f"  Days to complete: ~{days_needed} (at 1500/day)")
    print()

if __name__ == "__main__":
    main()
