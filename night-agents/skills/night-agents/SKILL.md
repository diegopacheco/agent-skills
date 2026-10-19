---
name: night-agents
description: 🌙 Night Agents dispatcher. Runs one, several or all of the eleven night agents (code-digger-agent, presto-performance-agent, migration-bot-agent, test-automator-agent, worm-doccer, bug-hunter, architect-agent, smith-sec-agent, code-review-agent, test-review-agent, chief-of-staff-agent) against the current git repository, each on its own branch and worktree, and records every run under ~/.night-agents/runs/<date>/. Use when the user runs /night-agents, /night-agents all, /night-agents <agent>, $night-agents, or asks to run the night agents, the night shift or the night workers.
---

# 🌙 Night Agents

Run the night agents on the current repository. Each agent works on its own branch in its own git
worktree, so they never touch the user's working copy and never collide with each other.

Read `CONTRACT.md` next to this file (also at `~/.night-agents/CONTRACT.md`) before starting.

## Agents

| Icon | Agent | Alias | Job |
|---|---|---|---|
| ⛏️ | `code-digger-agent` | `digger` | Finds and removes dead code, proven dead by tests |
| 🏎️ | `presto-performance-agent` | `presto` | Finds and fixes slow code, measured before and after |
| 🤖 | `migration-bot-agent` | `migration` | Bumps dependencies and migrates the code they break |
| 🧪 | `test-automator-agent` | `tests` | Adds the missing tests that verify core logic |
| 🪱 | `worm-doccer` | `docs` | Brings README and docs back in sync with the code |
| 🐞 | `bug-hunter` | `bugs` | Hunts bugs, writes bug-report.md, fixes them with TDD |
| 🏛️ | `architect-agent` | `architect` | Reviews architecture, design, extensibility, SoC and cohesion, documents findings |
| 🛡️ | `smith-sec-agent` | `sec` | Hunts OWASP Top 10 and zero day classes, documents findings |
| 🔎 | `code-review-agent` | `review` | Reviews all code for bugs, design, fallacies, anti-patterns, broken requirements and missing tests, fixes and reports |
| 🔬 | `test-review-agent` | `test-review` | Runs the suite many times for flaky tests, deletes tests of the language or framework, fixes weak tests |
| 🎖️ | `chief-of-staff-agent` | `chief` | Adversarial review of the other agents' work: claims, gaps, contradictions, merge conflicts. Runs last |

## Arguments

The input is `$ARGUMENTS`.

* `all` runs the eleven agents.
* One or more agent names or aliases, separated by spaces or commas: `presto`, `bugs docs`,
  `digger,tests`. Full names work too.
* Empty: ask the user which agents to run. In Claude Code use `AskUserQuestion` with
  `multiSelect: true` in three questions (`digger`, `presto`, `migration`, `tests`; `docs`, `bugs`,
  `architect`, `sec`; `review`, `test-review`, `chief`).
  In Codex ask in plain text with the table above. Wait for the answer.
* An unknown name: list the valid names and aliases and stop.

## Preconditions

1. `~/.night-agents/bin/night-run.sh` exists. Otherwise tell the user to run the project's
   `install.sh` and stop.
2. The current directory is inside a git repository with at least one commit and a checked out
   branch. Otherwise say so and stop.
3. Print the plan: the repository, the base branch, the selected agents with their icons.

## Run

`chief-of-staff-agent` reviews the work of the others, so it always runs last: start it only after
every other selected agent finished, then run it on its own.

1. Start every selected agent except `chief-of-staff-agent`, one after the other, from the repository root:
   `~/.night-agents/bin/night-run.sh start <agent-name>`. Keep the printed values of each one:
   `RUN_DIR`, `WORKTREE`, `BRANCH`, `BASE_BRANCH`, `BASE_SHA`, `PROJECT`, `REPO`.
2. Run the agents:
   * Claude Code: launch one subagent per selected agent in a single message so they run in
     parallel. Each prompt says: use the `<agent-name>` skill, the run is already started, here are
     its `RUN_DIR`, `WORKTREE`, `BRANCH`, `BASE_BRANCH`, `BASE_SHA`, `PROJECT`, `REPO`, follow
     `~/.night-agents/CONTRACT.md` from step 2, finish with `night-run.sh finish`, and return the
     final message block.
   * Codex or any agent without subagents: run them one at a time in this order: `bug-hunter`,
     `code-digger-agent`, `presto-performance-agent`, `test-automator-agent`, `migration-bot-agent`,
     `worm-doccer`, `architect-agent`, `smith-sec-agent`, `code-review-agent`, `test-review-agent`. Read each agent's `SKILL.md` and follow it with the values from step 1.
3. When `chief-of-staff-agent` is selected, after every other run finished, start it with
   `night-run.sh start chief-of-staff-agent` and run it the same way, alone.
4. Report progress as `x/y` agents finished at least once a minute.
5. When an agent fails, record it and go on with the next one. One failing agent never stops the night.
6. Every started run must end with `night-run.sh finish`, even a failed one: write a `result.json`
   with `status: failed` and the reason in `summary`, commit or discard what is left in the worktree,
   then finish.

## Final report

Print one line per agent, then the UI path:

```
⛏️ code-digger-agent         success      night-agents/code-digger-agent/2026-10-18-010203   4 fixed
🐞 bug-hunter                no-findings  none                                               0 fixed
ui  ~/.night-agents/ui/index.html  (open the Night Agents app or scripts/ui.sh)
```

Use the real values from each run's final message block. Never report a run as done when its
`night-run.sh finish` failed.
