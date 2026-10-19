#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-}"
NIGHT_HOME="${NIGHT_AGENTS_HOME:-$HOME/.night-agents}"
CLAUDE_SKILLS="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
CODEX_SKILLS="${CODEX_SKILLS:-$HOME/.codex/skills}"
CODEX_PROMPTS="${CODEX_PROMPTS:-$HOME/.codex/prompts}"
SKILLS="night-agents code-digger-agent presto-performance-agent migration-bot-agent test-automator-agent worm-doccer bug-hunter architect-agent smith-sec-agent code-review-agent test-review-agent chief-of-staff-agent"

if [ -z "$TARGET" ]; then
  echo "🌙 Night Agents Installer"
  echo ""
  echo "1) 🤖 Global Claude ($CLAUDE_SKILLS)"
  echo "2) 🧠 Global Codex ($CODEX_SKILLS)"
  echo "3) ✨ Both"
  echo ""
  read -r -p "Choose an option [1-3]: " choice
  case "$choice" in
    1) TARGET=claude ;;
    2) TARGET=codex ;;
    3) TARGET=both ;;
    *) echo "❌ Invalid option, aborting" >&2; exit 1 ;;
  esac
fi

command -v git >/dev/null 2>&1 || { echo "❌ git is required" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ node is required" >&2; exit 1; }

install_core() {
  mkdir -p "$NIGHT_HOME/runs" "$NIGHT_HOME/worktrees"
  rm -rf "$NIGHT_HOME/bin"
  cp -R "$ROOT/bin" "$NIGHT_HOME/bin"
  chmod +x "$NIGHT_HOME/bin/night-run.sh" "$NIGHT_HOME/bin/generate.js"
  cp "$ROOT/skills/night-agents/CONTRACT.md" "$NIGHT_HOME/CONTRACT.md"
  node "$NIGHT_HOME/bin/generate.js" >/dev/null
  printf "📦 core    %s/bin\n" "$NIGHT_HOME"
  printf "🖥️  ui      %s/ui/index.html\n" "$NIGHT_HOME"
}

install_skills() {
  mkdir -p "$1"
  for skill in $SKILLS; do
    rm -rf "${1:?}/$skill"
    cp -R "$ROOT/skills/$skill" "$1/$skill"
    printf "🧩 skill   %s/%s\n" "$1" "$skill"
  done
}

install_prompt() {
  mkdir -p "$1"
  cp "$ROOT/commands/night-agents.md" "$1/night-agents.md"
  printf "⌨️  prompt  %s/night-agents.md\n" "$1"
}

install_core
case "$TARGET" in
  claude) install_skills "$CLAUDE_SKILLS" ;;
  codex) install_skills "$CODEX_SKILLS"; install_prompt "$CODEX_PROMPTS" ;;
  both|all)
    install_skills "$CLAUDE_SKILLS"
    install_skills "$CODEX_SKILLS"
    install_prompt "$CODEX_PROMPTS"
    ;;
  *) echo "usage: install.sh [claude|codex|both]" >&2; exit 1 ;;
esac

printf "✅ done\n"
printf "   claude  /night-agents all | /night-agents presto | /night-agents\n"
printf "   codex   \$night-agents all | /prompts:night-agents all\n"
printf "   app     ./ui/install.sh installs the Night Agents app\n"
