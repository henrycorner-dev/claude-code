# Rate Limiting Implementation Guide

## Rate Limiting Algorithms

### 1. Fixed Window Counter

**Algorithm:**
- Track request count in fixed time windows (e.g., per minute)
- Reset counter at window boundary
- Simple but allows burst at boundaries

**Pros:**
- Simple to implement
- Low memory usage
- Easy to understand

**Cons:**
- Allows double the rate at window boundaries
- Not smooth traffic control

**Implementation (Node.js with Redis):**
```javascript
const redis = require('redis')
const client = redis.createClient()

async function fixedWindowRateLimit(userId, limit, windowSeconds) {
  const key = `rate_limit:${userId}:${Math.floor(Date.now() / (windowSeconds * 1000))}`

  const current = await client.incr(key)

  if (current === 1) {
    // First request in window, set expiration
    await client.expire(key, windowSeconds)
  }

  if (current > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: Math.ceil(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000
    }
  }

  return {
    allowed: true,
    remaining: limit - current,
    resetAt: Math.ceil(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000
  }
}
```

**Express Middleware:**
```javascript
function rateLimitMiddleware(limit, windowSeconds) {
  return async (req, res, next) => {
    const userId = req.user?.id || req.ip

    const result = await fixedWindowRateLimit(userId, limit, windowSeconds)

    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': Math.floor(result.resetAt / 1000)
    })

    if (!result.allowed) {
      res.set('Retry-After', Math.ceil((result.resetAt - Date.now()) / 1000))
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please retry later.'
        }
      })
    }

    next()
  }
}

// Usage
app.use('/api/', rateLimitMiddleware(100, 60)) // 100 requests per minute
```

### 2. Sliding Window Log

**Algorithm:**
- Store timestamp of each request
- Count requests within sliding time window
- More accurate than fixed window

**Pros:**
- No boundary issues
- Accurate request counting
- Fair rate limiting

**Cons:**
- Higher memory usage (stores all timestamps)
- More complex

**Implementation:**
```javascript
async function slidingWindowLog(userId, limit, windowSeconds) {
  const key = `rate_limit:log:${userId}`
  const now = Date.now()
  const windowStart = now - (windowSeconds * 1000)

  // Remove old entries
  await client.zremrangebyscore(key, 0, windowStart)

  // Count requests in window
  const count = await client.zcard(key)

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0
    }
  }

  // Add current request
  await client.zadd(key, now, `${now}`)
  await client.expire(key, windowSeconds)

  return {
    allowed: true,
    remaining: limit - count - 1
  }
}
```

### 3. Sliding Window Counter

**Algorithm:**
- Hybrid of fixed window and sliding log
- Interpolate between current and previous window
- Good balance of accuracy and efficiency

**Pros:**
- More accurate than fixed window
- Less memory than sliding log
- Smooth rate limiting

**Cons:**
- Slightly more complex
- Small inaccuracy at boundaries

**Implementation:**
```javascript
async function slidingWindowCounter(userId, limit, windowSeconds) {
  const now = Date.now()
  const currentWindow = Math.floor(now / (windowSeconds * 1000))
  const previousWindow = currentWindow - 1

  const currentKey = `rate_limit:${userId}:${currentWindow}`
  const previousKey = `rate_limit:${userId}:${previousWindow}`

  const [currentCount, previousCount] = await Promise.all([
    client.get(currentKey).then(v => parseInt(v) || 0),
    client.get(previousKey).then(v => parseInt(v) || 0)
  ])

  // Calculate position in current window (0 to 1)
  const windowProgress = (now % (windowSeconds * 1000)) / (windowSeconds * 1000)

  // Weighted count from previous and current windows
  const estimatedCount = previousCount * (1 - windowProgress) + currentCount

  if (estimatedCount >= limit) {
    return {
      allowed: false,
      remaining: 0
    }
  }

  // Increment current window
  await client.incr(currentKey)
  await client.expire(currentKey, windowSeconds * 2)

  return {
    allowed: true,
    remaining: Math.floor(limit - estimatedCount - 1)
  }
}
```

### 4. Token Bucket

**Algorithm:**
- Bucket holds tokens (capacity)
- Tokens added at constant rate
- Request consumes a token
- Allows controlled bursts

**Pros:**
- Allows bursts up to bucket size
- Smooth rate limiting
- Industry standard

**Cons:**
- More complex state management
- Requires atomic operations

**Implementation:**
```javascript
async function tokenBucket(userId, capacity, refillRate, tokensPerRequest = 1) {
  const key = `rate_limit:bucket:${userId}`

  // Get or initialize bucket state
  let bucket = await client.get(key)
  bucket = bucket ? JSON.parse(bucket) : {
    tokens: capacity,
    lastRefill: Date.now()
  }

  const now = Date.now()
  const timePassed = (now - bucket.lastRefill) / 1000

  // Refill tokens based on time passed
  const tokensToAdd = timePassed * refillRate
  bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd)
  bucket.lastRefill = now

  if (bucket.tokens < tokensPerRequest) {
    // Not enough tokens
    await client.setex(key, 60, JSON.stringify(bucket))

    return {
      allowed: false,
      remaining: Math.floor(bucket.tokens),
      retryAfter: Math.ceil((tokensPerRequest - bucket.tokens) / refillRate)
    }
  }

  // Consume tokens
  bucket.tokens -= tokensPerRequest

  await client.setex(key, 60, JSON.stringify(bucket))

  return {
    allowed: true,
    remaining: Math.floor(bucket.tokens)
  }
}

// Usage example: 100 token capacity, refill 10 tokens/second
app.use('/api/', async (req, res, next) => {
  const userId = req.user?.id || req.ip
  const result = await tokenBucket(userId, 100, 10)

  res.set({
    'X-RateLimit-Limit': 100,
    'X-RateLimit-Remaining': result.remaining
  })

  if (!result.allowed) {
    res.set('Retry-After', result.retryAfter)
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests.'
      }
    })
  }

  next()
})
```

### 5. Leaky Bucket

**Algorithm:**
- Requests queue in bucket
- Process at constant rate
- Overflow requests rejected
- Smooths traffic spikes

**Pros:**
- Constant output rate
- Smooths traffic
- Predictable resource usage

**Cons:**
- Adds latency (queueing)
- More complex
- Can delay urgent requests

**Implementation:**
```javascript
class LeakyBucket {
  constructor(capacity, leakRate) {
    this.capacity = capacity
    this.leakRate = leakRate // requests per second
    this.queue = []
    this.processing = false
  }

  async add(request) {
    if (this.queue.length >= this.capacity) {
      throw new Error('RATE_LIMIT_EXCEEDED')
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject })
      this.processQueue()
    })
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()

      try {
        const result = await item.request()
        item.resolve(result)
      } catch (error) {
        item.reject(error)
      }

      // Wait based on leak rate
      await new Promise(resolve =>
        setTimeout(resolve, 1000 / this.leakRate)
      )
    }

    this.processing = false
  }
}

// Usage
const bucket = new LeakyBucket(100, 10) // capacity: 100, rate: 10 req/s

app.use('/api/', async (req, res, next) => {
  try {
    await bucket.add(() => Promise.resolve())
    next()
  } catch (error) {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Queue full.'
      }
    })
  }
})
```

## Tiered Rate Limiting

Different limits for different user types:

```javascript
function getRateLimitTier(user) {
  if (!user) {
    return { limit: 10, window: 60 } // Anonymous: 10/min
  }

  if (user.plan === 'premium') {
    return { limit: 1000, window: 60 } // Premium: 1000/min
  }

  if (user.plan === 'pro') {
    return { limit: 500, window: 60 } // Pro: 500/min
  }

  return { limit: 100, window: 60 } // Free: 100/min
}

function dynamicRateLimitMiddleware() {
  return async (req, res, next) => {
    const tier = getRateLimitTier(req.user)
    const userId = req.user?.id || req.ip

    const result = await slidingWindowCounter(userId, tier.limit, tier.window)

    res.set({
      'X-RateLimit-Limit': tier.limit,
      'X-RateLimit-Remaining': result.remaining
    })

    if (!result.allowed) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded for your plan.'
        }
      })
    }

    next()
  }
}
```

## Endpoint-Specific Rate Limits

Different limits for different endpoints:

```javascript
const rateLimits = {
  'POST /auth/login': { limit: 5, window: 300 }, // 5 per 5 minutes
  'POST /users': { limit: 10, window: 3600 }, // 10 per hour
  'GET /users': { limit: 100, window: 60 }, // 100 per minute
  'GET /posts': { limit: 1000, window: 60 } // 1000 per minute
}

function endpointRateLimitMiddleware() {
  return async (req, res, next) => {
    const endpoint = `${req.method} ${req.route.path}`
    const limits = rateLimits[endpoint] || { limit: 60, window: 60 }

    const userId = req.user?.id || req.ip
    const key = `${userId}:${endpoint}`

    const result = await slidingWindowCounter(key, limits.limit, limits.window)

    res.set({
      'X-RateLimit-Limit': limits.limit,
      'X-RateLimit-Remaining': result.remaining
    })

    if (!result.allowed) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded for ${endpoint}`
        }
      })
    }

    next()
  }
}
```

## Cost-Based Rate Limiting

Different operations have different costs:

```javascript
const operationCosts = {
  'GET /users/:id': 1,
  'GET /users': 2,
  'POST /users': 5,
  'DELETE /users/:id': 5,
  'POST /reports/generate': 50
}

function costBasedRateLimitMiddleware(capacity, refillRate) {
  return async (req, res, next) => {
    const endpoint = `${req.method} ${req.route.path}`
    const cost = operationCosts[endpoint] || 1

    const userId = req.user?.id || req.ip
    const result = await tokenBucket(userId, capacity, refillRate, cost)

    res.set({
      'X-RateLimit-Limit': capacity,
      'X-RateLimit-Remaining': result.remaining
    })

    if (!result.allowed) {
      res.set('Retry-After', result.retryAfter)
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Insufficient quota. Operation costs ${cost} tokens.`
        }
      })
    }

    next()
  }
}

// Usage: 1000 token capacity, refill 10 tokens/second
app.use('/api/', costBasedRateLimitMiddleware(1000, 10))
```

## Distributed Rate Limiting

For multi-server deployments, use Redis:

```javascript
const Redis = require('ioredis')
const redis = new Redis({
  host: 'redis-server',
  port: 6379,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3
})

// Lua script for atomic rate limiting (sliding window counter)
const slidingWindowLua = `
local current_key = KEYS[1]
local previous_key = KEYS[2]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local current_count = tonumber(redis.call('get', current_key) or 0)
local previous_count = tonumber(redis.call('get', previous_key) or 0)

local window_progress = (now % (window * 1000)) / (window * 1000)
local estimated_count = previous_count * (1 - window_progress) + current_count

if estimated_count >= limit then
  return {0, math.floor(estimated_count)}
end

redis.call('incr', current_key)
redis.call('expire', current_key, window * 2)

return {1, math.floor(limit - estimated_count - 1)}
`

async function distributedRateLimit(userId, limit, windowSeconds) {
  const now = Date.now()
  const currentWindow = Math.floor(now / (windowSeconds * 1000))
  const previousWindow = currentWindow - 1

  const currentKey = `rate_limit:${userId}:${currentWindow}`
  const previousKey = `rate_limit:${userId}:${previousWindow}`

  const [allowed, remaining] = await redis.eval(
    slidingWindowLua,
    2,
    currentKey,
    previousKey,
    limit,
    windowSeconds,
    now
  )

  return {
    allowed: allowed === 1,
    remaining
  }
}
```

## Rate Limit Headers

Standard headers to include:

```javascript
function setRateLimitHeaders(res, limit, remaining, resetAt) {
  res.set({
    'X-RateLimit-Limit': limit,
    'X-RateLimit-Remaining': remaining,
    'X-RateLimit-Reset': Math.floor(resetAt / 1000),
    'X-RateLimit-Used': limit - remaining
  })
}

function setRetryAfterHeader(res, resetAt) {
  const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000)
  res.set('Retry-After', retryAfterSeconds)
}
```

## Rate Limiting with Express-Rate-Limit (Simple Solution)

For simpler use cases:

```bash
npm install express-rate-limit redis rate-limit-redis
```

```javascript
const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const redis = require('redis')

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
      }
    })
  }
})

// Apply to all routes
app.use('/api/', limiter)

// Or specific routes
app.post('/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per 15 minutes
}), loginHandler)
```

## Monitoring and Analytics

Track rate limit hits:

```javascript
async function trackRateLimitHit(userId, endpoint) {
  const timestamp = Date.now()
  const key = `rate_limit:hits:${userId}`

  await redis.zadd(key, timestamp, JSON.stringify({
    endpoint,
    timestamp
  }))

  await redis.expire(key, 86400) // Keep for 24 hours

  // Increment counter for monitoring
  await redis.incr(`rate_limit:total_hits:${Date.now() / (3600 * 1000)}`)
}

// Dashboard query
async function getRateLimitStats(userId) {
  const key = `rate_limit:hits:${userId}`
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)

  const hits = await redis.zrangebyscore(key, oneDayAgo, '+inf')

  return {
    totalHits: hits.length,
    hits: hits.map(h => JSON.parse(h))
  }
}
```

## Best Practices

1. **Choose the right algorithm**:
   - Simple API: Fixed window
   - Fair limiting: Sliding window counter
   - Burst handling: Token bucket
   - Smooth traffic: Leaky bucket

2. **Implement tiered limits** based on user plan

3. **Use different limits for different endpoints**

4. **Include informative headers** (limit, remaining, reset)

5. **Return clear error messages** with retry guidance

6. **Use Redis for distributed systems**

7. **Monitor rate limit hits** to detect abuse

8. **Implement IP-based limits** for unauthenticated requests

9. **Allow rate limit bypass** for internal services

10. **Test rate limiting thoroughly** including edge cases

11. **Document rate limits** in API documentation

12. **Consider implementing rate limit quotas** (daily, monthly)

13. **Log rate limit violations** for security monitoring

14. **Implement gradual backoff** recommendations for clients

15. **Use atomic operations** (Lua scripts) in Redis for accuracy
