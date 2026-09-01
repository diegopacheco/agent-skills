# /html-research

Usage: `/html-research <topic>`

Topic:

$ARGUMENTS

If the topic is empty, ask what to research and stop.

Use the `html-research` skill. Do real web research on the topic, and when it is an engineering
matter also research how big tech does it (Google, Amazon, Meta, Netflix, Stripe, Microsoft/Azure,
GitHub, LinkedIn, Cloudflare, or a relevant AI lab). Render one self-contained light-theme HTML
report from `templates/report-template.html` into
`/Users/diegopacheco/git/diegopacheco/html-research/{topic-slug}-{MM-yyyy}.html`.

The report must be one file with everything inline, light themed, fully searchable, card based with
click-through detail modals, an embedded data-URI favicon, full file paths or GitHub links where
files are involved, handwritten SVG diagrams with no crossing arrows where they help, and a
clickable source for every claim.

Every card carries exactly 5 `pros`, exactly 5 `cons`, and 5 to 10 `gaps`. The report must have a
`What The Industry Does` group covering at least 4 big tech companies plus an AI lab angle, and one
card stating where the public evidence runs out.

Validate with `python3 scripts/check_report.py <report>`, open it with
`bash scripts/open_report.sh <report>`, and print the full report path as the last line.
