Import next batch of properties from Boverket API.

Usage: /import-batch $ARGUMENTS

Arguments: [kommun] [batch_size]
- kommun: Municipality name (default: Malmö)
- batch_size: Number of properties to fetch (default: 20)

Examples:
- `/import-batch` - Import 20 Malmö properties
- `/import-batch malmö 50` - Import 50 Malmö properties
- `/import-batch solna 20` - Import 20 Solna properties

Run: `python3 import_malmo_batch.py`

IMPORTANT: Check quota status first with `/check-quota` before running imports.
