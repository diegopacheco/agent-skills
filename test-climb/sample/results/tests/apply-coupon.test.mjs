import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCoupon } from "../src/index.mjs";

test("a coupon still works on its last day and is ignored after it or when missing", () => {
  const coupon = { name: "SAVE", percent: 10, expiresAt: "2026-12-31" };
  assert.equal(applyCoupon(200, coupon, "2026-12-31"), 180);
  assert.equal(applyCoupon(200, coupon, "2027-01-01"), 200);
  assert.equal(applyCoupon(200, null, "2026-12-31"), 200);
});
