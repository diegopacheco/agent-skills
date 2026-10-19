---
name: migration-bot-agent
description: 🤖 Migration Bot night agent. Lists every outdated dependency, runtime and build plugin, runs the full test suite first, bumps them one by one to the latest stable version, performs the code migrations the breaking changes require, runs the suite after each bump, and leaves the upgrades on their own branch with a report. Use when the user runs /migration-bot-agent, /night-agents migration, or asks to bump, upgrade or migrate dependencies.
---

# 🤖 Migration Bot

Bring every dependency to its latest stable version and migrate the code that the bumps break.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `migration-bot-agent`.

## 1. Start

Start the run with `night-run.sh start migration-bot-agent` unless the dispatcher handed you a run,
install dependencies and record the baseline (contract steps 1 and 2).

The baseline must be green. When any test fails before a bump, write the result with
`status: failed`, summary `baseline is red, no bumps made`, and finish.

## 2. Inventory

List what is outdated with the stack's own tools and save the output to `$RUN_DIR/outdated.txt`:

| Stack | Command |
|---|---|
| npm / pnpm / yarn | `npm outdated --json`, `pnpm outdated`, `yarn outdated` |
| Maven | `mvn versions:display-dependency-updates versions:display-plugin-updates` |
| Gradle | `gradle dependencyUpdates` when the plugin exists, otherwise read the build file and check each artifact |
| Python | `pip list --outdated` inside the project venv |
| Go | `go list -m -u all` |
| Rust | `cargo outdated` when installed, otherwise `cargo update --dry-run` |

Also check the runtime pins: `.nvmrc`, `engines`, `java.version`, `python_requires`, `go` directive,
`rust-toolchain`, `Containerfile` base images, CI workflow versions.

Only stable releases. Never move to alpha, beta, rc, milestone or snapshot versions.

## 3. Bump

Order: patch and minor bumps first in one batch, then each major bump on its own.

For each major bump:

1. Read the official changelog, release notes or migration guide for every version you jump over.
   Save the link in the report.
2. Bump the version in the manifest and refresh the lock file with the package manager, never by hand.
3. Build and run the tests.
4. Fix what broke following the migration guide: renamed APIs, removed APIs, changed defaults,
   new config formats, changed import paths, codemods published by the library.
5. When the tests pass, commit: `<project>: migration-bot-agent: bump express 4.21.2 to 5.1.0`.
6. When you cannot make it green with a real migration, revert the bump, record the finding as
   `reported` with what breaks and why, and go on with the next one.

Never silence a deprecation or a failing test to get green. Never pin a transitive dependency
to dodge a migration unless the report says why.

## 4. Verify, document, finish

Contract steps 4 to 7. The report has a table of every dependency with from version, to version,
major or minor, the migration done and the link to the guide. Each finding uses `before` and
`after` for the versions, `kind` `dependency-bump` or `runtime-bump`, `detail` for the migration.

## Metrics

`bumped`, `majorBumps`, `minorBumps`, `patchBumps`, `codeMigrations`, `reportedOnly`, `stillOutdated`.
