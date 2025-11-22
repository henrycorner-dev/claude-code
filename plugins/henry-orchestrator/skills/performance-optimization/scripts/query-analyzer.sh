#!/bin/bash
# Database Query Analyzer Script
#
# Analyzes slow queries and provides optimization recommendations
# Supports PostgreSQL and MySQL

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Database Query Analyzer"
echo "=========================="
echo ""

# Detect database type
DB_TYPE=""
if command -v psql &> /dev/null; then
  DB_TYPE="postgresql"
elif command -v mysql &> /dev/null; then
  DB_TYPE="mysql"
else
  echo "❌ No database client found (psql or mysql)"
  echo "   Install PostgreSQL or MySQL client first"
  exit 1
fi

echo "Detected database: $DB_TYPE"
echo ""

# ============================================================================
# PostgreSQL Analysis
# ============================================================================

if [ "$DB_TYPE" = "postgresql" ]; then
  echo "📊 PostgreSQL Query Analysis"
  echo "=============================="
  echo ""

  # Database connection details
  read -p "Database name [postgres]: " DB_NAME
  DB_NAME=${DB_NAME:-postgres}

  read -p "Database user [postgres]: " DB_USER
  DB_USER=${DB_USER:-postgres}

  read -p "Database host [localhost]: " DB_HOST
  DB_HOST=${DB_HOST:-localhost}

  echo ""
  echo "Connecting to: $DB_USER@$DB_HOST/$DB_NAME"
  echo ""

  # Check if pg_stat_statements extension is enabled
  echo "1. Checking pg_stat_statements extension..."
  EXTENSION_CHECK=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname = 'pg_stat_statements';" 2>/dev/null || echo "0")

  if [ "$EXTENSION_CHECK" -eq "0" ]; then
    echo "⚠️  pg_stat_statements extension not found"
    echo "   Enable it with: CREATE EXTENSION pg_stat_statements;"
    echo ""
  else
    echo "✅ pg_stat_statements enabled"
    echo ""

    # Get slowest queries
    echo "2. Top 10 Slowest Queries (by mean execution time):"
    echo "---------------------------------------------------"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
      SELECT
        SUBSTRING(query, 1, 60) AS short_query,
        calls,
        ROUND(mean_exec_time::numeric, 2) AS avg_ms,
        ROUND(total_exec_time::numeric, 2) AS total_ms
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY mean_exec_time DESC
      LIMIT 10;
    " 2>/dev/null

    echo ""

    # Get most time-consuming queries
    echo "3. Top 10 Most Time-Consuming Queries (by total time):"
    echo "------------------------------------------------------"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
      SELECT
        SUBSTRING(query, 1, 60) AS short_query,
        calls,
        ROUND(mean_exec_time::numeric, 2) AS avg_ms,
        ROUND(total_exec_time::numeric, 2) AS total_ms
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY total_exec_time DESC
      LIMIT 10;
    " 2>/dev/null

    echo ""
  fi

  # Check for missing indexes (sequential scans)
  echo "4. Tables with High Sequential Scans (may need indexes):"
  echo "--------------------------------------------------------"
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
      schemaname,
      tablename,
      seq_scan,
      seq_tup_read,
      idx_scan,
      ROUND(seq_tup_read::numeric / NULLIF(seq_scan, 0), 0) AS avg_seq_tuples
    FROM pg_stat_user_tables
    WHERE seq_scan > 0
    ORDER BY seq_tup_read DESC
    LIMIT 10;
  " 2>/dev/null

  echo ""

  # Check for unused indexes
  echo "5. Unused Indexes (consider removing):"
  echo "--------------------------------------"
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
      schemaname,
      tablename,
      indexname,
      idx_scan,
      pg_size_pretty(pg_relation_size(indexrelid)) AS size
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
      AND indexrelname NOT LIKE '%pkey'
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 10;
  " 2>/dev/null

  echo ""

  # Table sizes
  echo "6. Largest Tables:"
  echo "-----------------"
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
      pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;
  " 2>/dev/null

  echo ""

fi

# ============================================================================
# MySQL Analysis
# ============================================================================

if [ "$DB_TYPE" = "mysql" ]; then
  echo "📊 MySQL Query Analysis"
  echo "======================="
  echo ""

  # Database connection details
  read -p "Database name: " DB_NAME
  read -p "Database user [root]: " DB_USER
  DB_USER=${DB_USER:-root}
  read -p "Database host [localhost]: " DB_HOST
  DB_HOST=${DB_HOST:-localhost}

  echo ""
  echo "Connecting to: $DB_USER@$DB_HOST/$DB_NAME"
  echo ""

  # Check if performance_schema is enabled
  echo "1. Checking performance_schema..."
  PERF_SCHEMA=$(mysql -h "$DB_HOST" -u "$DB_USER" -p -D "$DB_NAME" -e "SHOW VARIABLES LIKE 'performance_schema';" 2>/dev/null | grep ON || echo "")

  if [ -z "$PERF_SCHEMA" ]; then
    echo "⚠️  performance_schema is disabled"
    echo "   Enable it in my.cnf: performance_schema = ON"
    echo ""
  else
    echo "✅ performance_schema enabled"
    echo ""

    # Get slowest queries
    echo "2. Top 10 Slowest Statements (by average time):"
    echo "-----------------------------------------------"
    mysql -h "$DB_HOST" -u "$DB_USER" -p -D "$DB_NAME" -e "
      SELECT
        SUBSTRING(DIGEST_TEXT, 1, 60) AS short_query,
        COUNT_STAR AS executions,
        ROUND(AVG_TIMER_WAIT / 1000000000, 2) AS avg_ms,
        ROUND(SUM_TIMER_WAIT / 1000000000, 2) AS total_ms
      FROM performance_schema.events_statements_summary_by_digest
      WHERE SCHEMA_NAME = '$DB_NAME'
      ORDER BY AVG_TIMER_WAIT DESC
      LIMIT 10;
    " 2>/dev/null

    echo ""

    # Get most time-consuming queries
    echo "3. Top 10 Most Time-Consuming Statements (by total time):"
    echo "---------------------------------------------------------"
    mysql -h "$DB_HOST" -u "$DB_USER" -p -D "$DB_NAME" -e "
      SELECT
        SUBSTRING(DIGEST_TEXT, 1, 60) AS short_query,
        COUNT_STAR AS executions,
        ROUND(AVG_TIMER_WAIT / 1000000000, 2) AS avg_ms,
        ROUND(SUM_TIMER_WAIT / 1000000000, 2) AS total_ms
      FROM performance_schema.events_statements_summary_by_digest
      WHERE SCHEMA_NAME = '$DB_NAME'
      ORDER BY SUM_TIMER_WAIT DESC
      LIMIT 10;
    " 2>/dev/null

    echo ""
  fi

  # Check for unused indexes
  echo "4. Unused Indexes (consider removing):"
  echo "--------------------------------------"
  mysql -h "$DB_HOST" -u "$DB_USER" -p -D "$DB_NAME" -e "
    SELECT
      OBJECT_SCHEMA AS table_schema,
      OBJECT_NAME AS table_name,
      INDEX_NAME AS index_name
    FROM performance_schema.table_io_waits_summary_by_index_usage
    WHERE OBJECT_SCHEMA = '$DB_NAME'
      AND INDEX_NAME IS NOT NULL
      AND INDEX_NAME != 'PRIMARY'
      AND COUNT_STAR = 0
    ORDER BY OBJECT_NAME, INDEX_NAME;
  " 2>/dev/null

  echo ""

  # Table sizes
  echo "5. Largest Tables:"
  echo "-----------------"
  mysql -h "$DB_HOST" -u "$DB_USER" -p -D "$DB_NAME" -e "
    SELECT
      table_name,
      ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
      ROUND((data_length / 1024 / 1024), 2) AS data_mb,
      ROUND((index_length / 1024 / 1024), 2) AS index_mb,
      table_rows
    FROM information_schema.TABLES
    WHERE table_schema = '$DB_NAME'
    ORDER BY (data_length + index_length) DESC
    LIMIT 10;
  " 2>/dev/null

  echo ""

fi

# ============================================================================
# Recommendations
# ============================================================================

echo ""
echo "💡 Optimization Recommendations:"
echo "================================"
echo ""
echo "1. Review slow queries above and run EXPLAIN ANALYZE"
echo "   Example: EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';"
echo ""
echo "2. Add indexes for columns used in WHERE, JOIN, ORDER BY"
echo "   Example: CREATE INDEX idx_users_email ON users(email);"
echo ""
echo "3. Remove unused indexes to improve write performance"
echo "   Example: DROP INDEX idx_unused;"
echo ""
echo "4. Consider composite indexes for multi-column queries"
echo "   Example: CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);"
echo ""
echo "5. Use EXPLAIN to verify index usage"
echo "   - PostgreSQL: Look for 'Index Scan' vs 'Seq Scan'"
echo "   - MySQL: Look for 'type: ref' or 'type: range' vs 'type: ALL'"
echo ""
echo "6. Analyze tables regularly to update statistics"
if [ "$DB_TYPE" = "postgresql" ]; then
  echo "   Example: ANALYZE users;"
else
  echo "   Example: ANALYZE TABLE users;"
fi
echo ""

echo "✅ Analysis complete!"
