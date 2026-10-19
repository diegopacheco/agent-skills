---
name: bug-hunter
description: 🐞 Bug Hunter night agent. Hunts real bugs in a repository - wrong logic, off by one, money rounding, time zones, null handling, races, unvalidated input, error paths, resource leaks - writes bug-report.md, and fixes each bug with TDD (a failing test first, then the fix, then the green suite) on its own branch with a report. Use when the user runs /bug-hunter, /night-agents bugs, or asks to find and fix bugs.
---

# 🐞 Bug Hunter

Find bugs that would hurt a user, prove each one with a failing test, then fix it.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `bug-hunter`.

## 1. Start

Start the run with `night-run.sh start bug-hunter` unless the dispatcher handed you a run,
install dependencies and record the baseline (contract steps 1 and 2).

## 2. Hunt

Read the code that moves money, data and permissions first, then everything else. Look for:

| Bug class | Signal |
|---|---|
| Logic | wrong operator, inverted condition, wrong default, missing case in a switch |
| Boundaries | off by one in loops, slices, pagination, ranges, inclusive vs exclusive |
| Money and numbers | floats for money, rounding per item vs per total, integer overflow, division by zero |
| Time | local vs UTC, DST, month ends, leap years, comparing dates as strings |
| Null and empty | missing null checks, empty collections, empty strings treated as valid |
| Input | missing validation, case sensitive uniqueness, unescaped SQL or HTML, path traversal |
| State | mutation of shared objects, stale caches, missing transaction, partial writes |
| Concurrency | check then act, unawaited promises, shared mutable state across requests |
| Errors | swallowed exceptions, wrong status codes, error paths that leave data inconsistent |
| Resources | unclosed files, connections, timers and listeners |

A bug is real only when you can write a test that fails because of it. Hunches without a failing
test go to the report as `reported` with the reason you could not reproduce them.

## 3. bug-report.md

Write `bug-report.md` at the repo root of the branch, one section per bug:

```markdown
## B1: Discount applied twice when the cart has two coupons

- Severity: high
- File: src/cart.js:57
- What happens: ...
- Expected: ...
- Root cause: ...
- Test: test/cart.test.js "applies one coupon per order"
- Fix: ...
- Status: fixed
```

## 4. Fix with TDD

For each bug, in order of severity:

1. Write the test that reproduces the bug. Run it and see it fail for the right reason. Save that
   output to `$RUN_DIR/tdd/<bug-id>-red.log`.
2. Do not commit the failing test alone. Test and fix land in the same commit so every commit on
   the branch is green.
3. Write the smallest fix that makes the test pass.
4. Run the test again, save the output to `$RUN_DIR/tdd/<bug-id>-green.log`, then run the whole suite.
5. Commit test and fix together: `<project>: bug-hunter: fix discount applied twice`.

Never change an existing test's expectation unless the expectation itself is the bug, and then
say so in the report.

## 5. Verify, document, finish

Contract steps 4 to 7. `report.md` in `$RUN_DIR` carries the same sections as `bug-report.md`
plus the red and green log paths.

## Metrics

`bugsFound`, `bugsFixed`, `bugsReported`, `criticalBugs`, `highBugs`, `testsAdded`. Finding kinds
are the bug classes above in lowercase: `logic`, `boundaries`, `money`, `time`, `null`, `input`,
`state`, `concurrency`, `errors`, `resources`.
