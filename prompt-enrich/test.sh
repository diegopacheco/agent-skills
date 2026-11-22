#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export CLAUDE_SKILLS="$TMP/claude" CODEX_SKILLS="$TMP/codex"
FAILS=0

check() {
  if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; FAILS=$((FAILS + 1)); fi
}

installed() {
  [ -f "$1/prompt-enrich/SKILL.md" ] && [ -f "$1/prompt-enrich/references/sample.md" ]
}

"$ROOT/install.sh" claude > /dev/null
check "install claude puts the skill and its reference in claude only" 'installed "$CLAUDE_SKILLS" && ! installed "$CODEX_SKILLS"'
"$ROOT/uninstall.sh" claude > /dev/null
check "uninstall claude removes it" '[ ! -d "$CLAUDE_SKILLS/prompt-enrich" ]'

"$ROOT/install.sh" codex > /dev/null
check "install codex puts the skill in codex only" 'installed "$CODEX_SKILLS" && ! installed "$CLAUDE_SKILLS"'
"$ROOT/uninstall.sh" codex > /dev/null

echo 3 | "$ROOT/install.sh" > /dev/null
check "menu option 3 installs both" 'installed "$CLAUDE_SKILLS" && installed "$CODEX_SKILLS"'
echo 3 | "$ROOT/uninstall.sh" > /dev/null
check "menu option 3 uninstalls both" '[ ! -d "$CLAUDE_SKILLS/prompt-enrich" ] && [ ! -d "$CODEX_SKILLS/prompt-enrich" ]'

check "invalid menu option fails" '! echo 9 | "$ROOT/install.sh" > /dev/null 2>&1'
check "invalid target fails" '! "$ROOT/install.sh" nope > /dev/null 2>&1'

check "skill name matches its folder so /prompt-enrich resolves" 'grep -q "^name: prompt-enrich$" "$ROOT/SKILL.md"'

CATEGORIES="$(sed -n 's/^| \([0-9]*\) | \([^|]*\) |.*/\2/p' "$ROOT/SKILL.md" | sed 's/ *$//' | sort -u)"
check "SKILL.md defines 14 categories" '[ "$(echo "$CATEGORIES" | wc -l | tr -d " ")" = 14 ]'
MISSING=""
while IFS= read -r c; do
  grep -q "| $c |" "$ROOT/references/sample.md" || MISSING="$MISSING [$c]"
done <<< "$CATEGORIES"
check "every category is mapped in the reference sample$MISSING" '[ -z "$MISSING" ]'

check "the skill never uses the banned words in its own rules" '! sed "/^\* Never use the words/d" "$ROOT/SKILL.md" | grep -qiE "\b(demo|demonstration|example)\b"'

echo ""
if [ "$FAILS" -gt 0 ]; then echo "$FAILS test(s) failed"; exit 1; fi
echo "all tests passed"
