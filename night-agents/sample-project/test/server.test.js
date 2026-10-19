const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/server");
const { openDatabase } = require("../src/db");

async function withServer(fn) {
  const server = createApp(openDatabase()).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("health answers ok", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
  });
});

test("an order comes back with its items", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/orders/1`);
    const order = await res.json();
    assert.equal(res.status, 200);
    assert.equal(order.items.length, 3);
  });
});
