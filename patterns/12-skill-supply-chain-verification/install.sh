#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="trusted-install"
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

sha() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi
}

verify_manifest() {
  manifest="$ROOT/skill/MANIFEST.sha256"
  [ -f "$manifest" ] || { echo "refusing $NAME: no MANIFEST.sha256" >&2; exit 1; }
  problems=0
  while read -r digest name; do
    if [ ! -f "$ROOT/skill/$name" ]; then
      echo "missing: $name" >&2; problems=1
    elif [ "$(sha "$ROOT/skill/$name")" != "$digest" ]; then
      echo "modified: $name" >&2; problems=1
    fi
  done <"$manifest"
  while read -r name; do
    awk -v n="$name" '$2 == n { found = 1 } END { exit !found }' "$manifest" || { echo "unlisted: $name" >&2; problems=1; }
  done < <(cd "$ROOT/skill" && find . -type f ! -name MANIFEST.sha256 ! -name .DS_Store ! -path '*/__pycache__/*' | sed 's|^\./||' | sort)
  [ "$problems" -eq 0 ] || { echo "refusing $NAME: files do not match MANIFEST.sha256" >&2; exit 1; }
}

install_skill() {
  dest="$1/$NAME"
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -R "$ROOT/skill/." "$dest/"
  find "$dest" -name __pycache__ -prune -exec rm -rf {} +
  echo "installed $NAME to $dest"
}

case "$TARGET" in
  claude|codex|both) verify_manifest ;;
esac

case "$TARGET" in
  claude) install_skill "$CLAUDE_SKILLS" ;;
  codex) install_skill "$CODEX_SKILLS" ;;
  both) install_skill "$CLAUDE_SKILLS"; install_skill "$CODEX_SKILLS" ;;
  *) echo "usage: install.sh [claude|codex|both]" >&2; exit 1 ;;
esac
