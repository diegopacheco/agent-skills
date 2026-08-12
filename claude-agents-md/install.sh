#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 CLAUDE.md / AGENTS.md Installer"
echo ""
echo "1) 🤖 CLAUDE.md (Claude Code)"
echo "2) 🧠 AGENTS.md (Codex)"
echo "3) ✨ Both"
echo ""
read -p "Choose an option [1-3]: " choice

install_claude() {
  mkdir -p "$HOME/.claude"
  cp "$SCRIPT_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
  echo "✅ Installed CLAUDE.md to $HOME/.claude/CLAUDE.md"
}

install_agents() {
  mkdir -p "$HOME/.codex"
  cp "$SCRIPT_DIR/AGENTS.md" "$HOME/.codex/AGENTS.md"
  echo "✅ Installed AGENTS.md to $HOME/.codex/AGENTS.md"
}

case "$choice" in
  1) install_claude ;;
  2) install_agents ;;
  3) install_claude; install_agents ;;
  *) echo "❌ Invalid option, aborting"; exit 1 ;;
esac
