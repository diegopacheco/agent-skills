# Java 8 to 25

## Detected
* Spring: `application*.yml`, `application*.properties` keys under `features`, `flags`, `toggles` or `feature-flags` at any depth (`app.features.x`), `@ConditionalOnProperty`, `@Value("${features.x}")`, `env.getProperty("features.x")`.
* Togglz: `enum X implements Feature` constants as declarations, `X.NAME.isActive()` and `manager.isActive(X.NAME)` as reads.
* FF4J: `ff4j.xml` `<feature uid>` as declarations, `ff4j.check("x")`, `@Flip(name = "x")`.
* LaunchDarkly `boolVariation`, Optimizely `decide` and `isFeatureEnabled`, OpenFeature `getBooleanValue`, Unleash `isEnabled`, Split `getTreatment`, Flagsmith, ConfigCat, Statsig, Eppo, Azure `@FeatureGate` and `featureManager.isEnabled`.
* `static final String NAME = "key"` constants passed to any of the calls above.

## Version notes
* Java 8: no records and no `var`. Flags often sit in `Properties` files and `System.getProperty`. Check `System.getProperty("features.x")` reads by hand.
* Java 17 to 25: records with `@ConfigurationProperties` bind maps of flags. A record component read like `features.newCheckout()` is matched by the `features.` or `flags.` property pattern.

## Check by hand
* `Map<String, Boolean>` flags read with a key built from a variable.
* Flags read through Spring `Environment` in a loop.
* Togglz `FeatureManager` calls with a feature from a database.

## Log first
```java
public boolean isEnabled(String name) {
    boolean value = properties.features().getOrDefault(name, false);
    log.atInfo().setMessage("flag_evaluated").addKeyValue("flag", name).addKeyValue("value", value).log();
    return value;
}
```
With `logging.structured.format.console: logstash` each line is JSON with `@timestamp`, `message` and `flag`.
