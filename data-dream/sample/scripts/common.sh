#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$APP_ROOT/scripts/ports.env"
PID_FILE="$APP_ROOT/.api.pid"

port_pid() {
  lsof -ti tcp:"$1" -sTCP:LISTEN 2>/dev/null | head -1 || true
}

wait_port() {
  for _ in $(seq 1 50); do
    [ -n "$(port_pid "$1")" ] && return 0
    sleep 0.2
  done
  echo "port $1 did not open" >&2
  return 1
}
