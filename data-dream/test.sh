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
  [ -f "$1/data-dream/SKILL.md" ] && [ -f "$1/data-dream/scripts/dream.mjs" ] && [ -f "$1/data-dream/references/catalog.json" ]
}

"$ROOT/install.sh" claude > /dev/null
check "install claude puts the skill, script and catalog in claude only" 'installed "$CLAUDE_SKILLS" && ! installed "$CODEX_SKILLS"'
check "the installed script finds its catalog" 'node "$CLAUDE_SKILLS/data-dream/scripts/dream.mjs" categories | grep -q "^money"'
"$ROOT/uninstall.sh" claude > /dev/null
check "uninstall claude removes it" '[ ! -d "$CLAUDE_SKILLS/data-dream" ]'
echo 3 | "$ROOT/install.sh" > /dev/null
check "menu option 3 installs both" 'installed "$CLAUDE_SKILLS" && installed "$CODEX_SKILLS"'
echo 3 | "$ROOT/uninstall.sh" > /dev/null
check "invalid target fails" '! "$ROOT/install.sh" nope > /dev/null 2>&1'
check "skill name matches its folder so /data-dream resolves" 'grep -q "^name: data-dream$" "$ROOT/SKILL.md"'
check "the CLI refuses a remote host" '! node "$ROOT/scripts/dream.mjs" fire --url https://api.company.com/x --seeds "$ROOT/references/catalog.json" > /dev/null 2>&1'
check "the skill never uses the banned words" '! grep -rqiE "\b(demo|demonstration|example)\b" "$ROOT/SKILL.md" "$ROOT/README.md" "$ROOT/scripts" "$ROOT/tests" "$ROOT/references" "$ROOT/sample"'
SAMPLE="$TMP/sample"
cp -R "$ROOT/sample" "$SAMPLE"
rm -rf "$SAMPLE/results"
check "the sample app's own tests pass" '(cd "$SAMPLE" && scripts/test-all.sh > /dev/null 2>&1)'
cp "$ROOT/sample/results/data-dream.test.mjs" "$SAMPLE/test/"
(cd "$SAMPLE" && node --test test/data-dream.test.mjs > "$TMP/dd.out" 2>&1) || true
FINDINGS="$(grep -c "^## DD" "$ROOT/sample/results/report.md")"
check "every finding in the sample report has a test that still fails against the sample ($FINDINGS findings)" '[ "$FINDINGS" = 10 ] && grep -q "^ℹ fail $FINDINGS$" "$TMP/dd.out" && grep -q "^ℹ pass 0$" "$TMP/dd.out"'
check "the sample report has no local paths" '! grep -qE "/Users/|/home/|/private/" "$ROOT/sample/results/report.md" "$ROOT/sample/results/transcript.md"'

check "node tests pass" 'node --test "$ROOT/tests/dream.test.mjs" > "$TMP/node.out" 2>&1 || { cat "$TMP/node.out"; false; }'
grep -E "^. (tests|pass|fail) " "$TMP/node.out" || true

echo ""
if [ "$FAILS" -gt 0 ]; then echo "$FAILS test(s) failed"; exit 1; fi
echo "all tests passed"
