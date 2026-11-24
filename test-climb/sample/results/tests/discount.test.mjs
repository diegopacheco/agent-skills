import { test } from "node:test";
import assert from "node:assert/strict";
import { discount } from "../src/index.mjs";

test("1000 or more gets 10 percent, 500 or more gets 5 percent, below 500 nothing", () => {
  assert.equal(discount(1000), 100);
  assert.equal(discount(999), 49.95);
  assert.equal(discount(500), 25);
  assert.equal(discount(499), 0);
});
