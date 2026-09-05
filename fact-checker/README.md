# fact-checker

Adversarially checks every claim in a report, a URL, a file or a prompt, and renders one
self-contained light-theme HTML verdict report.

Each claim becomes a numbered fact — `F1: is Google just a search engine?`,
`F2: are LLMs only text?` — is researched on the web for and against, and lands in one of four
groups: ✅ True, ❌ False, ⚠️ Partly True, ❓ Unverifiable. True and False are triple checked
before the report is written.

## Install

```bash
./install.sh          # asks: Claude, Codex or both
./install.sh claude   # Claude Code only
./install.sh codex    # Codex only
./install.sh both
```

Installs to `~/.claude/skills/fact-checker` + `~/.claude/commands/fact-check.md`
and `~/.codex/skills/fact-checker` + `~/.codex/prompts/fact-check.md`.

## Use

```
/fact-check /Users/diegopacheco/git/diegopacheco/html-research/rate-limiting-09-2026.html
/fact-check https://some-vendor.com/blog/we-are-10x-faster
/fact-check /Users/diegopacheco/git/diegopacheco/my-app
/fact-check is postgres faster than mysql for writes
```

## How It Works

1. Reads the input in full — an `html-research` report is read through its `REPORT` object,
   a URL is fetched, a path is read from disk.
2. Splits it into checkable claims, `F1` upward, each restated as a yes/no question.
   Opinions and recommendations are dropped, compound sentences are split.
3. Researches each fact on the web and collects evidence for **and** against it before ruling.
4. Rules `true`, `false`, `partly` or `unverifiable`. No source means `unverifiable`, never `true`.
5. Cross-checks facts against each other — two facts that cannot both be true are flagged on both.
6. Triple checks True and False: does the source say this, is it the current primary source,
   does the opposite argument hold. Each pass is recorded on the card.
7. Fills `templates/verdict-template.html`, validates it, and opens it in Chrome.

## Output

One HTML file in `/Users/diegopacheco/git/diegopacheco/html-research/`, named
`fact-check-{slug}-{MM-yyyy}.html`, opened in Chrome.

The report has a scoreboard of the four verdicts that filters the page when clicked, one search
box over every fact, source and file, and one clickable card per fact opening a modal with the
claim, where it came from, the evidence for and against, the three checks, related fact ids and
the sources.

## Dependency

Follows the [html-research](../html-research) report contract: one file, everything inline, light
theme, searchable, card based, embedded favicon, a clickable source for every claim. The verdict
template and validator here are the fact-check variant of it and ship with this skill, so
`/fact-check` runs whether or not `html-research` is installed. When both are installed and the
input is an `html-research` report, the `REPORT` object is read directly instead of the rendered
text.

## Layout

- `SKILL.md` — the workflow and rules
- `command.md` — the `/fact-check` command, installed into both tools
- `templates/verdict-template.html` — the report shell, filled by editing its `FACTCHECK` object
- `scripts/check_report.py` — fails the report on external assets, dark theme, missing favicon,
  missing search, gaps or duplicates in the `F1..Fn` ids, unknown verdicts, facts missing a
  claim, verdict line, origin, confidence, sources or triple check, and any fact ruled true
  without a source
- `scripts/open_report.sh` — opens the report in Chrome
