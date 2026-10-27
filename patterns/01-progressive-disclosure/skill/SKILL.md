---
name: sql-migration
description: Plan, write and review SQL schema migrations for PostgreSQL, MySQL or SQLite - new columns, indexes, renames, constraints and rollbacks. Use when the user asks for a database migration, a schema change, or whether a migration is safe to run.
---

# SQL Migration

This file is level 2. Level 3 lives in `references/` and is read only when a step below says so.

## Steps

1. Find the database engine from the project: driver, connection string, `docker-compose`, ORM config.
2. Read exactly one engine reference, never the others:
   * PostgreSQL: `references/postgres.md`
   * MySQL or MariaDB: `references/mysql.md`
   * SQLite: `references/sqlite.md`
3. Write the forward migration following the rules of that reference.
4. Read `references/rollback.md` only when the migration drops, renames or rewrites data.
5. Write the rollback migration next to the forward one.
6. List the lock and downtime risk of each statement in one line each.

## Rules

* Never run a migration against production. Write it, explain it, stop.
* One logical change per migration file.
* If the engine cannot be found, ask the user instead of loading every reference.
