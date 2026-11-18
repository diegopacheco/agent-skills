# kotlin stack

## Stack
* Kotlin 2.x
* Java 25
* Gradle wrapper (`./gradlew`)
* Spring Boot 4.1.x
* Postgres
* HikariCP
* Proper types and modular code

## Idiomatic Kotlin
* Use `data class` for value objects and DTOs, with `val` fields.
* Use `sealed interface` plus `when` for closed sets of cases. No `else` branch when the `when` is exhaustive.
* Use nullable types (`T?`) with `?.`, `?:` and `let`. Never `!!`.
* Use expression bodies for short functions.
* Use `val` everywhere, `var` only when a value must change.
* Use `require` and `check` for preconditions.
* Use named and default arguments instead of overloads and builders.
* Use `List`, `Map`, `Set` (read only) in signatures, never `MutableList` unless the caller must mutate.
* Use `@JvmInline value class` for typed IDs.

## Principles in Kotlin
* Separation of concerns: controller, service and repository in the same feature package, each with one job.
* DRY: shared logic goes into a member function, an extension function or a top level function in the feature package.
* Interfaces: outbound ports are Kotlin interfaces injected through the primary constructor.

## Centralization rules in Kotlin
* Logging: one centralized `AppLogger` class is the only way to log. It wraps SLF4J and always adds the common fields: correlation id, request path, user id and service name, taken from the MDC. A servlet filter reads or creates the `X-Correlation-Id` header, puts it in the MDC and clears it at the end of the request. The `RestClient` bean forwards the same header on outbound calls. No `println`, no `LoggerFactory.getLogger` outside `AppLogger`.
* HTTP client: one `RestClient` bean in a `@Configuration` class. Every outbound REST call uses it through a gateway class.
* Config: one `@ConfigurationProperties` data class per area. No `System.getenv` in the code.
* Errors: one `@RestControllerAdvice`.
* JSON: the Spring `ObjectMapper` bean with the Kotlin module. Never build a new mapper.
* Time: inject `java.time.Clock`.

## Bad vs Good

### 1. Data class
Bad
```kotlin
class User {
    var id: String = ""
    var email: String = ""
}
```
Good
```kotlin
data class User(val id: UserId, val email: String)
```

### 2. Null safety
Bad
```kotlin
fun emailDomain(user: User?): String = user!!.email.split("@")[1]
```
Good
```kotlin
fun emailDomain(user: User?): String? = user?.email?.substringAfter("@")
```

### 3. Sealed types
Bad
```kotlin
fun describe(result: Any): String =
    if (result is Success) "ok ${result.value}"
    else if (result is Failure) "failed ${result.reason}"
    else "unknown"
```
Good
```kotlin
sealed interface Result
data class Success(val value: Int) : Result
data class Failure(val reason: String) : Result

fun describe(result: Result): String = when (result) {
    is Success -> "ok ${result.value}"
    is Failure -> "failed ${result.reason}"
}
```

### 4. Constructor injection
Bad
```kotlin
@Service
class OrderService {
    @Autowired
    lateinit var repository: OrderRepository
}
```
Good
```kotlin
@Service
class OrderService(private val repository: OrderRepository)
```

### 5. Default arguments
Bad
```kotlin
fun page(size: Int): Page = page(size, 0)
fun page(size: Int, offset: Int): Page = Page(size, offset)
```
Good
```kotlin
fun page(size: Int = 20, offset: Int = 0): Page = Page(size, offset)
```

### 6. Typed IDs
Bad
```kotlin
fun transfer(from: String, to: String, amount: Long)
```
Good
```kotlin
@JvmInline value class AccountId(val value: String)

fun transfer(from: AccountId, to: AccountId, amount: Money)
```

### 7. Logging
Bad
```kotlin
println("payment failed for $orderId")
```
```kotlin
private val log = LoggerFactory.getLogger(PaymentService::class.java)

log.warn("payment failed orderId={}", orderId.value)
```
Good
```kotlin
class AppLogger private constructor(private val log: Logger) {
    fun info(event: String, vararg fields: Pair<String, Any?>) =
        log.atInfo().withCommon().setMessage(event).addKeyValue("fields", mapOf(*fields)).log()

    fun error(event: String, cause: Throwable, vararg fields: Pair<String, Any?>) =
        log.atError().withCommon().setMessage(event).addKeyValue("fields", mapOf(*fields)).setCause(cause).log()

    private fun LoggingEventBuilder.withCommon(): LoggingEventBuilder =
        addKeyValue("correlationId", MDC.get(CorrelationId.KEY))

    companion object {
        fun of(owner: KClass<*>): AppLogger = AppLogger(LoggerFactory.getLogger(owner.java))
    }
}

@Component
class CorrelationIdFilter : OncePerRequestFilter() {
    override fun doFilterInternal(req: HttpServletRequest, res: HttpServletResponse, chain: FilterChain) {
        val id = req.getHeader(CorrelationId.HEADER) ?: UUID.randomUUID().toString()
        MDC.put(CorrelationId.KEY, id)
        res.setHeader(CorrelationId.HEADER, id)
        try {
            chain.doFilter(req, res)
        } finally {
            MDC.remove(CorrelationId.KEY)
        }
    }
}

class PaymentService {
    private val log = AppLogger.of(PaymentService::class)

    fun fail(orderId: OrderId) = log.info("payment failed", "orderId" to orderId.value)
}
```

### 8. Centralized REST client
Bad
```kotlin
fun stock(sku: String): Stock =
    RestClient.create("https://stock.internal").get().uri("/stock/$sku").retrieve().body(Stock::class.java)!!
```
Good
```kotlin
@Configuration
class HttpClients {
    @Bean
    fun stockClient(props: StockProperties, builder: RestClient.Builder): RestClient =
        builder.baseUrl(props.baseUrl.toString()).build()
}

@Component
class StockGateway(private val stockClient: RestClient) {
    fun stock(sku: Sku): Stock? =
        stockClient.get().uri("/stock/{sku}", sku.value).retrieve().body<Stock>()
}
```

### 9. Configuration
Bad
```kotlin
val baseUrl = System.getenv("STOCK_URL") ?: "http://localhost"
```
Good
```kotlin
@ConfigurationProperties("stock")
data class StockProperties(val baseUrl: URI, val timeout: Duration)
```

### 10. Preconditions
Bad
```kotlin
fun withdraw(amount: Long) {
    if (amount <= 0) throw IllegalArgumentException("bad amount")
}
```
Good
```kotlin
fun withdraw(amount: Long) {
    require(amount > 0) { "amount must be positive, was $amount" }
}
```

### 11. Collections
Bad
```kotlin
val names = ArrayList<String>()
for (u in users) {
    if (u.active) names.add(u.name)
}
```
Good
```kotlin
val names = users.filter { it.active }.map { it.name }
```

### 12. Read only signatures
Bad
```kotlin
fun total(items: MutableList<Item>): Money
```
Good
```kotlin
fun total(items: List<Item>): Money
```

### 13. Interface at the boundary
Bad
```kotlin
@Service
class NotificationService {
    private val smtp = SmtpClient("smtp.internal", 25)
}
```
Good
```kotlin
interface Mailer {
    fun send(mail: Mail)
}

@Service
class NotificationService(private val mailer: Mailer)
```
