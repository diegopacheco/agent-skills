import csv
import json
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

from chain_schema import SCHEMA, violations


def numeric(values: list[str]) -> list[Decimal] | None:
    try:
        return [Decimal(value) for value in values]
    except InvalidOperation:
        return None


def summarize(path: Path) -> dict[str, object]:
    with path.open(newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise ValueError(f"{path} has no data rows")
    columns = {}
    for name in rows[0]:
        values = numeric([row[name] for row in rows])
        if values is not None:
            columns[name] = {"sum": str(sum(values)), "min": str(min(values)), "max": str(max(values))}
    return {"schema": SCHEMA, "source": path.name, "rows": len(rows), "columns": columns}


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print("usage: summarize_csv.py <file.csv>", file=sys.stderr)
        return 2
    try:
        document = summarize(Path(argv[0]))
    except (OSError, ValueError) as error:
        print(f"summarize_csv failed: {error}", file=sys.stderr)
        return 1
    problems = violations(document)
    if problems:
        print("summarize_csv produced an invalid link: " + "; ".join(problems), file=sys.stderr)
        return 1
    print(json.dumps(document))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
