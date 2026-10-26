---
name: stacks-skill
description: Predefined technology stacks (java, scala, kotlin, ts, nodejs, rust, go, python). Use when the user mentions a stack by name such as "java stack", "java-stack", "rust stack", "ts-stack", "python stack", or asks to create a project, service or app with one of these stacks. If the user asks for a stack but it is not clear which one, ask the user to choose from the list.
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

## How to pick a stack
* The user refers to a stack as `<name> stack`, `<name>-stack`, `<name>_stack` or just `<name>` in the context of creating a project.
* Valid names: `java`, `scala`, `kotlin`, `ts`, `nodejs`, `rust`, `go`, `python`.
* Aliases: `typescript`, `react`, `bun` -> `ts`. `node`, `express` -> `nodejs`. `golang` -> `go`. `py` -> `python`. `kt` -> `kotlin`.
* If the stack is not clear, or more than one could fit, ask the user with AskUserQuestion and show the stacks as options. Never guess.
* Use exactly the stack chosen. Do not add libraries or tools outside the stack unless the user asks.
* If a version listed here is not available, stop and tell the user, then use the latest stable version only after the user agrees.

## Rules for every stack
* Modular code: small modules or packages with one responsibility each.
* Proper types: no `any`, no raw types, no untyped maps standing in for domain objects.
* No comments in the code.
* Keep the code as simple as possible and use the least number of libraries.
* Tests for the core logic, and the build and tests must pass before saying it is done.

## java
* Java 25
* Maven
* Spring Boot 4.1.x
* Spring Data JDBC
* Postgres
* HikariCP
* Modular code

## scala
* Scala 3.x
* sbt
* Netty
* Postgres
* HikariCP
* Spring Boot 4.x
* Proper types and modular code

## kotlin
* Kotlin 2.x
* Java 25
* Gradle wrapper (`./gradlew`)
* Spring Boot 4.1.x
* Postgres
* HikariCP
* Proper types and modular code

## ts
* TypeScript 7.x
* Bun 2.x
* Vite
* React 19.3.x
* TanStack 1.x for everything it covers: Router, Query, Table, Form
* Modular code and proper types

## nodejs
* Node.js 26
* npm
* TypeScript 7.x
* Express.js
* Modular code and proper types

## rust
* Rust 1.99.x, edition 2024
* Tokio
* Async code, functions return `Result`
* Traits and modular code

## go
* Go 1.26.x
* Modular code with packages
* Proper types

## python
* Python 3.15.x
* uv
* ty for type checking
* Granian as the server
* Proper type hints and modular code
* Tests
