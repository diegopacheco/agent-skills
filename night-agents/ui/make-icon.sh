#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

[ -d node_modules ] || npm install
npx electron make-icon.js

SET="resources/icon.iconset"
rm -rf "$SET"
mkdir -p "$SET"
for size in 16 32 128 256 512; do
  sips -z "$size" "$size" resources/icon.png --out "$SET/icon_${size}x${size}.png" >/dev/null
  double=$((size * 2))
  sips -z "$double" "$double" resources/icon.png --out "$SET/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$SET" -o resources/icon.icns
rm -rf "$SET"
echo "icon resources/icon.icns"
