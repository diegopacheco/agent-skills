#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

pid="$(port_pid "$API")"
[ -n "$pid" ] && kill "$pid"
rm -f "$PID_FILE"
echo "api stopped, port $API free"
