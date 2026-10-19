#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

if [ -d "$INSTALLED_APP" ]; then
  log "opening $APP_NAME"
  open -a "$INSTALLED_APP"
else
  [ -f "$NIGHT_HOME/ui/index.html" ] || fail "no generated ui at $NIGHT_HOME/ui, run ./scripts/start-all.sh first"
  log "opening file://$NIGHT_HOME/ui/index.html"
  open "$NIGHT_HOME/ui/index.html"
fi
