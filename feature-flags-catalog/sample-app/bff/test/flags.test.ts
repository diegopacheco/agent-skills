import { test } from "node:test";
import assert from "node:assert/strict";
import { readFlags } from "../src/config.ts";
import { featureFlags } from "../src/flags.ts";
import type { Logger } from "../src/logger.ts";

const silent: Logger = { info: () => {}, warn: () => {}, error: () => {} };

test("env flags become kebab-case names so code and config use the same key the catalog matches on", () => {
  const values = readFlags({ FEATURE_BETA_SEARCH: "true", FEATURE_RESPONSE_CACHE: "false", PATH: "/bin" });
  assert.deepEqual(values, { "beta-search": true, "response-cache": false });
});

test("an undeclared flag is off and every read is logged, which is the evidence the 3 week deletion rule needs", () => {
  const events: Array<Readonly<Record<string, unknown>>> = [];
  const log: Logger = { ...silent, info: (event, fields = {}) => events.push({ event, ...fields }) };
  const flags = featureFlags({ "beta-search": true }, log);
  assert.equal(flags.isEnabled("beta-search"), true);
  assert.equal(flags.isEnabled("missing"), false);
  assert.deepEqual(events, [{ event: "flag_evaluated", flag: "beta-search", value: true }, { event: "flag_evaluated", flag: "missing", value: false }]);
});
