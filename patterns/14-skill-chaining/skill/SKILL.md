---
name: csv-to-report
description: Turn a CSV into a markdown report through a two link chain - summarize writes JSON in the fixed csv-summary/1 schema, render accepts only that schema, and both ends validate the link so a broken handoff stops the chain. Use when the user asks to summarize, report on, or get totals, minimums and maximums for a CSV file.
---

# CSV to Report

Two links, one contract. Each link does one job, and the JSON between them is the only thing they share.

## The link: csv-summary/1

```json
{"schema": "csv-summary/1", "source": "sales.csv", "rows": 3, "columns": {"amount": {"sum": "60.50", "min": "10.00", "max": "30.25"}}}
```

* Exactly the keys `schema`, `source`, `rows`, `columns`.
* `rows` is a positive integer. Every stat is a decimal string, never a float.
* `scripts/chain_schema.py` is the contract in code. Both links import it.

## Steps

1. Run the first link, from the folder with the CSV:
   `python3 <skill-dir>/scripts/summarize_csv.py <file.csv> > summary.json`
2. Run the second link:
   `python3 <skill-dir>/scripts/render_report.py < summary.json > report.md`
3. Show `report.md` to the user.

## Rules

* Never edit `summary.json` by hand to get past the second link. A refused link means the first link is wrong. Fix that and rerun it.
* Never ask the second link to accept another schema. A new shape is `csv-summary/2`, with its own validator.
* If any link exits non zero, report its stderr and stop the chain.
