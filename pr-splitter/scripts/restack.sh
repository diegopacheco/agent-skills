#!/usr/bin/env bash
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ $# -eq 1 ] || die "usage: restack.sh <plan.md>"
PLAN="$(abs_path "$1")"
enter_repo
load_plan "$PLAN"
require_clean
for i in $(seq 1 "$SLICES"); do
  git rev-parse -q --verify "refs/heads/$(slice_branch "$i")" >/dev/null || die "missing branch $(slice_branch "$i"), run split.sh first"
done

mkdir -p "$OUT"
ORIG="$(current_ref)"
trap 'restore "$ORIG"' EXIT

prev="$BASE"
for i in $(seq 1 "$SLICES"); do
  branch="$(slice_branch "$i")"
  git switch -q "$branch"
  if [ "$i" -gt 1 ] && ! git merge -q --no-edit "$prev" >/dev/null; then
    die "conflict merging $prev into $branch, resolve with: git switch $branch && git merge $prev, then run restack.sh again"
  fi
  verify_slice "$i" "$branch" "$prev"
  prev="$branch"
done

write_create_script
if git diff --quiet "$prev" "$SOURCE"; then
  printf 'same tree as %s: yes\n' "$SOURCE"
else
  printf 'same tree as %s: no, review fixes added %s\n' "$SOURCE" "$(git diff --shortstat "$SOURCE" "$prev" | sed 's/^ //')"
fi
