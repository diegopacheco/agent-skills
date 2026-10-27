# Rollback

1. Find the version running now and the last version that was healthy.
2. Check whether the release ran a database migration. If it did, stop and tell the user a code rollback alone is not safe.
3. Show the rollback command and wait for approval.
4. Confirm the error rate is back to its baseline after the rollback.
