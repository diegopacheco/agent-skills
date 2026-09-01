#!/usr/bin/env bash
set -eu
REPORT="$1"
[ -f "$REPORT" ] || { printf "not found: %s\n" "$REPORT"; exit 1; }
ABS="$(cd "$(dirname "$REPORT")" && pwd)/$(basename "$REPORT")"
if open -a "Google Chrome" "$ABS" 2>/dev/null; then
  printf "opened in Chrome\n"
else
  open "$ABS"
  printf "opened in default browser\n"
fi
printf "%s\n" "$ABS"
