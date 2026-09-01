# html-research

Researches a topic on the web and renders one self-contained light-theme HTML report.

## Install

```bash
./install.sh          # Claude Code and Codex
./install.sh claude   # Claude Code only
./install.sh codex    # Codex only
```

Installs to `~/.claude/skills/html-research` + `~/.claude/commands/html-research.md`
and `~/.codex/skills/html-research` + `~/.codex/prompts/html-research.md`.

## Use

```
/html-research rate limiting
/html-research how does auth work in this repo
```

## Output

One HTML file in `/Users/diegopacheco/git/diegopacheco/html-research/`, opened in Chrome.

## Layout

- `SKILL.md` — the workflow and rules
- `command.md` — the `/html-research` command, installed into both tools
- `templates/report-template.html` — the report shell, filled by editing its `REPORT` object
- `templates/handwritten-diagram.svg` — handwritten SVG diagram reference
- `scripts/check_report.py` — fails the report on external assets, dark theme, missing favicon,
  missing search, missing cards, or missing sources
- `scripts/open_report.sh` — opens the report in Chrome
