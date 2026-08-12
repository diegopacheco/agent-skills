#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$HOME/Documents/bin"
cp "$SCRIPT_DIR/cc-loop-backlog.sh" "$HOME/Documents/bin/cc-loop-backlog.sh"
chmod +x "$HOME/Documents/bin/cc-loop-backlog.sh"

mkdir -p "$HOME/.claude/commands"
cp "$SCRIPT_DIR/commands/cc-loop-backlog.md" "$HOME/.claude/commands/cc-loop-backlog.md"

echo "installed $HOME/Documents/bin/cc-loop-backlog.sh"
echo "installed $HOME/.claude/commands/cc-loop-backlog.md"
