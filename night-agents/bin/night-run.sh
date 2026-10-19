#!/usr/bin/env bash
set -euo pipefail

NIGHT_HOME="${NIGHT_AGENTS_HOME:-$HOME/.night-agents}"
BIN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

fail() {
  printf "night-run: %s\n" "$*" >&2
  exit 1
}

usage() {
  printf "usage:\n"
  printf "  night-run.sh start <agent>     create branch, worktree and run dir, print exports\n"
  printf "  night-run.sh finish <run-dir>  validate result.json, record git stats, remove worktree, regenerate the ui\n"
  printf "  night-run.sh agents            list agent names\n"
  printf "  night-run.sh home              print the night agents home\n"
}

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

agent_names() {
  grep '"name"' "$BIN/agents.json" | sed -E 's/.*"name": "([^"]+)".*/\1/'
}

run_field() {
  sed -nE "s/^  \"$2\": \"(.*)\",?$/\1/p" "$1/run.json" | head -1
}

require_node() {
  command -v node >/dev/null 2>&1 || fail "node is required to validate results and generate the ui"
}

cmd_start() {
  local agent repo project base base_sha day clock branch run_dir worktree
  agent="${1:-}"
  [ -n "$agent" ] || fail "usage: night-run.sh start <agent>"
  agent_names | grep -qx "$agent" || fail "unknown agent $agent, known: $(agent_names | tr '\n' ' ')"
  repo="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "not inside a git repository"
  project="$(basename "$repo")"
  base="$(git -C "$repo" rev-parse --abbrev-ref HEAD)"
  [ "$base" != "HEAD" ] || fail "detached HEAD in $repo, checkout a branch first"
  base_sha="$(git -C "$repo" rev-parse HEAD)" || fail "repository $repo has no commits"
  day="$(date +%Y-%m-%d)"
  clock="$(date +%H%M%S)"
  branch="night-agents/$agent/$day-$clock"
  run_dir="$NIGHT_HOME/runs/$day/$project/$agent-$clock"
  worktree="$NIGHT_HOME/worktrees/$project/$agent-$day-$clock"
  [ ! -e "$run_dir" ] || fail "run dir $run_dir already exists"
  mkdir -p "$run_dir" "$(dirname "$worktree")"
  if ! git -C "$repo" worktree add -q -b "$branch" "$worktree" "$base_sha" >"$run_dir/worktree.log" 2>&1; then
    cat "$run_dir/worktree.log" >&2
    rm -rf "$run_dir"
    fail "git worktree add failed, nothing was created. When a sandbox keeps .git read only, allow writes to $repo/.git and $NIGHT_HOME"
  fi
  cat >"$run_dir/run.json" <<EOF
{
  "agent": "$(json_escape "$agent")",
  "project": "$(json_escape "$project")",
  "repo": "$(json_escape "$repo")",
  "branch": "$(json_escape "$branch")",
  "baseBranch": "$(json_escape "$base")",
  "baseSha": "$base_sha",
  "worktree": "$(json_escape "$worktree")",
  "day": "$day",
  "startedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  printf "export RUN_DIR=%q\n" "$run_dir"
  printf "export WORKTREE=%q\n" "$worktree"
  printf "export BRANCH=%q\n" "$branch"
  printf "export BASE_BRANCH=%q\n" "$base"
  printf "export BASE_SHA=%q\n" "$base_sha"
  printf "export PROJECT=%q\n" "$project"
  printf "export REPO=%q\n" "$repo"
}

numstat_total() {
  git -C "$1" diff --numstat "$2" "$3" | awk -v col="$4" '$1 != "-" { s += $col } END { print s + 0 }'
}

cmd_finish() {
  local run_dir repo branch base_sha worktree commits added removed files kept
  run_dir="${1:-}"
  [ -n "$run_dir" ] || fail "usage: night-run.sh finish <run-dir>"
  run_dir="$(cd "$run_dir" && pwd)" || fail "run dir $1 does not exist"
  [ -f "$run_dir/run.json" ] || fail "$run_dir/run.json is missing, was the run started with night-run.sh start?"
  [ -f "$run_dir/result.json" ] || fail "$run_dir/result.json is missing, write it before finishing"
  require_node
  node "$BIN/generate.js" --check "$run_dir" || fail "result.json in $run_dir is invalid, fix it and finish again"
  repo="$(run_field "$run_dir" repo)"
  branch="$(run_field "$run_dir" branch)"
  base_sha="$(run_field "$run_dir" baseSha)"
  worktree="$(run_field "$run_dir" worktree)"
  if [ -d "$worktree" ] && [ -n "$(git -C "$worktree" status --porcelain)" ]; then
    fail "worktree $worktree has uncommitted changes, commit or discard them first"
  fi
  commits="$(git -C "$repo" rev-list --count "$base_sha..$branch")"
  added="$(numstat_total "$repo" "$base_sha" "$branch" 1)"
  removed="$(numstat_total "$repo" "$base_sha" "$branch" 2)"
  files="$(git -C "$repo" diff --name-only "$base_sha" "$branch" | sed '/^$/d' | wc -l | tr -d ' ')"
  kept=true
  if [ -d "$worktree" ]; then
    git -C "$repo" worktree remove --force "$worktree" || fail "could not remove worktree $worktree"
  fi
  if [ "$commits" = "0" ]; then
    git -C "$repo" branch -D "$branch" >/dev/null
    kept=false
  fi
  cat >"$run_dir/git.json" <<EOF
{
  "finishedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "commits": $commits,
  "linesAdded": $added,
  "linesRemoved": $removed,
  "filesChanged": $files,
  "branchKept": $kept
}
EOF
  node "$BIN/generate.js" >/dev/null || fail "ui generation failed"
  printf "run      %s\n" "$run_dir"
  if [ "$kept" = true ]; then
    printf "branch   %s (%s commits, +%s -%s in %s files)\n" "$branch" "$commits" "$added" "$removed" "$files"
  else
    printf "branch   none, no commits were made so %s was deleted\n" "$branch"
  fi
  printf "ui       %s/ui/index.html\n" "$NIGHT_HOME"
}

case "${1:-}" in
  start) shift; cmd_start "$@" ;;
  finish) shift; cmd_finish "$@" ;;
  agents) agent_names ;;
  home) printf "%s\n" "$NIGHT_HOME" ;;
  *) usage; exit 1 ;;
esac
