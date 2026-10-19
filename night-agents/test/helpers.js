const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const NIGHT_RUN = path.join(ROOT, "bin", "night-run.sh");

function tempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `night-${name}-`));
}

function sh(cwd, cmd, args) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function makeRepo() {
  const repo = path.join(tempDir("repo"), "shop");
  fs.mkdirSync(repo);
  sh(repo, "git", ["init", "-q", "-b", "main"]);
  sh(repo, "git", ["config", "user.email", "night@agents.local"]);
  sh(repo, "git", ["config", "user.name", "night"]);
  fs.writeFileSync(path.join(repo, "cart.js"), "function total(items) {\n  return items.length;\n}\nmodule.exports = { total };\n");
  sh(repo, "git", ["add", "."]);
  sh(repo, "git", ["commit", "-q", "-m", "shop: init"]);
  return repo;
}

function nightRun(cwd, home, args) {
  return spawnSync("bash", [NIGHT_RUN, ...args], { cwd, encoding: "utf8", env: { ...process.env, NIGHT_AGENTS_HOME: home } });
}

function parseExports(stdout) {
  const values = {};
  for (const line of stdout.split("\n")) {
    const match = /^export (\w+)=(.*)$/.exec(line);
    if (match) values[match[1]] = match[2].replace(/\\(.)/g, "$1").replace(/^'|'$/g, "");
  }
  return values;
}

function result(overrides) {
  return {
    status: "success",
    summary: "Removed one unused function.",
    testsBefore: { command: "npm test", passed: 3, failed: 0, skipped: 0 },
    testsAfter: { command: "npm test", passed: 3, failed: 0, skipped: 0 },
    findings: [{ id: "F1", title: "legacy is never called", kind: "unused-function", file: "cart.js", line: 5, severity: "low", action: "fixed" }],
    metrics: { removedFunctions: 1 },
    ...overrides,
  };
}

module.exports = { ROOT, tempDir, sh, makeRepo, nightRun, parseExports, result };
