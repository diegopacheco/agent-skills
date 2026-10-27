---
name: resumable-task
description: Run a long multi step task - a backfill, a bulk rename across a repo, a batch of migrations, a large refactor - with a checkpoint file so it can resume after a crash, a timeout or a new session without redoing finished work. Use when a task has many steps, side effects, or may not finish in one session.
---

# Resumable Task

State lives in a file, not in the conversation. A new session must be able to continue from the file alone.

## Start or resume

1. Look for `.agent-checkpoint.md` in the working directory.
2. Found: read it, tell the user which step it resumes from, and continue at the first step that is not `done`.
3. Not found: create it from `references/checkpoint-template.md` with every step listed as `todo`.

## Each step

1. Mark the step `running` with the current time and save the file.
2. Do the step.
3. Mark it `done` with its output (counts, ids, file names) and save the file before starting the next step.
4. If the step fails, mark it `failed` with the error, save, and stop.

## Rules

* Never redo a step marked `done`, its side effects already happened.
* A step found as `running` crashed midway. Check what it changed before running it again, and only rerun steps that are safe to repeat.
* Steps must be idempotent where possible: upserts over inserts, `mkdir -p`, skip a file that is already renamed.
* Later steps read the outputs of earlier steps from the file, never from memory.
* Delete the checkpoint only when every step is `done` and the user has seen the summary.
