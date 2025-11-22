-- ============================================================================
-- DATABASE INDEXING EXAMPLES
-- ============================================================================
-- This file demonstrates various indexing strategies for common scenarios

-- ============================================================================
-- 1. SINGLE COLUMN INDEXES
-- ============================================================================

-- Index for frequently queried email lookups
CREATE INDEX idx_users_email ON users(email);
-- Usage: SELECT * FROM users WHERE email = 'user@example.com'

-- Index for date range queries
CREATE INDEX idx_posts_created_at ON posts(created_at);
-- Usage: SELECT * FROM posts WHERE created_at > '2024-01-01'

-- Index for foreign key relationships
CREATE INDEX idx_posts_user_id ON posts(user_id);
-- Usage: SELECT * FROM posts WHERE user_id = 123

-- ============================================================================
-- 2. COMPOSITE (MULTI-COLUMN) INDEXES
-- ============================================================================

-- Composite index for status + date filtering
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
-- Usage:
--   SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC
--   SELECT * FROM orders WHERE status = 'completed' AND created_at > '2024-01-01'

-- Composite index for user posts (user_id + created_at)
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
-- Usage: SELECT * FROM posts WHERE user_id = 123 ORDER BY created_at DESC LIMIT 10

-- Composite index with multiple filter columns
CREATE INDEX idx_products_category_status_price ON products(category_id, status, price);
-- Usage:
--   SELECT * FROM products WHERE category_id = 5 AND status = 'active'
--   SELECT * FROM products WHERE category_id = 5 AND status = 'active' AND price < 100

-- ============================================================================
-- 3. UNIQUE INDEXES
-- ============================================================================

-- Unique email constraint + index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
-- Ensures no duplicate emails while also speeding up email lookups

-- Unique composite index (prevent duplicate user-product combinations)
CREATE UNIQUE INDEX idx_cart_user_product ON shopping_cart(user_id, product_id);
-- Usage: Prevent user from adding same product twice to cart

-- ============================================================================
-- 4. PARTIAL/FILTERED INDEXES (PostgreSQL)
-- ============================================================================

-- Index only active users (reduces index size)
CREATE INDEX idx_users_active ON users(email) WHERE status = 'active';
-- Usage: SELECT * FROM users WHERE status = 'active' AND email = 'user@example.com'

-- Index only recent orders (last 30 days)
CREATE INDEX idx_orders_recent ON orders(user_id, created_at)
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';
-- Usage: SELECT * FROM orders WHERE user_id = 123 AND created_at > CURRENT_DATE - INTERVAL '30 days'

-- Index only unpaid invoices
CREATE INDEX idx_invoices_unpaid ON invoices(due_date)
WHERE status = 'unpaid';
-- Usage: SELECT * FROM invoices WHERE status = 'unpaid' AND due_date < CURRENT_DATE

-- ============================================================================
-- 5. COVERING INDEXES
-- ============================================================================

-- PostgreSQL: INCLUDE clause (includes columns without indexing them)
CREATE INDEX idx_orders_user_covering ON orders(user_id)
INCLUDE (total_amount, created_at, status);
-- Usage: SELECT user_id, total_amount, created_at, status FROM orders WHERE user_id = 123
-- Benefits: Query can be answered entirely from index (index-only scan)

-- Alternative: Add columns to composite index
CREATE INDEX idx_orders_user_total_created ON orders(user_id, total_amount, created_at);
-- Same benefit but columns are also indexed (may be unnecessary)

-- ============================================================================
-- 6. FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- PostgreSQL: GIN index for full-text search
CREATE INDEX idx_posts_content_fulltext ON posts
USING GIN (to_tsvector('english', content));
-- Usage:
--   SELECT * FROM posts
--   WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database & performance')

-- MySQL: Full-text index
CREATE FULLTEXT INDEX idx_posts_content_fulltext ON posts(title, content);
-- Usage:
--   SELECT * FROM posts
--   WHERE MATCH(title, content) AGAINST('database performance' IN NATURAL LANGUAGE MODE)

-- ============================================================================
-- 7. FUNCTIONAL/EXPRESSION INDEXES (PostgreSQL)
-- ============================================================================

-- Index on lowercased email for case-insensitive searches
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Usage: SELECT * FROM users WHERE LOWER(email) = 'user@example.com'

-- Index on JSON field extraction
CREATE INDEX idx_users_settings_theme ON users((settings->>'theme'));
-- Usage: SELECT * FROM users WHERE settings->>'theme' = 'dark'

-- Index on date truncation
CREATE INDEX idx_events_date ON events(DATE(created_at));
-- Usage: SELECT * FROM events WHERE DATE(created_at) = '2024-01-15'

-- ============================================================================
-- 8. JSONB INDEXES (PostgreSQL)
-- ============================================================================

-- GIN index for JSONB containment queries
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);
-- Usage: SELECT * FROM users WHERE metadata @> '{"premium": true}'

-- GIN index with jsonb_path_ops (faster, less flexible)
CREATE INDEX idx_users_metadata_ops ON users USING GIN (metadata jsonb_path_ops);
-- Usage: SELECT * FROM users WHERE metadata @> '{"settings": {"theme": "dark"}}'

-- Index specific JSON key
CREATE INDEX idx_users_preferences_theme ON users((preferences->>'theme'));
-- Usage: SELECT * FROM users WHERE preferences->>'theme' = 'dark'

-- ============================================================================
-- 9. INDEX BEST PRACTICES
-- ============================================================================

-- ✅ GOOD: Index for specific query patterns
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at);
-- Supports: WHERE user_id = ? AND status = ? ORDER BY created_at

-- ❌ BAD: Index on low-cardinality column alone
-- CREATE INDEX idx_users_status ON users(status);
-- If status only has 2-3 values, index is inefficient

-- ✅ GOOD: Composite index with high-cardinality column first
CREATE INDEX idx_users_email_status ON users(email, status);
-- email is unique, status is low-cardinality

-- ❌ BAD: Composite index with low-cardinality column first
-- CREATE INDEX idx_users_status_email ON users(status, email);
-- Less efficient for most queries

-- ============================================================================
-- 10. ANALYZING INDEX USAGE
-- ============================================================================

-- PostgreSQL: Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
-- Indexes with 0 scans are unused and should be removed

-- PostgreSQL: Find missing indexes (tables with many sequential scans)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan AS avg_seq_tuples
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 25;
-- High seq_tup_read indicates potential missing indexes

-- PostgreSQL: Check index size
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- MySQL: Check index usage
SELECT
  OBJECT_SCHEMA AS table_schema,
  OBJECT_NAME AS table_name,
  INDEX_NAME AS index_name,
  COUNT_STAR AS index_usage_count
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_database'
  AND INDEX_NAME IS NOT NULL
ORDER BY COUNT_STAR ASC;

-- ============================================================================
-- 11. REMOVING UNUSED INDEXES
-- ============================================================================

-- Drop unused index
DROP INDEX idx_users_status;

-- Drop index concurrently (PostgreSQL, doesn't block table)
DROP INDEX CONCURRENTLY idx_users_status;

-- ============================================================================
-- 12. REAL-WORLD EXAMPLES
-- ============================================================================

-- E-commerce: Product search and filtering
CREATE INDEX idx_products_search ON products(category_id, status, price)
WHERE status = 'active';
-- Supports: Active products filtered by category and price range

-- Social media: User feed
CREATE INDEX idx_posts_feed ON posts(user_id, created_at DESC)
INCLUDE (content, like_count);
-- Supports: Fetch user's recent posts with metadata (index-only scan)

-- Analytics: Time-series data
CREATE INDEX idx_events_time_bucket ON events(user_id, DATE_TRUNC('hour', created_at));
-- Supports: Hourly aggregations per user

-- Authentication: Session lookup
CREATE INDEX idx_sessions_token ON sessions(token) WHERE expires_at > NOW();
-- Supports: Valid session lookup (excludes expired sessions)

-- Messaging: Unread messages
CREATE INDEX idx_messages_unread ON messages(recipient_id, created_at DESC)
WHERE read_at IS NULL;
-- Supports: Fetching unread messages for a user

-- ============================================================================
-- 13. MAINTENANCE
-- ============================================================================

-- PostgreSQL: Rebuild index
REINDEX INDEX idx_users_email;

-- PostgreSQL: Rebuild all indexes on a table
REINDEX TABLE users;

-- PostgreSQL: Analyze table statistics (helps query planner)
ANALYZE users;

-- MySQL: Rebuild index
ALTER TABLE users DROP INDEX idx_users_email, ADD INDEX idx_users_email(email);

-- MySQL: Analyze table
ANALYZE TABLE users;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Index Column Order Guidelines:
-- 1. Equality filters first (WHERE col = value)
-- 2. Range filters second (WHERE col > value)
-- 3. Sort columns last (ORDER BY col)
--
-- Example:
-- CREATE INDEX idx_orders ON orders(user_id, status, created_at);
-- Supports: WHERE user_id = ? AND status = ? ORDER BY created_at
--
-- Index Maintenance:
-- - Monitor index usage regularly
-- - Remove unused indexes (waste space, slow writes)
-- - Rebuild fragmented indexes
-- - Update table statistics for query planner
--
-- Trade-offs:
-- - Indexes speed up reads but slow down writes
-- - Each index consumes disk space
-- - Too many indexes can hurt performance
-- - Aim for 3-5 indexes per table (not a hard rule)
--
-- ============================================================================
