## Task

Adds bin/ledger with add, balance and list on top of the ledger library.
Exits with code 2 and prints the usage on a wrong command.
Adds the cli tests and finishes the README with the Ledger, CLI and Tests sections.

PR 3 of 3 split from `pr-splitter-sample`. Merge into `split/pr-splitter-sample/02-ledger-on-top-of-money`.

## Files

- `pr-splitter/sample/big-pr/README.md` M
- `pr-splitter/sample/big-pr/bin/ledger` A
- `pr-splitter/sample/big-pr/tests/cli_test.sh` A

## Prompt

> Split the big ledger PR into small stacked PRs: money first, then the ledger, then the CLI and the docs.

## Tests

```
$ bash pr-splitter/sample/big-pr/test.sh
PASS the cli adds entries and prints the balance
PASS the cli lists one line per entry
PASS a missing amount exits with the usage code
PASS no command exits with the usage code
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
