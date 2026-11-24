import { test } from "node:test";
import assert from "node:assert/strict";
import type { Backend } from "../src/catalog/backend.ts";
import { catalogService } from "../src/catalog/service.ts";
import type { Product } from "../src/catalog/types.ts";
import { featureFlags } from "../src/flags.ts";
import type { Logger } from "../src/logger.ts";

const silent: Logger = { info: () => {}, warn: () => {}, error: () => {} };
const product = (id: string, price: number): Product => ({ id, name: id, listPrice: price, price, engine: "classic", regional: false });

function fakeBackend() {
  let calls = 0;
  const backend: Backend = {
    products: async () => {
      calls++;
      return [product("a", 30), product("b", 10), product("c", 20)];
    },
    checkoutMode: async () => ({ mode: "standard" }),
  };
  return { backend, calls: () => calls };
}

test("recommendations show the two cheapest products only while the flag is on, so turning it off hides the section", async () => {
  const on = catalogService(fakeBackend().backend, featureFlags({ recommendations: true }, silent), { now: () => 0 }, 1000);
  const off = catalogService(fakeBackend().backend, featureFlags({ recommendations: false }, silent), { now: () => 0 }, 1000);
  assert.deepEqual((await on.catalog("eu")).recommendations.map((p) => p.id), ["b", "c"]);
  assert.deepEqual((await off.catalog("eu")).recommendations, []);
});

test("response cache saves the second backend call inside the ttl, and the flag off always calls the backend", async () => {
  let now = 0;
  const cachedFake = fakeBackend();
  const cached = catalogService(cachedFake.backend, featureFlags({ "response-cache": true }, silent), { now: () => now }, 1000);
  await cached.catalog("eu");
  now = 500;
  assert.equal((await cached.catalog("eu")).cached, true);
  now = 1500;
  assert.equal((await cached.catalog("eu")).cached, false);
  assert.equal(cachedFake.calls(), 2);
  const plainFake = fakeBackend();
  const plain = catalogService(plainFake.backend, featureFlags({ "response-cache": false }, silent), { now: () => 0 }, 1000);
  await plain.catalog("eu");
  await plain.catalog("eu");
  assert.equal(plainFake.calls(), 2);
});

test("beta search stays off by default, so the unfinished search never reaches users", () => {
  assert.equal(featureFlags({}, silent).isEnabled("beta-search"), false);
});
