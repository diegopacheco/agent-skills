#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="untrusted-run"
TARGET="${1:-}"
CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"

if [ -z "$TARGET" ]; then
  echo "$NAME installer"
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

install_skill() {
  dest="$1/$NAME"
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -R "$ROOT/skill/." "$dest/"
  find "$dest" -name __pycache__ -prune -exec rm -rf {} +
  echo "installed $NAME to $dest"
}

case "$TARGET" in
  claude) install_skill "$CLAUDE_SKILLS" ;;
  codex) install_skill "$CODEX_SKILLS" ;;
  both) install_skill "$CLAUDE_SKILLS"; install_skill "$CODEX_SKILLS" ;;
  *) echo "usage: install.sh [claude|codex|both]" >&2; exit 1 ;;
esac
