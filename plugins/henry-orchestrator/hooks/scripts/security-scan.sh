#!/bin/bash
# security-scan.sh - Scans dependencies for vulnerabilities before installation
# Supports npm (npm audit) and Python (safety check)

set -euo pipefail

# Read input JSON from stdin
input=$(cat)

# Extract the bash command from tool_input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# If no command, allow (not a bash execution)
if [ -z "$command" ]; then
  echo '{"continue": true}'
  exit 0
fi

# Function to check npm dependencies
check_npm() {
  local packages="$1"

  # Create a temporary directory for testing
  temp_dir=$(mktemp -d)
  trap 'rm -rf "$temp_dir"' EXIT

  cd "$temp_dir"
  npm init -y > /dev/null 2>&1

  # Install packages to check
  echo "Scanning npm packages for vulnerabilities: $packages" >&2

  # Try to install and audit
  if npm install $packages --package-lock-only > /dev/null 2>&1; then
    audit_output=$(npm audit --json 2>/dev/null || true)

    # Parse audit results
    critical=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.critical // 0')
    high=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.high // 0')
    moderate=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.moderate // 0')

    total_severe=$((critical + high))

    if [ "$total_severe" -gt 0 ]; then
      # Extract vulnerability details
      vuln_summary=$(echo "$audit_output" | jq -r '.vulnerabilities | to_entries | map("\(.key): \(.value.severity)") | join(", ")' 2>/dev/null || echo "Unknown vulnerabilities")

      cat >&2 <<EOF
{
  "hookSpecificOutput": {
    "permissionDecision": "deny"
  },
  "systemMessage": "🔒 Security Alert: Blocked npm install due to vulnerabilities\n\nCritical: $critical | High: $high | Moderate: $moderate\n\nVulnerable packages: $vuln_summary\n\nPlease review vulnerabilities with 'npm audit' or choose alternative packages."
}
EOF
      exit 2
    elif [ "$moderate" -gt 0 ]; then
      # Allow but warn about moderate vulnerabilities
      cat <<EOF
{
  "continue": true,
  "systemMessage": "⚠️  Security Warning: Found $moderate moderate vulnerabilities in npm packages\n\nConsider running 'npm audit' to review. Installation allowed."
}
EOF
      exit 0
    else
      echo '{"continue": true, "systemMessage": "✅ npm packages passed security scan"}'
      exit 0
    fi
  else
    # If npm install fails, allow (might be network issue or package not found)
    echo '{"continue": true, "systemMessage": "⚠️  Could not verify npm packages - allowing installation"}'
    exit 0
  fi
}

# Function to check Python dependencies
check_pip() {
  local packages="$1"

  # Check if safety is installed
  if ! command -v safety > /dev/null 2>&1; then
    echo '{"continue": true, "systemMessage": "⚠️  safety CLI not installed - skipping Python security scan\nInstall with: pip install safety"}'
    exit 0
  fi

  # Create temporary requirements file
  temp_file=$(mktemp)
  trap 'rm -f "$temp_file"' EXIT

  # Parse package names (handle different formats)
  echo "$packages" | tr ' ' '\n' | grep -v '^$' > "$temp_file"

  echo "Scanning Python packages for vulnerabilities: $packages" >&2

  # Run safety check
  if safety_output=$(safety check --file="$temp_file" --json 2>&1); then
    # No vulnerabilities found
    echo '{"continue": true, "systemMessage": "✅ Python packages passed security scan"}'
    exit 0
  else
    # Parse safety output for vulnerabilities
    vuln_count=$(echo "$safety_output" | jq -r 'length' 2>/dev/null || echo "0")

    if [ "$vuln_count" -gt 0 ]; then
      vuln_summary=$(echo "$safety_output" | jq -r '.[] | "\(.package): \(.vulnerability)"' 2>/dev/null | head -3 || echo "Unknown vulnerabilities")

      cat >&2 <<EOF
{
  "hookSpecificOutput": {
    "permissionDecision": "deny"
  },
  "systemMessage": "🔒 Security Alert: Blocked pip install due to vulnerabilities\n\nFound $vuln_count known vulnerabilities:\n$vuln_summary\n\nPlease review vulnerabilities or choose alternative packages."
}
EOF
      exit 2
    else
      # Safety command failed for other reasons
      echo '{"continue": true, "systemMessage": "⚠️  Could not verify Python packages - allowing installation"}'
      exit 0
    fi
  fi
}

# Detect npm install commands
if echo "$command" | grep -qE '(npm\s+(i|install)|yarn\s+add|pnpm\s+(i|install|add))'; then
  # Extract package names from command
  # This regex tries to capture package names after install/add command
  packages=$(echo "$command" | sed -E 's/.*(npm\s+(i|install)|yarn\s+add|pnpm\s+(i|install|add))\s+//' | sed -E 's/\s*(-[a-zA-Z-]+|--[a-zA-Z-]+.*).*//')

  # Skip if no packages specified (e.g., bare "npm install")
  if [ -z "$packages" ] || [ "$packages" = "$command" ]; then
    # Bare npm install - audit existing package.json
    if [ -f "$CLAUDE_PROJECT_DIR/package.json" ]; then
      cd "$CLAUDE_PROJECT_DIR"
      if audit_output=$(npm audit --json 2>/dev/null || true); then
        critical=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.critical // 0')
        high=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.high // 0')

        total_severe=$((critical + high))

        if [ "$total_severe" -gt 0 ]; then
          cat >&2 <<EOF
{
  "hookSpecificOutput": {
    "permissionDecision": "deny"
  },
  "systemMessage": "🔒 Security Alert: Existing package.json has vulnerabilities\n\nCritical: $critical | High: $high\n\nRun 'npm audit fix' to resolve before installing."
}
EOF
          exit 2
        fi
      fi
    fi
    echo '{"continue": true, "systemMessage": "✅ npm install allowed"}'
    exit 0
  fi

  check_npm "$packages"

# Detect pip install commands
elif echo "$command" | grep -qE 'pip\s+(install|i)'; then
  # Extract package names
  packages=$(echo "$command" | sed -E 's/.*pip\s+(install|i)\s+//' | sed -E 's/\s*(-[a-zA-Z-]+|--[a-zA-Z-]+.*).*//')

  # Skip if no packages or if installing from file
  if [ -z "$packages" ] || echo "$packages" | grep -qE '(-r|requirements)'; then
    echo '{"continue": true, "systemMessage": "⚠️  Skipping security scan for requirements file installation"}'
    exit 0
  fi

  check_pip "$packages"

else
  # Not an install command - allow
  echo '{"continue": true}'
  exit 0
fi
