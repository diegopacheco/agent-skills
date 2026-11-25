---
name: test-climb
description: Hill climbs test coverage one test per step. Measures a baseline, adds one test that matters, proves it can fail by breaking the production code on purpose (a mutant it must kill), keeps it with a commit only when the suite is green and coverage went up, reverts it otherwise, and stops after N steps without gain. Never edits production code, never rebases, never pushes. Use when the user runs /test-climb or asks to hill climb, ratchet or raise coverage one test at a time with tests that can actually fail.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion]
---

# test-climb

Raise coverage like a hill climber: one small step, measure, keep it only if it is higher, undo it otherwise. A step is one new test. A test only counts when it can fail.

## The hill climbing technique

Hill climbing is the simplest search there is: stand somewhere, take one small step, keep it if you went up, undo it if you did not, and stop when no step goes up anymore. test-climb climbs coverage that way:

| Hill climbing | In test-climb |
|---|---|
| Position | The test suite on the `test-climb/<date>` branch |
| Height | The coverage percentage the project's own tool prints |
| One step | One new test file, nothing else changes |
| Valid step | The suite stays green and the new test kills a mutant, so it can fail when the logic breaks |
| Uphill | Coverage strictly higher than the best so far: commit it |
| Not uphill | Red suite or equal coverage: revert it |
| Top | `--patience` steps in a row without gain, or 100% |

Greedy and one step at a time on purpose: every commit is a small, reviewable test that made the number go up, and nothing that did not survives on the branch.

## Rules

* Only test files change. `climb.sh try` refuses a step that touches anything else.
* A test that cannot fail is worthless. Every step must kill a mutant first: `climb.sh mutant` breaks one line of production code, runs the new test, and restores the file. The new test must go red.
* Coverage must go strictly up. Equal is a rejection.
* The suite must stay green. A red suite is a rejection.
* Git follows git-gh-skill: one branch `test-climb/<date>`, one commit per kept step, commit message starts with the project name, no Co-Authored-By lines, merge only, never rebase, never push.
* Tests follow the project style, sit next to the existing tests and test behaviour, not the language, the framework or trivial getters.
* No comments in the tests.

## Inputs

1. The test command. Default `scripts/test-all.sh` from scripts-skill. If it does not exist, find the real one and ask before inventing.
2. The coverage command. Pick it from `references/coverage.md` for the stack and run it once by hand to see a percentage.
3. Patience: steps in a row without gain before stopping. Default 5.
4. Optional: a target percentage or a folder to focus on.

## Loop

```
CLIMB=<skill-dir>/scripts/climb.sh
$CLIMB init --coverage '<coverage command>' [--test '<test command>'] [--patience 5]
```

`init` needs a clean tree and a green suite, creates the branch and records the baseline.

Then repeat:

1. Read the coverage report and pick the most valuable uncovered logic: business rules, money, parsing, validation, branches and error paths before glue code.
2. Write one test for it with a real assertion on the result.
3. Prove it can fail. Pick a line of the production code the test covers and a mutation from `references/coverage.md`, and run it against a command that runs only the new test:
   `$CLIMB mutant <src-file> <line> '<from>' '<to>' '<command running only the new test>'`
   `killed` means the test is good. `survived` means the assertion is weak: strengthen it and run `mutant` again. Kill at least one mutant per step, two when the logic has a boundary.
4. Submit the step: `$CLIMB try '<why this test matters, one line>' <test-file>...`
   `kept` committed it. `rejected` reverted it, read why and pick other logic.
5. When the output says `next: stop`, or the target is reached, leave the loop.

Report `$CLIMB status` to the user every few steps.

## Finish

1. `$CLIMB report` writes `climb-report.md` and `climb-chart.svg` and commits them.
2. `$CLIMB end` removes the local `.test-climb/` state. The branch stays.
3. Reply with the baseline, the final coverage, kept and rejected steps, the mutants killed, and `git merge --no-ff <branch>` for the user to run. Never merge or push yourself.

## Privacy

The report and the commit messages follow readme-skill: no absolute paths, home folders, user names, hosts or secrets.
