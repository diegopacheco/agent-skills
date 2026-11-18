#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require bun
log "installing dependencies"
bun install --frozen-lockfile || fail "bun install failed"
log "setup done"
