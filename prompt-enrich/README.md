# prompt-enrich

A skill for Claude Code and Codex that takes a short or vague prompt and gives back a stronger prompt for a coding agent. It does not run the prompt. It rewrites it so the agent knows the goal, the deliverable, the quality bar, every part to build, the hard constraints, what not to do, how to verify the result and when it is done.

## How it Works?

1. You run `/prompt-enrich <your prompt>` in Claude Code, or `$prompt-enrich <your prompt>` in Codex.
2. The agent reads `SKILL.md` and the reference prompt in `references/sample.md`.
3. It maps what your prompt already says to 14 categories and marks the gaps.
4. It fills each gap with 16 techniques and a verification table per domain (web UI, backend, CLI, library, data, docs, infra), keeping every requirement you wrote.
5. It replies with the enriched prompt in a copyable block, the assumptions it made, and the categories it added.

## Categories

| # | Category | What it answers |
|---|---|---|
| 1 | Context hooks | Which of your tools, skills, scripts or repos to use |
| 2 | Goal and deliverable | What to build, in which medium, as which artifact |
| 3 | Quality bar | Style and polish, stated as "X, not Y" |
| 4 | Scope inventory | Every part, named one by one |
| 5 | Starting point | From scratch or on top of existing code |
| 6 | Resource policy | What to create and what to take from trusted libraries |
| 7 | Mandatory requirements | Hard constraints that can be checked |
| 8 | Behavior and feel | Speed, motion, responsiveness |
| 9 | Anti-patterns | The lazy paths that are banned |
| 10 | Trade-offs | Which forces to balance |
| 11 | Autonomy | The agent picks the tools and does not wait |
| 12 | Verification loop | Run it for real, collect evidence, fix, with failure modes named |
| 13 | Definition of done | The final checks |
| 14 | Response format | Final reply and progress reporting |

## Techniques

Name the medium and the artifact. Contrast the bar. Stack quality words once. Enumerate, do not summarize. Name small details. Make constraints checkable. Close loopholes. Forbid the lazy path. State the feel. Balance, do not maximize. Delegate tool choice. Demand real verification. Name the failure modes. End with acceptance checks. Set the exit. Keep the user's words.

Each one is explained in [SKILL.md](SKILL.md).

## Reference prompt

The categories and techniques were extracted from this prompt, used with:

* Harness: Claude Code
* Model: Claude Opus 5.5 (`claude-opus-5-5`)

```text
use my git, scritps readme skills and do this: Create from scratch a fully interactive 3D scene of a pirate ship sailing across a dynamic ocean at sunset. The visual style should be cinematic and stylized rather than photorealistic, while still being exceptionally rich, detailed, polished, and visually sophisticated. Build the ship, ocean, sky, lighting, materials, sails, rigging, cannons, small structural details, sea foam, wake, particles, animation, camera work, composition, atmospheric depth, and color grading. The final result should feel like a premium, high-production 3D artwork, not a prototype, technical demo, or low-quality scene. Start from a completely blank page. Do not reuse or depend on any previous project or scene. You may create the assets yourself or use reliable, trusted, open-source assets and libraries when necessary. Mandatory requirements: No text of any kind may appear anywhere inside the scene. No titles, names, logos, descriptions, credits, labels, or control instructions in any language. Deliver the entire project as one final standalone page file that can be opened directly in a web browser, with assets embedded inside it as much as reasonably possible. The ocean, ship, sails, and camera must all be animated naturally and smoothly. Avoid artificial slow motion or sluggish movement. The ship should feel like it is genuinely moving through the water. Do not rely on primitive geometric shapes as the finished result. Build a visually convincing and detailed pirate ship, including a carefully shaped hull, masts, sails, rigging, ropes, cannons, railings, lanterns, deck structures, and clearly visible small-scale details. Lighting must reveal the ship's geometry and materials clearly. Create a rich sunset atmosphere, deep ocean shading, reflections, convincing sea foam, and a detailed sailing wake behind and around the vessel. Maintain a strong balance between visual quality and real-time performance, preserving smooth interaction and animation without making an obvious sacrifice in quality. Automatically use the most appropriate skills, tools, libraries, techniques, and available assets needed to achieve the best result. Do not wait for me to specify which technologies to use. Actually test the finished result in a desktop web browser. Capture visual screenshots, inspect the browser console for errors, and fix every visible or technical issue you find, including distorted geometry, black screens, failed asset loading, broken animation, poor composition, rendering artifacts, or camera problems. At the end, verify that the final file opens and works directly, that the scene contains no text whatsoever, and that there are no remaining runtime or loading errors. Then finish the task with only a brief response.

progress x/y every 20s
```

The sentence by sentence map to the categories is in [references/sample.md](references/sample.md).

## Before and after

Written by following `SKILL.md` in Claude Code with Claude Opus 5.5.

Before:

```text
create a REST API for a todo list in Go
```

After:

```text
Create from scratch a REST API for a todo list in Go, as a single Go module with a `go.mod`, ready to build and run. The code should be simple and idiomatic rather than layered and abstract, while still being clean, well structured, tested and production ready. Build create, list, get, update, delete and mark-done endpoints, JSON request and response bodies, input validation, clear error responses with the right status codes, a health endpoint, graceful shutdown, structured logging and a README with how to run it. The result should feel like a small service a senior engineer would ship, not a prototype. Use the Go standard library first and add a library only when it removes real code. Mandatory requirements: every endpoint returns JSON, including errors. Invalid input returns 400 with a message that names the bad field. Unknown ids return 404. The service starts with one command and listens on a port set by an environment variable. Do not use global mutable state without a lock, and do not swallow errors. Maintain a balance between simplicity and completeness without adding features nobody asked for. Automatically use the most appropriate tools and techniques. Do not wait for me to specify them. Actually start the service and call every endpoint with real HTTP requests, including bad input, then run the tests. Fix every issue you find, including startup errors, wrong status codes, unhandled errors, missing validation, data races and port conflicts. At the end, verify that `go build`, `go vet` and `go test -race ./...` pass and that every endpoint answers as documented. Then finish with only a brief response. Report progress x/y every 20s.
```

Assumptions: in-memory storage, standard library `net/http`, port from `PORT`.

## Install

```bash
./install.sh          # asks: 1) Claude 2) Codex 3) Both
./install.sh claude   # ~/.claude/skills/prompt-enrich
./install.sh codex    # ~/.codex/skills/prompt-enrich
./install.sh both
```

## Uninstall

```bash
./uninstall.sh          # asks: 1) Claude 2) Codex 3) Both
./uninstall.sh claude
./uninstall.sh codex
./uninstall.sh both
```

## Test

```bash
./test.sh
```

Installs and uninstalls into temp folders for each target, checks that bad options fail, that the skill name matches its folder, that `SKILL.md` defines 14 categories and that the reference sample maps every one of them.

## Files

| File | What it holds |
|---|---|
| `SKILL.md` | Categories, techniques, verification by domain, rules, steps and output format |
| `references/sample.md` | The reference prompt, the sentence to category map, and the shape to copy |
| `install.sh` / `uninstall.sh` | Install or remove for Claude, Codex or both |
| `test.sh` | Install, uninstall and skill structure checks |
