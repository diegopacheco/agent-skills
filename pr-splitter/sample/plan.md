base: main
source: pr-splitter-sample
test: bash pr-splitter/sample/big-pr/test.sh
prompt: prompt.md

## money in integer cents
> Adds lib/money.sh, which turns amounts like 12.34 into integer cents and back.
> Rejects sub-cent and non numeric amounts instead of rounding them.
> Adds the test runner, the assert helper and the money tests.
> Starts the README with the Money section only.
pr-splitter/sample/big-pr/lib/money.sh
pr-splitter/sample/big-pr/test.sh
pr-splitter/sample/big-pr/tests/assert.sh
pr-splitter/sample/big-pr/tests/money_test.sh
patch patches/readme-money.patch

## ledger on top of money
> Adds lib/ledger.sh, which appends entries to LEDGER_FILE and sums the balance.
> Uses the money functions from the previous PR so no float math touches the totals.
> Adds the ledger tests, including that a rejected entry leaves the file unchanged.
pr-splitter/sample/big-pr/lib/ledger.sh
pr-splitter/sample/big-pr/tests/ledger_test.sh

## ledger cli and docs
> Adds bin/ledger with add, balance and list on top of the ledger library.
> Exits with code 2 and prints the usage on a wrong command.
> Adds the cli tests and finishes the README with the Ledger, CLI and Tests sections.
pr-splitter/sample/big-pr/bin/ledger
pr-splitter/sample/big-pr/tests/cli_test.sh
pr-splitter/sample/big-pr/README.md
