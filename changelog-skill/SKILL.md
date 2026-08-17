---
name: changelog-skill
description: When need to create or update a CHANGELOG.md for a project, use this skill to write the changelog entries. IF user mentions CHANGELOG, changelog, or release notes, use this skill.
allowed-tools: [Bash, Read, Edit, Write]
---

## CHANGELOG.md

* Start with `# Changelog` and one line naming what it records, then versions newest first as `## MAJOR.MINOR.PATCH - YYYY-MM-DD`. Keep adding to the top version while it is unreleased; once it ships, leave it alone and open a new one.
* Use only these sections, in this order, and only when they have entries: `### Added`, `### Changed`, `### Fixed`, `### Verified`.
* Every `Fixed` entry says what broke for the user, why it broke, then what happens now - in that order, in plain sentences. "Fixed a bug" is never an entry.
* Write what the user can observe and name only what they touch: shortcuts, buttons, commands, scripts, screens. No commit hashes, no issue numbers, no author names, no source file, class, or function names.
* One bullet per change, never nested. One sentence, or up to three when the cause needs saying. No marketing words.
* `Verified` lists only what was actually run and observed, with real numbers - test counts with zero skips, measured results, checked behavior. Never write a `Verified` line you did not run.
* Read the diff or the commits /code before writing, so entries describe what the code really does and not what the task asked for.