# Scalability Strategies and Performance Optimization

This reference provides comprehensive guidance on scaling applications, performance optimization techniques, and handling growth.

## Scalability Dimensions

### Vertical Scaling (Scale Up)

Add more resources to existing machines.

**Approach:**
- Increase CPU cores
- Add more RAM
- Upgrade to faster disks (SSD, NVMe)
- Use more powerful instances

**Advantages:**
- Simple to implement
- No code changes needed
- Lower operational complexity
- Better for single-threaded workloads

**Limitations:**
- Hardware limits (physical constraints)
- Single point of failure
- Diminishing returns
- Expensive at high end
- Downtime for upgrades

**When to use:**
- Database primary instances
- Monolithic applications
- Memory-intensive workloads
- Before horizontal scaling complexity

### Horizontal Scaling (Scale Out)

Add more machines to distribute load.

**Approach:**
- Add more application instances
- Use load balancers
- Distribute data across nodes
- Replicate services

**Advantages:**
- Near-infinite scalability
- No single point of failure
- Cost-effective (commodity hardware)
- Gradual scaling
- No downtime for scaling

**Limitations:**
- Application must be stateless
- Data consistency challenges
- Operational complexity
- Network overhead

**When to use:**
- Web applications
- API services
- Microservices
- Read-heavy workloads

## Database Scaling Strategies

### Read Replicas

Route read queries to replica databases.

**Implementation:**
```
Primary DB (writes)
    ├─→ Read Replica 1 (reads)
    ├─→ Read Replica 2 (reads)
    └─→ Read Replica 3 (reads)
```

**Advantages:**
- Offload reads from primary
- Geographic distribution
- Failover capability
- Simple to implement

**Considerations:**
- Replication lag (eventual consistency)
- Read-after-write consistency issues
- Connection management

**Replication lag mitigation:**
- Route user's own writes to primary
- Use async refresh patterns
- Set acceptable lag thresholds
- Monitor replication lag metrics

**Best for:**
- Read-heavy workloads (10:1 read/write ratio or higher)
- Reporting and analytics
- Geographic distribution

### Database Sharding

Partition data across multiple databases.

**Sharding Strategies:**

**Hash-based:**
```
Shard = hash(user_id) % num_shards

User 1 (hash: 42) → Shard 2
User 2 (hash: 17) → Shard 1
User 3 (hash: 89) → Shard 3
```

**Advantages:**
- Even distribution
- Simple algorithm

**Disadvantages:**
- Resharding requires rebalancing
- Range queries difficult

**Range-based:**
```
Shard 1: user_id 1-10000
Shard 2: user_id 10001-20000
Shard 3: user_id 20001-30000
```

**Advantages:**
- Range queries efficient
- Easy to add shards

**Disadvantages:**
- Potential hotspots
- Uneven distribution

**Geographic:**
```
Shard US-East: users in North America
Shard EU-West: users in Europe
Shard AP-Southeast: users in Asia
```

**Advantages:**
- Low latency for users
- Data residency compliance

**Disadvantages:**
- Uneven distribution
- Cross-region queries complex

**Implementation Considerations:**

**Shard Key Selection:**
- High cardinality
- Even distribution
- Query pattern alignment
- Rarely changes

**Cross-shard Queries:**
- Scatter-gather pattern
- Application-level joins
- Denormalization
- Separate analytics database

**Resharding:**
- Plan for growth
- Consistent hashing
- Online migration tools
- Double-write pattern

**Best for:**
- Very large datasets (TB+)
- High write throughput
- Multi-tenant applications
- Geographic distribution

### Connection Pooling

Reuse database connections to reduce overhead.

**Implementation:**
```
Application Instances (100)
    ↓
Connection Pool (20 connections)
    ↓
Database
```

**Tools:**
- **PgBouncer:** PostgreSQL connection pooler
- **ProxySQL:** MySQL connection pooling and query routing
- **Application-level:** HikariCP (Java), pgpool (Node.js)

**Benefits:**
- Reduced connection overhead
- Limits concurrent connections
- Faster query execution
- Better resource utilization

**Configuration:**
```
Max connections = (Core count * 2) + effective_spindle_count

Example: 4 cores, 1 disk = (4 * 2) + 1 = 9 connections
```

### Caching Strategies

#### Cache-Aside (Lazy Loading)

**Flow:**
1. Check cache
2. If miss, query database
3. Store in cache
4. Return result

**Code example:**
```typescript
async function getUser(userId: string) {
  // Check cache
  let user = await cache.get(`user:${userId}`)

  if (!user) {
    // Cache miss - query database
    user = await db.users.findById(userId)

    // Store in cache
    await cache.set(`user:${userId}`, user, { ttl: 3600 })
  }

  return user
}
```

**Advantages:**
- Only cache what's requested
- Cache failures don't break app

**Disadvantages:**
- Cache miss penalty (extra latency)
- Stale data possible

#### Write-Through

**Flow:**
1. Write to cache
2. Synchronously write to database
3. Return success

**Code example:**
```typescript
async function updateUser(userId: string, data: UserUpdate) {
  // Update database
  const user = await db.users.update(userId, data)

  // Update cache
  await cache.set(`user:${userId}`, user, { ttl: 3600 })

  return user
}
```

**Advantages:**
- Cache always consistent
- No cache miss penalty for reads

**Disadvantages:**
- Write latency increased
- Cache pollution (unused data)

#### Write-Behind (Write-Back)

**Flow:**
1. Write to cache
2. Asynchronously write to database
3. Return success immediately

**Advantages:**
- Fast writes
- Batch database updates

**Disadvantages:**
- Data loss risk if cache fails
- Complexity in error handling

**Best for:**
- Write-heavy workloads
- Can tolerate eventual consistency

#### Cache Invalidation Patterns

**TTL (Time-To-Live):**
```typescript
await cache.set(key, value, { ttl: 3600 }) // 1 hour
```

**Event-based:**
```typescript
async function updateUser(userId: string, data: UserUpdate) {
  const user = await db.users.update(userId, data)

  // Invalidate cache
  await cache.delete(`user:${userId}`)

  return user
}
```

**Tag-based:**
```typescript
// Set with tags
await cache.set('user:123', user, { tags: ['user', 'profile'] })

// Invalidate all with tag
await cache.invalidateTag('user')
```

**Considerations:**
- Shorter TTL = fresher data, more database load
- Longer TTL = less database load, staler data
- Event-based = consistent but complex
- Cache stampede prevention (see below)

#### Cache Stampede Prevention

**Problem:** Many requests for expired key hit database simultaneously.

**Solution 1: Lock-based**
```typescript
async function getUser(userId: string) {
  const cacheKey = `user:${userId}`
  const lockKey = `lock:${userId}`

  let user = await cache.get(cacheKey)

  if (!user) {
    // Try to acquire lock
    const acquired = await cache.setNX(lockKey, '1', { ttl: 5 })

    if (acquired) {
      // We got the lock - fetch from DB
      user = await db.users.findById(userId)
      await cache.set(cacheKey, user, { ttl: 3600 })
      await cache.delete(lockKey)
    } else {
      // Someone else is fetching - wait and retry
      await sleep(100)
      return getUser(userId) // Retry
    }
  }

  return user
}
```

**Solution 2: Probabilistic early expiration**
```typescript
async function getUser(userId: string) {
  const cacheKey = `user:${userId}`

  const cached = await cache.getWithTTL(cacheKey)

  if (cached) {
    const { value, ttl } = cached

    // Probabilistically refresh before expiry
    const delta = Date.now() - (ttl * 1000)
    const shouldRefresh = delta * Math.random() < 1000 // 1 second window

    if (shouldRefresh) {
      // Async refresh
      refreshUserCache(userId).catch(console.error)
    }

    return value
  }

  // Cache miss - fetch and cache
  const user = await db.users.findById(userId)
  await cache.set(cacheKey, user, { ttl: 3600 })
  return user
}
```

### Query Optimization

**Indexing:**
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- Covering index (include columns)
CREATE INDEX idx_users_lookup ON users(email) INCLUDE (name, created_at);
```

**Index selection guidelines:**
- Index columns used in WHERE clauses
- Index columns used in JOINs
- Index columns used in ORDER BY
- Avoid over-indexing (slows writes)
- Composite indexes: most selective column first

**Query optimization:**

**N+1 Query Problem:**
```typescript
// Bad: N+1 queries
const users = await db.users.findAll()
for (const user of users) {
  user.posts = await db.posts.findByUserId(user.id) // N queries!
}

// Good: Single query with join
const users = await db.users.findAll({
  include: { posts: true }
})

// Alternative: Dataloader pattern (batching)
const users = await db.users.findAll()
const userIds = users.map(u => u.id)
const posts = await db.posts.findByUserIds(userIds) // Single query
const postsByUserId = groupBy(posts, 'userId')
users.forEach(user => {
  user.posts = postsByUserId[user.id] || []
})
```

**Pagination:**
```sql
-- Offset pagination (slow for large offsets)
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 10000;

-- Cursor-based pagination (fast)
SELECT * FROM users
WHERE id > :last_seen_id
ORDER BY id
LIMIT 20;
```

**Explain Plans:**
```sql
EXPLAIN ANALYZE
SELECT * FROM users
WHERE email = 'user@example.com';
```

Look for:
- Seq Scan (bad for large tables)
- Index Scan (good)
- Execution time
- Rows examined vs. rows returned

## Application-Level Scaling

### Stateless Architecture

**Requirements:**
- No local state (sessions, files)
- Horizontal scaling compatible
- Any instance can handle any request

**State storage options:**
- **Sessions:** Redis, Memcached
- **Files:** S3, Cloud Storage
- **Queues:** Redis, SQS, RabbitMQ

**Example:**
```typescript
// Bad: Local session storage
const sessions = new Map()

app.post('/login', (req, res) => {
  const sessionId = uuid()
  sessions.set(sessionId, { userId: req.body.userId }) // Lost on restart!
  res.cookie('sessionId', sessionId)
})

// Good: Distributed session storage
app.post('/login', async (req, res) => {
  const sessionId = uuid()
  await redis.set(`session:${sessionId}`, { userId: req.body.userId }, { ttl: 3600 })
  res.cookie('sessionId', sessionId)
})
```

### Load Balancing

**Algorithms:**

**Round Robin:**
- Distribute requests evenly
- Simple, no state needed
- Doesn't account for server load

**Least Connections:**
- Route to server with fewest active connections
- Better for long-lived connections
- Requires connection tracking

**IP Hash:**
- Route based on client IP
- Session affinity without sticky sessions
- Uneven distribution possible

**Weighted:**
- Assign weights based on capacity
- Use during migrations (gradual traffic shift)
- Example: 80% to new version, 20% to old

**Tools:**
- **Cloud:** AWS ALB/NLB, GCP Load Balancer, Azure Load Balancer
- **Self-hosted:** Nginx, HAProxy, Traefik
- **Application:** Envoy, Linkerd (service mesh)

**Health Checks:**
```typescript
app.get('/health', (req, res) => {
  // Check dependencies
  const dbHealthy = await checkDatabase()
  const cacheHealthy = await checkRedis()

  if (dbHealthy && cacheHealthy) {
    res.status(200).json({ status: 'healthy' })
  } else {
    res.status(503).json({ status: 'unhealthy' })
  }
})
```

### Asynchronous Processing

**Pattern:**
```
User Request
    ↓
API (enqueue job, return immediately)
    ↓
Message Queue
    ↓
Background Worker (process job)
```

**Use cases:**
- Email sending
- Image processing
- Report generation
- Data exports
- Batch operations

**Implementation:**
```typescript
// API handler
app.post('/upload-video', async (req, res) => {
  const videoId = await saveVideo(req.file)

  // Enqueue processing job
  await queue.add('process-video', { videoId })

  // Return immediately
  res.json({ videoId, status: 'processing' })
})

// Background worker
worker.process('process-video', async (job) => {
  const { videoId } = job.data

  await transcodeVideo(videoId)
  await generateThumbnail(videoId)
  await updateVideoStatus(videoId, 'completed')
})
```

**Tools:**
- **BullMQ:** Redis-based, Node.js
- **Celery:** Python
- **Sidekiq:** Ruby
- **AWS SQS + Lambda:** Serverless
- **Cloud Tasks:** GCP

### Rate Limiting

Prevent abuse and ensure fair usage.

**Algorithms:**

**Token Bucket:**
- Bucket refills at constant rate
- Requests consume tokens
- Allows bursts up to bucket size

**Sliding Window:**
- Count requests in rolling time window
- More accurate than fixed window
- More complex to implement

**Implementation (Redis):**
```typescript
async function rateLimit(userId: string, limit: number, windowSeconds: number) {
  const key = `ratelimit:${userId}`
  const now = Date.now()
  const windowStart = now - (windowSeconds * 1000)

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart)

  // Count requests in window
  const count = await redis.zcard(key)

  if (count >= limit) {
    throw new Error('Rate limit exceeded')
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`)
  await redis.expire(key, windowSeconds)
}

app.use(async (req, res, next) => {
  try {
    await rateLimit(req.userId, 100, 60) // 100 requests per minute
    next()
  } catch (err) {
    res.status(429).json({ error: 'Too many requests' })
  }
})
```

**Strategies:**
- Per user
- Per IP
- Per API endpoint
- Per API key
- Tiered limits (free vs. paid)

## CDN and Edge Computing

### Content Delivery Networks

**Purpose:**
- Serve static assets from edge locations
- Reduce latency
- Offload origin servers
- DDoS protection

**Cacheable Content:**
- Images, videos
- CSS, JavaScript
- Fonts
- Static HTML
- API responses (with appropriate headers)

**Cache Control Headers:**
```typescript
// Immutable assets (versioned)
res.set('Cache-Control', 'public, max-age=31536000, immutable')

// Frequently changing content
res.set('Cache-Control', 'public, max-age=3600, must-revalidate')

// Private content (user-specific)
res.set('Cache-Control', 'private, max-age=600')

// No cache
res.set('Cache-Control', 'no-store')
```

**Providers:**
- **Cloudflare:** Free tier, DDoS protection, edge computing
- **AWS CloudFront:** Deep AWS integration
- **Fastly:** Real-time purging, VCL customization
- **Akamai:** Enterprise-grade, global coverage

### Edge Computing

Run code close to users.

**Use cases:**
- A/B testing
- Personalization
- Authentication
- Request routing
- API aggregation

**Platforms:**
- **Cloudflare Workers:** V8 isolates, global
- **AWS Lambda@Edge:** CloudFront integration
- **Vercel Edge Functions:** Next.js integration
- **Deno Deploy:** TypeScript-first

**Example (Cloudflare Workers):**
```typescript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // A/B test at the edge
  const variant = Math.random() < 0.5 ? 'A' : 'B'

  const url = new URL(request.url)
  url.hostname = `variant-${variant}.example.com`

  return fetch(url)
}
```

## Performance Monitoring and Profiling

### Key Metrics

**Response Time Percentiles:**
- p50 (median): Typical user experience
- p95: Most users' experience
- p99: Tail latency, worst-case scenarios

**Why percentiles matter:**
- Average hides outliers
- p99 affects real users
- High p99 indicates problems

**Apdex Score:**
```
Apdex = (Satisfied + (Tolerating / 2)) / Total

Satisfied: Response time ≤ T
Tolerating: T < Response time ≤ 4T
Frustrated: Response time > 4T
```

**Resource Utilization:**
- CPU usage (aim for 60-70% during peak)
- Memory usage (watch for leaks)
- Disk I/O (IOPS, throughput)
- Network (bandwidth, packets/sec)

### Application Profiling

**Node.js:**
```bash
# CPU profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Heap snapshots
node --inspect app.js
# Chrome DevTools → Memory → Take heap snapshot
```

**Python:**
```python
import cProfile
import pstats

# Profile code
profiler = cProfile.Profile()
profiler.enable()

# Your code here
process_data()

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)
```

**Identify bottlenecks:**
- Hot code paths
- Blocking I/O
- Inefficient algorithms
- Memory allocations

### Database Query Analysis

**Slow query logs:**
```sql
-- PostgreSQL
ALTER DATABASE mydb SET log_min_duration_statement = 1000; -- Log queries > 1s

-- MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

**Query performance insights:**
- AWS RDS Performance Insights
- Google Cloud SQL Insights
- Azure Database Insights

**Missing index detection:**
```sql
-- PostgreSQL: Find seq scans on large tables
SELECT schemaname, tablename, seq_scan, seq_tup_read,
       idx_scan, seq_tup_read / seq_scan AS avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

## Scaling Checklist

**Before you need it:**
- [ ] Implement stateless architecture
- [ ] Use managed databases with easy scaling
- [ ] Set up caching layer
- [ ] Implement connection pooling
- [ ] Add database indexes for common queries
- [ ] Set up monitoring and alerts
- [ ] Document scaling procedures

**When traffic grows:**
- [ ] Analyze bottlenecks (database, API, frontend)
- [ ] Scale horizontally (add app instances)
- [ ] Add read replicas for databases
- [ ] Implement CDN for static assets
- [ ] Optimize slow queries
- [ ] Add caching strategically
- [ ] Consider async processing for heavy operations

**For high scale:**
- [ ] Database sharding
- [ ] Microservices architecture
- [ ] Message queues for decoupling
- [ ] Event-driven architecture
- [ ] Auto-scaling policies
- [ ] Multi-region deployment
- [ ] Advanced caching (Redis Cluster)
- [ ] Service mesh for observability

## Cost Optimization

**Right-sizing:**
- Monitor actual usage
- Use smaller instances where possible
- Reserved instances for predictable load
- Spot instances for flexible workloads

**Database:**
- Use read replicas instead of larger primary
- Archive old data
- Use cheaper storage tiers for backups
- Consider serverless options (Aurora Serverless, Firestore)

**Compute:**
- Serverless for variable workloads
- Kubernetes for high utilization
- Auto-scaling policies (scale down during low traffic)

**Storage:**
- Use S3 Intelligent-Tiering
- Lifecycle policies for old data
- Compress data
- Use cheaper storage for archives

**Network:**
- CDN to reduce origin traffic
- Compress responses (gzip, Brotli)
- Optimize images (WebP, lazy loading)
- Keep traffic within same region
