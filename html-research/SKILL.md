---
name: html-research
description: Research a topic on the web and render one self-contained light-theme HTML report with searchable cards, clickable detail views, handwritten diagrams, file paths or GitHub links, and clickable sources. Use when the user runs /html-research or asks for a research report, a deep dive, a write-up, or how big tech solves a problem.
---

# HTML Research

Turn a topic into one standalone HTML report backed by real web research.

## Inputs

The topic is `$ARGUMENTS`. If it is empty, ask the user what to research and stop.

The topic can be a subject (rate limiting, auth, cloud security), a codebase question, or a mix.
When the topic points at a local project, read the real files. Never invent paths.

## Output Location

Every report is saved to `/Users/diegopacheco/git/diegopacheco/html-research/`.

Filename: `{topic-slug}-{MM-yyyy}.html`, lowercase, hyphenated.

## Workflow

1. Restate the topic in one line and name the angle you will research.
2. Run web research. Do not answer from memory. Use several searches and fetch the strongest pages.
3. If the topic is an engineering matter (rate limiting, auth, caching, sharding, cloud security,
   observability, deploys, feature flags, secrets, queues, and similar), you MUST research how big
   companies actually do it. Cover at least four of: Google, Amazon/AWS, Meta, Netflix, Stripe,
   Microsoft/Azure, GitHub, LinkedIn, Cloudflare, Shopify, Uber, or a relevant AI lab
   (Anthropic, OpenAI, DeepMind). Prefer engineering blogs, official docs, RFCs, papers, and talks.
4. If the topic touches a local repo, collect the real absolute paths. If the file lives in a public
   GitHub repo, also collect its `https://github.com/{org}/{repo}/blob/{ref}/{path}` URL.
5. Copy `templates/report-template.html` to the output path and fill the `REPORT` object.
6. Draw diagrams only where they explain something a paragraph cannot.
7. Run `python3 scripts/check_report.py <report.html>` and fix everything it reports.
8. Run `bash scripts/open_report.sh <report.html>`.
9. Print the full absolute path of the report as the last line of your answer.

## Hard Rules

- One file. No companion CSS, JS, JSON, images, or fonts. Everything inline.
- No CDN, no external stylesheet, no external script, no web font, no remote image.
  Only `<a href="https://...">` links to sources are allowed to point outside the file.
- Light theme only. Never a dark palette, never a `prefers-color-scheme: dark` block,
  never a theme toggle.
- Embedded favicon via a `data:image/svg+xml` `<link rel="icon">`. Keep it under 400 bytes.
- Everything searchable through the single search box. Every finding is a card.
  Cards open a detail modal. Nothing important lives only in the modal-less page body.
- Every factual claim carries a clickable source. `sources` at the bottom is mandatory,
  and each card that makes a claim gets its own `links` entry.
- Files are shown as full absolute paths. Link to GitHub when the file is public.
- Never fabricate a URL. If you did not open it, do not cite it.

## Cards

Group cards so the chips are useful. A good report has 12 to 30 cards across groups such as:

- `Overview` — what the thing is, why it matters, the tradeoff space
- `What The Industry Does` — mandatory, see below
- `Patterns` / `Algorithms` / `Mechanisms` — the actual techniques
- `Failure Modes` — what breaks in production
- `In This Codebase` — real files, real paths, when a repo is involved
- `Recommendations` — what to do, ranked

Set `groupOrder` on the report to the order the sections should render in. `Overview` first,
`What The Industry Does` second.

Each card needs `group`, `title`, `summary`, `tags`, and a `body` of two to five `{h, p}` blocks.
Add `bullets`, `files`, and `links` where they apply. The card teaser is the hook;
the modal carries the substance.

### Pros, cons and gaps are mandatory

Every card carries:

- `pros` — exactly 5 concrete upsides of the thing that card is about
- `cons` — exactly 5 concrete downsides
- `gaps` — 5 to 10 things it does not solve, does not cover, or leaves open

Rules for these three lists:

- One line each, no sub-clauses stacked with semicolons. A pro is a claim, not a paragraph.
- Concrete beats generic. "413k pending pages froze writes" beats "can be slow".
- A con is not a disguised pro. If you cannot find 5 real downsides, you do not understand
  the thing well enough yet — go back to the research.
- Gaps are about the world, not about your report: missing tooling, missing data, unanswered
  questions, things no vendor does yet, measurements nobody published.
- Omit `gaps` only when a card genuinely has none to state. Never omit `pros` or `cons`.

## What The Industry Does

Every report MUST have a `What The Industry Does` group. It answers one question: how do the
companies with the hardest version of this problem actually solve it?

- One card per company or lab, with its concrete approach, real numbers, and its own sources.
- Cover at least 4 of: Google, Amazon/AWS, Meta, Netflix, Stripe, Microsoft/Azure, GitHub,
  LinkedIn, Cloudflare, Shopify, Uber, GitLab, Salesforce.
- Cover at least 1 AI lab or AI-platform angle: Anthropic, OpenAI, DeepMind, or the AI
  platform layer of a cloud vendor, when the topic touches models, agents, search or safety.
- Include one card naming where the public evidence runs out. Say plainly which companies
  publish nothing on this and do not invent coverage for them.
- Vendor docs show the win, incident reports show the cost. Cite both when both exist.

## Diagrams

Use handwritten-style inline SVG. `templates/handwritten-diagram.svg` is the reference: a
`feTurbulence` + `feDisplacementMap` rough filter, a cursive font stack with real fallbacks,
white or `#fbeee8` boxes, `#1c1b19` strokes.

Diagram rules:

- Zero crossing arrows. Zero overlapping boxes. If the layout needs a crossing, split it in two diagrams.
- One flow direction, left to right or top to bottom, never both in one diagram.
- At most 7 boxes. Number the arrows when order matters.
- Set an explicit `viewBox` and leave 20px of margin around the drawing.
- Skip the diagram entirely rather than shipping a tangled one.

## Style

Plain language. No hype, no filler, no "in today's fast-paced world". Short paragraphs.
Concrete numbers, limits, and names beat adjectives. State uncertainty when sources disagree.

## Final Answer

End with the report path on its own line so the user can click it:

`/Users/diegopacheco/git/diegopacheco/html-research/{file}.html`
