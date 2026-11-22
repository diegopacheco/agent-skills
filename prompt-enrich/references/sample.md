# Reference prompt

The prompt the categories and techniques in `SKILL.md` were extracted from. It was written for Claude Code running Claude Opus 5.5.

```text
use my git, scritps readme skills and do this: Create from scratch a fully interactive 3D scene of a pirate ship sailing across a dynamic ocean at sunset. The visual style should be cinematic and stylized rather than photorealistic, while still being exceptionally rich, detailed, polished, and visually sophisticated. Build the ship, ocean, sky, lighting, materials, sails, rigging, cannons, small structural details, sea foam, wake, particles, animation, camera work, composition, atmospheric depth, and color grading. The final result should feel like a premium, high-production 3D artwork, not a prototype, technical demo, or low-quality scene. Start from a completely blank page. Do not reuse or depend on any previous project or scene. You may create the assets yourself or use reliable, trusted, open-source assets and libraries when necessary. Mandatory requirements: No text of any kind may appear anywhere inside the scene. No titles, names, logos, descriptions, credits, labels, or control instructions in any language. Deliver the entire project as one final standalone page file that can be opened directly in a web browser, with assets embedded inside it as much as reasonably possible. The ocean, ship, sails, and camera must all be animated naturally and smoothly. Avoid artificial slow motion or sluggish movement. The ship should feel like it is genuinely moving through the water. Do not rely on primitive geometric shapes as the finished result. Build a visually convincing and detailed pirate ship, including a carefully shaped hull, masts, sails, rigging, ropes, cannons, railings, lanterns, deck structures, and clearly visible small-scale details. Lighting must reveal the ship's geometry and materials clearly. Create a rich sunset atmosphere, deep ocean shading, reflections, convincing sea foam, and a detailed sailing wake behind and around the vessel. Maintain a strong balance between visual quality and real-time performance, preserving smooth interaction and animation without making an obvious sacrifice in quality. Automatically use the most appropriate skills, tools, libraries, techniques, and available assets needed to achieve the best result. Do not wait for me to specify which technologies to use. Actually test the finished result in a desktop web browser. Capture visual screenshots, inspect the browser console for errors, and fix every visible or technical issue you find, including distorted geometry, black screens, failed asset loading, broken animation, poor composition, rendering artifacts, or camera problems. At the end, verify that the final file opens and works directly, that the scene contains no text whatsoever, and that there are no remaining runtime or loading errors. Then finish the task with only a brief response.

progress x/y every 20s
```

## Sentence to category map

| # | Category | Sentence from the prompt | Technique |
|---|---|---|---|
| 1 | Context hooks | "use my git, scripts, readme skills" | Keep the user's words |
| 2 | Goal and deliverable | "a fully interactive 3D scene of a pirate ship sailing across a dynamic ocean at sunset" | Name the medium and the artifact |
| 3 | Quality bar | "cinematic and stylized rather than photorealistic" | Contrast the bar |
| 3 | Quality bar | "exceptionally rich, detailed, polished, and visually sophisticated" | Stack quality words once |
| 3 | Quality bar | "a premium, high-production 3D artwork, not a prototype ... or low-quality scene" | Contrast the bar |
| 4 | Scope inventory | "Build the ship, ocean, sky, lighting, materials, sails, rigging, cannons ..." | Enumerate, do not summarize |
| 4 | Scope inventory | "sea foam, wake, particles ... atmospheric depth, and color grading" | Name small details |
| 5 | Starting point | "Start from a completely blank page. Do not reuse or depend on any previous project" | Close loopholes |
| 6 | Resource policy | "You may create the assets yourself or use reliable, trusted, open-source assets" | Delegate tool choice |
| 7 | Mandatory requirements | "No text of any kind ... No titles, names, logos, descriptions, credits, labels" | Make constraints checkable, close loopholes |
| 7 | Mandatory requirements | "one final standalone page file ... assets embedded inside it" | Name the medium and the artifact |
| 8 | Behavior and feel | "animated naturally and smoothly. Avoid artificial slow motion" | State the feel |
| 8 | Behavior and feel | "The ship should feel like it is genuinely moving through the water" | State the feel |
| 9 | Anti-patterns | "Do not rely on primitive geometric shapes as the finished result" | Forbid the lazy path |
| 4 | Scope inventory | "a carefully shaped hull, masts, sails, rigging, ropes, cannons, railings, lanterns" | Enumerate, do not summarize |
| 3 | Quality bar | "Lighting must reveal the ship's geometry and materials clearly" | Make constraints checkable |
| 10 | Trade-offs | "a strong balance between visual quality and real-time performance" | Balance, do not maximize |
| 11 | Autonomy | "Automatically use the most appropriate skills ... Do not wait for me" | Delegate tool choice |
| 12 | Verification loop | "Actually test the finished result in a desktop web browser. Capture visual screenshots, inspect the browser console" | Demand real verification |
| 12 | Verification loop | "distorted geometry, black screens, failed asset loading, broken animation ..." | Name the failure modes |
| 13 | Definition of done | "verify that the final file opens and works directly, that the scene contains no text ..., no remaining runtime or loading errors" | End with acceptance checks |
| 14 | Response format | "finish the task with only a brief response" | Set the exit |
| 14 | Response format | "progress x/y every 20s" | Set the exit |

## The shape to copy

```text
[context hooks] and do this: [verb] [from scratch | on top of X] [the artifact] [for whom / where].
The style should be [A] rather than [B], while still being [3-5 quality words].
Build [part 1, part 2, ... part N, small details].
The result should feel like [the bar], not [the lazy outcome].
[Starting point]. [Resource policy].
Mandatory requirements: [checkable constraint, with its loopholes closed]. [deliverable form].
[Behavior and feel]. Do not [lazy path].
Maintain a balance between [force A] and [force B] without [the unacceptable cost].
Automatically use the most appropriate skills, tools, libraries and techniques. Do not wait for me to specify them.
Actually [run the result the way a user would]. [Collect evidence] and fix every issue you find, including [failure mode 1, ... N].
At the end, verify that [check 1], [check 2] and [check 3].
Then finish with [response format]. Report progress x/y every 20s.
```
