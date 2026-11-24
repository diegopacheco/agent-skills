# data-dream transcript on the shop-api sample

Every command data-dream ran on a git copy of this sample, with its real output, in order. Seeds were generated into a temp folder and never committed.

### start the app

```
$ scripts/start-all.sh && scripts/status.sh
api: http://localhost:4170
api 4170 UP pid 30392
```

### generate seeds into a temp folder

```
$ node dream.mjs seeds $TMP/dd-seeds
{"unicode":13,"size":8,"numbers":15,"time":16,"empty":10,"money":12,"text":10,"identity":8,"structure":6}
```

### POST /users name: every category

```
$ node dream.mjs fire --url http://localhost:4170/users --template '{"name":@@,"email":"@@id@shop.io"}' --seeds $TMP/dd-seeds --out $TMP/dd-out/names.json
fired 98: crash 27, hang 0, rejected 8, accepted 63
crash	empty-7	500	empty list, first element and average of nothing
crash	empty-8	500	empty object, every required field missing at once
crash	money-1	500	0.1 + 0.2 is not 0.3 in floating point
crash	money-2	500	rounds to 0.01 with HALF_UP, 0.00 with HALF_EVEN
crash	money-3	500	is 2.67499999 in binary, round(2.675, 2) gives 2.67
crash	money-4	500	negative amount, refund or attack
crash	money-6	500	below the smallest unit
crash	money-7	500	past a DECIMAL(15,2) and past double precision
crash	money-12	500	100 / 3 split three ways loses a cent
crash	numbers-3	500	negative where only positive makes sense
crash	numbers-4	500	max 32 bit int, one more and it wraps negative
crash	numbers-5	500	max 32 bit int plus one overflows
crash	numbers-6	500	2^53 + 1 cannot be a JavaScript number
crash	numbers-7	500	past max 64 bit int
crash	numbers-8	500	overflows a double to Infinity
crash	numbers-9	500	binary floating point cannot hold 0.1
crash	numbers-10	500	tiny value printed in scientific notation
crash	numbers-11	500	not valid JSON, many parsers accept it
crash	numbers-12	500	not valid JSON, many parsers accept it
crash	size-7	500	list with 10000 items, pagination and N+1
crash	size-8	500	1000 levels of nesting, recursive parsers overflow the stack
crash	structure-2	500	list where an object is expected
crash	structure-3	500	duplicate keys, which one wins
crash	structure-4	500	prototype pollution shaped object
crash	structure-5	500	unknown extra field, mass assignment or a strict parser crash
crash	structure-6	500	truncated JSON, the parser error must be a 400 and not a 500
crash	time-16	500	epoch in milliseconds where seconds are expected
```

### POST /users email: identity

```
$ node dream.mjs fire --url http://localhost:4170/users --template '{"name":"Ana","email":@@}' --seeds $TMP/dd-seeds/identity.json --out $TMP/dd-out/emails.json
fired 8: crash 0, hang 0, rejected 0, accepted 8
```

### POST /users email: domain seeds for case and spaces

```
$ node dream.mjs fire --url http://localhost:4170/users --template '{"name":"Ana","email":@@}' --seeds data-dream/domain-seeds.json --out $TMP/dd-out/email-case.json
fired 7: crash 0, hang 0, rejected 1, accepted 6
```

### GET /users?q= search: every category

```
$ node dream.mjs fire --method GET --url 'http://localhost:4170/users?q=@@' --seeds $TMP/dd-seeds --out $TMP/dd-out/search.json
fired 98: crash 10, hang 0, rejected 2, accepted 86
crash	empty-8	500	empty object, every required field missing at once
crash	identity-5	500	formatted phone, digits only checks reject it and stored formats drift
crash	size-5	431	1 MB string, request limits and memory
crash	size-8	500	1000 levels of nesting, recursive parsers overflow the stack
crash	structure-3	500	duplicate keys, which one wins
crash	structure-4	500	prototype pollution shaped object
crash	structure-5	500	unknown extra field, mass assignment or a strict parser crash
crash	structure-6	500	truncated JSON, the parser error must be a 400 and not a 500
crash	text-2	500	SQL shaped input, must be stored as text
crash	text-6	500	template shaped input
```

### POST /orders price: numbers

```
$ node dream.mjs fire --url http://localhost:4170/orders --template '{"userId":1,"price":@@,"qty":1,"createdAt":"2026-11-20T10:00:00Z"}' --seeds $TMP/dd-seeds/numbers.json --out $TMP/dd-out/prices.json
fired 15: crash 2, hang 0, rejected 3, accepted 10
crash	numbers-11	500	not valid JSON, many parsers accept it
crash	numbers-12	500	not valid JSON, many parsers accept it
```

### POST /orders price: money

```
$ node dream.mjs fire --url http://localhost:4170/orders --template '{"userId":1,"price":@@,"qty":1,"createdAt":"2026-11-20T10:00:00Z"}' --seeds $TMP/dd-seeds/money.json --out $TMP/dd-out/money.json
fired 12: crash 0, hang 0, rejected 4, accepted 8
```

### POST /orders qty: domain seeds

```
$ node dream.mjs fire --url http://localhost:4170/orders --template '{"userId":1,"price":10,"qty":@@,"createdAt":"2026-11-20T10:00:00Z"}' --seeds data-dream/domain-seeds.json --out $TMP/dd-out/qty.json
fired 7: crash 0, hang 0, rejected 5, accepted 2
```

### GET /revenue before bad dates

```
$ node dream.mjs fire --method GET --url 'http://localhost:4170/revenue?day=@@' --seeds $TMP/dd-seeds/time.json --out $TMP/dd-out/revenue-before.json
fired 16: crash 0, hang 0, rejected 0, accepted 16
```

### POST /orders createdAt: time

```
$ node dream.mjs fire --url http://localhost:4170/orders --template '{"userId":1,"price":10,"qty":1,"createdAt":@@}' --seeds $TMP/dd-seeds/time.json --out $TMP/dd-out/dates.json
fired 16: crash 0, hang 0, rejected 0, accepted 16
```

### POST /orders createdAt: empty

```
$ node dream.mjs fire --url http://localhost:4170/orders --template '{"userId":1,"price":10,"qty":1,"createdAt":@@}' --seeds $TMP/dd-seeds/empty.json --out $TMP/dd-out/dates-empty.json
fired 10: crash 0, hang 0, rejected 0, accepted 10
```

### GET /revenue after bad dates

```
$ node dream.mjs fire --method GET --url 'http://localhost:4170/revenue?day=@@' --seeds $TMP/dd-seeds/time.json --out $TMP/dd-out/revenue-after.json
fired 16: crash 16, hang 0, rejected 0, accepted 0
crash	time-1	500	leap day, adding a year to it has no right answer
crash	time-2	500	day that does not exist
crash	time-3	500	inside the US DST gap, this local time never happened
crash	time-4	500	inside the US DST overlap, this local time happened twice
crash	time-5	500	leap second, second 60 fails most date parsers
crash	time-6	500	epoch zero, often treated as missing
crash	time-7	500	negative epoch, dates before 1970 break unsigned timestamps
crash	time-8	500	one second past the 32 bit epoch limit
crash	time-9	500	far future sentinel
crash	time-10	500	minimum date, some libraries and databases cannot store it
crash	time-11	500	UTC+14, a different calendar day than UTC
crash	time-12	500	UTC-12, the last place where a day ends, a different calendar day than UTC
crash	time-13	500	Nepal 45 minute offset
crash	time-14	500	no offset, local to who?
crash	time-15	500	is it January 2 or February 1
crash	time-16	500	epoch in milliseconds where seconds are expected
```

### stop the app

```
$ scripts/stop-all.sh
api stopped, port 4170 free
```

### the failing tests

```
$ node --test test/data-dream.test.mjs
✖ DD1 a name that is not a string is a 400, not a 500 (12.801459ms)
✖ DD2 a body that is not valid JSON is a 400, not a 500 (1.457583ms)
✖ DD3 search treats the query as text, so ( + { never crash it (1.453916ms)
✖ DD4 a name made only of spaces is rejected, not stored empty (0.176041ms)
✖ DD5 a name has a maximum length (0.152292ms)
✖ DD6 the same mailbox in another case or with spaces is a duplicate (0.068791ms)
✖ DD7 negative and infinite prices are rejected (0.089583ms)
✖ DD8 order totals round half up to the cent and keep every cent (0.074416ms)
✖ DD9 one order without a valid createdAt cannot take down revenue for every day (0.127917ms)
✖ DD10 createdAt is a real instant and revenue days are UTC days (0.080833ms)
ℹ tests 10
ℹ pass 0
ℹ fail 10
```

### commits on the data-dream branch

```
c148c86 shop-api: data-dream domain seeds, 10 failing tests and report
```
