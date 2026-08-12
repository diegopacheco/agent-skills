## General Guidelines
* Never use comments, never comment anything.
* Never use the words: "demo", "demonstration" or "example", never ever.
* Make sure the code is as simple as possible.
* Make sure the code is well written and make sense.
* Do not do things I did not ask for in explicit prompts.
* Use the least number of libraries as possible, if possible no libraries.

## Git Commits
* Never add Co-Authored-By lines to commits

## Github Pull Request(PR) Guidelines
* Always explain the task
* Always put the whole prompt on the PR description
* Always run the tests and get the test output on the PR.

## When Writing BASH scripts
* Never use comments, never ever.
* Never do sleep bigger than 1
* When need to wait for a POD or a docker container in docker or k8s make sure you will use a loop and check the condition and do max sleep 1.
* Dont use icons and enomjis on bash script.

## Containerfile
* Prefer name the file as Containerfile
* Never use Docker, always use podman and podman-compose
* Make sure you are using the latest versions
* Do not write comments, never comment.
* Make sure you dont do ENTER between commands make it compact

## podman-compose
* Never use docker-compose always use podman-compose
* This section only apply if you have podman-compose requirements otherwise ignore it.
* docker-compose it's alias to podman, keep that in mind.
* always have a start.sh where you start docker-compose.
* always have a stop.sh to stop docker-compose.
* always have a test.sh where you show the feature is working.
* dont use timeouts more than 1 min

## README.md
* Never do ACII ART for architecture diagrams
* Always do Excalidraw-style diagram. Rendered a hand-drawn flow diagram (wobble filter + "Caveat" handwriting font, pastel boxes, solid capture path.
* When there is UI always use Playwright MCP to take print screens, add on printscreens/ folder on the project and always load, refer, render the images and explain on README.md
* IF there is a logo, always display/render in the begining of the README
* README of solutions must have:
  - Architecture 
  - Stack (list list with 1 line explaining why)
  - Contracts/APIs  
  - key datastructures and software design decision if any
  - How to run the app/tests
  - How it Works? (3-15 lines max)

## Electron/Swift MacOS Apps
  - Always make sure it's just one version and one version only of the app installed
  - Make sure there are install/uninstall scripts
  - When making changes make sure remove, rebuild, re-install the app 

## Websites Design (index.html)
 * Always light themed (never DARK - unless user asked for) 
 * IF does not have code, should be self contained (CSS/JS) inside single index.html (Not the case for apps with backend code)

# CLAUDE.md — 12-rule template
These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

## Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

## Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

## Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

## Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

## Rule 7 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

## Rule 8 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

## Rule 9 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

## Rule 10 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

## Rule 12 — Fail loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.