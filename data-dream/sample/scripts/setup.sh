#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

command -v node > /dev/null || { echo "node 22 or newer is required" >&2; exit 1; }
echo "shop-api has no dependencies to install"
