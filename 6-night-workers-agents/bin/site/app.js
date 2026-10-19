(function () {
  const data = window.NIGHT_DATA || { agents: [], runs: [], generatedAt: null };
  const M = window.NightMetrics;
  const H = window.NightHighlight;
  const MD = window.NightMarkdown;
  const desktop = window.nightDesktop || null;
  const agentsByName = Object.fromEntries(data.agents.map((a) => [a.name, a]));
  const runsById = Object.fromEntries(data.runs.map((r) => [r.id, r]));
  const TABS = [
    { id: "activity", label: "Activity" },
    { id: "runs", label: "Runs" },
    { id: "branches", label: "Branches" },
    { id: "metrics", label: "Metrics" },
    { id: "agents", label: "Agents" },
  ];
  const STATUS_LABEL = { success: "✓ success", "no-findings": "○ no findings", failed: "✕ failed", invalid: "⚠ invalid", running: "◔ running" };
  const state = {
    tab: "activity",
    project: "all",
    agent: "all",
    status: "all",
    runQuery: "",
    day: null,
    runId: null,
    branchRunId: null,
    filePath: null,
    mode: "file",
    targetLine: null,
    fileQuery: "",
    fileHit: 0,
    weeks: 12,
  };

  const $ = (selector) => document.querySelector(selector);

  function esc(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function localDay(date) {
    const d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function fmtDay(day) {
    return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function fmtTime(iso) {
    return iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString();
  }

  function agentOf(run) {
    return agentsByName[run.agent] || { name: run.agent, title: run.agent, icon: "•", color: "#898781", description: "" };
  }

  function agentTag(name) {
    const agent = agentsByName[name] || { name, icon: "•", color: "#898781" };
    return `<span class="agent-label"><span class="dot" style="background:${agent.color}"></span>${agent.icon} ${esc(agent.name)}</span>`;
  }

  function statusPill(status) {
    return `<span class="pill ${esc(status)}">${esc(STATUS_LABEL[status] || status)}</span>`;
  }

  function visibleRuns() {
    return data.runs.filter((r) => (state.project === "all" || r.project === state.project) && (state.agent === "all" || r.agent === state.agent));
  }

  function save() {
    try {
      localStorage.setItem("night-agents-ui", JSON.stringify({ tab: state.tab, project: state.project, agent: state.agent, weeks: state.weeks }));
    } catch {
      return;
    }
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem("night-agents-ui") || "{}");
      if (TABS.some((t) => t.id === saved.tab)) state.tab = saved.tab;
      if (saved.project) state.project = saved.project;
      if (saved.agent) state.agent = saved.agent;
      if (saved.weeks) state.weeks = saved.weeks;
    } catch {
      return;
    }
  }

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (el.hidden = true), 3200);
  }

  function showTip(event, html) {
    const tip = $("#tooltip");
    tip.innerHTML = html;
    tip.hidden = false;
    const x = Math.min(event.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
    const y = Math.min(event.clientY + 14, window.innerHeight - tip.offsetHeight - 8);
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  }

  function hideTip() {
    $("#tooltip").hidden = true;
  }

  function bindTips(root) {
    root.querySelectorAll("[data-tip]").forEach((el) => {
      el.addEventListener("mousemove", (event) => showTip(event, el.dataset.tip));
      el.addEventListener("mouseleave", hideTip);
    });
  }

  function go(patch) {
    Object.assign(state, patch);
    save();
    render();
  }

  function renderChrome() {
    const projects = [...new Set(data.runs.map((r) => r.project))].sort();
    if (state.project !== "all" && !projects.includes(state.project)) state.project = "all";
    $("#project-filter").innerHTML =
      `<option value="all">All projects (${projects.length})</option>` +
      projects.map((p) => `<option value="${esc(p)}" ${p === state.project ? "selected" : ""}>${esc(p)}</option>`).join("");
    $("#agent-filter").innerHTML =
      `<option value="all">All agents</option>` +
      data.agents.map((a) => `<option value="${esc(a.name)}" ${a.name === state.agent ? "selected" : ""}>${a.icon} ${esc(a.title)}</option>`).join("");
    $("#generated").textContent = data.generatedAt ? `${data.runs.length} runs · generated ${fmtTime(data.generatedAt)}` : "no data generated yet";
    $("#tabs").innerHTML = TABS.map(
      (t, i) => `<button class="tab ${t.id === state.tab ? "active" : ""}" data-tab="${t.id}">${t.label}<kbd>⌘${i + 1}</kbd></button>`
    ).join("");
    $("#tabs").querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => go({ tab: b.dataset.tab, runId: null })));
  }

  function emptyState() {
    return `<div class="card empty">
      <h2>No night runs yet</h2>
      <p>Run the agents on any git repository, then refresh.</p>
      <pre>cd your-repo
claude "/night-agents all"
codex "$night-agents all"</pre>
      <p class="muted">Runs are read from ${esc(data.home || "~/.night-agents")}/runs</p>
    </div>`;
  }

  function tile(label, value, delta) {
    let deltaHtml = "";
    if (delta === null) deltaHtml = `<div class="delta up">▲ new this period</div>`;
    else if (delta !== undefined) {
      const cls = delta > 0 ? "up" : delta < 0 ? "down" : "";
      const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "■";
      deltaHtml = `<div class="delta ${cls}">${arrow} ${Math.abs(delta)}% vs previous period</div>`;
    }
    return `<div class="tile"><div class="label">${esc(label)}</div><div class="value">${value}</div>${deltaHtml}</div>`;
  }

  function contributionGrid(runs, endDay) {
    const columns = M.buildGrid(runs, endDay, 53);
    const max = Math.max(1, ...columns.flat().map((d) => d.count));
    let html = `<div class="contrib"><span></span><span class="wd"></span><span class="wd">Mon</span><span class="wd"></span><span class="wd">Wed</span><span class="wd"></span><span class="wd">Fri</span><span class="wd"></span>`;
    let lastMonth = "";
    for (const week of columns) {
      const month = new Date(`${week[0].day}T12:00:00`).toLocaleDateString(undefined, { month: "short" });
      html += `<span class="mlabel">${month !== lastMonth ? month : ""}</span>`;
      lastMonth = month;
      for (const d of week) {
        const tip = `<b>${d.count} run${d.count === 1 ? "" : "s"}</b> · ${d.fixed} fixed${d.failed ? ` · <span style="color:var(--critical)">${d.failed} failed</span>` : ""}<br>${fmtDay(d.day)}`;
        const cls = ["cell", `l${M.level(d.count, max)}`, d.failed ? "failed" : "", d.future ? "future" : "", d.day === state.day ? "selected" : ""].join(" ");
        html += `<span class="${cls}" data-day="${d.day}" data-tip="${esc(tip)}"></span>`;
      }
    }
    return `${html}</div>`;
  }

  function strip(runs, endDay, days) {
    const byDay = {};
    for (const run of runs) (byDay[run.day] = byDay[run.day] || []).push(run);
    const rank = { failed: 5, invalid: 5, running: 4, success: 3, "no-findings": 2 };
    let html = "";
    for (let i = days - 1; i >= 0; i--) {
      const day = M.addDays(endDay, -i);
      const list = byDay[day] || [];
      const worst = list.map((r) => r.status).sort((a, b) => (rank[b] || 0) - (rank[a] || 0))[0] || "";
      const tip = list.length ? `${fmtDay(day)}<br>${list.map((r) => `${STATUS_LABEL[r.status] || r.status} · ${esc(r.project)}`).join("<br>")}` : `${fmtDay(day)}<br>no run`;
      html += `<span class="sq ${worst}" data-day="${day}" data-tip="${esc(tip)}"></span>`;
    }
    return `<div class="strip">${html}</div>`;
  }

  function runsTable(runs, limit) {
    if (!runs.length) return `<p class="muted">No runs match.</p>`;
    const rows = runs
      .slice(0, limit || runs.length)
      .map((r) => {
        const result = r.result || {};
        const tb = result.testsBefore;
        const ta = result.testsAfter;
        const tests = tb && ta ? `${tb.passed}/${tb.failed} → ${ta.passed}/${ta.failed}` : "";
        const lines = r.git ? `<span class="adds">+${fmtNum(r.git.linesAdded)}</span> <span class="dels">−${fmtNum(r.git.linesRemoved)}</span>` : "";
        return `<tr class="click" data-run="${esc(r.id)}">
          <td>${agentTag(r.agent)}</td>
          <td>${esc(r.project)}</td>
          <td>${esc(fmtTime(r.startedAt))}</td>
          <td>${statusPill(r.status)}</td>
          <td>${esc(result.summary || (r.errors.length ? r.errors[0] : ""))}</td>
          <td class="num">${M.fixedCount(r)}/${M.findingCount(r)}</td>
          <td class="num">${tests}</td>
          <td class="num">${lines}</td>
        </tr>`;
      })
      .join("");
    return `<table class="list"><thead><tr><th>Agent</th><th>Project</th><th>Started</th><th>Status</th><th>Summary</th><th class="num">Fixed</th><th class="num">Tests pass/fail</th><th class="num">Lines</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function bindRunRows(root) {
    root.querySelectorAll("[data-run]").forEach((row) => row.addEventListener("click", () => go({ tab: "runs", runId: row.dataset.run })));
  }

  function viewActivity(view) {
    const runs = visibleRuns();
    if (!data.runs.length) {
      view.innerHTML = emptyState();
      return;
    }
    const today = localDay();
    const t = M.totals(runs);
    const s = M.streaks(runs, today);
    const dayRuns = state.day ? runs.filter((r) => r.day === state.day) : [];
    view.innerHTML = `
      <div class="tiles">
        ${tile("Runs", fmtNum(t.runs))}
        ${tile("Active nights", fmtNum(s.activeDays))}
        ${tile("Current streak", `${s.current} night${s.current === 1 ? "" : "s"}`)}
        ${tile("Longest streak", `${s.longest} night${s.longest === 1 ? "" : "s"}`)}
        ${tile("Success rate", `${t.successRate}%`)}
        ${tile("Findings fixed", fmtNum(t.fixed))}
        ${tile("Lines removed", fmtNum(t.linesRemoved))}
        ${tile("Tests added", fmtNum(t.testsAdded))}
      </div>
      <div class="card">
        <h2>Night activity<span class="muted">runs per night, last 12 months</span></h2>
        <div class="grid-wrap" id="grid">${contributionGrid(runs, today)}</div>
        <div class="legend">Less <span class="cell"></span><span class="cell l1"></span><span class="cell l2"></span><span class="cell l3"></span><span class="cell l4"></span> More
          <span class="item" style="margin-left:16px"><span class="cell failed"></span> night with a failed run</span></div>
      </div>
      ${state.day ? `<div class="card"><h2>${fmtDay(state.day)}<span class="muted">${dayRuns.length} runs</span> <button class="ghost" id="clear-day">clear</button></h2>${runsTable(dayRuns)}</div>` : ""}
      <div class="card">
        <h2>Every agent, every night<span class="muted">last 60 nights, worst result of the night</span></h2>
        ${data.agents
          .filter((a) => state.agent === "all" || a.name === state.agent)
          .map((a) => `<div class="strip-row">${agentTag(a.name)}${strip(runs.filter((r) => r.agent === a.name), today, 60)}</div>`)
          .join("")}
        <div class="legend">
          <span class="item"><span class="swatch" style="background:var(--good)"></span>✓ success</span>
          <span class="item"><span class="swatch" style="background:var(--seq-1)"></span>○ no findings</span>
          <span class="item"><span class="swatch" style="background:var(--critical)"></span>✕ failed or invalid</span>
          <span class="item"><span class="swatch" style="background:var(--warning)"></span>◔ running</span>
          <span class="item"><span class="swatch" style="background:var(--seq-0)"></span>no run</span>
        </div>
      </div>
      <div class="card"><h2>Latest runs</h2>${runsTable(runs, 10)}</div>`;
    view.querySelectorAll("[data-day]").forEach((el) => el.addEventListener("click", () => go({ day: el.dataset.day === state.day ? null : el.dataset.day })));
    const clear = $("#clear-day");
    if (clear) clear.addEventListener("click", () => go({ day: null }));
    bindTips(view);
    bindRunRows(view);
  }

  function viewRuns(view) {
    if (state.runId && runsById[state.runId]) {
      viewRunDetail(view, runsById[state.runId]);
      return;
    }
    if (!data.runs.length) {
      view.innerHTML = emptyState();
      return;
    }
    const q = state.runQuery.toLowerCase();
    const runs = visibleRuns().filter(
      (r) => (state.status === "all" || r.status === state.status) && (!q || `${r.agent} ${r.project} ${r.branch} ${(r.result && r.result.summary) || ""}`.toLowerCase().includes(q))
    );
    const statuses = ["all", "success", "no-findings", "failed", "invalid", "running"];
    view.innerHTML = `<div class="card">
      <div class="row" style="margin-bottom:12px">
        <select id="status-filter">${statuses.map((s) => `<option value="${s}" ${s === state.status ? "selected" : ""}>${s === "all" ? "All statuses" : STATUS_LABEL[s]}</option>`).join("")}</select>
        <input type="search" id="run-query" placeholder="Filter runs" value="${esc(state.runQuery)}" />
        <span class="muted">${runs.length} runs</span>
      </div>
      ${runsTable(runs)}
    </div>`;
    $("#status-filter").addEventListener("change", (e) => go({ status: e.target.value }));
    const input = $("#run-query");
    input.addEventListener("input", (e) => {
      state.runQuery = e.target.value;
      render();
      const again = $("#run-query");
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    });
    bindRunRows(view);
  }

  function testsBlock(label, tests) {
    if (!tests) return "";
    return `<div><span>${label}</span><b>${tests.passed} passed · ${tests.failed} failed${tests.skipped ? ` · ${tests.skipped} skipped` : ""}</b><div class="muted"><code>${esc(tests.command)}</code></div></div>`;
  }

  function viewRunDetail(view, run) {
    const agent = agentOf(run);
    const result = run.result || {};
    const findings = result.findings || [];
    const branchFiles = run.branchData ? run.branchData.files.map((f) => f.path) : [];
    const metrics = Object.entries(result.metrics || {});
    view.innerHTML = `
      <div class="row" style="margin-bottom:12px">
        <button id="back">← All runs</button>
        ${run.branchData ? `<button id="open-branch">Open branch files</button>` : ""}
      </div>
      <div class="card" style="border-top:4px solid ${agent.color}">
        <h2>${agent.icon} ${esc(agent.title)} · ${esc(run.project)} ${statusPill(run.status)}</h2>
        <p>${esc(result.summary || "")}</p>
        ${run.errors.length ? `<div class="pill invalid">result.json problems</div><ul>${run.errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
        <div class="meta">
          <div><span>Branch</span><b>${esc(run.git && !run.git.branchKept ? "none (no commits)" : run.branch)}</b></div>
          <div><span>Base</span><b>${esc(run.baseBranch)} @ ${esc(String(run.baseSha || "").slice(0, 10))}</b></div>
          <div><span>Started</span><b>${esc(fmtTime(run.startedAt))}</b></div>
          <div><span>Duration</span><b>${M.durationMinutes(run) === null ? "running" : `${Math.round(M.durationMinutes(run))} min`}</b></div>
          <div><span>Repository</span><b>${esc(run.repo)}</b></div>
          <div><span>Run folder</span><b>${esc(run.dir)}</b></div>
          ${testsBlock("Tests before", result.testsBefore)}
          ${testsBlock("Tests after", result.testsAfter)}
          ${run.git ? `<div><span>Changes</span><b>${run.git.commits} commits · <span class="adds">+${fmtNum(run.git.linesAdded)}</span> <span class="dels">−${fmtNum(run.git.linesRemoved)}</span> · ${run.git.filesChanged} files</b></div>` : ""}
        </div>
        ${metrics.length ? `<h3>Metrics</h3><div class="chips">${metrics.map(([k, v]) => `<span class="chip">${esc(k)} <b>${fmtNum(v)}</b></span>`).join("")}</div>` : ""}
      </div>
      <div class="card"><h2>Findings<span class="muted">${findings.length}</span></h2>
        ${
          findings.length
            ? `<table class="list"><thead><tr><th>Id</th><th>Finding</th><th>Kind</th><th>Severity</th><th>Action</th><th>Location</th><th>Before → after</th></tr></thead><tbody>${findings
                .map(
                  (f, i) => `<tr class="${branchFiles.includes(f.file) ? "click" : ""}" data-file="${esc(branchFiles.includes(f.file) ? f.file : "")}" data-line="${esc(f.line || "")}">
                  <td>${esc(f.id || `F${i + 1}`)}</td><td><b>${esc(f.title)}</b>${f.detail ? `<div class="muted">${esc(f.detail)}</div>` : ""}</td>
                  <td>${esc(f.kind)}</td><td><span class="pill sev-${esc(f.severity)}">${esc(f.severity)}</span></td><td>${esc(f.action)}</td>
                  <td><code>${esc(f.file)}${f.line ? `:${f.line}` : ""}</code></td><td>${f.before || f.after ? `${esc(f.before || "")} → ${esc(f.after || "")}` : ""}</td></tr>`
                )
                .join("")}</tbody></table>`
            : `<p class="muted">No findings recorded.</p>`
        }
      </div>
      ${run.branchData && run.branchData.commits.length ? `<div class="card"><h2>Commits<span class="muted">${run.branchData.commits.length}</span></h2><table class="list"><tbody>${run.branchData.commits.map((c) => `<tr><td><code>${esc(c.sha.slice(0, 8))}</code></td><td>${esc(c.subject)}</td><td class="muted">${esc(fmtTime(c.date))}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <div class="card report"><h2>Report</h2>${run.report ? MD.render(run.report) : `<p class="muted">No report.md in the run folder.</p>`}</div>
      ${run.testsBeforeLog ? `<div class="card"><details><summary>tests-before.log</summary><pre class="log">${esc(run.testsBeforeLog)}</pre></details></div>` : ""}
      ${run.testsAfterLog ? `<div class="card"><details><summary>tests-after.log</summary><pre class="log">${esc(run.testsAfterLog)}</pre></details></div>` : ""}`;
    $("#back").addEventListener("click", () => go({ runId: null }));
    const open = $("#open-branch");
    if (open) open.addEventListener("click", () => openFile(run.id, null, null));
    view.querySelectorAll("tr[data-file]").forEach((row) => {
      if (!row.dataset.file) return;
      row.addEventListener("click", () => openFile(run.id, row.dataset.file, Number(row.dataset.line) || null));
    });
  }

  function openFile(runId, file, line) {
    const run = runsById[runId];
    const files = run && run.branchData ? run.branchData.files : [];
    go({ tab: "branches", branchRunId: runId, filePath: file || (files[0] && files[0].path) || null, targetLine: line, mode: "file", fileHit: 0 });
  }

  function diffStats(diff) {
    let adds = 0;
    let dels = 0;
    for (const line of diff.split("\n")) {
      if (line.startsWith("+") && !line.startsWith("+++")) adds++;
      else if (line.startsWith("-") && !line.startsWith("---")) dels++;
    }
    return { adds, dels };
  }

  function fileRows(file) {
    const lines = H.highlightLines(file.content, file.path);
    return lines.map((html, i) => `<tr data-ln="${i + 1}"><td class="ln">${i + 1}</td><td class="src">${html || " "}</td></tr>`).join("");
  }

  function diffRows(file) {
    const rows = [];
    let oldLn = 0;
    let newLn = 0;
    for (const line of file.diff.split("\n")) {
      if (/^(diff --git|index |--- |\+\+\+ |new file mode|deleted file mode|similarity index|rename (from|to))/.test(line)) continue;
      const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (hunk) {
        oldLn = Number(hunk[1]);
        newLn = Number(hunk[2]);
        rows.push(`<tr class="hunk"><td class="ln"></td><td class="ln"></td><td class="src">${esc(line)}</td></tr>`);
        continue;
      }
      if (!line && !rows.length) continue;
      const sign = line[0];
      const code = H.highlightLines(line.slice(1), file.path)[0] || " ";
      if (sign === "+") rows.push(`<tr class="add" data-ln="${newLn}"><td class="ln"></td><td class="ln">${newLn++}</td><td class="src">+${code}</td></tr>`);
      else if (sign === "-") rows.push(`<tr class="del"><td class="ln">${oldLn++}</td><td class="ln"></td><td class="src">-${code}</td></tr>`);
      else if (sign === " ") rows.push(`<tr data-ln="${newLn}"><td class="ln">${oldLn++}</td><td class="ln">${newLn++}</td><td class="src"> ${code}</td></tr>`);
    }
    return rows.join("");
  }

  function markMatches(root, query) {
    if (!query) return 0;
    const q = query.toLowerCase();
    let count = 0;
    root.querySelectorAll("tr").forEach((row) => {
      const src = row.querySelector("td.src");
      if (!src || !src.textContent.toLowerCase().includes(q)) return;
      row.classList.add("hit");
      count++;
      const walker = document.createTreeWalker(src, 4);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const text = node.nodeValue;
        const lower = text.toLowerCase();
        if (!lower.includes(q)) continue;
        const frag = document.createDocumentFragment();
        let at = 0;
        let idx;
        while ((idx = lower.indexOf(q, at)) !== -1) {
          frag.appendChild(document.createTextNode(text.slice(at, idx)));
          const mark = document.createElement("mark");
          mark.textContent = text.slice(idx, idx + q.length);
          frag.appendChild(mark);
          at = idx + q.length;
        }
        frag.appendChild(document.createTextNode(text.slice(at)));
        node.parentNode.replaceChild(frag, node);
      }
    });
    return count;
  }

  function focusHit(view, delta) {
    const hits = [...view.querySelectorAll("table.code tr.hit")];
    if (!hits.length) return;
    state.fileHit = (state.fileHit + delta + hits.length) % hits.length;
    hits.forEach((h) => h.classList.remove("current"));
    const hit = hits[state.fileHit];
    hit.classList.add("current");
    hit.scrollIntoView({ block: "center" });
    const counter = $("#hit-count");
    if (counter) counter.textContent = `${state.fileHit + 1}/${hits.length}`;
  }

  function viewBranches(view) {
    const runs = visibleRuns().filter((r) => r.branchData && r.branchData.files.length);
    if (!runs.length) {
      view.innerHTML = data.runs.length ? `<div class="card empty"><h2>No agent branches with changes for this filter</h2></div>` : emptyState();
      return;
    }
    let run = runsById[state.branchRunId];
    if (!run || !runs.includes(run)) run = runs[0];
    state.branchRunId = run.id;
    const files = run.branchData.files;
    let file = files.find((f) => f.path === state.filePath);
    if (!file) file = files[0];
    state.filePath = file.path;
    const canFile = !file.binary && file.status !== "D";
    const mode = canFile ? state.mode : "diff";
    let body;
    if (file.binary) body = `<div class="empty">Binary file, ${fmtNum(file.size)} bytes</div>`;
    else body = `<table class="code"><tbody>${mode === "file" ? fileRows(file) : diffRows(file)}</tbody></table>${file.truncated ? `<div class="empty">File truncated at 300 KB</div>` : ""}`;
    view.innerHTML = `<div class="split">
      <div class="pane"><h3>Branches · ${runs.length}</h3>${runs
        .map(
          (r) => `<button class="pick ${r.id === run.id ? "active" : ""}" data-pick-run="${esc(r.id)}">${agentOf(r).icon} <b>${esc(r.project)}</b> ${statusPill(r.status)}
          <span class="sub">${esc(r.branch)}</span><span class="sub">${esc(fmtTime(r.startedAt))} · ${r.branchData.files.length} files${r.branchData.live ? "" : " · branch deleted, snapshot"}</span></button>`
        )
        .join("")}</div>
      <div class="pane"><h3>Files · ${files.length}</h3>${files
        .map((f) => {
          const st = diffStats(f.diff);
          return `<button class="pick ${f.path === file.path ? "active" : ""}" data-pick-file="${esc(f.path)}"><span class="fstatus ${f.status}">${f.status}</span><span class="path">${esc(f.path)}</span>
          <span class="sub"><span class="adds">+${st.adds}</span> <span class="dels">−${st.dels}</span>${f.from !== f.path ? ` · from ${esc(f.from)}` : ""}</span></button>`;
        })
        .join("")}
        <h3>Commits · ${run.branchData.commits.length}</h3>${run.branchData.commits
          .map((c) => `<div class="pick"><code>${esc(c.sha.slice(0, 7))}</code> ${esc(c.subject)}<span class="sub">${esc(fmtTime(c.date))}</span></div>`)
          .join("")}</div>
      <div class="pane viewer" id="viewer">
        <div class="viewer-head">
          <span class="path">${esc(file.path)}</span>
          <button id="mode-file" class="${mode === "file" ? "active" : ""}" ${canFile ? "" : "disabled"}>File</button>
          <button id="mode-diff" class="${mode === "diff" ? "active" : ""}">Diff</button>
          <input type="search" id="file-query" placeholder="Find in file ⌘F" value="${esc(state.fileQuery)}" />
          <span class="muted" id="hit-count"></span>
        </div>
        ${body}
      </div>
    </div>`;
    view.querySelectorAll("[data-pick-run]").forEach((b) =>
      b.addEventListener("click", () => go({ branchRunId: b.dataset.pickRun, filePath: null, targetLine: null, fileHit: 0 }))
    );
    view.querySelectorAll("[data-pick-file]").forEach((b) => b.addEventListener("click", () => go({ filePath: b.dataset.pickFile, targetLine: null, fileHit: 0 })));
    $("#mode-file").addEventListener("click", () => go({ mode: "file" }));
    $("#mode-diff").addEventListener("click", () => go({ mode: "diff" }));
    const viewer = $("#viewer");
    const count = markMatches(viewer, state.fileQuery);
    $("#hit-count").textContent = state.fileQuery ? (count ? `${Math.min(state.fileHit + 1, count)}/${count}` : "0 matches") : "";
    if (count) focusHit(viewer, 0);
    const input = $("#file-query");
    input.addEventListener("input", () => {
      state.fileQuery = input.value;
      state.fileHit = 0;
      render();
      const again = $("#file-query");
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusHit(viewer, e.shiftKey ? -1 : 1);
      }
    });
    if (state.targetLine) {
      const row = viewer.querySelector(`tr[data-ln="${state.targetLine}"]`);
      if (row) {
        row.classList.add("target");
        row.scrollIntoView({ block: "center" });
      }
    }
  }

  function axisTicks(max) {
    const raw = Math.max(1, max / 4);
    const power = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw);
    const ticks = [];
    for (let v = 0; v <= max + step - 1 && ticks.length < 6; v += step) ticks.push(v);
    return ticks;
  }

  function chartFrame(width, height, max, labels, inner) {
    const left = 36;
    const bottom = height - 22;
    const ticks = axisTicks(max);
    const top = 10;
    const scaleMax = ticks[ticks.length - 1] || 1;
    const y = (v) => bottom - ((bottom - top) * v) / scaleMax;
    let svg = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img">`;
    for (const t of ticks) svg += `<line class="gridline" x1="${left}" x2="${width - 8}" y1="${y(t)}" y2="${y(t)}"/><text x="${left - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`;
    svg += `<line class="baseline" x1="${left}" x2="${width - 8}" y1="${bottom}" y2="${bottom}"/>`;
    const band = (width - 8 - left) / labels.length;
    labels.forEach((label, i) => {
      if (labels.length > 14 && i % 2) return;
      svg += `<text x="${left + band * i + band / 2}" y="${height - 6}" text-anchor="middle">${esc(label)}</text>`;
    });
    svg += inner({ left, bottom, top, band, y, scaleMax });
    return `${svg}</svg>`;
  }

  function weekLabel(week) {
    return new Date(`${week}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function roundedTopBar(x, yTop, w, h, r) {
    if (h <= 0) return "";
    const rr = Math.min(r, h, w / 2);
    return `M${x},${yTop + h}V${yTop + rr}Q${x},${yTop} ${x + rr},${yTop}H${x + w - rr}Q${x + w},${yTop} ${x + w},${yTop + rr}V${yTop + h}Z`;
  }

  function stackedRunsChart(rows) {
    const agents = data.agents.filter((a) => state.agent === "all" || a.name === state.agent);
    const max = Math.max(1, ...rows.map((r) => agents.reduce((s, a) => s + r.byAgent[a.name], 0)));
    const svg = chartFrame(560, 220, max, rows.map((r) => weekLabel(r.week)), ({ left, bottom, band, y }) => {
      let out = "";
      rows.forEach((row, i) => {
        const w = Math.max(4, Math.min(28, band * 0.6));
        const x = left + band * i + (band - w) / 2;
        let acc = 0;
        const present = agents.filter((a) => row.byAgent[a.name] > 0);
        present.forEach((a, k) => {
          const v = row.byAgent[a.name];
          const y0 = y(acc);
          const y1 = y(acc + v);
          const h = y0 - y1 - (k < present.length - 1 ? 2 : 0);
          const top = y1 + (k < present.length - 1 ? 2 : 0);
          out += k === present.length - 1 ? `<path d="${roundedTopBar(x, y1, w, y0 - y1, 4)}" fill="${a.color}"/>` : `<rect x="${x}" y="${top}" width="${w}" height="${Math.max(0, h)}" fill="${a.color}"/>`;
          acc += v;
        });
        const tip = `<b>Week of ${weekLabel(row.week)}</b><br>${agents.map((a) => `${a.icon} ${esc(a.title)}: ${row.byAgent[a.name]}`).join("<br>")}`;
        out += `<rect class="hit" x="${left + band * i}" y="10" width="${band}" height="${bottom - 10}" data-tip="${esc(tip)}"/>`;
      });
      return out;
    });
    const legend = `<div class="legend">${agents.map((a) => `<span class="item"><span class="swatch" style="background:${a.color}"></span>${a.icon} ${esc(a.title)}</span>`).join("")}</div>`;
    return svg + legend;
  }

  function lineChart(rows, series) {
    const max = Math.max(1, ...rows.flatMap((r) => series.map((s) => s.value(r))));
    const svg = chartFrame(560, 220, max, rows.map((r) => weekLabel(r.week)), ({ left, bottom, band, y }) => {
      let out = "";
      for (const s of series) {
        const points = rows.map((r, i) => `${left + band * i + band / 2},${y(s.value(r))}`).join(" ");
        out += `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
        rows.forEach((r, i) => (out += `<circle cx="${left + band * i + band / 2}" cy="${y(s.value(r))}" r="4" fill="${s.color}" stroke="#fcfcfb" stroke-width="2"/>`));
      }
      rows.forEach((r, i) => {
        const cx = left + band * i + band / 2;
        const tip = `<b>Week of ${weekLabel(r.week)}</b><br>${series.map((s) => `${esc(s.label)}: ${fmtNum(s.value(r))}`).join("<br>")}`;
        out += `<g class="xh"><line class="crosshair" x1="${cx}" x2="${cx}" y1="10" y2="${bottom}" opacity="0"/><rect class="hit" x="${left + band * i}" y="10" width="${band}" height="${bottom - 10}" data-tip="${esc(tip)}"/></g>`;
      });
      return out;
    });
    const legend = series.length > 1 ? `<div class="legend">${series.map((s) => `<span class="item"><span class="swatch" style="background:${s.color}"></span>${esc(s.label)}</span>`).join("")}</div>` : "";
    return svg + legend;
  }

  function groupedBars(rows, series) {
    const max = Math.max(1, ...rows.flatMap((r) => series.map((s) => s.value(r))));
    const svg = chartFrame(560, 220, max, rows.map((r) => weekLabel(r.week)), ({ left, bottom, band, y }) => {
      let out = "";
      rows.forEach((r, i) => {
        const w = Math.max(3, Math.min(14, (band * 0.7) / series.length - 2));
        const groupW = series.length * w + (series.length - 1) * 2;
        series.forEach((s, k) => {
          const x = left + band * i + (band - groupW) / 2 + k * (w + 2);
          const v = s.value(r);
          out += `<path d="${roundedTopBar(x, y(v), w, bottom - y(v), 4)}" fill="${s.color}"/>`;
        });
        const tip = `<b>Week of ${weekLabel(r.week)}</b><br>${series.map((s) => `${esc(s.label)}: ${fmtNum(s.value(r))}`).join("<br>")}`;
        out += `<rect class="hit" x="${left + band * i}" y="10" width="${band}" height="${bottom - 10}" data-tip="${esc(tip)}"/>`;
      });
      return out;
    });
    return `${svg}<div class="legend">${series.map((s) => `<span class="item"><span class="swatch" style="background:${s.color}"></span>${esc(s.label)}</span>`).join("")}</div>`;
  }

  function successBars(stats) {
    const rowH = 30;
    const width = 560;
    const left = 190;
    let svg = `<svg class="chart" viewBox="0 0 ${width} ${stats.length * rowH + 10}" role="img">`;
    stats.forEach((s, i) => {
      const y = 6 + i * rowH;
      const w = ((width - left - 60) * s.successRate) / 100;
      svg += `<text class="ink" x="0" y="${y + 15}">${s.agent.icon} ${esc(s.agent.title)}</text>`;
      svg += `<rect x="${left}" y="${y + 4}" width="${width - left - 60}" height="14" rx="4" fill="#eeede8"/>`;
      if (s.finished) svg += `<rect x="${left}" y="${y + 4}" width="${Math.max(4, w)}" height="14" rx="4" fill="${s.agent.color}"/>`;
      svg += `<text class="ink" x="${width - 52}" y="${y + 15}">${s.finished ? `${s.successRate}%` : "no runs"}</text>`;
      svg += `<rect class="hit" x="0" y="${y}" width="${width}" height="${rowH}" data-tip="${esc(`${s.agent.icon} ${s.agent.title}<br>${s.finished} finished runs · ${s.successRate}% without failure`)}"/>`;
    });
    return `${svg}</svg>`;
  }

  function testsChart(runs) {
    const byProject = M.testsSeries(runs);
    const projects = Object.keys(byProject)
      .sort((a, b) => byProject[b].length - byProject[a].length)
      .slice(0, 3);
    if (!projects.length) return `<p class="muted">No test results yet.</p>`;
    const colors = ["#2a78d6", "#eb6834", "#1baf7a"];
    const days = [...new Set(projects.flatMap((p) => byProject[p].map((pt) => pt.day)))].sort();
    const rows = days.map((day) => ({ week: day }));
    const lastValue = (project, day) => {
      const points = byProject[project].filter((pt) => pt.day <= day);
      return points.length ? points[points.length - 1].passed : 0;
    };
    return lineChart(
      rows,
      projects.map((p, i) => ({ label: p, color: colors[i], value: (r) => lastValue(p, r.week) }))
    );
  }

  function viewMetrics(view) {
    const runs = visibleRuns();
    if (!data.runs.length) {
      view.innerHTML = emptyState();
      return;
    }
    const today = localDay();
    const rows = M.weekly(runs, today, state.weeks, data.agents.map((a) => a.name));
    const t = M.totals(runs.filter((r) => r.day >= rows[0].week));
    const stats = M.perAgent(runs, data.agents).filter((s) => state.agent === "all" || s.agent.name === state.agent);
    view.innerHTML = `
      <div class="row" style="margin-bottom:12px">
        <span class="muted">Range</span>
        ${[4, 8, 12, 26, 52].map((w) => `<button data-weeks="${w}" class="${w === state.weeks ? "active" : ""}">${w}w</button>`).join("")}
      </div>
      <div class="tiles">
        ${tile("Runs", fmtNum(t.runs), M.trend(rows.map((r) => r.runs)))}
        ${tile("Findings fixed", fmtNum(t.fixed), M.trend(rows.map((r) => r.fixed)))}
        ${tile("Lines removed", fmtNum(t.linesRemoved), M.trend(rows.map((r) => r.linesRemoved)))}
        ${tile("Tests added", fmtNum(t.testsAdded), M.trend(rows.map((r) => r.testsAdded)))}
        ${tile("Success rate", `${t.successRate}%`)}
        ${tile("Failed runs", fmtNum(t.failed), M.trend(rows.map((r) => r.failed)))}
      </div>
      <div class="charts">
        <div class="card"><h2>Runs per week<span class="muted">by agent</span></h2>${stackedRunsChart(rows)}</div>
        <div class="card"><h2>Findings fixed per week</h2>${lineChart(rows, [{ label: "Findings fixed", color: "#2a78d6", value: (r) => r.fixed }])}</div>
        <div class="card"><h2>Lines changed per week</h2>${groupedBars(rows, [
          { label: "Lines added", color: "#2a78d6", value: (r) => r.linesAdded },
          { label: "Lines removed", color: "#eb6834", value: (r) => r.linesRemoved },
        ])}</div>
        <div class="card"><h2>Passing tests over time<span class="muted">top 3 projects, after each run</span></h2>${testsChart(runs)}</div>
        <div class="card"><h2>Runs without failure<span class="muted">by agent, all time</span></h2>${successBars(stats)}</div>
      </div>
      <div class="card" style="margin-top:16px"><h2>Per agent</h2>
        <table class="list"><thead><tr><th>Agent</th><th class="num">Runs</th><th class="num">Success</th><th class="num">Findings</th><th class="num">Fixed</th><th class="num">+Lines</th><th class="num">−Lines</th><th class="num">Tests added</th><th class="num">Avg min</th></tr></thead>
        <tbody>${stats
          .map(
            (s) => `<tr><td>${agentTag(s.agent.name)}</td><td class="num">${s.runs}</td><td class="num">${s.successRate}%</td><td class="num">${s.findings}</td><td class="num">${s.fixed}</td>
            <td class="num">${fmtNum(s.linesAdded)}</td><td class="num">${fmtNum(s.linesRemoved)}</td><td class="num">${s.testsAdded}</td><td class="num">${s.avgMinutes === null ? "" : s.avgMinutes}</td></tr>`
          )
          .join("")}</tbody></table>
      </div>`;
    view.querySelectorAll("[data-weeks]").forEach((b) => b.addEventListener("click", () => go({ weeks: Number(b.dataset.weeks) })));
    view.querySelectorAll("g.xh").forEach((g) => {
      const line = g.querySelector("line");
      g.addEventListener("mouseenter", () => line.setAttribute("opacity", "1"));
      g.addEventListener("mouseleave", () => line.setAttribute("opacity", "0"));
    });
    bindTips(view);
  }

  function viewAgents(view) {
    const runs = visibleRuns();
    const today = localDay();
    const stats = M.perAgent(runs, data.agents);
    view.innerHTML = `<div class="agents-grid">${stats
      .map((s) => {
        const a = s.agent;
        const metrics = Object.entries(s.metricTotals);
        return `<div class="card agent-card" style="--agent-color:${a.color}">
          <div class="icon">${a.icon}</div>
          <h2>${esc(a.title)}</h2>
          <div class="muted"><code>${esc(a.name)}</code> · <code>/night-agents ${esc(a.aliases[0])}</code></div>
          <p>${esc(a.description)}</p>
          <div class="chips">
            <span class="chip">runs <b>${s.runs}</b></span>
            <span class="chip">success <b>${s.successRate}%</b></span>
            <span class="chip">fixed <b>${s.fixed}</b></span>
            <span class="chip">last <b>${s.lastRun ? esc(fmtTime(s.lastRun)) : "never"}</b></span>
            ${s.avgMinutes === null ? "" : `<span class="chip">avg <b>${s.avgMinutes} min</b></span>`}
          </div>
          ${metrics.length ? `<h3 style="font-size:12px;color:var(--muted)">Totals</h3><div class="chips">${metrics.map(([k, v]) => `<span class="chip">${esc(k)} <b>${fmtNum(v)}</b></span>`).join("")}</div>` : ""}
          <h3 style="font-size:12px;color:var(--muted)">Last 30 nights</h3>
          ${strip(runs.filter((r) => r.agent === a.name), today, 30)}
        </div>`;
      })
      .join("")}</div>`;
    bindTips(view);
  }

  function render() {
    renderChrome();
    hideTip();
    const view = $("#view");
    const views = { activity: viewActivity, runs: viewRuns, branches: viewBranches, metrics: viewMetrics, agents: viewAgents };
    view.style.overflow = state.tab === "branches" ? "hidden" : "auto";
    views[state.tab](view);
  }

  let searchIndex = null;

  function buildSearchIndex() {
    const entries = [];
    for (const t of TABS) entries.push({ type: "tab", title: `Go to ${t.label}`, text: t.label, go: () => go({ tab: t.id, runId: null }) });
    for (const a of data.agents) entries.push({ type: "agent", title: `${a.icon} ${a.title}`, sub: a.name, text: `${a.name} ${a.title} ${a.description} ${a.aliases.join(" ")}`, go: () => go({ tab: "agents" }) });
    for (const r of data.runs) {
      const a = agentOf(r);
      const result = r.result || {};
      entries.push({ type: "run", title: `${a.icon} ${r.agent} · ${r.project} · ${r.day}`, sub: result.summary || r.status, text: `${r.agent} ${r.project} ${r.branch} ${r.status} ${result.summary || ""}`, go: () => go({ tab: "runs", runId: r.id }) });
      (result.findings || []).forEach((f) =>
        entries.push({
          type: "finding",
          title: `${a.icon} ${f.title}`,
          sub: `${f.file}${f.line ? `:${f.line}` : ""} · ${r.project}`,
          text: `${f.title} ${f.kind} ${f.file} ${f.detail || ""} ${f.severity}`,
          go: () => go({ tab: "runs", runId: r.id }),
        })
      );
      r.report.split("\n").forEach((line, i) => {
        if (line.trim()) entries.push({ type: "report", title: `${a.icon} report · ${r.project} · ${r.day}`, sub: line.trim(), text: line, line: i, go: () => go({ tab: "runs", runId: r.id }) });
      });
      if (!r.branchData) continue;
      r.branchData.commits.forEach((c) => entries.push({ type: "commit", title: c.subject, sub: `${c.sha.slice(0, 8)} · ${r.branch}`, text: `${c.subject} ${c.sha}`, go: () => openFile(r.id, null, null) }));
      r.branchData.files.forEach((f) => {
        entries.push({ type: "file", title: f.path, sub: `${a.icon} ${r.branch}`, text: f.path, go: () => openFile(r.id, f.path, null) });
        f.content.split("\n").forEach((line, i) => {
          if (line.trim()) entries.push({ type: "code", title: `${f.path}:${i + 1}`, sub: line.trim().slice(0, 200), text: line, go: () => openFile(r.id, f.path, i + 1) });
        });
      });
    }
    return entries.map((e) => ({ ...e, hay: `${e.title} ${e.text}`.toLowerCase() }));
  }

  function closeModal() {
    $("#modal-root").innerHTML = "";
  }

  function modalOpen() {
    return $("#modal-root").children.length > 0;
  }

  function openSearch() {
    if (!searchIndex) searchIndex = buildSearchIndex();
    $("#modal-root").innerHTML = `<div class="modal-backdrop"><div class="modal">
      <input type="search" id="search-input" placeholder="Search runs, findings, reports, branches, files and code" autocomplete="off" />
      <div class="count" id="search-count">Type to search everything</div>
      <div class="results" id="search-results"></div></div></div>`;
    const input = $("#search-input");
    let active = 0;
    let results = [];
    const order = { tab: 0, agent: 1, run: 2, finding: 3, commit: 4, file: 5, report: 6, code: 7 };
    const draw = () => {
      $("#search-results").innerHTML = results
        .map((r, i) => `<div class="result ${i === active ? "active" : ""}" data-i="${i}"><span class="type">${r.type}</span><div><div class="title">${esc(r.title)}</div>${r.sub ? `<div class="sub">${esc(r.sub)}</div>` : ""}</div></div>`)
        .join("");
      $("#search-results").querySelectorAll("[data-i]").forEach((el) =>
        el.addEventListener("click", () => {
          closeModal();
          results[Number(el.dataset.i)].go();
        })
      );
      const current = $("#search-results .active");
      if (current) current.scrollIntoView({ block: "nearest" });
    };
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      active = 0;
      if (!q) {
        results = [];
        $("#search-count").textContent = "Type to search everything";
      } else {
        const terms = q.split(/\s+/);
        const all = searchIndex.filter((e) => terms.every((t) => e.hay.includes(t)));
        all.sort((a, b) => order[a.type] - order[b.type]);
        results = all.slice(0, 80);
        $("#search-count").textContent = all.length ? `${all.length} matches${all.length > results.length ? `, showing ${results.length}` : ""}` : "Nothing matches";
      }
      draw();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = Math.min(results.length - 1, active + 1);
        draw();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = Math.max(0, active - 1);
        draw();
      } else if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        const target = results[active];
        closeModal();
        target.go();
      }
    });
    $(".modal-backdrop").addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("modal-backdrop")) closeModal();
    });
    input.focus();
  }

  const ICONS = {
    nav: '<path d="M12 3l7 18-7-4-7 4z"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    view: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
    data: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  };

  const SHORTCUT_GROUPS = [
    {
      title: "Navigation",
      icon: "nav",
      color: "#2a78d6",
      rows: [...TABS.map((t, i) => [`⌘${i + 1}`, `Go to ${t.label}`]), ["Esc", "Close a modal"]],
    },
    {
      title: "Search",
      icon: "search",
      color: "#6250d6",
      rows: [
        ["⌘K", "Search everything"],
        ["↑ ↓", "Move through results"],
        ["Enter", "Go to the result"],
        ["Esc", "Clear the search, then close"],
      ],
    },
    {
      title: "Branches",
      icon: "code",
      color: "#008300",
      rows: [
        ["⌘F", "Find in the open file"],
        ["Enter", "Next match"],
        ["⇧Enter", "Previous match"],
        ["⌘⇧D", "Toggle file and diff view"],
      ],
    },
    {
      title: "Window",
      icon: "view",
      color: "#eb6834",
      rows: [
        ["⌘+", "Zoom in"],
        ["⌘−", "Zoom out"],
        ["⌘0", "Actual size"],
        ["⌘⇧Enter", "Toggle full screen"],
        ["⌘P", "Capture the window to the Desktop"],
        ["Double click title bar", "Maximize or restore"],
      ],
    },
    {
      title: "Edit",
      icon: "edit",
      color: "#a1356b",
      rows: [
        ["⌘C", "Copy"],
        ["⌘X", "Cut"],
        ["⌘V", "Paste"],
        ["⌘A", "Select all"],
      ],
    },
    {
      title: "Data",
      icon: "data",
      color: "#b45309",
      rows: [
        ["⌘R", "Regenerate from the runs folder"],
        ["⌘/", "Show these shortcuts"],
      ],
    },
  ];

  function openShortcuts() {
    $("#modal-root").innerHTML = `<div class="modal-backdrop top"><div class="modal wide">
      <input type="search" id="shortcut-input" placeholder="Filter shortcuts" autocomplete="off" />
      <div class="count" id="shortcut-count"></div>
      <div class="shortcut-groups" id="shortcut-groups"></div></div></div>`;
    const input = $("#shortcut-input");
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      let matched = 0;
      const html = SHORTCUT_GROUPS.map((g) => {
        const rows = !q || g.title.toLowerCase().includes(q) ? g.rows : g.rows.filter(([k, d]) => k.toLowerCase().includes(q) || d.toLowerCase().includes(q));
        matched += rows.length;
        if (!rows.length) return "";
        return `<div class="sgroup" style="--group-color:${g.color}"><h4><svg viewBox="0 0 24 24">${ICONS[g.icon]}</svg>${g.title}</h4>${rows
          .map(([k, d]) => `<div class="srow"><span>${esc(d)}</span><kbd>${esc(k)}</kbd></div>`)
          .join("")}</div>`;
      }).join("");
      $("#shortcut-groups").innerHTML = matched ? html : `<p class="muted">No shortcut matches "${esc(q)}".</p>`;
      $("#shortcut-count").textContent = `${matched} shortcut${matched === 1 ? "" : "s"}`;
    };
    input.addEventListener("input", draw);
    $(".modal-backdrop").addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("modal-backdrop")) closeModal();
    });
    draw();
    input.focus();
  }

  function refresh() {
    if (desktop) desktop.refresh();
    else location.reload();
  }

  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (e.key === "Escape" && modalOpen()) {
      const input = $("#modal-root input[type=search]");
      if (input && input.value) {
        input.value = "";
        input.dispatchEvent(new Event("input"));
      } else closeModal();
      e.preventDefault();
      return;
    }
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (key === "k") {
      e.preventDefault();
      openSearch();
    } else if (key === "/") {
      e.preventDefault();
      openShortcuts();
    } else if (/^[1-9]$/.test(e.key) && TABS[Number(e.key) - 1]) {
      e.preventDefault();
      closeModal();
      go({ tab: TABS[Number(e.key) - 1].id, runId: null });
    } else if (key === "f" && state.tab === "branches") {
      e.preventDefault();
      const input = $("#file-query");
      if (input) input.focus();
    } else if (key === "d" && e.shiftKey && state.tab === "branches") {
      e.preventDefault();
      go({ mode: state.mode === "file" ? "diff" : "file" });
    } else if (key === "r" && !e.shiftKey) {
      e.preventDefault();
      refresh();
    }
  });

  $("#project-filter").addEventListener("change", (e) => go({ project: e.target.value, day: null }));
  $("#agent-filter").addEventListener("change", (e) => go({ agent: e.target.value, day: null }));
  $("#search-button").addEventListener("click", openSearch);
  $("#shortcuts-button").addEventListener("click", openShortcuts);
  $("#refresh-button").addEventListener("click", refresh);

  if (desktop) {
    const bar = $("#titlebar");
    const interactive = (target) => target.closest("button, select, input, a");
    let drag = null;
    const endDrag = () => {
      if (!drag) return;
      drag = null;
      desktop.dragEnd();
    };
    bar.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.detail > 1 || interactive(e.target)) return;
      drag = true;
      bar.setPointerCapture(e.pointerId);
      desktop.dragStart();
    });
    bar.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (!(e.buttons & 1)) return endDrag();
      desktop.dragMove();
    });
    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);
    bar.addEventListener("lostpointercapture", endDrag);
    window.addEventListener("blur", endDrag);
    bar.addEventListener("dblclick", (e) => {
      if (interactive(e.target)) return;
      endDrag();
      desktop.toggleMaximize();
    });
    desktop.on("toast", toast);
    desktop.on("open-search", openSearch);
    desktop.on("open-shortcuts", openShortcuts);
    desktop.on("goto-tab", (index) => TABS[index] && go({ tab: TABS[index].id, runId: null }));
  } else {
    $("#titlebar").style.paddingLeft = "16px";
  }

  restore();
  render();
})();
