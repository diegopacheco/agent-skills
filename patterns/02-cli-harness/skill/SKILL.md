---
name: calc-harness
description: Calculate through a controlled CLI harness with three modes - pure code arithmetic, English word problems parsed by an LLM and computed by code, and judgement questions answered by an LLM. Use when the user asks to calculate, compute, solve a word problem, or decide something based on a number.
---

# Calc Harness

Never do arithmetic in your head. Every answer comes from the harness CLI in `scripts/` of this skill's base directory.

## Pick the mode

| The user gives | Mode | Command |
|---|---|---|
| A formal expression such as `(17 + 25) * 3 ^ 2` | engineering, code only | `python3 <skill-dir>/scripts/calc_harness.py /calc "<expression>"` |
| Math in words such as `fifteen percent of 240 plus 8` | blended, llm parses and code computes | `python3 <skill-dir>/scripts/calc_harness.py /english "<sentence>"` |
| A judgement such as `is 11 + 11 a legal driving age in Brazil?` | llm, the model decides | `python3 <skill-dir>/scripts/calc_harness.py /ask "<question>"` |

Add `--provider codex` to run the LLM modes through Codex instead of Claude Code. `--model <id>` overrides the model.

## Rules

* Prefer `/calc`. Use `/english` only when the numbers are in words. Use `/ask` only when the answer needs judgement, not arithmetic.
* Copy the output line as printed, including the `[engineering]`, `[blended]` or `[llm]` label, so the user knows what produced it.
* A non zero exit code means the harness refused or failed. Report the error and stop, never compute the value yourself instead.
* `^` means power. Only numbers, parentheses and `+ - * / // % **` are allowed, anything else is refused by the harness.
* Run `python3 <skill-dir>/scripts/calc_harness.py` with no command for the interactive REPL with `/trace`.
