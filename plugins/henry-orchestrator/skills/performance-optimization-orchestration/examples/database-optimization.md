# Database Optimization - Complete Example

This example demonstrates database and API performance optimization using Henry Orchestrator's quality agents.

## Scenario

**Company**: SaaS platform "DataFlow"
**Problem**: API response times degrading, database queries taking too long, affecting user experience
**Goal**: Reduce API response time from 2.5s to <500ms (80% improvement)

## Initial State

### Performance Metrics (Baseline)

```
API Performance:
- Average response time: 2.5s
- 95th percentile: 4.8s
- 99th percentile: 8.2s
- Throughput: 45 requests/second
- Error rate: 2.3%

Database Performance:
- Average query time: 1.8s
- Slowest queries: 5-12s
- Connection pool utilization: 92% (near saturation)
- Query cache hit rate: 12%
- Index usage: 38%

Server Resources:
- CPU: 78% average, 95% peak
- Memory: 11GB / 16GB used
- Disk I/O: High (sustained writes)
- Network: 45% utilization
```

### Business Impact

```
Current State:
- User complaints: 45/week about slow dashboard
- Support tickets: 78/week related to timeouts
- Churn rate: 8.5% monthly
- NPS score: 42 (Detractors cite performance)

Projected with optimization:
- User complaints: <10/week (78% reduction)
- Support tickets: <20/week (74% reduction)
- Churn rate: 6.5% (24% improvement)
- NPS score: 60+ (target: Promoters)
```

## Phase 1: Diagnosis

### Step 1: Performance Analysis

**Command**:
```bash
/henry-orchestrator:henry-team performance-engineer backend-engineer - Analyze API and database performance bottlenecks
```

**performance-engineer findings**:
```markdown
## Performance Diagnosis Report

### Top 5 Slow API Endpoints

1. **GET /api/dashboard** - 3.2s average
   - Calls: 15 database queries
   - N+1 query problem detected
   - No caching
   - Returns 450KB response (uncompressed)

2. **GET /api/users/:id/activity** - 2.8s average
   - Full table scan on activities table (2.5M rows)
   - No pagination
   - Returns all historical data

3. **POST /api/reports/generate** - 8.5s average
   - Synchronous report generation
   - Complex aggregation queries (12s)
   - No query optimization

4. **GET /api/search** - 2.1s average
   - No search index
   - LIKE queries on multiple columns
   - No result caching

5. **GET /api/analytics** - 4.6s average
   - Real-time calculation of metrics
   - Joins across 8 tables
   - No materialized views
```

**backend-engineer findings**:
```markdown
## Database Analysis

### Problematic Queries

**Query 1: Dashboard data (N+1)**
```sql
-- Executed 15 times per request
SELECT * FROM users WHERE id = ?;  -- 1 time
SELECT * FROM projects WHERE user_id = ?;  -- N times (for each user)
SELECT * FROM tasks WHERE project_id = ?;  -- N times (for each project)
```
Impact: 15 queries × 120ms = 1.8s
Solution: JOIN queries to reduce roundtrips

**Query 2: User activity (Full table scan)**
```sql
-- No WHERE clause limit, no index on user_id
SELECT * FROM activities WHERE user_id = ?;
```
Query Plan: Seq Scan on activities (cost=0.00..45000.00 rows=2500000)
Impact: 2.5s for full table scan
Solution: Add index on user_id, implement pagination

**Query 3: Search (LIKE on multiple columns)**
```sql
SELECT * FROM documents
WHERE title LIKE '%keyword%'
   OR content LIKE '%keyword%'
   OR author LIKE '%keyword%';
```
Query Plan: Seq Scan (cannot use index with leading wildcard)
Impact: 1.8s for 500K rows
Solution: Full-text search index (PostgreSQL: `tsvector`, MySQL: `FULLTEXT`)

### Schema Issues

**Missing Indexes**:
- activities.user_id (2.5M rows, frequently queried)
- tasks.project_id (800K rows)
- documents.created_at (for date range queries)
- reports.status (for filtering)

**Inefficient Data Types**:
- VARCHAR(255) for fields that are always small (e.g., status: 'pending', 'complete')
- TEXT for large JSON blobs (should use JSONB in PostgreSQL)
- No partitioning on large time-series tables

**Connection Pool**:
- Max connections: 100
- Active connections: 92 average
- Idle in transaction: 15 (wasting connections)
- Long-running queries blocking connections
```

### Step 2: Create Optimization Plan

**Prioritized by Impact × Effort**:

**High Impact, Low Effort (Sprint 1)**:
1. Fix N+1 queries with JOINs
2. Add missing indexes
3. Implement API response caching
4. Add pagination to large result sets

**High Impact, Medium Effort (Sprint 2)**:
5. Implement full-text search indexes
6. Add query result caching (Redis)
7. Optimize connection pool settings
8. Compress API responses

**Medium Impact, High Effort (Sprint 3)**:
9. Implement materialized views for analytics
10. Async processing for report generation
11. Database table partitioning
12. Query optimization (rewrite complex queries)

## Phase 2: Implementation

### Sprint 1: Quick Wins

#### Fix N+1 Queries

**Before**:
```javascript
// N+1 query problem
async function getDashboard(userId) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

  const projects = await db.query('SELECT * FROM projects WHERE user_id = ?', [userId]);

  for (const project of projects) {
    // N queries
    project.tasks = await db.query('SELECT * FROM tasks WHERE project_id = ?', [project.id]);
  }

  return {user, projects};
}
// Result: 1 + 1 + N queries = 1 + 1 + 12 = 14 queries, ~1.8s
```

**After**:
```javascript
// Single query with JOINs
async function getDashboard(userId) {
  const results = await db.query(`
    SELECT
      u.*,
      p.id as project_id,
      p.name as project_name,
      p.created_at as project_created_at,
      t.id as task_id,
      t.title as task_title,
      t.status as task_status,
      t.due_date as task_due_date
    FROM users u
    LEFT JOIN projects p ON p.user_id = u.id
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE u.id = ?
  `, [userId]);

  // Transform flat results into nested structure
  const dashboard = {
    user: {
      id: results[0].id,
      name: results[0].name,
      email: results[0].email,
    },
    projects: [],
  };

  const projectsMap = new Map();

  for (const row of results) {
    if (row.project_id && !projectsMap.has(row.project_id)) {
      projectsMap.set(row.project_id, {
        id: row.project_id,
        name: row.project_name,
        created_at: row.project_created_at,
        tasks: [],
      });
    }

    if (row.task_id) {
      projectsMap.get(row.project_id).tasks.push({
        id: row.task_id,
        title: row.task_title,
        status: row.task_status,
        due_date: row.task_due_date,
      });
    }
  }

  dashboard.projects = Array.from(projectsMap.values());

  return dashboard;
}
// Result: 1 query, ~180ms (90% improvement)
```

**Alternative: Use ORM with eager loading**:
```javascript
// Using Sequelize with eager loading
async function getDashboard(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Project,
        include: [Task],
      },
    ],
  });

  return user;
}
// Sequelize generates optimized JOIN query
```

#### Add Missing Indexes

**Analysis**:
```sql
-- Identify missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100  -- High cardinality columns
ORDER BY abs(correlation) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Unused indexes (candidates for removal)
ORDER BY idx_tup_read DESC;
```

**Migration**:
```sql
-- Add indexes for frequent queries
CREATE INDEX CONCURRENTLY idx_activities_user_id ON activities(user_id);
CREATE INDEX CONCURRENTLY idx_activities_created_at ON activities(created_at);
CREATE INDEX CONCURRENTLY idx_tasks_project_id ON tasks(project_id);
CREATE INDEX CONCURRENTLY idx_tasks_status ON tasks(status);
CREATE INDEX CONCURRENTLY idx_documents_created_at ON documents(created_at);

-- Composite index for common query patterns
CREATE INDEX CONCURRENTLY idx_activities_user_created
  ON activities(user_id, created_at DESC);

-- Partial index for common filters
CREATE INDEX CONCURRENTLY idx_tasks_active
  ON tasks(project_id, status)
  WHERE status IN ('pending', 'in_progress');

-- Remove unused indexes
DROP INDEX idx_old_unused_column;
```

**Results**:
```
Query: SELECT * FROM activities WHERE user_id = 123 LIMIT 50

Before:
  Seq Scan on activities (cost=0.00..45000.00 rows=2500000 width=100)
  Time: 2480ms

After:
  Index Scan using idx_activities_user_id (cost=0.42..8.44 rows=50 width=100)
  Time: 12ms

Improvement: 99.5% faster ✓
```

#### Implement API Response Caching

**Before**:
```javascript
// No caching
app.get('/api/dashboard', async (req, res) => {
  const dashboard = await getDashboard(req.user.id);
  res.json(dashboard);
});
// Every request hits database
```

**After**:
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const cacheKey = `cache:${req.path}:${req.user.id}`;

  try {
    const cached = await client.get(cacheKey);

    if (cached) {
      console.log('Cache HIT:', cacheKey);
      return res.json(JSON.parse(cached));
    }

    console.log('Cache MISS:', cacheKey);

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Cache for 5 minutes
      client.setex(cacheKey, 300, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.error('Cache error:', err);
    next(); // Continue without cache on error
  }
}

app.get('/api/dashboard', cacheMiddleware, async (req, res) => {
  const dashboard = await getDashboard(req.user.id);
  res.json(dashboard);
});

// Invalidate cache on data changes
app.post('/api/tasks', async (req, res) => {
  const task = await createTask(req.body);

  // Invalidate user's dashboard cache
  await client.del(`cache:/api/dashboard:${req.user.id}`);

  res.json(task);
});
```

**Results**:
```
Dashboard API:
- Cache HIT: 12ms (cached response)
- Cache MISS: 180ms (database query + cache write)
- Cache hit rate: 78% (typical usage pattern)
- Average response time: (0.78 × 12ms) + (0.22 × 180ms) = 49ms

Improvement: 98% faster (2.5s → 49ms avg) ✓
```

#### Add Pagination

**Before**:
```javascript
// Returns all activities (potentially 100K+ rows)
app.get('/api/users/:id/activity', async (req, res) => {
  const activities = await db.query(`
    SELECT * FROM activities WHERE user_id = ?
  `, [req.params.id]);

  res.json(activities);
});
// Returns 450KB response, 2.8s
```

**After**:
```javascript
// Paginated response
app.get('/api/users/:id/activity', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  // Get paginated results
  const activities = await db.query(`
    SELECT * FROM activities
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [req.params.id, limit, offset]);

  // Get total count (cached for 5 minutes)
  const cacheKey = `count:activities:${req.params.id}`;
  let total = await redis.get(cacheKey);

  if (!total) {
    const result = await db.query(`
      SELECT COUNT(*) as total FROM activities WHERE user_id = ?
    `, [req.params.id]);
    total = result[0].total;
    await redis.setex(cacheKey, 300, total);
  }

  res.json({
    data: activities,
    pagination: {
      page,
      limit,
      total: parseInt(total),
      pages: Math.ceil(total / limit),
    },
  });
});
// Returns 50 rows (~15KB), 85ms
```

**Cursor-based pagination** (for real-time data):
```javascript
// Better for real-time feeds (no offset issues)
app.get('/api/users/:id/activity', async (req, res) => {
  const cursor = req.query.cursor || null;
  const limit = parseInt(req.query.limit) || 50;

  let query, params;

  if (cursor) {
    query = `
      SELECT * FROM activities
      WHERE user_id = ? AND id < ?
      ORDER BY id DESC
      LIMIT ?
    `;
    params = [req.params.id, cursor, limit];
  } else {
    query = `
      SELECT * FROM activities
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ?
    `;
    params = [req.params.id, limit];
  }

  const activities = await db.query(query, params);

  res.json({
    data: activities,
    pagination: {
      next_cursor: activities.length > 0 ? activities[activities.length - 1].id : null,
      has_more: activities.length === limit,
    },
  });
});
```

### Sprint 2: Advanced Optimizations

#### Full-Text Search

**Before**:
```sql
-- Slow LIKE query (cannot use index with leading %)
SELECT * FROM documents
WHERE title LIKE '%keyword%'
   OR content LIKE '%keyword%'
   OR author LIKE '%keyword%';
-- Seq Scan, 1.8s
```

**After (PostgreSQL)**:
```sql
-- Add tsvector column for full-text search
ALTER TABLE documents
  ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);

-- Populate search vector
UPDATE documents
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(author, '')), 'C');

-- Create trigger to keep search vector updated
CREATE FUNCTION documents_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.author, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION documents_search_trigger();

-- Fast full-text search query
SELECT * FROM documents
WHERE search_vector @@ to_tsquery('english', 'keyword')
ORDER BY ts_rank(search_vector, to_tsquery('english', 'keyword')) DESC;
-- Index Scan using idx_documents_search, 45ms
```

**API implementation**:
```javascript
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({error: 'Query required'});
  }

  // Sanitize and format query for tsquery
  const tsQuery = query
    .split(/\s+/)
    .map(word => `${word}:*`)  // Prefix matching
    .join(' & ');  // AND operator

  const results = await db.query(`
    SELECT
      id,
      title,
      content,
      author,
      ts_rank(search_vector, to_tsquery('english', $1)) as rank
    FROM documents
    WHERE search_vector @@ to_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT 50
  `, [tsQuery]);

  res.json(results);
});
// 2.1s → 45ms (98% improvement) ✓
```

#### Query Result Caching (Redis)

**Implementation**:
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache decorator for database queries
function cacheQuery(key, ttl = 300) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const cacheKey = typeof key === 'function' ? key(...args) : key;

      // Try cache first
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log('Query cache HIT:', cacheKey);
        return JSON.parse(cached);
      }

      console.log('Query cache MISS:', cacheKey);

      // Execute query
      const result = await originalMethod.apply(this, args);

      // Cache result
      await client.setex(cacheKey, ttl, JSON.stringify(result));

      return result;
    };

    return descriptor;
  };
}

// Usage
class UserRepository {
  @cacheQuery(userId => `user:${userId}`, 600)  // 10 minute TTL
  async findById(userId) {
    return await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  }

  @cacheQuery(email => `user:email:${email}`, 600)
  async findByEmail(email) {
    return await db.query('SELECT * FROM users WHERE email = ?', [email]);
  }

  // Invalidate cache on update
  async update(userId, data) {
    const result = await db.query('UPDATE users SET ? WHERE id = ?', [data, userId]);

    // Invalidate relevant caches
    await client.del(`user:${userId}`);
    if (data.email) {
      await client.del(`user:email:${data.email}`);
    }

    return result;
  }
}
```

## Phase 3: Validation and Monitoring

### Performance Validation

**Command**:
```bash
/henry-orchestrator:henry-team performance-engineer qa-tester - Validate database optimizations and measure improvements
```

**Results**:
```markdown
## Validation Report

### API Performance (After Optimization)

| Endpoint | Before | After | Improvement | Target | Status |
|----------|--------|-------|-------------|--------|--------|
| GET /api/dashboard | 3.2s | 48ms | 98.5% | <500ms | ✓ |
| GET /api/users/:id/activity | 2.8s | 85ms | 97.0% | <500ms | ✓ |
| POST /api/reports/generate | 8.5s | 420ms* | 95.1% | <500ms | ✓ |
| GET /api/search | 2.1s | 45ms | 97.9% | <500ms | ✓ |
| GET /api/analytics | 4.6s | 380ms** | 91.7% | <500ms | ✓ |

*Async processing implemented, user gets immediate response
**Materialized views implemented

### Database Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Average query time | 1.8s | 95ms | 94.7% ✓ |
| 95th percentile | 4.8s | 280ms | 94.2% ✓ |
| Connection pool utilization | 92% | 42% | 54% reduction ✓ |
| Query cache hit rate | 12% | 78% | 550% increase ✓ |
| Index usage | 38% | 89% | 134% increase ✓ |

### System Resources

| Resource | Before | After | Improvement |
|----------|--------|-------|-------------|
| CPU average | 78% | 32% | 59% reduction ✓ |
| Memory | 11GB | 9.5GB | 14% reduction ✓ |
| Disk I/O | High | Low | 70% reduction ✓ |

All targets met ✓
```

### Load Testing

**Before optimization**:
```bash
# Apache Bench
ab -n 10000 -c 100 https://dataflow.example.com/api/dashboard

Results:
- Requests per second: 45
- Time per request: 2,220ms (mean)
- 95th percentile: 4,800ms
- Failed requests: 230 (2.3%)
```

**After optimization**:
```bash
ab -n 10000 -c 100 https://dataflow.example.com/api/dashboard

Results:
- Requests per second: 1,250
- Time per request: 80ms (mean)
- 95th percentile: 185ms
- Failed requests: 0 (0%)

Improvement:
- Throughput: 2,678% increase (45 → 1,250 req/s) ✓
- Response time: 96% faster (2,220ms → 80ms) ✓
- Error rate: 100% reduction (2.3% → 0%) ✓
```

## Results Summary

### Business Impact (Measured after 8 weeks)

```
User Experience:
- User complaints: 45/week → 4/week (91% reduction) ✓
- Support tickets: 78/week → 12/week (85% reduction) ✓
- Page load satisfaction: 42% → 89% (112% increase) ✓

Business Metrics:
- Churn rate: 8.5% → 6.1% (28% improvement) ✓
- NPS score: 42 → 67 (60% improvement) ✓
- Active users: +18% (performance improvements drove adoption)

Cost Savings:
- Server costs: $8,500/month → $5,200/month (39% reduction)
- Support costs: $12,000/month → $4,500/month (62% reduction)
- Total monthly savings: $11,800

ROI:
- Development cost: ~120 hours (~$18,000)
- Monthly savings: $11,800
- Payback period: 1.5 months ✓
- Annual savings: $141,600
```

### Lessons Learned

**What Worked Well**:
1. **N+1 query fixes had immediate impact** - Single biggest improvement
2. **Indexing was low-hanging fruit** - Major improvements with minimal code changes
3. **Caching strategy** - 78% cache hit rate reduced database load significantly
4. **Load testing validated improvements** - Confidence in production deployment

**Challenges**:
1. **Cache invalidation complexity** - Required careful design to avoid stale data
2. **Migration downtime** - Adding indexes on large tables required careful planning
3. **Monitoring gaps** - Initial metrics didn't capture full picture, added more instrumentation

## Related Resources

- [Optimization Framework](../references/optimization-framework.md) - Detailed workflows
- [Metrics Guide](../references/metrics-guide.md) - Database metrics
- [Web App Optimization Example](./web-app-optimization.md) - Frontend optimization
