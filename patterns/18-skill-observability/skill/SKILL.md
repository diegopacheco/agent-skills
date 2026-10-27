---
name: skill-trace
description: Answer what the agent actually did from a trace, not from memory - hooks append every tool call to a JSONL file with the skill invoked, the files loaded, the tool, and the start and finish time, and a summary script reports skill runs, files, tool counts, the slowest tools and calls that never finished. Use when the user asks which skills ran, what was loaded, why a session was slow or expensive, or to trace, audit or observe agent activity.
---

# Skill Trace

The trace is written by hooks, outside the model. Report from the trace, never from your recollection of the session.

## What is recorded

| Field | Source |
|---|---|
| `event`, `ts` | PreToolUse or PostToolUse, and the time |
| `session`, `tool`, `id` | session id, tool name, tool call id |
| `skill` | the skill name, when the tool is `Skill` |
| `file` | the file path, when the tool has one |
| `program` | the first word of a Bash command, never the full command |

Full commands, file contents and tool output are never recorded, so secrets in them do not reach the trace.

## Steps

1. Run:
   `python3 <skill-dir>/scripts/trace_summary.py`
   Add `--session <id>` for one session, or a path for a trace other than `~/.skill-trace/trace.jsonl`.
2. Answer from the tables: which skills ran and how often, which files were loaded, which tools were called and the slowest of each.
3. Calls with no finish event are tools that failed, were denied or were interrupted. Point them out.
4. If the trace file is missing, the hooks are not installed. Say so and point to the install section of the README.

## Rules

* Never guess a number that is not in the summary.
* Never add the full command or the tool output to the trace to get more detail.
