#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

ensure_node
OUT="$RUN/catalog"
node "$ROOT/../scripts/catalog.mjs" scan "$ROOT" --out "$OUT" --eval-log back:.run/logs/backend.log --eval-log front:.run/logs/bff.log || fail "catalog scan failed"
node "$ROOT/../scripts/catalog.mjs" render "$OUT" || fail "catalog render failed"
log "report: $OUT/index.html"
if [ "${1:-}" != "--no-open" ]; then
  open_url "$OUT/index.html"
fi
