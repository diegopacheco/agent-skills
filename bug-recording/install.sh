#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$HOME/.claude/skills/bug-recording"

mkdir -p "$TARGET"
cp "$SCRIPT_DIR/SKILL.md" "$SCRIPT_DIR/record.mjs" "$SCRIPT_DIR/reduce-size.sh" "$SCRIPT_DIR/package.json" "$SCRIPT_DIR/package-lock.json" "$TARGET/"
chmod +x "$TARGET/record.mjs" "$TARGET/reduce-size.sh"

cd "$TARGET" && npm install && npx playwright install chromium

echo "installed $TARGET"
