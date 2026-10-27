---
name: log-triage
description: Triage a large log file inside a fixed context budget - a script groups the errors and warnings by signature, counts them, keeps the first and last lines, and returns only a JSON summary that fits the budget. Use when the user asks why something failed, to read, check or triage a log, or points to a log file too big to read whole.
---

# Log Triage

Never read a large log into the context. The script in `scripts/` of this skill's base directory reads it and returns a summary that fits a budget you choose.

## Budget

| Slot | Characters |
|---|---|
| First summary | 4000 |
| One drill-down | 2000 |
| Whole triage | 12000 |

## Steps

1. Run:
   `python3 <skill-dir>/scripts/log_triage.py <file.log> --budget 4000`
2. Read `levels` and the top `groups`. Groups are sorted by count, and numbers, hex values and UUIDs are replaced, so the same error with different ids is one group.
3. If `groups_omitted` is above 0, say so. The summary is partial, not complete.
4. To drill into one group, read only a window around its `first_line`, for example `sed -n '<first_line-10>,<first_line+20>p' <file.log>`, and keep it inside the drill-down slot.
5. Reply with the likely cause, the group counts that support it, and the line numbers.

## Rules

* Never `cat` the whole log, never read more than the slot allows.
* If the script exits non zero, report its stderr. Raise the budget once, never past the whole triage slot.
* Stop drilling when the whole triage budget is spent and report what is still unknown.
