---
name: git-gh-skill
description: When need to use git or gh commands, use this skill to create a git or gh commands. IF user mentiond git or gh, use this skill. Also to commit/push/pull/merge code to git or gh, use this skill.
allowed-tools: [Bash, Read, AskUserQuestion]
---

## Git Merge
* always use merge strategy, rebase is not allowed, never use rebase.

## Git Commits
* Never add Co-Authored-By lines to commits
* Add the name of project: $message - make sure is concise and clear. Ideally 2-3 linex max.

## Github Pull Request(PR) Guidelines
* Always explain the task (3-5 lines MAX)
* Always put the whole prompt on the PR description (with proper markdown formatting)
* Always run the tests and get the test output on the PR. (with proper markdown formatting)