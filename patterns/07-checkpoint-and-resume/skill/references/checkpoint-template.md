# Checkpoint: <task name>

Started: <iso time>
Resume rule: continue at the first step that is not done.

| # | Step | Status | Updated | Output |
|---|---|---|---|---|
| 1 | Export users 1 to 50,000 | done | 2026-10-26T10:02 | 50,000 rows to export/users-1.csv |
| 2 | Export users 50,001 to 100,000 | done | 2026-10-26T10:05 | 50,000 rows to export/users-2.csv |
| 3 | Export users 100,001 to 150,000 | running | 2026-10-26T10:06 | |
| 4 | Merge exports and count rows | todo | | |

Status is one of `todo`, `running`, `done`, `failed`.
