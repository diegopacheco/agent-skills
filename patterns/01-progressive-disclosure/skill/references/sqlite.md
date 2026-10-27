# SQLite

* `ALTER TABLE` supports only `ADD COLUMN`, `RENAME COLUMN`, `RENAME TO` and `DROP COLUMN` (3.35+).
* Any other change uses the 12 step rebuild: create the new table, copy rows, drop the old table, rename the new one, all inside one transaction with `PRAGMA foreign_keys=OFF`.
* Run `PRAGMA foreign_key_check` after a rebuild before committing.
* SQLite locks the whole database during a write, so batch large backfills.
