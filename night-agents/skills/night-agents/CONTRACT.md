# Night Agents Contract

Every night agent follows this contract. It is installed at `~/.night-agents/CONTRACT.md`.
The helper is `~/.night-agents/bin/night-run.sh`. When the helper is missing, stop and tell the
user to run `install.sh` from the night agents project.

## 1. Start

Run from inside the target git repository:

```bash
eval "$(~/.night-agents/bin/night-run.sh start <agent-name>)"
```

This creates, from the last commit of the current branch:

| Variable | What it is |
|---|---|
| `$RUN_DIR` | `~/.night-agents/runs/<yyyy-mm-dd>/<project>/<agent>-<hhmmss>/`, where every run artifact goes |
| `$WORKTREE` | a git worktree of the repo on the new branch. All edits, installs and test runs happen here |
| `$BRANCH` | `night-agents/<agent>/<yyyy-mm-dd>-<hhmmss>` |
| `$BASE_BRANCH`, `$BASE_SHA` | the branch and commit the work starts from |
| `$PROJECT`, `$REPO` | the repo folder name and the repo root |

When the dispatcher already started the run and handed you these values, use them and do not start
a second run. Shell variables do not survive between tool calls: keep the values and use the literal
paths in every later command.

Never edit the user's working copy at `$REPO`. Never checkout another branch there. Uncommitted
changes in `$REPO` are not part of the run, say so in the report when `git -C $REPO status` shows any.

## 2. Baseline

1. Install dependencies inside `$WORKTREE` the way the project does it: `scripts/setup.sh`,
   `npm ci`/`npm install`, `mvn -q -DskipTests install`, `pip install -r requirements.txt`,
   `go mod download`, `cargo fetch`. Read the README and the build files, never guess.
2. Find the real test command: `scripts/test-all.sh`, `npm test`, `mvn test`, `gradle test`,
   `pytest`, `go test ./...`, `cargo test`. Use the one the project documents.
3. Run it and save the full output: `<test command> > $RUN_DIR/tests-before.log 2>&1`.
4. Count passed, failed and skipped tests from the real output. Never estimate.
5. When the baseline already fails, record which tests fail. You may continue, but the run must
   never add a failure. `migration-bot-agent` stops on a red baseline.
6. When the project has no tests and no test runner, say so, record `0/0`, and only make changes
   you can verify another way (a script you ran, a benchmark you ran).

## 3. Work

* Work only in `$WORKTREE`, on `$BRANCH`.
* Small commits, one logical change per commit. Message: `<project>: <agent>: <what changed>`,
  2-3 lines max. Never add `Co-Authored-By` lines.
* Never push. Never rebase. Never merge into `$BASE_BRANCH`. Never delete or force move other branches.
* Never change behavior outside the agent's job. Match the code style around the change.
* Follow the rules in the user's and the repository's `CLAUDE.md` and `AGENTS.md`.
* Use the fewest new libraries possible, ideally none.
* Every change must be proven: a test, a benchmark, or a command output saved under `$RUN_DIR`.
* Report progress as `x/y` (finished steps / planned steps) at least once a minute.

## 4. Verify

1. Run the same test command again: `<test command> > $RUN_DIR/tests-after.log 2>&1`.
2. When a test that passed before now fails, find the commit that broke it, `git revert` it
   (no history rewrite), and run the tests again. Never weaken or delete a test to make it pass.
3. Loop until the after run has no failure the before run did not have.

## 5. Document

1. Write `$RUN_DIR/report.md`: what was found, what was changed and why, how it was proven,
   before and after test numbers, what was left out and why.
2. Commit the same report on the branch as `.night-agents/<agent>-<yyyy-mm-dd>.md` so the branch
   explains itself.
3. Write `$RUN_DIR/result.json`:

```json
{
  "status": "success",
  "summary": "Removed 7 unused functions and 3 unused imports, suite green.",
  "testsBefore": { "command": "npm test", "passed": 12, "failed": 0, "skipped": 0 },
  "testsAfter": { "command": "npm test", "passed": 14, "failed": 0, "skipped": 0 },
  "findings": [
    {
      "id": "F1",
      "title": "formatLegacyPrice is never called",
      "kind": "unused-function",
      "file": "src/price.js",
      "line": 42,
      "severity": "low",
      "action": "fixed",
      "detail": "No caller in src or tests, no dynamic lookup by name.",
      "before": "",
      "after": ""
    }
  ],
  "metrics": { "removedFunctions": 7, "removedImports": 3 }
}
```

| Field | Rule |
|---|---|
| `status` | `success` when at least one finding was fixed, `no-findings` when nothing needed a change, `failed` when the run could not finish or a regression could not be reverted. Report only agents (`architect-agent`, `smith-sec-agent`) never fix: `success` means at least one finding was `reported` |
| `summary` | one plain sentence |
| `testsBefore`, `testsAfter` | the real command and the real counts from the logs |
| `findings[]` | every finding, fixed or not. `severity`: `low`, `medium`, `high`, `critical`. `action`: `fixed`, `reported`, `skipped`. `file` is relative to the repo root. `line`, `detail`, `before`, `after` are optional |
| `metrics` | flat object of numbers, the agent's own metrics listed in its skill |

## 6. Finish

```bash
~/.night-agents/bin/night-run.sh finish "$RUN_DIR"
```

It validates `result.json`, refuses a report only branch that changed anything besides its findings
document and `.night-agents/`, refuses to finish with uncommitted changes in the worktree, records the
git stats, removes the worktree, keeps the branch (or deletes it when it has no commits), and
regenerates the UI at `~/.night-agents/ui/index.html`. When it fails, fix what it says and run it again.

## 7. Final message

End with these lines, real values only:

```
agent    <agent-name>
status   <status>
branch   <branch or none>
report   <RUN_DIR>/report.md
tests    before <passed>/<failed>  after <passed>/<failed>
```
