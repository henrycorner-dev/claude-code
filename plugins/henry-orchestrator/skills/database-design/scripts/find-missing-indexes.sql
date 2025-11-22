-- Find Missing Indexes in PostgreSQL
-- This script identifies tables and columns that might benefit from indexes
-- based on query patterns and table statistics

-- =============================================================================
-- 1. Tables with Sequential Scans (potential candidates for indexes)
-- =============================================================================

SELECT
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as rows_read_by_seq_scans,
    idx_scan as index_scans,
    seq_tup_read / NULLIF(seq_scan, 0) as avg_rows_per_seq_scan,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- =============================================================================
-- 2. Missing Indexes on Foreign Keys
-- =============================================================================

SELECT
    c.conrelid::regclass AS table_name,
    string_agg(a.attname, ', ') AS columns,
    'CREATE INDEX idx_' || c.conrelid::regclass || '_' ||
        string_agg(a.attname, '_') || ' ON ' ||
        c.conrelid::regclass || '(' || string_agg(a.attname, ', ') || ');' AS create_index_command
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
LEFT JOIN pg_index i ON i.indrelid = c.conrelid
    AND array_to_string(c.conkey, ',') = array_to_string(i.indkey, ',')
WHERE c.contype = 'f'  -- Foreign key constraints
    AND i.indexrelid IS NULL  -- No index exists
GROUP BY c.conrelid, c.conname
ORDER BY c.conrelid::regclass::text;

-- =============================================================================
-- 3. Tables Without Any Indexes (excluding very small tables)
-- =============================================================================

SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_tup_ins + n_tup_upd + n_tup_del as total_writes,
    seq_scan as sequential_scans
FROM pg_stat_user_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND tablename NOT IN (
        SELECT tablename
        FROM pg_indexes
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    )
    AND pg_total_relation_size(schemaname||'.'||tablename) > 1024 * 1024  -- > 1MB
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================================================
-- 4. Columns Used in WHERE Clauses (from pg_stat_statements)
-- Requires pg_stat_statements extension
-- =============================================================================

-- Enable pg_stat_statements if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements
WHERE query LIKE '%WHERE%'
    AND query NOT LIKE '%pg_stat%'
    AND query NOT LIKE '%information_schema%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- =============================================================================
-- 5. Duplicate Indexes (wasted space)
-- =============================================================================

SELECT
    pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS size,
    (array_agg(idx))[1] AS idx1,
    (array_agg(idx))[2] AS idx2,
    (array_agg(idx))[3] AS idx3,
    (array_agg(idx))[4] AS idx4
FROM (
    SELECT
        indexrelid::regclass AS idx,
        (indrelid::text || E'\n' || indclass::text || E'\n' ||
         indkey::text || E'\n' || COALESCE(indexprs::text, '') || E'\n' ||
         COALESCE(indpred::text, '')) AS key
    FROM pg_index
) sub
GROUP BY key
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;

-- =============================================================================
-- 6. Unused Indexes (candidates for removal)
-- =============================================================================

SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    'DROP INDEX ' || indexrelname || ';' as drop_command
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'  -- Exclude primary keys
    AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- 7. Index Usage Statistics
-- =============================================================================

SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY idx_scan DESC;

-- =============================================================================
-- 8. Tables with High Write Activity (careful with indexes)
-- =============================================================================

SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_ins + n_tup_upd + n_tup_del as total_writes,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_stat_user_tables t
WHERE n_tup_ins + n_tup_upd + n_tup_del > 0
ORDER BY total_writes DESC
LIMIT 20;

-- =============================================================================
-- 9. Index Bloat Estimation
-- =============================================================================

SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    ROUND(100 * (pg_relation_size(indexrelid) -
          (SELECT SUM(pg_relation_size(indexrelid))
           FROM pg_index
           WHERE indrelid = i.indrelid AND indisvalid))::numeric /
          NULLIF(pg_relation_size(indexrelid), 0), 2) as bloat_pct
FROM pg_stat_user_indexes i
WHERE pg_relation_size(indexrelid) > 100 * 1024 * 1024  -- > 100MB
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- 10. Recommended Index Candidates
-- =============================================================================

WITH table_stats AS (
    SELECT
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        n_tup_ins + n_tup_upd + n_tup_del as writes,
        pg_relation_size(schemaname||'.'||tablename) as table_bytes
    FROM pg_stat_user_tables
)
SELECT
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as rows_read,
    pg_size_pretty(table_bytes) as table_size,
    CASE
        WHEN seq_scan > 100 AND seq_tup_read > 10000 AND table_bytes > 1024*1024
        THEN 'HIGH'
        WHEN seq_scan > 50 AND seq_tup_read > 5000
        THEN 'MEDIUM'
        ELSE 'LOW'
    END as index_priority,
    'Review queries on this table and add indexes on WHERE/JOIN columns' as recommendation
FROM table_stats
WHERE seq_scan > 0
    AND table_bytes > 1024 * 1024  -- > 1MB
ORDER BY
    CASE
        WHEN seq_scan > 100 AND seq_tup_read > 10000 AND table_bytes > 1024*1024 THEN 1
        WHEN seq_scan > 50 AND seq_tup_read > 5000 THEN 2
        ELSE 3
    END,
    seq_tup_read DESC;

-- =============================================================================
-- SUMMARY AND RECOMMENDATIONS
-- =============================================================================

-- After running these queries, consider:
--
-- 1. Add indexes on:
--    - Foreign key columns (from query #2)
--    - Columns frequently used in WHERE clauses (from query #4)
--    - Tables with high seq_scan and seq_tup_read (from query #1)
--
-- 2. Remove indexes that:
--    - Are never used (from query #6)
--    - Are duplicates (from query #5)
--
-- 3. Be cautious with:
--    - Tables with high write activity (from query #8)
--    - Over-indexing can slow down INSERT/UPDATE/DELETE
--
-- 4. Monitor:
--    - Index usage after creation (query #7)
--    - Query performance with EXPLAIN ANALYZE
--
-- 5. Best practices:
--    - Use CREATE INDEX CONCURRENTLY to avoid blocking
--    - Test in staging before production
--    - Update statistics after index creation: ANALYZE table_name;
