#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require bun
[ -d "$ROOT/node_modules" ] || "$SCRIPTS/setup.sh"

port="$(service_port site)"
if port_up "$port" && [ ! -f "$RUN/site.pid" ]; then
  fail "port $port is used by another process, change it in scripts/ports.env"
fi

start_bg site "$ROOT" bun run dev --port "$port" --strictPort
wait_port_up "$port" 60 || fail "site did not open port $port, see $LOGS/site.log"

"$SCRIPTS/status.sh"

log "links"
for name in $(service_names); do
  printf "%-14s %s\n" "$name" "$(service_url "$name")"
done
