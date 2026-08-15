---
name: bash-skill
description: When need to create a bash script, use this skill to create a bash script. IF user mentiond bash, shell, sh, use this skill.
allowed-tools: [Bash, Read, AskUserQuestion]
---

## When Writing BASH scripts
* Never use comments, never ever.
* Never do sleep bigger than 1
* When need to wait for a POD or a container in podman/k8s make sure you will use a loop and check the condition and do max sleep 1.
* Dont use icons and enomjis on bash script. Unless user ask for it.
* Dont use timeouts more than 1 min