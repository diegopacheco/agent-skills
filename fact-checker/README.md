# fact-checker

Adversarially checks every claim in a report, a URL, a file or a prompt, and renders one
self-contained light-theme HTML verdict report.

Each claim becomes a numbered fact — `F1: is Google just a search engine?`,
`F2: are LLMs only text?` — is researched on the web for and against, and lands in one of four
groups: ✅ True, ❌ False, ⚠️ Partly True, ❓ Unverifiable. Feed it several claims at once and
each one gets its own card and its own icon. True and False are triple checked before the report
is written.

The report shows the claim exactly as it was written, the icon in front of it, and one short
plain sentence saying why it is true or why it is not.

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
2. Splits it into the claims it actually makes, `F1` upward, each restated as a yes/no question.
   Opinions and recommendations are dropped, compound sentences are split. Nothing is added:
   one typed question is one fact, and a claim the input never made never becomes a card.
3. Researches each fact on the web and collects evidence for **and** against it before ruling.
4. Rules `true`, `false`, `partly` or `unverifiable`. No source means `unverifiable`, never `true`.
   Each ruling carries one plain sentence, under 30 words, saying why.
5. Writes a **How it works** section on every false or partly true card, right above the sources:
   plain text saying how the thing really works, the sum behind any number the claim turns on,
   plus a diagram when the mechanism has steps.
6. Cross-checks facts against each other — two facts that cannot both be true are flagged on both.
7. Triple checks True and False: does the source say this, is it the current primary source,
   does the opposite argument hold. Each pass is recorded on the card.
8. Fills `templates/verdict-template.html`, validates it, and opens it in Chrome.

## Output

One HTML file in `/Users/diegopacheco/git/diegopacheco/html-research/`, named
`fact-check-{slug}-{MM-yyyy}.html`, opened in Chrome.

The report opens with the summary — a one line score and 3 to 5 bullets — then a scoreboard of
the four verdicts that filters the page when clicked, then one search box over every claim,
reason, source and file. Each card shows the original claim with its ✅ ❌ ⚠️ ❓ icon and the
plain reason, and opens a modal with where the claim came from, the evidence for and against,
the three checks, related claim ids, how it really works when the claim is false or partly true,
and the sources.

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
  missing search, a missing summary or headline, gaps or duplicates in the `F1..Fn` ids, unknown
  verdicts, facts missing the original claim, the question, the reason, origin, confidence,
  sources or triple check, a reason over 30 words or one that restates the verdict, any fact
  ruled true without a source, and any fact ruled false or partly true without a How it works
  section
- `scripts/open_report.sh` — opens the report in Chrome
