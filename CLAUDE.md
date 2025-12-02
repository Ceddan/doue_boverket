# Boverket Energy Declaration Project

## WHAT - Tech Stack
- Database: SQLite (`energy_data.db`)
- API: Boverket Energideklarationer (REST)
- Scripts: Python 3
- Frontend: React + Vite + Tailwind

## WHY - Purpose
Fetch energy declarations (energiklass A-G) for Swedish properties from Boverket's public API and store in local database for analysis.

## HOW - Commands
- `python3 stats.py` - Show import progress and quota status
- `python3 import_malmo_batch.py` - Import next 20 Malmö properties
- `python3 check_quota.py` - Test if API quota has reset

## API Limits (IMPORTANT)
- **1500 calls/day** (resets midnight Swedish time)
- **10 calls/2 seconds** (rate limit)
- **40 MB data/day**
- HTTP 403 = quota exceeded, HTTP 429 = rate limited

## Database Schema
```sql
properties(id, fastighetsbeteckning, adress, kommun, energiklass, datum, primarenergital, energiprestanda, fetched_at)
```

## Workflow
1. Run `/stats` to check current progress
2. Run `/check-quota` to verify API available
3. Run `/import-batch malmö 20` to fetch next batch
4. Repeat step 3 until quota exhausted or complete

## Project Structure
```
├── src/              # React frontend
├── data/             # Source JSON files, raw data
├── docs/             # API documentation, PDFs
├── scripts/          # Utility scripts
├── energy_data.db    # SQLite database
├── .env              # API key (not in git)
└── api_status.json   # Quota tracking (auto-generated)
```

## Key Files
- `data/malmo_properties_clean.json` - Source: 239 Malmö properties
- `docs/boverket_api_docs.md` - Full API documentation
- `docs/api.pdf` - Official Boverket API PDF

## API Reference
- Base URL: `https://api.boverket.se/energideklarationer`
- Auth Header: `Ocp-Apim-Subscription-Key`
