---
name: scripts-skill
description: When a fullstack application needs operational scripts, use this skill to create scripts/setup.sh, build-all.sh, start-all.sh, stop-all.sh, test-all.sh, status.sh, ui.sh, sql-console.sh, plus build-backend.sh, build-frontend.sh, cli.sh and one script per test kind when the project has them. IF user mentions setup, start, stop, status, run the app, ops scripts, or scripts folder, use this skill.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
---

# Scripts Skill

Give a fullstack application one predictable set of operational scripts so anyone can set it up,
start it, check it, test it, open it and stop it without reading the code.

## Inputs

Read the repository before writing anything. Never guess a port, a command or a service.

1. Find the app root: the directory holding the backend and frontend, or the repo root.
2. Read `package.json`, `pom.xml`, `build.gradle`, `Cargo.toml`, `go.mod`, `requirements.txt`,
   `pyproject.toml`, `Containerfile`, `docker-compose.yml`, `podman-compose.yml`, `.env`,
   `application.properties`, `application.yml`, `vite.config.*`, `next.config.*`.
3. Collect every real port: backend HTTP, frontend dev server, database, cache, broker.
4. Collect the real commands for install, build, run and test of each stack in the app.
5. Find every test kind the project really has: unit, integration, e2e, contract, css, database,
   stress, chaos, property, ui. Look at test folders, test file names, build profiles, npm scripts,
   Makefile targets and CI files.
6. Find out if the project ships a CLI: a `bin` entry in `package.json`, a `[[bin]]` in
   `Cargo.toml`, a `cmd/` folder in Go, `[project.scripts]` in `pyproject.toml`, or a `cli/` module.
7. If nothing declares a port, ask the user. Do not invent one.

## Output

All scripts live in `<app-root>/scripts/`:

| Script | What it does |
|---|---|
| `setup.sh` | Installs every dependency and prepares the app to run for the first time |
| `build-all.sh` | Builds every part of the app and fails on the first failing build. Always present |
| `build-backend.sh` | Builds only the backend. Only when the app has a backend |
| `build-frontend.sh` | Builds only the frontend. Only when the app has a frontend |
| `cli.sh` | Builds when needed and runs the project CLI, passing every argument through with `"$@"`. Only when the project has a CLI |
| `start-all.sh` | Starts every service, waits until each declared port is listening, then echoes the full link of every service |
| `stop-all.sh` | Stops everything it started and frees every declared port |
| `test-all.sh` | Runs every test suite in the app and fails on the first failing suite |
| `<kind>-test.sh` | Runs one test kind only, such as `unit-test.sh`, `integration-test.sh`, `e2e-test.sh`, `contract-test.sh`, `css-test.sh`, `database-test.sh`, `stress-test.sh`, `chaos-test.sh`. One script per test kind the project really has |
| `status.sh` | Prints one line per service with its port, UP or DOWN, and the pid |
| `ui.sh` | Opens the frontend URL in the browser, starting nothing |
| `sql-console.sh` | Opens a console against the database. Only when the app has one |
| `common.sh` | Shared root resolution, port helpers and waiting loops sourced by the others |
| `ports.env` | `SERVICE=PORT` per line, the single source of truth for every port |

Create `sql-console.sh` only when the app really has a database or cache such as postgres, mysql,
mariadb, redis, valkey, mongodb, cassandra or clickhouse.

`build-all.sh` and `test-all.sh` are always created. `build-all.sh` calls `build-backend.sh` and
`build-frontend.sh` when they exist. `test-all.sh` calls every `<kind>-test.sh` when they exist.

Create `build-backend.sh`, `build-frontend.sh`, `cli.sh` and each `<kind>-test.sh` only when the
project really has that part or that test kind. Never make one up: no `chaos-test.sh` without chaos
tests, no `cli.sh` without a CLI, no `build-frontend.sh` without a frontend.

Start from `templates/` in this skill and adapt each script to the real app. The templates are a
starting point, not the answer: delete the stacks the app does not have and fill in the real
commands. Never ship a script with a branch for a stack the app does not use.

## Hard Rules

* Every script starts with `#!/usr/bin/env bash` and `set -euo pipefail`.
* Every script works from any directory of the repository. Resolve the app root from the script's
  own location and `cd` there before doing anything:
  `ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"`. Never rely on the caller's directory
  and never use a relative path that assumes one.
* Stay bash 3.2 compatible so the scripts run on a stock macOS: no associative arrays, no `mapfile`,
  no `${var,,}`.
* Every port comes from `scripts/ports.env`. No port is hardcoded in any other script.
* `start-all.sh` must end by echoing the full link of every service, never only the port:
  `http://localhost:8080`, `http://localhost:3000`, `postgresql://localhost:5432`. Use the real
  scheme and the real base path the app serves, such as `http://localhost:8080/api`. Build every
  link with `service_url` from `common.sh`.
* Every script is idempotent. Running `setup.sh` twice, `start-all.sh` on a started app or
  `stop-all.sh` on a stopped app succeeds and changes nothing.
* Every script exits non-zero when its job fails, and prints what failed on stderr.
* Waiting is a loop that checks a condition with `sleep 1` between tries and a bounded number of
  tries. Never `sleep` more than 1 and never wait longer than 60 seconds.
* Background processes write a pid file into `<app-root>/.run/` and a log into `<app-root>/.run/logs/`.
  Add `.run/` to `.gitignore`.
* Containers use `podman` and `podman-compose`. Never `docker` or `docker-compose`.
* No comments in any script.
* No emojis and no icons in any script output.
* `chmod +x` every script after writing it.

## Steps

1. Write `scripts/ports.env` with the real services and ports.
2. Write `scripts/common.sh`, then the core scripts, then `build-backend.sh`, `build-frontend.sh`,
   `cli.sh`, each `<kind>-test.sh` and `sql-console.sh` for the parts the project really has.
3. `chmod +x <app-root>/scripts/*.sh`.
4. Add `.run/` to `.gitignore` when it is missing.
5. Verify: run `scripts/status.sh` from the repo root and from a nested directory, run `setup.sh`,
   `build-all.sh`, `start-all.sh`, `status.sh`, `test-all.sh`, `stop-all.sh`, `status.sh` in that order and confirm
   every one exits zero and the ports go up and then down. Run every `build-*.sh`, `<kind>-test.sh`
   and `cli.sh --help` that was created and confirm each exits zero. Fix anything that fails.
6. Append the documentation section to `README.md`.

## README.md

Append this section at the end of the app `README.md`, with the real ports of the app. Replace an
existing `## Scripts` section instead of adding a second one.

````markdown
## Scripts

All scripts live in `scripts/` and run from any directory of the repository.

| Script | What it does |
|---|---|
| `./scripts/setup.sh` | Installs dependencies and prepares the app |
| `./scripts/build-all.sh` | Builds every part of the app |
| `./scripts/build-backend.sh` | Builds the backend |
| `./scripts/build-frontend.sh` | Builds the frontend |
| `./scripts/cli.sh` | Runs the project CLI |
| `./scripts/start-all.sh` | Starts every service and prints the full link of each one |
| `./scripts/status.sh` | Shows every service port as UP or DOWN |
| `./scripts/test-all.sh` | Runs every test suite |
| `./scripts/unit-test.sh` | Runs the unit tests |
| `./scripts/ui.sh` | Opens the UI in the browser |
| `./scripts/stop-all.sh` | Stops every service |
| `./scripts/sql-console.sh` | Opens a console on the database |

Ports are declared in `scripts/ports.env`.

```bash
./scripts/setup.sh
./scripts/build-all.sh
./scripts/start-all.sh
./scripts/status.sh
./scripts/ui.sh
./scripts/stop-all.sh
```
````

Only list the scripts the app actually has. Drop the `sql-console.sh` row when there is no database,
and drop every build, cli and test row the app does not have. Add one row per `<kind>-test.sh` created.
