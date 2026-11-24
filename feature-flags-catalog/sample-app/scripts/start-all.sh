#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require mvn
require bun
ensure_node

log "starting"

BACKEND_PORT="$(service_port backend)" start_bg backend "$ROOT/backend" mvn -q spring-boot:run
wait_port_up "$(service_port backend)" 60 || fail "backend did not open port $(service_port backend), see $LOGS/backend.log"
log "backend up on $(service_url backend)/api/products"

BFF_PORT="$(service_port bff)" BACKEND_URL="$(service_url backend)" start_bg bff "$ROOT/bff" npm start
wait_port_up "$(service_port bff)" 60 || fail "bff did not open port $(service_port bff), see $LOGS/bff.log"
log "bff up on $(service_url bff)/api/catalog"

UI_PORT="$(service_port ui)" BFF_URL="$(service_url bff)" start_bg ui "$ROOT/ui" bun run dev
wait_port_up "$(service_port ui)" 60 || fail "ui did not open port $(service_port ui), see $LOGS/ui.log"
log "ui up on $(service_url ui)"

"$SCRIPTS/status.sh"

log "links"
printf "%-10s %s\n" backend "$(service_url backend)/api/products"
printf "%-10s %s\n" bff "$(service_url bff)/api/catalog"
printf "%-10s %s\n" ui "$(service_url ui)"
