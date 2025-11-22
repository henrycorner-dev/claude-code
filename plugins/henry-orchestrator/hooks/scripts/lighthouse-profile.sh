#!/bin/bash
set -euo pipefail

# Lighthouse performance profiling script
# Runs Lighthouse and compares metrics against baseline

bash_command="$1"
perf_dir="$2"

# Determine target URL
target_url="http://localhost:3000"

# Try to extract URL from common dev server commands
if echo "$bash_command" | grep -qE "localhost:[0-9]+"; then
  extracted_url=$(echo "$bash_command" | grep -oE "localhost:[0-9]+" | head -1)
  target_url="http://$extracted_url"
elif echo "$bash_command" | grep -qE ":[0-9]{4,5}"; then
  port=$(echo "$bash_command" | grep -oE ":[0-9]{4,5}" | head -1 | tr -d ':')
  target_url="http://localhost:$port"
fi

# Wait for server to start (if it's a start command)
if echo "$bash_command" | grep -qiE "(start|dev|serve)"; then
  sleep 3

  # Check if server is running
  max_attempts=10
  attempt=0
  while ! curl -s "$target_url" > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
      echo '{"systemMessage": "⚠️ Could not connect to dev server at '"$target_url"'. Skipping performance profiling."}' >&2
      exit 0
    fi
    sleep 1
  done
fi

# Run Lighthouse
timestamp=$(date +%Y%m%d_%H%M%S)
report_file="$perf_dir/lighthouse_$timestamp.json"

lighthouse "$target_url" \
  --output=json \
  --output-path="$report_file" \
  --chrome-flags="--headless" \
  --quiet \
  2>/dev/null || {
    echo '{"systemMessage": "⚠️ Lighthouse profiling failed"}' >&2
    exit 0
  }

# Extract key metrics
performance_score=$(jq -r '.categories.performance.score * 100' "$report_file")
fcp=$(jq -r '.audits["first-contentful-paint"].numericValue' "$report_file")
lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue' "$report_file")
tti=$(jq -r '.audits["interactive"].numericValue' "$report_file")
tbt=$(jq -r '.audits["total-blocking-time"].numericValue' "$report_file")
cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue' "$report_file")

# Store baseline if it doesn't exist
baseline_file="$perf_dir/lighthouse_baseline.json"
if [ ! -f "$baseline_file" ]; then
  jq -n \
    --arg perf "$performance_score" \
    --arg fcp "$fcp" \
    --arg lcp "$lcp" \
    --arg tti "$tti" \
    --arg tbt "$tbt" \
    --arg cls "$cls" \
    '{
      performance_score: $perf | tonumber,
      fcp: $fcp | tonumber,
      lcp: $lcp | tonumber,
      tti: $tti | tonumber,
      tbt: $tbt | tonumber,
      cls: $cls | tonumber
    }' > "$baseline_file"

  echo "{\"systemMessage\": \"✅ Lighthouse baseline created:\\n  Performance Score: ${performance_score}/100\\n  FCP: ${fcp}ms\\n  LCP: ${lcp}ms\\n  TTI: ${tti}ms\\n  TBT: ${tbt}ms\\n  CLS: ${cls}\"}"
  exit 0
fi

# Compare against baseline
baseline=$(cat "$baseline_file")
baseline_perf=$(echo "$baseline" | jq -r '.performance_score')
baseline_fcp=$(echo "$baseline" | jq -r '.fcp')
baseline_lcp=$(echo "$baseline" | jq -r '.lcp')
baseline_tti=$(echo "$baseline" | jq -r '.tti')
baseline_tbt=$(echo "$baseline" | jq -r '.tbt')
baseline_cls=$(echo "$baseline" | jq -r '.cls')

# Calculate regressions (threshold: 10% worse or 5 points lower)
regressions=()

# Performance score regression (5 points)
perf_diff=$(echo "$performance_score - $baseline_perf" | bc)
if (( $(echo "$perf_diff < -5" | bc -l) )); then
  regressions+=("Performance Score: ${performance_score}/100 (baseline: ${baseline_perf}/100, ${perf_diff} points)")
fi

# FCP regression (10% slower)
fcp_threshold=$(echo "$baseline_fcp * 1.1" | bc)
if (( $(echo "$fcp > $fcp_threshold" | bc -l) )); then
  fcp_pct=$(echo "scale=1; ($fcp - $baseline_fcp) / $baseline_fcp * 100" | bc)
  regressions+=("First Contentful Paint: ${fcp}ms (baseline: ${baseline_fcp}ms, +${fcp_pct}%)")
fi

# LCP regression (10% slower)
lcp_threshold=$(echo "$baseline_lcp * 1.1" | bc)
if (( $(echo "$lcp > $lcp_threshold" | bc -l) )); then
  lcp_pct=$(echo "scale=1; ($lcp - $baseline_lcp) / $baseline_lcp * 100" | bc)
  regressions+=("Largest Contentful Paint: ${lcp}ms (baseline: ${baseline_lcp}ms, +${lcp_pct}%)")
fi

# TTI regression (10% slower)
tti_threshold=$(echo "$baseline_tti * 1.1" | bc)
if (( $(echo "$tti > $tti_threshold" | bc -l) )); then
  tti_pct=$(echo "scale=1; ($tti - $baseline_tti) / $baseline_tti * 100" | bc)
  regressions+=("Time to Interactive: ${tti}ms (baseline: ${baseline_tti}ms, +${tti_pct}%)")
fi

# TBT regression (10% higher)
tbt_threshold=$(echo "$baseline_tbt * 1.1" | bc)
if (( $(echo "$tbt > $tbt_threshold" | bc -l) )); then
  tbt_pct=$(echo "scale=1; ($tbt - $baseline_tbt) / $baseline_tbt * 100" | bc)
  regressions+=("Total Blocking Time: ${tbt}ms (baseline: ${baseline_tbt}ms, +${tbt_pct}%)")
fi

# CLS regression (10% higher)
cls_threshold=$(echo "$baseline_cls * 1.1" | bc)
if (( $(echo "$cls > $cls_threshold" | bc -l) )); then
  cls_pct=$(echo "scale=1; ($cls - $baseline_cls) / $baseline_cls * 100" | bc)
  regressions+=("Cumulative Layout Shift: ${cls} (baseline: ${baseline_cls}, +${cls_pct}%)")
fi

# Output results
if [ ${#regressions[@]} -gt 0 ]; then
  message="⚠️ Performance Regressions Detected:\\n"
  for regression in "${regressions[@]}"; do
    message+="  • $regression\\n"
  done
  message+="\\nFull report: $report_file"

  echo "{\"systemMessage\": \"$message\"}" >&2
  exit 2
else
  echo "{\"systemMessage\": \"✅ No performance regressions detected:\\n  Performance Score: ${performance_score}/100 (baseline: ${baseline_perf}/100)\\n  All metrics within acceptable range\\n\\nFull report: $report_file\"}"
  exit 0
fi
