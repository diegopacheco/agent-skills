# /night-agents

Usage: `/night-agents [all | digger | presto | migration | tests | docs | bugs | architect | sec | review | test-review | chief ...]`

Input:

$ARGUMENTS

Use the `night-agents` skill. Read its `SKILL.md` and `~/.night-agents/CONTRACT.md` before doing anything.

* `all` runs the eleven night agents.
* One or more names or aliases run only those agents.
* Empty input: show the eleven agents with their icons and ask which ones to run, then wait.

Every agent runs on its own branch in its own git worktree, records its run under
`~/.night-agents/runs/<yyyy-mm-dd>/<project>/`, and ends with `night-run.sh finish`.
Finish with one line per agent and the UI path.
