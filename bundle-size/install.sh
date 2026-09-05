#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="bundle-size"

echo "📦 $NAME Installer"
echo ""
echo "1) 🤖 Global Claude ($HOME/.claude/skills/$NAME)"
echo "2) 🧠 Global Codex ($HOME/.codex/skills/$NAME)"
echo "3) ✨ Both"
echo ""
read -p "Choose an option [1-3]: " choice

install_skill() {
  dest="$1/$NAME"
  rm -rf "$dest"
  mkdir -p "$dest/scripts" "$dest/assets"
  cp "$SCRIPT_DIR/SKILL.md" "$SCRIPT_DIR/package.json" "$SCRIPT_DIR/package-lock.json" "$dest/"
  cp "$SCRIPT_DIR/scripts/bundlesize.mjs" "$dest/scripts/"
  cp "$SCRIPT_DIR/assets/template.html" "$dest/assets/"
  (cd "$dest" && npm install)
  echo "✅ Installed $NAME to $dest"
}

case "$choice" in
  1) install_skill "$HOME/.claude/skills" ;;
  2) install_skill "$HOME/.codex/skills" ;;
  3) install_skill "$HOME/.claude/skills"; install_skill "$HOME/.codex/skills" ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
