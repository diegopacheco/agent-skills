---
name: prompt-enrich
description: Takes a short or vague prompt and returns a richer, stronger prompt for a coding agent - a clear goal and deliverable, a quality bar, a full scope inventory, mandatory requirements, anti-patterns, trade-offs, autonomy, a real verification loop with named failure modes, a definition of done and a response format. Use when the user runs /prompt-enrich or $prompt-enrich, or asks to enrich, improve, expand, strengthen or rewrite a prompt.
allowed-tools: [Read, AskUserQuestion]
---

# Prompt Enrich

Turn the user's prompt into a better prompt and give it back. Do not execute the prompt. Only rewrite it.

`SKILL_DIR` below is the folder this file lives in. `SKILL_DIR/references/sample.md` holds the reference prompt these rules were extracted from, with every sentence mapped to its category. Read it before the first enrichment in a session.

## Inputs
* The prompt to enrich: the text after `/prompt-enrich`, a quoted block, or a file path the user gave.
* If there is no prompt, ask for it with AskUserQuestion.
* If the goal itself is unclear (you cannot tell what is being built or changed), ask one question with AskUserQuestion. Otherwise never ask: infer and list the assumptions.

## Categories
An enriched prompt covers these 14 categories, in this order. Skip a category only when it truly does not apply to the task.

| # | Category | What it answers |
|---|---|---|
| 1 | Context hooks | Which of the user's own tools, skills, scripts, repos or docs the agent must use. |
| 2 | Goal and deliverable | What to build or change, for whom, in which medium, as which artifact. |
| 3 | Quality bar | The style and the level of polish, stated as "X, not Y". |
| 4 | Scope inventory | Every part the result must contain, named one by one. |
| 5 | Starting point | From scratch or on top of existing code; what must not be reused or must be reused. |
| 6 | Resource policy | What the agent may create itself and what it may take from trusted libraries or assets. |
| 7 | Mandatory requirements | Hard, checkable constraints, introduced with "Mandatory requirements:". |
| 8 | Behavior and feel | How the result must behave in use: speed, motion, responsiveness, correctness under load. |
| 9 | Anti-patterns | What must not be delivered, said plainly with "Do not". |
| 10 | Trade-offs | Which two forces to balance and how far each may give. |
| 11 | Autonomy | The agent picks the tools, libraries and techniques itself and does not wait. |
| 12 | Verification loop | Run the real thing, collect evidence, fix every issue, with the failure modes named. |
| 13 | Definition of done | The final checks that must all pass before the agent stops. |
| 14 | Response format | How the agent reports at the end, and progress reporting while it works. |

## Techniques
Apply these when writing each category.

1. **Name the medium and the artifact.** "One standalone HTML file", "a Rust CLI with a `Cargo.toml`", "a REST service with a `Containerfile`". Never leave the output form open.
2. **Contrast the bar.** Pair what you want with what you do not want: "cinematic and stylized rather than photorealistic", "a premium result, not a prototype".
3. **Stack quality words once.** One sentence with 3-5 strong words ("rich, detailed, polished, sophisticated") sets the bar. Do not repeat them across the prompt.
4. **Enumerate, do not summarize.** Replace "make it detailed" with the list of parts: "hull, masts, sails, rigging, ropes, cannons, railings, lanterns". The agent builds what is named and skips what is not.
5. **Name small details.** Add the small-scale parts that separate good from great: edge cases, empty states, foam, wake, error messages, loading states.
6. **Make constraints checkable.** Every mandatory requirement must be something the agent can verify with a command, a screenshot or a read: "no text of any kind in the scene", "one file", "no console errors".
7. **Close loopholes.** List the forms a constraint can take: "no titles, names, logos, descriptions, credits, labels or control instructions, in any language".
8. **Forbid the lazy path.** Say what a shortcut looks like and ban it: "do not rely on primitive shapes as the finished result", "do not mock the database in integration tests".
9. **State the feel.** Describe behavior in human terms: "natural and smooth, no artificial slow motion", "the ship moves through the water".
10. **Balance, do not maximize.** Name the trade-off and the limit: "balance visual quality and real-time performance without an obvious sacrifice in quality".
11. **Delegate tool choice.** "Automatically use the most appropriate skills, tools, libraries and techniques. Do not wait for me to specify them."
12. **Demand real verification.** The agent must run the result the way a user would, collect evidence (screenshots, console logs, test output, HTTP responses) and fix what it finds.
13. **Name the failure modes.** List the concrete ways this kind of task breaks, so the agent looks for each: black screen, failed asset loading, distorted geometry, broken animation.
14. **End with acceptance checks.** "At the end, verify that ..." followed by the 2-4 checks that matter most.
15. **Set the exit.** Say how short the final reply must be and what it holds.
16. **Keep the user's words.** Every requirement in the original prompt stays, with its meaning unchanged. Enrich around it.

## Verification by domain
Pick the loop that matches the task for category 12 and the failure modes for technique 13.

| Domain | How to verify | Failure modes to name |
|---|---|---|
| Web UI, 3D, games | Open it in a real desktop browser, take screenshots, read the console, click and scroll with real input. | Black or blank screen, failed asset loading, console errors, layout overflow, broken animation, bad camera, low frame rate. |
| Backend, API | Start it, call every endpoint with real requests, run the tests. | Startup errors, wrong status codes, unhandled errors, missing validation, broken migrations, port conflicts. |
| CLI, scripts | Run every command and flag with real input, including bad input. | Wrong exit codes, crashes on bad input, missing help, unquoted paths, platform-only commands. |
| Library | Write and run tests through the public API only. | Wrong edge cases, leaked internals, breaking changes, missing errors. |
| Data, ML | Run the pipeline on real data and check the outputs. | Silent nulls, wrong joins, data leakage, unreproducible runs, wrong units. |
| Docs, content | Check every claim against the source and every link. | Stale facts, broken links, wrong commands, missing steps. |
| Infra, containers | Build and start it from a clean state, then tear it down. | Build failures, missing env vars, wrong ports, data lost on restart, images that do not start. |

## Rules
* Preserve intent. Never drop, weaken or reverse a requirement from the original prompt. Never change the language, stack or medium the user named.
* Enrich, do not invent a different task. Added detail must serve the stated goal.
* When the prompt names a tool, a skill, a repo or a file, keep it in category 1 exactly as written.
* When the user's environment holds instructions (CLAUDE.md, AGENTS.md, skills), do not copy them into the prompt; the agent already reads them. Only point to them in category 1 when the user asked for them.
* Infer sensible defaults for what is missing and list each one under `Assumptions` so the user can change it.
* Plain direct language. Short imperative sentences. No metaphors, no filler, no marketing words.
* Never use the words "demo", "demonstration" or "example" in the enriched prompt.
* Size to the task. A one-line bug fix gets a short enriched prompt; a full product gets the full 14 categories. Never pad.
* Write it as one prompt in the second person, ready to paste, with no headings inside unless the task needs a list of requirements.

## Steps
Report progress as `x/4` while you work, and every 20 seconds if a step takes longer.

1. Read the prompt and `SKILL_DIR/references/sample.md`. Find the goal, the medium and the domain.
2. Map what the prompt already says to the 14 categories. Mark the gaps.
3. Fill each gap with the techniques and the domain table. Keep every original requirement.
4. Check the result: every original requirement is present, every mandatory requirement is checkable, the verification loop names real failure modes, no banned words. Then reply.

## Output
Reply with exactly these three parts and nothing else:

1. `Enriched prompt` in one fenced `text` block, ready to copy.
2. `Assumptions`: one bullet per default you inferred. Write `none` when there are none.
3. `Added`: one line listing the categories you added that the original prompt did not cover.
