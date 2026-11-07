# ledger

A tiny bash ledger that keeps money as integer cents.

## Money

`lib/money.sh` turns `12.34` into `1234` cents and back. Sub-cent amounts are rejected, never rounded.
