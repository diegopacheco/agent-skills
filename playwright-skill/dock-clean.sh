#!/usr/bin/env bash
set -euo pipefail

PLIST="$HOME/Library/Preferences/com.apple.dock.plist"
COUNT=$(/usr/libexec/PlistBuddy -c "Print :recent-apps" "$PLIST" 2>/dev/null | grep -c "bundle-identifier = " || true)
REMOVED=0

for ((i = COUNT - 1; i >= 0; i--)); do
  ID=$(/usr/libexec/PlistBuddy -c "Print :recent-apps:$i:tile-data:bundle-identifier" "$PLIST" 2>/dev/null || true)
  case "$ID" in
    com.google.Chrome|com.google.chrome.for.testing|org.chromium.Chromium)
      /usr/libexec/PlistBuddy -c "Delete :recent-apps:$i" "$PLIST"
      REMOVED=$((REMOVED + 1))
      ;;
  esac
done

if [ "$REMOVED" -gt 0 ]; then
  killall cfprefsd 2>/dev/null || true
  killall Dock
fi
echo "removed $REMOVED chrome tile(s) from the Dock recent apps"
