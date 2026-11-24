import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCoupon } from "../src/index.mjs";

test("coupon codes are trimmed, upper cased and allow at most 99 percent", () => {
  assert.deepEqual(parseCoupon(" save10 "), { name: "SAVE", percent: 10 });
  assert.equal(parseCoupon("SAVE100"), null);
  assert.equal(parseCoupon("10OFF"), null);
});
