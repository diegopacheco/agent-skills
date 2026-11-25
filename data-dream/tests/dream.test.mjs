import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, expand, seeds, fill, fillUrl, assertLocal, classify, fire, mutate, variants, kindOf, fits, dream } from "../scripts/dream.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), "data-dream-"));
let app;
let base;

before(async () => {
  app = spawn(process.execPath, [join(HERE, "fixtures", "app.mjs")]);
  const port = await new Promise((ok) => app.stdout.once("data", (d) => ok(String(d).trim())));
  base = `http://127.0.0.1:${port}`;
});

after(() => {
  app.kill();
  rmSync(TMP, { recursive: true, force: true });
});

test("every catalog value says why it breaks things, so findings explain themselves", () => {
  const all = catalog();
  assert.equal(Object.keys(all).length, 9);
  for (const list of Object.values(all)) for (const s of list) assert.ok(s.why && s.why.length >= 15, s.id);
  const ids = Object.values(all).flat().map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 98);
});

test("every raw value except a missing field and the deliberately broken ones is valid JSON text", () => {
  const broken = new Set(["NaN", "Infinity", "{"]);
  for (const s of Object.values(catalog()).flat()) {
    if (s.raw === null || broken.has(s.raw)) continue;
    assert.doesNotThrow(() => JSON.parse(s.raw), s.id);
  }
});

test("generators build values of the exact size a limit check must catch", () => {
  assert.equal(JSON.parse(expand({ gen: "repeat", char: "a", count: 256, why: "w" }).raw).length, 256);
  assert.equal(Buffer.byteLength(JSON.parse(expand({ gen: "repeat", char: "é", count: 128, why: "w" }).raw)), 256);
  assert.equal(JSON.parse(expand({ gen: "array", count: 10000, why: "w" }).raw).length, 10000);
  assert.equal(expand({ gen: "nest", count: 3, why: "w" }).raw, "[[[]]]");
  assert.equal(expand({ gen: "missing", why: "w" }).raw, null);
  assert.throws(() => expand({ gen: "nope", why: "w" }), /unknown generator/);
});

test("seeds writes one file per chosen category and refuses unknown ones", () => {
  const out = join(TMP, "seeds");
  assert.deepEqual(seeds(out, "money,time"), { money: 12, time: 16 });
  assert.deepEqual(readdirSync(out).sort(), ["money.json", "time.json"]);
  assert.equal(JSON.parse(readFileSync(join(out, "money.json"), "utf8"))[0].id, "money-1");
  assert.throws(() => seeds(out, "colors"), /unknown category colors/);
});

test("a missing field is removed from the body instead of sent as an empty value", () => {
  assert.equal(fill('{"name":@@}', null), "{}");
  assert.equal(fill('{"a":1,"name":@@}', null), '{"a":1}');
  assert.equal(fill('{"name":@@,"email":"x"}', null), '{"email":"x"}');
  assert.equal(fill('{"name":@@, "email":"x"}', null), '{"email":"x"}');
  assert.equal(fill('{"name":@@}', '"$&x"'), '{"name":"$&x"}');
  assert.equal(fill('{"name":@@,"email":"@@id@shop.io"}', '"a"', "unicode-3"), '{"name":"a","email":"unicode-3@shop.io"}');
  assert.equal(fill('{"email":"@@id@shop.io","name":@@}', null, "empty-10"), '{"email":"empty-10@shop.io"}');
  assert.equal(fillUrl("http://localhost/o?from=@@", null), "http://localhost/o");
  assert.equal(fillUrl("http://localhost/o?from=@@", JSON.stringify("a b&c")), "http://localhost/o?from=a%20b%26c");
  assert.equal(fillUrl("http://localhost/o?n=@@", "1e309"), "http://localhost/o?n=1e309");
  assert.equal(fillUrl("http://localhost/o?q=@@", JSON.stringify(String.fromCharCode(0xd800))), "http://localhost/o?q=%EF%BF%BD");
});

test("only an app on this machine can be fired at", async () => {
  assert.doesNotThrow(() => assertLocal("http://localhost:8080/x"));
  assert.doesNotThrow(() => assertLocal("http://127.0.0.1:8080/x"));
  assert.doesNotThrow(() => assertLocal("http://[::1]:8080/x"));
  assert.throws(() => assertLocal("https://api.company.com/x"), /refusing/);
  assert.throws(() => assertLocal("http://localhost.evil.com/x"), /refusing/);
  await assert.rejects(fire({ url: "http://10.0.0.5/users", path: join(TMP, "seeds") }), /refusing/);
});

test("a 4xx is the app defending itself, a 5xx or a lost connection is a crash", () => {
  assert.equal(classify(500, ""), "crash");
  assert.equal(classify(0, "ECONNRESET"), "crash");
  assert.equal(classify(0, "timeout"), "hang");
  assert.equal(classify(422, ""), "rejected");
  assert.equal(classify(201, ""), "accepted");
});

test("fire finds the crash when a number or a list reaches name.trim()", async () => {
  const out = join(TMP, "fire");
  seeds(out, "numbers,empty");
  const r = await fire({ url: `${base}/users`, template: '{"name":@@}', path: out });
  const by = Object.fromEntries(r.map((x) => [x.id, x.verdict]));
  assert.equal(by["numbers-3"], "crash");
  assert.equal(by["empty-7"], "crash");
  assert.equal(by["empty-1"], "rejected");
  assert.equal(by["empty-10"], "rejected");
  assert.equal(by["numbers-13"], "accepted");
  assert.equal(by["numbers-11"], "crash");
});

test("fire marks a request that never answers as a hang instead of waiting forever", async () => {
  const file = join(TMP, "wait.json");
  writeFileSync(file, JSON.stringify([{ id: "n-1", raw: "5", why: "small" }, { id: "n-2", raw: "2147483647", why: "max int" }]));
  const r = await fire({ method: "GET", url: `${base}/wait?n=@@`, path: file, timeout: 300 });
  assert.deepEqual(r.map((x) => x.verdict), ["accepted", "hang"]);
});

test("a nightmare dreams variants by mutation, each a new value of the same input", () => {
  assert.deepEqual(mutate("-1").map((c) => [c.op, c.raw]), [["negate", "1"], ["tiny", "-0.001"], ["huge", "-1000000"], ["as-text", '"-1"'], ["in-list", "[-1]"]]);
  assert.deepEqual(mutate('"ab"').map((c) => c.op), ["doubled", "upper", "padded", "half", "in-list"]);
  assert.deepEqual(mutate("{").map((c) => [c.op, c.raw]), [["doubled", "{{"], ["quoted", '"{"']]);
  assert.deepEqual(mutate("[]").map((c) => [c.op, c.raw]), [["nested", "[[]]"], ["first", "null"]]);
});

test("a nightmare is transplanted to every other input and each input is capped", () => {
  const dreamed = variants([{ id: "p1", target: "a", raw: "-1" }], ["a", "b", "c"], 3);
  assert.equal(dreamed.filter((k) => k.target === "a").length, 3);
  assert.deepEqual(dreamed.filter((k) => k.target !== "a").map((k) => [k.target, k.raw, k.op]), [["b", "-1", "transplant from a"], ["c", "-1", "transplant from a"]]);
  assert.ok(dreamed.every((k) => k.parents[0] === "p1"));
  assert.deepEqual(variants([{ id: "m", target: "a", raw: null }], ["a"], 5).map((k) => k.raw), ["null", '""']);
});

test("a kind is the input, the verdict, the status and the shape of the value", () => {
  assert.equal(kindOf({ target: "user-name", verdict: "crash", status: 500, raw: "-1" }), "user-name crash 500 number");
  assert.equal(kindOf({ target: "q", verdict: "hang", status: 0, error: "timeout", raw: null }), "q hang timeout missing");
});

test("values too long for a URL are not dreamed into URL inputs", () => {
  assert.equal(fits({ url: "http://localhost/q?x=@@" }, JSON.stringify("a".repeat(9000))), false);
  assert.equal(fits({ url: "http://localhost/items" }, JSON.stringify("a".repeat(9000))), true);
});

const nightPlan = () => ({
  reset: `node ${join(HERE, "fixtures", "call.mjs")} POST ${base}/reset`,
  targets: [
    { name: "user-name", url: `${base}/users`, template: '{"name":@@}', categories: "numbers" },
    { name: "item-when", url: `${base}/items`, template: '{"when":@@}', categories: "empty", echo: "when", probe: { url: `${base}/report` } }
  ]
});

test("night 1 dreams in cycles, finds kinds the catalog missed and records their family tree", async () => {
  const memoryPath = join(TMP, "night", "memory.json");
  const journalPath = join(TMP, "night", "journal.md");
  const lines = [];
  const memory = await dream({ plan: nightPlan(), memoryPath, journalPath, cycles: 4, max: 20, timeout: 2000, log: (l) => lines.push(l), date: "2026-11-24" });
  const kinds = memory.nightmares.filter((n) => n.founder).map((n) => n.kind);
  assert.ok(kinds.includes("user-name crash 500 number"));
  assert.ok(kinds.includes("item-when poison 201 null"));
  const dreamed = memory.nightmares.find((n) => n.kind === "item-when poison 201 number");
  assert.equal(dreamed.cycle, 2);
  assert.equal(dreamed.op, "transplant from user-name");
  assert.equal(memory.nightmares.find((n) => n.id === dreamed.parents[0]).target, "user-name");
  assert.match(memory.nights[0].woke, /no new kind of nightmare|nothing left to dream|limit/);
  const text = readFileSync(journalPath, "utf8");
  assert.match(text, /## Night 1 · 2026-11-24/);
  assert.match(text, /\| 2 \| dreamed from cycle 1 \|/);
  assert.match(text, /⟵ transplant from user-name ⟵/);
  assert.match(text, /```mermaid/);
  assert.ok(readFileSync(join(TMP, "night", "dream-chart.svg"), "utf8").includes("N1 C1"));
  assert.ok(lines.some((l) => l.startsWith("night 1 cycle 2:")));
  assert.ok(!text.includes(TMP));
});

test("night 2 replays the memory first: fixed nightmares heal, the rest recur and dream again", async () => {
  await fetch(`${base}/fix`, { method: "POST" });
  const memoryPath = join(TMP, "night", "memory.json");
  const journalPath = join(TMP, "night", "journal.md");
  const before = JSON.parse(readFileSync(memoryPath, "utf8")).nightmares.filter((n) => n.target === "user-name").length;
  assert.ok(before > 0);
  const memory = await dream({ plan: nightPlan(), memoryPath, journalPath, cycles: 3, max: 20, timeout: 2000, date: "2026-11-25" });
  assert.equal(memory.nights.length, 2);
  const replay = memory.nights[1].cycles[0];
  assert.equal(replay.cycle, 0);
  const names = memory.nightmares.filter((n) => n.target === "user-name" && n.night === 1);
  assert.equal(names.length, before);
  const typed = names.filter((n) => !n.kind.endsWith(" invalid"));
  const invalid = names.filter((n) => n.kind.endsWith(" invalid"));
  assert.ok(typed.length > 0 && typed.every((n) => n.healed === 2 && n.healedAs === "rejected"));
  assert.ok(invalid.length > 0 && invalid.every((n) => !n.healed && n.seen.includes(2)));
  assert.ok(memory.nightmares.some((n) => n.target === "item-when" && n.night === 1 && n.seen.includes(2) && !n.healed));
  assert.equal(replay.healed, memory.nightmares.filter((n) => n.healed === 2).length);
  assert.ok(memory.nightmares.filter((n) => n.healed === 2).every((n) => n.target === "user-name"));
  const text = readFileSync(journalPath, "utf8");
  assert.ok(text.indexOf("## Night 2") < text.indexOf("## Night 1"));
  assert.match(text, /### Healed since the night before \(\d+ values\)\n\n\| Kind \| Values healed \|/);
  assert.match(text, /### Still broken from earlier nights \(\d+ values\)/);
  assert.match(text, /\| item-when poison 201 /);
});

test("a probe that stays down without a reset stops the dream loudly", async () => {
  const plan = { targets: [{ name: "item-when", url: `${base}/items`, template: '{"when":@@}', categories: "empty", probe: { url: `${base}/report` } }] };
  await fetch(`${base}/items`, { method: "POST", body: "{}" });
  await assert.rejects(dream({ plan, memoryPath: join(TMP, "loud", "memory.json"), cycles: 1 }), /no reset/);
  await fetch(`${base}/reset`, { method: "POST" });
});

test("a plan pointing anywhere but this machine is refused before anything is fired", async () => {
  const plan = { targets: [{ name: "x", url: "https://api.company.com/users", template: "{}", categories: "empty" }] };
  await assert.rejects(dream({ plan, memoryPath: join(TMP, "remote", "memory.json") }), /refusing/);
});
