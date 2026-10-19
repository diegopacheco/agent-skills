---
name: code-review-agent
description: 🔎 Code Review night agent. Reviews all the code of a repository like a senior reviewer - bugs, design problems, logical fallacies, bad code, anti-patterns, broken requirements and missing tests - fixes each finding it can prove with a test, reports the rest, and writes code-review.md on its own branch. Use when the user runs /code-review-agent, /night-agents review, or asks for a full code review of a repository.
---

# 🔎 Code Review

Review every file like a senior engineer reviewing a pull request that contains the whole repository.
Fix what you can prove, report what you cannot, and leave a review document a human can act on.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `code-review-agent`.

## 1. Start

Start the run with `night-run.sh start code-review-agent` unless the dispatcher handed you a run,
install dependencies and record the baseline (contract steps 1 and 2).

## 2. Read the requirements

Read README, docs, design-doc, backlog, API specs, issue references in the code and the tests.
List every requirement they state: rules, limits, promises to the user, endpoints, error behavior.
Save the list to `$RUN_DIR/checks/requirements.md`. These are what the code must keep.

## 3. Review every file

Read every source file, test and build file, not a sample. For each one look for:

| Area | Signal |
|---|---|
| Bugs | wrong logic, off by one, null handling, money and time mistakes, unhandled errors |
| Broken requirements | code that does something different from a requirement in step 2 |
| Logical fallacies | conditions that can never be true, checks in the wrong order, `a || b` where `a && b` is meant, assumptions the data breaks |
| Design problems | mixed responsibilities, wrong module for the logic, leaking internals, hidden coupling |
| Anti-patterns | god functions, magic numbers, copy paste rules, primitive obsession, flag arguments, swallowed exceptions, shared mutable state |
| Bad code | misleading names, dead branches, deep nesting, duplicated expressions, work done twice |
| Missing tests | core logic with no test, tests that cannot fail, tests that assert only part of the result |
| Error handling | errors that leak internals, wrong status codes, partial writes |

Each finding needs a file, a line, what is wrong, why it matters, and the evidence: a failing test,
a command output, or the requirement it breaks. Style preferences without a cost are not findings.

## 4. Fix or report

For each finding, in order of severity:

* **Fix** when the change is local, a test proves it, and it does not change a public contract.
  Write the test first and see it fail (save to `$RUN_DIR/tdd/<id>-red.log`), make the smallest
  fix, see it pass (`$RUN_DIR/tdd/<id>-green.log`), run the suite, and commit test and fix together:
  `<project>: code-review-agent: <what changed>`. Missing tests are fixed by adding the test.
* **Report** when the fix needs a product decision, changes a public API or schema, is a large
  redesign, or you cannot prove it. Say what you would change and why.
* Never weaken a test, never change a requirement to match the code.

## 5. code-review.md

Write `code-review.md` at the repo root of the branch: a summary with counts by area and severity,
the requirements checked, then one section per finding:

```markdown
## R1: Free shipping threshold breaks the README promise

- Severity: high
- Area: broken-requirement
- Where: src/cart.js:31
- Problem: shipping is free only above $50, the README promises free shipping over $40
- Why it matters: customers are charged shipping the shop said was free
- Evidence: test/cart.test.js "ships free over the promised threshold" failed before the fix
- Action: fixed
```

Commit it after the fixes: `<project>: code-review-agent: document code review`.

## 6. Verify, document, finish

Contract steps 4 to 7. `report.md` in `$RUN_DIR` carries the same summary and findings plus the
red and green log paths. `status` is `success` when at least one finding was fixed.

## Metrics

`filesReviewed`, `findingsFound`, `findingsFixed`, `findingsReported`, `requirementsChecked`,
`testsAdded`. Finding kinds: `bug`, `broken-requirement`, `logical-fallacy`, `design`,
`anti-pattern`, `bad-code`, `missing-test`, `error-handling`.
