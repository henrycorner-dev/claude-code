---
description: Optimization sprint focusing on performance and efficiency
argument-hint: Optimization goals (perf/SEO/etc)
allowed-tools: ['Glob', 'Read', 'Grep', 'Bash', 'Task', 'TodoWrite']
---

# Henry Optimization Sprint

You are orchestrating a focused optimization sprint using the Henry Orchestrator's specialist agents. Follow a systematic approach to identify and fix performance, efficiency, and quality issues.

## Initial Context

**Optimization Request:** $ARGUMENTS

## Core Principles

- **Baseline first**: Measure before optimizing
- **Data-driven**: Use metrics to guide decisions
- **Impact-focused**: Prioritize high-impact improvements
- **Verify results**: Measure improvements with before/after
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Optimization Scope Definition

**Goal**: Understand what to optimize and current baselines

**Actions**:

1. Create todo list with all phases
2. Determine optimization focus from $ARGUMENTS:
   - **Performance**: Speed, Core Web Vitals, load times
   - **Bundle size**: JavaScript/CSS optimization
   - **SEO**: Search visibility and rankings
   - **Database**: Query performance, indexing
   - **API**: Response times, throughput
   - **Cost**: Infrastructure cost reduction
   - **User experience**: Perceived performance
   - **All**: Comprehensive optimization
3. Identify target areas:
   - Specific pages/routes
   - Specific features
   - Entire application
   - Infrastructure
4. Ask user for context:
   - Current pain points or complaints?
   - Any performance budgets?
   - Acceptable trade-offs (size vs speed)?
   - Target metrics or improvements?
   - Timeline and resources available?

**Wait for user confirmation before proceeding.**

---

## Phase 2: Baseline Assessment

**Goal**: Establish current performance metrics

**Actions**:

1. Launch `performance-engineer` agent to:
   - **Frontend Baseline** (if applicable):
     - Core Web Vitals current state:
       - LCP (Largest Contentful Paint)
       - INP (Interaction to Next Paint)
       - CLS (Cumulative Layout Shift)
     - Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
     - Bundle analysis:
       - Total bundle size
       - Vendor bundle size
       - Application code size
       - Unused code percentage
     - Resource metrics:
       - Number of requests
       - Total page weight
       - Time to Interactive (TTI)
       - First Contentful Paint (FCP)
     - JavaScript execution time
     - Render-blocking resources
   - **Backend Baseline** (if applicable):
     - API response times (P50, P95, P99)
     - Database query performance
     - Cache hit rates
     - Resource utilization (CPU, memory)
     - Concurrent request handling
   - **Real User Metrics** (if available):
     - RUM data analysis
     - Geographic performance
     - Device/browser performance
     - Network condition impact
2. Agent returns baseline report with:
   - Current metrics vs industry benchmarks
   - Performance distribution (percentiles)
   - Slowest pages/endpoints
   - Quick win opportunities identified
3. Present baseline assessment
4. Define target metrics:
   - Example: "LCP from 4.2s → <2.5s"
   - Example: "Bundle size from 800KB → <500KB"
   - Example: "API P95 from 800ms → <200ms"

**Wait for user confirmation on targets before proceeding.**

---

## Phase 3: Performance Optimization

**Goal**: Identify and implement performance improvements

**Actions**:

1. Continue with `performance-engineer` agent to:
   - **Frontend Optimizations**:
     - **Code Splitting**:
       - Route-based splitting
       - Component lazy loading
       - Vendor chunk optimization
     - **Bundle Optimization**:
       - Tree shaking configuration
       - Dead code elimination
       - Minification and compression (Brotli/Gzip)
       - Module federation (if applicable)
     - **Resource Optimization**:
       - Image optimization (WebP/AVIF, responsive images, lazy loading)
       - Font optimization (subsetting, preload, font-display)
       - CSS optimization (purge unused, critical CSS)
       - Third-party script optimization
     - **Rendering Optimization**:
       - SSR/ISR for critical pages
       - Hydration optimization
       - Virtual scrolling for lists
       - Debouncing/throttling interactions
     - **Caching**:
       - Browser caching headers
       - Service Worker caching
       - CDN configuration
       - Prefetching/preloading strategies
   - **Backend Optimizations**:
     - **Database**:
       - Query optimization (EXPLAIN analysis)
       - Index creation
       - N+1 query elimination
       - Connection pooling tuning
       - Query result caching
     - **API**:
       - Response compression
       - Pagination optimization
       - GraphQL query optimization
       - API response caching
       - Async processing for heavy operations
     - **Caching**:
       - Redis/Memcached implementation
       - Cache warming strategies
       - Cache invalidation logic
       - Edge caching (CDN)
   - **Infrastructure**:
     - Auto-scaling configuration
     - Load balancer optimization
     - Database read replicas
     - CDN utilization
2. Agent returns optimization plan:
   - Prioritized list by impact vs effort
   - Expected improvements per optimization
   - Implementation guidance
   - Risk assessment for each change
3. Present optimization recommendations
4. Ask user which optimizations to implement:
   - **Quick wins first**: Low effort, high impact
   - **Comprehensive**: All recommended optimizations
   - **Specific focus**: User selects priority areas

**Wait for user approval before implementation.**

---

## Phase 4: Frontend Implementation (If Applicable)

**Goal**: Implement frontend optimizations

**Actions**:

1. Launch `frontend-engineer` agent to:
   - Implement code splitting
   - Configure lazy loading
   - Optimize images and assets
   - Implement caching strategies
   - Add performance monitoring
   - Update build configuration
2. For each optimization:
   - Implement changes
   - Test functionality
   - Measure impact
   - Document trade-offs
3. Agent provides implementation summary with file changes

---

## Phase 5: Backend Implementation (If Applicable)

**Goal**: Implement backend optimizations

**Actions**:

1. Launch `backend-engineer` agent to:
   - Optimize database queries
   - Add/update indexes
   - Implement caching layer
   - Optimize API responses
   - Configure compression
   - Tune connection pooling
2. For each optimization:
   - Implement changes
   - Run performance tests
   - Measure improvement
   - Check for regressions
3. Agent provides implementation summary with metrics

---

## Phase 6: SEO Optimization (If Applicable)

**Goal**: Improve search visibility and organic traffic

**Actions**:

1. If SEO is in scope, launch `seo-specialist` agent to:
   - **Technical SEO**:
     - Fix crawl issues
     - Improve site structure
     - Optimize page speed
     - Implement schema markup
     - Fix canonical issues
   - **On-Page SEO**:
     - Optimize title tags and meta descriptions
     - Improve heading hierarchy
     - Add internal links
     - Optimize images (alt text, file names)
   - **Content Optimization**:
     - Keyword optimization
     - Content freshness
     - Featured snippet optimization
     - E-E-A-T improvements
2. Agent returns SEO optimization plan:
   - Quick wins (metadata fixes)
   - Technical improvements
   - Content enhancements
   - Expected visibility impact
3. Implement SEO optimizations

---

## Phase 7: Analytics & Tracking

**Goal**: Ensure we can measure optimization impact

**Actions**:

1. Launch `data-analytics-engineer` agent to:
   - **Performance Tracking**:
     - Set up RUM (Real User Monitoring)
     - Configure synthetic monitoring
     - Create performance dashboards
     - Set up performance alerts
   - **Metrics Definition**:
     - Core Web Vitals tracking
     - Custom performance marks
     - Business metric correlation
     - A/B test framework (if testing optimizations)
   - **Before/After Analysis**:
     - Baseline data capture
     - Comparison methodology
     - Statistical significance testing
2. Agent provides tracking implementation:
   - Instrumentation code
   - Dashboard configuration
   - Alert thresholds
3. Verify tracking is working correctly

---

## Phase 8: Performance Testing & Validation

**Goal**: Verify optimizations achieve target improvements

**Actions**:

1. With `performance-engineer`, conduct performance testing:
   - **Synthetic Testing**:
     - Lighthouse audits (before/after)
     - WebPageTest runs
     - Core Web Vitals measurement
   - **Load Testing**:
     - API load tests (before/after)
     - Database query benchmarks
     - Stress testing
     - Spike testing
   - **Real User Monitoring**:
     - Deploy to production (gradual rollout)
     - Monitor RUM data
     - Compare to baseline
   - **Regression Testing**:
     - Functional tests passing
     - No new bugs introduced
     - User journeys working
2. Collect results:
   - Before/after metrics comparison
   - Percentage improvements
   - Statistical significance
   - User impact assessment
3. Create performance report:

   ```markdown
   # Optimization Results

   ## Frontend Performance

   | Metric | Before | After | Change  | Target |
   | ------ | ------ | ----- | ------- | ------ |
   | LCP    | 4.2s   | 2.1s  | -50% ✅ | <2.5s  |
   | INP    | 350ms  | 180ms | -49% ✅ | <200ms |
   | CLS    | 0.15   | 0.05  | -67% ✅ | <0.1   |
   | Bundle | 800KB  | 450KB | -44% ✅ | <500KB |

   ## Backend Performance

   | Metric    | Before | After | Change  | Target |
   | --------- | ------ | ----- | ------- | ------ |
   | API P95   | 800ms  | 150ms | -81% ✅ | <200ms |
   | DB Query  | 250ms  | 45ms  | -82% ✅ | <100ms |
   | Cache Hit | 45%    | 85%   | +89% ✅ | >70%   |

   ## Business Impact

   - Page load time reduced by 50%
   - Server costs reduced by 30%
   - SEO rankings improved for 12 keywords
   ```

---

## Phase 9: Monitoring & Performance Budgets

**Goal**: Prevent performance regressions

**Actions**:

1. With `performance-engineer`, set up ongoing monitoring:
   - **Performance Budgets**:
     - Define budgets for key metrics
     - Configure CI/CD enforcement
     - Set up budget alerts
   - **Continuous Monitoring**:
     - Real-time performance dashboards
     - Alerting on regressions
     - Regular performance audits
   - **Performance Culture**:
     - Performance review in PRs
     - Lighthouse CI integration
     - Bundle size tracking
2. Create performance budget document:
   ```yaml
   performance_budgets:
     frontend:
       lcp: 2500ms
       inp: 200ms
       cls: 0.1
       bundle_size: 500KB
       lighthouse_score: 90
     backend:
       api_p95: 200ms
       db_query_p95: 100ms
       cache_hit_rate: 70%
   ```
3. Configure automated checks:
   - Lighthouse CI on PR
   - Bundle size check on PR
   - Load test on deploy

---

## Phase 10: Cost Optimization (Optional)

**Goal**: Reduce infrastructure costs while maintaining performance

**Actions**:

1. If cost optimization is in scope, launch `devops-sre-architect` to:
   - **Resource Right-Sizing**:
     - Analyze utilization metrics
     - Downsize over-provisioned resources
     - Implement auto-scaling
   - **Cost Analysis**:
     - Identify top cost drivers
     - Unused resource elimination
     - Reserved instance opportunities
     - Spot instance usage
   - **Architecture Optimization**:
     - Serverless for sporadic workloads
     - CDN for static assets
     - Database optimization
     - Data transfer reduction
2. Agent returns cost optimization plan:
   - Current spend breakdown
   - Optimization opportunities
   - Expected savings
   - Risk assessment
3. Implement cost optimizations
4. Track cost metrics before/after

---

## Phase 11: Summary & Ongoing Optimization

**Goal**: Document achievements and plan continuous improvement

**Actions**:

1. Mark all todos complete
2. Generate comprehensive optimization summary:
   - **Baseline Metrics**: Where we started
   - **Target Metrics**: What we aimed for
   - **Achieved Results**: What we accomplished
   - **Optimizations Implemented**: What we changed
   - **Performance Gains**: Quantified improvements
   - **Business Impact**: User experience and cost improvements
   - **Monitoring Setup**: How we prevent regressions
   - **Next Steps**: Further optimization opportunities
3. Create before/after comparison:
   - Visual performance charts
   - Lighthouse score comparison
   - User experience improvements
   - Cost savings
4. Provide ongoing optimization plan:
   - **Weekly**: Monitor performance dashboards
   - **Monthly**: Performance audit
   - **Quarterly**: Deep optimization sprint
   - **Per release**: Performance regression check
5. Document lessons learned:
   - What worked well
   - What didn't work
   - Trade-offs made
   - Best practices discovered

---

## Usage Examples

**Frontend performance optimization:**

```
/henry-orchestrator:henry-optimize Optimize Core Web Vitals for our landing page
```

**Backend API optimization:**

```
/henry-orchestrator:henry-optimize Improve API response times, currently 800ms P95
```

**Bundle size reduction:**

```
/henry-orchestrator:henry-optimize Reduce bundle size, currently 1.2MB
```

**Comprehensive optimization:**

```
/henry-orchestrator:henry-optimize Full optimization sprint - frontend, backend, SEO
```

**Database optimization:**

```
/henry-orchestrator:henry-optimize Optimize database queries, fix N+1 issues
```

**SEO optimization:**

```
/henry-orchestrator:henry-optimize Improve search rankings and Core Web Vitals
```

**Cost optimization:**

```
/henry-orchestrator:henry-optimize Reduce AWS costs while maintaining performance
```

## Usage Tips

- **Be specific**: "Optimize LCP" vs "make it faster"
- **Provide context**: Share current metrics and pain points
- **Set targets**: "Reduce to <2.5s" vs "make it fast"
- **Measure first**: Always establish baseline before optimizing
- **Gradual rollout**: Test optimizations with small percentage first
- **Monitor closely**: Watch for regressions after deployment

## Optimization Focus Areas

- **Frontend**: Bundle size, Core Web Vitals, rendering
- **Backend**: API latency, database queries, caching
- **Infrastructure**: Scaling, costs, resource utilization
- **SEO**: Page speed, crawlability, rankings
- **User Experience**: Perceived performance, smoothness
- **Cost**: Infrastructure spend optimization

## Success Metrics

- **Performance**: Metrics meet targets (e.g., LCP <2.5s)
- **User Impact**: Improved user satisfaction, conversions
- **Business**: Reduced costs, improved SEO rankings
- **Sustainability**: Regressions prevented with monitoring

## Common Quick Wins

- Image optimization (WebP, lazy loading)
- Code splitting and lazy loading
- Browser caching headers
- Gzip/Brotli compression
- Database index addition
- Query result caching
- CDN for static assets
- Third-party script optimization

---

Use TodoWrite to track progress through all optimization phases.
