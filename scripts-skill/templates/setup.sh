#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log "setup started"

if [ -f "$ROOT/docker-compose.yml" ] || [ -f "$ROOT/podman-compose.yml" ]; then
  require podman-compose
  podman-compose pull
fi

if [ -f "$ROOT/backend/pom.xml" ]; then
  require mvn
  ( cd "$ROOT/backend" && mvn -q -DskipTests install )
fi

if [ -f "$ROOT/backend/go.mod" ]; then
  require go
  ( cd "$ROOT/backend" && go mod download )
fi

if [ -f "$ROOT/backend/Cargo.toml" ]; then
  require cargo
  ( cd "$ROOT/backend" && cargo fetch )
fi

if [ -f "$ROOT/backend/requirements.txt" ]; then
  require python3
  python3 -m venv "$ROOT/backend/.venv"
  "$ROOT/backend/.venv/bin/pip" install -q -r "$ROOT/backend/requirements.txt"
fi

if [ -f "$ROOT/frontend/package.json" ]; then
  require npm
  ( cd "$ROOT/frontend" && npm install )
fi

if [ -f "$ROOT/.gitignore" ] && ! grep -q '^\.run/$' "$ROOT/.gitignore"; then
  printf ".run/\n" >>"$ROOT/.gitignore"
fi

log "setup done"
