#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="html-research"
TARGET="${1:-both}"

CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CLAUDE_COMMANDS="${CLAUDE_COMMANDS:-$HOME/.claude/commands}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"
CODEX_PROMPTS="${CODEX_PROMPTS:-$HOME/.codex/prompts}"

install_skill() {
  dest="$1/$NAME"
  mkdir -p "$1"
  if [ "$ROOT" != "$dest" ]; then
    rm -rf "$dest"
    mkdir -p "$dest"
    cp -R "$ROOT"/. "$dest"/
  fi
  printf "skill   %s\n" "$dest"
}

install_command() {
  mkdir -p "$1"
  cp "$ROOT/command.md" "$1/$NAME.md"
  printf "command %s/%s.md\n" "$1" "$NAME"
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
printf "output  %s/git/diegopacheco/html-research\n" "$HOME"
printf "done, use /%s <topic>\n" "$NAME"
