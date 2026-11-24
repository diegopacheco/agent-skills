---
name: feature-flags-catalog
description: Scans a codebase for feature flags on the frontend and the backend - LaunchDarkly, Optimizely, FF4J, Togglz, Unleash, OpenFeature, Split, Flagsmith, GrowthBook, ConfigCat, Statsig, PostHog, Flipt, DevCycle, Eppo, Harness, Firebase Remote Config, Azure App Configuration, Django Waffle, Spring properties, env vars, config files and Cargo features - and renders a searchable light and dark website with total, used and unused flags per side plus step by step suggestions to delete each dead flag safely. Works for Java 8 to 25, Scala 2 and 3, Kotlin 2.x, Go, Rust edition 2024, Python 3 and Node.js or Bun with JS or TS. Use when the user runs /feature-flags-catalog or asks to list, map, audit, clean up or delete feature flags, toggles or dead flags.
allowed-tools: [Bash, Read, Write, Glob, Grep, AskUserQuestion]
---

# Feature Flags Catalog

Find every feature flag in a repository, split it into front and back, tell used from unused, and
give a safe deletion plan per flag. A script does the scan so the result is the same on every run.
You review what the script cannot decide, then render the site.

## Progressive disclosure

Read files from this skill only when the step needs them:

| When | Read |
|---|---|
| Always | this file |
| After step 1, once per language the scan printed | the matching file in `languages/` |
| Step 3, only when there are dynamic reads, ghost flags or test-only flags | [playbook.md](playbook.md) |

| Scan language | File |
|---|---|
| `java` | [languages/java.md](languages/java.md) |
| `kt`, `kts` | [languages/kotlin.md](languages/kotlin.md) |
| `scala`, `sc` | [languages/scala.md](languages/scala.md) |
| `go` | [languages/go.md](languages/go.md) |
| `rs` | [languages/rust.md](languages/rust.md) |
| `py` | [languages/python.md](languages/python.md) |
| `js`, `mjs`, `cjs`, `ts`, `tsx`, `jsx`, `vue`, `svelte` | [languages/node.md](languages/node.md) |

Never load a language file for a language the scan did not print.

## Steps

1. Scan. `SKILL_DIR` is the directory of this file.

   ```bash
   node "$SKILL_DIR/scripts/catalog.mjs" scan <repo> --out <tmp-dir>
   ```

   * `<tmp-dir>` is a new folder under the system temp dir, never inside the scanned repo.
   * Front and back come from folder names (`ui`, `web`, `frontend`, `client`, `bff` are front;
     `backend`, `server`, `api`, `service` are back). When the repo uses other names, pass
     `--front dir1,dir2 --back dir3`. Ask the user with AskUserQuestion when you cannot tell.
   * When the user gives evaluation logs, add `--eval-log back:<path>` or `--eval-log front:<path>`
     for each one. A path can be a file or a folder of logs.
   * When the user gives a flag export from a provider (LaunchDarkly, Unleash, Flagsmith JSON or
     YAML), add `--export <file>`. Without it, flags that only exist in a SaaS provider and no code
     reads cannot be found.
   * The script prints the languages, the counts per side, the providers and the dynamic reads.

2. Read the language files for the languages printed, and nothing else.

3. Review what regex cannot settle. Open `<tmp-dir>/flags.json`:
   * every entry in `dynamics`: read the code at `file:line`, find every value the key can take;
   * every flag with status `ghost`, `maybe-dynamic` or `test-only`;
   * any flag where the language file lists a known false positive.

   Write `<tmp-dir>/review.json` as a list of `{ "side": "front|back", "name": "...", "status": "used|unused|ghost|test-only|maybe-dynamic", "note": "why, with file:line" }`.
   Only add entries you checked in the code. Leave the rest to the scan.

4. Render and open:

   ```bash
   node "$SKILL_DIR/scripts/catalog.mjs" render <tmp-dir>
   open <tmp-dir>/index.html
   ```

5. Reply in 5-10 lines: total, used and unused per side, the top 3 suggestions, and the full path of
   `index.html`.

## The site

* Tabs: Total flags (map per side, providers, every flag), Used (front and back), Unused (front and
  back), Suggestions (ordered by priority, with steps).
* One search box filters every tab. A switch toggles light and dark, and the choice is remembered.
* Click a flag to see every declaration and every read with `file:line`.

## Hard rules

* Never change, delete or commit anything in the scanned repository. The skill only reports.
* Never call a flag provider API or any network service. Exports and logs come from the user.
* Never mark a flag unused when a dynamic read could build its name. Mark it `maybe-dynamic`.
* Every suggestion follows the playbook order: log first, wait 3 weeks, delete the code path, then
  the declaration, then the flag in the provider.
* Report what the scan could not see: SaaS flags with no export, flags read through reflection or
  generated code, flags in repos that were not scanned.
