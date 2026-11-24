#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, realpathSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

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

export function fill(template, raw) {
  if (raw === null) return template.replace(/,?\s*"[^"]+"\s*:\s*@@/, "").replace("@@", "");
  return template.replace("@@", () => raw);
}

export function fillUrl(url, raw) {
  if (raw === null) return url.replace(/[?&][^=&]+=@@/, "");
  let text = raw;
  try {
    const v = JSON.parse(raw);
    if (typeof v === "string") text = v;
  } catch {}
  return url.replace("@@", () => encodeURIComponent(text));
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

export async function fire({ url, method = "POST", template, path, timeout = 5000 }) {
  assertLocal(url.replace("@@", "x"));
  const results = [];
  for (const seed of readSeeds(path)) {
    const target = url.includes("@@") ? fillUrl(url, seed.raw) : url;
    const body = template ? fill(template, seed.raw) : undefined;
    const started = Date.now();
    let status = 0;
    let text = "";
    let error = "";
    try {
      const res = await fetch(target, { method, body, headers: body ? { "content-type": "application/json" } : {}, signal: AbortSignal.timeout(timeout) });
      status = res.status;
      text = (await res.text()).slice(0, 300);
    } catch (e) {
      error = e.name === "TimeoutError" ? "timeout" : String(e.cause?.code || e.message);
    }
    results.push({ id: seed.id, category: seed.category, why: seed.why, status, ms: Date.now() - started, verdict: classify(status, error), error, body: text });
  }
  return results;
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
  } else {
    throw new Error("usage: dream.mjs categories | seeds | fire");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  main().catch((e) => {
    console.error(`data-dream: ${e.message}`);
    process.exit(1);
  });
}
