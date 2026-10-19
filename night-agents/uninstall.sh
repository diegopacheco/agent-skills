#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-both}"
PURGE="${2:-}"
NIGHT_HOME="${NIGHT_AGENTS_HOME:-$HOME/.night-agents}"
CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"
CODEX_PROMPTS="${CODEX_PROMPTS:-$HOME/.codex/prompts}"
SKILLS="night-agents code-digger-agent presto-performance-agent migration-bot-agent test-automator-agent worm-doccer bug-hunter architect-agent smith-sec-agent code-review-agent test-review-agent chief-of-staff-agent"

remove_skills() {
  for skill in $SKILLS; do
    if [ -d "$1/$skill" ]; then
      rm -rf "${1:?}/$skill"
      printf "🗑️  skill   %s/%s\n" "$1" "$skill"
    fi
  done
}

case "$TARGET" in
  claude) remove_skills "$CLAUDE_SKILLS" ;;
  codex) remove_skills "$CODEX_SKILLS"; rm -f "$CODEX_PROMPTS/night-agents.md" ;;
  both|all) remove_skills "$CLAUDE_SKILLS"; remove_skills "$CODEX_SKILLS"; rm -f "$CODEX_PROMPTS/night-agents.md" ;;
  *) echo "usage: uninstall.sh [claude|codex|both] [--purge]" >&2; exit 1 ;;
esac

if [ "$PURGE" = "--purge" ]; then
  rm -rf "$NIGHT_HOME"
  printf "🗑️  home    %s removed with every run\n" "$NIGHT_HOME"
else
  rm -rf "$NIGHT_HOME/bin" "$NIGHT_HOME/CONTRACT.md"
  printf "📁 runs    kept in %s/runs, pass --purge to remove them\n" "$NIGHT_HOME"
fi
printf "✅ uninstalled\n"
