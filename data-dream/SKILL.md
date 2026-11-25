---
name: data-dream
description: Dreams up realistic data that breaks things and keeps dreaming. Cycle 1 fires a catalog of 98 nasty values (unicode, sizes, number limits, DST gaps, empty values, money rounding, SQL, HTML and path shaped text, identities, broken JSON) at the app on localhost. Every value that crashes, hangs, poisons another endpoint or comes back changed is a nightmare, and each next cycle dreams new values from the nightmares of the cycle before by mutating them and transplanting them to other inputs, until a cycle finds no new kind of nightmare. Nightmares are remembered across nights and replayed first, so the journal shows what healed and which dreamed values outlived a fix. Writes a dream journal with a family tree of every value and one failing test per finding. Never fixes production code, never rebases, never pushes. Use when the user runs /data-dream or asks for nasty data, edge case data, dreaming, fuzzing with realistic values, or what input breaks their app.
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

## What problem it solves

Apps are tested with the data their developers imagine. data-dream finds what production will send instead: untested values that crash or corrupt, the same bug sitting in inputs nobody aimed at, writes that are accepted and then break a read for everyone, and fixes that only cover the value from the bug report. The catalog covers the first. Dreaming covers the rest: it varies every value that hurt and moves it to every other input, and its memory replays each nightmare after a fix to prove whether the fix held. Tell the user both, with numbers from the journal: how many breaks the catalog found and how many the dreams added.

## The dreaming technique

Dreaming is how the brain replays the day and recombines it into things that never happened. data-dream does the same with data:

1. **Day residue**: cycle 1 fires the catalog and the domain seeds. Every value that hurts the app becomes a nightmare.
2. **Recombination**: each next cycle only dreams from the nightmares of the cycle before. A nightmare is mutated (negated, made tiny or huge, turned into text, put in a list, doubled, upper cased, padded, cut in half, flipped, emptied, nested) and transplanted to every other input. A value that broke the name is tried on the email, the price and the date.
3. **Waking up**: a kind is the input, the verdict, the status and the shape of the value. When a whole cycle finds no new kind, the dream ends. A cycle limit stops it too.
4. **Memory**: nightmares are kept in a memory file across nights. The next night replays them first: the ones that stopped hurting are healed, the rest recur and are dreamed on. A fix that healed some values of a kind while a dreamed value still breaks it shows up as a dream that outlived a fix.
5. **Journal**: every night is written to `journal.md` with a table per cycle, the healed and the still broken kinds, and a family tree from each dreamed value back to the catalog value it came from.

## Verdicts

| Verdict | Nightmare | Meaning |
|---|---|---|
| crash | yes | 5xx or the connection was lost |
| hang | yes | no answer before the timeout |
| poison | yes | the request was accepted, and then the probe endpoint of the input started to fail |
| changed | yes | accepted, but the echoed field is not what was sent (`1e309` stored as `null`) |
| rejected | no | a 4xx, the app defending itself |
| accepted | no | stored as sent, judged by the agent for silent accepts |

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

1. **Map the input surfaces.** Read the code: HTTP routes and their DTOs, CLI args, parsers, domain functions, DB columns with their types and lengths. Write each one with `file:line`.
2. **Add domain seeds.** Read the limits in the code and write `data-dream/domain-seeds.json` with the exact boundaries the catalog cannot know: a `VARCHAR(80)` gets 80 and 81 characters, an enum gets its values in the wrong case. Format: `[{"id": "domain-1", "raw": "<JSON text>", "why": "..."}]`, `"raw": null` for a missing field.
3. **Write the plan** `data-dream/plan.json`, one target per input:
   ```json
   {
     "reset": "scripts/stop-all.sh > /dev/null && scripts/start-all.sh > /dev/null",
     "setup": [{ "method": "POST", "url": "http://localhost:4170/users", "body": "{\"name\":\"Owner\",\"email\":\"owner@shop.io\"}" }],
     "targets": [
       { "name": "user-name", "url": "http://localhost:4170/users", "template": "{\"name\":@@,\"email\":\"@@id@shop.io\"}", "categories": "all" },
       { "name": "user-search", "method": "GET", "url": "http://localhost:4170/users?q=@@", "categories": "all" },
       { "name": "order-price", "url": "http://localhost:4170/orders", "template": "{\"userId\":1,\"price\":@@,\"qty\":1,\"createdAt\":\"2026-11-20T10:00:00Z\"}", "categories": "numbers,money", "echo": "price", "probe": { "url": "http://localhost:4170/revenue?day=2026-11-20" } }
     ]
   }
   ```
   * `@@` is where the value goes, in the body or the URL. `@@id` becomes the value id, for fields that must be unique like an email.
   * `categories` picks catalog categories, `extra` adds seed files like the domain seeds.
   * `echo` names the response field that must come back as sent, or the value is `changed`.
   * `probe` is a read that must keep working after the write, or the value is `poison`. When the probe is down, `reset` restarts the app (scripts-skill) and `setup` runs again. A probe that a reset cannot bring back stops the dream with an error.
4. **Dream.** Start the app with `scripts/start-all.sh`, then:
   `node $DREAM dream --plan data-dream/plan.json --journal data-dream/journal.md [--memory <file>] [--cycles 5] [--max 60]`
   The memory defaults to `~/.data-dream/<repo>/memory.json`, outside the repo, so the next night finds it on any branch. Stop the app with `scripts/stop-all.sh`.
5. **Read the journal.** Crashes, hangs, poisons and changed values are found by the script. Judge the rest yourself from the accepted values and the code: wrong results (money that does not add up, a date on the wrong day) and silent accepts (negative prices, duplicates, 1 MB names).
6. **Prove each finding.** One test per root cause, next to the existing tests, using the values the journal recorded, including the dreamed ones. A test that only uses the catalog value lets a partial fix pass; add the dreamed values that outlived a fix. Run it, see it fail for the reason in the finding.
7. **Next night.** Run step 4 again after the user fixed something. The replay shows what healed and what recurs.

`dream.mjs seeds` and `dream.mjs fire` still exist to fire one seed file at one input by hand.

## Output

On the branch `data-dream/<date>`, committed:

* `data-dream/journal.md` and `data-dream/dream-chart.svg`, the dream of every night.
* `data-dream/plan.json`.
* `data-dream/report.md` with the counts by verdict and one section per finding: id `DD1`, `DD2`..., the surface `file:line`, the seeds that hit it, what happened, what should happen, why it matters, the test file and its real failure output.
* `data-dream/domain-seeds.json`.
* The failing tests. The branch is red on purpose: each red test is a bug waiting for a fix. The report lists the command that runs only them.

Reply with the counts, the top findings by impact, the branch name and `git merge --no-ff <branch>` for the user to run. Never merge or push yourself.

## Privacy

The report, seeds and commit messages follow readme-skill: no absolute paths, home folders, user names, hosts besides localhost, or secrets. Response bodies pasted in the report are cut to what proves the finding.
