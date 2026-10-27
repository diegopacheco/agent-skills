---
name: invoice-total
description: Compute invoice subtotal, discount, tax and total from a CSV of line items with exact cent rounding. Use when the user asks to total, check, reconcile or apply tax or a discount to an invoice, a quote or an order.
---

# Invoice Total

Never add, multiply or round money yourself. The script in `scripts/` of this skill's base directory does it with exact decimals.

## Steps

1. Make sure the CSV has the columns `item,quantity,unit_price`. If the data is in another format, write it to a CSV first, copying values exactly.
2. Run:
   `python3 <skill-dir>/scripts/invoice_total.py <items.csv> --tax-rate <rate> --discount-rate <rate>`
   Rates are fractions: `0.0825` for 8.25%. Omit a rate that does not apply.
3. Copy `subtotal`, `discount`, `tax` and `total` from the JSON exactly as printed.
4. If the script exits non zero, report its stderr and stop. Never fall back to computing it yourself.

## Why

* Models drift on floating point: `3 * 0.10 + 0.20 + 7 * 19.99` is `140.42999999999998` as a float.
* The script rounds half up to the cent once per step, the way accounting expects.
* The CSV never enters the context. Only the JSON result does, so a 10,000 line invoice costs the same as a 3 line one.
