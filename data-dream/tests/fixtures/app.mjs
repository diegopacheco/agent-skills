import { createServer } from "node:http";

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    try {
      if (url.pathname === "/users") {
        const user = JSON.parse(body);
        if (!user.name) return send(res, 400, { error: "name required" });
        const name = user.name.trim();
        if (name.length > 100) return send(res, 400, { error: "name too long" });
        return send(res, 201, { name });
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
