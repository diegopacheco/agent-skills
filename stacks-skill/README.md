# stacks-skill

A skill with a fixed set of technology stacks. Name one, such as `java stack` or `java-stack`, and the agent builds with exactly that stack and its versions. If the stack is unclear, the agent asks you to pick one from the list.

## How it Works

1. You ask for something like `create a todo api with the rust stack`.
2. The agent matches `rust stack`, `rust-stack` or an alias such as `golang` to one stack in `SKILL.md`.
3. If no stack matches, or more than one fits, it asks you to choose.
4. It builds with only that stack's tools and versions, keeping the code modular and typed, with no comments and with tests.
5. If a listed version is not available, it stops and asks before using another one.

## Stacks

| Stack | What it uses |
|---|---|
| `java` | Java 25, Maven, Spring Boot 4.1.x, Spring Data JDBC, Postgres, HikariCP, modular code |
| `scala` | Scala 3.x, sbt, Netty, Spring Boot 4.x, Postgres, HikariCP, proper types, modular code |
| `kotlin` | Kotlin 2.x, Java 25, Gradle wrapper, Spring Boot 4.1.x, Postgres, HikariCP, proper types, modular code |
| `ts` | TypeScript 7.x, Bun 2.x, Vite, React 19.3.x, TanStack 1.x (Router, Query, Table, Form), proper types, modular code |
| `nodejs` | Node.js 26, npm, TypeScript 7.x, Express.js, proper types, modular code |
| `rust` | Rust 1.99.x edition 2024, Tokio, async functions that return `Result`, traits, modular code |
| `go` | Go 1.26.x, proper types, modular packages |
| `python` | Python 3.15.x, uv, ty, Granian, type hints, modular code, tests |

## Features

* Fixed stacks: every project made with a stack gets the same tools and versions.
* Flexible names: `java stack`, `java-stack`, `java_stack` and aliases like `typescript` or `golang` all match.
* Asks when unsure: if the stack is unclear, the agent shows the list instead of guessing.
* Shared rules: modular code, proper types, no comments, few libraries and tests for every stack.

## Install

```bash
./install.sh          # asks: claude, codex or both
./install.sh claude
./install.sh codex
./install.sh both
```

## Uninstall

```bash
./uninstall.sh        # asks: claude, codex or both
./uninstall.sh claude
./uninstall.sh codex
./uninstall.sh both
```

Installs to and removes from `~/.claude/skills/stacks-skill` and `~/.codex/skills/stacks-skill`.

## Layout

- `SKILL.md`: the stacks and the rules for picking one
- `install.sh`: installs the skill for Claude Code, Codex or both
- `uninstall.sh`: removes the skill from Claude Code, Codex or both
