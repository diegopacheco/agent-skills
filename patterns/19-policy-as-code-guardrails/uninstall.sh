#!/usr/bin/env bash
set -euo pipefail

NAME="policy-guard"
TARGET="${1:-}"
CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"

if [ -z "$TARGET" ]; then
  echo "$NAME uninstaller"
  echo ""
  echo "1) Global Claude ($CLAUDE_SKILLS/$NAME)"
  echo "2) Global Codex ($CODEX_SKILLS/$NAME)"
  echo "3) Both"
  echo ""
  read -r -p "Choose an option [1-3]: " choice
  case "$choice" in
    1) TARGET=claude ;;
    2) TARGET=codex ;;
    3) TARGET=both ;;
    *) echo "invalid option: $choice" >&2; exit 1 ;;
  esac
fi

uninstall_skill() {
  dest="$1/$NAME"
  if [ -d "$dest" ]; then
    rm -rf "$dest"
    echo "removed $dest"
  else
    echo "not installed in $dest"
  fi
}

case "$TARGET" in
  claude) uninstall_skill "$CLAUDE_SKILLS" ;;
  codex) uninstall_skill "$CODEX_SKILLS" ;;
  both) uninstall_skill "$CLAUDE_SKILLS"; uninstall_skill "$CODEX_SKILLS" ;;
  *) echo "usage: uninstall.sh [claude|codex|both]" >&2; exit 1 ;;
esac
