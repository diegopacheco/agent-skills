#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log "tests started"
require uv
uv run ty check || fail "type check failed"
uv run pytest -q || fail "tests failed"
log "tests passed"
