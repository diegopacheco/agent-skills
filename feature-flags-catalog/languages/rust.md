# Rust edition 2024, toolchain 1.99

## Detected
* `Cargo.toml` `[features]` entries (except `default`) as declarations, `#[cfg(feature = "x")]`, `cfg!(feature = "x")` and `#[cfg_attr(feature = "x", ...)]` as reads.
* OpenFeature `client.get_bool_value("x", None, None)`, Unleash `is_enabled`, LaunchDarkly `bool_variation`.
* `std::env::var("FEATURE_X")` reads.
* `const FLAG_X: &str = "x";` constants passed to SDK calls.

## Check by hand
* Cargo features a dependent crate enables (`features = ["x"]` in another crate) are reads the scan does not follow across crates. Search the workspace before deleting.
* `format!("region-{}", r)` keys become dynamic reads.

## Log first
```rust
pub fn is_enabled(&self, name: &str) -> bool {
    let value = self.values.get(name).copied().unwrap_or(false);
    tracing::info!(event = "flag_evaluated", flag = name, value);
    value
}
```
`tracing_subscriber::fmt().json()` writes one JSON line per read.
