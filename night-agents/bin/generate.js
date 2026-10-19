#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const SITE_SRC = path.join(__dirname, "site");
const AGENTS = JSON.parse(fs.readFileSync(path.join(__dirname, "agents.json"), "utf8"));
const STATUSES = ["success", "no-findings", "failed"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const ACTIONS = ["fixed", "reported", "skipped"];
const MAX_FILE_BYTES = 300000;

function nightHome() {
  return process.env.NIGHT_AGENTS_HOME || path.join(os.homedir(), ".night-agents");
}

function readJsonIfExists(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

function readTextIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function validateTests(tests, label, errors) {
  if (!tests || typeof tests !== "object") {
    errors.push(`${label} must be an object with command, passed and failed`);
    return;
  }
  if (typeof tests.command !== "string" || !tests.command.trim()) errors.push(`${label}.command must be the test command that was run`);
  if (!isCount(tests.passed)) errors.push(`${label}.passed must be a non negative integer`);
  if (!isCount(tests.failed)) errors.push(`${label}.failed must be a non negative integer`);
  if (tests.skipped !== undefined && !isCount(tests.skipped)) errors.push(`${label}.skipped must be a non negative integer`);
}

function validateFinding(finding, index, errors) {
  const label = `findings[${index}]`;
  if (!finding || typeof finding !== "object") {
    errors.push(`${label} must be an object`);
    return;
  }
  for (const key of ["title", "kind", "file"]) {
    if (typeof finding[key] !== "string" || !finding[key].trim()) errors.push(`${label}.${key} must be a non empty string`);
  }
  if (!SEVERITIES.includes(finding.severity)) errors.push(`${label}.severity must be one of ${SEVERITIES.join(", ")}`);
  if (!ACTIONS.includes(finding.action)) errors.push(`${label}.action must be one of ${ACTIONS.join(", ")}`);
  if (finding.line !== undefined && !isCount(finding.line)) errors.push(`${label}.line must be a non negative integer`);
}

function agentByName(name) {
  return AGENTS.find((agent) => agent.name === name) || {};
}

function validateResult(result, agentName) {
  const agent = agentByName(agentName);
  const errors = [];
  if (!result || typeof result !== "object") return ["result.json must be a JSON object"];
  if (!STATUSES.includes(result.status)) errors.push(`status must be one of ${STATUSES.join(", ")}`);
  if (typeof result.summary !== "string" || !result.summary.trim()) errors.push("summary must be a non empty sentence");
  validateTests(result.testsBefore, "testsBefore", errors);
  validateTests(result.testsAfter, "testsAfter", errors);
  if (!Array.isArray(result.findings)) errors.push("findings must be an array");
  else result.findings.forEach((finding, index) => validateFinding(finding, index, errors));
  if (!result.metrics || typeof result.metrics !== "object" || Array.isArray(result.metrics)) errors.push("metrics must be an object of numbers");
  else {
    for (const [key, value] of Object.entries(result.metrics)) {
      if (typeof value !== "number" || !Number.isFinite(value)) errors.push(`metrics.${key} must be a finite number`);
    }
  }
  if (errors.length) return errors;
  const fixed = result.findings.filter((finding) => finding.action === "fixed").length;
  if (agent.reportOnly) {
    const reported = result.findings.filter((finding) => finding.action === "reported").length;
    if (fixed > 0) errors.push(`${agent.name} only documents findings, action fixed is not allowed`);
    if (result.status === "success" && reported === 0) errors.push("status success needs at least one finding with action reported");
  } else if (result.status === "success" && fixed === 0) errors.push("status success needs at least one finding with action fixed");
  if (result.status === "no-findings" && fixed > 0) errors.push("status no-findings cannot have findings with action fixed");
  if (result.status !== "failed" && result.testsAfter.failed > result.testsBefore.failed) {
    errors.push("testsAfter has more failures than testsBefore, revert the change or set status failed");
  }
  return errors;
}

function git(repo, args, encoding = "utf8") {
  return execFileSync("git", ["-C", repo, ...args], { encoding, maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
}

function branchHead(repo, branch) {
  if (!repo || !branch || !fs.existsSync(repo)) return null;
  try {
    return git(repo, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`]).trim() || null;
  } catch {
    return null;
  }
}

function parseNameStatus(text) {
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("\t");
      const code = parts[0][0];
      return code === "R" || code === "C" ? { status: code, from: parts[1], path: parts[2] } : { status: code, from: parts[1], path: parts[1] };
    });
}

function readBranchFile(repo, head, file) {
  const buffer = git(repo, ["show", `${head}:${file}`], "buffer");
  if (buffer.includes(0)) return { binary: true, content: "", truncated: false, size: buffer.length };
  const truncated = buffer.length > MAX_FILE_BYTES;
  return { binary: false, content: buffer.subarray(0, MAX_FILE_BYTES).toString("utf8"), truncated, size: buffer.length };
}

function buildBranch(repo, baseSha, head) {
  const commits = git(repo, ["log", "--format=%H%x1f%s%x1f%an%x1f%aI", `${baseSha}..${head}`])
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, subject, author, date] = line.split("\x1f");
      return { sha, subject, author, date };
    });
  const files = parseNameStatus(git(repo, ["diff", "--name-status", "-M", baseSha, head])).map((entry) => {
    const paths = entry.from === entry.path ? [entry.path] : [entry.from, entry.path];
    const diff = git(repo, ["diff", baseSha, head, "--", ...paths]);
    const file = entry.status === "D" ? { binary: false, content: "", truncated: false, size: 0 } : readBranchFile(repo, head, entry.path);
    return { ...entry, ...file, diff: diff.length > MAX_FILE_BYTES ? diff.slice(0, MAX_FILE_BYTES) : diff };
  });
  return { head, commits, files };
}

function changesOutsideReport(run) {
  const agent = agentByName(run.agent);
  if (!agent.reportOnly || !branchHead(run.repo, run.branch)) return [];
  return git(run.repo, ["diff", "--name-only", run.baseSha, run.branch])
    .split("\n")
    .filter((file) => file && file !== agent.reportFile && !file.startsWith(".night-agents/"));
}

function branchSnapshot(run, runDir) {
  const cacheFile = path.join(runDir, "branch.json");
  const cached = readJsonIfExists(cacheFile);
  const head = branchHead(run.repo, run.branch);
  if (!head) return cached ? { ...cached, live: false } : null;
  if (cached && cached.head === head) return { ...cached, live: true };
  const snapshot = buildBranch(run.repo, run.baseSha, head);
  fs.writeFileSync(cacheFile, JSON.stringify(snapshot));
  return { ...snapshot, live: true };
}

function deriveStatus(result, errors, gitInfo) {
  if (!result) return gitInfo ? "invalid" : "running";
  return errors.length ? "invalid" : result.status;
}

function loadRun(runDir) {
  const run = JSON.parse(fs.readFileSync(path.join(runDir, "run.json"), "utf8"));
  const result = readJsonIfExists(path.join(runDir, "result.json"));
  const gitInfo = readJsonIfExists(path.join(runDir, "git.json"));
  const errors = result ? validateResult(result, run.agent) : [];
  return {
    id: path.relative(path.join(runDir, "..", "..", ".."), runDir).split(path.sep).join("/"),
    dir: runDir,
    ...run,
    status: deriveStatus(result, errors, gitInfo),
    errors,
    result,
    git: gitInfo,
    report: readTextIfExists(path.join(runDir, "report.md")),
    testsBeforeLog: readTextIfExists(path.join(runDir, "tests-before.log")),
    testsAfterLog: readTextIfExists(path.join(runDir, "tests-after.log")),
    branchData: branchSnapshot(run, runDir),
  };
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name));
}

function scanRuns(home, onRun) {
  const runs = [];
  for (const dayDir of listDirs(path.join(home, "runs"))) {
    for (const projectDir of listDirs(dayDir)) {
      for (const runDir of listDirs(projectDir)) {
        if (!fs.existsSync(path.join(runDir, "run.json"))) continue;
        try {
          runs.push(loadRun(runDir));
          if (onRun) onRun(runDir);
        } catch (error) {
          process.stderr.write(`night-agents: skipping ${runDir}: ${error.message}\n`);
        }
      }
    }
  }
  return runs.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
}

function generate(home, onRun) {
  const out = path.join(home, "ui");
  fs.mkdirSync(out, { recursive: true });
  for (const file of fs.readdirSync(SITE_SRC)) fs.copyFileSync(path.join(SITE_SRC, file), path.join(out, file));
  const data = { generatedAt: new Date().toISOString(), home, agents: AGENTS, runs: scanRuns(home, onRun) };
  fs.writeFileSync(path.join(out, "data.js"), `window.NIGHT_DATA = ${JSON.stringify(data).replace(/</g, "\\u003c")};\n`);
  return { out, runs: data.runs.length };
}

function main(argv) {
  if (argv[0] === "--check") {
    const runDir = argv[1];
    if (!runDir) throw new Error("usage: generate.js --check <run-dir>");
    const file = path.join(runDir, "result.json");
    let result;
    try {
      result = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      process.stderr.write(`${file}: ${error.message}\n`);
      return 1;
    }
    const run = JSON.parse(fs.readFileSync(path.join(runDir, "run.json"), "utf8"));
    const errors = validateResult(result, run.agent);
    for (const changed of changesOutsideReport(run)) errors.push(`${run.agent} only documents findings, revert the change to ${changed}`);
    for (const error of errors) process.stderr.write(`${file}: ${error}\n`);
    return errors.length ? 1 : 0;
  }
  const onRun = process.env.NIGHT_PROGRESS ? (runDir) => process.stdout.write(`indexed ${runDir}\n`) : null;
  const { out, runs } = generate(nightHome(), onRun);
  process.stdout.write(`generated ${path.join(out, "index.html")} with ${runs} runs\n`);
  return 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { validateResult, loadRun, scanRuns, generate, parseNameStatus };
