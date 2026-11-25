import { createServer } from "node:http";

let fixed = false;
let items = [];

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    try {
      if (url.pathname === "/users") {
        const user = JSON.parse(body);
        if (!user.name) return send(res, 400, { error: "name required" });
        if (fixed && typeof user.name !== "string") return send(res, 400, { error: "name must be text" });
        const name = user.name.trim();
        if (name.length > 100) return send(res, 400, { error: "name too long" });
        return send(res, 201, { name });
      }
      if (url.pathname === "/items") {
        const item = JSON.parse(body);
        items.push(item);
        return send(res, 201, item);
      }
      if (url.pathname === "/report") return send(res, 200, items.map((i) => i.when.slice(0, 10)));
      if (url.pathname === "/fix") {
        fixed = true;
        return send(res, 200, { fixed });
      }
      if (url.pathname === "/reset") {
        items = [];
        return send(res, 200, {});
      }
      if (url.pathname === "/wait") {
        if (Number(url.searchParams.get("n")) > 1000) return;
        return send(res, 200, { ok: true });
      }
      send(res, 404, {});
    } catch (e) {
      send(res, 500, { error: e.message });
    }
  });
});

function send(res, status, json) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(json));
}

server.listen(0, "127.0.0.1", () => console.log(server.address().port));
