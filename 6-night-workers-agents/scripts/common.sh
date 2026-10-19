#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="$ROOT/scripts"
RUN="$ROOT/.run"
LOGS="$RUN/logs"
UI="$ROOT/ui"
NIGHT_HOME="${NIGHT_AGENTS_HOME:-$HOME/.night-agents}"
APP_NAME="Night Agents"
INSTALLED_APP="/Applications/$APP_NAME.app"
cd "$ROOT"

mkdir -p "$RUN" "$LOGS"

app_pid() {
  pgrep -f "$INSTALLED_APP/Contents/MacOS" 2>/dev/null | head -1 || true
}

dev_pid() {
  if [ -f "$RUN/ui.pid" ] && kill -0 "$(cat "$RUN/ui.pid")" 2>/dev/null; then
    cat "$RUN/ui.pid"
  fi
}

wait_pid_gone() {
  local tries
  tries="${2:-30}"
  while [ "$tries" -gt 0 ]; do
    if ! kill -0 "$1" 2>/dev/null; then return 0; fi
    sleep 1
    tries=$((tries - 1))
  done
  return 1
}

wait_for() {
  local tries
  tries="${2:-60}"
  while [ "$tries" -gt 0 ]; do
    if [ -n "$($1)" ]; then return 0; fi
    sleep 1
    tries=$((tries - 1))
  done
  return 1
}

require() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but not installed"
}

log() {
  printf "%s\n" "$*"
}

fail() {
  printf "ERROR: %s\n" "$*" >&2
  exit 1
}
