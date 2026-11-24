#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require mvn
require bun
ensure_node

log "backend tests"
(cd "$ROOT/backend" && mvn -q -B test) || fail "backend tests failed"

log "bff typecheck and tests"
(cd "$ROOT/bff" && npm run typecheck && npm test) || fail "bff tests failed"

log "ui typecheck and tests"
(cd "$ROOT/ui" && bun run typecheck && bun test src) || fail "ui tests failed"

log "catalog scanner tests"
(cd "$ROOT/.." && node --test tests/catalog.test.mjs) || fail "catalog scanner tests failed"

log "all tests passed"
