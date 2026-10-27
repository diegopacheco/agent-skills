---
name: policy-guard
description: Engineering rules enforced as code outside the model - a PreToolUse hook checks every Bash, Read, Write and Edit call against policy.json and blocks rm -rf, force push, curl piped to a shell, edits to applied migrations and env file access, failing closed when the policy cannot be read. Use when a tool call was blocked by policy, or the user asks what the guardrails are, why something was blocked, or to add, change or test a policy rule.
---

# Policy Guard

The rules live in `policy.json` in this skill's base directory and are enforced by `scripts/policy_guard.py` before every matching tool call. This skill explains them. It does not enforce them, and it cannot turn them off.

## When a call is blocked

1. Read the `blocked by policy <id>: <reason>` message. The reason says what to do instead.
2. Do what the reason says, or ask the user. Never get the same effect another way: no `find -delete` instead of `rm -rf`, no new file copied over a migration, no `cat` of an env file through another tool.
3. If the user wants an exception, tell them to change `policy.json` themselves. Never edit it for them without being asked.

## Changing a rule

A rule has an `id`, the `tools` it applies to, a `reason`, and one of:

| Field | Meaning |
|---|---|
| `deny_command` | Python regex searched in the Bash command |
| `deny_path` | glob matched against the file path, `**/` for any folder |
| `allow_new_files` | with `deny_path`, a `Write` that creates a new file is allowed |

After any change, pipe a sample event into the guard and check the exit code, 2 means blocked:
`echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf build"}}' | python3 <skill-dir>/scripts/policy_guard.py; echo $?`

## Rules

* A policy file that cannot be read or parsed blocks everything. Fix the file, never remove the hook.
