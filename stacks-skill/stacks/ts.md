# ts stack

## Stack
* TypeScript 7.x
* Bun 2.x
* Vite
* React 19.3.x
* TanStack 1.x for everything it covers: Router, Query, Table, Form
* Modular code and proper types

## Idiomatic TypeScript and React
* `strict: true` in `tsconfig.json`. No `any`, no `as` casts to silence errors, no `@ts-ignore`.
* Use `unknown` for untrusted input and narrow it with a parser or type guard.
* Use `type` for data shapes and discriminated unions for closed sets of cases, with exhaustive `switch` and a `never` check.
* Use `readonly` and `as const` for data that must not change.
* Function components only, with typed props. No class components.
* Server state lives in TanStack Query. Never `useEffect` plus `fetch` plus `useState` for loading data.
* Routing with TanStack Router file based routes and typed params.
* Forms with TanStack Form, tables with TanStack Table.
* Derive values during render. Do not mirror props or query data into `useState`.
* Custom hooks (`useOrders`) wrap query keys and query functions per feature.
* Named exports, no default exports except where a tool requires them.
* `bun install`, `bun run`, `bun test`. No npm or yarn.

## Principles in TypeScript
* Separation of concerns: `features/<name>/` holds `api.ts` (calls), `hooks.ts` (queries and mutations), `components/` (UI), `types.ts`. Components never call `fetch`.
* DRY: shared UI goes into `components/`, shared logic into the feature module that owns it. No `utils.ts` dumping ground.
* Interfaces: feature `api.ts` modules depend on the shared HTTP client, so tests can swap it.

## Centralization rules in TypeScript
* Logging: one centralized `logger.ts` module is the only way to log. It always adds the common fields: correlation id, current route, user id and app name. The correlation id is created once per session and `http.ts` sends it as the `X-Correlation-Id` header on every call, so browser logs match backend logs. No `console.log` anywhere else.
* HTTP client: one `http.ts` module with the base URL, headers, auth, JSON parsing and error mapping. Every REST call goes through it. No raw `fetch` in components, hooks or features.
* Config: one `config.ts` reads `import.meta.env` once and exports a typed object.
* Query keys: one key factory per feature. No string keys typed by hand at call sites.
* Errors: one `ApiError` class and one error boundary per route.
* Query client: one `QueryClient` created at the app root.

## Bad vs Good

### 1. any
Bad
```ts
function total(items: any): number {
  return items.reduce((s: any, i: any) => s + i.price, 0);
}
```
Good
```ts
type LineItem = { readonly price: number; readonly qty: number };

function total(items: readonly LineItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
```

### 2. Discriminated union
Bad
```ts
type Payment = { kind: string; card?: string; iban?: string };
```
Good
```ts
type Payment =
  | { kind: "card"; card: string }
  | { kind: "bank"; iban: string };

function label(p: Payment): string {
  switch (p.kind) {
    case "card":
      return `card ${p.card.slice(-4)}`;
    case "bank":
      return `bank ${p.iban}`;
    default: {
      const unreachable: never = p;
      return unreachable;
    }
  }
}
```

### 3. Unknown input
Bad
```ts
const user = JSON.parse(raw) as User;
```
Good
```ts
function parseUser(raw: unknown): User {
  if (typeof raw === "object" && raw !== null && "id" in raw && typeof raw.id === "string" && "email" in raw && typeof raw.email === "string") {
    return { id: raw.id, email: raw.email };
  }
  throw new ApiError(422, "invalid user payload");
}
```

### 4. Data loading
Bad
```tsx
function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  }, []);
  return <OrderList orders={orders} />;
}
```
Good
```tsx
function Orders() {
  const { data } = useOrders();
  return <OrderList orders={data ?? []} />;
}
```

### 5. Centralized HTTP client
Bad
```ts
export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`https://api.internal/orders/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
}
```
Good
```ts
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, parse: (raw: unknown) => T, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      [CORRELATION_HEADER]: currentCorrelationId(),
      ...authHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return parse(await res.json());
}

export const http = {
  get: <T>(path: string, parse: (raw: unknown) => T) => request(path, parse),
  post: <T>(path: string, body: unknown, parse: (raw: unknown) => T) =>
    request(path, parse, { method: "POST", body: JSON.stringify(body) }),
};
```
```ts
export const ordersApi = {
  get: (id: OrderId) => http.get(`/orders/${id}`, parseOrder),
  list: () => http.get("/orders", parseOrders),
  create: (input: NewOrder) => http.post("/orders", input, parseOrder),
};
```

### 6. Query keys and hooks
Bad
```tsx
useQuery({ queryKey: ["order", id], queryFn: () => ordersApi.get(id) });
useQuery({ queryKey: ["orders", id], queryFn: () => ordersApi.get(id) });
```
Good
```ts
export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: OrderId) => [...orderKeys.all, id] as const,
};

export function useOrder(id: OrderId) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: () => ordersApi.get(id) });
}
```

### 7. Derived state
Bad
```tsx
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${user.first} ${user.last}`);
}, [user]);
```
Good
```tsx
const fullName = `${user.first} ${user.last}`;
```

### 8. Typed props
Bad
```tsx
export default function Badge(props) {
  return <span className={props.color}>{props.text}</span>;
}
```
Good
```tsx
type BadgeProps = { readonly text: string; readonly tone: "info" | "warn" | "error" };

export function Badge({ text, tone }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{text}</span>;
}
```

### 9. Configuration
Bad
```ts
const res = await fetch(import.meta.env.VITE_API_URL + "/orders");
```
Good
```ts
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const config = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
} as const;
```

### 10. Logging
Bad
```ts
console.log("saved", order);
```
Good
```ts
export const CORRELATION_HEADER = "X-Correlation-Id";

const correlationId = crypto.randomUUID();
let userId: string | undefined;

export function setUser(id: string | undefined): void {
  userId = id;
}

export function currentCorrelationId(): string {
  return correlationId;
}

type Level = "info" | "warn" | "error";
type Fields = Readonly<Record<string, string | number | boolean | undefined>>;

function write(level: Level, event: string, fields: Fields): void {
  const entry = {
    level,
    event,
    correlationId,
    route: window.location.pathname,
    userId,
    app: config.appName,
    ...fields,
  };
  console[level](JSON.stringify(entry));
}

export const logger = {
  info: (event: string, fields: Fields = {}) => write("info", event, fields),
  warn: (event: string, fields: Fields = {}) => write("warn", event, fields),
  error: (event: string, fields: Fields = {}) => write("error", event, fields),
};
```
```ts
logger.info("order saved", { orderId: order.id });
```

### 11. Typed route params
Bad
```tsx
const id = window.location.pathname.split("/")[2];
```
Good
```tsx
export const Route = createFileRoute("/orders/$orderId")({
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const { data } = useOrder(orderId);
}
```

### 12. Mutations
Bad
```tsx
async function onSave() {
  await fetch("/api/orders", { method: "POST", body: JSON.stringify(form) });
  window.location.reload();
}
```
Good
```tsx
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOrder) => ordersApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
```

### 13. Immutable updates
Bad
```ts
cart.items.push(item);
setCart(cart);
```
Good
```ts
setCart((c) => ({ ...c, items: [...c.items, item] }));
```

### 14. Constants
Bad
```ts
if (user.role === "admn") {
}
```
Good
```ts
const ROLES = ["admin", "member", "guest"] as const;
type Role = (typeof ROLES)[number];

function isAdmin(role: Role): boolean {
  return role === "admin";
}
```
