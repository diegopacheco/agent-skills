# rust stack

## Stack
* Rust 1.99.x, edition 2024
* Tokio
* Async code, functions return `Result`
* Traits and modular code

## Build mode
* Debug builds are fine while testing and troubleshooting.
* Once the app is done and working, everything must be in release mode: `cargo build --release`, `cargo run --release`, `cargo test --release`.
* Every script (build, run, start, test, install) must use release mode. No script may use a debug build.
* If debug was used, clean it before finishing: delete `target/debug` (or run `cargo clean` and rebuild in release). Debug leftovers compound the disk size, so never leave them behind.
* Fix the problems found in debug, then confirm the final build, scripts and tests all run in release and no debug artifacts remain.

## Idiomatic Rust
* Every fallible function returns `Result<T, E>`. Use `?` to propagate.
* No `unwrap()` or `expect()` outside tests and `main` startup.
* One error `enum` per module, implementing `std::error::Error` and `Display`, with `From` impls so `?` converts.
* Borrow (`&str`, `&[T]`) in parameters, own (`String`, `Vec<T>`) in struct fields.
* Use iterators and combinators instead of index loops.
* Use newtypes (`struct UserId(String)`) for typed IDs.
* Use `enum` for closed sets of cases and exhaustive `match`.
* Derive the common traits (`Debug`, `Clone`, `PartialEq`) where they make sense.
* Never block inside async code. Use `tokio::fs`, `tokio::time` and `spawn_blocking` for blocking work.
* Share state with `Arc`. Avoid `Mutex` when message passing or ownership works.
* Run `cargo clippy` and `cargo fmt` before saying it is done.

## Principles in Rust
* Separation of concerns: one module per concern (`http`, `domain`, `repo`, `config`). `domain` does not import `http` types.
* DRY: shared behavior goes into a trait impl or a function in the owning module.
* Interfaces: traits at every boundary. Services are generic over the trait (`OrderService<R: OrderRepository>`), so tests plug in a fake.

## Centralization rules in Rust
* Logging: one centralized `telemetry` module is the only place that sets up logging. It installs the `tracing` subscriber once and exposes `request_span`, which always carries the common fields: correlation id, request path, user id and service name. Every request runs inside that span, so every `tracing::info!` below it gets the fields. The entry point reads or creates the `X-Correlation-Id` header, and the shared `HttpClient` forwards it on outbound calls. No `println!` or `eprintln!` for logs, no second subscriber.
* HTTP client: one `reqwest::Client` built once with timeouts and base URL, wrapped in a struct, shared through `Arc` or cloned (it is cheap). Never `reqwest::get` or `Client::new()` per call.
* Config: one `Config` struct loaded once in `main` and passed down.
* Errors: one error enum per module, one place maps them to HTTP responses or exit codes.
* Database: one pool created in `main`, passed to repositories.
* Time: a `Clock` trait injected where time matters.

## Bad vs Good

### 1. Unwrap
Bad
```rust
fn port() -> u16 {
    std::env::var("PORT").unwrap().parse().unwrap()
}
```
Good
```rust
fn port() -> Result<u16, ConfigError> {
    let raw = std::env::var("PORT").map_err(|_| ConfigError::Missing("PORT"))?;
    raw.parse().map_err(|_| ConfigError::Invalid("PORT"))
}
```

### 2. Error enum
Bad
```rust
fn load(path: &str) -> Result<Settings, String> {
    let text = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&text).map_err(|e| e.to_string())
}
```
Good
```rust
#[derive(Debug)]
pub enum LoadError {
    Io(std::io::Error),
    Parse(serde_json::Error),
}

impl From<std::io::Error> for LoadError {
    fn from(e: std::io::Error) -> Self {
        LoadError::Io(e)
    }
}

impl From<serde_json::Error> for LoadError {
    fn from(e: serde_json::Error) -> Self {
        LoadError::Parse(e)
    }
}

pub async fn load(path: &Path) -> Result<Settings, LoadError> {
    let text = tokio::fs::read_to_string(path).await?;
    Ok(serde_json::from_str(&text)?)
}
```

### 3. Borrow in parameters
Bad
```rust
fn greet(name: String) -> String {
    format!("hello {name}")
}
```
Good
```rust
fn greet(name: &str) -> String {
    format!("hello {name}")
}
```

### 4. Iterators
Bad
```rust
let mut total = 0;
for i in 0..items.len() {
    if items[i].active {
        total += items[i].price;
    }
}
```
Good
```rust
let total: u64 = items.iter().filter(|i| i.active).map(|i| i.price).sum();
```

### 5. Newtypes
Bad
```rust
fn transfer(from: String, to: String, cents: i64) -> Result<(), BankError>
```
Good
```rust
pub struct AccountId(String);
pub struct Cents(i64);

fn transfer(from: &AccountId, to: &AccountId, amount: Cents) -> Result<(), BankError>
```

### 6. Exhaustive match
Bad
```rust
fn fee(kind: &str) -> u32 {
    if kind == "express" { 20 } else if kind == "standard" { 5 } else { 0 }
}
```
Good
```rust
pub enum Shipping {
    Express,
    Standard,
}

fn fee(kind: Shipping) -> u32 {
    match kind {
        Shipping::Express => 20,
        Shipping::Standard => 5,
    }
}
```

### 7. Blocking in async
Bad
```rust
async fn read_report(path: &Path) -> Result<String, std::io::Error> {
    std::thread::sleep(Duration::from_secs(1));
    std::fs::read_to_string(path)
}
```
Good
```rust
async fn read_report(path: &Path) -> Result<String, std::io::Error> {
    tokio::time::sleep(Duration::from_secs(1)).await;
    tokio::fs::read_to_string(path).await
}
```

### 8. Logging
Bad
```rust
println!("order {} created", order.id);
```
```rust
tracing::info!("order {} created", order.id);
```
Good
```rust
pub const CORRELATION_HEADER: &str = "X-Correlation-Id";

pub fn init(service: &'static str) {
    tracing_subscriber::fmt().json().with_current_span(true).init();
    tracing::info!(service, "telemetry ready");
}

pub fn correlation_id(incoming: Option<&str>) -> String {
    incoming.map(str::to_owned).unwrap_or_else(|| Uuid::new_v4().to_string())
}

pub fn request_span(correlation_id: &str, path: &str, user_id: Option<&str>) -> Span {
    tracing::info_span!("request", correlation_id, path, user_id, service = SERVICE_NAME)
}
```
```rust
async fn handle(req: Request) -> Result<Response, AppError> {
    let id = telemetry::correlation_id(req.header(telemetry::CORRELATION_HEADER));
    let span = telemetry::request_span(&id, req.path(), req.user_id());
    route(req).instrument(span).await
}

tracing::info!(order_id = %order.id, "order created");
```

### 9. Centralized HTTP client
Bad
```rust
async fn rate(currency: &str) -> Result<Rate, reqwest::Error> {
    reqwest::get(format!("https://rates.internal/rates/{currency}")).await?.json().await
}
```
Good
```rust
#[derive(Clone)]
pub struct HttpClient {
    inner: reqwest::Client,
    base_url: Url,
}

impl HttpClient {
    pub fn new(base_url: Url, timeout: Duration) -> Result<Self, HttpError> {
        let inner = reqwest::Client::builder().timeout(timeout).build()?;
        Ok(Self { inner, base_url })
    }

    pub async fn get_json<T: DeserializeOwned>(&self, path: &str) -> Result<T, HttpError> {
        let url = self.base_url.join(path)?;
        Ok(self.inner.get(url).send().await?.error_for_status()?.json().await?)
    }
}

pub struct RatesGateway {
    http: HttpClient,
}

impl RatesGateway {
    pub async fn rate(&self, currency: &Currency) -> Result<Rate, HttpError> {
        self.http.get_json(&format!("rates/{}", currency.code())).await
    }
}
```

### 10. Trait at the boundary
Bad
```rust
pub struct OrderService {
    pool: PgPool,
}

impl OrderService {
    pub async fn place(&self, order: Order) -> Result<(), sqlx::Error> {
        sqlx::query("insert into orders values ($1)").bind(&order.id).execute(&self.pool).await?;
        Ok(())
    }
}
```
Good
```rust
pub trait OrderRepository: Send + Sync {
    async fn save(&self, order: &Order) -> Result<(), RepoError>;
}

pub struct OrderService<R: OrderRepository> {
    repo: R,
}

impl<R: OrderRepository> OrderService<R> {
    pub async fn place(&self, order: Order) -> Result<(), RepoError> {
        self.repo.save(&order).await
    }
}
```

### 11. Shared state
Bad
```rust
static mut COUNTER: u64 = 0;
```
Good
```rust
#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub http: HttpClient,
    pub hits: Arc<AtomicU64>,
}
```

### 12. Option combinators
Bad
```rust
let name = match user {
    Some(u) => match u.nickname {
        Some(n) => n,
        None => u.name,
    },
    None => "guest".to_string(),
};
```
Good
```rust
let name = user
    .map(|u| u.nickname.unwrap_or(u.name))
    .unwrap_or_else(|| "guest".to_string());
```

### 13. Clone to silence the borrow checker
Bad
```rust
fn total(orders: Vec<Order>) -> u64 {
    orders.clone().iter().map(|o| o.amount).sum()
}
```
Good
```rust
fn total(orders: &[Order]) -> u64 {
    orders.iter().map(|o| o.amount).sum()
}
```

### 14. Configuration
Bad
```rust
async fn connect() -> Result<PgPool, sqlx::Error> {
    PgPool::connect(&std::env::var("DATABASE_URL").unwrap()).await
}
```
Good
```rust
pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Ok(Self {
            database_url: env_var("DATABASE_URL")?,
            port: env_var("PORT")?.parse().map_err(|_| ConfigError::Invalid("PORT"))?,
        })
    }
}
```

### 15. Release scripts
Bad
```bash
cargo build
./target/debug/app
```
Good
```bash
cargo build --release
./target/release/app
```
