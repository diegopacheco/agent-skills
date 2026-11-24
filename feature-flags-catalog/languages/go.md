# Go

## Detected
* LaunchDarkly `client.BoolVariation("x", ctx, false)`, OpenFeature `client.BooleanValue(ctx, "x", false, ec)`, Unleash `unleash.IsEnabled("x")`, Statsig `CheckGate(user, "x")`, Flipt `FlagKey: "x"`, ConfigCat `GetBoolValue`.
* `os.Getenv("FEATURE_X")` reads and `FEATURE_X` keys in `*.env`, compose and Kubernetes YAML.
* `viper.GetBool("features.x")` and YAML or TOML `[features]` declarations.
* `const FlagX = "x"` constants passed to SDK calls.
* `fmt.Sprintf("region-%s", r)` keys become dynamic reads.

## Check by hand
* Build tags (`//go:build experimental`) act like flags but are not reported.
* Flags inside generated code (`*_gen.go`).

## Log first
```go
func (f Flags) IsEnabled(ctx context.Context, name string) bool {
	value := f.values[name]
	slog.InfoContext(ctx, "flag_evaluated", "flag", name, "value", value)
	return value
}
```
`slog.NewJSONHandler` writes `time`, `msg` and `flag` per line.
