#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: record.sh run <evidence.md> -- <command...>" >&2
  echo "       record.sh artifact <evidence.md> <file>" >&2
  exit 2
}

sha() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum | cut -d' ' -f1; else shasum -a 256 | cut -d' ' -f1; fi
}

[ $# -ge 3 ] || usage
mode="$1"
evidence="$2"
shift 2
now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

case "$mode" in
  run)
    [ "$1" = "--" ] || usage
    shift
    [ $# -ge 1 ] || usage
    output="$(mktemp)"
    trap 'rm -f "$output"' EXIT
    set +e
    "$@" >"$output" 2>&1
    code=$?
    set -e
    {
      printf "## check %s\n\n" "$now"
      printf -- "- command: \`%s\`\n" "$*"
      printf -- "- exit code: %s\n" "$code"
      printf -- "- output sha256: %s\n\n" "$(sha <"$output")"
      printf '```\n'
      tail -n 20 "$output"
      printf '```\n\n'
    } >>"$evidence"
    cat "$output"
    exit "$code"
    ;;
  artifact)
    [ -f "$1" ] || { echo "artifact not found: $1" >&2; exit 1; }
    printf "## artifact %s\n\n- file: %s\n- sha256: %s\n\n" "$now" "$1" "$(sha <"$1")" >>"$evidence"
    ;;
  *) usage ;;
esac
