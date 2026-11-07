# ledger

A tiny bash ledger that keeps money as integer cents.

## Money

`lib/money.sh` turns `12.34` into `1234` cents and back. Sub-cent amounts are rejected, never rounded.

## Ledger

`lib/ledger.sh` appends entries to `$LEDGER_FILE` and sums them into a balance.

## CLI

```bash
bin/ledger add "coffee" 3.50
bin/ledger balance
bin/ledger list
```

## Tests

```bash
./test.sh
```
