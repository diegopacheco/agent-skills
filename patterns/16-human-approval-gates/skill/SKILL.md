---
name: prod-deploy
description: Deploy to staging freely and to production only after a human approves the exact command - a PreToolUse hook blocks any production deploy until the user runs approve.py in their own terminal, and each approval works once for 15 minutes. Use when the user asks to deploy, release, ship, roll out, kubectl apply or terraform apply, to staging or production.
---

# Prod Deploy

The hook decides, not you. A production command without a fresh human approval is blocked before it runs.

## Guarded commands

`scripts/approval_gate.py` guards `deploy.sh prod`, `kubectl ... --context prod` and `terraform apply`. Everything else runs as usual.

## Steps

1. Deploy to staging first with `./deploy.sh staging` and show that it is healthy.
2. Write the exact production command, for example `./deploy.sh prod v1.4.2`, and show it to the user with what it changes.
3. Ask the user to approve it in their own terminal, in the project folder:
   `python3 <skill-dir>/scripts/approve.py '<exact command>'`
4. When the user says it is approved, run the command exactly as approved, character for character.
5. Report the result and the health check after the deploy.

## Rules

* Never run `approve.py`, never write into `.approvals/`, never ask the user to paste an approval into the chat. The hook blocks all three.
* A blocked command is not an error to work around. Do not rephrase it, split it or call the deploy tool another way.
* One approval is one run. A retry, a new version or a changed flag needs a new approval.
