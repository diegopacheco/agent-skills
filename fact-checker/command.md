# /fact-check

Usage: `/fact-check <html report | url | path | claim>`

Input:

$ARGUMENTS

If the input is empty, ask what to check and stop.

Use the `fact-checker` skill. Read the input in full, never from memory or from the filename.
Extract every checkable claim as `F1`, `F2`, `F3`... When the input carries several claims, each
one is its own fact with its own id and its own icon. Keep each claim word for word in `original`
and restate it as a yes/no question in `claim` (`F1: is Google just a search engine?`,
`F2: are LLMs only text?`), then research each one on the web and find evidence for AND against
it before ruling.

Rule each fact `true`, `false`, `partly` or `unverifiable`. A fact with no source is
`unverifiable`, never `true`. Flag facts that contradict each other on both cards. Triple-check
the `true` and `false` groups at the end in three passes — does the source say this, is it the
current primary source, does the opposite argument hold — and record each pass on the card.

Render one self-contained light-theme HTML report from `templates/verdict-template.html` into
`/Users/diegopacheco/git/diegopacheco/html-research/fact-check-{input-slug}-{MM-yyyy}.html`:
everything inline, light theme only, fully searchable, one clickable card per claim showing the
original claim with ✅ true, ❌ false, ⚠️ partly true or ❓ unverifiable in front of it and one
short plain sentence saying why, grouped into True / False / Partly True / Unverifiable, a
summary on top with a one line score and 3 to 5 bullets, click-through detail modals, an embedded
data-URI favicon, full file paths or GitHub links where files are involved, a handwritten SVG
diagram only where a mechanism needs one, and a clickable source on every claim.

Be direct. Plain words, short sentences, no preamble, no talking to anyone, no hedging. When a
claim is false, say the one fact that breaks it, not an essay.

Validate with `python3 scripts/check_report.py <report>`, open it with
`bash scripts/open_report.sh <report>`, and print the verdict counts and the full report path as
the last two lines.
