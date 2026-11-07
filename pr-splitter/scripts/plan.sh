#!/usr/bin/env bash
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ $# -eq 2 ] || die "usage: plan.sh <base> <source-branch>"
enter_repo
BASE="$1"
SOURCE="$2"
git rev-parse -q --verify "$BASE^{commit}" >/dev/null || die "base not found: $BASE"
git rev-parse -q --verify "$SOURCE^{commit}" >/dev/null || die "source not found: $SOURCE"
WORK="$(work_dir "$SOURCE")"
mkdir -p "$WORK/patches"

git -c core.quotepath=off diff --no-renames --numstat "$BASE" "$SOURCE" | sort -k3 > "$WORK/inventory.txt"

if [ ! -f "$WORK/plan.md" ]; then
  {
    printf 'base: %s\nsource: %s\nbuild: \ntest: \nprompt: prompt.md\n\n## everything\n> Replace this slice with real slices.\n' "$BASE" "$SOURCE"
    cut -f3 "$WORK/inventory.txt"
  } > "$WORK/plan.md"
fi

printf 'work dir:  %s\n' "$WORK"
printf 'plan:      %s/plan.md\n' "$WORK"
printf 'inventory: %s/inventory.txt (%s files, +%s -%s)\n' "$WORK" \
  "$(wc -l < "$WORK/inventory.txt" | tr -d ' ')" \
  "$(awk '{a+=$1} END {print a+0}' "$WORK/inventory.txt")" \
  "$(awk '{d+=$2} END {print d+0}' "$WORK/inventory.txt")"
