#!/bin/bash
set -euo pipefail

# Performance profiling hook for deploy/launch operations
# Runs after Bash commands to detect deploys/launches and profile performance

# Read input from stdin
input=$(cat)

# Extract tool information
tool_name=$(echo "$input" | jq -r '.tool_name')
tool_input=$(echo "$input" | jq -r '.tool_input // {}')
bash_command=$(echo "$tool_input" | jq -r '.command // ""')

# Only process if this is a Bash tool
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# Check if command is a deploy or launch operation
is_deploy_or_launch=false

# Common deploy/launch patterns
deploy_patterns=(
  "npm.*run.*build"
  "yarn.*build"
  "npm.*run.*deploy"
  "yarn.*deploy"
  "npm.*run.*start"
  "yarn.*start"
  "npm.*run.*dev"
  "yarn.*dev"
  "docker.*run"
  "docker-compose.*up"
  "vercel.*deploy"
  "netlify.*deploy"
  "firebase.*deploy"
  "gh.*deploy"
  "kubectl.*apply"
  "Unity.*-batchmode.*-executeMethod"
  "unity.*-batchmode"
)

for pattern in "${deploy_patterns[@]}"; do
  if echo "$bash_command" | grep -qiE "$pattern"; then
    is_deploy_or_launch=true
    break
  fi
done

# Skip if not a deploy/launch command
if [ "$is_deploy_or_launch" = false ]; then
  exit 0
fi

# Determine project type
project_type="unknown"
project_root="${CLAUDE_PROJECT_DIR:-.}"

# Check for web project
if [ -f "$project_root/package.json" ]; then
  project_type="web"
# Check for Unity project
elif [ -f "$project_root/ProjectSettings/ProjectVersion.txt" ]; then
  project_type="unity"
fi

# Performance profiling directory
perf_dir="$project_root/.claude/performance"
mkdir -p "$perf_dir"

# Run appropriate profiler
case "$project_type" in
  web)
    # Run Lighthouse profiler
    if command -v lighthouse &> /dev/null; then
      bash "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lighthouse-profile.sh" "$bash_command" "$perf_dir"
    else
      echo '{"systemMessage": "ℹ️ Performance profiling skipped: Lighthouse not installed. Install with: npm install -g lighthouse"}' >&2
      exit 0
    fi
    ;;

  unity)
    # Run Unity Profiler
    if command -v unity-profiler &> /dev/null || [ -f "/Applications/Unity/Unity.app" ]; then
      bash "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/unity-profile.sh" "$bash_command" "$perf_dir"
    else
      echo '{"systemMessage": "ℹ️ Performance profiling skipped: Unity Profiler not available"}' >&2
      exit 0
    fi
    ;;

  *)
    # Unknown project type, skip profiling
    exit 0
    ;;
esac

exit 0
