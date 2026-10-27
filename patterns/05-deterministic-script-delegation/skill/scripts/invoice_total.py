import argparse
import csv
import json
import sys
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from pathlib import Path

CENT = Decimal("0.01")
COLUMNS = {"item", "quantity", "unit_price"}


@dataclass(frozen=True)
class Totals:
    items: int
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal


def money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def compute(rows: list[dict[str, str]], tax_rate: Decimal, discount_rate: Decimal = Decimal("0")) -> Totals:
    if not rows:
        raise ValueError("invoice has no line items")
    missing = COLUMNS - set(rows[0])
    if missing:
        raise ValueError(f"missing columns: {', '.join(sorted(missing))}")
    if not (Decimal("0") <= tax_rate < 1 and Decimal("0") <= discount_rate < 1):
        raise ValueError("rates must be between 0 and 1, use 0.0825 for 8.25%")
    subtotal = Decimal("0")
    for row in rows:
        quantity = int(row["quantity"])
        if quantity <= 0:
            raise ValueError(f"quantity must be positive for {row['item']}")
        subtotal += Decimal(row["unit_price"]) * quantity
    subtotal = money(subtotal)
    discount = money(subtotal * discount_rate)
    tax = money((subtotal - discount) * tax_rate)
    return Totals(len(rows), subtotal, discount, tax, subtotal - discount + tax)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="invoice_total")
    parser.add_argument("csv", type=Path)
    parser.add_argument("--tax-rate", type=Decimal, default=Decimal("0"))
    parser.add_argument("--discount-rate", type=Decimal, default=Decimal("0"))
    args = parser.parse_args(argv)
    try:
        with args.csv.open(newline="") as handle:
            totals = compute(list(csv.DictReader(handle)), args.tax_rate, args.discount_rate)
    except (OSError, ValueError, InvalidOperation) as error:
        print(f"invoice_total failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps({"items": totals.items, **{k: str(v) for k, v in vars(totals).items() if k != "items"}}))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
