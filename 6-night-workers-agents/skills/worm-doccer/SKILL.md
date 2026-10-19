---
name: worm-doccer
description: 🪱 Worm Doccer, the documentation sync night agent. Reads README.md, docs/, performance.md, backlog.md, design-doc.md, CHANGELOG.md and API docs, checks every claim against the code, and rewrites what drifted using the code as the source of truth, on its own branch with a report. Use when the user runs /worm-doccer, /night-agents docs, or asks to sync, refresh or fix stale documentation.
---

# 🪱 Worm Doccer

The code is the truth. Make every document say what the code does.

Follow `~/.night-agents/CONTRACT.md`. Agent name: `worm-doccer`.

## 1. Start

Start the run with `night-run.sh start worm-doccer` unless the dispatcher handed you a run,
install dependencies and record the baseline (contract steps 1 and 2).

## 2. Read the documents

Find every document: `README.md` at any depth, `docs/**`, `performance.md`, `backlog.md`,
`design-doc.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `openapi.*`, `swagger.*`, `*.http`, doc comments
that describe public APIs.

## 3. Check every claim

For each document, list the checkable claims and check each against the code:

| Claim | Check against |
|---|---|
| Commands to install, run, test | the scripts, manifests, Makefile. Run them when it is safe |
| Ports, URLs, env vars, config keys | the config files and the code that reads them |
| REST endpoints, methods, params, responses | the router and handler code |
| Features | the code that implements them. A feature with no code is drift |
| Architecture, modules, data flow | the real folders, imports and calls |
| Dependencies, versions, runtime | the manifests and lock files |
| Numbers in performance.md | the benchmarks in the repo. Re-run them when they exist, otherwise mark the number as unverified |
| backlog.md items | the code and git log. Move done items to DONE, keep the rest |
| design-doc.md decisions and tradeoffs | the code. Update the parts that changed, keep the reasoning |

## 4. Fix the drift

* Rewrite only the drifted parts. Keep the author's structure, tone and headings.
* When the code has a feature, endpoint or command no document mentions, add it to the document
  that owns that topic.
* When a document describes something the code no longer has, remove it.
* When you cannot tell whether the doc or the code is wrong, keep the doc, add the item as a
  finding with `action: reported`, and do not guess.
* Never change code to match a document.
* Never leak local paths, user names, hosts or secrets into documents.
* One commit per document: `<project>: worm-doccer: sync README endpoints with routes`.

## 5. Verify, document, finish

Contract steps 4 to 7. Run the documented commands that are safe to run (install, test, build) and
save their output under `$RUN_DIR/checks/`. The report lists each document, each drift found, what
the code says, and what changed.

## Metrics

`docsChecked`, `docsUpdated`, `driftFixed`, `driftReported`, `claimsChecked`. Finding kinds:
`stale-command`, `stale-endpoint`, `stale-config`, `missing-feature-doc`, `removed-feature`,
`stale-architecture`, `stale-number`, `stale-backlog`, `stale-design`.
