# PostgreSQL

* Create indexes with `CREATE INDEX CONCURRENTLY`, outside a transaction, so writes are not blocked.
* Start every migration with `SET lock_timeout = '5s';` so a migration stuck behind a lock fails fast.
* `ADD COLUMN ... DEFAULT <constant>` is instant on PostgreSQL 11 and newer. A volatile default rewrites the table.
* Add `NOT NULL` in two steps: `ADD CONSTRAINT ... CHECK (col IS NOT NULL) NOT VALID`, then `VALIDATE CONSTRAINT`.
* Add foreign keys with `NOT VALID` first, then `VALIDATE CONSTRAINT` in a second migration.
* Changing a column type rewrites the table and takes an `ACCESS EXCLUSIVE` lock. Add a new column and backfill instead.
