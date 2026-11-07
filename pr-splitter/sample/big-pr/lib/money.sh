to_cents() {
  local value="$1" sign="" whole frac
  case "$value" in -*) sign="-"; value="${value#-}" ;; esac
  printf '%s' "$value" | grep -Eq '^[0-9]+(\.[0-9]{1,2})?$' || { echo "invalid amount: $1" >&2; return 1; }
  whole="${value%%.*}"
  case "$value" in *.*) frac="${value#*.}" ;; *) frac="" ;; esac
  frac="${frac}00"
  echo "${sign}$((10#$whole * 100 + 10#${frac:0:2}))"
}

from_cents() {
  local cents="$1" sign=""
  if [ "$cents" -lt 0 ]; then sign="-"; cents=$((-cents)); fi
  printf '%s%d.%02d\n' "$sign" $((cents / 100)) $((cents % 100))
}
