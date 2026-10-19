#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require node

log "starting"
NIGHT_AGENTS_HOME="$NIGHT_HOME" node "$ROOT/bin/generate.js"

if [ -d "$INSTALLED_APP" ]; then
  if [ -z "$(app_pid)" ]; then open -a "$INSTALLED_APP"; fi
  wait_for app_pid 60 || fail "$APP_NAME did not start"
  log "app      $APP_NAME pid $(app_pid)"
else
  [ -d "$UI/node_modules" ] || fail "run ./scripts/setup.sh first"
  if [ -z "$(dev_pid)" ]; then
    ( cd "$UI" && exec npx electron . >"$LOGS/ui.log" 2>&1 ) &
    echo $! >"$RUN/ui.pid"
  fi
  wait_for dev_pid 60 || fail "ui did not start, see $LOGS/ui.log"
  log "app      dev electron pid $(dev_pid), install it with ./ui/install.sh"
fi

"$SCRIPTS/status.sh" || true

log "links"
printf "%-8s file://%s/ui/index.html\n" "ui" "$NIGHT_HOME"
printf "%-8s file://%s/runs\n" "runs" "$NIGHT_HOME"
