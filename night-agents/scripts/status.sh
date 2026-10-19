#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

down=0
line() {
  printf "%-10s %-6s %-8s %s\n" "$1" "$2" "$3" "$4"
}

line SERVICE STATE PID WHERE
if [ -x "$NIGHT_HOME/bin/night-run.sh" ]; then line core UP - "$NIGHT_HOME/bin"; else line core DOWN - "run ./install.sh"; down=$((down + 1)); fi
if [ -f "$NIGHT_HOME/ui/data.js" ]; then line site UP - "$NIGHT_HOME/ui/index.html"; else line site DOWN - "run ./scripts/start-all.sh"; down=$((down + 1)); fi
pid="$(app_pid)"
if [ -z "$pid" ]; then pid="$(dev_pid)"; fi
if [ -n "$pid" ]; then line app UP "$pid" "$APP_NAME"; else line app DOWN - "$APP_NAME"; down=$((down + 1)); fi
runs="$(find "$NIGHT_HOME/runs" -name run.json 2>/dev/null | wc -l | tr -d ' ')"
line runs "$runs" - "$NIGHT_HOME/runs"

exit "$down"
