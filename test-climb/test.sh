#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export CLAUDE_SKILLS="$TMP/claude" CODEX_SKILLS="$TMP/codex"
CLIMB="$ROOT/scripts/climb.sh"
FAILS=0

check() {
  if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; FAILS=$((FAILS + 1)); fi
}

installed() {
  [ -f "$1/test-climb/SKILL.md" ] && [ -x "$1/test-climb/scripts/climb.sh" ] && [ -f "$1/test-climb/references/coverage.md" ]
}

"$ROOT/install.sh" claude > /dev/null
check "install claude puts the skill, script and references in claude only" 'installed "$CLAUDE_SKILLS" && ! installed "$CODEX_SKILLS"'
"$ROOT/uninstall.sh" claude > /dev/null
check "uninstall claude removes it" '[ ! -d "$CLAUDE_SKILLS/test-climb" ]'
echo 3 | "$ROOT/install.sh" > /dev/null
check "menu option 3 installs both" 'installed "$CLAUDE_SKILLS" && installed "$CODEX_SKILLS"'
echo 3 | "$ROOT/uninstall.sh" > /dev/null
check "invalid target fails" '! "$ROOT/install.sh" nope > /dev/null 2>&1'
check "skill name matches its folder so /test-climb resolves" 'grep -q "^name: test-climb$" "$ROOT/SKILL.md"'

APP="$TMP/shop"
mkdir -p "$APP/src" "$APP/test"
cat > "$APP/src/price.mjs" <<'EOF'
export function total(items) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export function discount(amount) {
  if (amount >= 100) {
    return amount * 0.9;
  }
  return amount;
}

export function shipping(amount) {
  if (amount > 50) {
    return 0;
  }
  return 7;
}
EOF
cat > "$APP/test/total.test.mjs" <<'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { total } from "../src/price.mjs";
test("total multiplies price by quantity", () => {
  assert.equal(total([{ price: 2, qty: 3 }]), 6);
});
EOF
cd "$APP"
git init -q -b main
git config user.email t@t
git config user.name t
git add -A
git commit -q -m "shop: start"
COV='node --test --experimental-test-coverage 2>&1 | awk -F"|" "/all files/{gsub(/[ #]/,\"\",\$2); print \$2\"%\"}"'
export COV

check "init refuses without a coverage command" '! "$CLIMB" init --test "node --test" > /dev/null 2>&1'
"$CLIMB" init --test "node --test" --coverage "$COV" --patience 2 > "$TMP/init.out"
check "init creates the climb branch" 'git branch --show-current | grep -q "^test-climb/"'
BASE="$(sed -n 's/.*baseline coverage \(.*\)%/\1/p' "$TMP/init.out")"
check "init measures a real baseline from node coverage ($BASE%)" '[ -n "$BASE" ] && awk -v b="$BASE" "BEGIN{exit !(b>0 && b<100)}"'
check "the climb state is ignored by git" '[ -z "$(git status --porcelain)" ]'

cat > test/discount.test.mjs <<'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { discount } from "../src/price.mjs";
test("orders of 100 or more get 10 percent off", () => {
  assert.equal(discount(100), 90);
  assert.equal(discount(99), 99);
});
EOF
check "try without a killed mutant is refused" '! "$CLIMB" try "discount rule" test/discount.test.mjs > /dev/null 2>&1'
check "a boundary mutant >= to > is killed by the discount test" '"$CLIMB" mutant src/price.mjs 6 ">=" ">" "node --test test/discount.test.mjs" | grep -q "^killed"'
check "the mutant left the production code untouched" 'git diff --quiet src/price.mjs'
"$CLIMB" try "discount starts at exactly 100" test/discount.test.mjs > "$TMP/try1.out"
check "a step that raises coverage is kept" 'grep -q "^kept" "$TMP/try1.out"'
check "the kept step is a commit prefixed with the project name" 'git log -1 --format=%s | grep -q "^shop: test-climb .*% -> .*% discount starts at exactly 100$"'
check "the commit body lists the killed mutant" 'git log -1 --format=%b | grep -q "src/price.mjs:6"'
check "no Co-Authored-By line is added" '! git log --format=%B | grep -qi "co-authored-by"'

cat > test/weak.test.mjs <<'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { shipping } from "../src/price.mjs";
test("shipping returns something", () => {
  assert.ok(shipping(10) !== undefined);
});
EOF
check "a weak test lets the mutant survive" '! "$CLIMB" mutant src/price.mjs 13 "> 50" "> 5" "node --test test/weak.test.mjs" > /dev/null'
rm test/weak.test.mjs

cat > test/again.test.mjs <<'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { discount } from "../src/price.mjs";
test("discount again", () => {
  assert.equal(discount(200), 180);
});
EOF
"$CLIMB" mutant src/price.mjs 7 "0.9" "0.8" "node --test test/again.test.mjs" > /dev/null
"$CLIMB" try "same lines again" test/again.test.mjs > "$TMP/try2.out"
check "a step without coverage gain is rejected" 'grep -q "^rejected: coverage" "$TMP/try2.out"'
check "the rejected test file is removed" '[ ! -f test/again.test.mjs ]'

echo "// x" >> src/price.mjs
echo 'import "node:test";' > test/sneaky.test.mjs
check "a step that touches production code is refused" '! "$CLIMB" try "sneaky" test/sneaky.test.mjs > /dev/null 2>&1'
git checkout -- src/price.mjs
rm test/sneaky.test.mjs

cat > test/red.test.mjs <<'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { shipping } from "../src/price.mjs";
test("shipping is free above 50", () => {
  assert.equal(shipping(60), 0);
  assert.equal(shipping(10), 7);
});
test("broken", () => {
  assert.equal(1, 2);
});
EOF
"$CLIMB" mutant src/price.mjs 13 "> 50" "> 70" "node --test --test-name-pattern=free test/red.test.mjs" > /dev/null
"$CLIMB" try "shipping" test/red.test.mjs > "$TMP/try3.out"
check "a step that turns the suite red is rejected" 'grep -q "^rejected: suite red" "$TMP/try3.out"'
check "patience 2 reached says stop" 'grep -q "^next: stop" "$TMP/try3.out"'

"$CLIMB" report > /dev/null
check "report writes the markdown and the chart" '[ -f climb-report.md ] && grep -q "<svg" climb-chart.svg'
check "report lists every step result" 'grep -q "| kept |" climb-report.md && grep -q "| no-gain |" climb-report.md && grep -q "| red |" climb-report.md'
check "report is committed and the tree is clean" 'git log -1 --format=%s | grep -q "^shop: test-climb report" && [ -z "$(git status --porcelain)" ]'
check "report has no absolute paths" '! grep -q "$TMP" climb-report.md'
check "main was never touched" '[ "$(git log main --format=%s | wc -l | tr -d " ")" = 1 ]'
"$CLIMB" end > /dev/null
check "end removes the state and keeps the branch" '[ ! -d .test-climb ] && git branch --show-current | grep -q "^test-climb/"'
cd "$ROOT"

check "the skill never uses the banned words" '! grep -rqiE "\b(demo|demonstration|example)\b" "$ROOT/SKILL.md" "$ROOT/README.md" "$ROOT/references" "$ROOT/scripts"'

echo ""
if [ "$FAILS" -gt 0 ]; then echo "$FAILS test(s) failed"; exit 1; fi
echo "all tests passed"
