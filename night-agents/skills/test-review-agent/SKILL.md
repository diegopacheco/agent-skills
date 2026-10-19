---
name: test-review-agent
description: 🔬 Test Review night agent. Reviews and runs every test in a repository - hunts flaky tests by running the suite many times, deletes tests that only exercise the language or the framework, rewrites tests that cannot fail, and strengthens weak assertions so every test proves real logic - on its own branch with test-review.md. Use when the user runs /test-review-agent, /night-agents test-review, or asks to review, de-flake or clean up tests.
---

# 🔬 Test Review

A test earns its place only when it fails because business logic broke. Find the tests that do not,
and the tests that fail for no reason, and fix them.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `test-review-agent`.

## 1. Start

Start the run with `night-run.sh start test-review-agent` unless the dispatcher handed you a run,
install dependencies and record the baseline (contract steps 1 and 2).

## 2. Hunt flaky tests

1. Run the whole suite 10 times in a row, each run to `$RUN_DIR/flaky/run-<n>.log`. Count, per test,
   how many runs passed.
2. A test that both passed and failed is flaky. Run it alone 20 more times and in a shuffled order
   when the runner supports it, to tell order dependence from timing.
3. Find the cause: sleeps and timeouts, real clock and dates, random data without a seed, shared
   state between tests, test order, real network, ports, file system leftovers, unawaited promises.
4. Fix the cause, never retry around it: inject the clock, seed the random, isolate state, await
   properly, use port 0. Prove the fix with 20 green runs saved to `$RUN_DIR/flaky/<id>-after.log`.

## 3. Review every test

Read every test file and the code it tests. Classify each test:

| Class | Signal | Action |
|---|---|---|
| Tests the language | asserts `[].length === 0`, string concat, `Math.max`, JSON round trip | delete |
| Tests the framework | asserts the router routes, the ORM saves, the mock returns what it was told | delete |
| Cannot fail | no assertion, asserts a constant, catches every error, asserts the mock it set up | rewrite or delete |
| Tautology | computes the expected value with the code under test | rewrite with a literal expected value |
| Weak | checks only status 200, only length, only that no error was thrown, only part of the result | strengthen |
| Over mocked | mocks the logic it claims to test | rewrite against the real logic |
| Duplicate | same input class and assertion as another test | delete the weaker one |
| Trivial | getters, setters, constructors with no logic | delete |
| Good | fails when a real business rule breaks | keep |

Before deleting or rewriting a test, prove it: break the logic it claims to cover (flip an operator,
change a constant) in a scratch edit, run the test, and record whether it fails. Save the output to
`$RUN_DIR/mutations/<id>.log` and revert the scratch edit. A test that stays green while its logic is
broken is not protecting anything.

## 4. Fix

* Delete tests in the first two rows and trivial tests. Say in the commit why each one goes.
* Rewrite or strengthen the rest so they assert the real rule, with literal expected values.
* After each rewrite, repeat the mutation from step 3: the new test must fail on the broken logic
  and pass on the real one.
* Never weaken a good test, never delete a test that is the only cover for a rule without replacing it.
* Never change production code, except to inject a clock, a random seed or a port that a flaky fix
  needs, and say so.
* One commit per test file: `<project>: test-review-agent: <what changed>`.

## 5. test-review.md

Write `test-review.md` at the repo root of the branch: the flaky results table (test, passes out of
runs, cause, fix), then one section per test reviewed with its class, the mutation result before and
after, and the action. Commit it last: `<project>: test-review-agent: document test review`.

## 6. Verify, document, finish

Contract steps 4 to 7. Fewer passing tests after a deletion is expected, new failures are not.
`report.md` carries the same tables. Every deleted, rewritten or de-flaked test is a finding with
`action: fixed`, every problem left alone is `reported`.

## Metrics

`testsReviewed`, `testsDeleted`, `testsRewritten`, `testsStrengthened`, `flakyFound`, `flakyFixed`,
`suiteRuns`, `mutationsCaught`. Finding kinds: `flaky`, `tests-language`, `tests-framework`,
`cannot-fail`, `tautology`, `weak-assertion`, `over-mocked`, `duplicate`, `trivial`.
