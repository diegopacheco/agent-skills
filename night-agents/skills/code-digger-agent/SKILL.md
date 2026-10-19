---
name: code-digger-agent
description: ⛏️ Code Digger, the dead code cleaner night agent. Scans a repository for unused classes, methods, functions, variables, parameters, imports, files, exports and dependencies, writes tests that prove the code is dead, runs the suite before and after removal, and leaves the cleanup on its own branch with a report. Use when the user runs /code-digger-agent, /night-agents digger, or asks to find or remove dead code, unused code or unused imports.
---

# ⛏️ Code Digger

Find code nothing uses, prove it is dead, remove it, keep the suite green.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `code-digger-agent`.

## 1. Start

Start the run with `night-run.sh start code-digger-agent` unless the dispatcher handed you a run,
install dependencies and record the baseline (contract steps 1 and 2).

## 2. Dig

Build the list of candidates. Use the language's own tooling first, then confirm by reading code:

| Stack | Tools |
|---|---|
| TypeScript / JavaScript | `tsc --noEmit --noUnusedLocals --noUnusedParameters`, `npx knip`, `npx ts-prune`, eslint `no-unused-vars` |
| Java / Kotlin | compiler warnings, IDE inspections via `javac -Xlint`, search for references across modules |
| Python | `vulture`, `ruff check --select F401,F841` |
| Go | `staticcheck` (`U1000`), `go vet`, `deadcode` |
| Rust | `cargo build` dead_code warnings, `cargo udeps` |

Do not install tools globally. Use `npx`, a local venv inside `$WORKTREE`, or skip the tool and grep.

Look for:

* unused imports
* unused local variables and parameters (keep parameters that an interface or callback signature needs)
* private and module level functions and methods with no caller
* classes, interfaces, types and enums with no reference
* exported symbols that no module imports and that are not part of the public API
* files that nothing imports, requires, loads or routes to
* dependencies in the manifest that no file imports
* code after `return`, branches behind constant false conditions, feature flags that are always off
* commented out code blocks

## 3. Prove it is dead

A candidate is dead only when every check passes. Record the evidence for each one.

1. Grep the whole repo, including tests, scripts, configs, templates, SQL, HTML and docs, for the
   name, its string form, and its file path.
2. Rule out dynamic use: reflection, `getattr`, `require(variable)`, dependency injection by name,
   routes and handlers registered by string, serializers, ORM entities, CLI entry points,
   `package.json` `main`/`bin`/`exports`, public library API, plugin registries, framework
   conventions (controllers, migrations, fixtures).
3. Write a proof test when the language allows it: a test that loads the module or package and
   asserts the public surface the rest of the code relies on, so it fails if the removal breaks
   a real caller. Run it before and after the removal. Keep the proof tests that guard real
   behavior. Delete the ones that only existed to load the removed symbol.
4. When the suite and the build both pass after removal, the candidate is dead.

When a candidate fails any check, keep it and record it as `action: skipped` with the reason.
Public library APIs are never removed, only reported.

## 4. Remove

* One commit per kind of removal or per module: `<project>: code-digger-agent: remove unused imports in src/cart`.
* Remove the now orphaned imports, tests of only the removed code, and fixtures it alone used.
* Never reformat surrounding code.

## 5. Verify, document, finish

Contract steps 4 to 7. The report lists every removed symbol with file, line, kind and the proof,
and every skipped candidate with the reason.

## Metrics

`removedImports`, `removedVariables`, `removedFunctions`, `removedClasses`, `removedFiles`,
`removedDependencies`, `skippedCandidates`. Finding kinds: `unused-import`, `unused-variable`,
`unused-parameter`, `unused-function`, `unused-method`, `unused-class`, `unused-file`,
`unused-export`, `unused-dependency`, `unreachable-code`, `commented-code`.
