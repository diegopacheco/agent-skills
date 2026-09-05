#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="cc-loop-backlog"

echo "📦 loop-backlog Installer"
echo ""
echo "1) 🤖 Global Claude ($HOME/.claude/commands)"
echo "2) 🧠 Global Codex ($HOME/.codex/prompts)"
echo "3) ✨ Both"
echo ""
read -p "Choose an option [1-3]: " choice

install_runner() {
  mkdir -p "$HOME/Documents/bin"
  cp "$SCRIPT_DIR/$NAME.sh" "$HOME/Documents/bin/$NAME.sh"
  chmod +x "$HOME/Documents/bin/$NAME.sh"
  echo "✅ Installed runner to $HOME/Documents/bin/$NAME.sh"
}

install_command() {
  mkdir -p "$1"
  cp "$SCRIPT_DIR/commands/$NAME.md" "$1/$NAME.md"
  echo "✅ Installed command to $1/$NAME.md"
}

case "$choice" in
  1) install_runner; install_command "$HOME/.claude/commands" ;;
  2) install_runner; install_command "$HOME/.codex/prompts" ;;
  3) install_runner; install_command "$HOME/.claude/commands"; install_command "$HOME/.codex/prompts" ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
