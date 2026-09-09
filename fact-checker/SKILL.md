---
name: fact-checker
description: Adversarially fact-checks every claim in an HTML report, a URL, a file path, or a plain prompt. Extracts each claim as F1, F2, F3..., researches each one on the web, and renders one self-contained light-theme HTML verdict report with searchable clickable cards grouped into True, False, Partly True and Unverifiable. Use when the user runs /fact-check or asks whether something is true, to verify claims, to check a report, or to challenge an analysis.
dependencies: html-research
---

# Fact Checker

Take a set of claims, attack each one, and render one standalone HTML verdict report.

The job is adversarial. You are not summarizing the input, you are trying to break it.

## Dependency

This skill follows the `html-research` report contract: one self-contained light-theme HTML
file, searchable, card based, click-through modals, embedded favicon, a clickable source for
every claim. `templates/verdict-template.html` and `scripts/check_report.py` here are the
fact-check variant of that contract and ship with this skill, so it runs whether or not
`html-research` is installed. When both are installed and the input is an `html-research`
report, read that report's `REPORT` object directly instead of scraping the rendered text.

## Inputs

The input is `$ARGUMENTS`. It is one of:

- a path to an HTML report, markdown file, or source file
- a URL
- a directory or repo path
- a plain claim or question typed by the user

If `$ARGUMENTS` is empty, ask what to check and stop.

Read the input. Never fact-check from the filename or from memory of what the file probably says.

## Output Location

Every report is saved to `/Users/diegopacheco/git/diegopacheco/html-research/`.

Filename: `fact-check-{input-slug}-{MM-yyyy}.html`, lowercase, hyphenated.

## Workflow

1. Read the input in full. For a URL, fetch it. For an `html-research` report, parse its
   `REPORT` object. For a directory, read the real files.
2. Extract every checkable claim into a numbered list: `F1`, `F2`, `F3`, and so on.
   A checkable claim asserts a fact about the world, a number, a capability, a date, a
   mechanism, or a file. Opinions, preferences and recommendations are not claims — skip them.
   Split compound sentences into separate facts. When the user types several claims in one
   prompt, each claim is its own fact with its own id and its own icon. Aim for 8 to 40 facts.
3. Keep every claim twice. `original` is the claim word for word as the input wrote it — this is
   what the card shows next to the ✅ or ❌. `claim` is the same claim restated as a short yes/no
   question: `F1: is Google just a search engine?`, `F2: are LLMs only text?`.
4. Research each fact on the web. Do not rule from memory. For each fact find evidence that
   supports it AND evidence that refutes it before ruling. Prefer primary sources: official
   docs, filings, papers, the vendor's own pricing or status page, the actual source file.
5. Rule each fact into exactly one verdict:
   - `true` — the claim holds as stated
   - `false` — the claim does not hold as stated
   - `partly` — true under a condition, false outside it, or true then and false now
   - `unverifiable` — no public evidence either way. Say plainly what evidence would settle it.
6. Check consistency across facts. If `F4` and `F11` cannot both be true, say so on both cards.
   A report that contradicts itself is a finding, not a detail.
7. Triple-check the `true` and `false` groups at the end, in three passes, and record what each
   pass did in the fact's `checks` list:
   - pass 1: does the source actually say this, in these words, on the page you opened?
   - pass 2: is the source current, and is it the primary source or someone quoting it?
   - pass 3: argue the opposite verdict out loud. If that argument holds, the verdict is `partly`.
8. Write the summary that sits on top of the report: a `headline` giving the count in one line
   (`9 of 14 claims are true.`) and 3 to 5 `summary` bullets — what holds up, what does not and
   why, what could not be settled. Plain words. No preamble.
9. Copy `templates/verdict-template.html` to the output path and fill the `FACTCHECK` object.
10. Draw a diagram only when a fact turns on a mechanism a paragraph cannot carry.
11. Run `python3 scripts/check_report.py <report.html>` and fix everything it reports.
12. Run `bash scripts/open_report.sh <report.html>`.
13. Print the full absolute path of the report as the last line of your answer.

## Hard Rules

- One file. No companion CSS, JS, JSON, images, or fonts. Everything inline.
- No CDN, no external stylesheet, no external script, no web font, no remote image.
  Only `<a href="https://...">` links to sources are allowed to point outside the file.
- Light theme only. Never a dark palette, never a `prefers-color-scheme: dark` block.
- Embedded favicon via a `data:image/svg+xml` `<link rel="icon">`. Keep it under 400 bytes.
- Every fact carries at least one clickable source, and the `sources` list at the bottom is
  mandatory. A fact with no source is `unverifiable`, never `true`.
- Never fabricate a URL, a quote, a number, or a date. If you did not open it, do not cite it.
- Never rule `true` because the claim sounds right. Rule on the source or rule `unverifiable`.
- The verdict is about the claim as written, not about the charitable reading of it.
  A claim that is true only after you fix it is `partly`, and the card says what was fixed.

## Facts

Each fact needs `id`, `original`, `claim`, `verdict`, `verdictLine`, `where`, `confidence`,
`body`, `checks` and `links`. Add `supports`, `refutes`, `tags`, `related` and `files` where
they apply.

- `id` — `F1` upward, no gaps, no reuse.
- `original` — the claim word for word as the input wrote it. Never paraphrase it, never fix its
  grammar. If the input is long prose, take the one sentence that carries the claim. The card
  shows this line with ✅ ❌ ⚠️ or ❓ in front of it.
- `claim` — the same claim as a yes/no question. One line, plain, no hedging.
- `verdictLine` — the reason only, in plain words, under 30 words. Do not write the verdict word,
  the card already prints **True.** / **Not true.** / **Partly true.** / **Cannot tell.** in
  front of it. When the claim is not true, this line says why it is not, in one short sentence a
  reader gets on the first pass. Give the fact that breaks it, not an argument about it.
- `where` — where the claim appears: quoted text, a card title, a line, or a full file path.
- `confidence` — `high`, `medium` or `low`, based on source quality, not on how sure you feel.
- `body` — two to four `{h, p}` blocks: what the claim says, what the evidence says, what
  the difference is.
- `supports` / `refutes` — the concrete evidence on each side, one line each, with numbers.
  A `true` fact still lists what argues against it when something does.
- `checks` — the three triple-check passes, one line each, saying what the pass found.
- `related` — ids of facts this one depends on or contradicts, like `["F4", "F11"]`.

## Summary

`headline` is one line with the score: `9 of 14 claims are true.`
`summary` is 3 to 5 bullets, one sentence each, in this order: what holds up, what is wrong and
why, what could not be settled. It sits at the top of the report, above the search box, so it
has to read on its own without opening a single card.

## Style

Direct. No preamble, no summary of what you are about to do, no addressing anyone.
Never open with "Great question" or "In this report". State the verdict, then the evidence.
Short sentences, plain words, no jargon, no hedging, no long prose. Say the thing and stop.
Concrete numbers, dates, versions and names beat adjectives.
When sources disagree, say which one you trust and why in one line.

## Final Answer

Print the counts on one line, then the report path on its own line:

```
16 facts — 7 true, 3 false, 4 partly, 2 unverifiable
/Users/diegopacheco/git/diegopacheco/html-research/fact-check-{slug}-{MM-yyyy}.html
```
