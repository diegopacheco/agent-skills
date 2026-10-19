#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require node
require npm

log "tests started"
node --test "$ROOT"/test/*.test.js || fail "core tests failed"
bash -n "$ROOT/install.sh" "$ROOT/uninstall.sh" "$ROOT/bin/night-run.sh" "$UI/install.sh" "$UI/uninstall.sh" || fail "bash syntax check failed"
( cd "$ROOT/sample-project" && { [ -d node_modules ] || npm install --silent; } && npm test ) || fail "sample project tests failed"
log "tests passed"
