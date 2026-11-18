---
name: stacks-skill
description: Predefined technology stacks (java, scala, kotlin, ts, nodejs, rust, go, python). Use when the user mentions a stack by name such as "java stack", "java-stack", "rust stack", "rs stack", "ts-stack", "python stack", or asks to create a project, service or app with one of these stacks. If the user asks for a stack but it is not clear which one, ask the user to choose from the list.
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

## How to pick a stack
* The user refers to a stack as `<name> stack`, `<name>-stack`, `<name>_stack` or just `<name>` in the context of creating a project.
* Valid names: `java`, `scala`, `kotlin`, `ts`, `nodejs`, `rust`, `go`, `python`.
* Aliases: `typescript`, `react`, `bun` -> `ts`. `node`, `express` -> `nodejs`. `golang` -> `go`. `py` -> `python`. `kt` -> `kotlin`. `rs` -> `rust`.
* If the stack is not clear, or more than one could fit, ask the user with AskUserQuestion and show the stacks as options. Never guess.
* Use exactly the stack chosen. Do not add libraries or tools outside the stack unless the user asks.
* If a version listed in a stack file is not available, stop and tell the user, then use the latest stable version only after the user agrees.

## Progressive disclosure
Once the stack is known, read only its file before writing any code. Do not load the other stack files.

| Stack | File |
|---|---|
| `java` | [stacks/java.md](stacks/java.md) |
| `scala` | [stacks/scala.md](stacks/scala.md) |
| `kotlin` | [stacks/kotlin.md](stacks/kotlin.md) |
| `ts` | [stacks/ts.md](stacks/ts.md) |
| `nodejs` | [stacks/nodejs.md](stacks/nodejs.md) |
| `rust` | [stacks/rust.md](stacks/rust.md) |
| `go` | [stacks/go.md](stacks/go.md) |
| `python` | [stacks/python.md](stacks/python.md) |

Each stack file has the versions, the idiomatic way to write that language, how the principles below apply to it, and bad vs good code samples. Write code that looks like the good samples.

## Rules for every stack
* Modular code: small modules or packages with one responsibility each.
* Proper types: no `any`, no raw types, no untyped maps standing in for domain objects.
* No comments in the code.
* Keep the code as simple as possible and use the least number of libraries.
* Tests for the core logic, and the build and tests must pass before saying it is done.

## Principles
* Separation of concerns: transport (HTTP, CLI), domain logic and persistence live in different modules. Handlers parse input and call a service. Services hold the rules. Repositories talk to the database. No SQL in handlers, no HTTP types in services.
* DRY: one piece of knowledge lives in one place. The second time the same logic shows up, extract it. Do not extract on the first use, and do not merge code that only looks alike but changes for different reasons.
* Interfaces at the boundaries: depend on an interface (or trait, protocol) for anything that leaves the process: database, HTTP, clock, file system, queue. Inject the implementation through the constructor. Tests swap in a fake.
* Small public surface: expose only what callers need. Everything else stays private to the module.
* Immutability by default: values are immutable unless there is a clear reason to mutate.
* Fail loud: never swallow errors. Return them in the type (`Result`, `error`) or throw a typed exception, and handle them at one boundary.

## Centralization rules
Some concerns must have exactly one owner in the codebase. Before writing code for any of them, search the codebase for the existing one. If it exists, every call site must use it. If it does not exist and the concern is needed, create it once in its own module and use it everywhere.

* Logging: one centralized logger module is the only way to log. It always adds the common fields: correlation id, request path, user id and service name. The HTTP entry point reads or creates the `X-Correlation-Id` header, and the centralized HTTP client forwards it on every outbound call, so logs can be followed across services. No `println`, `console.log`, `print` or `fmt.Println` for logs.
* HTTP client: one configured REST client (base URL, timeouts, retries, auth headers, error mapping). Every outbound REST call goes through it. No ad hoc `fetch`, `requests`, `reqwest` or `HttpClient` calls spread around the code.
* Configuration: one config module reads environment and files at startup into a typed object. No reading env vars deep in the code.
* Database access: one connection pool and repositories per aggregate. No opening connections in random places.
* Error handling: one error type hierarchy per module and one place that maps errors to HTTP responses or exit codes.
* JSON: one serializer setup with the same naming and date rules for the whole app.
* Time and IDs: one clock and one ID generator, injected, so tests are deterministic.
* Validation: one validation layer at the boundary. Inside the domain, values are already valid.

If you find two owners for the same concern, do not add a third and do not blend them. Pick the more used or more tested one, use it, and tell the user about the other so it can be removed.
