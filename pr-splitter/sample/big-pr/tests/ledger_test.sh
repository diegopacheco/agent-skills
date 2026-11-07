cd "$(dirname "$0")/.."
. tests/assert.sh
. lib/ledger.sh

LEDGER_FILE="$(mktemp)"
rm -f "$LEDGER_FILE"
trap 'rm -f "$LEDGER_FILE"' EXIT

assert_eq "$(ledger_balance)" 0.00 "an empty ledger has a zero balance"
ledger_add "coffee" 3.50
ledger_add "salary" 1000
ledger_add "refund" -0.25
assert_eq "$(ledger_balance)" 1003.25 "balance sums every entry including refunds"
assert_eq "$(ledger_list | sed -n 2p)" "   1000.00  salary" "list shows the amount and the description"
assert_eq "$(ledger_add "bad" 1.234 2>/dev/null || echo rejected)" rejected "an invalid amount is not written"
assert_eq "$(wc -l < "$LEDGER_FILE" | tr -d ' ')" 3 "a rejected entry leaves the ledger unchanged"
assert_eq "$(ledger_add "" 1 2>/dev/null || echo rejected)" rejected "an entry needs a description"
