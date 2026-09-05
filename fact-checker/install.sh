#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="fact-checker"
COMMAND="fact-check"
TARGET="${1:-}"

CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CLAUDE_COMMANDS="${CLAUDE_COMMANDS:-$HOME/.claude/commands}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"
CODEX_PROMPTS="${CODEX_PROMPTS:-$HOME/.codex/prompts}"

if [ -z "$TARGET" ]; then
  echo "🕵️ $NAME Installer"
  echo ""
  echo "1) 🤖 Global Claude ($CLAUDE_SKILLS/$NAME)"
  echo "2) 🧠 Global Codex ($CODEX_SKILLS/$NAME)"
  echo "3) ✨ Both"
  echo ""
  read -r -p "Choose an option [1-3]: " choice
  case "$choice" in
    1) TARGET=claude ;;
    2) TARGET=codex ;;
    3) TARGET=both ;;
    *) echo "❌ Invalid option, aborting"; exit 1 ;;
  esac
fi

install_skill() {
  dest="$1/$NAME"
  mkdir -p "$1"
  if [ "$ROOT" != "$dest" ]; then
    rm -rf "$dest"
    mkdir -p "$dest"
    cp -R "$ROOT"/. "$dest"/
  fi
  printf "📦 skill   %s\n" "$dest"
  if [ -d "$1/html-research" ]; then
    printf "🔗 dep     %s/html-research found\n" "$1"
  else
    printf "⚠️  dep     html-research not in %s, fact-checker still runs standalone\n" "$1"
  fi
}

install_command() {
  mkdir -p "$1"
  cp "$ROOT/command.md" "$1/$COMMAND.md"
  printf "⌨️  command %s/%s.md\n" "$1" "$COMMAND"
}

case "$TARGET" in
  claude) install_skill "$CLAUDE_SKILLS"; install_command "$CLAUDE_COMMANDS" ;;
  codex)  install_skill "$CODEX_SKILLS";  install_command "$CODEX_PROMPTS" ;;
  both)
    install_skill "$CLAUDE_SKILLS"; install_command "$CLAUDE_COMMANDS"
    install_skill "$CODEX_SKILLS";  install_command "$CODEX_PROMPTS"
    ;;
  *) printf "usage: install.sh [claude|codex|both]\n"; exit 1 ;;
esac

mkdir -p "$HOME/git/diegopacheco/html-research"
printf "📁 output  %s/git/diegopacheco/html-research\n" "$HOME"
printf "✅ done, use /%s <report | url | path | claim>\n" "$COMMAND"
