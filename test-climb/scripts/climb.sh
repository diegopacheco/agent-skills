#!/usr/bin/env bash
set -euo pipefail

STATE=".test-climb"
CONF="$STATE/config"
LOG="$STATE/log.tsv"
KILLS="$STATE/kills"

die() { echo "test-climb: $*" >&2; exit 1; }

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || die "not a git repository"
PROJECT="$(basename "$PWD")"

load() {
  [ -f "$CONF" ] || die "run climb.sh init first"
  source "$CONF"
}

save() {
  {
    printf 'TEST_CMD=%q\n' "$TEST_CMD"
    printf 'COVERAGE_CMD=%q\n' "$COVERAGE_CMD"
    printf 'PATIENCE=%q\n' "$PATIENCE"
    printf 'BEST=%q\n' "$BEST"
    printf 'BASELINE=%q\n' "$BASELINE"
    printf 'REJECTS=%q\n' "$REJECTS"
    printf 'STEP=%q\n' "$STEP"
    printf 'BRANCH=%q\n' "$BRANCH"
  } > "$CONF"
}

score() {
  local out
  out="$(bash -c "$COVERAGE_CMD" 2>&1)" || { echo "$out" | tail -20 >&2; die "coverage command failed"; }
  out="$(echo "$out" | grep -oE '[0-9]+(\.[0-9]+)?%' | tail -1 | tr -d '%')"
  [ -n "$out" ] || die "coverage command printed no percentage like 71.4%"
  echo "$out"
}

gt() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a>b)}'; }

record() { printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$STEP" "$(date '+%Y-%m-%d %H:%M')" "$1" "$2" "$BEST" "$3" "$4" >> "$LOG"; }

changed() { git status --porcelain --untracked-files=all | grep -v " $STATE/" | cut -c4- || true; }

revert() {
  local f
  for f in "$@"; do
    if git ls-files --error-unmatch "$f" > /dev/null 2>&1; then git checkout -- "$f"; else rm -f "$f"; fi
  done
}

next() {
  if [ "$REJECTS" -ge "$PATIENCE" ]; then
    echo "next: stop, $REJECTS steps in a row without gain. Run climb.sh report"
  else
    echo "next: continue ($REJECTS/$PATIENCE steps without gain)"
  fi
}

cmd_init() {
  TEST_CMD=""; COVERAGE_CMD=""; PATIENCE=5
  while [ $# -gt 0 ]; do
    case "$1" in
      --test) TEST_CMD="$2"; shift 2 ;;
      --coverage) COVERAGE_CMD="$2"; shift 2 ;;
      --patience) PATIENCE="$2"; shift 2 ;;
      *) die "unknown option $1" ;;
    esac
  done
  [ -n "$COVERAGE_CMD" ] || die "init needs --coverage '<command that prints NN.N%>'"
  if [ -z "$TEST_CMD" ]; then
    [ -x scripts/test-all.sh ] || die "no scripts/test-all.sh, pass --test '<command>'"
    TEST_CMD="scripts/test-all.sh"
  fi
  [ ! -f "$CONF" ] || die "a climb is already running on this repo, see climb.sh status"
  [ -z "$(changed)" ] || die "working tree is not clean, commit or stash first"
  BRANCH="test-climb/$(date '+%Y-%m-%d-%H%M')"
  git switch -q -c "$BRANCH"
  mkdir -p "$STATE"
  grep -qx "$STATE/" .git/info/exclude 2>/dev/null || echo "$STATE/" >> .git/info/exclude
  bash -c "$TEST_CMD" > "$STATE/last-test.log" 2>&1 || die "the suite is red before climbing, see $STATE/last-test.log"
  BEST="$(score)"; BASELINE="$BEST"; REJECTS=0; STEP=0
  : > "$LOG"; : > "$KILLS"
  record baseline "$BEST" "-" "suite green before climbing"
  save
  echo "branch $BRANCH, baseline coverage $BEST%"
}

cmd_mutant() {
  load
  [ $# -ge 4 ] || die "usage: climb.sh mutant <src-file> <line> <from> <to> [test-cmd]"
  local line="$2" from="$3" to="$4" run="${5:-$TEST_CMD}"
  SRC="$1"
  [ -f "$SRC" ] || die "no such file $SRC"
  git diff --quiet -- "$SRC" 2>/dev/null || die "$SRC has changes, test-climb never edits production code"
  bash -c "$run" > "$STATE/last-test.log" 2>&1 || die "the test command fails before the mutation, see $STATE/last-test.log"
  BAK="$(mktemp)"
  cp "$SRC" "$BAK"
  trap 'cp "$BAK" "$SRC"; rm -f "$BAK"' EXIT
  awk -v n="$line" -v a="$from" -v b="$to" 'NR==n{i=index($0,a); if(i){$0=substr($0,1,i-1) b substr($0,i+length(a))}} {print}' "$BAK" > "$SRC"
  cmp -s "$BAK" "$SRC" && die "'$from' is not on line $line of $SRC"
  if bash -c "$run" > "$STATE/last-mutant.log" 2>&1; then
    echo "survived: $SRC:$line '$from' -> '$to'. The tests pass with broken code, strengthen the assertion"
    exit 1
  fi
  echo "$SRC:$line '$from' -> '$to'" >> "$KILLS"
  echo "killed: $SRC:$line '$from' -> '$to'. The test fails when the logic breaks"
}

cmd_try() {
  load
  [ $# -ge 2 ] || die "usage: climb.sh try '<why this test matters>' <test-file>..."
  local why="$1" f new kills
  shift
  for f in $(changed); do
    printf '%s\n' "$@" | grep -qx "$f" || die "$f changed but is not a listed test file, test-climb only adds tests"
  done
  [ -n "$(changed)" ] || die "nothing changed"
  [ -s "$KILLS" ] || die "no killed mutant for this step, run climb.sh mutant first to prove the test can fail"
  STEP=$((STEP + 1))
  kills="$(paste -sd ';' "$KILLS")"
  if ! bash -c "$TEST_CMD" > "$STATE/last-test.log" 2>&1; then
    revert "$@"; : > "$KILLS"; REJECTS=$((REJECTS + 1))
    record red "-" "$*" "$why"; save
    echo "rejected: suite red with the new test, reverted. See $STATE/last-test.log"
    next; return
  fi
  new="$(score)"
  if ! gt "$new" "$BEST"; then
    revert "$@"; : > "$KILLS"; REJECTS=$((REJECTS + 1))
    record no-gain "$new" "$*" "$why"; save
    echo "rejected: coverage $new% is not above $BEST%, reverted"
    next; return
  fi
  git add -- "$@"
  git commit -q -m "$PROJECT: test-climb $BEST% -> $new% $why" -m "Mutants killed: $kills"
  BEST="$new"; REJECTS=0; : > "$KILLS"
  record kept "$new" "$*" "$why"; save
  echo "kept: coverage $BEST%, committed"
  next
}

cmd_status() {
  load
  echo "branch $BRANCH, baseline $BASELINE%, best $BEST%, step $STEP"
  column -t -s $'\t' "$LOG" | tail -10
  next
}

chart() {
  awk -F'\t' '$3=="kept"||$3=="baseline"{n++; y[n]=$4} END{
    w=640; h=240; p=40; lo=y[1]; hi=y[n]; if(hi==lo){hi=lo+1}
    printf "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 %d %d\" width=\"%d\" height=\"%d\"><rect width=\"%d\" height=\"%d\" fill=\"#fffdf7\"/>", w, h, w, h, w, h
    printf "<polyline fill=\"none\" stroke=\"#16a34a\" stroke-width=\"3\" points=\""
    for(i=1;i<=n;i++){x=p+(n>1?(i-1)*(w-2*p)/(n-1):0); yy=h-p-(y[i]-lo)*(h-2*p)/(hi-lo); printf "%.1f,%.1f ", x, yy}
    printf "\"/>"
    for(i=1;i<=n;i++){x=p+(n>1?(i-1)*(w-2*p)/(n-1):0); yy=h-p-(y[i]-lo)*(h-2*p)/(hi-lo); printf "<circle cx=\"%.1f\" cy=\"%.1f\" r=\"4\" fill=\"#16a34a\"/><text x=\"%.1f\" y=\"%.1f\" font-family=\"sans-serif\" font-size=\"12\" text-anchor=\"middle\" fill=\"#1e293b\">%s%%</text>", x, yy, x, yy-10, y[i]}
    printf "</svg>\n"
  }' "$LOG"
}

cmd_report() {
  load
  local kept rejected
  kept="$(awk -F'\t' '$3=="kept"' "$LOG" | wc -l | tr -d ' ')"
  rejected="$(awk -F'\t' '$3=="red"||$3=="no-gain"' "$LOG" | wc -l | tr -d ' ')"
  chart > climb-chart.svg
  {
    echo "# test-climb report"
    echo ""
    echo "Branch \`$BRANCH\`. Coverage went from **$BASELINE%** to **$BEST%** in $kept kept steps, $rejected rejected."
    echo ""
    echo "Every kept test killed at least one mutant: the production code was broken on purpose and the test failed."
    echo ""
    echo "<p align=\"center\"><img src=\"climb-chart.svg\" alt=\"coverage per kept step\"></p>"
    echo ""
    echo "| Step | When | Result | Coverage | Best | Files | Why |"
    echo "|---|---|---|---|---|---|---|"
    awk -F'\t' '{printf "| %s | %s | %s | %s | %s | %s | %s |\n", $1, $2, $3, $4, $5, $6, $7}' "$LOG"
    echo ""
    echo "Merge with \`git merge --no-ff $BRANCH\`. Nothing was pushed."
  } > climb-report.md
  git add climb-report.md climb-chart.svg
  git commit -q -m "$PROJECT: test-climb report $BASELINE% -> $BEST%"
  echo "wrote climb-report.md and climb-chart.svg, committed on $BRANCH"
}

cmd_end() {
  load
  rm -rf "$STATE"
  echo "climb state removed, branch $BRANCH stays"
}

case "${1:-}" in
  init|mutant|try|status|report|end) c="$1"; shift; "cmd_$c" "$@" ;;
  *) echo "usage: climb.sh init|mutant|try|status|report|end" >&2; exit 1 ;;
esac
