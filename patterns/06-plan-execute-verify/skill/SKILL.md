---
name: verified-change
description: Make a code or config change in three separated phases - plan with a check per step, execute one step at a time, verify each step with evidence before moving on. Use when making a refactor, a config migration, a dependency bump, or any change that touches more than one file.
---

# Verified Change

Deciding, doing and proving are three phases. Never blend them.

## 1. Plan

Write `plan.md` in the working directory from `references/plan-template.md` before touching any file.

* One row per step, in order.
* Every step has a check: a command whose exit code proves the step worked, such as a test, a build, a grep or a type check.
* A step without a check is not a step. Split it or find a check.
* Show the plan to the user and wait for approval when the change touches more than 3 files.

## 2. Execute

* Do exactly one step, then go to Verify.
* Do not start the next step while the current one is unverified.
* Do not change anything the plan does not list. New work goes into the plan first.

## 3. Verify

* Run the check of the step and read its real output.
* Pass: mark the step `done` in `plan.md` with the command and its exit code.
* Fail: repair and run the check again, once. A second failure stops the change: mark the step `failed`, report the check output, and do not continue.
* When every step is done, run the full test suite once more as the final check.

## Done means

Every row in `plan.md` is `done` with an exit code of 0, and the final suite passed. Anything else is reported as not done, with the failing check.
