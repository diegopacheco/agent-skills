import { test } from "node:test";
import assert from "node:assert/strict";
import { total } from "../src/index.mjs";

test("total applies discount, tax and shipping and rounds to cents", () => {
  assert.equal(total([{ price: 10.01, qty: 1 }], "SP"), 26.81);
  assert.equal(total([{ price: 600, qty: 1 }], "SP"), 672.6);
});
