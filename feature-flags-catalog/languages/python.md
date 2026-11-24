# Python 3

## Detected
* LaunchDarkly `ldclient.get().variation("x", ctx, False)`, PostHog `feature_enabled("x", id)`, Flagsmith `is_feature_enabled("x")`, Statsig `check_gate(user, "x")`, Unleash `is_enabled("x")`, Optimizely, OpenFeature `get_boolean_value`, Django Waffle `flag_is_active(request, "x")` and `switch_is_active("x")`.
* `os.environ["FEATURE_X"]`, `os.environ.get` and `os.getenv` reads.
* JSON files with flag, feature or toggle in the name, YAML and TOML `features` sections.
* f-strings `f"region-{r}"` become dynamic reads.

## Check by hand
* Django `settings.FEATURE_FLAGS = {...}` dicts in Python code are not parsed as declarations. Read them and add review entries.
* Waffle flags live in the database. Ask for an export or a `dumpdata waffle` file and pass it with `--export`.

## Log first
```python
def is_enabled(name: str) -> bool:
    value = FLAGS.get(name, False)
    logger.info("flag_evaluated", extra={"flag": name, "value": value})
    return value
```
Use a JSON formatter so `flag` lands as a key on the line.
