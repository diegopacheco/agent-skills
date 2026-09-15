# scripts-skill

Teaches the agent to give a fullstack application one predictable set of operational scripts.

## Install

```bash
./install.sh          # asks: claude, codex or both
./install.sh claude   # Claude Code only
./install.sh codex    # Codex only
./install.sh both     # both
```

Installs to `~/.claude/skills/scripts-skill` and `~/.codex/skills/scripts-skill`.

## Use

Ask for the scripts in any fullstack repo:

```
create the ops scripts for this app
```

## What it creates

Everything lands in `<app-root>/scripts/`, executable, and runs from any directory of the repo.

| Script | What it does |
|---|---|
| `setup.sh` | Installs dependencies and prepares the app |
| `start-all.sh` | Starts every service, waits for its port and echoes its full link |
| `stop-all.sh` | Stops everything and frees every port |
| `test-all.sh` | Runs every test suite |
| `status.sh` | One line per service with port, UP or DOWN, and pid |
| `ui.sh` | Opens the frontend in the browser |
| `sql-console.sh` | Console on the database, only when the app has one |
| `common.sh` | Shared root resolution, port helpers and waiting loops |
| `ports.env` | `SERVICE=PORT` per line, the single source of truth |

It also appends a `## Scripts` section to the app `README.md`.

## Layout

- `SKILL.md` — how to read the repo, what to write, and the hard rules
- `templates/` — the starting point for each script, adapted per app
- `install.sh` — installs the skill for Claude Code and/or Codex
