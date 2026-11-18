# python stack

## Stack
* Python 3.15.x
* uv
* ty for type checking
* Granian as the server
* Proper type hints and modular code
* Tests

## Idiomatic Python
* Type hints on every function signature and every class attribute. `ty check` must pass.
* Use builtin generics and unions: `list[str]`, `dict[str, int]`, `str | None`. No `typing.List`, no `Optional`.
* Use `@dataclass(frozen=True, slots=True)` for value objects.
* Use `enum.Enum` or `StrEnum` for closed sets of values, and `match` for branching on them.
* Use `typing.Protocol` for interfaces.
* Use comprehensions for simple transformations, plain loops when there are side effects.
* Use context managers (`with`) for every resource: files, connections, locks.
* Use `pathlib.Path`, never string paths with `os.path`.
* Use f-strings for formatting, except in log calls.
* Raise specific exceptions, never bare `except:` or `except Exception: pass`.
* No mutable default arguments.
* `uv add` for dependencies, `uv run` to run anything. No `pip install`.

## Principles in Python
* Separation of concerns: `api` (ASGI app, routes), `domain` (rules, dataclasses), `repo` (database), `config`. Domain imports nothing from `api`.
* DRY: shared logic goes into a function in the owning module. No `utils.py` dumping ground.
* Interfaces: `Protocol` classes for repositories, gateways and clocks. Pass implementations into constructors.

## Centralization rules in Python
* Logging: one centralized `log.py` module is the only place that configures logging. It installs a filter that always adds the common fields: correlation id, request path, user id and service name, read from a `contextvars.ContextVar`. An ASGI middleware reads or creates the `X-Correlation-Id` header and sets the context var for the request. The shared HTTP client forwards it on outbound calls. Modules get their logger with `log.get(__name__)`. No `print`, no `logging.basicConfig` anywhere else.
* HTTP client: one `HttpClient` class built on the standard `urllib.request`, with base URL, timeout, correlation id header and error mapping. No extra HTTP library. Every outbound REST call goes through it. Never call `requests.get` or `urlopen` across the code.
* Config: one frozen `Settings` dataclass built from the environment at startup. No `os.environ` reads deep in the code.
* Errors: one exception hierarchy per app (`AppError` base), mapped to HTTP status in one place.
* Database: one connection pool created at startup and passed to repositories.
* Time: inject a `Clock` protocol or a `Callable[[], datetime]`.

## Bad vs Good

### 1. Type hints
Bad
```python
def total(items):
    return sum(i["price"] * i["qty"] for i in items)
```
Good
```python
def total(items: list[LineItem]) -> Decimal:
    return sum((i.subtotal() for i in items), Decimal(0))
```

### 2. Dataclass instead of dict
Bad
```python
user = {"id": "u1", "email": "a@b.com", "active": True}
```
Good
```python
@dataclass(frozen=True, slots=True)
class User:
    id: UserId
    email: str
    active: bool
```

### 3. Modern typing
Bad
```python
from typing import List, Optional, Dict

def find(ids: List[str]) -> Optional[Dict[str, int]]: ...
```
Good
```python
def find(ids: list[str]) -> dict[str, int] | None: ...
```

### 4. Enum and match
Bad
```python
def fee(kind: str) -> int:
    if kind == "express":
        return 20
    elif kind == "standard":
        return 5
    return 0
```
Good
```python
class Shipping(StrEnum):
    EXPRESS = "express"
    STANDARD = "standard"


def fee(kind: Shipping) -> int:
    match kind:
        case Shipping.EXPRESS:
            return 20
        case Shipping.STANDARD:
            return 5
```

### 5. Protocol at the boundary
Bad
```python
class OrderService:
    def __init__(self) -> None:
        self.db = psycopg.connect("postgresql://localhost/app")
```
Good
```python
class OrderRepository(Protocol):
    def save(self, order: Order) -> None: ...
    def get(self, order_id: OrderId) -> Order | None: ...


class OrderService:
    def __init__(self, repo: OrderRepository, clock: Clock) -> None:
        self._repo = repo
        self._clock = clock
```

### 6. Mutable default argument
Bad
```python
def add_tag(tag: str, tags: list[str] = []) -> list[str]:
    tags.append(tag)
    return tags
```
Good
```python
def add_tag(tag: str, tags: tuple[str, ...] = ()) -> tuple[str, ...]:
    return (*tags, tag)
```

### 7. Swallowed exception
Bad
```python
try:
    gateway.charge(payment)
except:
    pass
```
Good
```python
try:
    gateway.charge(payment)
except GatewayTimeout as e:
    raise PaymentFailed(payment.id) from e
```

### 8. Logging
Bad
```python
print(f"order {order.id} created")
```
```python
logging.basicConfig(level=logging.INFO)
logging.info("order created id=%s", order.id)
```
Good
```python
HEADER = "x-correlation-id"


@dataclass(frozen=True, slots=True)
class RequestContext:
    correlation_id: str
    path: str
    user_id: str | None = None


_current: ContextVar[RequestContext | None] = ContextVar("request_context", default=None)


class _ContextFilter(logging.Filter):
    def __init__(self, service: str) -> None:
        super().__init__()
        self._service = service

    def filter(self, record: logging.LogRecord) -> bool:
        ctx = _current.get()
        record.correlation_id = ctx.correlation_id if ctx else "-"
        record.path = ctx.path if ctx else "-"
        record.user_id = ctx.user_id if ctx and ctx.user_id else "-"
        record.service = self._service
        return True


def setup(service: str) -> None:
    handler = logging.StreamHandler()
    handler.addFilter(_ContextFilter(service))
    handler.setFormatter(logging.Formatter(
        "%(asctime)s %(levelname)s %(service)s %(correlation_id)s %(path)s %(user_id)s %(name)s %(message)s"
    ))
    logging.basicConfig(level=logging.INFO, handlers=[handler])


def get(name: str) -> logging.Logger:
    return logging.getLogger(name)


def correlation_id() -> str:
    ctx = _current.get()
    return ctx.correlation_id if ctx else uuid.uuid4().hex


def correlation_middleware(app: ASGIApp) -> ASGIApp:
    async def wrapped(scope: Scope, receive: Receive, send: Send) -> None:
        headers = dict(scope.get("headers", []))
        incoming = headers.get(HEADER.encode())
        cid = incoming.decode() if incoming else uuid.uuid4().hex
        token = _current.set(RequestContext(correlation_id=cid, path=scope.get("path", "")))
        try:
            await app(scope, receive, send)
        finally:
            _current.reset(token)
    return wrapped
```
```python
logger = log.get(__name__)

logger.info("order created id=%s", order.id)
```

### 9. Centralized HTTP client
Bad
```python
def rate(currency: str) -> dict:
    return json.load(urllib.request.urlopen(f"https://rates.internal/rates/{currency}"))
```
Good
```python
class HttpClient:
    def __init__(self, base_url: str, timeout: float) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    def get_json(self, path: str) -> object:
        request = urllib.request.Request(
            f"{self._base_url}{path}",
            headers={"Accept": "application/json", log.HEADER: log.correlation_id()},
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout) as response:
                return json.load(response)
        except urllib.error.HTTPError as e:
            raise UpstreamError(path, e.code) from e


class RatesGateway:
    def __init__(self, http: HttpClient) -> None:
        self._http = http

    def rate(self, currency: Currency) -> Rate:
        return Rate.from_json(self._http.get_json(f"/rates/{currency.value}"))
```

### 10. Configuration
Bad
```python
def connect() -> Connection:
    return psycopg.connect(os.environ["DATABASE_URL"])
```
Good
```python
@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    port: int

    @classmethod
    def from_env(cls, env: Mapping[str, str]) -> "Settings":
        return cls(database_url=env["DATABASE_URL"], port=int(env.get("PORT", "8000")))
```

### 11. Context managers
Bad
```python
f = open(path)
data = f.read()
f.close()
```
Good
```python
data = Path(path).read_text()
```

### 12. Pathlib
Bad
```python
report = os.path.join(os.path.dirname(__file__), "reports", name + ".csv")
```
Good
```python
report = Path(__file__).parent / "reports" / f"{name}.csv"
```

### 13. Comprehension
Bad
```python
names = []
for u in users:
    if u.active:
        names.append(u.name)
```
Good
```python
names = [u.name for u in users if u.active]
```

### 14. Errors mapped in one place
Bad
```python
def get_order(order_id: str) -> tuple[int, dict[str, object]]:
    try:
        return 200, service.get(order_id).to_json()
    except Exception as e:
        return 500, {"error": str(e)}
```
Good
```python
class AppError(Exception):
    status = 500


class NotFound(AppError):
    status = 404


class Invalid(AppError):
    status = 400


def to_response(exc: AppError) -> tuple[int, dict[str, object]]:
    logger.warning("request failed status=%s error=%s", exc.status, exc)
    return exc.status, {"error": str(exc)}
```

### 15. Running tools
Bad
```bash
pip install granian
python -m pytest
```
Good
```bash
uv add granian
uv run pytest
uv run ty check
```
