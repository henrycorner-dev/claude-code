---
name: performance-optimization
description: This skill should be used when the user asks to "optimize performance", "add caching", "implement Redis caching", "set up lazy loading", "add code splitting", "optimize database queries", "add database indexes", "profile application performance", "reduce page load time", "improve API response time", or mentions performance bottlenecks, slow queries, or optimization strategies.
version: 0.1.0
---

# Performance Optimization

This skill provides guidance for identifying, analyzing, and resolving performance bottlenecks in web applications. It covers profiling techniques, caching strategies, lazy loading, code splitting, and database optimization.

## When to Use This Skill

Use this skill when:

- Application response times are slow or degrading
- Database queries are taking too long
- Page load times need improvement
- Memory usage is excessive
- API endpoints have high latency
- Users report performance issues

## Core Performance Optimization Strategies

### 1. Profiling and Measurement

Before optimizing, measure and identify bottlenecks. Never optimize without data.

**Key Profiling Approaches:**

- Application Performance Monitoring (APM) tools
- Browser DevTools Performance tab
- Database query analysis
- Network waterfall analysis
- Memory profiling

**Essential Metrics:**

- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

For detailed profiling techniques and tool usage, consult `references/profiling-guide.md`.

### 2. Caching Strategies

Caching reduces redundant computation and database queries by storing frequently accessed data.

**Caching Levels:**

- **Browser caching**: HTTP cache headers (Cache-Control, ETag)
- **CDN caching**: Static asset distribution
- **Application caching**: In-memory caches (Redis, Memcached)
- **Database caching**: Query result caching

**Redis Implementation Basics:**

```
Common patterns:
- Cache-aside: Check cache, fetch from DB if miss, populate cache
- Write-through: Write to cache and DB simultaneously
- Write-behind: Write to cache, async write to DB
- TTL-based expiration: Set appropriate time-to-live values
```

For complete Redis patterns, configuration, and best practices, see `references/caching-strategies.md`.

### 3. Lazy Loading

Defer loading resources until needed to reduce initial load time and memory usage.

**Lazy Loading Targets:**

- **Images**: Load images as they enter viewport
- **Components**: Dynamic imports for React/Vue/Angular components
- **Routes**: Load route bundles on demand
- **Data**: Fetch data when components mount or on user interaction

**Quick Implementation:**

```javascript
// Image lazy loading (native)
<img src="image.jpg" loading="lazy" alt="..." />;

// Component lazy loading (React)
const LazyComponent = React.lazy(() => import('./Component'));

// Route lazy loading (React Router)
const Home = lazy(() => import('./pages/Home'));
```

See `examples/lazy-loading/` for complete implementations across frameworks.

### 4. Code Splitting

Split JavaScript bundles to reduce initial load size and enable parallel loading.

**Code Splitting Strategies:**

- **Route-based splitting**: Separate bundles per route
- **Component-based splitting**: Split large components
- **Vendor splitting**: Separate third-party libraries
- **Dynamic imports**: Load code conditionally

**Webpack Configuration:**

```javascript
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      }
    }
  }
}
```

For advanced splitting techniques and bundler-specific configuration, see `references/code-splitting.md`.

### 5. Database Indexing

Database indexes dramatically improve query performance for read-heavy workloads.

**Indexing Fundamentals:**

- Index columns used in WHERE clauses
- Index columns used in JOIN conditions
- Index columns used in ORDER BY
- Composite indexes for multi-column queries
- Avoid over-indexing (impacts write performance)

**Index Types:**

- **B-tree**: Default, good for equality and range queries
- **Hash**: Fast equality lookups, no range support
- **Full-text**: Text search optimization
- **Spatial**: Geographic data queries

**Quick Analysis:**

```sql
-- Explain query execution plan (PostgreSQL)
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- Explain query execution plan (MySQL)
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Show slow queries (MySQL)
SHOW FULL PROCESSLIST;
```

For comprehensive database optimization techniques, indexing strategies, and query optimization, see `references/database-optimization.md`.

## Performance Optimization Workflow

Follow this systematic approach:

### Step 1: Identify Bottlenecks

- Use profiling tools to measure current performance
- Identify slow queries, endpoints, or components
- Gather metrics (response times, resource usage)
- Prioritize by impact and frequency

### Step 2: Establish Baseline

- Document current performance metrics
- Set specific, measurable goals
- Create performance budgets

### Step 3: Apply Optimizations

- Start with highest-impact bottlenecks
- Apply one optimization at a time
- Measure after each change
- Document what was changed and why

### Step 4: Validate Improvements

- Compare before/after metrics
- Test under realistic load conditions
- Monitor for regressions
- Verify user experience improvements

### Step 5: Monitor Continuously

- Set up performance monitoring
- Create alerts for degradation
- Regular performance reviews
- Track trends over time

## Quick Reference Table

| Problem                | Solution                     | Typical Impact    | Complexity  |
| ---------------------- | ---------------------------- | ----------------- | ----------- |
| Slow database queries  | Add indexes                  | 10-100x faster    | Low         |
| Repeated DB queries    | Implement Redis cache        | 50-1000x faster   | Medium      |
| Large initial bundle   | Code splitting               | 30-50% smaller    | Medium      |
| Slow image loading     | Lazy loading                 | 40-60% faster FCP | Low         |
| High server load       | Caching layers               | 80-95% reduction  | Medium-High |
| Slow API responses     | Query optimization + caching | 5-50x faster      | Medium      |
| Heavy client rendering | Server-side rendering        | 30-70% faster FCP | High        |

## Common Optimization Patterns

### Pattern 1: Database Query + Redis Cache

```
1. Check Redis for cached result
2. If cache hit, return cached data
3. If cache miss, query database
4. Store result in Redis with TTL
5. Return data
```

See `examples/redis-cache-aside/` for implementation.

### Pattern 2: Image Lazy Loading + CDN

```
1. Serve images from CDN with cache headers
2. Use lazy loading for below-fold images
3. Implement responsive images (srcset)
4. Apply image optimization (WebP, compression)
```

See `examples/lazy-loading/images/` for implementation.

### Pattern 3: Route-Based Code Splitting

```
1. Split application by route boundaries
2. Preload critical routes
3. Prefetch likely next routes
4. Lazy load on-demand features
```

See `examples/code-splitting/routes/` for implementation.

## Tools and Utilities

This skill includes utility scripts for common performance tasks:

### Profiling Scripts

- **`scripts/analyze-bundle.sh`** - Analyze webpack bundle size
- **`scripts/measure-metrics.js`** - Capture Core Web Vitals
- **`scripts/query-analyzer.sh`** - Analyze slow database queries

### Testing Scripts

- **`scripts/load-test.sh`** - Run load tests with Artillery
- **`scripts/benchmark.js`** - Benchmark critical paths

Run scripts from the skill directory or reference them as needed.

## Technology-Specific Guidance

### Frontend Frameworks

- **React**: Dynamic imports, React.lazy, Suspense
- **Vue**: Async components, lazy routes
- **Angular**: Lazy loading modules
- **Next.js**: Automatic code splitting, ISR, SSG

### Backend Frameworks

- **Node.js**: Clustering, caching middleware
- **Django**: QuerySet optimization, cache framework
- **Rails**: Russian Doll caching, eager loading
- **Spring**: Hibernate caching, query optimization

### Databases

- **PostgreSQL**: Indexes, EXPLAIN ANALYZE, pg_stat_statements
- **MySQL**: Indexes, slow query log, EXPLAIN
- **MongoDB**: Indexes, aggregation pipeline optimization
- **Redis**: Caching patterns, data structures

See `references/` for framework-specific deep dives.

## Best Practices

**Always:**

- Measure before optimizing (data-driven decisions)
- Set performance budgets and monitor them
- Consider trade-offs (complexity vs. performance gain)
- Test optimizations under realistic conditions
- Document optimization decisions and results

**Avoid:**

- Premature optimization without profiling
- Over-caching (stale data issues)
- Over-indexing databases (write performance impact)
- Complex optimizations for negligible gains
- Optimizing without monitoring

**Remember:**

- User-perceived performance matters most
- Network latency often dominates
- Mobile performance requires special attention
- Performance is a feature, not an afterthought

## Additional Resources

### Reference Files

For detailed optimization techniques, consult:

- **`references/profiling-guide.md`** - Comprehensive profiling tools and techniques
- **`references/caching-strategies.md`** - Redis patterns, cache invalidation, distributed caching
- **`references/code-splitting.md`** - Advanced bundling strategies, tree shaking, dynamic imports
- **`references/database-optimization.md`** - Query optimization, indexing strategies, connection pooling

### Example Implementations

Working examples in `examples/`:

- **`examples/redis-cache-aside/`** - Complete Redis cache implementation
- **`examples/lazy-loading/`** - Image and component lazy loading
- **`examples/code-splitting/`** - Webpack and framework-specific splitting
- **`examples/database-indexes/`** - Index creation and query optimization

### Utility Scripts

Performance analysis tools in `scripts/`:

- **`scripts/analyze-bundle.sh`** - Bundle size analysis
- **`scripts/measure-metrics.js`** - Core Web Vitals measurement
- **`scripts/query-analyzer.sh`** - Database query analysis
- **`scripts/load-test.sh`** - Load testing
- **`scripts/benchmark.js`** - Performance benchmarking

## Getting Started

To apply performance optimizations:

1. **Profile first**: Use scripts or tools to identify bottlenecks
2. **Choose strategy**: Select appropriate optimization (caching, lazy loading, etc.)
3. **Consult references**: Review detailed patterns in `references/`
4. **Use examples**: Adapt working code from `examples/`
5. **Measure impact**: Compare metrics before and after
6. **Iterate**: Continue optimizing highest-impact areas

Focus on user-perceived performance and data-driven decisions for maximum effectiveness.
