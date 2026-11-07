---
name: pr-splitter
description: Breaks one large branch into a chain of small, reviewable stacked PRs, each of which builds and passes its tests on its own, and proves the last PR has exactly the same tree as the original branch. Writes local split branches, PR bodies with the task, the prompt and the real test output, and the gh commands to open the stack. Never pushes and never rebases. Use when the user runs /pr-splitter or asks to split, break up, slice or stack a big branch, PR or diff into smaller PRs.
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# PR Splitter

Turn one big branch into a stack of small PRs a reviewer can read in one sitting. Every PR builds,
every PR passes the tests alone, and the last PR equals the original branch byte for byte, so the
split never loses or changes code.

## Inputs

`$ARGUMENTS`, all optional:
* the source branch, default the current branch
* the base branch, default the repository default branch (`main` or `master`)
* the target size per PR in changed lines, default 400

## Engine

Scripts live in `scripts/` beside this skill. They run from any directory of the repository.

| Script | What it does |
|---|---|
| `plan.sh <base> <source>` | Creates the work dir `.git/pr-split/<source>/` with `inventory.txt` (lines added, removed, file) and a starter `plan.md` |
| `split.sh <plan.md>` | Refuses a plan that drops or invents a file, builds one stacked branch per slice, runs build and tests on each, writes PR bodies and `create-prs.sh`, and checks the last branch equals the source |
| `restack.sh <plan.md>` | After a review fix on one slice, merges each slice into the next in order and runs build and tests again |
| `cleanup.sh <source>` | Deletes the `split/<source>/*` branches and the `out/` folder, keeps the plan |
| `test-all.sh` | Runs the engine's own test suite |

The work dir lives inside `.git`, so the plan, patches and output are never committed and survive
branch switches.

## Plan format

```
base: main
source: feature/big
build: mvn -q compile
test: mvn -q test
prompt: prompt.md

## user table and model
> Adds the users table and the User model the service needs.
src/main/resources/db/V2__users.sql
src/main/java/app/User.java
src/test/java/app/UserTest.java
patch patches/service-part1.patch

## user service
> Adds the user service and its endpoint on top of the model.
src/main/java/app/UserService.java
src/main/java/app/Service.java
```

* `build:` is optional, `test:` and `prompt:` are required.
* `## title` starts a slice. The title becomes the branch `split/<source>/NN-<slug>` and the commit
  `<project>: <title>`.
* `> line` is the slice description, 3 to 5 lines, used as the PR task.
* A bare path takes the final version of that file from the source branch, or deletes it when the
  source deleted it. Every changed file is listed as a bare path in exactly one slice.
* `patch <file>` applies a patch, relative to the plan, before the bare paths. Use it to land part
  of a file early. The same file is then listed as a bare path in a later slice, which brings it to
  its final version.

## Steps

1. Resolve source and base. Run `git status`; if the tree is dirty, stop and tell the user.
   If base is not an ancestor of source, tell the user to merge base into source first. Never rebase.
2. Find the real build and test commands: `scripts/test-all.sh` when it exists, otherwise read
   `package.json`, `pom.xml`, `build.gradle`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`.
   Run them on the source branch first. If the source itself is red, stop and report it: a split of
   a red branch cannot have green slices.
3. Run `scripts/plan.sh <base> <source>`. Read `inventory.txt` and the full diff
   `git diff <base> <source>`. Read the files, not only the diff, to learn what depends on what.
4. Write `prompt.md` in the work dir with the user's whole prompt, verbatim.
5. Design the slices and write `plan.md`:
   * Order by dependency: what is used lands before what uses it. Schema, then model, then logic,
     then API, then UI, then docs.
   * Tests travel with the code they test.
   * Pure refactors, renames, moves and formatting get their own slice, before the behavior change.
   * Generated files, lockfiles and dependency bumps get their own slice.
   * Aim for the target size per slice; a slice may be larger only when it cannot be cut and still
     build. Prefer 2 to 8 slices.
   * When one file must be split across slices, write the partial version as a patch:
     `git diff <base> <source> -- <file> > patches/<name>.patch`, keep only the hunks the earlier
     slice needs, check it with `git apply --check`, and list the file as a bare path in the later slice.
   * Never invent code. If a slice can only build with a stub or flag that is not in the source, stop
     and ask the user.
6. Run `scripts/split.sh <work dir>/plan.md`. When a slice fails, read its log in `out/NN.log`, fix
   the plan by moving files or hunks, run `scripts/cleanup.sh <source>` and split again. Stop after 5
   failed attempts and report what blocks the split.
7. Report a table with every branch, its files, `+/-` lines and the test result, the line
   `same tree as <source>: yes`, the path of the PR bodies and of `create-prs.sh`.
8. Never push. Tell the user to push the `split/<source>/*` branches and then run `create-prs.sh`.
   Each PR targets the previous slice, so GitHub shows only that slice's diff. Merge them in order
   with merge commits; when one merges, GitHub retargets the next to the base.
9. After review comments: commit the fix on the slice it belongs to, then run
   `scripts/restack.sh <work dir>/plan.md`. It merges forward, never rebases, and reruns the checks.

## Hard Rules

* Never push, never rebase, never force anything, never touch the source branch.
* Only ever delete branches under `split/<source>/`.
* The split is lossless: `split.sh` must print `same tree as <source>: yes`. Never report success
  without that line.
* Every slice builds and passes the tests alone. A slice with a skipped or failing test is a failure,
  say so.
* PR bodies carry the task (3 to 5 lines), the whole prompt and the real test output.
* Commits are `<project>: <title>` with no `Co-Authored-By` lines.
* No comments in any file you write.
