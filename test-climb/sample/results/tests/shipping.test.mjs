import { test } from "node:test";
import assert from "node:assert/strict";
import { shipping } from "../src/index.mjs";

test("shipping is free from 300 and costs 15 plus 2 per item above 3 below it", () => {
  assert.equal(shipping(300, 9), 0);
  assert.equal(shipping(299.99, 3), 15);
  assert.equal(shipping(299.99, 5), 19);
});
