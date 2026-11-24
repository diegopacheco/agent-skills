import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.mjs";

test("a user is registered with a trimmed name", () => {
  const store = createStore();
  assert.deepEqual(store.addUser({ name: " Ana ", email: "ana@shop.io" }), { id: 1, name: "Ana", email: "ana@shop.io" });
});

test("the same email cannot register twice", () => {
  const store = createStore();
  store.addUser({ name: "Ana", email: "ana@shop.io" });
  assert.throws(() => store.addUser({ name: "Ana", email: "ana@shop.io" }), /already registered/);
});

test("an order total is price times quantity and counts in its day's revenue", () => {
  const store = createStore();
  store.addUser({ name: "Ana", email: "ana@shop.io" });
  store.addOrder({ userId: 1, price: 10.5, qty: 2, createdAt: "2026-11-20T10:00:00Z" });
  assert.equal(store.dailyRevenue("2026-11-20"), 21);
});

test("search finds users by part of the name, ignoring case", () => {
  const store = createStore();
  store.addUser({ name: "Ana Souza", email: "ana@shop.io" });
  assert.equal(store.searchUsers("souza").length, 1);
});
