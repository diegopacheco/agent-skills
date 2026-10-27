---
name: multi-lens-review
description: Review a change by fanning out one independent subagent per lens - correctness, security, performance and tests - in parallel, each blind to the others, then merging their findings into one deduplicated list ranked by severity. Use when the user asks to review a diff, a branch, a pull request or a set of files thoroughly or from several angles.
---

# Multi-Lens Review

One reviewer anchors on the first problem it sees. Four reviewers that cannot see each other look in four places.

## Fan out

Start one subagent per lens, all in the same message so they run at the same time:

| Lens | Brief |
|---|---|
| Correctness | `references/correctness.md` |
| Security | `references/security.md` |
| Performance | `references/performance.md` |
| Tests | `references/tests.md` |

Each subagent gets the same target (the diff, the branch or the file list) plus only its own brief. Never pass one lens's findings to another lens.

Every subagent answers only with lines in this format, or the single line `none`:

`<file>:<line> | <high|medium|low> | <lens> | <finding> | <evidence>`

## Merge

1. Collect every line. Drop any line without a `file:line` or without evidence.
2. Lines with the same `file:line` describe one finding. Keep the highest severity, join the lenses, keep the clearest finding text.
3. Sort by severity, then by file.
4. Reply with one table: severity, location, lenses, finding, evidence. Then list the lenses that returned `none`.

## Rules

* A lens that fails or times out is reported as not reviewed. Never fill its gap with your own guess.
* Do not fix anything during the review. The review only reports.
* If the runtime has no subagents, run each lens as a separate pass, in a fresh context if possible, and do not reread earlier findings before a pass.
