#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log "stopping"

stop_bg frontend
stop_bg backend

if [ -f "$ROOT/docker-compose.yml" ] || [ -f "$ROOT/podman-compose.yml" ]; then
  require podman-compose
  podman-compose down
fi

for name in $(service_names); do
  port="$(service_port "$name")"
  if port_up "$port"; then
    fail "$name still listening on $port"
  fi
done

log "stopped"
