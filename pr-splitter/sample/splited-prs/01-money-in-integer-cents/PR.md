## Task

Adds lib/money.sh, which turns amounts like 12.34 into integer cents and back.
Rejects sub-cent and non numeric amounts instead of rounding them.
Adds the test runner, the assert helper and the money tests.
Starts the README with the Money section only.

PR 1 of 3 split from `pr-splitter-sample`. Merge into `main`.

## Files

- `pr-splitter/sample/big-pr/README.md` A
- `pr-splitter/sample/big-pr/lib/money.sh` A
- `pr-splitter/sample/big-pr/test.sh` A
- `pr-splitter/sample/big-pr/tests/assert.sh` A
- `pr-splitter/sample/big-pr/tests/money_test.sh` A

## Prompt

> Split the big ledger PR into small stacked PRs: money first, then the ledger, then the CLI and the docs.

## Tests

```
$ bash pr-splitter/sample/big-pr/test.sh
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
