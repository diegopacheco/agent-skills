import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.mjs";
import { createApp } from "../src/app.mjs";

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const post = (path, body) => fetch(base + path, { method: "POST", body });
const withUser = () => {
  const store = createStore();
  store.addUser({ name: "Ana", email: "ana@shop.io" });
  return store;
};

test("DD1 a name that is not a string is a 400, not a 500", async () => {
  for (const name of [-1, 0.1, [{}], { a: 2 }]) {
    const res = await post("/users", JSON.stringify({ name, email: `n${Math.random()}@shop.io` }));
    assert.equal(res.status, 400, `name ${JSON.stringify(name)}`);
  }
});

test("DD2 a body that is not valid JSON is a 400, not a 500", async () => {
  for (const body of ["{", '{"name":NaN}', '{"price":Infinity}']) {
    assert.equal((await post("/users", body)).status, 400, body);
  }
});

test("DD3 search treats the query as text, so ( + { never crash it", async () => {
  await post("/users", JSON.stringify({ name: "Robert'); DROP TABLE students;--", email: "bobby@shop.io" }));
  for (const q of ["Robert');", "+1 (555)", "${7*7}"]) {
    const res = await fetch(`${base}/users?q=${encodeURIComponent(q)}`);
    assert.equal(res.status, 200, q);
  }
});

test("DD4 a name made only of spaces is rejected, not stored empty", () => {
  const store = createStore();
  assert.throws(() => store.addUser({ name: "   ", email: "blank@shop.io" }), /required/);
});

test("DD5 a name has a maximum length", () => {
  const store = createStore();
  assert.throws(() => store.addUser({ name: "a".repeat(1048576), email: "big@shop.io" }));
});

test("DD6 the same mailbox in another case or with spaces is a duplicate", () => {
  const store = withUser();
  assert.throws(() => store.addUser({ name: "Ana", email: "ANA@shop.io" }), /already registered/);
  assert.throws(() => store.addUser({ name: "Ana", email: " ana@shop.io" }), /already registered/);
});

test("DD7 negative and infinite prices are rejected", () => {
  const store = withUser();
  for (const price of [-1, -10, Infinity]) {
    assert.throws(() => store.addOrder({ userId: 1, price, qty: 1, createdAt: "2026-11-20T10:00:00Z" }), undefined, String(price));
  }
});

test("DD8 order totals round half up to the cent and keep every cent", () => {
  const store = withUser();
  assert.equal(store.addOrder({ userId: 1, price: 2.675, qty: 1, createdAt: "2026-11-20T10:00:00Z" }).total, 2.68);
  assert.equal(store.addOrder({ userId: 1, price: 1.005, qty: 1, createdAt: "2026-11-20T10:00:00Z" }).total, 1.01);
});

test("DD9 one order without a valid createdAt cannot take down revenue for every day", () => {
  for (const createdAt of [undefined, null, {}, true, -1, 1717243200000]) {
    const store = withUser();
    try {
      store.addOrder({ userId: 1, price: 10, qty: 1, createdAt });
    } catch {}
    assert.doesNotThrow(() => store.dailyRevenue("2026-11-20"), `createdAt ${JSON.stringify(createdAt)}`);
  }
});

test("DD10 createdAt is a real instant and revenue days are UTC days", () => {
  const store = withUser();
  assert.throws(() => store.addOrder({ userId: 1, price: 10, qty: 1, createdAt: "2023-02-29" }));
  store.addOrder({ userId: 1, price: 10, qty: 1, createdAt: "2024-06-01T12:00:00+14:00" });
  assert.equal(store.dailyRevenue("2024-05-31"), 10);
});
