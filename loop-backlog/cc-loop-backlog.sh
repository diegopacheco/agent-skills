#!/bin/bash

if [ -f backlog.md ]; then
  counts=$(awk '
    tolower($0) ~ /^#+.*todo/ { s="todo"; next }
    tolower($0) ~ /^#+.*(wip|in progress|doing)/ { s="wip"; next }
    /^#+ / { s=""; next }
    /^[[:space:]]*[-*] / { if (s=="todo") t++; else if (s=="wip") w++ }
    END { print t+0, w+0 }
  ' backlog.md)
  echo "📋 backlog.md found in $PWD"
  echo "📝 TODO: ${counts% *}  🚧 WIP: ${counts#* }"
else
  echo "❌ no backlog.md in $PWD"
  echo "🤖 running /cc-loop-backlog anyway"
fi

read -rp "🤖 model? 1) sonnet 5  2) opus 5 [1]: " choice
case "$choice" in
  2) model="claude-opus-5" ;;
  *) model="claude-sonnet-5" ;;
esac
echo "🚀 using $model"

set -o pipefail

claude -p "/cc-loop-backlog" --model "$model" --dangerously-skip-permissions --output-format stream-json --verbose | jq -rj --unbuffered '
  if .type == "assistant" then
    .message.content[]? |
      if .type == "text" then .text + "\n"
      elif .type == "tool_use" then "🔧 " + .name + " " + ((.input.description // .input.file_path // .input.command // "") | tostring | .[0:80]) + "\n"
      else empty end
  elif .type == "result" then
    "\n✅ done in " + (.duration_ms / 1000 | floor | tostring) + "s | $" + (.total_cost_usd | tostring) + "\n"
  else empty end'
