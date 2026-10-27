# Rollback

* Every destructive change ships with a rollback in the same pull request.
* A column is dropped one release after the code stops reading it, never in the same release.
* A rename is done as add new column, backfill, switch reads, then drop the old column in a later release.
* A rollback that loses data needs approval from the data owner. Say so in the migration description.
* Back up the affected table before a data rewrite and write the restore command in the rollback file.
