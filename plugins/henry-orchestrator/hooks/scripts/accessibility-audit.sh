#!/bin/bash
set -euo pipefail

# Accessibility Audit Hook (PostToolUse)
# Runs accessibility checks after Write/Edit operations on UI files
# Supports: React (.jsx/.tsx) and Flutter (.dart)
# Enforces: ARIA attributes, color contrast, semantic HTML, keyboard navigation

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

# Get file extension and name
extension="${file_path##*.}"
filename=$(basename "$file_path")

# Initialize variables
a11y_issues_found=false
audit_tool=""
issues_summary=""
warning_count=0
error_count=0

# Function to check for common a11y issues in React/JSX files
check_jsx_a11y() {
  local file="$1"
  local issues=""
  local temp_issues=""

  # Check for images without alt text
  if grep -E '<img[^>]*(?!alt=)[^>]*>' "$file" &>/dev/null || \
     grep -E '<img[^>]*alt=""[^>]*>' "$file" &>/dev/null || \
     grep -E '<img[^>]*alt='"'"''"'"'[^>]*>' "$file" &>/dev/null; then
    temp_issues="⚠️  Images missing descriptive alt text (WCAG 1.1.1)"
    issues="$issues\n$temp_issues"
    warning_count=$((warning_count + 1))
  fi

  # Check for buttons/links without accessible text
  if grep -E '<button[^>]*>\s*</button>' "$file" &>/dev/null || \
     grep -E '<a[^>]*>\s*</a>' "$file" &>/dev/null; then
    temp_issues="⚠️  Empty buttons or links detected (WCAG 2.4.4)"
    issues="$issues\n$temp_issues"
    warning_count=$((warning_count + 1))
  fi

  # Check for missing form labels
  if grep -E '<input' "$file" &>/dev/null; then
    # Simple check: if there's an input but no associated label or aria-label
    if ! grep -E '(aria-label|aria-labelledby|<label)' "$file" &>/dev/null; then
      temp_issues="⚠️  Form inputs may be missing labels (WCAG 1.3.1, 3.3.2)"
      issues="$issues\n$temp_issues"
      warning_count=$((warning_count + 1))
    fi
  fi

  # Check for onClick handlers on non-interactive elements
  if grep -E '<div[^>]*onClick' "$file" &>/dev/null || \
     grep -E '<span[^>]*onClick' "$file" &>/dev/null; then
    temp_issues="⚠️  onClick on non-interactive elements (use button/a instead)"
    issues="$issues\n$temp_issues"
    warning_count=$((warning_count + 1))
  fi

  # Check for color contrast issues (basic detection)
  if grep -E 'color:\s*#[a-fA-F0-9]{3,6}' "$file" &>/dev/null; then
    temp_issues="ℹ️  Manual review needed: verify color contrast ratios (WCAG 1.4.3)"
    issues="$issues\n$temp_issues"
  fi

  # Check for missing heading structure
  if grep -E '<div' "$file" &>/dev/null && \
     ! grep -E '<h[1-6]' "$file" &>/dev/null && \
     ! grep -E 'role="heading"' "$file" &>/dev/null; then
    temp_issues="ℹ️  Consider using semantic headings (h1-h6) for structure"
    issues="$issues\n$temp_issues"
  fi

  # Check for autofocus (can be disorienting)
  if grep -E 'autoFocus|autofocus' "$file" &>/dev/null; then
    temp_issues="⚠️  autoFocus detected - can disorient screen reader users"
    issues="$issues\n$temp_issues"
    warning_count=$((warning_count + 1))
  fi

  # Check for missing lang attribute in root components
  if grep -E '<html' "$file" &>/dev/null && \
     ! grep -E 'lang=' "$file" &>/dev/null; then
    temp_issues="⚠️  HTML element missing lang attribute (WCAG 3.1.1)"
    issues="$issues\n$temp_issues"
    error_count=$((error_count + 1))
  fi

  echo -e "$issues"
}

# Function to check for a11y issues in Flutter/Dart files
check_dart_a11y() {
  local file="$1"
  local issues=""
  local temp_issues=""

  # Check for images without semantic labels
  if grep -E 'Image\.|Image\.asset|Image\.network' "$file" &>/dev/null; then
    if ! grep -E 'semanticLabel:' "$file" &>/dev/null; then
      temp_issues="⚠️  Images missing semanticLabel (accessibility)"
      issues="$issues\n$temp_issues"
      warning_count=$((warning_count + 1))
    fi
  fi

  # Check for GestureDetector without Semantics
  if grep -E 'GestureDetector\(' "$file" &>/dev/null; then
    if ! grep -E 'Semantics\(' "$file" &>/dev/null; then
      temp_issues="⚠️  GestureDetector should be wrapped in Semantics widget"
      issues="$issues\n$temp_issues"
      warning_count=$((warning_count + 1))
    fi
  fi

  # Check for missing Semantics on custom widgets
  if grep -E 'InkWell|GestureDetector|MouseRegion' "$file" &>/dev/null; then
    temp_issues="ℹ️  Verify interactive widgets have proper semantic labels"
    issues="$issues\n$temp_issues"
  fi

  # Check for ExcludeSemantics (accessibility red flag)
  if grep -E 'ExcludeSemantics' "$file" &>/dev/null; then
    temp_issues="⚠️  ExcludeSemantics detected - removes accessibility info"
    issues="$issues\n$temp_issues"
    error_count=$((error_count + 1))
  fi

  # Check for sufficient touch targets (mentioned in comments/TODOs)
  if grep -E 'Container\(|SizedBox\(' "$file" &>/dev/null; then
    temp_issues="ℹ️  Ensure touch targets are at least 48x48 logical pixels"
    issues="$issues\n$temp_issues"
  fi

  echo -e "$issues"
}

# Run accessibility checks based on file type
case "$extension" in
  jsx|tsx)
    audit_tool="React A11y Static Analysis"
    issues_summary=$(check_jsx_a11y "$file_path")

    # Try running eslint with jsx-a11y plugin if available
    if command -v eslint &> /dev/null; then
      # Check if eslint-plugin-jsx-a11y is installed
      if eslint --print-config "$file_path" 2>/dev/null | grep -q "jsx-a11y" 2>/dev/null; then
        eslint_output=$(eslint "$file_path" --format json 2>/dev/null || echo "[]")
        a11y_errors=$(echo "$eslint_output" | jq -r '.[0].messages[]? | select(.ruleId | startswith("jsx-a11y")) | .message' 2>/dev/null || echo "")

        if [ -n "$a11y_errors" ]; then
          issues_summary="$issues_summary\n\n📋 ESLint jsx-a11y findings:\n$a11y_errors"
          a11y_issues_found=true
        fi
      fi
    fi

    if [ -n "$issues_summary" ] && [ "$issues_summary" != "" ]; then
      a11y_issues_found=true
    fi
    ;;

  dart)
    audit_tool="Flutter A11y Static Analysis"
    issues_summary=$(check_dart_a11y "$file_path")

    # Try running flutter analyze if in a Flutter project
    if command -v flutter &> /dev/null && [ -f "pubspec.yaml" ]; then
      flutter_output=$(flutter analyze "$file_path" 2>/dev/null || echo "")
      if echo "$flutter_output" | grep -iq "accessibility\|semantic"; then
        a11y_hints=$(echo "$flutter_output" | grep -i "accessibility\|semantic" || echo "")
        if [ -n "$a11y_hints" ]; then
          issues_summary="$issues_summary\n\n📋 Flutter analyzer findings:\n$a11y_hints"
          a11y_issues_found=true
        fi
      fi
    fi

    if [ -n "$issues_summary" ] && [ "$issues_summary" != "" ]; then
      a11y_issues_found=true
    fi
    ;;

  *)
    # Not a UI file we audit, exit silently
    exit 0
    ;;
esac

# Output results
if [ "$a11y_issues_found" = true ]; then
  # Format the system message
  severity_label=""
  if [ $error_count -gt 0 ]; then
    severity_label="🚨 $error_count critical a11y issue(s)"
  elif [ $warning_count -gt 0 ]; then
    severity_label="⚠️  $warning_count a11y warning(s)"
  else
    severity_label="ℹ️  Accessibility review recommended"
  fi

  system_message="♿ Accessibility Audit - $filename
$severity_label

$issues_summary

💡 Recommendations:
- Review WCAG 2.1 guidelines (AA standard minimum)
- Test with screen readers (VoiceOver, NVDA, TalkBack)
- Verify keyboard navigation (Tab, Enter, Escape)
- Check color contrast ratios (4.5:1 for text, 3:1 for UI)
- Consider invoking a11y-specialist agent for detailed review

📚 Resources:
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- React a11y: https://react.dev/learn/accessibility
- Flutter a11y: https://docs.flutter.dev/accessibility-and-localization/accessibility"

  # Return structured output
  # Exit code 2 means feedback will be sent to Claude
  cat << EOF >&2
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": $(echo "$system_message" | jq -Rs .)
}
EOF
  exit 2
else
  # No issues found or minimal/informational findings
  if [ -n "$issues_summary" ]; then
    cat << EOF
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "♿ A11y check passed for $filename - informational findings noted"
}
EOF
  fi
  exit 0
fi
