#!/usr/bin/env bash
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ $# -eq 1 ] || die "usage: split.sh <plan.md>"
PLAN="$(abs_path "$1")"
enter_repo
load_plan "$PLAN"
require_clean
git merge-base --is-ancestor "$BASE" "$SOURCE" || die "merge $BASE into $SOURCE first, then split again"
[ -z "$(split_branches "$SOURCE")" ] || die "split branches for $SOURCE already exist, run cleanup.sh $SOURCE"
check_coverage

rm -rf "$OUT"
mkdir -p "$OUT"
ORIG="$(current_ref)"
trap 'restore "$ORIG"' EXIT

prev="$BASE"
for i in $(seq 1 "$SLICES"); do
  branch="$(slice_branch "$i")"
  git switch -q -c "$branch" "$prev"
  stage_slice "$i"
  git commit -q -m "$PROJECT: ${TITLE[$i]}"
  verify_slice "$i" "$branch" "$prev"
  prev="$branch"
done

if ! git diff --quiet "$prev" "$SOURCE"; then
  git diff --stat "$prev" "$SOURCE" >&2
  die "last slice does not match $SOURCE, the split lost or changed code"
fi

write_create_script
printf 'same tree as %s: yes\n' "$SOURCE"
printf 'pr bodies: %s\n' "$OUT"
printf 'after pushing the branches run: %s/create-prs.sh\n' "$OUT"
