#!/usr/bin/env bash
cd "$(dirname "$0")"
for t in tests/*_test.sh; do
  bash "$t" || exit 1
done
echo "all green"
