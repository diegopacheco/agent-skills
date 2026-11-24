---
name: data-dream
description: Dreams up realistic data that breaks things - unicode, huge sizes, numbers past their limits, odd timezones and DST gaps, empty values, money rounding and currencies, SQL, HTML and path shaped text, identities and malformed structures - fires it at the real code (local HTTP endpoints or functions), finds crashes, hangs, wrong results and bad data silently accepted, and writes one failing test per finding that reproduces it. Never fixes production code, never rebases, never pushes. Use when the user runs /data-dream or asks for nasty data, edge case data, fuzzing with realistic values, or what input breaks their app.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion]
---

# data-dream

Dream the data real users will send one day, send it now, and leave a failing test for every way it breaks the app.

## Rules

* Never edit production code. The output is findings and failing tests, the fix is the user's call.
* Only fire at an app running on this machine. `dream.mjs fire` refuses any host that is not `localhost`, `127.0.0.1` or `[::1]`.
* A finding needs proof: a test in the project's own framework that fails today because of the bug. No test, no finding.
* One finding per root cause. Ten seeds hitting the same missing null check are one finding with ten seeds.
* Git follows git-gh-skill: one branch `data-dream/<date>`, commit messages start with the project name, no Co-Authored-By lines, merge only, never rebase, never push.
* No comments in the tests.

## Catalog

`references/catalog.json` holds 98 values in 9 categories. Each one says why it breaks things.

| Category | What it dreams |
|---|---|
| unicode | accents, emoji sequences, NFC vs NFD, right to left, zero width, NUL, homoglyphs, astral plane, lone surrogate, case mapping |
| size | empty, one char, 256, 64 KB, 1 MB, multi byte, 10000 items, 1000 levels of nesting |
| numbers | 0, -0, -1, int32 and int64 limits, 2^53 + 1, 1e309, NaN, Infinity, numbers as strings, decimal comma, non ASCII digits |
| time | leap day, invalid day, DST gap and overlap, leap second, epoch, 2038, far future, +14 / -12 / +05:45 offsets, no offset, ambiguous formats, millis vs seconds |
| empty | null, empty, whitespace, the words null and undefined, empty list and object, false, missing field |
| money | 0.1 + 0.2, HALF_UP vs HALF_EVEN, 2.675, negative, below the smallest unit, past DECIMAL(15,2), JPY and BHD decimals, splits that lose a cent |
| text | quotes, SQL, HTML, path, format string and template shaped text, newlines, CSV, spreadsheet formulas, padding |
| identity | plus addressing, email case, internationalized email, nil UUID, id shaped input, URLs pointing inside |
| structure | wrong types, duplicate keys, `__proto__`, unknown fields, truncated JSON |

## Flow

```
DREAM=<skill-dir>/scripts/dream.mjs
```

1. **Map the input surfaces.** Read the code: HTTP routes and their DTOs, CLI args, file and CSV parsers, public functions of the domain, DB columns with their types and lengths. Write each one with `file:line` and its fields.
2. **Pick categories per field.** Strings get unicode, size, text, empty. Numbers get numbers, empty. Dates get time. Amounts and currencies get money. Emails, ids and URLs get identity. JSON bodies get structure.
3. **Add domain seeds.** Read the limits in the code and write `data-dream/domain-seeds.json` with the exact boundaries the catalog cannot know: a `VARCHAR(80)` gets 80 and 81 characters, an enum gets its values in the wrong case, a quantity limit gets limit and limit + 1. Same format as the generated seeds: `[{"id": "domain-1", "raw": "<JSON text>", "why": "..."}]`. Use `"raw": null` for a missing field.
4. **Generate the seeds** into a temp folder, never into the repo:
   `node $DREAM seeds <tmp>/seeds --only unicode,size,money`
5. **Dream against the app.** Two ways, use both when they apply:
   * HTTP: start the app with `scripts/start-all.sh`, confirm with `scripts/status.sh` (scripts-skill). `@@` marks where the seed goes, in the body or the URL:
     `node $DREAM fire --url http://localhost:<port>/users --template '{"name":@@,"email":"a@b.c"}' --seeds <tmp>/seeds --out <tmp>/users.json`
     `node $DREAM fire --method GET --url 'http://localhost:<port>/orders?from=@@' --seeds <tmp>/seeds/time.json --out <tmp>/orders.json`
   * Functions: write a throwaway harness in a temp folder, in the project's language, that loops over the seed files and calls the function. It is never committed.
6. **Judge every result.** `fire` marks `crash` (5xx or connection lost) and `hang` (timeout). You judge the rest by reading the response and the data:
   * **wrong**: a result that breaks a rule of the domain. Money that does not add up, a date on the wrong day, a name that comes back different, a count off by one, a sort that is wrong.
   * **silent accept**: `accepted` data that should have been rejected and is now stored: negative amounts, NaN, invalid dates, 1 MB names, `__proto__` keys.
   * **round trip**: save a seed, read it back, compare. Unicode and money break here most.
   * `rejected` with a clear 4xx is the app working, not a finding.
7. **Prove each finding.** Write one test per root cause, next to the existing tests, named after the finding (`DataDreamUserNameTest`, `data-dream-money.test.ts`). Run it, see it fail for the reason in the finding, and paste the failure.
8. **Stop the app** with `scripts/stop-all.sh`.

## Output

On the branch `data-dream/<date>`, committed:

* `data-dream/report.md` with the counts by verdict and one section per finding: id `DD1`, `DD2`..., the surface `file:line`, the seeds that hit it, what happened, what should happen, why it matters, the test file and its real failure output.
* `data-dream/domain-seeds.json`.
* The failing tests. The branch is red on purpose: each red test is a bug waiting for a fix. The report lists the command that runs only them.

Reply with the counts, the top findings by impact, the branch name and `git merge --no-ff <branch>` for the user to run. Never merge or push yourself.

## Privacy

The report, seeds and commit messages follow readme-skill: no absolute paths, home folders, user names, hosts besides localhost, or secrets. Response bodies pasted in the report are cut to what proves the finding.
