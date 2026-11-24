# Kotlin 2.x

## Detected
* Same Spring, Togglz, FF4J and SDK rules as Java. `enum class X : Feature` constants are Togglz declarations.
* String templates `"region-$region"` and `"region-${r.code}"` become dynamic reads with prefix `region-`.
* `const val FLAG_X = "key"` constants passed to SDK calls.

## Check by hand
* `map.getValue("x")` is not a flag read unless the map is a flags map. The scan only counts it when the receiver name has flag, feature or toggle in it.
* Flags inside `when` branches built from sealed classes.

## Log first
```kotlin
fun isEnabled(name: String): Boolean {
    val value = features[name] ?: false
    log.atInfo().setMessage("flag_evaluated").addKeyValue("flag", name).addKeyValue("value", value).log()
    return value
}
```
