assert_eq() {
  if [ "$1" != "$2" ]; then
    printf 'FAIL %s: expected [%s] got [%s]\n' "$3" "$2" "$1"
    exit 1
  fi
  printf 'PASS %s\n' "$3"
}
