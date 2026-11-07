#!/usr/bin/env bash
set -euo pipefail

SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../scripts" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PASSED=0
FAILED=0

fail() { printf 'FAIL %s: %s\n' "$CASE" "$1"; FAILED=$((FAILED + 1)); }
pass() { printf 'PASS %s\n' "$CASE"; PASSED=$((PASSED + 1)); }

new_repo() {
  REPO="$TMP/$1"
  mkdir -p "$REPO/lib"
  cd "$REPO"
  git init -q -b main
  git config user.name tester
  git config user.email tester@localhost
  git config commit.gpgsign false
  printf 'for f in lib/*.sh; do bash "$f" || exit 1; done\necho all green\n' > test.sh
  printf 'title\n' > README.md
  printf 'legacy\n' > old.txt
  printf 'echo core\n' > lib/core.sh
  git add -A && git commit -q -m init
  git switch -q -c feature/big
  printf 'add() { echo $(($1 + $2)); }\n' > lib/math.sh
  printf '. lib/math.sh\n[ "$(add 2 3)" = 5 ]\n' > lib/report.sh
  printf 'title\nmath section\nreport section\n' > README.md
  git rm -q old.txt
  git add -A && git commit -q -m "big change"
  git switch -q main
  WORK="$(git rev-parse --absolute-git-dir)/pr-split/feature-big"
  mkdir -p "$WORK/patches"
  printf 'Split the big feature branch into small PRs.\n' > "$WORK/prompt.md"
}

write_plan() {
  { printf 'base: main\nsource: feature/big\ntest: bash test.sh\nprompt: prompt.md\n\n'; cat; } > "$WORK/plan.md"
}

good_plan() {
  write_plan <<'P'
## math helper
> Adds the add helper that the report needs.
lib/math.sh
patch patches/readme-math.patch

## report
> Adds the report that uses the math helper.
> Removes the legacy file.
lib/report.sh
README.md
old.txt
P
  printf 'title\nmath section\n' > "$TMP/readme-mid"
  git show main:README.md > "$TMP/readme-base"
  diff -u "$TMP/readme-base" "$TMP/readme-mid" | sed -e '1s|.*|--- a/README.md|' -e '2s|.*|+++ b/README.md|' > "$WORK/patches/readme-math.patch" || true
}

CASE="lossless stacked split: every slice green, last slice equals source"
new_repo happy
good_plan
if out="$("$SCRIPTS/split.sh" "$WORK/plan.md" 2>&1)"; then
  b1=split/feature/big/01-math-helper
  b2=split/feature/big/02-report
  if [ "$(git branch --show-current)" != main ]; then fail "did not return to main"
  elif ! git diff --quiet "$b2" feature/big; then fail "last slice differs from source"
  elif [ "$(git merge-base "$b1" "$b2")" != "$(git rev-parse "$b1")" ]; then fail "slice 2 is not stacked on slice 1"
  elif ! (git switch -q "$b1" && bash test.sh >/dev/null && git switch -q main); then fail "slice 1 tests fail"
  elif [ "$(git show "$b1:README.md")" != "$(printf 'title\nmath section')" ]; then fail "partial patch not applied in slice 1"
  elif git cat-file -e "$b1:lib/report.sh" 2>/dev/null; then fail "slice 1 leaked a file from slice 2"
  elif ! grep -q "Merge into \`$b1\`" "$WORK/out/02.md"; then fail "pr 2 body does not target slice 1"
  elif ! grep -q "> Split the big feature branch" "$WORK/out/02.md"; then fail "pr body lacks the prompt"
  elif ! grep -q "all green" "$WORK/out/01.md"; then fail "pr body lacks real test output"
  elif ! grep -q -- "--base main --head $b1" "$WORK/out/create-prs.sh"; then fail "first pr does not target main"
  elif ! grep -q -- "--base $b1 --head $b2" "$WORK/out/create-prs.sh"; then fail "second pr does not target first slice"
  elif [ "$(git log -1 --format=%s "$b1")" != "happy: math helper" ]; then fail "commit message lacks project prefix"
  else pass; fi
else fail "split failed: $out"; fi

CASE="a changed file left out of the plan is refused before any branch exists"
new_repo missing
write_plan <<'P'
## math helper
> Adds the add helper.
lib/math.sh
P
if "$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null 2>"$TMP/err"; then fail "split accepted a lossy plan"
elif ! grep -q "missing from the plan: .*lib/report.sh" "$TMP/err"; then fail "error does not name the missing file"
elif [ -n "$(git branch --list 'split/*')" ]; then fail "branches were created"
else pass; fi

CASE="a slice that cannot pass its tests alone stops the split and names the slice"
new_repo order
write_plan <<'P'
## report first
> Adds the report before its dependency.
lib/report.sh
README.md
old.txt

## math helper
> Adds the add helper.
lib/math.sh
P
if "$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null 2>"$TMP/err"; then fail "split accepted a slice with failing tests"
elif ! grep -q "slice 1 (split/feature/big/01-report-first) fails" "$TMP/err"; then fail "error does not name slice 1"
elif [ "$(git branch --show-current)" != main ]; then fail "did not return to main after failure"
elif git rev-parse -q --verify refs/heads/split/feature/big/02-math-helper >/dev/null; then fail "kept going after a red slice"
else pass; fi

CASE="an existing split is never overwritten, cleanup removes it"
new_repo rerun
good_plan
"$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null
if "$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null 2>&1; then fail "second split overwrote the first"
elif ! "$SCRIPTS/cleanup.sh" feature/big >/dev/null; then fail "cleanup failed"
elif [ -n "$(git branch --list 'split/*')" ]; then fail "cleanup left branches"
elif [ ! -f "$WORK/plan.md" ]; then fail "cleanup deleted the plan"
elif ! "$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null; then fail "split after cleanup failed"
else pass; fi

CASE="uncommitted work is refused so nothing is lost on branch switches"
new_repo dirty
good_plan
printf 'wip\n' >> README.md
if "$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null 2>&1; then fail "split ran on a dirty tree"
elif [ "$(cat README.md)" != "$(printf 'title\nwip')" ]; then fail "uncommitted work was touched"
else pass; fi

CASE="restack merges a review fix on slice 1 into slice 2 without rebase"
new_repo restack
good_plan
"$SCRIPTS/split.sh" "$WORK/plan.md" >/dev/null
b1=split/feature/big/01-math-helper
b2=split/feature/big/02-report
before="$(git rev-parse "$b2")"
git switch -q "$b1"
printf 'sub() { echo $(($1 - $2)); }\n' >> lib/math.sh
git commit -q -am "review fix"
git switch -q main
if ! out="$("$SCRIPTS/restack.sh" "$WORK/plan.md" 2>&1)"; then fail "restack failed: $out"
elif ! git show "$b2:lib/math.sh" | grep -q sub; then fail "fix did not reach slice 2"
elif ! git merge-base --is-ancestor "$before" "$b2"; then fail "slice 2 history was rewritten"
elif [ "$(git rev-list --merges "$before..$b2" | wc -l | tr -d ' ')" != 1 ]; then fail "no merge commit on slice 2"
elif ! printf '%s' "$out" | grep -q "same tree as feature/big: no"; then fail "did not report the drift from source"
else pass; fi

printf '\n%s passed, %s failed\n' "$PASSED" "$FAILED"
[ "$FAILED" -eq 0 ]
