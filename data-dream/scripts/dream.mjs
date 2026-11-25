#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, realpathSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { request as httpRequest } from "node:http";

const HERE = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(HERE, "..", "references", "catalog.json");
const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function expand(entry) {
  if (!entry.gen) return { raw: entry.raw, why: entry.why };
  if (entry.gen === "repeat") return { raw: JSON.stringify(entry.char.repeat(entry.count)), why: entry.why };
  if (entry.gen === "array") return { raw: JSON.stringify(Array.from({ length: entry.count }, (_, i) => i)), why: entry.why };
  if (entry.gen === "nest") return { raw: "[".repeat(entry.count) + "]".repeat(entry.count), why: entry.why };
  if (entry.gen === "missing") return { raw: null, why: entry.why };
  throw new Error(`unknown generator ${entry.gen}`);
}

export function catalog(only) {
  const all = JSON.parse(readFileSync(CATALOG, "utf8"));
  const names = only ? only.split(",") : Object.keys(all);
  const unknown = names.filter((n) => !all[n]);
  if (unknown.length) throw new Error(`unknown category ${unknown.join(", ")}, known: ${Object.keys(all).join(", ")}`);
  return Object.fromEntries(names.map((n) => [n, all[n].map((e, i) => ({ id: `${n}-${i + 1}`, ...expand(e) }))]));
}

export function seeds(out, only) {
  mkdirSync(out, { recursive: true });
  const cats = catalog(only);
  for (const [name, list] of Object.entries(cats)) writeFileSync(join(out, `${name}.json`), JSON.stringify(list, null, 2) + "\n");
  return Object.fromEntries(Object.entries(cats).map(([n, l]) => [n, l.length]));
}

export function fill(template, raw, id = "") {
  const t = template.replaceAll("@@id", id);
  if (raw === null) {
    const lead = /,\s*"[^"]+"\s*:\s*@@/;
    return lead.test(t) ? t.replace(lead, "") : t.replace(/"[^"]+"\s*:\s*@@\s*,?\s*/, "");
  }
  return t.replace("@@", () => raw);
}

export function fillUrl(url, raw) {
  if (raw === null) return url.replace(/[?&][^=&]+=@@/, "");
  let text = raw;
  try {
    const v = JSON.parse(raw);
    if (typeof v === "string") text = v;
  } catch {}
  return url.replace("@@", () => encodeURIComponent(text.toWellFormed()));
}

export function assertLocal(url) {
  const host = new URL(url).hostname;
  if (!LOCAL.has(host)) throw new Error(`refusing ${host}: data-dream only fires at an app running on this machine`);
}

function readSeeds(path) {
  const files = statSync(path).isDirectory() ? readdirSync(path).filter((f) => f.endsWith(".json")).sort().map((f) => join(path, f)) : [path];
  return files.flatMap((f) => JSON.parse(readFileSync(f, "utf8")).map((s) => ({ category: basename(f, ".json"), ...s })));
}

export function classify(status, error) {
  if (error === "timeout") return "hang";
  if (error || status >= 500) return "crash";
  if (status >= 400) return "rejected";
  return "accepted";
}

function request(method, url, body, timeout) {
  const started = Date.now();
  return new Promise((resolve) => {
    let settled = false;
    const done = (r) => {
      if (settled) return;
      settled = true;
      resolve({ ...r, ms: Date.now() - started });
    };
    const headers = body === undefined ? {} : { "content-type": "application/json", "content-length": Buffer.byteLength(body) };
    const req = httpRequest(url, { method, agent: false, headers }, (res) => {
      let text = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (text += c));
      res.on("end", () => done({ status: res.statusCode, text, error: "" }));
      res.on("error", (e) => done({ status: res.statusCode, text, error: String(e.code || e.message) }));
    });
    req.setTimeout(timeout, () => {
      done({ status: 0, text: "", error: "timeout" });
      req.destroy();
    });
    req.on("error", (e) => done({ status: 0, text: "", error: String(e.code || e.message) }));
    if (body !== undefined) req.write(body);
    req.end();
  });
}

export async function fire({ url, method = "POST", template, path, timeout = 5000 }) {
  assertLocal(url.replace("@@", "x"));
  const results = [];
  for (const seed of readSeeds(path)) {
    const target = url.includes("@@") ? fillUrl(url, seed.raw) : url;
    const body = template ? fill(template, seed.raw, seed.id) : undefined;
    const r = await request(method, target, body, timeout);
    results.push({ id: seed.id, category: seed.category, why: seed.why, status: r.status, ms: r.ms, verdict: classify(r.status, r.error), error: r.error, body: r.text.slice(0, 300) });
  }
  return results;
}

const NIGHTMARES = new Set(["crash", "hang", "poison", "changed"]);
const MAX_RAW = 2200000;
const MEMORY_RAW = 4096;
const MAX_URL_RAW = 8000;

export function fits(target, raw) {
  return !target.url.includes("@@") || raw === null || raw.length <= MAX_URL_RAW;
}

export function shape(raw) {
  if (raw === null) return "missing";
  try {
    const v = JSON.parse(raw);
    return v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
  } catch {
    return "invalid";
  }
}

const MUTATORS = {
  number: [["negate", (v) => -v], ["tiny", (v) => v / 1000], ["huge", (v) => v * 1e6], ["as-text", (v) => String(v)], ["in-list", (v) => [v]]],
  string: [["doubled", (v) => v + v], ["upper", (v) => v.toUpperCase()], ["padded", (v) => ` ${v} `], ["half", (v) => v.slice(0, Math.ceil(v.length / 2))], ["in-list", (v) => [v]]],
  array: [["emptied", () => []], ["nested", (v) => [v]], ["first", (v) => (v.length ? v[0] : null)]],
  object: [["emptied", () => ({})], ["in-list", (v) => [v]], ["as-text", (v) => JSON.stringify(v)]],
  boolean: [["flipped", (v) => !v], ["as-text", (v) => String(v)]],
  null: [["empty-text", () => ""], ["zero", () => 0], ["false", () => false]],
  missing: [["null", () => null], ["empty-text", () => ""]],
  invalid: [["doubled", (r) => r + r, true], ["cut", (r) => r.slice(0, -1), true], ["quoted", (r) => JSON.stringify(r), true]]
};

export function mutate(raw) {
  const kind = shape(raw);
  const value = kind === "missing" || kind === "invalid" ? raw : JSON.parse(raw);
  return MUTATORS[kind]
    .map(([op, fn, rawLevel]) => {
      const out = fn(value);
      return { op, raw: rawLevel ? out : JSON.stringify(out) ?? "null" };
    })
    .filter((c) => c.raw !== raw && c.raw.length > 0 && c.raw.length <= MAX_RAW);
}

export function variants(parents, targets, max) {
  const byTarget = new Map(targets.map((t) => [t, []]));
  for (const p of parents) {
    const own = p.raw === null ? MUTATORS.missing.map(([op, fn]) => ({ op, raw: JSON.stringify(fn()) })) : mutate(p.raw);
    const mine = own.map((c) => ({ target: p.target, raw: c.raw, op: c.op, parents: [p.id] }));
    const moved = targets.filter((t) => t !== p.target).map((t) => ({ target: t, raw: p.raw, op: `transplant from ${p.target}`, parents: [p.id] }));
    for (const c of [...mine, ...moved]) byTarget.get(c.target).push(c);
  }
  return [...byTarget.values()].flatMap((list) => list.slice(0, max));
}

export function kindOf(r) {
  return `${r.target} ${r.verdict} ${r.status || r.error} ${shape(r.raw)}`;
}

function createRunner(plan, timeout) {
  const targets = new Map(plan.targets.map((t) => [t.name, t]));
  const probeOk = async (t) => {
    const r = await request(t.probe.method || "GET", t.probe.url, undefined, timeout);
    return !r.error && r.status < 500;
  };
  const setup = async () => {
    for (const s of plan.setup || []) {
      const r = await request(s.method || "POST", s.url, s.body, timeout);
      if (r.error || r.status >= 400) throw new Error(`setup ${s.method || "POST"} ${s.url} failed: ${r.status || r.error} ${r.text.slice(0, 120)}`);
    }
  };
  const reset = async () => {
    if (!plan.reset) return false;
    execSync(plan.reset, { stdio: "ignore", shell: "/bin/bash" });
    await setup();
    return true;
  };
  const fireOne = async (seed) => {
    const t = targets.get(seed.target);
    if (t.probe && !(await probeOk(t))) {
      if (!(await reset())) throw new Error(`${t.name}: the probe is down and the plan has no reset`);
      if (!(await probeOk(t))) throw new Error(`${t.name}: the reset did not bring the probe back`);
    }
    const watch = Boolean(t.probe);
    const url = t.url.includes("@@") ? fillUrl(t.url, seed.raw) : t.url;
    const body = t.template ? fill(t.template, seed.raw, seed.id) : undefined;
    const r = await request(t.method || "POST", url, body, timeout);
    let verdict = classify(r.status, r.error);
    if (verdict === "accepted" && t.echo && !["missing", "invalid"].includes(shape(seed.raw))) {
      const sent = JSON.parse(seed.raw);
      let echoed;
      try {
        echoed = JSON.stringify(JSON.parse(r.text)[t.echo]);
      } catch {}
      if (echoed !== JSON.stringify(sent) || (typeof sent === "number" && !Number.isFinite(sent))) verdict = "changed";
    }
    if (verdict !== "crash" && verdict !== "hang" && watch && !(await probeOk(t))) verdict = "poison";
    return { ...seed, status: r.status, error: r.error, verdict, body: r.text.slice(0, 200) };
  };
  return { setup, fireOne };
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function remembered(raw) {
  return raw === null || raw.length <= MEMORY_RAW ? raw : undefined;
}

export async function dream({ plan, memoryPath, journalPath, cycles = 5, max = 60, timeout = 3000, log = () => {}, date = today() }) {
  for (const u of [...plan.targets.flatMap((t) => [t.url, t.probe?.url]), ...(plan.setup || []).map((s) => s.url)].filter(Boolean)) assertLocal(u.replace("@@", "x"));
  const memory = existsSync(memoryPath) ? JSON.parse(readFileSync(memoryPath, "utf8")) : { nights: [], nightmares: [] };
  const night = memory.nights.length + 1;
  const names = plan.targets.map((t) => t.name);
  const byName = new Map(plan.targets.map((t) => [t.name, t]));
  const kinds = new Set(memory.nightmares.map((n) => n.kind));
  const fired = new Set();
  const key = (s) => JSON.stringify([s.target, s.raw]);
  const runner = createRunner(plan, timeout);
  await runner.setup();
  const stats = [];
  let parents = [];
  let woke = `reached the limit of ${cycles} cycles`;

  const open = memory.nightmares.filter((n) => !n.healed && n.raw !== undefined && names.includes(n.target));
  if (open.length) {
    let recurring = 0;
    let healed = 0;
    for (const m of open) {
      fired.add(key(m));
      const r = await runner.fireOne({ id: m.id, target: m.target, raw: m.raw });
      if (NIGHTMARES.has(r.verdict)) {
        recurring++;
        m.seen.push(night);
        parents.push({ id: m.id, target: m.target, raw: m.raw });
      } else {
        healed++;
        m.healed = night;
        m.healedAs = r.verdict;
      }
    }
    stats.push({ cycle: 0, from: "replay of earlier nights", fired: open.length, nightmares: recurring, newKinds: 0, healed });
    log(`night ${night} replay: ${open.length} old nightmares, ${recurring} recur, ${healed} healed`);
  }

  for (let cycle = 1; cycle <= cycles; cycle++) {
    let seeds;
    if (cycle === 1) {
      seeds = plan.targets.flatMap((t) => {
        const cat = Object.values(catalog(t.categories === "all" ? undefined : t.categories)).flat();
        const extra = (t.extra || []).flatMap((f) => JSON.parse(readFileSync(f, "utf8")));
        return [...cat, ...extra].map((s) => ({ id: s.id, target: t.name, raw: s.raw, op: "catalog", parents: [] }));
      });
    } else {
      seeds = variants(parents, names, max).map((c, i) => ({ ...c, id: `c${cycle}-${i + 1}` }));
    }
    seeds = seeds.filter((s) => fits(byName.get(s.target), s.raw) && !fired.has(key(s)) && fired.add(key(s)));
    if (!seeds.length) {
      woke = `nothing left to dream in cycle ${cycle}`;
      break;
    }
    const nightmares = [];
    let fresh = 0;
    for (const s of seeds) {
      const r = await runner.fireOne(s);
      if (!NIGHTMARES.has(r.verdict)) continue;
      const id = `n${night}.${s.id}@${s.target}`;
      const kind = kindOf(r);
      const founder = !kinds.has(kind);
      if (founder) {
        kinds.add(kind);
        fresh++;
      }
      memory.nightmares.push({ id, night, cycle, target: s.target, raw: remembered(s.raw), length: s.raw?.length ?? 0, seed: s.id, op: s.op, parents: s.parents, verdict: r.verdict, status: r.status || r.error, kind, founder, seen: [night], healed: null });
      nightmares.push({ id, target: s.target, raw: s.raw });
    }
    stats.push({ cycle, from: cycle === 1 ? "catalog and domain seeds" : `dreamed from cycle ${cycle - 1}`, fired: seeds.length, nightmares: nightmares.length, newKinds: fresh, healed: 0 });
    log(`night ${night} cycle ${cycle}: fired ${seeds.length}, nightmares ${nightmares.length}, new kinds ${fresh}`);
    if (cycle > 1 && fresh === 0) {
      woke = `no new kind of nightmare in cycle ${cycle}`;
      break;
    }
    parents = cycle === 1 ? [...parents, ...nightmares] : nightmares;
  }

  memory.nights.push({ night, date, cycles: stats, woke });
  mkdirSync(dirname(memoryPath), { recursive: true });
  writeFileSync(memoryPath, JSON.stringify(memory, null, 2) + "\n");
  if (journalPath) {
    mkdirSync(dirname(journalPath), { recursive: true });
    writeFileSync(journalPath, journal(memory));
    writeFileSync(join(dirname(journalPath), "dream-chart.svg"), chart(memory));
  }
  log(`night ${night} woke: ${woke}`);
  return memory;
}

function show(raw, length) {
  if (raw === null) return "(missing)";
  if (raw === undefined) return `(${length} chars)`;
  const s = raw.length > 32 ? `${raw.slice(0, 29)}...` : raw;
  return s.replace(/[\x00-\x1f]/g, " ").replace(/\|/g, "\\|").replace(/`/g, "'");
}

function lineage(entry, byId) {
  const steps = [];
  let cur = entry;
  while (cur) {
    const parent = byId.get(cur.parents?.[0]);
    steps.push(`\`${show(cur.raw, cur.length)}\` on ${cur.target}${cur.op === "catalog" ? ` (catalog ${cur.seed})` : ""}`);
    if (parent) steps.push(`⟵ ${cur.op} ⟵`);
    cur = parent;
  }
  return steps.join(" ");
}

function mermaid(entries, byId) {
  const nodes = new Map();
  const edges = new Set();
  const node = (e) => {
    if (!nodes.has(e.id)) nodes.set(e.id, `d${nodes.size}["${show(e.raw, e.length).replace(/"/g, "'")} @ ${e.target}"]`);
    return nodes.get(e.id).split("[")[0];
  };
  for (const e of entries) {
    let cur = e;
    while (cur && byId.get(cur.parents?.[0])) {
      const parent = byId.get(cur.parents[0]);
      edges.add(`  ${node(parent)} -->|${cur.op}| ${node(cur)}`);
      cur = parent;
    }
  }
  if (!edges.size) return "";
  return ["```mermaid", "graph LR", ...[...nodes.values()].map((n) => `  ${n}`), ...edges, "```"].join("\n");
}

function firstPerKind(list) {
  const seen = new Map();
  for (const m of list) if (!seen.has(m.kind)) seen.set(m.kind, m);
  return [...seen.values()];
}

function grouped(list) {
  const map = new Map();
  for (const m of list) map.set(m.kind, [...(map.get(m.kind) || []), m]);
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

export function journal(memory) {
  const byId = new Map(memory.nightmares.map((n) => [n.id, n]));
  const out = ["# data-dream journal", "", '<p align="center"><img src="dream-chart.svg" alt="nightmares per cycle"></p>', ""];
  for (const n of [...memory.nights].reverse()) {
    const mine = memory.nightmares.filter((m) => m.night === n.night);
    const founders = mine.filter((m) => m.founder);
    const dreamed = founders.filter((m) => m.cycle > 1);
    const healed = memory.nightmares.filter((m) => m.healed === n.night);
    out.push(`## Night ${n.night} · ${n.date} · woke: ${n.woke}`, "");
    out.push("| Cycle | Dreams | Fired | Nightmares | New kinds | Healed |", "|---|---|---|---|---|---|");
    for (const c of n.cycles) out.push(`| ${c.cycle} | ${c.from} | ${c.fired} | ${c.nightmares} | ${c.newKinds} | ${c.healed} |`);
    out.push("");
    const recurring = memory.nightmares.filter((m) => m.night < n.night && m.seen.includes(n.night));
    if (healed.length) {
      out.push(`### Healed since the night before (${healed.length} values)`, "", "| Kind | Values healed | Now | One of them |", "|---|---|---|---|");
      for (const [kind, list] of grouped(healed)) out.push(`| ${kind} | ${list.length} | ${[...new Set(list.map((h) => h.healedAs))].join(", ")} | \`${show(list[0].raw, list[0].length)}\` |`);
      out.push("");
    }
    if (n.cycles[0]?.cycle === 0) {
      out.push(`### Still broken from earlier nights (${recurring.length} values)`, "", "| Kind | Values | First dreamed | One of them |", "|---|---|---|---|");
      for (const [kind, list] of grouped(recurring)) out.push(`| ${kind} | ${list.length} | night ${list[0].night}, cycle ${list[0].cycle} | \`${show(list[0].raw, list[0].length)}\` |`);
      out.push("");
      const outlived = firstPerKind(recurring.filter((m) => m.cycle > 1 && healed.some((h) => h.kind === m.kind)));
      if (outlived.length) {
        out.push(`### Dreams that outlived a fix (${outlived.length})`, "", "A fix healed other values of these kinds, but a value the dreams invented still breaks the app.", "");
        for (const d of outlived) out.push(`* ${lineage(d, byId)}`);
        out.push("");
      }
    }
    out.push(`### New kinds of nightmare (${founders.length})`, "", "| Cycle | Kind | First value | How it was dreamed |", "|---|---|---|---|");
    for (const f of founders) out.push(`| ${f.cycle} | ${f.kind} | \`${show(f.raw, f.length)}\` | ${f.op === "catalog" ? `catalog ${f.seed}` : f.op} |`);
    out.push("");
    const spread = firstPerKind(mine.filter((m) => m.cycle > 1 && !m.founder));
    if (dreamed.length || spread.length) {
      out.push("### Family tree", "");
      if (dreamed.length) {
        out.push(`New kinds only the dreams found (${dreamed.length}):`, "");
        for (const d of dreamed) out.push(`* ${lineage(d, byId)}`);
        out.push("");
      }
      if (spread.length) {
        out.push(`First dreamed value of each known kind (${spread.length}):`, "");
        for (const d of spread) out.push(`* ${lineage(d, byId)}`);
        out.push("");
      }
      out.push(mermaid([...dreamed, ...spread], byId), "");
    }
  }
  return out.join("\n").trimEnd() + "\n";
}

export function chart(memory) {
  const bars = memory.nights.flatMap((n) => n.cycles.map((c) => ({ label: `N${n.night} C${c.cycle}`, night: n.night, value: c.nightmares, fresh: c.newKinds, healed: c.healed })));
  const w = Math.max(320, 60 + bars.length * 56);
  const h = 240;
  const top = Math.max(1, ...bars.map((b) => b.value));
  const colors = ["#7c3aed", "#0ea5e9", "#16a34a", "#f59e0b"];
  const parts = bars.map((b, i) => {
    const x = 40 + i * 56;
    const bh = Math.round((b.value / top) * 150);
    const y = 190 - bh;
    const note = b.healed ? `${b.healed} healed` : b.fresh ? `+${b.fresh} kinds` : "";
    return `<rect x="${x}" y="${y}" width="40" height="${bh}" rx="4" fill="${colors[(b.night - 1) % colors.length]}"/><text x="${x + 20}" y="${y - 6}" font-size="12" text-anchor="middle">${b.value}</text><text x="${x + 20}" y="208" font-size="11" text-anchor="middle">${b.label}</text><text x="${x + 20}" y="224" font-size="10" text-anchor="middle" fill="#64748b">${note}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#fffdf7"/><g font-family="sans-serif" fill="#1e293b">${parts.join("")}</g></svg>\n`;
}

function defaultMemory() {
  let root = process.cwd();
  try {
    root = execSync("git rev-parse --show-toplevel", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}
  return join(homedir(), ".data-dream", basename(root), "memory.json");
}

function parse(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      o[argv[i].slice(2)] = argv[i + 1];
      i++;
    } else o._.push(argv[i]);
  }
  return o;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const a = parse(rest);
  if (cmd === "categories") {
    for (const [n, l] of Object.entries(catalog())) console.log(`${n}\t${l.length}`);
  } else if (cmd === "seeds") {
    if (!a._[0]) throw new Error("usage: dream.mjs seeds <out-dir> [--only unicode,money]");
    console.log(JSON.stringify(seeds(a._[0], a.only)));
  } else if (cmd === "fire") {
    if (!a.url || !a.seeds) throw new Error("usage: dream.mjs fire --url http://localhost:PORT/path --seeds <dir|file> [--method POST] [--template '{\"name\":@@}'] [--out results.json] [--timeout 5000]");
    const results = await fire({ url: a.url, method: a.method, template: a.template, path: a.seeds, timeout: Number(a.timeout || 5000) });
    if (a.out) {
      mkdirSync(dirname(a.out), { recursive: true });
      writeFileSync(a.out, JSON.stringify(results, null, 2) + "\n");
    }
    const count = (v) => results.filter((r) => r.verdict === v).length;
    console.log(`fired ${results.length}: crash ${count("crash")}, hang ${count("hang")}, rejected ${count("rejected")}, accepted ${count("accepted")}`);
    for (const r of results.filter((r) => r.verdict === "crash" || r.verdict === "hang")) console.log(`${r.verdict}\t${r.id}\t${r.status || r.error}\t${r.why}`);
  } else if (cmd === "dream") {
    if (!a.plan) throw new Error("usage: dream.mjs dream --plan plan.json [--memory ~/.data-dream/<repo>/memory.json] [--journal data-dream/journal.md] [--cycles 5] [--max 60] [--timeout 3000]");
    const memory = await dream({
      plan: JSON.parse(readFileSync(a.plan, "utf8")),
      memoryPath: a.memory || defaultMemory(),
      journalPath: a.journal || "data-dream/journal.md",
      cycles: Number(a.cycles || 5),
      max: Number(a.max || 60),
      timeout: Number(a.timeout || 3000),
      log: console.log
    });
    const open = memory.nightmares.filter((n) => n.founder && !n.healed).length;
    console.log(`memory: ${memory.nights.length} nights, ${memory.nightmares.length} nightmares, ${open} open kinds`);
  } else {
    throw new Error("usage: dream.mjs categories | seeds | fire | dream");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  main().catch((e) => {
    console.error(`data-dream: ${e.message}`);
    process.exit(1);
  });
}
