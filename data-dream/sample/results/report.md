# data-dream report: shop-api

Branch `data-dream/2026-11-24`. 98 catalog values in 9 categories plus 7 domain seeds, fired at 4 routes of the app running on localhost with `scripts/start-all.sh`.

## Counts

| Surface | Seeds | Crash | Hang | Rejected | Accepted |
|---|---|---|---|---|---|
| `POST /users` name | 98 | 27 | 0 | 8 | 63 |
| `POST /users` email | 15 | 0 | 0 | 1 | 14 |
| `GET /users?q=` | 98 | 10 | 0 | 2 | 86 |
| `POST /orders` price | 27 | 2 | 0 | 7 | 18 |
| `POST /orders` qty | 7 | 0 | 0 | 5 | 2 |
| `POST /orders` createdAt | 26 | 0 | 0 | 0 | 26 |
| `GET /revenue` before bad dates | 16 | 0 | 0 | 0 | 16 |
| `GET /revenue` after bad dates | 16 | 16 | 0 | 0 | 0 |

## Findings

| Id | Verdict | Finding | Impact |
|---|---|---|---|
| DD9 | crash | One order without a valid `createdAt` takes down `/revenue` for every day | high |
| DD8 | wrong | Totals rounded with `toFixed` lose a cent | high |
| DD7 | silent accept | Negative and infinite prices are stored | high |
| DD6 | silent accept | Same mailbox registers twice with another case or a space | high |
| DD3 | crash | Search compiles the query as a regex | high |
| DD10 | wrong | Invalid dates stored, offset timestamps counted on the wrong UTC day | medium |
| DD1 | crash | A name that is not a string crashes `name.trim()` | medium |
| DD2 | crash | Invalid JSON bodies are a 500 instead of a 400 | medium |
| DD5 | silent accept | A 1 MB name is stored, there is no maximum length | medium |
| DD4 | silent accept | A name made of spaces is stored as an empty name | low |

10 findings, 10 failing tests. The branch is red on purpose. Run only them with `node --test test/data-dream.test.mjs`. The 4 tests the app already had still pass.

## DD9 one bad order takes down revenue for every day

* **Surface**: `src/store.mjs:37` reads `o.createdAt.slice(0, 10)`; `src/store.mjs:27` never checks `createdAt`
* **Seeds that hit it**: `empty-1` null, `empty-7` [], `empty-8` {}, `empty-10` missing field, `time-16` epoch millis
* **What happened**: All 26 orders were accepted. After that, every `GET /revenue` call returned 500 (16 of 16, against 0 of 16 before).
* **What should happen**: An order without a valid `createdAt` is a 400, so revenue keeps working.
* **Why it matters**: One bad client request breaks a finance report for everyone, and it stays broken until the order is removed by hand.
* **Test**: `test/data-dream.test.mjs`, `DD9`

```
✖ DD9 one order without a valid createdAt cannot take down revenue for every day
  AssertionError [ERR_ASSERTION]: Got unwanted exception.
    actual: TypeError: Cannot read properties of undefined (reading 'slice')
```

## DD8 totals lose a cent

* **Surface**: `src/store.mjs:30` `Number((price * qty).toFixed(2))`
* **Seeds that hit it**: `money-3` 2.675, `money-7` 99999999999999.99
* **What happened**: 2.675 is stored as 2.67 and 99999999999999.99 as 99999999999999.98.
* **What should happen**: Money in integer cents or a decimal type, rounded half up: 2.68.
* **Why it matters**: Every order with a price ending in 5 at the third decimal is off by one cent, and the error adds up in revenue.
* **Test**: `test/data-dream.test.mjs`, `DD8`

```
✖ DD8 order totals round half up to the cent and keep every cent
    actual: 2.67,
    expected: 2.68,
```

## DD7 negative and infinite prices are stored

* **Surface**: `src/store.mjs:27` only checks `typeof price !== "number"`
* **Seeds that hit it**: `numbers-3` -1, `money-4` -10.00, `numbers-8` 1e309
* **What happened**: 201 for all three. 1e309 is parsed as Infinity and stored, and the response shows `"price":null`.
* **What should happen**: A price is a finite number greater than or equal to zero.
* **Why it matters**: A negative order lowers revenue, and an infinite one poisons every sum it touches.
* **Test**: `test/data-dream.test.mjs`, `DD7`

```
✖ DD7 negative and infinite prices are rejected
  AssertionError [ERR_ASSERTION]: Missing expected exception: -1
```

## DD6 same mailbox registers twice

* **Surface**: `src/store.mjs:10` `u.email === email`
* **Seeds that hit it**: `domain-2` ANA@shop.io, `domain-3` " ana@shop.io" after `domain-1` ana@shop.io
* **What happened**: All three registered, ids 72, 73 and 74. The email is not even checked to be text: the domain seed `1.5` sent as an email was registered too.
* **What should happen**: Emails must be text with an @, trimmed and compared in lower case, so the second and third are duplicates.
* **Why it matters**: One person ends up with several accounts, and password reset goes to whichever one comes first.
* **Test**: `test/data-dream.test.mjs`, `DD6`

```
✖ DD6 the same mailbox in another case or with spaces is a duplicate
  AssertionError [ERR_ASSERTION]: Missing expected exception.
    expected: /already registered/,
```

## DD3 search compiles the query as a regex

* **Surface**: `src/store.mjs:19` `new RegExp(q, "iu")`
* **Seeds that hit it**: `text-2` Robert'); DROP..., `text-6` ${7*7}, `identity-5` +1 (555) 010-0000, `structure-3` to `structure-6`, `empty-8`, `size-8`
* **What happened**: 10 of 98 queries returned 500.
* **What should happen**: The query is escaped or matched as plain text with `includes`.
* **Why it matters**: Any name with a parenthesis or a plus breaks search, and a regex from user input is also a ReDoS door.
* **Test**: `test/data-dream.test.mjs`, `DD3`

```
✖ DD3 search treats the query as text, so ( + { never crash it
  AssertionError [ERR_ASSERTION]: Robert');
    actual: 500,
    expected: 200,
```

## DD10 createdAt is stored as text

* **Surface**: `src/store.mjs:27` does not parse `createdAt`, `src/store.mjs:37` compares its first 10 characters
* **Seeds that hit it**: `time-2` 2023-02-29, `time-11` 2024-06-01T12:00:00+14:00, `time-14` no offset
* **What happened**: All 16 time seeds were accepted as they came. 2023-02-29 is stored, and the +14:00 order counts on 2024-06-01 although it happened on 2024-05-31 UTC.
* **What should happen**: Parse `createdAt` into an instant, reject invalid dates, and group revenue by UTC day.
* **Why it matters**: Revenue moves between days depending on the client clock, so daily totals do not reconcile.
* **Test**: `test/data-dream.test.mjs`, `DD10`

```
✖ DD10 createdAt is a real instant and revenue days are UTC days
  AssertionError [ERR_ASSERTION]: Missing expected exception.
```

## DD1 a name that is not a string crashes

* **Surface**: `src/store.mjs:9` `name.trim()` after a truthy check at `src/store.mjs:6`
* **Seeds that hit it**: `numbers-3` -1, `money-1` 0.1, `structure-2` [{}], `structure-3` object, `empty-7` [], 24 crashes (the other 3 name crashes are DD2)
* **What happened**: 500 for every number, list or object name except 0, which is falsy and rejected.
* **What should happen**: 400 with a message saying the name must be text.
* **Why it matters**: A client bug becomes a server error, which pages someone and hides real 500s.
* **Test**: `test/data-dream.test.mjs`, `DD1`

```
✖ DD1 a name that is not a string is a 400, not a 500
  AssertionError [ERR_ASSERTION]: name -1
    actual: 500,
    expected: 400,
```

## DD2 invalid JSON is a 500

* **Surface**: `src/app.mjs:8` `JSON.parse` inside the catch that maps everything not a `ValidationError` to 500
* **Seeds that hit it**: `structure-6` {, `numbers-11` NaN, `numbers-12` Infinity
* **What happened**: 500 on `/users` and `/orders`.
* **What should happen**: 400 for a body that is not valid JSON.
* **Why it matters**: Same as DD1: the client is wrong, the server reports an outage.
* **Test**: `test/data-dream.test.mjs`, `DD2`

```
✖ DD2 a body that is not valid JSON is a 400, not a 500
  AssertionError [ERR_ASSERTION]: {
    actual: 500,
    expected: 400,
```

## DD5 no maximum name length

* **Surface**: `src/store.mjs:6` to `src/store.mjs:9`, no length check
* **Seeds that hit it**: `size-4` 64 KB, `size-5` 1 MB
* **What happened**: Both stored with 201. Only the search URL was refused, with 431, by Node itself.
* **What should happen**: A maximum, for instance 100 characters, and a 400 above it.
* **Why it matters**: Memory grows with every request and every list response carries the megabyte.
* **Test**: `test/data-dream.test.mjs`, `DD5`

```
✖ DD5 a name has a maximum length
  AssertionError [ERR_ASSERTION]: Missing expected exception.
```

## DD4 blank names are stored empty

* **Surface**: `src/store.mjs:6` checks `!name` before `src/store.mjs:9` trims it
* **Seeds that hit it**: `empty-3` " ", `empty-4` tab and newline
* **What happened**: Stored with `"name":""`.
* **What should happen**: Validate after trimming: a blank name is required and missing.
* **Why it matters**: Users with no name show up as empty rows in every screen and export.
* **Test**: `test/data-dream.test.mjs`, `DD4`

```
✖ DD4 a name made only of spaces is rejected, not stored empty
  AssertionError [ERR_ASSERTION]: Missing expected exception.
    expected: /required/,
```

## Not findings

* `<script>alert(1)</script>` and SQL shaped names are stored as text. That is right as long as every screen escapes them.
* `qty` 0 and 1.5 are rejected with 400, and `qty` 1 is accepted. The check at `src/store.mjs:27` works.
* URLs over 16 KB are refused with 431 by Node before the app sees them.
