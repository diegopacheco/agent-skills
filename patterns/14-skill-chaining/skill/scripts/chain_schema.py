from decimal import Decimal, InvalidOperation

SCHEMA = "csv-summary/1"
STATS = ("sum", "min", "max")


def is_decimal(value: object) -> bool:
    if not isinstance(value, str):
        return False
    try:
        Decimal(value)
    except InvalidOperation:
        return False
    return True


def violations(document: object) -> list[str]:
    if not isinstance(document, dict):
        return ["document must be a JSON object"]
    problems = []
    if document.get("schema") != SCHEMA:
        problems.append(f"schema must be {SCHEMA}, got {document.get('schema')!r}")
    if set(document) != {"schema", "source", "rows", "columns"}:
        problems.append("keys must be exactly schema, source, rows, columns")
    if not isinstance(document.get("source"), str):
        problems.append("source must be a string")
    rows = document.get("rows")
    if not isinstance(rows, int) or isinstance(rows, bool) or rows < 1:
        problems.append("rows must be a positive integer")
    columns = document.get("columns")
    if not isinstance(columns, dict) or not columns:
        return problems + ["columns must be a non empty object"]
    for name, stats in columns.items():
        if not isinstance(stats, dict) or set(stats) != set(STATS):
            problems.append(f"column {name} must have exactly {', '.join(STATS)}")
            continue
        problems += [f"column {name}.{stat} must be a decimal string" for stat in STATS if not is_decimal(stats[stat])]
    return problems
