(function (root) {
  const DAY_MS = 86400000;

  function toDay(date) {
    return new Date(date).toISOString().slice(0, 10);
  }

  function addDays(day, n) {
    return toDay(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS);
  }

  function weekStart(day) {
    const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
    return addDays(day, -weekday);
  }

  function fixedCount(run) {
    return run.result && Array.isArray(run.result.findings) ? run.result.findings.filter((f) => f.action === "fixed").length : 0;
  }

  function findingCount(run) {
    return run.result && Array.isArray(run.result.findings) ? run.result.findings.length : 0;
  }

  function testDelta(run) {
    if (!run.result || !run.result.testsBefore || !run.result.testsAfter) return 0;
    return run.result.testsAfter.passed - run.result.testsBefore.passed;
  }

  function durationMinutes(run) {
    if (!run.git || !run.git.finishedAt || !run.startedAt) return null;
    return Math.max(0, (Date.parse(run.git.finishedAt) - Date.parse(run.startedAt)) / 60000);
  }

  function groupByDay(runs) {
    const byDay = {};
    for (const run of runs) (byDay[run.day] = byDay[run.day] || []).push(run);
    return byDay;
  }

  function buildGrid(runs, endDay, weeks) {
    const byDay = groupByDay(runs);
    const first = addDays(weekStart(endDay), -(weeks - 1) * 7);
    const columns = [];
    for (let w = 0; w < weeks; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(first, w * 7 + d);
        const list = byDay[day] || [];
        days.push({
          day,
          future: day > endDay,
          count: list.length,
          failed: list.filter((r) => r.status === "failed" || r.status === "invalid").length,
          fixed: list.reduce((sum, r) => sum + fixedCount(r), 0),
        });
      }
      columns.push(days);
    }
    return columns;
  }

  function level(count, max) {
    if (count === 0) return 0;
    if (max <= 4) return Math.min(4, count);
    return Math.min(4, Math.ceil((count / max) * 4));
  }

  function streaks(runs, endDay) {
    const days = new Set(runs.map((r) => r.day));
    let current = 0;
    let cursor = days.has(endDay) ? endDay : addDays(endDay, -1);
    while (days.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    }
    let longest = 0;
    let run = 0;
    let previous = null;
    for (const day of [...days].sort()) {
      run = previous && addDays(previous, 1) === day ? run + 1 : 1;
      longest = Math.max(longest, run);
      previous = day;
    }
    return { current, longest, activeDays: days.size };
  }

  function totals(runs) {
    const finished = runs.filter((r) => ["success", "no-findings", "failed"].includes(r.status));
    const ok = finished.filter((r) => r.status !== "failed").length;
    return {
      runs: runs.length,
      finished: finished.length,
      successRate: finished.length ? Math.round((ok / finished.length) * 100) : 0,
      findings: runs.reduce((s, r) => s + findingCount(r), 0),
      fixed: runs.reduce((s, r) => s + fixedCount(r), 0),
      linesAdded: runs.reduce((s, r) => s + ((r.git && r.git.linesAdded) || 0), 0),
      linesRemoved: runs.reduce((s, r) => s + ((r.git && r.git.linesRemoved) || 0), 0),
      testsAdded: runs.reduce((s, r) => s + Math.max(0, testDelta(r)), 0),
      branches: runs.filter((r) => r.git && r.git.branchKept).length,
      failed: runs.filter((r) => r.status === "failed" || r.status === "invalid").length,
    };
  }

  function weekly(runs, endDay, weeks, agentNames) {
    const first = addDays(weekStart(endDay), -(weeks - 1) * 7);
    const rows = [];
    for (let w = 0; w < weeks; w++) {
      const start = addDays(first, w * 7);
      const end = addDays(start, 6);
      const list = runs.filter((r) => r.day >= start && r.day <= end);
      const byAgent = {};
      for (const name of agentNames) byAgent[name] = list.filter((r) => r.agent === name).length;
      rows.push({ week: start, ...totals(list), byAgent });
    }
    return rows;
  }

  function trend(values) {
    const half = Math.floor(values.length / 2);
    const previous = values.slice(0, half).reduce((a, b) => a + b, 0);
    const recent = values.slice(half).reduce((a, b) => a + b, 0);
    if (previous === 0) return recent === 0 ? 0 : null;
    return Math.round(((recent - previous) / previous) * 100);
  }

  function perAgent(runs, agents) {
    return agents.map((agent) => {
      const list = runs.filter((r) => r.agent === agent.name);
      const metricTotals = {};
      for (const run of list) {
        const metrics = (run.result && run.result.metrics) || {};
        for (const [key, value] of Object.entries(metrics)) metricTotals[key] = (metricTotals[key] || 0) + value;
      }
      const durations = list.map(durationMinutes).filter((d) => d !== null);
      return {
        agent,
        ...totals(list),
        lastRun: list.length ? list.map((r) => r.startedAt).sort().pop() : null,
        avgMinutes: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null,
        metricTotals,
      };
    });
  }

  function testsSeries(runs) {
    const byProject = {};
    for (const run of [...runs].sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)))) {
      if (!run.result || !run.result.testsAfter) continue;
      (byProject[run.project] = byProject[run.project] || []).push({ day: run.day, passed: run.result.testsAfter.passed });
    }
    return byProject;
  }

  const api = { toDay, addDays, weekStart, buildGrid, level, streaks, totals, weekly, trend, perAgent, testsSeries, fixedCount, findingCount, testDelta, durationMinutes };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NightMetrics = api;
})(typeof window !== "undefined" ? window : globalThis);
