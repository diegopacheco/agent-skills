#!/usr/bin/env bash
set -euo pipefail

NAME="feature-flags-catalog"

echo "🚩 $NAME Uninstaller"
echo ""
echo "1) 🤖 Global Claude ($HOME/.claude/skills/$NAME)"
echo "2) 🧠 Global Codex ($HOME/.codex/skills/$NAME)"
echo "3) ✨ Both"
echo ""
read -r -p "Choose an option [1-3]: " choice

uninstall_skill() {
  local dest="$1/$NAME"
  if [ -d "$dest" ]; then
    rm -rf "$dest"
    echo "🗑️  Removed $dest"
  else
    echo "ℹ️  Not installed at $dest"
  fi
}

case "$choice" in
  1) uninstall_skill "$HOME/.claude/skills" ;;
  2) uninstall_skill "$HOME/.codex/skills" ;;
  3) uninstall_skill "$HOME/.claude/skills"; uninstall_skill "$HOME/.codex/skills" ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
