#!/usr/bin/env bash
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ $# -eq 1 ] || die "usage: cleanup.sh <source-branch>"
enter_repo
case "$(git symbolic-ref -q --short HEAD || true)" in
  split/"$1"/*) die "you are on a split branch, switch to another branch first" ;;
esac
for branch in $(split_branches "$1"); do
  git branch -q -D "$branch"
  printf 'deleted %s\n' "$branch"
done
rm -rf "$(work_dir "$1")/out"
