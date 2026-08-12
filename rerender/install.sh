#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$HOME/.claude/skills/rerender"

mkdir -p "$TARGET/scripts" "$TARGET/assets"
cp "$SCRIPT_DIR/SKILL.md" "$SCRIPT_DIR/package.json" "$SCRIPT_DIR/package-lock.json" "$TARGET/"
cp "$SCRIPT_DIR/scripts/rerender.mjs" "$TARGET/scripts/"
cp "$SCRIPT_DIR/assets/template.html" "$TARGET/assets/"

cd "$TARGET" && npm install

echo "installed $TARGET"
