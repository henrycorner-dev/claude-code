#!/bin/bash
# Test Coverage Check Hook
# Validates that test coverage is at least 80% before allowing file modifications

set -euo pipefail

# Read input from stdin
input=$(cat)

# Extract tool information
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')
cwd=$(echo "$input" | jq -r '.cwd // "."')

# Navigate to project directory
cd "$cwd" || {
  echo '{"continue": true, "systemMessage": "Could not change to project directory, skipping coverage check"}'
  exit 0
}

# Check if this is a test file modification - allow test files without coverage check
if [[ "$file_path" == *"/test/"* ]] || [[ "$file_path" == *"/tests/"* ]] || \
   [[ "$file_path" == *"/__tests__/"* ]] || [[ "$file_path" == *".test."* ]] || \
   [[ "$file_path" == *".spec."* ]]; then
  echo '{"continue": true, "systemMessage": "Test file modification detected, skipping coverage check"}'
  exit 0
fi

# Check if jest is available
if ! command -v jest &> /dev/null && ! [ -f "node_modules/.bin/jest" ]; then
  echo '{"continue": true, "systemMessage": "Jest not found in project, skipping coverage check"}'
  exit 0
fi

# Check if there's a test directory
if [ ! -d "test" ] && [ ! -d "tests" ] && [ ! -d "__tests__" ] && \
   ! grep -q "\"test\":" package.json 2>/dev/null; then
  echo '{"continue": true, "systemMessage": "No test directory or test script found, skipping coverage check"}'
  exit 0
fi

# Create temporary file for coverage output
coverage_file=$(mktemp)
trap 'rm -f "$coverage_file"' EXIT

# Run jest with coverage
echo "Running test coverage check..." >&2

# Try to run jest with coverage, capture output
if [ -f "node_modules/.bin/jest" ]; then
  jest_cmd="node_modules/.bin/jest"
else
  jest_cmd="jest"
fi

# Run jest with coverage and capture both stdout and stderr
if ! $jest_cmd --coverage --coverageReporters=json-summary --passWithNoTests > "$coverage_file" 2>&1; then
  # Tests failed - this is a blocking error
  test_output=$(cat "$coverage_file" | head -20)
  echo "{\"hookSpecificOutput\": {\"permissionDecision\": \"deny\"}, \"systemMessage\": \"Tests are failing. Please fix the failing tests before modifying files.\n\nTest output:\n$test_output\"}" >&2
  exit 2
fi

# Check if coverage summary exists
if [ ! -f "coverage/coverage-summary.json" ]; then
  echo '{"continue": true, "systemMessage": "Coverage summary not generated, allowing modification"}'
  exit 0
fi

# Parse coverage summary
coverage_data=$(cat coverage/coverage-summary.json)

# Extract total coverage percentages
lines_pct=$(echo "$coverage_data" | jq -r '.total.lines.pct // 0')
statements_pct=$(echo "$coverage_data" | jq -r '.total.statements.pct // 0')
functions_pct=$(echo "$coverage_data" | jq -r '.total.functions.pct // 0')
branches_pct=$(echo "$coverage_data" | jq -r '.total.branches.pct // 0')

# Calculate average coverage (or use minimum, depending on your policy)
# Using minimum coverage across all metrics for strictness
min_coverage=$(echo "$lines_pct $statements_pct $functions_pct $branches_pct" | \
  awk '{min=$1; for(i=2;i<=NF;i++) if($i<min) min=$i; print min}')

# Define threshold
threshold=80

# Compare coverage to threshold
if (( $(echo "$min_coverage < $threshold" | bc -l) )); then
  # Coverage is below threshold - block the operation
  echo "{
    \"hookSpecificOutput\": {
      \"permissionDecision\": \"deny\"
    },
    \"systemMessage\": \"⚠️  Test coverage is below ${threshold}%!\\n\\nCurrent coverage:\\n  Lines: ${lines_pct}%\\n  Statements: ${statements_pct}%\\n  Functions: ${functions_pct}%\\n  Branches: ${branches_pct}%\\n\\nMinimum coverage: ${min_coverage}%\\nRequired: ${threshold}%\\n\\nPlease add more tests before modifying files.\"
  }" >&2
  exit 2
else
  # Coverage is sufficient - allow the operation
  echo "{
    \"continue\": true,
    \"systemMessage\": \"✓ Test coverage check passed (${min_coverage}% >= ${threshold}%)\\n  Lines: ${lines_pct}% | Statements: ${statements_pct}% | Functions: ${functions_pct}% | Branches: ${branches_pct}%\"
  }"
  exit 0
fi
