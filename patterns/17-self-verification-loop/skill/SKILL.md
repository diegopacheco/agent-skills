---
name: fix-until-green
description: Fix failing tests in a bounded loop - run the tests through a counter script, read the failure, fix the cause, run again, and stop after the attempt budget or as soon as an attempt fails exactly like the one before, with a written failure report instead of looping forever. Use when the user asks to make the tests pass, fix the build, get CI green, or keep going until it works.
---

# Fix Until Green

Every test run goes through the counter. The counter, not you, decides when to stop.

## Steps

1. Run the tests through the counter in `scripts/` of this skill's base directory:
   `python3 <skill-dir>/scripts/attempt.py --max 3 -- <test command>`
2. Exit code 0: green. Report the attempt number and stop.
3. Exit code 1: read the output tail, find the cause, make the smallest fix, then go back to step 1 with the same test command.
4. Exit code 3: stop. The budget is spent or the last fix changed nothing. Show `fix-until-green-report.md` and what you think is still wrong.

## Rules

* Never run the tests outside the counter during the loop, and never delete `.fix-until-green.json` to get more attempts.
* Never make a test pass by deleting it, skipping it, or weakening its assertion. That is not a fix.
* Use the same test command every time. A different command is refused while the state file exists.
* One cause per attempt. If an attempt fixes nothing, the next one tries a different cause.
* Raise `--max` only when the user asks for it.
