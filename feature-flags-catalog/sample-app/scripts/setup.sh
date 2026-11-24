#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require mvn
require bun
ensure_node

log "backend: resolving maven dependencies"
(cd "$ROOT/backend" && mvn -q -B -DskipTests package) || fail "backend build failed"

log "bff: npm install"
(cd "$ROOT/bff" && npm install --no-audit --no-fund) || fail "bff npm install failed"

log "ui: bun install"
(cd "$ROOT/ui" && bun install) || fail "ui bun install failed"

log "setup done"
