const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../bin/site/metrics");
const H = require("../bin/site/highlight");
const MD = require("../bin/site/markdown");

function run(day, status, extra) {
  return { day, status, agent: "bug-hunter", project: "shop", startedAt: `${day}T02:00:00Z`, result: null, git: null, ...extra };
}

test("the grid puts each night's runs on its own square and flags nights with a failure", () => {
  const runs = [run("2026-10-14", "success"), run("2026-10-14", "failed"), run("2026-10-16", "success")];
  const grid = M.buildGrid(runs, "2026-10-16", 2);
  const days = grid.flat();
  const oct14 = days.find((d) => d.day === "2026-10-14");
  const oct15 = days.find((d) => d.day === "2026-10-15");
  assert.equal(oct14.count, 2);
  assert.equal(oct14.failed, 1);
  assert.equal(oct15.count, 0);
  assert.equal(grid[0][0].day, "2026-10-04");
  assert.equal(grid.length, 2);
  assert.ok(grid.every((week) => week.length === 7));
  assert.equal(days.find((d) => d.day === "2026-10-17").future, true);
});

test("a streak counts consecutive nights and survives the current night not having run yet", () => {
  const runs = ["2026-10-10", "2026-10-11", "2026-10-15", "2026-10-16", "2026-10-17"].map((d) => run(d, "success"));
  assert.deepEqual(M.streaks(runs, "2026-10-18"), { current: 3, longest: 3, activeDays: 5 });
  assert.equal(M.streaks(runs, "2026-10-19").current, 0);
});

test("tests added never goes negative when an agent removes dead tests", () => {
  const removal = run("2026-10-17", "success", { result: { findings: [], testsBefore: { passed: 10, failed: 0 }, testsAfter: { passed: 8, failed: 0 } } });
  const addition = run("2026-10-17", "success", { result: { findings: [], testsBefore: { passed: 8, failed: 0 }, testsAfter: { passed: 12, failed: 0 } } });
  assert.equal(M.totals([removal, addition]).testsAdded, 4);
});

test("success rate ignores runs still running and counts failed and invalid runs against it", () => {
  const runs = [run("2026-10-17", "success"), run("2026-10-17", "no-findings"), run("2026-10-17", "failed"), run("2026-10-17", "running")];
  assert.equal(M.totals(runs).successRate, 67);
});

test("trend compares the recent half with the previous half and never invents a percentage from zero", () => {
  assert.equal(M.trend([2, 2, 3, 3]), 50);
  assert.equal(M.trend([4, 4, 2, 2]), -50);
  assert.equal(M.trend([0, 0, 0, 1]), null);
});

test("the highlighter keeps every line so line numbers match the file", () => {
  const source = "/* start\n still comment */\nconst a = 'x'; // done\n";
  const lines = H.highlightLines(source, "src/a.js");
  assert.equal(lines.length, 4);
  assert.match(lines[1], /tk-comment/);
  assert.match(lines[2], /tk-keyword">const/);
  assert.match(lines[2], /tk-string/);
});

test("the highlighter escapes html so a branch file can never inject markup into the ui", () => {
  const [line] = H.highlightLines('<img src=x onerror="alert(1)">', "a.txt");
  assert.equal(line.includes("<img"), false);
});

test("markdown reports render tables and escape html", () => {
  const html = MD.render("## Bugs\n\n| id | file |\n|---|---|\n| B1 | <b>cart.js</b> |\n");
  assert.match(html, /<table>/);
  assert.match(html, /&lt;b&gt;cart.js/);
});
