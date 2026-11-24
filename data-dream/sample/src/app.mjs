import { createServer } from "node:http";
import { createStore, ValidationError } from "./store.mjs";

export function createApp(store = createStore()) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
      const body = req.method === "POST" ? JSON.parse(await read(req)) : null;
      if (req.method === "POST" && url.pathname === "/users") return send(res, 201, store.addUser(body));
      if (req.method === "GET" && url.pathname === "/users") return send(res, 200, store.searchUsers(url.searchParams.get("q") ?? ""));
      if (req.method === "POST" && url.pathname === "/orders") return send(res, 201, store.addOrder(body));
      if (req.method === "GET" && url.pathname === "/revenue") return send(res, 200, { day: url.searchParams.get("day"), total: store.dailyRevenue(url.searchParams.get("day")) });
      send(res, 404, { error: "not found" });
    } catch (e) {
      if (e instanceof ValidationError) return send(res, 400, { error: e.message });
      send(res, 500, { error: "internal error" });
    }
  });
}

function read(req) {
  return new Promise((ok) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => ok(data));
  });
}

function send(res, status, json) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(json));
}
