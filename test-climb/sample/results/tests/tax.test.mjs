import { test } from "node:test";
import assert from "node:assert/strict";
import { tax } from "../src/index.mjs";

test("tax uses the state rate and falls back to 17 percent for unknown states", () => {
  assert.equal(tax(100, "SP"), 18);
  assert.equal(tax(100, "RJ"), 20);
  assert.equal(tax(100, "AC"), 17);
});
