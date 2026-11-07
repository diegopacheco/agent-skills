#!/usr/bin/env bash
set -euo pipefail

NAME="pr-splitter"
TARGET="${1:-both}"
CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"

remove_skill() { rm -rf "$1/$NAME"; echo "removed $1/$NAME"; }

case "$TARGET" in
  claude) remove_skill "$CLAUDE_SKILLS" ;;
  codex) remove_skill "$CODEX_SKILLS" ;;
  both) remove_skill "$CLAUDE_SKILLS"; remove_skill "$CODEX_SKILLS" ;;
  *) echo "usage: uninstall.sh [claude|codex|both]" >&2; exit 1 ;;
esac
