---
name: conventional-commit
description: Write a git commit message in the Conventional Commits format from the staged change, checked against a written contract before it is used. Use when the user asks for a commit message, to commit, or to describe a change for git history.
---

# Conventional Commit

## Steps

1. Read the staged change with `git diff --staged`. If nothing is staged, ask what to commit.
2. Pick the type from what the change does, not from the files it touches:
   `feat` new behavior, `fix` a bug fix, `refactor` same behavior new structure, `perf` faster, `docs` documentation only, `test` tests only, `build` build or dependencies, `ci` pipelines, `chore` everything else, `revert` undoing a commit.
3. Write the message. Hard wrap every body line at 72 characters, a long body line breaks the contract.
4. Check it against the contract before using it:
   `printf '%s' "<message>" | python3 <skill-dir>/scripts/check_contract.py`
5. Exit code 1 prints each violation. Fix them and check again. Never commit a message that fails the contract.

## Contract

* Header: `<type>(<scope>): <subject>`, scope optional, lowercase letters, digits and dashes.
* Header at most 72 characters. Subject starts lowercase and does not end with a period.
* A blank line separates the header from the body. Body lines are at most 100 characters.
* A breaking change uses `!` after the type or scope and ends with a `BREAKING CHANGE: <what breaks>` footer.

## Contract tests

* `evals/contract.json`: messages the checker must accept or reject, with the reason. Run by the test suite.
* `evals/behavior.json`: changes and the type the skill must choose. Run against a real model with
  `python3 <skill-dir>/scripts/run_evals.py --provider claude` or `--provider codex`.
* Any change to this file, the contract or the checker must keep both green before the skill is published.
