#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require bun
[ -d "$ROOT/node_modules" ] || "$SCRIPTS/setup.sh"

log "unit tests"
bun run test || fail "unit tests failed"
log "typecheck"
bun run typecheck || fail "typecheck failed"
log "build"
bun run build || fail "build failed"
log "all tests passed"
