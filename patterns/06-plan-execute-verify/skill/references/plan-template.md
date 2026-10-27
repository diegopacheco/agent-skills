# Plan: <one line goal>

| # | Step | Check | Status | Evidence |
|---|---|---|---|---|
| 1 | Rename `timeout` to `timeout_ms` in `config/service.json` | `grep -q '"timeout_ms"' config/service.json && ! grep -q '"timeout"' config/service.json` | todo | |
| 2 | Convert the value from seconds to milliseconds | `python3 -c "import json; assert json.load(open('config/service.json'))['timeout_ms'] >= 1000"` | todo | |
| 3 | Update the reader in `src/config.py` | `pytest tests/test_config.py` | todo | |
| 4 | Final suite | `pytest` | todo | |

Status is one of `todo`, `done`, `failed`. Evidence is the command exit code and the last relevant output line.
