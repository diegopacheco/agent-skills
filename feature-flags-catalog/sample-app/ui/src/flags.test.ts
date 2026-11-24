import { expect, test } from "bun:test";
import declared from "../flags.json";
import { featureFlags } from "./flags";
import type { Logger } from "./logger";

const silent: Logger = { info: () => {}, warn: () => {}, error: () => {} };

test("a flag missing from flags.json is off, so a typo in a flag name hides a feature instead of shipping it", () => {
  const flags = featureFlags(declared, silent);
  expect(flags.isEnabled("dark-mod")).toBe(false);
});

test("every read logs flag_evaluated with the name and value, which the catalog uses to prove a flag is idle", () => {
  const events: string[] = [];
  const log: Logger = { ...silent, info: (event, fields = {}) => events.push(`${event}:${String(fields.flag)}:${String(fields.value)}`) };
  featureFlags({ "holiday-banner": false }, log).isEnabled("holiday-banner");
  expect(events).toEqual(["flag_evaluated:holiday-banner:false"]);
});
