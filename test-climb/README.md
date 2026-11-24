<p align="center"><img src="logo.svg" width="120" alt="test-climb logo"></p>

# test-climb

A skill for Claude Code and Codex that hill climbs test coverage one test at a time. Each step adds one test, proves the test can fail by breaking the production code on purpose, and is kept only if the suite stays green and coverage goes up. Anything else is reverted.

## How it Works

1. `climb.sh init` checks for a clean tree and a green suite, creates the branch `test-climb/<date>` and measures the baseline coverage.
2. The agent reads the coverage report and writes one test for the most valuable uncovered logic.
3. `climb.sh mutant` breaks one line of the code under test (`>=` to `>`, `0.9` to `0.8`), runs only the new test, and restores the file. The test must go red. If it stays green the assertion is weak and the agent fixes it.
4. `climb.sh try` refuses the step if anything besides the listed test files changed, or if no mutant was killed. It runs the suite and the coverage. Green and higher is committed. Red or equal is reverted.
5. After N steps in a row without gain, `climb.sh report` writes `climb-report.md` with a chart and commits it. The user merges the branch.

## Architecture

<p align="center"><img src="diagrams/architecture.svg" alt="architecture"></p>

## Features

* **One test per step**: small steps are easy to review and easy to revert.
* **Mutant gate**: a test that cannot fail when the logic breaks never counts, so coverage cannot be gamed with assertion-free tests.
* **Strictly up**: equal coverage is a rejection, so each commit adds real coverage.
* **Tests only**: a step that touches production code is refused.
* **Patience**: stops after N steps without gain instead of grinding forever.
* **Git like git-gh-skill**: its own branch, one commit per kept step prefixed with the project name, merge only, never rebase, never push.
* **scripts-skill aware**: uses `scripts/test-all.sh` as the suite when it exists.
* **Report**: a table of every step, kept or rejected, plus an SVG chart of coverage over the climb.

## Stack

* **Bash**: `scripts/climb.sh`, no dependencies besides git and awk.
* **Coverage tools of the project**: `references/coverage.md` has one command per stack (node:test, Bun, Jest, Vitest, pytest-cov, Go, cargo llvm-cov, JaCoCo with Maven or Gradle, sbt-scoverage) that prints one percentage.

## Commands

| Command | What it does |
|---|---|
| `climb.sh init --coverage '<cmd>' [--test '<cmd>'] [--patience 5]` | Branch, green check, baseline |
| `climb.sh mutant <src> <line> '<from>' '<to>' ['<test cmd>']` | Breaks one line, expects the test to fail, restores the file |
| `climb.sh try '<why>' <test-file>...` | Keeps and commits the step or reverts it |
| `climb.sh status` | Baseline, best, last steps, continue or stop |
| `climb.sh report` | Writes and commits `climb-report.md` and `climb-chart.svg` |
| `climb.sh end` | Removes the local `.test-climb/` state, keeps the branch |

## Design decisions

* The state lives in `.test-climb/`, added to `.git/info/exclude`, so it never shows up in `git status` and is never committed.
* Coverage is read as the last `NN.N%` the command prints, so any stack plugs in with one command.
* The mutant restores the file from a backup in a trap, so a crash in the middle still leaves the production code untouched.

## How to run

```
./install.sh            asks for Claude, Codex or both
./install.sh claude     or codex, or both
./uninstall.sh both
./test.sh               runs the tests
```

Then in a repository: `/test-climb` in Claude Code or `$test-climb` in Codex.

`test.sh` builds a small Node.js shop in a temp git repo and climbs it for real with node:test coverage: a boundary mutant killed and kept, a weak test whose mutant survives, a duplicate test rejected for no gain, a step touching production code refused, a red suite rejected, patience reached, the report committed, and `main` never touched.
