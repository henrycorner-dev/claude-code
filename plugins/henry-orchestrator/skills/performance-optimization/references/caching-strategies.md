# Caching Strategies

This reference provides comprehensive guidance on implementing caching at various application layers, with focus on Redis caching patterns and best practices.

## Redis Caching Patterns

### Cache-Aside (Lazy Loading)

Most common caching pattern. Application checks cache before querying database.

**Flow:**
1. Application receives request
2. Check if data exists in cache
3. If cache hit: Return cached data
4. If cache miss: Query database, populate cache, return data

**Implementation (Node.js):**
```javascript
const redis = require('redis');
const client = redis.createClient();

async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss - query database
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

  // Populate cache with 1 hour TTL
  await client.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}
```

**When to Use:**
- Read-heavy workloads
- Data that doesn't change frequently
- Acceptable to serve slightly stale data

**Trade-offs:**
- Cache miss penalty (extra latency)
- Potential cache stampede on popular keys
- Manual cache invalidation required

### Write-Through Cache

Write to cache and database simultaneously, ensuring cache is always up-to-date.

**Flow:**
1. Application writes data
2. Update cache
3. Update database
4. Return success

**Implementation (Node.js):**
```javascript
async function updateUser(userId, userData) {
  const cacheKey = `user:${userId}`;

  // Update database
  await db.query('UPDATE users SET ? WHERE id = ?', [userData, userId]);

  // Update cache
  await client.setex(cacheKey, 3600, JSON.stringify(userData));

  return userData;
}
```

**When to Use:**
- Need cache consistency
- Read-after-write operations are common
- Write performance is acceptable

**Trade-offs:**
- Slower writes (cache + DB)
- Wasted cache space if data not read
- Both systems must succeed or rollback

### Write-Behind Cache (Write-Back)

Write to cache immediately, async write to database later. Maximizes write performance.

**Flow:**
1. Application writes data
2. Update cache
3. Queue database write (async)
4. Return success immediately
5. Background worker persists to database

**Implementation (Node.js with Bull queue):**
```javascript
const Queue = require('bull');
const writeQueue = new Queue('database-writes');

async function updateUser(userId, userData) {
  const cacheKey = `user:${userId}`;

  // Update cache immediately
  await client.setex(cacheKey, 3600, JSON.stringify(userData));

  // Queue database write
  await writeQueue.add({
    operation: 'updateUser',
    userId,
    userData
  });

  return userData;
}

// Worker process
writeQueue.process(async (job) => {
  const { userId, userData } = job.data;
  await db.query('UPDATE users SET ? WHERE id = ?', [userData, userId]);
});
```

**When to Use:**
- Very high write throughput needed
- Can tolerate potential data loss
- Database is write-bottleneck

**Trade-offs:**
- Risk of data loss if cache fails before DB write
- Complex failure handling
- Eventual consistency

### Cache Invalidation Strategies

"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton

#### TTL-Based Expiration

Set time-to-live on cache keys. Simplest approach.

```javascript
// Set with 1 hour TTL
await client.setex('user:123', 3600, JSON.stringify(user));

// Set with 5 minutes TTL
await client.setex('session:abc', 300, JSON.stringify(session));
```

**Best for:**
- Data with predictable staleness tolerance
- Session data
- Temporary data

#### Event-Based Invalidation

Invalidate cache when underlying data changes.

```javascript
async function updateUser(userId, userData) {
  // Update database
  await db.query('UPDATE users SET ? WHERE id = ?', [userData, userId]);

  // Invalidate cache
  await client.del(`user:${userId}`);

  // Optionally invalidate related caches
  await client.del(`user:${userId}:posts`);
  await client.del(`user:${userId}:followers`);
}
```

**Best for:**
- Critical data requiring consistency
- Infrequently updated data
- Related/dependent data

#### Version-Based Cache Keys

Include version in cache key, allowing gradual rollover.

```javascript
const CACHE_VERSION = 'v2';

async function getUser(userId) {
  const cacheKey = `${CACHE_VERSION}:user:${userId}`;
  // ... cache logic
}
```

**Best for:**
- Schema changes
- Gradual cache migrations
- A/B testing

## Redis Data Structures for Caching

### Strings

Most basic caching. Store serialized objects.

```javascript
// Store user object
await client.set('user:123', JSON.stringify(user));

// Retrieve
const user = JSON.parse(await client.get('user:123'));
```

### Hashes

Store objects as field-value pairs. Efficient for partial updates.

```javascript
// Store user fields
await client.hset('user:123', 'name', 'John Doe');
await client.hset('user:123', 'email', 'john@example.com');

// Or bulk
await client.hmset('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Retrieve specific field
const name = await client.hget('user:123', 'name');

// Retrieve all fields
const user = await client.hgetall('user:123');
```

**Advantages:**
- Update individual fields without fetching entire object
- Memory efficient
- Atomic field operations

### Lists

Cache ordered collections, recent items, queues.

```javascript
// Cache recent posts
await client.lpush('recent:posts', JSON.stringify(newPost));
await client.ltrim('recent:posts', 0, 99); // Keep only 100 most recent

// Retrieve recent posts
const recentPosts = await client.lrange('recent:posts', 0, 9); // Get 10 most recent
```

**Use cases:**
- Activity feeds
- Recent items
- Leaderboards (use sorted sets instead for scoring)

### Sorted Sets

Cache ranked data with scores.

```javascript
// Cache leaderboard
await client.zadd('leaderboard', 1500, 'user:123');
await client.zadd('leaderboard', 2000, 'user:456');

// Get top 10
const top10 = await client.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Get user rank
const rank = await client.zrevrank('leaderboard', 'user:123');
```

**Use cases:**
- Leaderboards
- Priority queues
- Time-series data (score = timestamp)

## Cache Key Design

### Naming Conventions

Use consistent, hierarchical key naming:

```
{namespace}:{entity}:{id}:{attribute}
```

**Examples:**
```
user:123
user:123:profile
user:123:settings
post:456
post:456:comments
session:abc123
cache:query:users:active
```

**Benefits:**
- Organized namespace
- Easy to invalidate related keys
- Clear key purpose
- Supports pattern matching

### Key Patterns

```javascript
// Pattern deletion (use carefully - can be slow)
const keys = await client.keys('user:123:*');
if (keys.length > 0) {
  await client.del(...keys);
}

// Better: Use SCAN for large key sets
const stream = client.scanStream({
  match: 'user:123:*',
  count: 100
});

stream.on('data', (keys) => {
  if (keys.length) {
    client.del(...keys);
  }
});
```

## Cache Warming

Pre-populate cache with frequently accessed data to avoid cold start penalties.

### Application Startup Warming

```javascript
async function warmCache() {
  console.log('Warming cache...');

  // Cache popular users
  const popularUsers = await db.query('SELECT * FROM users ORDER BY followers DESC LIMIT 100');
  for (const user of popularUsers) {
    await client.setex(`user:${user.id}`, 3600, JSON.stringify(user));
  }

  // Cache active sessions
  const activeSessions = await db.query('SELECT * FROM sessions WHERE expires_at > NOW()');
  for (const session of activeSessions) {
    await client.setex(`session:${session.id}`, 1800, JSON.stringify(session));
  }

  console.log('Cache warmed');
}

// Run on application start
warmCache().catch(console.error);
```

### Background Warming

```javascript
const cron = require('node-cron');

// Warm cache every hour
cron.schedule('0 * * * *', async () => {
  await warmCache();
});
```

## Handling Cache Stampede

When many requests simultaneously request the same uncached key, causing database overload.

### Solution 1: Lock-Based Approach

```javascript
const Redlock = require('redlock');
const redlock = new Redlock([client]);

async function getUser(userId) {
  const cacheKey = `user:${userId}`;
  const lockKey = `lock:${cacheKey}`;

  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Try to acquire lock
  try {
    const lock = await redlock.lock(lockKey, 1000); // 1 second TTL

    // Double-check cache (another request might have populated it)
    const cached = await client.get(cacheKey);
    if (cached) {
      await lock.unlock();
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    // Populate cache
    await client.setex(cacheKey, 3600, JSON.stringify(user));

    // Release lock
    await lock.unlock();

    return user;
  } catch (err) {
    // Could not acquire lock - another request is fetching
    // Wait briefly and check cache again
    await new Promise(resolve => setTimeout(resolve, 100));
    const cached = await client.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Fallback to database
    return await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}
```

### Solution 2: Probabilistic Early Expiration

Refresh cache before expiration based on probability.

```javascript
async function getUser(userId) {
  const cacheKey = `user:${userId}`;
  const ttl = 3600; // 1 hour
  const beta = 1; // Tuning parameter

  const cached = await client.get(cacheKey);
  const remainingTtl = await client.ttl(cacheKey);

  if (cached) {
    // Probabilistic early refresh
    const delta = Date.now() - (ttl - remainingTtl);
    const probability = delta * beta / ttl;

    if (Math.random() < probability) {
      // Refresh cache in background
      refreshCache(userId, cacheKey, ttl);
    }

    return JSON.parse(cached);
  }

  // Cache miss
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  await client.setex(cacheKey, ttl, JSON.stringify(user));
  return user;
}

async function refreshCache(userId, cacheKey, ttl) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  await client.setex(cacheKey, ttl, JSON.stringify(user));
}
```

## Distributed Caching Considerations

### Redis Cluster

For horizontal scaling and high availability.

```javascript
const Redis = require('ioredis');

const cluster = new Redis.Cluster([
  { port: 7000, host: '127.0.0.1' },
  { port: 7001, host: '127.0.0.1' },
  { port: 7002, host: '127.0.0.1' }
]);

// Use same API as single Redis instance
await cluster.set('key', 'value');
```

**Use when:**
- Need to cache > 25GB data
- Need high availability
- Need to scale reads and writes

### Redis Sentinel

For high availability with automatic failover.

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  sentinels: [
    { host: 'sentinel1', port: 26379 },
    { host: 'sentinel2', port: 26379 },
    { host: 'sentinel3', port: 26379 }
  ],
  name: 'mymaster'
});
```

**Use when:**
- Need automatic failover
- Single node sufficient for data size
- Primarily scale reads (replicas)

## Cache Metrics and Monitoring

Monitor cache effectiveness:

```javascript
async function getCacheStats() {
  const info = await client.info('stats');

  // Parse Redis INFO output
  const hits = parseInt(info.match(/keyspace_hits:(\d+)/)[1]);
  const misses = parseInt(info.match(/keyspace_misses:(\d+)/)[1]);
  const hitRate = hits / (hits + misses);

  return {
    hits,
    misses,
    hitRate: (hitRate * 100).toFixed(2) + '%'
  };
}
```

**Key Metrics:**
- **Hit rate**: % of requests served from cache
- **Miss rate**: % of requests requiring DB query
- **Eviction rate**: How often keys are evicted (memory pressure)
- **Average TTL**: Time data stays in cache
- **Memory usage**: Current cache size

**Target Metrics:**
- Hit rate: > 80% for read-heavy apps
- Miss rate: < 20%
- Eviction rate: < 10%

## Best Practices Summary

**DO:**
- Set appropriate TTLs for all cached data
- Monitor cache hit rates
- Use consistent key naming conventions
- Handle cache failures gracefully (fallback to DB)
- Implement cache warming for critical data
- Use appropriate Redis data structures
- Compress large values before caching
- Version your cache keys for migrations

**DON'T:**
- Cache everything (cache what's expensive to compute/fetch)
- Use very long TTLs for frequently changing data
- Store sensitive data without encryption
- Ignore cache stampede scenarios
- Use cache as primary data store (it's volatile)
- Delete keys with KEYS command in production (use SCAN)
- Forget to set TTLs (memory leaks)
- Cache without monitoring

## Common Pitfalls

### Pitfall 1: Not Setting TTLs

```javascript
// BAD: No expiration
await client.set('user:123', JSON.stringify(user));

// GOOD: Always set TTL
await client.setex('user:123', 3600, JSON.stringify(user));
```

### Pitfall 2: Storing Passwords/Secrets

```javascript
// BAD: Caching sensitive data in plain text
await client.set('user:123:password', hashedPassword);

// GOOD: Don't cache sensitive data, or encrypt it
// Better: Don't cache at all
```

### Pitfall 3: Large Values

```javascript
// BAD: Caching 10MB object
await client.set('huge:data', JSON.stringify(tenMbObject));

// GOOD: Compress before caching
const compressed = await compress(JSON.stringify(tenMbObject));
await client.set('huge:data', compressed);

// BETTER: Don't cache huge objects, paginate or break into smaller pieces
```

### Pitfall 4: Thundering Herd

```javascript
// BAD: All requests hit DB on cache miss
async function getData() {
  const cached = await client.get('data');
  if (!cached) {
    const data = await expensiveDbQuery(); // 100 concurrent requests all run this
    await client.set('data', data);
    return data;
  }
  return cached;
}

// GOOD: Use locking (see Cache Stampede section above)
```

## Framework-Specific Integrations

### Express.js Middleware

```javascript
const redis = require('redis');
const client = redis.createClient();

function cacheMiddleware(ttl = 3600) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      client.setex(key, ttl, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  };
}

// Usage
app.get('/api/users', cacheMiddleware(300), async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});
```

### Django Cache Framework

```python
from django.core.cache import cache
from django.views.decorators.cache import cache_page

# Function-based view with caching (5 minutes)
@cache_page(60 * 5)
def user_list(request):
    users = User.objects.all()
    return JsonResponse({'users': list(users.values())})

# Manual cache control
def get_user(user_id):
    cache_key = f'user:{user_id}'
    user = cache.get(cache_key)

    if user is None:
        user = User.objects.get(id=user_id)
        cache.set(cache_key, user, 3600)  # 1 hour TTL

    return user
```

### Next.js with Redis

```javascript
import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);

export async function getServerSideProps({ params }) {
  const cacheKey = `post:${params.id}`;

  let post = await getAsync(cacheKey);
  if (post) {
    return { props: { post: JSON.parse(post) } };
  }

  post = await fetchPostFromDB(params.id);
  await setexAsync(cacheKey, 3600, JSON.stringify(post));

  return { props: { post } };
}
```

## Summary

Effective caching requires:
1. **Choosing the right pattern** (cache-aside, write-through, write-behind)
2. **Proper invalidation strategy** (TTL, event-based, versioning)
3. **Appropriate data structures** (strings, hashes, lists, sorted sets)
4. **Cache stampede protection** (locking, probabilistic expiration)
5. **Monitoring and metrics** (hit rate, memory usage)
6. **Thoughtful key design** (namespaced, consistent, hierarchical)

Start with cache-aside pattern and TTL-based expiration for most use cases, then optimize based on specific requirements and metrics.
