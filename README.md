# agent-skills
Agent-Skills: Repo with agent skills for claude/codex.

## Skills

| Skill | What it is |
|---|---|
| [claude-agents-md](claude-agents-md) | Installer for a shared `CLAUDE.md` / `AGENTS.md` rules file (coding guidelines, git/PR conventions, bash/Containerfile/podman-compose/README rules). `install.sh` copies `CLAUDE.md` to `~/.claude/CLAUDE.md` for Claude Code and/or `AGENTS.md` to `~/.codex/AGENTS.md` for Codex. |
| [loop-backlog](loop-backlog) | Slash command `/cc-loop-backlog` plus a `cc-loop-backlog.sh` runner that reads `backlog.md` in the current directory, reports TODO/WIP counts, and drives Claude Code to work through the backlog until done, streaming progress from the CLI's JSON output. `install.sh` installs the script to `~/Documents/bin` and the command to `~/.claude/commands`. |
| [bundle-size](bundle-size) | Skill that attributes a frontend project's JS bundle size to the imports that caused it. Bundles the project with esbuild, reads the metafile, and renders a light-theme site ranking every import by minified KB. `install.sh` copies the skill to `~/.claude/skills/bundle-size` and runs `npm install`. |
| [rerender](rerender) | Skill that benchmarks React re-renders. Mounts each component in jsdom inside a React Profiler, forces parent re-renders with stable props, counts wasted renders, and renders a Lighthouse-style light-theme report. `install.sh` copies the skill to `~/.claude/skills/rerender` and runs `npm install`. |
| [bug-recording](bug-recording) | Skill that runs a target React app, hunts for CSS/functional/render bugs with Playwright, and records a narrated video of each one. `install.sh` copies the skill to `~/.claude/skills/bug-recording`, runs `npm install`, and installs the Playwright Chromium browser. |
