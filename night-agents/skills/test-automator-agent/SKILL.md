---
name: test-automator-agent
description: 🧪 Test Automator night agent. Finds the core logic that has no tests and adds the tests that matter - unit, property based, integration, stress, chaos, contract, CSS and UI tests - without duplicating existing tests and without testing frameworks, the language or trivial getters. Runs the suite and coverage before and after and leaves the tests on their own branch with a report. Use when the user runs /test-automator-agent, /night-agents tests, or asks to add tests or raise coverage.
---

# 🧪 Test Automator

Add the tests that would catch a real regression in the logic the business depends on. Nothing else.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `test-automator-agent`.

## 1. Start

Start the run with `night-run.sh start test-automator-agent` unless the dispatcher handed you a
run, install dependencies and record the baseline (contract steps 1 and 2). Also record coverage
before when the stack supports it (`node --test --experimental-test-coverage`, `c8`, `jest --coverage`,
`jacoco`, `pytest --cov`, `go test -cover`, `cargo llvm-cov`). Save it to `$RUN_DIR/coverage-before.txt`.

## 2. Map what exists

1. List every existing test file and what each one covers. Never add a test that asserts what an
   existing test already asserts.
2. List the core logic: pricing, money, permissions, state machines, parsing, validation, date and
   time math, concurrency, data transformations, public API contracts, persistence queries.
3. The gap is core logic with no test, or with tests that only cover the happy path.

## 3. Choose the right kind of test

| Kind | When it earns its place |
|---|---|
| Unit | pure logic with branches, edge cases and error paths |
| Property based | functions with invariants: round trips, ordering, totals, idempotence. Use the stack's library when it is already a dependency, otherwise a small seeded generator loop in the test |
| Integration | code that talks to a database, a queue, the file system or another module through a real boundary |
| Contract | HTTP or message APIs other systems call: status codes, required fields, types, error shapes |
| Stress | paths with documented limits: many rows, big payloads, many concurrent calls |
| Chaos | code that must survive failures: a dependency that throws, times out or returns garbage |
| CSS / UI | layouts and states users see: a button disabled while saving, an error shown, responsive breakpoints. Use Playwright when the project already has a UI test setup |

Never test: the framework, the language, the standard library, generated code, getters and setters,
constants, mocks asserting they were called with what the test just passed them.

Every test name says the business rule: `applies the 10% discount only once per order`, not
`test discount 2`. Every test must fail when the rule it guards is broken. Check that by breaking
the code on purpose, running the test, seeing it fail, and restoring the code. Record that check in
the report.

## 4. Write

* Follow the project's test layout, naming and runner. Add a test library only when the stack has
  no way to write the test without it, and say why in the report.
* Tests must be deterministic: fixed seeds, fixed clocks, no network.
* When a new test reveals a real bug, do not fix it. Mark it skipped or expected failure the way the
  runner supports, record it as a finding with `kind: bug-found`, `action: reported`, and leave the
  fix to `bug-hunter`.
* One commit per area: `<project>: test-automator-agent: property tests for cart totals`.

## 5. Verify, document, finish

Contract steps 4 to 7, plus coverage after to `$RUN_DIR/coverage-after.txt`. The report lists each
new test file, the rule each test guards, and the mutation check result.

## Metrics

`testsAdded`, `unitTests`, `propertyTests`, `integrationTests`, `contractTests`, `stressTests`,
`chaosTests`, `uiTests`, `coverageBefore`, `coverageAfter`, `bugsFound`. Finding kinds: `missing-unit-test`,
`missing-property-test`, `missing-integration-test`, `missing-contract-test`, `missing-stress-test`,
`missing-chaos-test`, `missing-ui-test`, `bug-found`.
