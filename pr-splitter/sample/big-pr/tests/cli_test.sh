cd "$(dirname "$0")/.."
. tests/assert.sh

export LEDGER_FILE="$(mktemp)"
rm -f "$LEDGER_FILE"
trap 'rm -f "$LEDGER_FILE"' EXIT

bin/ledger add "rent" -800
bin/ledger add "pay" 1200.40
assert_eq "$(bin/ledger balance)" 400.40 "the cli adds entries and prints the balance"
assert_eq "$(bin/ledger list | wc -l | tr -d ' ')" 2 "the cli lists one line per entry"
bin/ledger add "rent" 2>/dev/null; assert_eq "$?" 2 "a missing amount exits with the usage code"
bin/ledger 2>/dev/null; assert_eq "$?" 2 "no command exits with the usage code"
