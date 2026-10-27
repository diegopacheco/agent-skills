---
name: proof-of-done
description: Finish a task with proof instead of a claim - every check is run through a recorder that writes the command, exit code and output hash to evidence.md, and every produced file is attached with its sha256. Use when the user asks to fix, implement or change something and wants proof it works, or says done must mean verified.
---

# Proof of Done

"Done" without evidence is not done. Evidence is written by the recorder script, never typed by you.

## Steps

1. Make the change.
2. Run every check through the recorder in `scripts/` of this skill's base directory:
   `<skill-dir>/scripts/record.sh run evidence.md -- <command...>`
   Run the test suite, the build, the linter, a curl against the running app.
3. Attach every file you produced or changed that the user will rely on:
   `<skill-dir>/scripts/record.sh artifact evidence.md <file>`
4. Reply with the claim plus the path to `evidence.md` and a table of each check and its exit code.

## Rules

* A check with a non zero exit code means the task is not done. Say so and show the tail of the output.
* Never write or edit `evidence.md` by hand, and never paste an exit code you did not get from the recorder.
* If a file changes after it was attached, attach it again, the old hash is now stale.
* No check could be run? Then the reply says "not verified" and why.
