# Query Optimization

This reference provides deep dive into query optimization, execution plans, and performance tuning for SQL databases.

## Table of Contents

1. [Understanding Query Execution](#understanding-query-execution)
2. [Reading EXPLAIN Plans](#reading-explain-plans)
3. [Index Optimization](#index-optimization)
4. [Query Patterns and Anti-Patterns](#query-patterns-and-anti-patterns)
5. [Join Optimization](#join-optimization)
6. [Subquery Optimization](#subquery-optimization)
7. [Pagination Strategies](#pagination-strategies)
8. [Aggregate Optimization](#aggregate-optimization)
9. [Full-Text Search](#full-text-search)
10. [Database-Specific Optimizations](#database-specific-optimizations)

---

## Understanding Query Execution

### Query Processing Pipeline

1. **Parsing:** SQL string → parse tree
2. **Analysis:** Validate tables, columns, types
3. **Rewrite:** Apply rules, simplify
4. **Planning:** Generate execution plans, estimate costs
5. **Execution:** Run the chosen plan
6. **Return results**

### Cost-Based Optimization

Database chooses plan with lowest estimated cost based on:

- Table size (number of rows)
- Index availability
- Data distribution (statistics)
- Memory available
- CPU cost estimates

**Update statistics regularly:**

```sql
-- PostgreSQL
ANALYZE users;

-- MySQL
ANALYZE TABLE users;
```

---

## Reading EXPLAIN Plans

### PostgreSQL EXPLAIN

**Basic EXPLAIN:**

```sql
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
```

**Output:**

```
Seq Scan on users  (cost=0.00..35.50 rows=10 width=100)
  Filter: (email = 'john@example.com'::text)
```

**EXPLAIN ANALYZE (actually runs query):**

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';
```

**Output:**

```
Seq Scan on users  (cost=0.00..35.50 rows=10 width=100) (actual time=0.015..0.234 rows=1 loops=1)
  Filter: (email = 'john@example.com'::text)
  Rows Removed by Filter: 999
Planning Time: 0.123 ms
Execution Time: 0.345 ms
```

### Key Metrics to Watch

**Cost:** Estimated expense (lower is better)

```
(cost=0.00..35.50 rows=10 width=100)
       ^start ^end  ^estimated rows  ^avg row size
```

**Actual time:** Real execution time (with ANALYZE)

```
(actual time=0.015..0.234 rows=1 loops=1)
             ^first row  ^last row  ^actual rows  ^iterations
```

**Rows Removed:** Wasted work (should be low)

```
Rows Removed by Filter: 999  -- BAD: scanned 1000 rows, kept 1
```

### Common Plan Nodes

**Seq Scan:** Full table scan (potentially slow)

```
Seq Scan on users  -- Scans every row
```

**Index Scan:** Uses index (usually fast)

```
Index Scan using idx_users_email on users
```

**Index Only Scan:** Satisfies query from index alone (very fast)

```
Index Only Scan using idx_users_email on users
```

**Bitmap Index Scan:** Uses index for multiple conditions

```
Bitmap Heap Scan on users
  Recheck Cond: ((status = 'active') AND (created_at > '2024-01-01'))
  -> BitmapAnd
       -> Bitmap Index Scan on idx_users_status
       -> Bitmap Index Scan on idx_users_created_at
```

**Nested Loop:** For each row in outer, scan inner (good for small datasets)

```
Nested Loop
  -> Seq Scan on users
  -> Index Scan using idx_posts_user_id on posts
```

**Hash Join:** Build hash table, probe (good for larger datasets)

```
Hash Join
  Hash Cond: (posts.user_id = users.id)
  -> Seq Scan on posts
  -> Hash
       -> Seq Scan on users
```

**Merge Join:** Sort both sides, merge (good for pre-sorted data)

```
Merge Join
  Merge Cond: (users.id = posts.user_id)
  -> Index Scan using users_pkey on users
  -> Index Scan using idx_posts_user_id on posts
```

### Red Flags in EXPLAIN

- **Sequential Scans on large tables:** Add index
- **High "Rows Removed by Filter":** Improve WHERE clause
- **Nested Loop on large datasets:** Consider hash join
- **Large difference between estimated and actual rows:** Update statistics
- **Multiple sorts:** Consider composite indexes

---

## Index Optimization

### Index Types

**B-tree (default):** Most common, supports ordering

```sql
CREATE INDEX idx_users_email ON users(email);
```

**Use for:**

- Equality: `WHERE email = 'x'`
- Range: `WHERE created_at > '2024-01-01'`
- Sorting: `ORDER BY created_at`
- Pattern matching: `WHERE name LIKE 'John%'`

**Hash:** Equality only, slightly faster

```sql
CREATE INDEX idx_users_email ON users USING hash (email);
```

**Use for:**

- Equality only: `WHERE email = 'x'`
- Not useful for ranges or sorting

**GIN (Generalized Inverted Index):** For arrays, JSONB, full-text

```sql
CREATE INDEX idx_users_tags ON users USING gin (tags);
```

**Use for (PostgreSQL):**

- Arrays: `WHERE tags @> ARRAY['admin']`
- JSONB: `WHERE metadata @> '{"premium": true}'`
- Full-text: `WHERE to_tsvector(content) @@ to_tsquery('database')`

**GiST (Generalized Search Tree):** For geometric data, ranges

```sql
CREATE INDEX idx_events_date_range ON events USING gist (date_range);
```

**Partial Index:** Index subset of rows

```sql
CREATE INDEX idx_users_active_email ON users(email) WHERE deleted_at IS NULL;
```

**Use for:**

- Queries that always filter on same condition
- Smaller index size
- Faster updates (only updates matching rows)

**Composite Index:** Multiple columns

```sql
CREATE INDEX idx_users_status_created ON users(status, created_at);
```

**Column order matters:**

- Put equality conditions first
- Put range conditions last
- Consider query patterns

### When Database Uses an Index

**Selectivity matters:** Index is used when it filters out most rows.

```sql
-- Good: Selective (0.01% of rows)
SELECT * FROM users WHERE email = 'rare@example.com';
-- Uses index

-- Bad: Not selective (50% of rows)
SELECT * FROM users WHERE gender = 'male';
-- May skip index, use seq scan
```

**Rule of thumb:** Index is beneficial when selecting <5-10% of rows.

### Composite Index Strategy

**Query:**

```sql
SELECT * FROM orders
WHERE status = 'pending' AND created_at > '2024-01-01'
ORDER BY created_at DESC;
```

**Index options:**

**Option 1: status, created_at**

```sql
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

- Efficiently filters by status
- Then filters by created_at
- Can use index for sorting

**Option 2: created_at, status**

```sql
CREATE INDEX idx_orders_created_status ON orders(created_at, status);
```

- Filters by created_at range
- Then filters by status
- Can use index for sorting

**Best choice:** Option 1 (equality before range).

### Index Maintenance

**Unused indexes waste space and slow writes:**

**Find unused indexes (PostgreSQL):**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Drop unused index:**

```sql
DROP INDEX idx_users_old_field;
```

---

## Query Patterns and Anti-Patterns

### N+1 Query Problem

**Anti-pattern:**

```ruby
# Loads posts (1 query)
posts = Post.all

# Loads user for each post (N queries)
posts.each do |post|
  puts post.user.name  # SELECT * FROM users WHERE id = ?
end
# Total: 1 + N queries
```

**Solution 1: JOIN**

```sql
SELECT posts.*, users.name
FROM posts
JOIN users ON posts.user_id = users.id;
```

**Solution 2: Eager loading (ORM)**

```ruby
posts = Post.includes(:user).all
# SELECT * FROM posts
# SELECT * FROM users WHERE id IN (1,2,3,...)
# Total: 2 queries
```

### SELECT \*

**Anti-pattern:**

```sql
SELECT * FROM users;  -- Fetches all columns
```

**Problems:**

- Network overhead for unused columns
- Prevents index-only scans
- Breaks when schema changes

**Solution:**

```sql
SELECT id, username, email FROM users;  -- Only what you need
```

### OR Conditions on Different Columns

**Anti-pattern:**

```sql
SELECT * FROM users
WHERE username = 'john' OR email = 'john@example.com';
-- Can't efficiently use indexes
```

**Solution: UNION**

```sql
SELECT * FROM users WHERE username = 'john'
UNION
SELECT * FROM users WHERE email = 'john@example.com';
-- Each query can use its own index
```

### NOT IN with Subquery

**Anti-pattern:**

```sql
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM banned_users);
-- Slow, doesn't handle NULLs correctly
```

**Solution: NOT EXISTS**

```sql
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM banned_users b WHERE b.user_id = u.id
);
-- Faster, handles NULLs correctly
```

**Alternative: LEFT JOIN**

```sql
SELECT u.* FROM users u
LEFT JOIN banned_users b ON u.id = b.user_id
WHERE b.user_id IS NULL;
```

### Using Functions in WHERE

**Anti-pattern:**

```sql
SELECT * FROM users
WHERE LOWER(email) = 'john@example.com';
-- Can't use index on email
```

**Solution 1: Functional index**

```sql
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
```

**Solution 2: Store lowercase**

```sql
-- Store email in lowercase
UPDATE users SET email = LOWER(email);
-- Now can use regular index
SELECT * FROM users WHERE email = 'john@example.com';
```

---

## Join Optimization

### Join Strategies

**Nested Loop:** For each outer row, scan inner

```
Nested Loop  (cost=0.29..24.62 rows=10 width=16)
  -> Seq Scan on users  (cost=0.00..10.70 rows=10 width=8)
  -> Index Scan using posts_user_id_idx on posts
       (cost=0.29..1.38 rows=1 width=8)
```

**Good when:**

- Small outer table
- Inner table has index on join key
- High selectivity

**Hash Join:** Build hash table from smaller table, probe with larger

```
Hash Join  (cost=25.88..67.73 rows=1000 width=16)
  Hash Cond: (posts.user_id = users.id)
  -> Seq Scan on posts  (cost=0.00..15.00 rows=1000 width=8)
  -> Hash  (cost=10.70..10.70 rows=10 width=8)
        -> Seq Scan on users  (cost=0.00..10.70 rows=10 width=8)
```

**Good when:**

- Medium to large tables
- No suitable indexes
- Enough memory for hash table

**Merge Join:** Sort both tables, merge

```
Merge Join  (cost=69.83..94.13 rows=1000 width=16)
  Merge Cond: (users.id = posts.user_id)
  -> Index Scan using users_pkey on users
  -> Index Scan using posts_user_id_idx on posts
```

**Good when:**

- Both inputs already sorted (indexes)
- Large tables
- Low memory

### Join Order Matters

**Bad order (large intermediate result):**

```sql
SELECT * FROM
    large_table_a (1M rows)
    JOIN large_table_b (1M rows) ON a.id = b.id
    JOIN small_table_c (100 rows) ON b.c_id = c.id
WHERE c.status = 'active';  -- Filters to 10 rows
-- Joins 1M x 1M first, then filters
```

**Good order (filter early):**

```sql
SELECT * FROM
    small_table_c (100 rows)
    JOIN large_table_b ON c.id = b.c_id
    JOIN large_table_a ON b.id = a.id
WHERE c.status = 'active';  -- Filters to 10 rows
-- Filters to 10 rows first, then joins
```

**Database optimizer usually handles this, but can help with:**

- Subqueries
- CTEs (sometimes not optimized across)
- Complex multi-table joins

### Index for Joins

**Always index foreign keys:**

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
);

-- Add index!
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**Without index:**

```
Hash Join  (cost=35.00..125.00 rows=1000 width=16)
  -> Seq Scan on posts  -- Full table scan
```

**With index:**

```
Nested Loop  (cost=0.29..24.62 rows=1000 width=16)
  -> Seq Scan on users
  -> Index Scan using idx_posts_user_id on posts  -- Fast lookup
```

---

## Subquery Optimization

### Correlated vs Non-Correlated Subqueries

**Non-correlated (runs once):**

```sql
SELECT * FROM users
WHERE id IN (SELECT user_id FROM posts WHERE created_at > '2024-01-01');
-- Subquery runs once
```

**Correlated (runs for each row):**

```sql
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM posts p
    WHERE p.user_id = u.id AND p.created_at > '2024-01-01'
);
-- Subquery runs for each user
```

### Convert Subquery to JOIN

**Subquery:**

```sql
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);
```

**JOIN (often faster):**

```sql
SELECT DISTINCT users.* FROM users
JOIN orders ON users.id = orders.user_id
WHERE orders.total > 1000;
```

### EXISTS vs IN

**EXISTS (usually faster):**

```sql
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
-- Stops at first match
```

**IN (can be slower):**

```sql
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);
-- May build entire list
```

**Rule:** Use EXISTS for existence checks, IN for small constant lists.

### Lateral Joins (PostgreSQL)

Get top N related rows for each outer row.

**Get 3 latest posts per user:**

```sql
SELECT u.username, p.title, p.created_at
FROM users u
CROSS JOIN LATERAL (
    SELECT title, created_at
    FROM posts
    WHERE user_id = u.id
    ORDER BY created_at DESC
    LIMIT 3
) p;
```

---

## Pagination Strategies

### OFFSET/LIMIT (Simple but Slow)

**Query:**

```sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
```

**Problem:** Database scans and discards first 10,000 rows.

**Performance:**

- Page 1: Fast
- Page 100: Slow
- Page 10000: Very slow

### Cursor-Based Pagination (Keyset)

**Use last seen value as cursor:**

**First page:**

```sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;
-- Returns posts with created_at from 2024-01-31 to 2024-01-20
-- Last seen: 2024-01-20 10:30:00
```

**Next page:**

```sql
SELECT * FROM posts
WHERE created_at < '2024-01-20 10:30:00'
ORDER BY created_at DESC LIMIT 20;
```

**Pros:**

- Consistent performance (no offset)
- Works with infinite scroll

**Cons:**

- Can't jump to arbitrary page
- Requires stable sort key

### Pagination with Composite Keys

**For non-unique sort columns:**

```sql
SELECT * FROM posts
WHERE (created_at, id) < ('2024-01-20 10:30:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Requires composite index
CREATE INDEX idx_posts_created_id ON posts(created_at DESC, id DESC);
```

---

## Aggregate Optimization

### COUNT(\*)

**Slow on large tables:**

```sql
SELECT COUNT(*) FROM users;
-- PostgreSQL: Full table scan (MVCC)
```

**Approximate count (PostgreSQL):**

```sql
SELECT reltuples::bigint FROM pg_class WHERE relname = 'users';
-- Fast, approximate
```

**Cached count:**

```sql
-- Maintain counter table
CREATE TABLE table_counts (
    table_name VARCHAR(50) PRIMARY KEY,
    row_count BIGINT
);

-- Update via trigger
CREATE OR REPLACE FUNCTION update_user_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE table_counts SET row_count = row_count + 1
        WHERE table_name = 'users';
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE table_counts SET row_count = row_count - 1
        WHERE table_name = 'users';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### GROUP BY Optimization

**Slow:**

```sql
SELECT user_id, COUNT(*) FROM posts GROUP BY user_id;
-- Sequential scan, in-memory hash aggregate
```

**Fast:**

```sql
-- Add index on grouped column
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Query can use index
SELECT user_id, COUNT(*) FROM posts GROUP BY user_id;
```

**Covering index for aggregates:**

```sql
-- Index includes aggregated column
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Query can use index-only scan
SELECT user_id, COUNT(*) FROM posts
WHERE status = 'published'
GROUP BY user_id;
```

### Materialized Views

Pre-compute expensive aggregates.

**Create materialized view:**

```sql
CREATE MATERIALIZED VIEW user_post_counts AS
SELECT user_id, COUNT(*) as post_count
FROM posts
GROUP BY user_id;

CREATE INDEX idx_user_post_counts_user ON user_post_counts(user_id);
```

**Query (fast):**

```sql
SELECT * FROM user_post_counts WHERE user_id = 123;
```

**Refresh (periodically):**

```sql
REFRESH MATERIALIZED VIEW user_post_counts;
```

**Concurrent refresh (PostgreSQL):**

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY user_post_counts;
-- Requires unique index
```

---

## Full-Text Search

### PostgreSQL to_tsvector

**Basic full-text search:**

```sql
SELECT * FROM posts
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database');
```

**Add GIN index:**

```sql
CREATE INDEX idx_posts_content_fts ON posts
USING gin(to_tsvector('english', content));
```

**Query with index:**

```sql
SELECT * FROM posts
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database & (design | optimization)');
```

**Stored tsvector column (faster):**

```sql
ALTER TABLE posts ADD COLUMN content_tsv tsvector;

UPDATE posts SET content_tsv = to_tsvector('english', content);

CREATE INDEX idx_posts_content_tsv ON posts USING gin(content_tsv);

-- Trigger to keep updated
CREATE TRIGGER posts_content_tsv_update BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(content_tsv, 'pg_catalog.english', content);
```

### MySQL Full-Text Search

**Create full-text index:**

```sql
ALTER TABLE posts ADD FULLTEXT INDEX idx_posts_content (content);
```

**Query:**

```sql
SELECT * FROM posts
WHERE MATCH(content) AGAINST('database' IN NATURAL LANGUAGE MODE);
```

**Boolean mode:**

```sql
SELECT * FROM posts
WHERE MATCH(content) AGAINST('+database -mysql' IN BOOLEAN MODE);
```

---

## Database-Specific Optimizations

### PostgreSQL

**Parallel queries:**

```sql
-- Enable parallel workers
SET max_parallel_workers_per_gather = 4;

-- Query uses parallel seq scan
EXPLAIN SELECT COUNT(*) FROM large_table;
```

**Partition tables:**

```sql
CREATE TABLE events (
    id SERIAL,
    event_type VARCHAR(50),
    created_at DATE
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024_01 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE events_2024_02 PARTITION OF events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

**BRIN indexes (block range indexes):**

```sql
-- For large, naturally ordered tables
CREATE INDEX idx_logs_created ON logs USING brin(created_at);
-- Much smaller than B-tree
```

### MySQL

**Use EXPLAIN FORMAT=JSON:**

```sql
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE email = 'john@example.com'\G
```

**Query cache (MySQL 5.7 and earlier):**

```sql
-- Check cache status
SHOW VARIABLES LIKE 'query_cache%';

-- Disable cache for query
SELECT SQL_NO_CACHE * FROM users;
```

**Index hints:**

```sql
-- Force index usage
SELECT * FROM users FORCE INDEX (idx_users_email) WHERE email = 'john@example.com';
```

---

## Performance Monitoring

### Slow Query Log

**PostgreSQL:**

```sql
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
SELECT pg_reload_conf();

-- View logs
tail -f /var/log/postgresql/postgresql-*.log
```

**MySQL:**

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries > 1s

-- View logs
tail -f /var/log/mysql/slow.log
```

### Query Statistics

**PostgreSQL pg_stat_statements:**

```sql
-- Enable extension
CREATE EXTENSION pg_stat_statements;

-- Top 10 slowest queries
SELECT
    calls,
    total_exec_time,
    mean_exec_time,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Summary

**Optimization Checklist:**

- [ ] Analyze slow queries with EXPLAIN ANALYZE
- [ ] Add indexes on WHERE, JOIN, ORDER BY columns
- [ ] Use composite indexes for multi-column queries
- [ ] Avoid SELECT \*, fetch only needed columns
- [ ] Fix N+1 queries with joins or eager loading
- [ ] Use cursor-based pagination for large offsets
- [ ] Pre-compute expensive aggregates
- [ ] Update table statistics regularly
- [ ] Monitor slow query logs
- [ ] Remove unused indexes
- [ ] Consider materialized views for reporting
- [ ] Use appropriate index types (B-tree, GIN, hash)

Refer to this guide when diagnosing and optimizing slow database queries.
