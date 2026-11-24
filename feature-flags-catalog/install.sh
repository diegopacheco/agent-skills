#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="feature-flags-catalog"

echo "🚩 $NAME Installer"
echo ""
echo "1) 🤖 Global Claude ($HOME/.claude/skills/$NAME)"
echo "2) 🧠 Global Codex ($HOME/.codex/skills/$NAME)"
echo "3) ✨ Both"
echo ""
read -r -p "Choose an option [1-3]: " choice

install_skill() {
  local dest="$1/$NAME"
  rm -rf "$dest"
  mkdir -p "$dest/scripts" "$dest/assets" "$dest/languages"
  cp "$SCRIPT_DIR/SKILL.md" "$SCRIPT_DIR/playbook.md" "$dest/"
  cp "$SCRIPT_DIR/scripts/catalog.mjs" "$dest/scripts/"
  cp "$SCRIPT_DIR/assets/template.html" "$dest/assets/"
  cp "$SCRIPT_DIR/languages/"*.md "$dest/languages/"
  echo "✅ Installed $NAME to $dest"
}

case "$choice" in
  1) install_skill "$HOME/.claude/skills" ;;
  2) install_skill "$HOME/.codex/skills" ;;
  3) install_skill "$HOME/.claude/skills"; install_skill "$HOME/.codex/skills" ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
