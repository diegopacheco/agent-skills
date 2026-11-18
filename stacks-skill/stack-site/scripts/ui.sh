#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

port="$(service_port site)"
port_up "$port" || fail "site is not running, start it with scripts/start-all.sh"
open_url "$(service_url site)"
