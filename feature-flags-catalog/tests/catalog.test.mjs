import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, readFile, cp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { scan, render, normalize } from "../scripts/catalog.mjs";

const FX = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const NOW = "2026-11-24T00:00:00Z";
const run = (lang, opts = {}) => scan(join(FX, lang), { now: NOW, ...opts });
const flag = (data, name, side = "back") => {
  const f = data.flags.find((x) => x.name === name && x.side === side);
  assert.ok(f, "flag " + side + ":" + name + " was not found");
  return f;
};

test("one flag written as env var, yaml key and code literal is the same flag, otherwise every flag would look unused on one side", () => {
  assert.equal(normalize("FEATURE_NEW_PRICING_ENGINE"), normalize("new-pricing-engine"));
  assert.equal(normalize("VITE_FEATURE_DARK_MODE"), normalize("dark-mode"));
  assert.equal(normalize("features.newCheckout"), normalize("new_checkout"));
});

test("java 8: togglz, ff4j and spring flags nobody reads are unused so they can be deleted", async () => {
  const d = await run("java8");
  assert.equal(flag(d, "OLD_SEARCH").status, "unused");
  assert.equal(flag(d, "dead-banner").status, "unused");
  assert.equal(flag(d, "gift-wrap").status, "unused");
  assert.equal(flag(d, "NEW_SEARCH").status, "used");
  assert.deepEqual(flag(d, "legacy-cart").providers, ["FF4J"]);
  assert.equal(flag(d, "express-shipping").status, "used");
});

test("java 8: a launchdarkly key held in a constant still counts as a read, or a live flag would be deleted", async () => {
  const d = await run("java8");
  const f = flag(d, "checkout-v2");
  assert.equal(f.status, "used");
  assert.equal(f.declaredOn, "provider");
  assert.equal(f.references[0].kind, "constant");
});

test("java 25: optimizely and openfeature reads match the yaml declarations under app.features", async () => {
  const d = await run("java25");
  assert.deepEqual(flag(d, "pricing-v3").providers, ["Config", "Optimizely"]);
  assert.equal(flag(d, "pricing-v3").value, "on");
  assert.equal(flag(d, "search-ranking").value, "off");
  assert.equal(flag(d, "unused-thing").status, "unused");
});

test("kotlin: a flag only reachable through a string template is marked dynamic, not unused, so it is not deleted blindly", async () => {
  const d = await run("kotlin");
  assert.equal(flag(d, "region-eu").status, "maybe-dynamic");
  assert.equal(flag(d, "kotlin-old-ui").status, "unused");
  assert.equal(flag(d, "BETA_PAY").status, "used");
  assert.equal(flag(d, "OLD_PAY").status, "unused");
});

test("scala 2: hocon flags read through typesafe config and split treatments are found, and a config key inside a string is not a ghost", async () => {
  const d = await run("scala2");
  assert.equal(flag(d, "scala-fast-path").status, "used");
  assert.equal(flag(d, "scala-unused").status, "unused");
  assert.equal(flag(d, "scala-split-test").providers[0], "Split");
  assert.equal(d.flags.filter((f) => f.status === "ghost").length, 0);
});

test("scala 3: indentation syntax and sys.env flags are found", async () => {
  const d = await run("scala3");
  assert.equal(flag(d, "scala3-flag").status, "used");
  assert.equal(flag(d, "FEATURE_SCALA3_BETA").status, "used");
  assert.equal(flag(d, "FEATURE_SCALA3_DEAD").status, "unused");
});

test("go: a flag read only by tests is test-only, because production never takes that branch", async () => {
  const d = await run("go", { exports: ["../export/launchdarkly-flags.json"] });
  assert.equal(flag(d, "FEATURE_GO_TESTONLY").status, "test-only");
  assert.equal(flag(d, "FEATURE_GO_FORGOTTEN").status, "unused");
  assert.equal(flag(d, "go-checkout").status, "used");
  assert.equal(flag(d, "go-flipt").providers[0], "Flipt");
});

test("go: a provider export finds saas flags no code reads, which a repo-only scan can never see", async () => {
  const d = await run("go", { exports: ["../export/launchdarkly-flags.json"] });
  assert.equal(flag(d, "ld-orphan").status, "unused");
  assert.equal(flag(d, "go-flag").value, "on");
  assert.ok(d.dynamics.some((x) => x.prefix === "go-region-"));
});

test("rust 2024: cargo features behind cfg attributes are reads, unused cargo features are not", async () => {
  const d = await run("rust");
  assert.equal(flag(d, "metrics").status, "used");
  assert.equal(flag(d, "legacy-io").status, "unused");
  assert.equal(flag(d, "rust-flag").providers[0], "OpenFeature");
});

test("python: each sdk is attributed by its import, so the report says which provider to clean up", async () => {
  const d = await run("python");
  const p = (n) => flag(d, n).providers.filter((x) => x !== "Flag file")[0];
  assert.equal(p("py-flag"), "LaunchDarkly");
  assert.equal(p("py-posthog"), "PostHog");
  assert.equal(p("py-waffle"), "Django Waffle");
  assert.equal(p("py-flagsmith"), "Flagsmith");
  assert.equal(p("py-gate"), "Statsig");
  assert.equal(flag(d, "py-local-dead").status, "unused");
});

test("node and bun: frontend files go to the front side and server files to the back side", async () => {
  const d = await run("node");
  assert.equal(flag(d, "ts-growth", "front").providers[0], "GrowthBook");
  assert.equal(flag(d, "ts-gate", "front").providers[0], "Statsig");
  assert.equal(flag(d, "ts-configcat", "front").providers[0], "ConfigCat");
  assert.equal(flag(d, "VITE_FEATURE_TS_OLD", "front").status, "unused");
  assert.equal(flag(d, "VITE_FEATURE_TS_REGION_EU", "front").status, "maybe-dynamic");
  assert.equal(flag(d, "node-flag").providers[0], "LaunchDarkly");
  assert.equal(flag(d, "ts-eppo").providers[0], "Eppo");
  assert.equal(flag(d, "ts-devcycle").providers[0], "DevCycle");
  assert.equal(flag(d, "ts-opt").providers[0], "Optimizely");
  assert.equal(flag(d, "FEATURE_BUN_FAST").status, "used");
});

test("eval logs give the last evaluation date, which is what the 3 week deletion rule needs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await cp(join(FX, "java25"), join(dir, "app"), { recursive: true });
  await writeFile(join(dir, "app.log"), [
    JSON.stringify({ "@timestamp": "2026-10-01T10:00:00Z", message: "flag_evaluated", flag: "pricing-v3", value: true }),
    JSON.stringify({ "@timestamp": "2026-11-20T10:00:00Z", message: "flag_evaluated", flag: "search-ranking", value: false }),
    JSON.stringify({ "@timestamp": "2026-11-21T10:00:00Z", message: "order placed" })
  ].join("\n"));
  const d = await scan(join(dir, "app"), { now: NOW, evalLogs: ["../app.log"] });
  assert.equal(flag(d, "pricing-v3").evaluations.daysSinceLast, 53);
  assert.equal(flag(d, "search-ranking").evaluations.count, 1);
  assert.equal(flag(d, "unused-thing").evaluations, null);
  assert.equal(d.evalLogs.coverageDays, 53);
});

test("logs that cover less than 21 days report their real coverage, so a quiet week is never sold as a quiet 3 weeks", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await cp(join(FX, "java25"), join(dir, "app"), { recursive: true });
  await writeFile(join(dir, "app.log"), JSON.stringify({ "@timestamp": "2026-11-20T10:00:00Z", message: "flag_evaluated", flag: "pricing-v3", value: true }));
  const d = await scan(join(dir, "app"), { now: NOW, evalLogs: ["../app.log"] });
  assert.equal(d.evalLogs.coverageDays, 3);
  assert.ok(d.evalLogs.coverageDays < d.evalLogs.windowDays);
});

test("the review file lets the agent settle a dynamic flag, and the rendered site carries it", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  const d = await run("kotlin");
  await writeFile(join(dir, "flags.json"), JSON.stringify(d));
  await writeFile(join(dir, "review.json"), JSON.stringify([{ side: "back", name: "region-eu", status: "used", note: "built by region-$region for eu users" }]));
  const html = await readFile(await render(dir), "utf8");
  assert.ok(html.includes("built by region-$region for eu users"));
  assert.ok(!html.includes("/*__DATA__*/null"));
  assert.ok(html.includes('"status":"used","value":"on"'));
});

test("an import path like ../flags.json is not a flag, or every app would show ghost flags named json and ts", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await mkdir(join(dir, "ui", "src"), { recursive: true });
  await writeFile(join(dir, "ui", "flags.json"), JSON.stringify({ "dark-mode": true }));
  await writeFile(join(dir, "ui", "src", "flags.ts"), 'import declared from "../flags.json";\nexport const on = flags.isEnabled("dark-mode");\n');
  await writeFile(join(dir, "ui", "src", "app.ts"), 'import { on } from "./flags.ts";\n');
  const d = await scan(dir, { now: NOW });
  assert.deepEqual(d.flags.map((f) => f.side + ":" + f.name), ["front:dark-mode"]);
});

test("eval logs tagged with a side only count for that side, so a backend read never makes a frontend flag look alive", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await mkdir(join(dir, "app", "backend"), { recursive: true });
  await mkdir(join(dir, "app", "ui"), { recursive: true });
  await writeFile(join(dir, "app", "backend", "application.properties"), "features.shared=true\n");
  await writeFile(join(dir, "app", "ui", "flags.json"), JSON.stringify({ shared: true }));
  await writeFile(join(dir, "back.log"), JSON.stringify({ time: "2026-11-23T00:00:00Z", event: "flag_evaluated", flag: "shared", value: true }));
  const d = await scan(join(dir, "app"), { now: NOW, evalLogs: ["back:../back.log"] });
  assert.equal(flag(d, "shared", "back").evaluations.count, 1);
  assert.equal(flag(d, "shared", "front").evaluations, null);
});

test("a dynamic-key flag the logs show as evaluated is used, and one never seen stays a candidate", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await cp(join(FX, "kotlin"), join(dir, "app"), { recursive: true });
  await writeFile(join(dir, "app.log"), JSON.stringify({ time: "2026-11-23T00:00:00Z", event: "flag_evaluated", flag: "region-eu", value: true }));
  const seen = await scan(join(dir, "app"), { now: NOW, evalLogs: ["../app.log"] });
  assert.equal(flag(seen, "region-eu").status, "used");
  assert.match(flag(seen, "region-eu").note, /dynamic key/);
  assert.equal(flag(await scan(join(dir, "app"), { now: NOW }), "region-eu").status, "maybe-dynamic");
});

test("a name only tests read and no config declares is not a flag, so test typos do not pollute the catalog", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await mkdir(join(dir, "bff", "test"), { recursive: true });
  await writeFile(join(dir, "bff", "test", "x.test.ts"), 'flags.isEnabled("typo-flag");\n');
  const d = await scan(dir, { now: NOW });
  assert.equal(d.flags.length, 0);
});

test("a flag name with a closing script tag cannot break out of the rendered page", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ffc-"));
  await mkdir(join(dir, "app"));
  await writeFile(join(dir, "app", "flags.json"), JSON.stringify({ "</script><script>alert(1)</script>": true }));
  const d = await scan(join(dir, "app"), { now: NOW });
  await writeFile(join(dir, "flags.json"), JSON.stringify(d));
  const html = await readFile(await render(dir), "utf8");
  assert.equal(html.split("</script>").length, 2);
});
