const test = require("node:test");
const assert = require("node:assert/strict");
const { checkout } = require("../src/cart");

test("checkout adds up the cart", () => {
  const totals = checkout([{ price: 10, quantity: 2 }]);
  assert.equal(totals.subtotal, 20);
});
