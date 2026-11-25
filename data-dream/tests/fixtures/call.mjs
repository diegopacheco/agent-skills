import { request } from "node:http";

const [method, url] = process.argv.slice(2);
const req = request(url, { method, agent: false }, (res) => {
  res.resume();
  res.on("end", () => process.exit(res.statusCode < 400 ? 0 : 1));
});
req.on("error", () => process.exit(1));
req.end();
