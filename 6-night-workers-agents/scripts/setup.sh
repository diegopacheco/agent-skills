#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require git
require node
require npm

log "setup started"
( cd "$UI" && npm install --silent )
[ -f "$UI/resources/icon.icns" ] || "$UI/make-icon.sh"
( cd "$ROOT/sample-project" && npm install --silent )

if ! grep -q '^\.run/$' "$ROOT/.gitignore" 2>/dev/null; then
  printf ".run/\n" >>"$ROOT/.gitignore"
fi

log "setup done"
log "next: ./install.sh [claude|codex|both] installs the skills, ./ui/install.sh installs the app"
