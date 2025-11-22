#!/bin/bash
set -euo pipefail

# Reset performance baseline
# Usage: bash reset-baseline.sh [lighthouse|unity|all]

project_root="${CLAUDE_PROJECT_DIR:-.}"
perf_dir="$project_root/.claude/performance"

target="${1:-all}"

case "$target" in
  lighthouse)
    if [ -f "$perf_dir/lighthouse_baseline.json" ]; then
      rm "$perf_dir/lighthouse_baseline.json"
      echo "✅ Lighthouse baseline reset"
    else
      echo "ℹ️  No Lighthouse baseline found"
    fi
    ;;

  unity)
    if [ -f "$perf_dir/unity_baseline.json" ]; then
      rm "$perf_dir/unity_baseline.json"
      echo "✅ Unity baseline reset"
    else
      echo "ℹ️  No Unity baseline found"
    fi
    ;;

  all)
    if [ -d "$perf_dir" ]; then
      rm -f "$perf_dir"/*_baseline.json
      echo "✅ All baselines reset"
    else
      echo "ℹ️  No performance data found"
    fi
    ;;

  *)
    echo "Usage: bash reset-baseline.sh [lighthouse|unity|all]"
    exit 1
    ;;
esac

echo ""
echo "Next deploy/launch will create new baseline"
