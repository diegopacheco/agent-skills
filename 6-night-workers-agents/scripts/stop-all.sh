#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log "stopping"

pid="$(app_pid)"
if [ -n "$pid" ]; then
  osascript -e "tell application \"$APP_NAME\" to quit" >/dev/null 2>&1 || true
  wait_pid_gone "$pid" 15 || kill -KILL "$pid" 2>/dev/null || true
fi

pid="$(dev_pid)"
if [ -n "$pid" ]; then
  pkill -TERM -P "$pid" 2>/dev/null || true
  kill -TERM "$pid" 2>/dev/null || true
  wait_pid_gone "$pid" 15 || kill -KILL "$pid" 2>/dev/null || true
fi
rm -f "$RUN/ui.pid"
pkill -f "$UI/node_modules/electron/dist" 2>/dev/null || true

[ -z "$(app_pid)" ] || fail "$APP_NAME is still running"
[ -z "$(dev_pid)" ] || fail "dev ui is still running"
log "stopped"
