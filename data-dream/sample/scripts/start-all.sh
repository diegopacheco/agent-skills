#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

if [ -n "$(port_pid "$API")" ]; then
  echo "api already up on http://localhost:$API"
  exit 0
fi
cd "$APP_ROOT"
API_PORT="$API" node src/server.mjs > "$APP_ROOT/.api.log" 2>&1 &
echo $! > "$PID_FILE"
wait_port "$API"
echo "api: http://localhost:$API"
