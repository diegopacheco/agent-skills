cd "$(dirname "$0")/.."
. tests/assert.sh
. lib/money.sh

assert_eq "$(to_cents 12.34)" 1234 "parses dollars and cents into integer cents"
assert_eq "$(to_cents 7.5)" 750 "one decimal digit means tens of cents, not cents"
assert_eq "$(to_cents 0.09)" 9 "leading zero cents are not read as octal"
assert_eq "$(to_cents -3.10)" -310 "refunds keep their sign"
assert_eq "$(from_cents $(( $(to_cents 0.1) + $(to_cents 0.2) )))" 0.30 "0.10 + 0.20 is exactly 0.30, no float drift"
assert_eq "$(from_cents -5)" -0.05 "small negatives keep the sign and the padding"
assert_eq "$(to_cents 1.999 2>/dev/null || echo rejected)" rejected "sub-cent amounts are rejected, never rounded"
assert_eq "$(to_cents abc 2>/dev/null || echo rejected)" rejected "non numeric amounts are rejected"
