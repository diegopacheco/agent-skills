---
name: log-cleanup
description: Free disk space by deleting rotated log files older than 7 days inside the project's ./logs folder, with a dry run and approval first. Use when the user says the disk is full, logs take too much space, or asks to clean up old logs.
allowed-tools: Read, Bash(du -sh ./logs), Bash(find ./logs -type f -name '*.log.*' -mtime +7 -print), Bash(find ./logs -type f -name '*.log.*' -mtime +7 -delete)
---

# Log Cleanup

This skill leases the smallest capability that does the job, and nothing else.

## Lease

While this skill is active it is pre-approved for exactly these commands, listed in `allowed-tools` above:

| Capability | Command |
|---|---|
| Measure | `du -sh ./logs` |
| List candidates | `find ./logs -type f -name '*.log.*' -mtime +7 -print` |
| Delete candidates | `find ./logs -type f -name '*.log.*' -mtime +7 -delete` |

Any other command, path or flag is outside the lease and goes back to the normal permission prompt.

## Steps

1. Run the measure command and report the size of `./logs`.
2. Run the list command. Show the files and their count.
3. Ask the user to approve the deletion. Stop if they do not.
4. Run the delete command exactly as written.
5. Run the measure command again and report the space freed.

## Rules

* Never widen the lease to finish faster: no `rm -rf`, no `sudo`, no path outside `./logs`, no change to `-mtime +7`.
* Never touch the active log files (`*.log`), only rotated ones (`*.log.1`, `*.log.2.gz`).
* If the files to delete are elsewhere, stop and tell the user this skill does not cover that path.
