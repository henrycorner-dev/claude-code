---
description: Optimizes for production scale; caching, DB sharding.
allowed-tools: ['Read', 'Glob', 'Grep', 'Edit', 'Write', 'Bash', 'TodoWrite', 'WebFetch']
---

You are tasked with optimizing the application for production scale by implementing caching strategies and database sharding.

## Your tasks:

1. **Analyze Current Architecture**
   - Review the current database setup and identify bottlenecks
   - Identify high-traffic endpoints and data access patterns
   - Determine what data is frequently accessed and could benefit from caching

2. **Implement Caching Strategy**
   - Choose appropriate caching solution (Redis, Memcached, or in-memory caching)
   - Implement cache layers for:
     - Frequently accessed database queries
     - API responses
     - Session data
     - Static assets
   - Add cache invalidation strategies
   - Set appropriate TTL (Time To Live) values
   - Implement cache warming for critical data

3. **Design Database Sharding**
   - Analyze data distribution and growth patterns
   - Choose sharding strategy (horizontal, vertical, or hybrid)
   - Select sharding key based on data access patterns
   - Plan shard distribution and replication
   - Implement shard routing logic
   - Add connection pooling for each shard

4. **Performance Optimization**
   - Add database query optimization and indexing
   - Implement read replicas for read-heavy operations
   - Add connection pooling and query batching
   - Optimize N+1 query problems

5. **Monitoring & Metrics**
   - Add monitoring for cache hit/miss rates
   - Track database shard performance
   - Set up alerts for performance degradation
   - Implement logging for cache and database operations

6. **Testing**
   - Create load tests to verify scaling improvements
   - Test failover scenarios for shards
   - Verify cache invalidation works correctly
   - Test data consistency across shards

Please analyze the codebase and implement these optimizations systematically, ensuring backward compatibility and data integrity throughout the process.
