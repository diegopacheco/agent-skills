#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

APP_NAME="Night Agents"
INSTALLED="/Applications/${APP_NAME}.app"

./uninstall.sh --keep-state

[ -d node_modules ] || npm install
[ -f resources/icon.icns ] || ./make-icon.sh

rm -rf core
cp -R ../bin core
npm run package
rm -rf core

cp -R "dist/${APP_NAME}-darwin-arm64/${APP_NAME}.app" "${INSTALLED}"
rm -rf dist

xattr -dr com.apple.quarantine "${INSTALLED}" 2>/dev/null || true

echo "installed ${INSTALLED}"
