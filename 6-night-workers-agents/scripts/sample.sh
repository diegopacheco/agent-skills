#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

TARGET="${1:-$HOME/night-agents-sample/brew-shop}"
RESET="${2:-}"

require git
require node
require npm

if [ -d "$TARGET/.git" ] && [ "$RESET" != "--reset" ]; then
  log "sample already at $TARGET, pass --reset to recreate it"
  exit 0
fi

if [ -d "$TARGET/.git" ]; then
  for branch in $(git -C "$TARGET" for-each-ref --format='%(refname:short)' refs/heads/night-agents/); do
    git -C "$TARGET" branch -D "$branch" >/dev/null
  done
  git -C "$TARGET" worktree prune
fi

rm -rf "$TARGET"
mkdir -p "$TARGET"
cp -R "$ROOT/sample-project/." "$TARGET/"
node "$SCRIPTS/make-hero.js" "$TARGET/public/hero.png"
printf "node_modules/\n" >"$TARGET/.gitignore"
(
  cd "$TARGET"
  git init -q -b main
  git add .
  git -c user.name="brew-shop" -c user.email="brew-shop@localhost" commit -q -m "brew-shop: initial import"
  npm install --silent >/dev/null
  npm test >/dev/null 2>&1 || fail "sample tests failed in $TARGET"
)

log "sample ready at $TARGET"
log "next: cd $TARGET && claude \"/night-agents all\""
