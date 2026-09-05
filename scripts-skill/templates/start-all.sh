#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log "starting"

if [ -f "$ROOT/docker-compose.yml" ] || [ -f "$ROOT/podman-compose.yml" ]; then
  require podman-compose
  podman-compose up -d
  for name in $(service_names); do
    case "$name" in
      postgres|mysql|mariadb|redis|valkey|mongodb)
        port="$(service_port "$name")"
        wait_port_up "$port" 60 || fail "$name did not open port $port"
        log "$name up on $port"
        ;;
    esac
  done
fi

start_bg backend "$ROOT/backend" mvn -q spring-boot:run
wait_port_up "$(service_port backend)" 60 || fail "backend did not open port $(service_port backend), see $LOGS/backend.log"
log "backend up on $(service_port backend)"

start_bg frontend "$ROOT/frontend" npm run dev
wait_port_up "$(service_port frontend)" 60 || fail "frontend did not open port $(service_port frontend), see $LOGS/frontend.log"
log "frontend up on $(service_port frontend)"

"$SCRIPTS/status.sh"
