#!/bin/bash
set -euo pipefail

# Auto-Lint-Format Hook (PostToolUse)
# Automatically formats code after Write/Edit operations
# Supports: React (ESLint/Prettier), Flutter (dart format), Unity C# (dotnet format), Python (Black)

# Read hook input from stdin
input=$(cat)

# Extract file path from tool input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# If no file path, exit silently (not a file operation)
if [ -z "$file_path" ]; then
  exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
  exit 0
fi

# Get file extension
extension="${file_path##*.}"
filename=$(basename "$file_path")

# Initialize variables
formatted=false
formatter_used=""
output_message=""

# Function to run formatter and capture result
run_formatter() {
  local formatter_name="$1"
  local formatter_cmd="$2"

  if eval "$formatter_cmd" 2>/dev/null; then
    formatted=true
    formatter_used="$formatter_name"
    return 0
  else
    return 1
  fi
}

# Detect file type and run appropriate formatter
case "$extension" in
  # JavaScript/TypeScript (React, Node.js)
  js|jsx|ts|tsx|mjs|cjs)
    # Try Prettier first (faster and handles formatting)
    if command -v prettier &> /dev/null; then
      if run_formatter "Prettier" "prettier --write '$file_path'"; then
        output_message="✓ Formatted with Prettier: $filename"
      fi
    fi

    # Then try ESLint with --fix (handles linting rules)
    if command -v eslint &> /dev/null; then
      if eslint --fix "$file_path" 2>/dev/null; then
        if [ "$formatted" = true ]; then
          output_message="✓ Formatted with Prettier + ESLint: $filename"
        else
          formatted=true
          formatter_used="ESLint"
          output_message="✓ Formatted with ESLint: $filename"
        fi
      fi
    fi
    ;;

  # CSS/SCSS/LESS
  css|scss|sass|less)
    if command -v prettier &> /dev/null; then
      if run_formatter "Prettier" "prettier --write '$file_path'"; then
        output_message="✓ Formatted with Prettier: $filename"
      fi
    fi
    ;;

  # HTML/Markdown/JSON/YAML
  html|htm|md|json|yaml|yml)
    if command -v prettier &> /dev/null; then
      if run_formatter "Prettier" "prettier --write '$file_path'"; then
        output_message="✓ Formatted with Prettier: $filename"
      fi
    fi
    ;;

  # Python
  py)
    if command -v black &> /dev/null; then
      if run_formatter "Black" "black '$file_path'"; then
        output_message="✓ Formatted with Black: $filename"
      fi
    elif command -v autopep8 &> /dev/null; then
      if run_formatter "autopep8" "autopep8 --in-place '$file_path'"; then
        output_message="✓ Formatted with autopep8: $filename"
      fi
    fi
    ;;

  # Dart (Flutter)
  dart)
    if command -v dart &> /dev/null; then
      if run_formatter "dart format" "dart format '$file_path'"; then
        output_message="✓ Formatted with dart format: $filename"
      fi
    fi
    ;;

  # C# (Unity)
  cs)
    # Check if we're in a Unity project or .NET project
    if [ -f "*.csproj" ] || [ -f "*.sln" ]; then
      if command -v dotnet &> /dev/null; then
        if run_formatter "dotnet format" "dotnet format --include '$file_path'"; then
          output_message="✓ Formatted with dotnet format: $filename"
        fi
      fi
    fi

    # Fallback to csharpier if available
    if [ "$formatted" = false ] && command -v dotnet-csharpier &> /dev/null; then
      if run_formatter "CSharpier" "dotnet-csharpier '$file_path'"; then
        output_message="✓ Formatted with CSharpier: $filename"
      fi
    fi
    ;;

  # Go
  go)
    if command -v gofmt &> /dev/null; then
      if run_formatter "gofmt" "gofmt -w '$file_path'"; then
        output_message="✓ Formatted with gofmt: $filename"
      fi
    fi
    ;;

  # Rust
  rs)
    if command -v rustfmt &> /dev/null; then
      if run_formatter "rustfmt" "rustfmt '$file_path'"; then
        output_message="✓ Formatted with rustfmt: $filename"
      fi
    fi
    ;;

  # Java
  java)
    if command -v google-java-format &> /dev/null; then
      if run_formatter "google-java-format" "google-java-format --replace '$file_path'"; then
        output_message="✓ Formatted with google-java-format: $filename"
      fi
    fi
    ;;

  # Default: no formatting
  *)
    # Unsupported file type, exit silently
    exit 0
    ;;
esac

# Output result
if [ "$formatted" = true ]; then
  # Success: inform Claude that file was formatted
  cat << EOF
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "$output_message"
}
EOF
  exit 0
else
  # No formatter available or formatting failed, exit silently
  exit 0
fi
