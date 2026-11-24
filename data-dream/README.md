<p align="center"><img src="logo.svg" width="120" alt="data-dream logo"></p>

# data-dream

A skill for Claude Code and Codex that dreams up the data your users will send one day: unicode, huge sizes, numbers past their limits, DST gaps, empty values, money rounding, SQL and HTML shaped text, and broken JSON. It sends that data at the real code, finds crashes, hangs, wrong results and bad data silently accepted, and leaves one failing test per finding. It never fixes production code.

## How it Works

1. The agent maps the input surfaces: HTTP routes and DTOs, CLI args, parsers, domain functions, DB column limits, each with `file:line`.
2. It picks catalog categories per field and writes `domain-seeds.json` with the exact limits it read in the code (a `VARCHAR(80)` gets 80 and 81 characters).
3. `dream.mjs seeds` expands the catalog into seed files in a temp folder.
4. `dream.mjs fire` sends each seed to the app on localhost, in the body or the URL where `@@` is, and marks crashes (5xx, lost connection) and hangs (timeouts). Functions get a throwaway harness in the project's language.
5. The agent judges the rest: wrong results, silent accepts, and round trips that change the data.
6. Each root cause gets one test that fails today. The branch `data-dream/<date>` holds the report, the domain seeds and the failing tests.

## Architecture

<p align="center"><img src="diagrams/architecture.svg" alt="architecture"></p>

## Features

* **98 values, 9 categories**: unicode, size, numbers, time, empty, money, text, identity, structure. Each value says why it breaks things, so the report explains itself.
* **Domain seeds**: the catalog cannot know your limits, the code does. Boundaries come from the code.
* **Localhost only**: `fire` refuses any host that is not `localhost`, `127.0.0.1` or `[::1]`. It cannot be pointed at production.
* **Missing fields**: a `null` raw removes the field from the body or the URL, because "not sent" and "sent as null" break different code.
* **Proof or nothing**: no failing test, no finding. One finding per root cause.
* **Never fixes**: the branch is red on purpose, each red test is a bug waiting for a fix.
* **scripts-skill aware**: starts and stops the app with `scripts/start-all.sh` and `scripts/stop-all.sh`, checks it with `scripts/status.sh`.
* **Git like git-gh-skill**: its own branch, commits prefixed with the project name, merge only, never rebase, never push.

## Stack

* **Node.js, zero dependencies**: `scripts/dream.mjs` uses only `node:fs` and the built in `fetch`.
* **JSON catalog**: `references/catalog.json`, easy to extend with your own categories.

## Commands

| Command | What it does |
|---|---|
| `dream.mjs categories` | Lists the categories and how many values each has |
| `dream.mjs seeds <dir> [--only unicode,money]` | Writes one seed file per category |
| `dream.mjs fire --url http://localhost:PORT/path --seeds <dir\|file> [--method POST] [--template '{"name":@@,"email":"@@id@shop.io"}'] [--out results.json] [--timeout 5000]` | Fires every seed and prints crashes and hangs. `@@` is the seed, `@@id` the seed id for unique fields |

A seed is `{"id": "money-2", "raw": "0.005", "why": "rounds to 0.01 with HALF_UP, 0.00 with HALF_EVEN"}`. `raw` is JSON text, so values JSON cannot hold (`NaN`, `Infinity`, truncated `{`) can still be sent.

## Design decisions

* Seeds are generated into a temp folder and never committed. A 1 MB string does not belong in git. Only `domain-seeds.json`, the report and the tests are.
* Function level harnesses are written per language and thrown away. Only the tests stay.
* The script judges only what it can be sure of: crash and hang. "Wrong" needs the domain, so the agent judges it from the code.

## Sample

[`sample/`](sample) is a small shop API (users, search, orders, daily revenue) with the scripts-skill set (`setup.sh`, `start-all.sh`, `stop-all.sh`, `status.sh`, `test-all.sh`, `ports.env`) and 4 happy path tests that pass. data-dream was run on a git copy of it, for real. Everything it produced is in [`sample/results/`](sample/results): the [report](sample/results/report.md), the [domain seeds](sample/results/domain-seeds.json), the [failing tests](sample/results/data-dream.test.mjs), the [raw fire results](sample/results/fire) and the [full transcript](sample/results/transcript.md) of every command and its output.

| Surface | Seeds | Crash | Rejected | Accepted |
|---|---|---|---|---|
| `POST /users` name | 98 | 27 | 8 | 63 |
| `POST /users` email | 15 | 0 | 1 | 14 |
| `GET /users?q=` | 98 | 10 | 2 | 86 |
| `POST /orders` price | 27 | 2 | 7 | 18 |
| `POST /orders` qty | 7 | 0 | 5 | 2 |
| `POST /orders` createdAt | 26 | 0 | 0 | 26 |
| `GET /revenue` before bad dates | 16 | 0 | 0 | 16 |
| `GET /revenue` after bad dates | 16 | 16 | 0 | 0 |

10 findings, each with a test that fails today:

| Id | Verdict | Finding | Seed that shows it |
|---|---|---|---|
| DD9 | crash | One order without a valid `createdAt` makes `/revenue` return 500 for every day | `empty-10` missing field |
| DD8 | wrong | `toFixed` stores 2.675 as 2.67 | `money-3` 2.675 |
| DD7 | silent accept | Negative and infinite prices are stored | `money-4` -10.00, `numbers-8` 1e309 |
| DD6 | silent accept | `ANA@shop.io` and `" ana@shop.io"` register next to `ana@shop.io`, and `1.5` is accepted as an email | domain seeds |
| DD3 | crash | Search builds a regex from the query, so `(`, `+` and `{` crash it | `text-2` Robert'); DROP... |
| DD10 | wrong | `2023-02-29` is stored, and a +14:00 order counts on the wrong UTC day | `time-2`, `time-11` |
| DD1 | crash | A number, list or object name crashes `name.trim()` | `numbers-3` -1 |
| DD2 | crash | Invalid JSON bodies return 500 instead of 400 | `structure-6` { |
| DD5 | silent accept | A 1 MB name is stored | `size-5` |
| DD4 | silent accept | A name made only of spaces is stored as `""` | `empty-3` |

```
$ node --test test/data-dream.test.mjs
✖ DD1 a name that is not a string is a 400, not a 500
✖ DD2 a body that is not valid JSON is a 400, not a 500
✖ DD3 search treats the query as text, so ( + { never crash it
✖ DD4 a name made only of spaces is rejected, not stored empty
✖ DD5 a name has a maximum length
✖ DD6 the same mailbox in another case or with spaces is a duplicate
✖ DD7 negative and infinite prices are rejected
✖ DD8 order totals round half up to the cent and keep every cent
✖ DD9 one order without a valid createdAt cannot take down revenue for every day
✖ DD10 createdAt is a real instant and revenue days are UTC days
ℹ tests 10
ℹ pass 0
ℹ fail 10
```

The sample run also found two bugs in data-dream itself, now fixed and covered by tests: a lone surrogate seed crashed URL encoding, and removing the first field of a template left a dangling comma.

`test.sh` checks that these results are real: the sample's own tests pass, and all 10 finding tests still fail against it.

## How to run

```
./install.sh            asks for Claude, Codex or both
./install.sh claude     or codex, or both
./uninstall.sh both
./test.sh               runs the tests
```

Then in a repository: `/data-dream` in Claude Code or `$data-dream` in Codex.

`test.sh` checks the installers, then runs `tests/dream.test.mjs` against a small local app with planted bugs: a number and a list reaching `name.trim()` are found as crashes, empty and missing names are rejected, a request that never answers is found as a hang, and remote hosts are refused.
