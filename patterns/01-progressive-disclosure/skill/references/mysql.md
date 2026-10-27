# MySQL and MariaDB

* On MySQL 8 add columns with `ALGORITHM=INSTANT` and fail if it is not possible, never fall back silently to `COPY`.
* Use `ALGORITHM=INPLACE, LOCK=NONE` for secondary indexes.
* For large tables use an online schema change tool such as `gh-ost` or `pt-online-schema-change`.
* DDL is not transactional in MySQL. A failed multi statement migration leaves a half applied schema, so keep one statement per migration.
* Renaming a column with `RENAME COLUMN` is instant on MySQL 8 but breaks every running release that reads the old name.
