#!/bin/bash
# commit-guard.sh - Check for staged changes before session end
# Suggests running git diff --staged | claude commit if changes exist

set -euo pipefail

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  # Not a git repo, nothing to do
  exit 0
fi

# Check for staged changes
if git diff --staged --quiet; then
  # No staged changes, allow stop
  exit 0
else
  # Staged changes detected - suggest commit workflow
  cat <<EOF
{
  "decision": "block",
  "reason": "You have staged changes that haven't been committed yet.",
  "systemMessage": "Staged changes detected. Consider running: git diff --staged | claude commit\n\nThis will generate a thoughtful commit message based on your staged changes. Or you can commit manually with: git commit -m \"your message\""
}
EOF
  exit 2
fi
