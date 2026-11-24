import { test } from "node:test";
import assert from "node:assert/strict";
import { subtotal } from "../src/index.mjs";

test("subtotal multiplies price by quantity for every line", () => {
  assert.equal(subtotal([{ price: 10, qty: 2 }, { price: 5, qty: 1 }]), 25);
});
