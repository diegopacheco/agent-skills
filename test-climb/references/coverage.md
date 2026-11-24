# Coverage commands

`climb.sh` reads the last `NN.N%` printed by the coverage command. Each command below prints the line coverage of the whole project as one percentage.

| Stack | Coverage command |
|---|---|
| Node.js (node:test) | `node --test --experimental-test-coverage 2>&1 \| awk -F'\|' '/all files/{gsub(/[ #]/,"",$2); print $2"%"}'` |
| Bun | `bun test --coverage 2>&1 \| awk -F'\|' '/All files/{gsub(/ /,"",$3); print $3"%"}'` |
| Jest | `npx jest --coverage --coverageReporters=text-summary 2>&1 \| grep Lines` |
| Vitest | `npx vitest run --coverage --coverage.reporter=text-summary 2>&1 \| grep Lines` |
| Python (pytest-cov) | `uv run pytest --cov --cov-report=term 2>&1 \| grep TOTAL` |
| Go | `go test -coverprofile=/tmp/c.out ./... > /dev/null && go tool cover -func=/tmp/c.out \| tail -1` |
| Rust | `cargo llvm-cov --summary-only 2>&1 \| grep TOTAL \| awk '{print $10}'` |
| Java / Kotlin Maven (JaCoCo) | `mvn -q verify && awk -F, 'NR>1{m+=$8;c+=$9} END{printf "%.2f%%\n", 100*c/(m+c)}' target/site/jacoco/jacoco.csv` |
| Java / Kotlin Gradle (JaCoCo) | `./gradlew -q test jacocoTestReport && awk -F, 'NR>1{m+=$8;c+=$9} END{printf "%.2f%%\n", 100*c/(m+c)}' build/reports/jacoco/test/jacocoTestReport.csv` |
| Scala (sbt-scoverage) | `sbt -batch coverage test coverageReport 2>&1 \| grep -i "statement coverage"` |

node:test and Bun only count files that a test loads. If a module has no test yet it is missing from the total, and the first test that loads it can lower the percentage. Load every module from the tests through the package entry point (`src/index.mjs`) before `climb.sh init`.

If the stack is not listed, build a command that prints one percentage and run it once by hand before `climb.sh init`.

## Mutants that work well

| Logic | Mutation |
|---|---|
| Comparison | `>` to `>=`, `<` to `<=`, `==` to `!=` |
| Arithmetic | `+` to `-`, `*` to `/`, `100` to `10` |
| Boolean | `&&` to `\|\|`, `true` to `false`, `!x` to `x` |
| Boundaries | `0` to `1`, `length - 1` to `length` |
| Return | `return x` to `return null` / `None` / `0` / `""` |
| Money | `HALF_EVEN` to `HALF_UP`, `round(x, 2)` to `round(x, 1)` |
