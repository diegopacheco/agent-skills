#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="bug-recording"

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
  mkdir -p "$dest"
  cp "$SCRIPT_DIR/SKILL.md" "$SCRIPT_DIR/record.mjs" "$SCRIPT_DIR/reduce-size.sh" "$SCRIPT_DIR/package.json" "$SCRIPT_DIR/package-lock.json" "$dest/"
  chmod +x "$dest/record.mjs" "$dest/reduce-size.sh"
  (cd "$dest" && npm install && npx playwright install chromium)
  echo "✅ Installed $NAME to $dest"
}

case "$choice" in
  1) install_skill "$HOME/.claude/skills" ;;
  2) install_skill "$HOME/.codex/skills" ;;
  3) install_skill "$HOME/.claude/skills"; install_skill "$HOME/.codex/skills" ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
