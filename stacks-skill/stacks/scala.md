# scala stack

## Stack
* Scala 3.x
* sbt
* Netty
* Postgres
* HikariCP
* Spring Boot 4.2.0
* Proper types and modular code

## Idiomatic Scala
* Use Scala 3 syntax: `enum`, `given` and `using`, `extension`, optional braces.
* Use `case class` for data and `enum` for closed sets of cases.
* Use `Option`, `Either` and `Try` instead of `null` and thrown exceptions in domain code.
* Use pattern matching with exhaustive `match`.
* Use immutable collections (`List`, `Vector`, `Map`) and `val`. No `var` in domain code.
* Use `opaque type` for typed IDs and units.
* Use `for` comprehensions to chain `Option` and `Either`.
* Keep functions pure. Push side effects to the edges.
* Use `trait` for interfaces.

## Principles in Scala
* Separation of concerns: HTTP layer, domain services and repositories in separate packages. Domain code has no Netty or Spring types.
* DRY: shared logic goes into the companion object, an `extension` or a small module object.
* Interfaces: outbound ports are `trait`s passed through the constructor.

## Centralization rules in Scala
* Logging: one centralized `AppLogger` is the only way to log. It wraps SLF4J and always adds the common fields: correlation id, request path, user id and service name, taken from the MDC. The HTTP entry point (Netty handler or Spring filter) reads or creates the `X-Correlation-Id` header, puts it in the MDC and clears it at the end of the request. The HTTP client forwards the same header on outbound calls. No `println`, no `LoggerFactory.getLogger` outside `AppLogger`.
* HTTP client: one client module (configured `java.net.http.HttpClient` or the Spring `RestClient` bean) wrapped in a trait. Every outbound REST call goes through it.
* Config: one typed `AppConfig` case class loaded at startup.
* Errors: one `AppError` enum, mapped to HTTP status in one place.
* Database: one HikariCP `DataSource`, repositories receive it.
* Time: inject `java.time.Clock`.

## Bad vs Good

### 1. Null
Bad
```scala
def findUser(id: String): User =
  users.find(_.id == id).orNull
```
Good
```scala
def findUser(id: UserId): Option[User] =
  users.find(_.id == id)
```

### 2. Enum
Bad
```scala
val Pending = "PENDING"
val Paid = "PAID"
def label(status: String): String = if status == Pending then "waiting" else "done"
```
Good
```scala
enum Status:
  case Pending, Paid

def label(status: Status): String = status match
  case Status.Pending => "waiting"
  case Status.Paid    => "done"
```

### 3. Errors as values
Bad
```scala
def parseAge(s: String): Int =
  val n = s.toInt
  if n < 0 then throw IllegalArgumentException("negative")
  n
```
Good
```scala
def parseAge(s: String): Either[AppError, Age] =
  s.toIntOption.filter(_ >= 0).map(Age(_)).toRight(AppError.InvalidAge(s))
```

### 4. For comprehension
Bad
```scala
findUser(id) match
  case Some(user) =>
    findAccount(user.accountId) match
      case Some(account) => Some(account.balance)
      case None          => None
  case None => None
```
Good
```scala
for
  user    <- findUser(id)
  account <- findAccount(user.accountId)
yield account.balance
```

### 5. Mutable state
Bad
```scala
var total = 0
for item <- items do total += item.price
total
```
Good
```scala
items.map(_.price).sum
```

### 6. Opaque types
Bad
```scala
def charge(customerId: String, orderId: String, cents: Long): Unit
```
Good
```scala
opaque type CustomerId = String
object CustomerId:
  def apply(value: String): CustomerId = value

def charge(customerId: CustomerId, orderId: OrderId, amount: Money): Either[AppError, Receipt]
```

### 7. Extension methods
Bad
```scala
object MoneyUtils:
  def withTax(m: Money, rate: BigDecimal): Money = Money(m.value * (1 + rate))
```
Good
```scala
extension (m: Money)
  def withTax(rate: BigDecimal): Money = Money(m.value * (1 + rate))
```

### 8. Trait at the boundary
Bad
```scala
class OrderService:
  private val db = DriverManager.getConnection("jdbc:postgresql://localhost/app")
```
Good
```scala
trait OrderRepository:
  def save(order: Order): Either[AppError, Unit]
  def find(id: OrderId): Either[AppError, Option[Order]]

class OrderService(repository: OrderRepository, clock: Clock)
```

### 9. Logging
Bad
```scala
println(s"order $id saved")
```
```scala
private val log = LoggerFactory.getLogger(classOf[OrderService])

log.info("order saved id={}", id)
```
Good
```scala
object CorrelationId:
  val Header = "X-Correlation-Id"
  val Key = "correlationId"

  def within[A](incoming: Option[String])(body: => A): A =
    MDC.put(Key, incoming.getOrElse(UUID.randomUUID().toString))
    try body
    finally MDC.remove(Key)

final class AppLogger private (log: Logger):
  def info(event: String, fields: (String, Any)*): Unit =
    log.atInfo().addKeyValue(CorrelationId.Key, MDC.get(CorrelationId.Key))
      .addKeyValue("fields", fields.toMap).setMessage(event).log()

  def error(event: String, cause: Throwable, fields: (String, Any)*): Unit =
    log.atError().addKeyValue(CorrelationId.Key, MDC.get(CorrelationId.Key))
      .addKeyValue("fields", fields.toMap).setCause(cause).setMessage(event).log()

object AppLogger:
  def of[A](using ct: ClassTag[A]): AppLogger = AppLogger(LoggerFactory.getLogger(ct.runtimeClass))

class OrderService(repository: OrderRepository):
  private val log = AppLogger.of[OrderService]

  def save(order: Order): Either[AppError, Unit] =
    repository.save(order).map(_ => log.info("order saved", "orderId" -> order.id))
```

### 10. Centralized HTTP client
Bad
```scala
def price(sku: String): String =
  val client = HttpClient.newHttpClient()
  val req = HttpRequest.newBuilder(URI.create(s"https://prices.internal/$sku")).build()
  client.send(req, BodyHandlers.ofString()).body()
```
Good
```scala
trait HttpJson:
  def get[A: Decoder](path: String): Either[AppError, A]

final class JdkHttpJson(client: HttpClient, baseUrl: URI, timeout: Duration) extends HttpJson:
  def get[A: Decoder](path: String): Either[AppError, A] =
    val req = HttpRequest.newBuilder(baseUrl.resolve(path)).timeout(timeout).build()
    val res = client.send(req, BodyHandlers.ofString())
    if res.statusCode() == 200 then summon[Decoder[A]].decode(res.body())
    else Left(AppError.Upstream(res.statusCode()))

final class PriceGateway(http: HttpJson):
  def price(sku: Sku): Either[AppError, Price] = http.get[Price](s"/prices/${sku.value}")
```

### 11. Errors mapped in one place
Bad
```scala
case Left(e) => Response(500, e.toString)
```
Good
```scala
enum AppError:
  case NotFound(id: String)
  case InvalidAge(raw: String)
  case Upstream(status: Int)
  case MissingConfig(key: String)

object AppError:
  def status(e: AppError): Int = e match
    case NotFound(_)      => 404
    case InvalidAge(_)    => 400
    case Upstream(_)      => 502
    case MissingConfig(_) => 500
```

### 12. Given and using
Bad
```scala
def save(order: Order, ds: DataSource, clock: Clock): Unit
def update(order: Order, ds: DataSource, clock: Clock): Unit
```
Good
```scala
class OrderRepository(using ds: DataSource, clock: Clock):
  def save(order: Order): Either[AppError, Unit]
  def update(order: Order): Either[AppError, Unit]
```

### 13. Configuration
Bad
```scala
val port = sys.env("PORT").toInt
```
Good
```scala
final case class AppConfig(port: Int, dbUrl: String, pricesUrl: URI)

object AppConfig:
  def load(env: Map[String, String]): Either[AppError, AppConfig] =
    for
      port   <- env.get("PORT").flatMap(_.toIntOption).toRight(AppError.MissingConfig("PORT"))
      db     <- env.get("DB_URL").toRight(AppError.MissingConfig("DB_URL"))
      prices <- env.get("PRICES_URL").map(URI.create).toRight(AppError.MissingConfig("PRICES_URL"))
    yield AppConfig(port, db, prices)
```
