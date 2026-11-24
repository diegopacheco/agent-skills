#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

pid="$(port_pid "$API")"
if [ -n "$pid" ]; then echo "api $API UP pid $pid"; else echo "api $API DOWN"; fi
