# nodejs stack

## Stack
* Node.js 26
* npm
* TypeScript 7.x
* Express.js
* Modular code and proper types

## Idiomatic Node.js and TypeScript
* `strict: true`, ES modules (`"type": "module"`), no `require`.
* No `any`. Use `unknown` for request bodies and parse them at the edge.
* `async` and `await` everywhere. No callbacks, no `.then` chains.
* Use the built in `fetch`, `node:test`, `node:fs/promises`, `AbortSignal.timeout`. Import core modules with the `node:` prefix.
* Express 5 forwards rejected promises to the error middleware, so handlers do not need `try` and `catch` around every call.
* One router per feature, mounted in `app.ts`. The `server.ts` file only calls `listen`, so tests import `app` without opening a port.
* `const` by default, `let` only when a value must change, never `var`.
* Graceful shutdown on `SIGTERM`: stop accepting requests, close the pool, then exit.
* Never block the event loop with sync IO (`readFileSync`) or heavy CPU work in a request.

## Principles in Node.js
* Separation of concerns: `routes` (Express), `services` (rules), `repos` (database), `config`, `http`. Services never import `express`.
* DRY: shared logic goes into the module that owns it. No `utils.ts` dumping ground.
* Interfaces: services receive repositories and gateways as typed interfaces through a factory function or constructor.

## Centralization rules in Node.js
* Logging: one centralized `logger.ts` module is the only way to log. It always adds the common fields: correlation id, request path, user id and service name, read from an `AsyncLocalStorage` request context. One Express middleware reads or creates the `X-Correlation-Id` header and runs the request inside that context. The shared `http.ts` client forwards it on outbound calls. No `console.log` anywhere else.
* HTTP client: one `http.ts` module wrapping `fetch` with base URL, timeout, headers and error mapping. Every outbound REST call goes through it. No raw `fetch` in services.
* Config: one `config.ts` reads `process.env` once at startup into a typed, frozen object. No `process.env` anywhere else.
* Errors: one `AppError` hierarchy and one Express error middleware that maps it to HTTP status.
* Validation: one parse step per route at the edge. Services receive typed values.
* Database: one pool created at startup and passed to repositories.

## Bad vs Good

### 1. any request body
Bad
```ts
router.post("/orders", async (req, res) => {
  const order = await service.create(req.body as any);
  res.json(order);
});
```
Good
```ts
router.post("/orders", async (req, res) => {
  const input = parseNewOrder(req.body);
  res.status(201).json(await service.create(input));
});
```

### 2. Callbacks
Bad
```ts
fs.readFile(path, "utf8", (err, data) => {
  if (err) throw err;
  handle(data);
});
```
Good
```ts
import { readFile } from "node:fs/promises";

const data = await readFile(path, "utf8");
handle(data);
```

### 3. Express in services
Bad
```ts
export async function createOrder(req: Request, res: Response) {
  const result = await db.query("insert into orders(total) values ($1) returning *", [req.body.total]);
  res.json(result.rows[0]);
}
```
Good
```ts
export function orderService(repo: OrderRepo, clock: Clock) {
  return {
    create: (input: NewOrder): Promise<Order> => repo.insert({ ...input, createdAt: clock.now() }),
  };
}
```

### 4. Errors mapped in one place
Bad
```ts
router.get("/orders/:id", async (req, res) => {
  try {
    res.json(await service.get(req.params.id));
  } catch (e) {
    res.status(500).send(String(e));
  }
});
```
Good
```ts
router.get("/orders/:id", async (req, res) => {
  res.json(await service.get(req.params.id));
});

export class AppError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error("unhandled error", { err });
  res.status(500).json({ error: "internal error" });
};
```

### 5. Centralized HTTP client
Bad
```ts
export async function getRate(currency: string) {
  const res = await fetch(`https://rates.internal/rates/${currency}`);
  return res.json();
}
```
Good
```ts
export function httpClient(baseUrl: string, timeoutMs: number) {
  return {
    async getJson<T>(path: string, parse: (raw: unknown) => T): Promise<T> {
      const res = await fetch(new URL(path, baseUrl), {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { [CORRELATION_HEADER]: correlationId() },
      });
      if (!res.ok) throw new AppError(502, `upstream ${path} returned ${res.status}`);
      return parse(await res.json());
    },
  };
}

export type HttpClient = ReturnType<typeof httpClient>;

export function ratesGateway(http: HttpClient) {
  return {
    rate: (currency: Currency) => http.getJson(`/rates/${currency}`, parseRate),
  };
}
```

### 6. Configuration
Bad
```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```
Good
```ts
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const config = Object.freeze({
  databaseUrl: required("DATABASE_URL"),
  port: Number(process.env.PORT ?? 3000),
  ratesUrl: required("RATES_URL"),
});
```

### 7. Logging
Bad
```ts
console.log("order created", order.id);
```
Good
```ts
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const CORRELATION_HEADER = "x-correlation-id";

type RequestContext = { readonly correlationId: string; readonly path: string; userId?: string };
type Fields = Readonly<Record<string, unknown>>;

const storage = new AsyncLocalStorage<RequestContext>();

export function correlationId(): string {
  return storage.getStore()?.correlationId ?? randomUUID();
}

export const correlationMiddleware: RequestHandler = (req, res, next) => {
  const id = req.header(CORRELATION_HEADER) ?? randomUUID();
  res.setHeader(CORRELATION_HEADER, id);
  storage.run({ correlationId: id, path: req.path }, next);
};

function write(level: "info" | "warn" | "error", event: string, fields: Fields): void {
  const ctx = storage.getStore();
  const entry = {
    time: new Date().toISOString(),
    level,
    event,
    service: config.serviceName,
    correlationId: ctx?.correlationId,
    path: ctx?.path,
    userId: ctx?.userId,
    ...fields,
  };
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

export const logger = {
  info: (event: string, fields: Fields = {}) => write("info", event, fields),
  warn: (event: string, fields: Fields = {}) => write("warn", event, fields),
  error: (event: string, fields: Fields = {}) => write("error", event, fields),
};
```
```ts
logger.info("order created", { orderId: order.id });
```

### 8. Blocking the event loop
Bad
```ts
router.get("/report", (_req, res) => {
  res.send(fs.readFileSync("report.csv", "utf8"));
});
```
Good
```ts
router.get("/report", async (_req, res) => {
  res.type("text/csv").send(await readFile(reportPath, "utf8"));
});
```

### 9. App and server split
Bad
```ts
const app = express();
app.use("/orders", ordersRouter);
app.listen(3000);
export default app;
```
Good
```ts
export function createApp(deps: Deps): Express {
  const app = express();
  app.use(correlationMiddleware);
  app.use(express.json());
  app.use("/orders", ordersRouter(deps.orders));
  app.use(errorHandler);
  return app;
}
```
```ts
const deps = buildDeps(config);
const server = createApp(deps).listen(config.port);
process.on("SIGTERM", () => server.close(() => deps.pool.end()));
```

### 10. Interfaces for repositories
Bad
```ts
import { pool } from "../db.js";

export async function getUser(id: string) {
  return (await pool.query("select * from users where id = $1", [id])).rows[0];
}
```
Good
```ts
export interface UserRepo {
  find(id: UserId): Promise<User | undefined>;
}

export function userService(users: UserRepo) {
  return {
    async get(id: UserId): Promise<User> {
      const user = await users.find(id);
      if (!user) throw new AppError(404, `user ${id} not found`);
      return user;
    },
  };
}
```

### 11. Promise chains
Bad
```ts
getUser(id).then((u) => getOrders(u.id)).then((orders) => res.json(orders)).catch(next);
```
Good
```ts
const user = await getUser(id);
res.json(await getOrders(user.id));
```

### 12. Parallel independent calls
Bad
```ts
const user = await users.get(id);
const prefs = await prefsRepo.get(id);
```
Good
```ts
const [user, prefs] = await Promise.all([users.get(id), prefsRepo.get(id)]);
```

### 13. Tests with node:test
Bad
```ts
test("works", async () => {
  const res = await fetch("http://localhost:3000/orders/1");
  assert.ok(res);
});
```
Good
```ts
import { test } from "node:test";
import assert from "node:assert/strict";

test("missing order returns 404 so clients can tell it apart from a server failure", async () => {
  const app = createApp(fakeDeps({ orders: [] }));
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const res = await fetch(`http://127.0.0.1:${port}/orders/nope`);
  server.close();
  assert.equal(res.status, 404);
});
```
