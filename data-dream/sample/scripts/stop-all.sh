#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

pid="$(port_pid "$API")"
if [ -n "$pid" ]; then
  kill "$pid"
  for _ in $(seq 1 50); do
    [ -z "$(port_pid "$API")" ] && break
    sleep 0.1
  done
fi
rm -f "$PID_FILE"
[ -z "$(port_pid "$API")" ] || { echo "port $API is still busy" >&2; exit 1; }
echo "api stopped, port $API free"
