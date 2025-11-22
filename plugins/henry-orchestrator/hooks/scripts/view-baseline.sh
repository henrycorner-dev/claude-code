#!/bin/bash
set -euo pipefail

# View current performance baselines
# Usage: bash view-baseline.sh

project_root="${CLAUDE_PROJECT_DIR:-.}"
perf_dir="$project_root/.claude/performance"

echo "📊 Performance Baselines"
echo "========================"
echo ""

# Check for Lighthouse baseline
if [ -f "$perf_dir/lighthouse_baseline.json" ]; then
  echo "🌐 Lighthouse (Web):"
  baseline=$(cat "$perf_dir/lighthouse_baseline.json")

  performance_score=$(echo "$baseline" | jq -r '.performance_score')
  fcp=$(echo "$baseline" | jq -r '.fcp')
  lcp=$(echo "$baseline" | jq -r '.lcp')
  tti=$(echo "$baseline" | jq -r '.tti')
  tbt=$(echo "$baseline" | jq -r '.tbt')
  cls=$(echo "$baseline" | jq -r '.cls')

  echo "  Performance Score: $performance_score/100"
  echo "  First Contentful Paint: ${fcp}ms"
  echo "  Largest Contentful Paint: ${lcp}ms"
  echo "  Time to Interactive: ${tti}ms"
  echo "  Total Blocking Time: ${tbt}ms"
  echo "  Cumulative Layout Shift: $cls"
  echo ""
else
  echo "ℹ️  No Lighthouse baseline found"
  echo "   Run a deploy/launch command to create baseline"
  echo ""
fi

# Check for Unity baseline
if [ -f "$perf_dir/unity_baseline.json" ]; then
  echo "🎮 Unity:"
  baseline=$(cat "$perf_dir/unity_baseline.json")

  fps=$(echo "$baseline" | jq -r '.fps')
  memory=$(echo "$baseline" | jq -r '.memory_mb')
  cpu=$(echo "$baseline" | jq -r '.cpu_ms')
  mono_memory=$(echo "$baseline" | jq -r '.mono_memory_mb // "N/A"')

  echo "  FPS: $fps"
  echo "  Memory: ${memory}MB"
  echo "  CPU Time: ${cpu}ms"
  if [ "$mono_memory" != "N/A" ]; then
    echo "  Mono Memory: ${mono_memory}MB"
  fi
  echo ""
else
  echo "ℹ️  No Unity baseline found"
  echo "   Run a Unity build/launch to create baseline"
  echo ""
fi

# Show recent reports
echo "📈 Recent Reports:"
if [ -d "$perf_dir" ]; then
  reports=$(ls -t "$perf_dir"/*.json 2>/dev/null | grep -v baseline | head -5 || true)
  if [ -n "$reports" ]; then
    echo "$reports" | while read -r report; do
      timestamp=$(basename "$report" | grep -oE "[0-9]{8}_[0-9]{6}")
      type=$(basename "$report" | sed 's/_[0-9]*.json//')
      echo "  • $type ($timestamp)"
    done
  else
    echo "  No reports yet"
  fi
else
  echo "  No reports yet"
fi

echo ""
echo "To reset baselines: bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/reset-baseline.sh"
