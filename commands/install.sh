#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 commands Installer"
echo ""
echo "1) 🤖 Global Claude ($HOME/.claude/commands)"
echo "2) 🧠 Global Codex ($HOME/.codex/prompts)"
echo "3) ✨ Both"
echo ""
read -p "Choose an option [1-3]: " choice

install_commands() {
  mkdir -p "$1"
  cp "$SCRIPT_DIR"/*.md "$1/"
  echo "✅ Installed commands to $1"
}

case "$choice" in
  1) install_commands "$HOME/.claude/commands" ;;
  2) install_commands "$HOME/.codex/prompts" ;;
  3) install_commands "$HOME/.claude/commands"; install_commands "$HOME/.codex/prompts" ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
