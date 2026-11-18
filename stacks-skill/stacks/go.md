# go stack

## Stack
* Go 1.26.x
* Modular code with packages
* Proper types

## Idiomatic Go
* Return `error` as the last value and check it right away. Wrap with `fmt.Errorf("context: %w", err)`.
* Use `errors.Is` and `errors.As`, never compare error strings.
* Accept interfaces, return structs. Define the interface in the package that uses it, not the one that implements it.
* Keep interfaces small: one or two methods.
* Pass `context.Context` as the first parameter of anything that does IO.
* Use the standard library first: `net/http` with method patterns in `ServeMux`, `log/slog`, `encoding/json`, `database/sql`.
* Package names are short, lower case, singular, with no `util`, `common` or `helpers`.
* Make the zero value useful. Use constructors (`NewX`) only when setup is needed.
* Use generics only when the same code would be repeated for several types.
* Do not start goroutines you cannot stop. Every goroutine has an exit through `ctx` or a closed channel.
* Use table driven tests.
* Run `go vet` and `gofmt` before saying it is done.

## Principles in Go
* Separation of concerns: `cmd/app` for `main`, `internal/<feature>` for handlers, services and stores. Handlers do not touch `database/sql`.
* DRY: shared logic goes into a function in the owning package. Do not create a `utils` package.
* Interfaces: consumers define the small interface they need. Constructors take it as a parameter.

## Centralization rules in Go
* Logging: one centralized `logx` package is the only place that builds the logger. It wraps `slog` with a handler that always adds the common fields from the `context.Context`: correlation id, request path, user id and service name. A middleware reads or creates the `X-Correlation-Id` header and puts it in the context. The shared HTTP client forwards it on outbound calls. All logs use the `...Context` methods (`InfoContext`, `ErrorContext`). No `fmt.Println`, `log.Printf` or a second `slog.New`.
* HTTP client: one `*http.Client` with timeouts, wrapped in a small client type with the base URL. Every outbound REST call goes through it. Never use `http.Get` or `http.DefaultClient`.
* Config: one `Config` struct loaded in `main`. No `os.Getenv` deep in the code.
* Errors: sentinel and typed errors per package, mapped to HTTP status in one middleware or helper.
* Database: one `*sql.DB` opened in `main` and passed to stores.
* Time: inject a `func() time.Time` or a `Clock` interface.

## Bad vs Good

### 1. Error wrapping
Bad
```go
user, err := store.Get(ctx, id)
if err != nil {
    return nil, errors.New("failed")
}
```
Good
```go
user, err := store.Get(ctx, id)
if err != nil {
    return nil, fmt.Errorf("get user %s: %w", id, err)
}
```

### 2. Comparing errors
Bad
```go
if err.Error() == "sql: no rows in result set" {
    return nil, nil
}
```
Good
```go
if errors.Is(err, sql.ErrNoRows) {
    return nil, ErrUserNotFound
}
```

### 3. Ignored error
Bad
```go
data, _ := json.Marshal(order)
w.Write(data)
```
Good
```go
if err := json.NewEncoder(w).Encode(order); err != nil {
    logger.ErrorContext(ctx, "encode order", "err", err)
}
```

### 4. Interface defined by the consumer
Bad
```go
package store

type UserStore interface {
    Get(ctx context.Context, id string) (User, error)
    List(ctx context.Context) ([]User, error)
    Save(ctx context.Context, u User) error
    Delete(ctx context.Context, id string) error
}
```
Good
```go
package billing

type userGetter interface {
    Get(ctx context.Context, id string) (user.User, error)
}

type Service struct {
    users userGetter
}

func NewService(users userGetter) *Service {
    return &Service{users: users}
}
```

### 5. Context
Bad
```go
func (s *Store) Get(id string) (User, error) {
    row := s.db.QueryRow("select id, name from users where id = $1", id)
}
```
Good
```go
func (s *Store) Get(ctx context.Context, id string) (User, error) {
    row := s.db.QueryRowContext(ctx, "select id, name from users where id = $1", id)
}
```

### 6. Logging
Bad
```go
fmt.Println("order created", order.ID)
```
```go
slog.Info("order created", "order_id", order.ID)
```
Good
```go
package logx

type ctxKey struct{}

const Header = "X-Correlation-Id"

type Fields struct {
    CorrelationID string
    Path          string
    UserID        string
}

func With(ctx context.Context, f Fields) context.Context {
    return context.WithValue(ctx, ctxKey{}, f)
}

type handler struct {
    slog.Handler
    service string
}

func (h handler) Handle(ctx context.Context, r slog.Record) error {
    f, _ := ctx.Value(ctxKey{}).(Fields)
    r.AddAttrs(
        slog.String("correlation_id", f.CorrelationID),
        slog.String("path", f.Path),
        slog.String("user_id", f.UserID),
        slog.String("service", h.service),
    )
    return h.Handler.Handle(ctx, r)
}

func New(service string) *slog.Logger {
    return slog.New(handler{Handler: slog.NewJSONHandler(os.Stdout, nil), service: service})
}

func Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := r.Header.Get(Header)
        if id == "" {
            id = rand.Text()
        }
        w.Header().Set(Header, id)
        ctx := With(r.Context(), Fields{CorrelationID: id, Path: r.URL.Path})
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```
```go
s.logger.InfoContext(ctx, "order created", "order_id", order.ID)
```

### 7. Centralized HTTP client
Bad
```go
func Rate(currency string) (Rate, error) {
    resp, err := http.Get("https://rates.internal/rates/" + currency)
}
```
Good
```go
type Client struct {
    http    *http.Client
    baseURL string
}

func NewClient(baseURL string, timeout time.Duration) *Client {
    return &Client{http: &http.Client{Timeout: timeout}, baseURL: baseURL}
}

func (c *Client) GetJSON(ctx context.Context, path string, out any) error {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
    if err != nil {
        return fmt.Errorf("build request %s: %w", path, err)
    }
    resp, err := c.http.Do(req)
    if err != nil {
        return fmt.Errorf("get %s: %w", path, err)
    }
    defer resp.Body.Close()
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("get %s: status %d", path, resp.StatusCode)
    }
    return json.NewDecoder(resp.Body).Decode(out)
}

func (g *RatesGateway) Rate(ctx context.Context, currency string) (Rate, error) {
    var r Rate
    err := g.client.GetJSON(ctx, "/rates/"+currency, &r)
    return r, err
}
```

### 8. Standard router
Bad
```go
http.HandleFunc("/orders/", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        w.WriteHeader(405)
        return
    }
    id := strings.TrimPrefix(r.URL.Path, "/orders/")
})
```
Good
```go
mux := http.NewServeMux()
mux.HandleFunc("GET /orders/{id}", h.getOrder)

func (h *Handler) getOrder(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
}
```

### 9. Utils package
Bad
```go
package utils

func FormatMoney(cents int64) string
func ParseUserID(s string) string
```
Good
```go
package money

func (c Cents) String() string

package user

func ParseID(s string) (ID, error)
```

### 10. Goroutine leak
Bad
```go
go func() {
    for {
        poll()
        time.Sleep(time.Second)
    }
}()
```
Good
```go
go func() {
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            poll(ctx)
        }
    }
}()
```

### 11. Configuration
Bad
```go
func (s *Store) Open() error {
    db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
}
```
Good
```go
type Config struct {
    DatabaseURL string
    Port        int
}

func Load() (Config, error) {
    port, err := strconv.Atoi(os.Getenv("PORT"))
    if err != nil {
        return Config{}, fmt.Errorf("PORT: %w", err)
    }
    url := os.Getenv("DATABASE_URL")
    if url == "" {
        return Config{}, errors.New("DATABASE_URL is required")
    }
    return Config{DatabaseURL: url, Port: port}, nil
}
```

### 12. Table driven tests
Bad
```go
func TestFee(t *testing.T) {
    if Fee(Express) != 20 {
        t.Fail()
    }
    if Fee(Standard) != 5 {
        t.Fail()
    }
}
```
Good
```go
func TestFee(t *testing.T) {
    tests := []struct {
        name string
        in   Shipping
        want int
    }{
        {"express costs more for next day delivery", Express, 20},
        {"standard is the cheap default", Standard, 5},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            if got := Fee(tt.in); got != tt.want {
                t.Errorf("Fee(%v) = %d, want %d", tt.in, got, tt.want)
            }
        })
    }
}
```

### 13. Typed constants
Bad
```go
func Fee(kind string) int
```
Good
```go
type Shipping int

const (
    Standard Shipping = iota
    Express
)

func Fee(kind Shipping) int
```

### 14. Errors mapped in one place
Bad
```go
if err != nil {
    http.Error(w, err.Error(), 500)
    return
}
```
Good
```go
func writeError(ctx context.Context, w http.ResponseWriter, logger *slog.Logger, err error) {
    switch {
    case errors.Is(err, ErrNotFound):
        http.Error(w, "not found", http.StatusNotFound)
    case errors.Is(err, ErrInvalid):
        http.Error(w, "invalid request", http.StatusBadRequest)
    default:
        logger.ErrorContext(ctx, "request failed", "err", err)
        http.Error(w, "internal error", http.StatusInternalServerError)
    }
}
```
