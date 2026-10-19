#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

APP_NAME="Night Agents"
INSTALLED="/Applications/${APP_NAME}.app"

osascript -e "tell application \"${APP_NAME}\" to quit" 2>/dev/null || true
for _ in 1 2 3 4 5 6 7 8 9 10; do
  pgrep -f "${INSTALLED}" >/dev/null || break
  sleep 1
done
pkill -9 -f "${INSTALLED}" 2>/dev/null || true

if [ -d "${INSTALLED}" ]; then
  rm -rf "${INSTALLED}"
  echo "removed ${INSTALLED}"
else
  echo "nothing installed at ${INSTALLED}"
fi

rm -rf dist core

if [ "${1:-}" != "--keep-state" ]; then
  rm -rf "${HOME}/Library/Application Support/${APP_NAME}"
fi

echo "uninstall done"
