/**
 * Redis Cache-Aside Pattern Example
 *
 * This example demonstrates implementing cache-aside (lazy loading)
 * pattern with Redis for database query caching.
 */

const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Promisify Redis methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setexAsync = promisify(redisClient.setex).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Mock database (replace with actual DB connection)
const db = {
  query: async (sql, params) => {
    // Simulate database query latency
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock user data
    return {
      id: params[0],
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString()
    };
  }
};

/**
 * Get user by ID with cache-aside pattern
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 */
async function getUser(userId) {
  const cacheKey = `user:${userId}`;
  const TTL = 3600; // 1 hour

  try {
    // 1. Check cache first
    const cached = await getAsync(cacheKey);

    if (cached) {
      console.log(`Cache HIT for ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`Cache MISS for ${cacheKey}`);

    // 2. Cache miss - query database
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    // 3. Populate cache
    await setexAsync(cacheKey, TTL, JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Error in getUser:', error);

    // Fallback to database on cache error
    return await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}

/**
 * Update user with cache invalidation
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user object
 */
async function updateUser(userId, userData) {
  const cacheKey = `user:${userId}`;

  try {
    // 1. Update database
    await db.query('UPDATE users SET ? WHERE id = ?', [userData, userId]);

    // 2. Invalidate cache
    await delAsync(cacheKey);
    console.log(`Cache invalidated for ${cacheKey}`);

    // 3. Return updated user (next read will populate cache)
    return { id: userId, ...userData };
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

/**
 * Get multiple users with batch caching
 * @param {number[]} userIds - Array of user IDs
 * @returns {Promise<Object[]>} Array of user objects
 */
async function getUsers(userIds) {
  const TTL = 3600;
  const results = [];
  const missingIds = [];

  // Check cache for each user
  for (const userId of userIds) {
    const cacheKey = `user:${userId}`;
    const cached = await getAsync(cacheKey);

    if (cached) {
      console.log(`Cache HIT for ${cacheKey}`);
      results.push(JSON.parse(cached));
    } else {
      console.log(`Cache MISS for ${cacheKey}`);
      missingIds.push(userId);
    }
  }

  // Batch query for cache misses
  if (missingIds.length > 0) {
    const users = await db.query(
      `SELECT * FROM users WHERE id IN (${missingIds.join(',')})`,
      []
    );

    // Cache each user
    for (const user of users) {
      const cacheKey = `user:${user.id}`;
      await setexAsync(cacheKey, TTL, JSON.stringify(user));
      results.push(user);
    }
  }

  return results;
}

/**
 * Cache warming - preload frequently accessed data
 */
async function warmCache() {
  console.log('Starting cache warming...');

  try {
    // Get popular users from database
    const popularUsers = await db.query(
      'SELECT * FROM users ORDER BY login_count DESC LIMIT 100',
      []
    );

    // Populate cache
    for (const user of popularUsers) {
      const cacheKey = `user:${user.id}`;
      await setexAsync(cacheKey, 3600, JSON.stringify(user));
    }

    console.log(`Cache warmed with ${popularUsers.length} users`);
  } catch (error) {
    console.error('Error warming cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache stats
 */
async function getCacheStats() {
  const info = await promisify(redisClient.info).bind(redisClient)('stats');

  const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || 0);
  const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || 0);
  const hitRate = hits / (hits + misses) || 0;

  return {
    hits,
    misses,
    hitRate: (hitRate * 100).toFixed(2) + '%'
  };
}

// Cleanup on shutdown
process.on('SIGTERM', () => {
  redisClient.quit();
});

// Example usage
async function main() {
  try {
    // Warm cache on startup
    await warmCache();

    // Get user (cache miss on first call)
    const user1 = await getUser(123);
    console.log('User 1:', user1);

    // Get same user (cache hit)
    const user2 = await getUser(123);
    console.log('User 2:', user2);

    // Update user (invalidates cache)
    await updateUser(123, { name: 'Jane Doe' });

    // Get cache stats
    const stats = await getCacheStats();
    console.log('Cache stats:', stats);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    redisClient.quit();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getUser,
  updateUser,
  getUsers,
  warmCache,
  getCacheStats
};
