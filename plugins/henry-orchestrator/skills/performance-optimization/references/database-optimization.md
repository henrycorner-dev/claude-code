# Database Optimization

This reference provides comprehensive guidance on optimizing database performance through indexing, query optimization, connection management, and architectural patterns.

## Database Indexing

### Index Fundamentals

Indexes are data structures that improve query performance by allowing the database to find rows without scanning the entire table.

**How Indexes Work:**

- Create sorted data structure (usually B-tree)
- Trade write performance for read performance
- Consume additional storage
- Maintained automatically on INSERT/UPDATE/DELETE

**When to Index:**

- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY clauses
- Columns in GROUP BY clauses
- Foreign key columns

**When NOT to Index:**

- Small tables (< 1000 rows)
- Columns with low cardinality (few distinct values)
- Columns rarely used in queries
- Tables with heavy write workloads

### Index Types

#### B-tree Index (Default)

Most common index type. Good for equality and range queries.

**PostgreSQL:**

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

**MySQL:**

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

**Best for:**

- Equality comparisons: `WHERE email = 'user@example.com'`
- Range queries: `WHERE created_at > '2024-01-01'`
- Sorting: `ORDER BY created_at DESC`
- LIKE with prefix: `WHERE name LIKE 'John%'` (not `LIKE '%John%'`)

#### Hash Index

Fast equality lookups, no range support.

**PostgreSQL:**

```sql
CREATE INDEX idx_users_email_hash ON users USING HASH (email);
```

**Best for:**

- Exact equality: `WHERE email = 'user@example.com'`
- High cardinality columns

**Not suitable for:**

- Range queries
- ORDER BY
- Partial matches

#### Composite Index (Multi-Column)

Index on multiple columns. Column order matters.

**PostgreSQL/MySQL:**

```sql
CREATE INDEX idx_users_lastname_firstname ON users(last_name, first_name);
```

**Usage Rules:**

- Queries can use left-prefix of index
- `WHERE last_name = 'Smith'` - Uses index
- `WHERE last_name = 'Smith' AND first_name = 'John'` - Uses index
- `WHERE first_name = 'John'` - Does NOT use index
- `ORDER BY last_name, first_name` - Uses index
- `ORDER BY first_name, last_name` - Does NOT use index

**Best Practices:**

- Put most selective column first (highest cardinality)
- Exception: If queries always filter on specific column, put it first
- Consider query patterns when ordering columns

#### Partial Index (Filtered)

Index only subset of rows matching a condition.

**PostgreSQL:**

```sql
CREATE INDEX idx_orders_active ON orders(created_at)
WHERE status = 'active';
```

**MySQL (8.0+):**

```sql
-- MySQL doesn't support partial indexes directly
-- Use functional indexes or composite indexes instead
```

**Best for:**

- Queries on specific subset of data
- Reducing index size
- Improving write performance (fewer rows to index)

**Example Use Case:**

```sql
-- If 95% of orders are 'completed' and you only query 'active' orders
CREATE INDEX idx_orders_active ON orders(user_id, created_at)
WHERE status = 'active';

-- Query benefits from smaller, targeted index
SELECT * FROM orders
WHERE status = 'active' AND user_id = 123
ORDER BY created_at DESC;
```

#### Full-Text Index

Optimized for text search.

**PostgreSQL:**

```sql
CREATE INDEX idx_posts_content_fulltext ON posts
USING GIN (to_tsvector('english', content));
```

**MySQL:**

```sql
CREATE FULLTEXT INDEX idx_posts_content ON posts(content);
```

**Best for:**

- Text search queries
- Natural language search
- Multiple word searches

**Usage:**

PostgreSQL:

```sql
SELECT * FROM posts
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database & performance');
```

MySQL:

```sql
SELECT * FROM posts
WHERE MATCH(content) AGAINST('database performance' IN NATURAL LANGUAGE MODE);
```

#### Unique Index

Enforces uniqueness and creates index.

```sql
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Equivalent to
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

### Index Analysis and Optimization

#### PostgreSQL: EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';
```

**Output Interpretation:**

```
Seq Scan on users (cost=0.00..1000.00 rows=1) (actual time=0.025..15.234 rows=1 loops=1)
  Filter: (email = 'user@example.com'::text)
Planning Time: 0.123 ms
Execution Time: 15.456 ms
```

**Without Index:**

- "Seq Scan" = Full table scan (bad for large tables)
- Execution time: 15.456 ms

```
Index Scan using idx_users_email on users (cost=0.29..8.31 rows=1) (actual time=0.015..0.016 rows=1 loops=1)
  Index Cond: (email = 'user@example.com'::text)
Planning Time: 0.089 ms
Execution Time: 0.034 ms
```

**With Index:**

- "Index Scan" = Using index (good)
- Execution time: 0.034 ms (450x faster!)

#### MySQL: EXPLAIN

```sql
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';
```

**Output Interpretation:**

```
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
| id | select_type | table | type | possible_keys | key  | key_len | ref  | rows | Extra       |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
|  1 | SIMPLE      | users | ALL  | NULL          | NULL | NULL    | NULL | 1000 | Using where |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
```

**Without Index:**

- type: ALL = Full table scan
- rows: 1000 = Scanning all rows

```
+----+-------------+-------+------+------------------+------------------+---------+-------+------+-------+
| id | select_type | table | type | possible_keys    | key              | key_len | ref   | rows | Extra |
+----+-------------+-------+------+------------------+------------------+---------+-------+------+-------+
|  1 | SIMPLE      | users | ref  | idx_users_email  | idx_users_email  | 767     | const |    1 | NULL  |
+----+-------------+-------+------+------------------+------------------+---------+-------+------+-------+
```

**With Index:**

- type: ref = Index lookup (good)
- rows: 1 = Only examining 1 row

#### Finding Missing Indexes

**PostgreSQL - Unused Indexes:**

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

**PostgreSQL - Missing Indexes (Sequential Scans):**

```sql
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan AS avg_seq_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

**MySQL - Slow Queries:**

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Log queries > 1 second

-- View queries not using indexes
SELECT * FROM mysql.slow_log
WHERE sql_text NOT LIKE '%INDEX%'
ORDER BY query_time DESC
LIMIT 20;
```

## Query Optimization

### N+1 Query Problem

Common ORM anti-pattern causing excessive database queries.

**Problem:**

```javascript
// BAD: N+1 queries
const users = await User.findAll(); // 1 query

for (const user of users) {
  const posts = await Post.findAll({ where: { userId: user.id } }); // N queries
  console.log(user.name, posts.length);
}
// Total: 1 + N queries (if 100 users = 101 queries)
```

**Solution 1: Eager Loading**

```javascript
// GOOD: 2 queries with eager loading
const users = await User.findAll({
  include: [{ model: Post }],
});

for (const user of users) {
  console.log(user.name, user.Posts.length);
}
// Total: 2 queries (users + all posts)
```

**Solution 2: Manual JOIN**

```sql
-- Single query with JOIN
SELECT
  users.id,
  users.name,
  COUNT(posts.id) AS post_count
FROM users
LEFT JOIN posts ON posts.user_id = users.id
GROUP BY users.id, users.name;
```

### SELECT \* Anti-Pattern

**Problem:**

```sql
-- BAD: Fetching unnecessary columns
SELECT * FROM users;
```

**Why Bad:**

- Increases data transfer size
- Slower query execution
- More memory usage
- Can't use covering indexes

**Solution:**

```sql
-- GOOD: Select only needed columns
SELECT id, email, name FROM users;
```

### Covering Index Optimization

Index that includes all columns needed by query. Database can answer query from index alone without accessing table.

**Example:**

```sql
-- Query
SELECT user_id, created_at FROM orders
WHERE status = 'active'
ORDER BY created_at DESC;

-- Regular index (not covering)
CREATE INDEX idx_orders_status ON orders(status);
-- Still needs to access table for user_id and created_at

-- Covering index
CREATE INDEX idx_orders_status_covering ON orders(status, created_at, user_id);
-- Can answer query from index alone (much faster)
```

**PostgreSQL INCLUDE (12+):**

```sql
CREATE INDEX idx_orders_status_covering ON orders(status, created_at)
INCLUDE (user_id);
```

### Avoid Functions on Indexed Columns

**Problem:**

```sql
-- BAD: Function on indexed column prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
```

**Solution 1: Store Lowercase**

```sql
-- Store email in lowercase when inserting
INSERT INTO users (email) VALUES (LOWER('User@Example.com'));

-- Query without function
SELECT * FROM users WHERE email = 'user@example.com';
```

**Solution 2: Functional/Expression Index**

```sql
-- PostgreSQL
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Now this uses index
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
```

### Limit and Offset Performance

**Problem:**

```sql
-- BAD: Large offset is slow
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100000;
-- Database must scan 100,020 rows to skip 100,000
```

**Solution: Cursor-Based Pagination**

```sql
-- First page
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;
-- Returns rows with created_at down to '2024-01-15 10:00:00'

-- Next page (using cursor)
SELECT * FROM posts
WHERE created_at < '2024-01-15 10:00:00'
ORDER BY created_at DESC
LIMIT 20;
-- Only scans 20 rows (much faster)
```

**Implementation:**

```javascript
// First page
const firstPage = await db.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT ?', [20]);
const cursor = firstPage[firstPage.length - 1].created_at;

// Next page
const nextPage = await db.query(
  'SELECT * FROM posts WHERE created_at < ? ORDER BY created_at DESC LIMIT ?',
  [cursor, 20]
);
```

### Batch Operations

**Problem:**

```javascript
// BAD: N individual queries
for (const user of users) {
  await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
}
```

**Solution:**

```javascript
// GOOD: Single batch insert
const values = users.map(u => [u.name, u.email]);
await db.query('INSERT INTO users (name, email) VALUES ?', [values]);
```

**PostgreSQL Bulk Insert:**

```sql
INSERT INTO users (name, email) VALUES
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Bob Johnson', 'bob@example.com');
```

**PostgreSQL COPY (fastest for large datasets):**

```sql
COPY users (name, email) FROM '/path/to/users.csv' CSV HEADER;
```

## Connection Pooling

Reusing database connections instead of creating new ones for each query.

### Why Connection Pooling Matters

**Without Pooling:**

1. Application makes request
2. Create new DB connection (TCP handshake, authentication) - ~50-100ms
3. Execute query - ~10ms
4. Close connection
5. Total: ~60-110ms per request

**With Pooling:**

1. Application makes request
2. Get existing connection from pool - ~1ms
3. Execute query - ~10ms
4. Return connection to pool
5. Total: ~11ms per request (5-10x faster)

### Node.js Connection Pooling

**PostgreSQL (pg):**

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20, // Maximum pool size
  min: 5, // Minimum pool size
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout if can't get connection
});

// Use pool
async function getUser(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// Cleanup on shutdown
process.on('SIGTERM', () => {
  pool.end();
});
```

**MySQL (mysql2):**

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  database: 'mydb',
  user: 'user',
  password: 'password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function getUser(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}
```

### Python Connection Pooling

**PostgreSQL (psycopg2):**

```python
from psycopg2 import pool

connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=20,
    host='localhost',
    database='mydb',
    user='user',
    password='password'
)

def get_user(user_id):
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        return cursor.fetchone()
    finally:
        connection_pool.putconn(conn)
```

**Django (built-in):**

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydb',
        'HOST': 'localhost',
        'USER': 'user',
        'PASSWORD': 'password',
        'CONN_MAX_AGE': 600,  # Keep connections open for 10 minutes
        'OPTIONS': {
            'MAX_CONNS': 20,
        }
    }
}
```

### Pool Size Tuning

**Formula:**

```
connections = ((core_count * 2) + effective_spindle_count)
```

**Example:**

- 4 CPU cores
- 1 disk (SSD = 1, HDD = actual spindles)
- Optimal pool size: (4 \* 2) + 1 = 9 connections

**Guidelines:**

- Start conservative (10-20 connections)
- Monitor pool exhaustion
- Increase gradually if needed
- More connections ≠ better performance
- Too many connections causes contention

## Read Replicas and Sharding

### Read Replicas

Distribute read load across multiple database instances.

**Architecture:**

```
Primary DB (writes) ──┐
                      ├──> Replication ──> Replica 1 (reads)
                      └──> Replication ──> Replica 2 (reads)
```

**Implementation:**

```javascript
const primaryPool = new Pool({ host: 'primary.db.com', max: 10 });
const replicaPool = new Pool({ host: 'replica.db.com', max: 20 });

async function getUser(id) {
  // Read from replica
  const result = await replicaPool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateUser(id, data) {
  // Write to primary
  await primaryPool.query('UPDATE users SET name = $1 WHERE id = $2', [data.name, id]);
}
```

**Considerations:**

- Replication lag (eventual consistency)
- Read-after-write consistency issues
- Failover strategies

### Sharding

Partition data across multiple databases.

**Horizontal Sharding (by user_id):**

```javascript
function getShardForUser(userId) {
  const shardCount = 4;
  return userId % shardCount;
}

const shards = [
  new Pool({ host: 'shard0.db.com' }),
  new Pool({ host: 'shard1.db.com' }),
  new Pool({ host: 'shard2.db.com' }),
  new Pool({ host: 'shard3.db.com' }),
];

async function getUser(userId) {
  const shard = getShardForUser(userId);
  const result = await shards[shard].query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}
```

**Considerations:**

- Cross-shard queries are expensive
- Rebalancing difficulty
- Increased complexity

## Query Caching

### Database-Level Query Caching

**MySQL Query Cache (deprecated in 8.0):**

```sql
-- Don't rely on this - removed in MySQL 8.0
SET GLOBAL query_cache_size = 1048576;
```

**PostgreSQL Shared Buffers:**

```sql
-- postgresql.conf
shared_buffers = 256MB  # Cache frequently accessed data
```

### Application-Level Query Caching

More reliable and flexible than DB-level caching.

```javascript
const redis = require('redis');
const client = redis.createClient();

async function getUser(id) {
  const cacheKey = `user:${id}`;

  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query database
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  const user = result.rows[0];

  // Cache result
  await client.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}
```

## Monitoring and Profiling

### PostgreSQL Statistics

**Enable pg_stat_statements:**

```sql
-- postgresql.conf
shared_preload_libraries = 'pg_stat_statements'

-- Create extension
CREATE EXTENSION pg_stat_statements;

-- View slowest queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Table Statistics:**

```sql
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC;
```

### MySQL Performance Schema

**Enable Performance Schema:**

```sql
-- my.cnf
performance_schema = ON

-- View slowest statements
SELECT
  DIGEST_TEXT,
  COUNT_STAR,
  AVG_TIMER_WAIT / 1000000000 AS avg_ms,
  SUM_TIMER_WAIT / 1000000000 AS total_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 20;
```

## Best Practices Summary

**Indexing:**

- Index columns used in WHERE, JOIN, ORDER BY
- Use composite indexes thoughtfully (column order matters)
- Monitor index usage, remove unused indexes
- Don't over-index (impacts write performance)
- Use covering indexes when possible

**Query Optimization:**

- Avoid SELECT \*
- Prevent N+1 queries (eager loading)
- Use batch operations
- Avoid functions on indexed columns
- Use cursor-based pagination for large offsets

**Connection Management:**

- Always use connection pooling
- Tune pool size based on workload
- Monitor pool exhaustion
- Close connections on shutdown

**Caching:**

- Cache expensive queries at application level
- Set appropriate TTLs
- Invalidate cache on writes
- Monitor cache hit rates

**Monitoring:**

- Enable query logging
- Track slow queries
- Monitor index usage
- Profile query execution plans
- Set up alerts for anomalies

Focus on measuring first, then optimizing based on data. The biggest gains often come from adding a single well-placed index.
