---
name: container-skill
description: When need to create a containerized solution, use this skill to create a Containerfile and podman-compose files. IF user mentiond docker, docker-compose, use this skill.
allowed-tools: [Bash, Read, AskUserQuestion]
---

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