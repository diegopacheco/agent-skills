const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { tempDir, sh, makeRepo, nightRun, parseExports, result } = require("./helpers");

function start(repo, home, agent) {
  const out = nightRun(repo, home, ["start", agent]);
  assert.equal(out.status, 0, out.stderr);
  return parseExports(out.stdout);
}

test("start isolates the agent in a worktree so the user's checkout never moves", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "code-digger-agent");
  assert.equal(sh(repo, "git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim(), "main");
  assert.equal(sh(run.WORKTREE, "git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim(), run.BRANCH);
  assert.match(run.BRANCH, /^night-agents\/code-digger-agent\/\d{4}-\d{2}-\d{2}-\d{6}$/);
  assert.match(run.RUN_DIR, new RegExp(`${home}/runs/\\d{4}-\\d{2}-\\d{2}/shop/code-digger-agent-\\d{6}$`));
  const meta = JSON.parse(fs.readFileSync(path.join(run.RUN_DIR, "run.json"), "utf8"));
  assert.equal(meta.baseSha, sh(repo, "git", ["rev-parse", "HEAD"]).trim());
});

test("start refuses unknown agents so runs never land under a typo", () => {
  const out = nightRun(makeRepo(), tempDir("home"), ["start", "dead-coder"]);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /unknown agent dead-coder/);
});

test("a failed start leaves no run folder behind so the ui never shows a ghost run", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  sh(repo, "git", ["branch", "night-agents"]);
  const out = nightRun(repo, home, ["start", "bug-hunter"]);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /cannot lock ref/);
  assert.match(out.stderr, /nothing was created/);
  const runs = path.join(home, "runs");
  const leftovers = fs.existsSync(runs) ? fs.readdirSync(runs, { recursive: true }).filter((p) => p.endsWith("run.json") || p.endsWith("worktree.log")) : [];
  assert.deepEqual(leftovers, []);
});

test("finish records the real git stats, removes the worktree, keeps the branch and regenerates the ui", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "code-digger-agent");
  fs.writeFileSync(path.join(run.WORKTREE, "cart.js"), "function total(items) {\n  return items.length;\n}\nmodule.exports = { total };\nconst a = 1;\nconst b = 2;\n");
  sh(run.WORKTREE, "git", ["commit", "-q", "-am", "shop: code-digger-agent: change"]);
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(result()));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.equal(out.status, 0, out.stderr);
  const stats = JSON.parse(fs.readFileSync(path.join(run.RUN_DIR, "git.json"), "utf8"));
  assert.deepEqual([stats.commits, stats.linesAdded, stats.linesRemoved, stats.filesChanged, stats.branchKept], [1, 2, 0, 1, true]);
  assert.equal(fs.existsSync(run.WORKTREE), false);
  assert.equal(sh(repo, "git", ["branch", "--list", run.BRANCH]).trim().replace("+ ", "").replace("* ", ""), run.BRANCH);
  const js = fs.readFileSync(path.join(home, "ui", "data.js"), "utf8");
  assert.match(js, /code-digger-agent/);
  assert.ok(fs.existsSync(path.join(home, "ui", "index.html")));
});

test("finish deletes a branch with no commits so empty nights leave no clutter", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "bug-hunter");
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(result({ status: "no-findings", findings: [], metrics: {} })));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(sh(repo, "git", ["branch", "--list", run.BRANCH]).trim(), "");
  assert.equal(JSON.parse(fs.readFileSync(path.join(run.RUN_DIR, "git.json"), "utf8")).branchKept, false);
});

test("finish fails loud on an invalid result and leaves the worktree for the agent to fix", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "bug-hunter");
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(result({ status: "done" })));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /status must be one of/);
  assert.ok(fs.existsSync(run.WORKTREE));
  assert.equal(fs.existsSync(path.join(run.RUN_DIR, "git.json")), false);
});

test("finish refuses uncommitted work so nothing an agent did is silently thrown away", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "worm-doccer");
  fs.writeFileSync(path.join(run.WORKTREE, "README.md"), "# shop\n");
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(result()));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /uncommitted changes/);
  assert.ok(fs.existsSync(path.join(run.WORKTREE, "README.md")));
});

test("finish refuses a report only run that changed code, so a review never ships an unreviewed fix", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "smith-sec-agent");
  fs.writeFileSync(path.join(run.WORKTREE, "cart.js"), "module.exports = {};\n");
  fs.writeFileSync(path.join(run.WORKTREE, "security-report.md"), "## S1: secret in code\n");
  sh(run.WORKTREE, "git", ["add", "."]);
  sh(run.WORKTREE, "git", ["commit", "-q", "-m", "shop: smith-sec-agent: report and change"]);
  const reported = result({ findings: [{ ...result().findings[0], action: "reported" }] });
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(reported));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /revert the change to cart.js/);
  assert.ok(fs.existsSync(run.WORKTREE));
});

test("finish keeps a report only branch that only adds its findings document", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "architect-agent");
  fs.mkdirSync(path.join(run.WORKTREE, ".night-agents"));
  fs.writeFileSync(path.join(run.WORKTREE, "architecture-review.md"), "## A1: routes talk to the database\n");
  fs.writeFileSync(path.join(run.WORKTREE, ".night-agents", "architect-agent.md"), "# report\n");
  sh(run.WORKTREE, "git", ["add", "."]);
  sh(run.WORKTREE, "git", ["commit", "-q", "-m", "shop: architect-agent: document findings"]);
  const reported = result({ findings: [{ ...result().findings[0], kind: "separation-of-concerns", action: "reported" }] });
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(reported));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(run.RUN_DIR, "git.json"), "utf8")).branchKept, true);
});

test("the code review agent fixes code and documents its review in the same branch", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "code-review-agent");
  fs.writeFileSync(path.join(run.WORKTREE, "cart.js"), "function total(items) {\n  return items.reduce((s, i) => s + i.price, 0);\n}\nmodule.exports = { total };\n");
  fs.writeFileSync(path.join(run.WORKTREE, "code-review.md"), "## R1: total counts items instead of adding prices\n");
  sh(run.WORKTREE, "git", ["add", "."]);
  sh(run.WORKTREE, "git", ["commit", "-q", "-m", "shop: code-review-agent: fix total and document review"]);
  const findings = [{ ...result().findings[0], kind: "bug", action: "fixed" }, { ...result().findings[0], id: "R2", kind: "design", action: "reported" }];
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(result({ findings })));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(run.RUN_DIR, "git.json"), "utf8")).filesChanged, 2);
});

test("a test review that deletes a bogus test finishes, fewer passing tests is not a regression", () => {
  const repo = makeRepo();
  const home = tempDir("home");
  const run = start(repo, home, "test-review-agent");
  fs.writeFileSync(path.join(run.WORKTREE, "test-review.md"), "## T1: test asserts [].length is 0, tests the language\n");
  sh(run.WORKTREE, "git", ["add", "."]);
  sh(run.WORKTREE, "git", ["commit", "-q", "-m", "shop: test-review-agent: delete language test"]);
  const deleted = result({ testsBefore: { command: "npm test", passed: 4, failed: 0 }, testsAfter: { command: "npm test", passed: 3, failed: 0 } });
  fs.writeFileSync(path.join(run.RUN_DIR, "result.json"), JSON.stringify(deleted));
  const out = nightRun(repo, home, ["finish", run.RUN_DIR]);
  assert.equal(out.status, 0, out.stderr);
});
