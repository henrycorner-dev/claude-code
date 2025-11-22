#!/bin/bash
# Analyze a SQL query and show execution plan
# Usage: ./analyze-query.sh [database_url] [query_file_or_string]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help text
show_help() {
    cat << EOF
Usage: $0 [OPTIONS] DATABASE_URL QUERY

Analyze a SQL query and show its execution plan with timing information.

OPTIONS:
    -h, --help          Show this help message
    -f, --format TEXT   Output format: text (default), json, yaml
    -b, --buffers       Include buffer usage information
    -t, --timing        Include timing information (implies ANALYZE)
    -n, --no-execute    Don't execute query, just show plan (EXPLAIN only)

EXAMPLES:
    # Analyze query from string
    $0 "postgresql://user:pass@localhost/db" "SELECT * FROM users WHERE email = 'test@example.com'"

    # Analyze query from file
    $0 "postgresql://user:pass@localhost/db" query.sql

    # Show buffers and timing
    $0 -b -t "postgresql://user:pass@localhost/db" "SELECT * FROM large_table"

    # JSON output
    $0 -f json "postgresql://user:pass@localhost/db" "SELECT * FROM users"
EOF
}

# Default options
FORMAT="text"
BUFFERS=""
ANALYZE="ANALYZE"
TIMING=""

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -b|--buffers)
            BUFFERS="BUFFERS"
            shift
            ;;
        -t|--timing)
            TIMING="TIMING"
            shift
            ;;
        -n|--no-execute)
            ANALYZE=""
            shift
            ;;
        *)
            break
            ;;
    esac
done

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo ""
    show_help
    exit 1
fi

DATABASE_URL="$1"
QUERY_INPUT="$2"

# Check if input is a file or string
if [ -f "$QUERY_INPUT" ]; then
    QUERY=$(cat "$QUERY_INPUT")
else
    QUERY="$QUERY_INPUT"
fi

# Build EXPLAIN command
EXPLAIN_CMD="EXPLAIN"

if [ -n "$ANALYZE" ]; then
    EXPLAIN_CMD="$EXPLAIN_CMD $ANALYZE"
fi

if [ -n "$BUFFERS" ]; then
    EXPLAIN_CMD="$EXPLAIN_CMD, $BUFFERS"
fi

if [ -n "$TIMING" ]; then
    EXPLAIN_CMD="$EXPLAIN_CMD, $TIMING"
fi

# Add format if not text
if [ "$FORMAT" != "text" ]; then
    EXPLAIN_CMD="$EXPLAIN_CMD (FORMAT $FORMAT)"
fi

# Full query
FULL_QUERY="$EXPLAIN_CMD $QUERY"

echo -e "${BLUE}=== Query Analysis ===${NC}"
echo -e "${YELLOW}Database:${NC} $DATABASE_URL"
echo ""
echo -e "${YELLOW}Query:${NC}"
echo "$QUERY"
echo ""
echo -e "${YELLOW}Execution Plan:${NC}"
echo ""

# Execute EXPLAIN
psql "$DATABASE_URL" -c "$FULL_QUERY"

echo ""
echo -e "${GREEN}=== Analysis Tips ===${NC}"
echo -e "${YELLOW}Look for:${NC}"
echo "  • Sequential Scans on large tables (consider adding indexes)"
echo "  • High cost values (optimize with indexes or query rewrite)"
echo "  • Rows Removed by Filter (query is scanning too many rows)"
echo "  • Large difference between estimated and actual rows (update statistics)"
echo "  • Nested Loops on large datasets (consider hash join)"
echo ""
echo -e "${YELLOW}To update statistics:${NC}"
echo "  ANALYZE table_name;"
echo ""
echo -e "${YELLOW}To create index:${NC}"
echo "  CREATE INDEX idx_table_column ON table_name(column_name);"
echo "  CREATE INDEX CONCURRENTLY idx_table_column ON table_name(column_name); -- No blocking"
