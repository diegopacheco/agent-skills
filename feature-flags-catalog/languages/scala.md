# Scala 2 and 3

## Detected
* HOCON `application.conf`: `features { x = true }` and `features.x = true` as declarations.
* Typesafe Config reads: `config.getBoolean("features.x")`.
* `sys.env("FEATURE_X")` and `sys.env.get("FEATURE_X")`.
* OpenFeature, LaunchDarkly, Split, Unleash calls from Scala use the Java SDKs and are matched the same way.
* Scala 3 indentation syntax needs nothing special: the scan is line and call based.

## Check by hand
* `s"region-$r"` interpolations become dynamic reads.
* Pureconfig case classes: a field `newCheckout` in `case class Features(...)` is read as `features.newCheckout`. Confirm the case class is loaded from the `features` block.

## Log first
```scala
def isEnabled(name: String): Boolean =
  val value = flags.getOrElse(name, false)
  logger.info(s"""{"event":"flag_evaluated","flag":"$name","value":$value}""")
  value
```
