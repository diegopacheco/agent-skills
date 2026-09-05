#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log "tests started"

if [ -f "$ROOT/backend/pom.xml" ]; then
  require mvn
  ( cd "$ROOT/backend" && mvn test ) || fail "backend tests failed"
fi

if [ -f "$ROOT/backend/go.mod" ]; then
  require go
  ( cd "$ROOT/backend" && go test ./... ) || fail "backend tests failed"
fi

if [ -f "$ROOT/backend/Cargo.toml" ]; then
  require cargo
  ( cd "$ROOT/backend" && cargo test ) || fail "backend tests failed"
fi

if [ -d "$ROOT/backend/.venv" ]; then
  ( cd "$ROOT/backend" && .venv/bin/python -m pytest ) || fail "backend tests failed"
fi

if [ -f "$ROOT/frontend/package.json" ]; then
  require npm
  ( cd "$ROOT/frontend" && npm test ) || fail "frontend tests failed"
fi

log "tests passed"
