---
name: trusted-install
description: Install a third-party agent skill only after verifying it - the skill's MANIFEST.sha256 must match the hash the publisher pinned, every file must match its sha256, no file may be missing or unlisted, and every script is read before install. Use when the user asks to install, add, update or vet a skill, a plugin or a skill pack from a marketplace, a repo or a zip.
---

# Trusted Install

A skill is code that runs with the user's permissions. Install it only when its files are exactly the files the publisher signed off.

## Steps

1. Ask the user for the manifest hash the publisher published out of band: a release page, a signed tag, a README in another repo. A manifest that ships only inside the skill proves nothing on its own.
2. Run:
   `python3 <skill-dir>/scripts/skill_manifest.py verify <candidate-skill> --expect <manifest-sha256>`
3. Any `missing`, `unlisted` or `modified` line, or a manifest hash mismatch, means stop. Report the lines and do not install.
4. Read every file under `scripts/` of the candidate and every `allowed-tools` line in its `SKILL.md`. Report anything that sends data over the network, reads credentials, writes outside the project, or asks for broad Bash access.
5. Only after the user approves the report, copy the candidate into `~/.claude/skills/<name>` or `~/.codex/skills/<name>`.

## Publishing your own skill

`python3 <skill-dir>/scripts/skill_manifest.py create <your-skill>` writes `MANIFEST.sha256` and prints its hash. Publish that hash somewhere other than the skill itself.

## Rules

* Never install with `--expect` missing unless the user says they accept an unpinned skill, and say it is unpinned.
* Never fix a failing manifest by regenerating it. A regenerated manifest trusts the tampered files.
* Re-verify on every update. A new version is a new install.
