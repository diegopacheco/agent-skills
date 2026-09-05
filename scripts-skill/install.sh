#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="scripts-skill"
TARGET="${1:-}"

CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"

if [ -z "$TARGET" ]; then
  printf "install %s where?\n" "$NAME"
  printf "  1) claude   %s/%s\n" "$CLAUDE_SKILLS" "$NAME"
  printf "  2) codex    %s/%s\n" "$CODEX_SKILLS" "$NAME"
  printf "  3) both\n"
  printf "choice [3]: "
  read -r choice
  case "${choice:-3}" in
    1) TARGET=claude ;;
    2) TARGET=codex ;;
    3) TARGET=both ;;
    *) printf "invalid choice\n" >&2; exit 1 ;;
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
  chmod +x "$dest"/templates/*.sh
  printf "skill   %s\n" "$dest"
}

case "$TARGET" in
  claude) install_skill "$CLAUDE_SKILLS" ;;
  codex)  install_skill "$CODEX_SKILLS" ;;
  both)
    install_skill "$CLAUDE_SKILLS"
    install_skill "$CODEX_SKILLS"
    ;;
  *) printf "usage: install.sh [claude|codex|both]\n" >&2; exit 1 ;;
esac

printf "done\n"
