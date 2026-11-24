import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, expand, seeds, fill, fillUrl, assertLocal, classify, fire } from "../scripts/dream.mjs";

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
  assert.equal(fill('{"name":@@}', '"$&x"'), '{"name":"$&x"}');
  assert.equal(fillUrl("http://localhost/o?from=@@", null), "http://localhost/o");
  assert.equal(fillUrl("http://localhost/o?from=@@", JSON.stringify("a b&c")), "http://localhost/o?from=a%20b%26c");
  assert.equal(fillUrl("http://localhost/o?n=@@", "1e309"), "http://localhost/o?n=1e309");
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
