# java stack

## Stack
* Java 25
* Maven
* Spring Boot 4.1.x
* Spring Data JDBC
* Postgres
* HikariCP
* Modular code

## Idiomatic Java
* Use `record` for data carriers and value objects.
* Use `sealed interface` plus `record` for closed sets of cases, and `switch` pattern matching over them.
* Use `Optional` as a return type only. Never as a field or a parameter.
* Use virtual threads (`spring.threads.virtual.enabled=true`) instead of reactive code.
* Constructor injection only, with `final` fields. No field `@Autowired`.
* Use text blocks for SQL and multi line strings.
* Use `List.of`, `Map.of`, `Set.of` for immutable collections.

## Principles in Java
* Separation of concerns: `@RestController` parses and returns DTOs, `@Service` holds rules, Spring Data JDBC `Repository` talks to Postgres.
* DRY: shared rules go into a domain method or a small `final` utility class in the feature package.
* Interfaces: the service depends on interfaces for outbound ports (`PaymentGateway`, `Clock`). Spring wires the implementation.

## Centralization rules in Java
* Logging: one centralized `AppLogger` class is the only way to log. It wraps SLF4J and always adds the common fields: correlation id, request path, user id and service name, taken from the MDC. A servlet filter reads or creates the `X-Correlation-Id` header, puts it in the MDC and clears it at the end of the request. The `RestClient` bean forwards the same header on outbound calls. No `System.out`, no `LoggerFactory.getLogger` outside `AppLogger`.
* HTTP client: one `RestClient` bean built in a `@Configuration` class with base URL, timeouts and error handler. Inject it. Never call `RestClient.create()` or `new HttpClient` in a service.
* Config: one `@ConfigurationProperties` record per area. No `@Value` scattered around, no `System.getenv`.
* Errors: one `@RestControllerAdvice` maps exceptions to `ProblemDetail`.
* JSON: the Spring `ObjectMapper` bean. Never `new ObjectMapper()`.
* Time: inject `java.time.Clock`. Never `LocalDateTime.now()` without a clock.

## Bad vs Good

### 1. Data carrier
Bad
```java
public class Order {
    private String id;
    private BigDecimal total;
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}
```
Good
```java
public record Order(String id, BigDecimal total) {}
```

### 2. Dependency injection
Bad
```java
@Service
public class OrderService {
    @Autowired
    private OrderRepository repository;
}
```
Good
```java
@Service
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
```

### 3. Closed set of cases
Bad
```java
public double area(Object shape) {
    if (shape instanceof Circle) {
        Circle c = (Circle) shape;
        return Math.PI * c.r() * c.r();
    } else if (shape instanceof Square) {
        Square s = (Square) shape;
        return s.side() * s.side();
    }
    throw new IllegalArgumentException();
}
```
Good
```java
public sealed interface Shape permits Circle, Square {}
public record Circle(double r) implements Shape {}
public record Square(double side) implements Shape {}

public double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Square s -> s.side() * s.side();
    };
}
```

### 4. Optional
Bad
```java
public Customer find(String id) {
    return repository.findById(id).orElse(null);
}
```
Good
```java
public Optional<Customer> find(String id) {
    return repository.findById(id);
}
```

### 5. Logging
Bad
```java
System.out.println("order created " + order.id());
```
```java
private static final Logger log = LoggerFactory.getLogger(OrderService.class);

log.info("order created id={}", order.id());
```
Good
```java
public final class AppLogger {
    private final Logger log;

    private AppLogger(Class<?> owner) {
        this.log = LoggerFactory.getLogger(owner);
    }

    public static AppLogger of(Class<?> owner) {
        return new AppLogger(owner);
    }

    public void info(String event, Map<String, Object> fields) {
        log.atInfo().addKeyValue("correlationId", MDC.get(CorrelationId.KEY)).setMessage(event)
                .addKeyValue("fields", fields).log();
    }

    public void error(String event, Throwable cause, Map<String, Object> fields) {
        log.atError().addKeyValue("correlationId", MDC.get(CorrelationId.KEY)).setMessage(event)
                .addKeyValue("fields", fields).setCause(cause).log();
    }
}

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader(CorrelationId.HEADER)).orElseGet(() -> UUID.randomUUID().toString());
        MDC.put(CorrelationId.KEY, id);
        res.setHeader(CorrelationId.HEADER, id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove(CorrelationId.KEY);
        }
    }
}

private static final AppLogger log = AppLogger.of(OrderService.class);

log.info("order created", Map.of("orderId", order.id()));
```

### 6. Centralized REST client
Bad
```java
public Rate fetchRate(String currency) {
    RestClient client = RestClient.create("https://rates.internal");
    return client.get().uri("/rates/{c}", currency).retrieve().body(Rate.class);
}
```
Good
```java
@Configuration
public class HttpClients {
    @Bean
    RestClient ratesClient(RatesProperties props, RestClient.Builder builder) {
        return builder.baseUrl(props.baseUrl())
                .defaultStatusHandler(HttpStatusCode::isError, (req, res) -> {
                    throw new RatesUnavailable(res.getStatusCode());
                })
                .build();
    }
}

@Component
public class RatesGateway {
    private final RestClient ratesClient;

    public RatesGateway(RestClient ratesClient) {
        this.ratesClient = ratesClient;
    }

    public Rate fetchRate(String currency) {
        return ratesClient.get().uri("/rates/{c}", currency).retrieve().body(Rate.class);
    }
}
```

### 7. Configuration
Bad
```java
String url = System.getenv("RATES_URL");
int timeout = Integer.parseInt(System.getenv("RATES_TIMEOUT"));
```
Good
```java
@ConfigurationProperties("rates")
public record RatesProperties(URI baseUrl, Duration timeout) {}
```

### 8. Separation of concerns
Bad
```java
@RestController
public class OrderController {
    private final JdbcTemplate jdbc;

    @PostMapping("/orders")
    public void create(@RequestBody Map<String, Object> body) {
        jdbc.update("insert into orders(id, total) values (?, ?)", body.get("id"), body.get("total"));
    }
}
```
Good
```java
@RestController
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/orders")
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        return OrderResponse.from(service.create(request.toCommand()));
    }
}
```

### 9. Error handling in one place
Bad
```java
@GetMapping("/orders/{id}")
public ResponseEntity<?> get(@PathVariable String id) {
    try {
        return ResponseEntity.ok(service.get(id));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
}
```
Good
```java
@GetMapping("/orders/{id}")
public OrderResponse get(@PathVariable String id) {
    return OrderResponse.from(service.get(id));
}

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(OrderNotFound.class)
    ProblemDetail notFound(OrderNotFound e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }
}
```

### 10. Swallowed exception
Bad
```java
try {
    gateway.charge(payment);
} catch (Exception e) {
}
```
Good
```java
try {
    gateway.charge(payment);
} catch (GatewayTimeout e) {
    throw new PaymentFailed(payment.id(), e);
}
```

### 11. Clock
Bad
```java
public boolean isExpired(Token token) {
    return token.expiresAt().isBefore(Instant.now());
}
```
Good
```java
public boolean isExpired(Token token) {
    return token.expiresAt().isBefore(clock.instant());
}
```

### 12. Interface at the boundary
Bad
```java
@Service
public class CheckoutService {
    private final StripeClient stripe = new StripeClient();
}
```
Good
```java
public interface PaymentGateway {
    Receipt charge(Payment payment);
}

@Service
public class CheckoutService {
    private final PaymentGateway gateway;

    public CheckoutService(PaymentGateway gateway) {
        this.gateway = gateway;
    }
}
```

### 13. DRY
Bad
```java
BigDecimal invoiceTotal = items.stream().map(i -> i.price().multiply(BigDecimal.valueOf(i.qty()))).reduce(BigDecimal.ZERO, BigDecimal::add);
BigDecimal cartTotal = lines.stream().map(l -> l.price().multiply(BigDecimal.valueOf(l.qty()))).reduce(BigDecimal.ZERO, BigDecimal::add);
```
Good
```java
public record LineItem(BigDecimal price, int qty) {
    BigDecimal subtotal() {
        return price.multiply(BigDecimal.valueOf(qty));
    }

    static BigDecimal total(List<LineItem> items) {
        return items.stream().map(LineItem::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

### 14. SQL
Bad
```java
jdbc.query("select * from orders where customer_id = '" + customerId + "'", mapper);
```
Good
```java
public interface OrderRepository extends ListCrudRepository<Order, String> {
    @Query("""
            select id, total
            from orders
            where customer_id = :customerId
            """)
    List<Order> findByCustomer(String customerId);
}
```

### 15. Immutable collections
Bad
```java
List<String> roles = new ArrayList<>();
roles.add("admin");
roles.add("user");
return roles;
```
Good
```java
return List.of("admin", "user");
```
