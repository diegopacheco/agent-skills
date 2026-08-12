# agent-skills
Agent-Skills: Repo with agent skills for claude/codex.

## Skills

| Skill | What it is |
|---|---|
| [claude-agents-md](claude-agents-md) | Installer for a shared `CLAUDE.md` / `AGENTS.md` rules file (coding guidelines, git/PR conventions, bash/Containerfile/podman-compose/README rules). `install.sh` copies `CLAUDE.md` to `~/.claude/CLAUDE.md` for Claude Code and/or `AGENTS.md` to `~/.codex/AGENTS.md` for Codex. |
| [loop-backlog](loop-backlog) | Slash command `/cc-loop-backlog` plus a `cc-loop-backlog.sh` runner that reads `backlog.md` in the current directory, reports TODO/WIP counts, and drives Claude Code to work through the backlog until done, streaming progress from the CLI's JSON output. `install.sh` installs the script to `~/Documents/bin` and the command to `~/.claude/commands`. |
