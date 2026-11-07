## Task

Adds lib/ledger.sh, which appends entries to LEDGER_FILE and sums the balance.
Uses the money functions from the previous PR so no float math touches the totals.
Adds the ledger tests, including that a rejected entry leaves the file unchanged.

PR 2 of 3 split from `pr-splitter-sample`. Merge into `split/pr-splitter-sample/01-money-in-integer-cents`.

## Files

- `pr-splitter/sample/big-pr/lib/ledger.sh` A
- `pr-splitter/sample/big-pr/tests/ledger_test.sh` A

## Prompt

> Split the big ledger PR into small stacked PRs: money first, then the ledger, then the CLI and the docs.

## Tests

```
$ bash pr-splitter/sample/big-pr/test.sh
PASS an empty ledger has a zero balance
PASS balance sums every entry including refunds
PASS list shows the amount and the description
PASS an invalid amount is not written
PASS a rejected entry leaves the ledger unchanged
PASS an entry needs a description
PASS parses dollars and cents into integer cents
PASS one decimal digit means tens of cents, not cents
PASS leading zero cents are not read as octal
PASS refunds keep their sign
PASS 0.10 + 0.20 is exactly 0.30, no float drift
PASS small negatives keep the sign and the padding
PASS sub-cent amounts are rejected, never rounded
PASS non numeric amounts are rejected
all green
```
