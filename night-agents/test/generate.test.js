const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { validateResult, scanRuns } = require("../bin/generate");
const { tempDir, sh, makeRepo, nightRun, parseExports, result } = require("./helpers");

test("a valid result passes", () => {
  assert.deepEqual(validateResult(result()), []);
});

test("success without a fixed finding is rejected so the ui never shows empty wins", () => {
  const errors = validateResult(result({ findings: [{ ...result().findings[0], action: "reported" }] }));
  assert.ok(errors.some((e) => e.includes("status success needs at least one finding with action fixed")));
});

test("more failures after than before is rejected unless the run admits it failed", () => {
  const worse = { testsAfter: { command: "npm test", passed: 2, failed: 1 } };
  assert.ok(validateResult(result(worse)).some((e) => e.includes("more failures")));
  assert.deepEqual(validateResult(result({ ...worse, status: "failed" })), []);
});

test("estimated test counts are rejected, counts must be whole numbers from the log", () => {
  const errors = validateResult(result({ testsBefore: { command: "npm test", passed: 2.5, failed: 0 } }));
  assert.ok(errors.some((e) => e.includes("testsBefore.passed")));
});

test("findings need a severity and an action the ui knows", () => {
  const errors = validateResult(result({ findings: [{ title: "x", kind: "logic", file: "a.js", severity: "urgent", action: "done" }] }));
  assert.ok(errors.some((e) => e.includes("severity")));
  assert.ok(errors.some((e) => e.includes("action")));
});

test("a branch snapshot survives the branch being deleted after a merge", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = parseExports(nightRun(repo, home, ["start", "bug-hunter"]).stdout);
  fs.writeFileSync(path.join(run.WORKTREE, "cart.js"), "function total(items) {\n  return items.reduce((s, i) => s + i.price, 0);\n}\nmodule.exports = { total };\n");
  sh(run.WORKTREE, "git", ["commit", "-q", "-am", "shop: bug-hunter: fix total"]);
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(result()));
  assert.equal(nightRun(repo, home, ["finish", run.RUN_DIR]).status, 0);
  sh(repo, "git", ["branch", "-D", run.BRANCH]);
  const [loaded] = scanRuns(home);
  assert.equal(loaded.branchData.live, false);
  assert.equal(loaded.branchData.files[0].path, "cart.js");
  assert.match(loaded.branchData.files[0].content, /reduce/);
  assert.match(loaded.branchData.files[0].diff, /^\+.*reduce/m);
});

test("a run without result.json shows as running, a finished one with a broken result as invalid", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = parseExports(nightRun(repo, home, ["start", "presto-performance-agent"]).stdout);
  assert.equal(scanRuns(home)[0].status, "running");
  fs.writeFileSync(path.join(run.RUN_DIR, "git.json"), JSON.stringify({ commits: 0 }));
  assert.equal(scanRuns(home)[0].status, "invalid");
});

test("a report only agent wins by documenting findings, so a reported finding is a success", () => {
  const reported = { findings: [{ ...result().findings[0], kind: "injection", action: "reported" }] };
  assert.deepEqual(validateResult(result(reported), "smith-sec-agent"), []);
  assert.ok(validateResult(result({ findings: [] }), "architect-agent").some((e) => e.includes("action reported")));
});

test("a report only agent can never claim a fix, it must not change code", () => {
  const errors = validateResult(result(), "architect-agent");
  assert.ok(errors.some((e) => e.includes("architect-agent only documents findings")));
});
