. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/money.sh"

TAB="$(printf '\t')"

ledger_add() {
  local cents
  [ -n "$1" ] || { echo "description required" >&2; return 1; }
  cents="$(to_cents "$2")" || return 1
  printf '%s\t%s\n' "$cents" "$1" >> "$LEDGER_FILE"
}

ledger_balance() {
  local total=0 cents desc
  if [ -f "$LEDGER_FILE" ]; then
    while IFS="$TAB" read -r cents desc; do total=$((total + cents)); done < "$LEDGER_FILE"
  fi
  from_cents "$total"
}

ledger_list() {
  local cents desc
  [ -f "$LEDGER_FILE" ] || return 0
  while IFS="$TAB" read -r cents desc; do
    printf '%10s  %s\n' "$(from_cents "$cents")" "$desc"
  done < "$LEDGER_FILE"
}
