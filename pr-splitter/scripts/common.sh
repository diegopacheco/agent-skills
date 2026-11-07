#!/usr/bin/env bash
set -euo pipefail

die() { printf 'pr-splitter: %s\n' "$*" >&2; exit 1; }

abs_path() {
  [ -e "$1" ] || die "not found: $1"
  printf '%s/%s\n' "$(cd "$(dirname "$1")" && pwd)" "$(basename "$1")"
}

enter_repo() {
  local top
  top="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
  cd "$top"
  PROJECT="$(basename "$top")"
}

slugify() {
  printf '%s' "$1" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9' '-' | sed -e 's/--*/-/g' -e 's/^-//' -e 's/-$//'
}

work_dir() { printf '%s/pr-split/%s\n' "$(git rev-parse --absolute-git-dir)" "$(slugify "$1")"; }

split_branches() { git for-each-ref --format='%(refname:short)' "refs/heads/split/$1/" | sort; }

slice_branch() { printf 'split/%s/%02d-%s\n' "$SOURCE" "$1" "$(slugify "${TITLE[$1]}")"; }

nonblank() { printf '%s\n' "$1" | sed '/^$/d'; }

require_clean() {
  git diff --quiet && git diff --cached --quiet || die "commit or stash your changes first"
}

current_ref() { git symbolic-ref -q --short HEAD || git rev-parse HEAD; }

restore() {
  case "$(git symbolic-ref -q --short HEAD || true)" in
    split/*) git reset -q --hard HEAD ;;
  esac
  git checkout -q "$1"
}

load_plan() {
  local plan="$1" dir line
  dir="$(dirname "$plan")"
  BASE="" SOURCE="" BUILD="" TEST="" PROMPT="" SLICES=0
  while IFS= read -r line || [ -n "$line" ]; do
    [ -n "$line" ] || continue
    if [ "$SLICES" -eq 0 ]; then
      case "$line" in
        "base: "*) BASE="${line#base: }" ;;
        "source: "*) SOURCE="${line#source: }" ;;
        "build: "*) BUILD="${line#build: }" ;;
        "test: "*) TEST="${line#test: }" ;;
        "prompt: "*) PROMPT="${line#prompt: }" ;;
        "## "*) ;;
        *) die "unknown header line in plan: $line" ;;
      esac
    fi
    case "$line" in
      "## "*)
        SLICES=$((SLICES + 1))
        TITLE[$SLICES]="${line#\#\# }"
        DESC[$SLICES]=""
        ENTRIES[$SLICES]="" ;;
      "> "*) [ "$SLICES" -gt 0 ] && DESC[$SLICES]="${DESC[$SLICES]}${line#> }"$'\n' ;;
      "patch "*) [ "$SLICES" -gt 0 ] && ENTRIES[$SLICES]="${ENTRIES[$SLICES]}patch $dir/${line#patch }"$'\n' ;;
      *) [ "$SLICES" -gt 0 ] && ENTRIES[$SLICES]="${ENTRIES[$SLICES]}path $line"$'\n' ;;
    esac
  done < "$plan"
  [ -n "$BASE" ] || die "plan has no base: line"
  [ -n "$SOURCE" ] || die "plan has no source: line"
  [ -n "$TEST" ] || die "plan has no test: line"
  [ -n "$PROMPT" ] || die "plan has no prompt: line"
  [ "$SLICES" -gt 0 ] || die "plan has no ## slices"
  case "$PROMPT" in /*) ;; *) PROMPT="$dir/$PROMPT" ;; esac
  [ -f "$PROMPT" ] || die "prompt file not found: $PROMPT"
  git rev-parse -q --verify "$BASE^{commit}" >/dev/null || die "base not found: $BASE"
  git rev-parse -q --verify "$SOURCE^{commit}" >/dev/null || die "source not found: $SOURCE"
  local i
  for i in $(seq 1 "$SLICES"); do
    [ -n "${ENTRIES[$i]}" ] || die "slice $i (${TITLE[$i]}) has no files"
    [ -n "${DESC[$i]}" ] || die "slice $i (${TITLE[$i]}) has no > description"
  done
  OUT="$(dirname "$plan")/out"
}

check_coverage() {
  local changed planned dup missing extra i
  changed="$(nonblank "$(git -c core.quotepath=off diff --no-renames --name-only "$BASE" "$SOURCE")" | sort)"
  planned="$(for i in $(seq 1 "$SLICES"); do printf '%s' "${ENTRIES[$i]}"; done | sed -n 's/^path //p' | sort)"
  dup="$(nonblank "$(printf '%s\n' "$planned" | uniq -d)")"
  missing="$(nonblank "$(comm -23 <(printf '%s\n' "$changed") <(printf '%s\n' "$planned"))")"
  extra="$(nonblank "$(comm -13 <(printf '%s\n' "$changed") <(printf '%s\n' "$planned"))")"
  [ -z "$dup" ] || die "files listed in more than one slice: $(printf '%s ' $dup)"
  [ -z "$missing" ] || die "changed files missing from the plan: $(printf '%s ' $missing)"
  [ -z "$extra" ] || die "plan lists files the source does not change: $(printf '%s ' $extra)"
}

stage_slice() {
  local i="$1" entry kind ref
  while IFS= read -r entry; do
    [ -n "$entry" ] || continue
    kind="${entry%% *}"
    ref="${entry#* }"
    if [ "$kind" = patch ]; then
      git apply --index "$ref" || die "slice $i: patch does not apply: $ref"
    elif git cat-file -e "$SOURCE:$ref" 2>/dev/null; then
      git checkout -q "$SOURCE" -- "$ref"
    else
      git rm -q --ignore-unmatch -- "$ref"
    fi
  done <<EOF
${ENTRIES[$i]}
EOF
  if git diff --cached --quiet; then
    die "slice $i (${TITLE[$i]}) changes nothing"
  fi
}

run_checks() {
  local log="$1"
  : > "$log"
  if [ -n "$BUILD" ]; then
    printf '$ %s\n' "$BUILD" >> "$log"
    bash -c "$BUILD" >> "$log" 2>&1 || return 1
  fi
  printf '$ %s\n' "$TEST" >> "$log"
  bash -c "$TEST" >> "$log" 2>&1 || return 1
}

write_body() {
  local i="$1" branch="$2" target="$3" log="$4"
  {
    printf '## Task\n\n%s\n' "${DESC[$i]}"
    printf 'PR %s of %s split from `%s`. Merge into `%s`.\n\n' "$i" "$SLICES" "$SOURCE" "$target"
    printf '## Files\n\n'
    git -c core.quotepath=off diff --no-renames --name-status "$target" "$branch" | awk -F'\t' '{printf "- `%s` %s\n", $2, $1}'
    printf '\n## Prompt\n\n'
    sed 's/^/> /' "$PROMPT"
    printf '\n## Tests\n\n```\n'
    tail -n 80 "$log"
    printf '```\n'
  } > "$OUT/$(printf '%02d' "$i").md"
}

verify_slice() {
  local i="$1" branch="$2" target="$3" log
  log="$OUT/$(printf '%02d' "$i").log"
  run_checks "$log" || die "slice $i ($branch) fails build or tests, see $log"
  [ -z "$(git status --porcelain --untracked-files=no)" ] || die "slice $i: build or tests modified tracked files"
  write_body "$i" "$branch" "$target" "$log"
  printf 'ok   %s  (%s)\n' "$branch" "$(git diff --shortstat "$target" "$branch" | sed 's/^ //')"
}

write_create_script() {
  local i target branch title
  {
    printf '#!/usr/bin/env bash\nset -euo pipefail\n'
    target="$BASE"
    for i in $(seq 1 "$SLICES"); do
      branch="$(slice_branch "$i")"
      title="$PROJECT: ${TITLE[$i]} ($i/$SLICES)"
      printf 'gh pr create --base %q --head %q --title %q --body-file %q\n' "$target" "$branch" "$title" "$OUT/$(printf '%02d' "$i").md"
      target="$branch"
    done
  } > "$OUT/create-prs.sh"
  chmod +x "$OUT/create-prs.sh"
}
