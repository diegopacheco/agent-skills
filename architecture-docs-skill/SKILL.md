---
name: architecture-docs-skill
description: Reads a codebase and generates a self-contained, searchable architecture website with light and dark themes - stack with logos and links, lines of code per language, a hand-drawn architecture diagram, the 3-5 most critical sequence diagrams with notes, a drill down of the 3-5 most interesting components (how they work, interesting facts, what they get right, what could be better) and a test analysis with counters per test kind. Use when the user runs /architecture-docs-skill or asks to document, explain, map or diagram the architecture of a project.
allowed-tools: [Bash, Read, Write, Glob, Grep, AskUserQuestion]
---

# Architecture Docs Skill

Read a project, write one `data.json` that describes it, and run `scripts/build.py`. The script checks the data, counts the lines of code, finds the GitHub URL, and writes a single `index.html` (CSS, JS, logos and data inlined) plus `run.sh` and `stop.sh`.

`SKILL_DIR` below is the folder this file lives in.

## Inputs
* The project folder: the path the user gave, or the current directory. Resolve it to an absolute path.
* If the folder holds several apps and it is not clear which one, ask with AskUserQuestion.
* The output folder: `~/architecture-docs/<project-folder-name>/` unless the user names one.

## Rules
* Every claim must come from code you read. Never guess a port, a version, a count, a file or a behavior. When a fact cannot be confirmed, leave it out.
* Read the code, not only the README. READMEs drift; when they disagree, the code wins.
* Paths in `components[].path` and `sequences[].code` are relative to the project folder and must exist. The build fails on any path that does not.
* Plain direct language. No metaphors, no filler, no marketing words.
* Never use the words "demo", "demonstration" or "example" in the generated content.
* Text fields are escaped. Wrap code, files, tables, columns and commands in backticks and they render as `code`. No other markup.
* Never write line counts in text fields. The site shows the counted lines and two numbers for one file confuse the reader.
* "What could be better" must be real and specific to this code. Check before you write it: if the code already does it (jitter, backoff, caching, debounce, retries, migrations), it is not a gap.

## Steps
Report progress as `x/7` while you work.

1. **Map the project.** List the tree (skip `node_modules`, `target`, `dist`, `build`, `.git`). Read the README, design docs, build files (`package.json`, `Cargo.toml`, `pom.xml`, `build.gradle*`, `go.mod`, `pyproject.toml`, `requirements.txt`, `build.sbt`, `Containerfile`, compose files) and the entry points.
2. **Stack.** One entry per technology that matters: languages, frameworks, databases, queues, runtimes, desktop shells, test tools, AI providers. Take versions from the build files. `why` is one line about what it does in this project.
3. **Architecture.** Find the real runtime pieces: processes, services, modules with their own job, stores, external systems, and who calls whom. Lay them out left to right in the order a request flows.
4. **Sequences.** Pick 3-5 flows: the most critical (breaks the product when it fails), the most used, and the most architecture-interesting (crosses processes, queues, schedulers, retries, caches). Follow each one through the code, step by step. For each flow, write the notes a reader will ask after looking at the diagram: how is X decided, where is the state stored, what happens on failure, what runs in parallel, what limits apply. Answer with the real query, column, constant or function name.
5. **Components.** Pick 3-5 components that are critical or have interesting design. Read them fully.
6. **Tests.** Count tests per kind from the code (see Test analysis). Find the command that runs them.
7. **Build and check.** Write `data.json` in the scratch or temp folder, never inside the project, then run:
   ```
   python3 "$SKILL_DIR/scripts/build.py" /path/to/data.json [out-dir]
   ```
   Fix every `invalid data:` error and run it again until it prints `built`. Then run `<out-dir>/run.sh`, unless the user asked not to open a browser. Tell the user the URL, the `index.html` path, and `<out-dir>/stop.sh`.

## data.json
Do not set `loc`, `generated` or `repo`. The build sets them. The GitHub link is shown for private repos too, since it works for the owner; set `repo` to `""` only when the user asks to hide it, or to a URL to override it.

Set `loc_exclude` to a list of folders (`"generated/"`) or globs (`"reports/*.html"`) holding generated files, copies or vendored code, so they do not inflate the lines of code. Leave it out when there are none.

```json
{
  "project": "Display name",
  "path": "/absolute/path/to/project",
  "tagline": "One sentence: what it is and how it is built.",
  "summary": ["3 to 5 lines on what the project does and how, one idea per line"],
  "stack": [
    { "layer": "Backend", "name": "Spring Boot", "version": "4.2.0", "logo": "springboot", "url": "https://spring.io/projects/spring-boot", "why": "HTTP API for orders" },
    { "layer": "Shared", "name": "billing-lib", "url": "", "local": "../billing-lib", "why": "Price rules shared with the billing service" }
  ],
  "arch": {
    "nodes": [ { "id": "api", "label": "Orders API", "sub": "REST /orders", "kind": "edge", "col": 1, "row": 2 } ],
    "edges": [ ["web", "api", "REST"] ]
  },
  "sequences": [
    {
      "id": "checkout", "title": "Checkout", "why": "Why this flow was picked, one line.",
      "actors": ["Web", "Orders API", "Postgres"],
      "steps": [ ["Web", "Orders API", "POST /orders"], ["Orders API", "Orders API", "apply price rules"], ["Orders API", "Postgres", "insert order"] ],
      "notes": [ { "q": "What stops a double submit?", "a": "A unique index on `orders.idempotency_key`." } ],
      "code": ["src/main/java/shop/OrderController.java", "src/main/java/shop/OrderRepository.java:40"]
    }
  ],
  "components": [
    {
      "id": "pricing", "name": "Pricing engine", "path": "src/main/java/shop/pricing/",
      "how": "2-4 sentences on how it works.",
      "facts": ["2-4 interesting facts with real numbers and names"],
      "right": ["1-3 things it gets right and why that matters"],
      "better": ["1-3 concrete things that could be better"]
    }
  ],
  "tests": {
    "runner": "`scripts/test-all.sh`: mvn test",
    "kinds": [
      { "kind": "Unit", "status": "present", "count": 120, "where": "where they live", "note": "what they cover" },
      { "kind": "Mocks / fakes", "status": "present", "count": 3, "unit": "fake classes", "subset": true, "where": "names of the fakes", "note": "how they are written" },
      { "kind": "Contract", "status": "missing", "count": 0, "where": "", "note": "where it would pay off" }
    ]
  }
}
```

### Field rules
* `summary`: 3-5 lines.
* `stack[].version`: the resolved version from the lock file (`Cargo.lock`, `bun.lock`, `package-lock.json`, `poetry.lock`, `go.sum`) when the manifest says `latest` or a range, else the manifest, else a toolchain pin (`rust-toolchain.toml`, `.nvmrc`, `.tool-versions`). A minimum like `rust-version` is written as `>= 1.85`. Prefer the code over the README. Leave it out when nothing pins one (HTML, CSS, built-in modules). Never write "not pinned" or "latest" unless the build file says `latest`.
* `stack[].logo`: a Simple Icons slug from `template/logos.json` (`rust`, `typescript`, `react`, `postgresql`, `apachekafka`, `springboot`, `openjdk`, `docker`, `podman`, ...). Check with `grep -o '"<slug>"' "$SKILL_DIR/template/logos.json"`. Leave it out when there is none; the site shows the first two letters.
* `stack[].url`: the official site or repo, `""` when there is none. `local` is only for a dependency that lives at a local path, written relative to the project folder (`../billing-lib`), never for the project's own code.
* `arch.nodes`: 6-12 nodes. A server the project starts itself (a local workflow engine, a database container) is `data` or `external` by what it is, not by who starts it. `label` at most 16 characters, `sub` at most 21. `col` 0-5 from left to right in request order, `row` 0-4 top to bottom; halves like `0.5` are allowed; two nodes never share a cell. `kind` is one of `actor` (people, shells, clients), `edge` (UI, gateways, routers), `core` (services, workers, modules), `data` (databases, caches, files), `external` (third-party APIs, the web, other systems).
* `arch.edges`: `[from, to, label]`, label at most 10 characters or `""`. Keep long edges free of labels.
* `sequences`: 3-5 flows, at most 6 actors each, 4-10 steps, step labels at most 40 characters. A step from an actor to itself draws a loop. `notes`: 2-6 per flow. `code`: the files the flow runs through, `path:line` allowed.
* `components`: 3-5.
* `tests.kinds`: always these 11 kinds in this order, nothing else before them: `Unit`, `Integration`, `Mocks / fakes`, `Database`, `E2E / UI`, `Contract`, `Property based`, `Stress / load`, `Chaos`, `CSS / visual`, `Fuzz / security`. Add `Snapshot` or other kinds after them only when the project has them.

## Test analysis
Count tests, not files. Use the patterns of the project's language and read a sample of each to classify it.

| Kind | What counts | Typical markers |
|---|---|---|
| Unit | One module in isolation | `#[test]` in `src/`, `@Test` in `src/test`, `test(`/`it(` in `*.test.ts`, `def test_` |
| Integration | Several real modules together, a real router or server | `tests/` in Rust, `*IT.java`, `@SpringBootTest`, supertest, `TestClient` |
| Mocks / fakes | Count the fakes, stubs and mocks, set `"unit": "fake classes"` and `"subset": true` | `struct Fake`, `class Fake`, `mockito`, `jest.mock`, `vi.mock`, `unittest.mock` |
| Database | Tests that run real SQL (in memory or a container) | `open_in_memory`, Testcontainers, `@DataJpaTest`, sqlite `:memory:` |
| E2E / UI | A real browser or the packaged app | Playwright, Cypress, Selenium, `*.spec.ts` under `e2e/` or `ui-tests/` |
| Contract | Producer and consumer checked against one contract | Pact, Spring Cloud Contract, OpenAPI schema tests |
| Property based | Generated inputs with invariants | proptest, quickcheck, jqwik, fast-check, hypothesis |
| Stress / load | Throughput or latency under load | k6, Gatling, JMeter, Locust, `wrk`, criterion benches |
| Chaos | Faults injected on purpose | Toxiproxy, killed processes, injected timeouts and errors |
| CSS / visual | Layout, styles or screenshots compared | `toHaveScreenshot`, Percy, BackstopJS, computed style asserts |
| Fuzz / security | Fuzzing or security checks | cargo-fuzz, libFuzzer, go fuzz `FuzzX`, ZAP, OWASP checks |

* When a kind is already counted inside another (database tests inside unit), set `"subset": true` and say it in `unit`, like `"unit": "tests, inside Unit"`. Subset kinds are not added to the total.
* `status`: `present` when there are real tests of that kind, `partial` when only a weak or tiny slice exists, `missing` when there are none (count `0`), `n/a` when the kind cannot apply (Database with no database, Contract with no API, count `0`). `n/a` kinds are left out of the covered count.
* Tests that start a real server or socket in the test are Integration, even when they live next to unit tests.
* Failures injected on purpose inside unit tests (a thrown fetch, a timeout, a killed child) count as Chaos with `"subset": true` and `partial`.
* `unit` is free text shown next to the counter, like `"fake classes"`, `"fake functions"` or `"tests, inside Unit"`.
* `note` for a missing kind says where it would pay off most in this project.

## Output
* `<out-dir>/index.html`: the site. Opens straight from disk too.
* `<out-dir>/data.json`: the data the site was built from, with `loc`, `repo` and `generated` filled in.
* `<out-dir>/../apps.js`: the list of every site built in the same parent folder, rewritten on each build. It feeds the `Open another app…` box.
* `<out-dir>/run.sh`: serves the parent folder on `127.0.0.1` from port 8790 up (the next free port), so every site there is reachable from one server, and opens this site.
* `<out-dir>/stop.sh`: stops that shared server.

The site has tabs for Overview (summary and lines of code per language), Stack, Architecture, Sequences (step by step with Prev / Next, notes and code files), Components and Tests. `/` or `Cmd+K` searches everything. The `Open another app…` box searches the other sites built next to it and opens their architecture diagram. The theme toggle remembers light or dark.
