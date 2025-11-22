# Metrics Guide - Comprehensive Catalog

This guide provides a comprehensive catalog of metrics for performance, security, and quality monitoring.

## Table of Contents

- [Performance Metrics](#performance-metrics)
- [Security Metrics](#security-metrics)
- [Quality Metrics](#quality-metrics)
- [Monitoring and Alerting](#monitoring-and-alerting)

## Performance Metrics

### Core Web Vitals

**Largest Contentful Paint (LCP)**

- **Definition**: Time until the largest content element becomes visible
- **Target**: ≤ 2.5 seconds (Good), 2.5-4.0s (Needs Improvement), > 4.0s (Poor)
- **Measurement**: PerformanceObserver API, Lighthouse, WebPageTest
- **Optimization Focus**: Image optimization, server response time, resource load time

```javascript
// Measure LCP
new PerformanceObserver(list => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

**Interaction to Next Paint (INP)**

- **Definition**: Responsiveness of page to user interactions
- **Target**: ≤ 200ms (Good), 200-500ms (Needs Improvement), > 500ms (Poor)
- **Measurement**: PerformanceObserver API, Lighthouse
- **Optimization Focus**: Reduce JavaScript execution, optimize event handlers, reduce main thread work

```javascript
// Measure INP
new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    const inp = entry.processingStart - entry.startTime;
    console.log('INP:', inp);
  }
}).observe({ entryTypes: ['first-input'] });
```

**Cumulative Layout Shift (CLS)**

- **Definition**: Visual stability - unexpected layout shifts
- **Target**: ≤ 0.1 (Good), 0.1-0.25 (Needs Improvement), > 0.25 (Poor)
- **Measurement**: PerformanceObserver API, Lighthouse
- **Optimization Focus**: Include size attributes on images/videos, avoid inserting content above existing content, use transform animations

```javascript
// Measure CLS
let clsScore = 0;
new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      console.log('CLS:', clsScore);
    }
  }
}).observe({ entryTypes: ['layout-shift'] });
```

### Additional Performance Metrics

**Time to First Byte (TTFB)**

- **Definition**: Time from navigation start to receiving first byte from server
- **Target**: ≤ 600ms (Good), 600-1800ms (Moderate), > 1800ms (Poor)
- **Measurement**: Navigation Timing API, Server logs
- **Optimization Focus**: Server performance, CDN usage, caching

```javascript
// Measure TTFB
const ttfb = performance.timing.responseStart - performance.timing.requestStart;
console.log('TTFB:', ttfb);
```

**First Contentful Paint (FCP)**

- **Definition**: Time until first content element is rendered
- **Target**: ≤ 1.8s (Good), 1.8-3.0s (Needs Improvement), > 3.0s (Poor)
- **Measurement**: PerformanceObserver API, Lighthouse
- **Optimization Focus**: Eliminate render-blocking resources, optimize CSS delivery

**Speed Index**

- **Definition**: How quickly content is visually populated
- **Target**: ≤ 3.4s (Good), 3.4-5.8s (Moderate), > 5.8s (Poor)
- **Measurement**: Lighthouse, WebPageTest
- **Optimization Focus**: Optimize critical rendering path, progressive rendering

**Time to Interactive (TTI)**

- **Definition**: Time until page is fully interactive
- **Target**: ≤ 3.8s (Good), 3.8-7.3s (Moderate), > 7.3s (Poor)
- **Measurement**: Lighthouse, WebPageTest
- **Optimization Focus**: Reduce JavaScript execution, code splitting, remove unused code

### Resource Metrics

**Bundle Size**

- **Definition**: Total size of JavaScript bundles
- **Target**: Set custom budgets based on application needs (typical: 200-500KB gzipped)
- **Measurement**: Webpack Bundle Analyzer, source-map-explorer, bundlesize
- **Optimization Focus**: Code splitting, tree shaking, lazy loading

**Image Size**

- **Definition**: Total size of images loaded
- **Target**: Set custom budgets (typical: 500KB-1MB total)
- **Measurement**: DevTools Network tab, Lighthouse
- **Optimization Focus**: WebP/AVIF formats, responsive images, lazy loading, compression

**Total Page Weight**

- **Definition**: Sum of all resources (HTML, CSS, JS, images, fonts, etc.)
- **Target**: < 1.5MB total, < 500KB critical path
- **Measurement**: DevTools Network tab, WebPageTest
- **Optimization Focus**: All resource optimization techniques

**Request Count**

- **Definition**: Number of HTTP requests
- **Target**: < 50 requests (with HTTP/2), < 25 requests (HTTP/1.1)
- **Measurement**: DevTools Network tab
- **Optimization Focus**: Resource bundling, image sprites, inlining critical assets

### Caching Metrics

**Cache Hit Rate**

- **Definition**: Percentage of requests served from cache
- **Target**: ≥ 80% for static assets, ≥ 60% for API responses
- **Measurement**: CDN analytics, server logs, Service Worker metrics
- **Optimization Focus**: Appropriate cache headers, CDN configuration, Service Worker strategy

```javascript
// Track Service Worker cache hit rate
let cacheHits = 0;
let totalRequests = 0;

self.addEventListener('fetch', event => {
  totalRequests++;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        cacheHits++;
        console.log('Cache hit rate:', ((cacheHits / totalRequests) * 100).toFixed(2) + '%');
        return cached;
      }
      return fetch(event.request);
    })
  );
});
```

**CDN Bandwidth Savings**

- **Definition**: Reduction in origin server bandwidth due to CDN caching
- **Target**: ≥ 70% bandwidth served from CDN
- **Measurement**: CDN provider analytics
- **Optimization Focus**: Cache-Control headers, CDN configuration

### Real User Monitoring (RUM) Metrics

**75th Percentile Load Time**

- **Definition**: Time within which 75% of users experience page load
- **Target**: Set based on application needs (typical: < 3s)
- **Measurement**: RUM tools (Google Analytics, New Relic, Datadog)
- **Why 75th percentile**: Balances typical user experience with outliers

**Bounce Rate by Performance**

- **Definition**: Correlation between load time and users leaving
- **Target**: < 5% bounce rate increase per 1s load time increase
- **Measurement**: Analytics platforms
- **Insight**: Quantifies business impact of performance

## Security Metrics

### Vulnerability Metrics

**Critical Vulnerabilities**

- **Definition**: Vulnerabilities with CVSS score 9.0-10.0
- **Target**: 0 (always)
- **Measurement**: Security scanning tools (Snyk, npm audit, Dependabot)
- **Action**: Immediate remediation required

**High-Priority Vulnerabilities**

- **Definition**: Vulnerabilities with CVSS score 7.0-8.9
- **Target**: < 5 (trending down to 0)
- **Measurement**: Security scanning tools
- **Action**: Remediate within 7 days

**Medium/Low Vulnerabilities**

- **Definition**: Vulnerabilities with CVSS score < 7.0
- **Target**: < 20 (tracked but not blocking)
- **Measurement**: Security scanning tools
- **Action**: Remediate within 30 days or accept risk

**Time to Remediation**

- **Definition**: Time from vulnerability discovery to fix deployed
- **Target**: Critical < 24h, High < 7 days, Medium < 30 days
- **Measurement**: Issue tracking system, deployment logs
- **Optimization Focus**: Automated scanning, faster deployment pipeline

### Dependency Health

**Dependency Freshness**

- **Definition**: Age of dependencies relative to latest stable versions
- **Target**: < 6 months old for major dependencies, < 1 year for all
- **Measurement**: npm outdated, Dependabot
- **Optimization Focus**: Regular dependency update schedule

**Known CVE Count**

- **Definition**: Number of dependencies with known CVEs
- **Target**: 0 high/critical, < 5 medium/low
- **Measurement**: npm audit, Snyk, GitHub Security Advisories
- **Action**: Update or replace vulnerable dependencies

**License Compliance**

- **Definition**: Percentage of dependencies with compatible licenses
- **Target**: 100% compliant
- **Measurement**: License checker tools (license-checker, FOSSA)
- **Risk**: Legal issues from incompatible licenses

### Security Testing Metrics

**Security Test Coverage**

- **Definition**: Percentage of security-sensitive flows covered by security tests
- **Target**: ≥ 80% for authentication, authorization, data validation, encryption
- **Measurement**: Test suite analysis, manual review
- **Tests**: SQL injection, XSS, CSRF, authentication bypass, authorization bypass

**Penetration Test Frequency**

- **Definition**: How often penetration testing is conducted
- **Target**: Quarterly for critical apps, annually for others
- **Measurement**: Calendar schedule
- **Action**: Address findings within SLA

**Security Scan Frequency**

- **Definition**: Automated vulnerability scanning schedule
- **Target**: Weekly for applications, daily for CI/CD
- **Measurement**: Scanner configuration
- **Tools**: SAST (static), DAST (dynamic), SCA (composition)

### Incident Metrics

**Mean Time to Detect (MTTD)**

- **Definition**: Average time from security incident to detection
- **Target**: < 1 hour for critical incidents
- **Measurement**: SIEM logs, incident reports
- **Optimization Focus**: Better monitoring, alerting

**Mean Time to Respond (MTTR)**

- **Definition**: Average time from detection to containment
- **Target**: < 4 hours for critical incidents
- **Measurement**: Incident response logs
- **Optimization Focus**: Incident response procedures, automation

**Security Audit Score**

- **Definition**: Compliance with security checklist (OWASP Top 10, etc.)
- **Target**: 100% compliance
- **Measurement**: Manual audit, automated scanning
- **Action**: Address gaps in security controls

## Quality Metrics

### Test Coverage Metrics

**Code Coverage**

- **Definition**: Percentage of code executed by tests
- **Target**: ≥ 80% overall, ≥ 90% for critical paths
- **Measurement**: Coverage tools (Istanbul, c8, Jest coverage)
- **Types**: Statement, branch, function, line coverage

```bash
# Generate coverage report
npm test -- --coverage

# Enforce coverage thresholds
"jest": {
  "coverageThreshold": {
    "global": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    }
  }
}
```

**Branch Coverage**

- **Definition**: Percentage of code branches (if/else, switch) tested
- **Target**: ≥ 75%
- **Measurement**: Coverage tools
- **Why important**: Ensures edge cases are tested

**Critical Path Coverage**

- **Definition**: Coverage of business-critical functionality
- **Target**: ≥ 95%
- **Measurement**: Manual analysis + coverage tools
- **Examples**: Authentication, payment processing, data validation

### Test Quality Metrics

**Test Pass Rate**

- **Definition**: Percentage of tests passing in CI/CD
- **Target**: ≥ 95%
- **Measurement**: CI/CD logs, test runners
- **Action**: Fix or update failing tests immediately

**Flaky Test Rate**

- **Definition**: Percentage of tests that intermittently fail
- **Target**: < 2%
- **Measurement**: Track test failures over multiple runs
- **Impact**: Erodes confidence in test suite, wastes developer time

```javascript
// Detect flaky tests by running multiple times
describe('Potentially flaky test', () => {
  // Run test 10 times to detect flakiness
  for (let i = 0; i < 10; i++) {
    it(`should be stable (run ${i + 1})`, async () => {
      const result = await someAsyncOperation();
      expect(result).toBe(expected);
    });
  }
});
```

**Test Execution Time**

- **Definition**: Total time to run test suite
- **Target**: < 10 minutes for full suite, < 2 minutes for unit tests
- **Measurement**: CI/CD logs, test runner reports
- **Optimization Focus**: Parallel execution, test optimization, remove slow tests

**Test Maintenance Burden**

- **Definition**: Time spent updating tests when code changes
- **Target**: < 20% of development time
- **Measurement**: Developer time tracking
- **Optimization Focus**: Better test design, reduce brittle tests

### Defect Metrics

**Defect Escape Rate**

- **Definition**: Percentage of bugs found in production vs. total bugs
- **Target**: < 5%
- **Measurement**: Bug tracking system (Jira, GitHub Issues)
- **Formula**: Production bugs / (Production bugs + Pre-production bugs) × 100

**Mean Time to Resolution (MTTR)**

- **Definition**: Average time from bug report to fix deployed
- **Target**: < 24 hours for critical, < 7 days for high, < 30 days for medium
- **Measurement**: Bug tracking system, deployment logs
- **Optimization Focus**: Faster detection, automated deployment

**Bug Backlog Age**

- **Definition**: Average age of open bugs
- **Target**: < 30 days average, 0 bugs > 90 days old
- **Measurement**: Bug tracking system
- **Action**: Regular backlog grooming, prioritization

**Regression Rate**

- **Definition**: Percentage of bugs that are regressions (previously fixed)
- **Target**: < 10%
- **Measurement**: Bug tracking system (tag regressions)
- **Root Cause**: Insufficient regression tests

### Automation Metrics

**Test Automation Percentage**

- **Definition**: Percentage of test cases that are automated
- **Target**: ≥ 80% for unit tests, ≥ 60% for integration, ≥ 40% for E2E
- **Measurement**: Test case inventory
- **Benefit**: Faster feedback, more reliable testing

**CI/CD Pipeline Success Rate**

- **Definition**: Percentage of CI/CD runs that succeed
- **Target**: ≥ 90%
- **Measurement**: CI/CD platform metrics
- **Causes of failure**: Flaky tests, environment issues, actual bugs

**Deployment Frequency**

- **Definition**: How often code is deployed to production
- **Target**: Daily or more (for continuous deployment)
- **Measurement**: Deployment logs
- **Benefit**: Faster feedback, smaller change sets

## Monitoring and Alerting

### Alert Configuration

**Performance Alerts**

```yaml
# Example alert configuration
alerts:
  - name: 'LCP Degradation'
    condition: 'lcp_p75 > 3000ms'
    severity: 'warning'
    action: 'Investigate performance regression'

  - name: 'High Error Rate'
    condition: 'error_rate > 1%'
    severity: 'critical'
    action: 'Page engineering team'

  - name: 'Bundle Size Increase'
    condition: 'bundle_size > 500KB'
    severity: 'warning'
    action: 'Review recent changes, optimize bundle'
```

**Security Alerts**

```yaml
alerts:
  - name: 'New Critical CVE'
    condition: 'critical_cves > 0'
    severity: 'critical'
    action: 'Immediate remediation required'

  - name: 'Failed Login Attempts'
    condition: 'failed_logins > 10 in 5min'
    severity: 'warning'
    action: 'Potential brute force attack'

  - name: 'Unusual API Traffic'
    condition: 'api_requests > 2x baseline'
    severity: 'warning'
    action: 'Investigate potential DoS'
```

**Quality Alerts**

```yaml
alerts:
  - name: 'Coverage Drop'
    condition: 'coverage < 75%'
    severity: 'warning'
    action: 'Add tests for new code'

  - name: 'Test Failure'
    condition: 'test_pass_rate < 95%'
    severity: 'critical'
    action: 'Fix failing tests immediately'

  - name: 'High Flaky Rate'
    condition: 'flaky_test_rate > 5%'
    severity: 'warning'
    action: 'Fix or quarantine flaky tests'
```

### Dashboard Design

**Performance Dashboard**

- Core Web Vitals (LCP, INP, CLS) - line chart over time
- Page load time distribution - histogram
- Bundle size trend - line chart
- Resource breakdown - pie chart
- Cache hit rate - gauge

**Security Dashboard**

- Vulnerability count by severity - bar chart
- Time to remediation - line chart
- Dependency health score - gauge
- Security test coverage - gauge
- Recent security incidents - table

**Quality Dashboard**

- Test coverage trend - line chart
- Test pass rate - gauge
- Defect escape rate - line chart
- Bug backlog age distribution - histogram
- Deployment frequency - bar chart

### Metric Collection

**Client-Side (RUM)**

```javascript
// Send performance metrics to analytics
window.addEventListener('load', () => {
  setTimeout(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    const paintData = performance.getEntriesByType('paint');

    analytics.track('performance', {
      ttfb: perfData.responseStart - perfData.requestStart,
      fcp: paintData.find(p => p.name === 'first-contentful-paint')?.startTime,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
    });
  }, 0);
});
```

**Server-Side**

```javascript
// Express middleware for API performance tracking
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    metrics.record('api.request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });

    if (duration > 1000) {
      logger.warn('Slow API request', { method: req.method, path: req.path, duration });
    }
  });

  next();
});
```

## Metric Interpretation

### Percentiles vs. Averages

**Why percentiles matter**:

- Averages hide outliers and can be misleading
- 95th percentile shows experience of 1 in 20 users
- 99th percentile shows worst experiences

**Example**:

```
Page load times: [1s, 1.2s, 1.1s, 1.3s, 15s]
Average: 3.92s (misleading - most users don't experience this)
Median (50th): 1.2s (typical experience)
95th percentile: 15s (worst experiences)
```

### Correlation Analysis

**Performance vs. Business Metrics**

- Correlation between LCP and bounce rate
- Impact of page load time on conversion rate
- Effect of performance on user engagement

**Example findings**:

- 1s increase in LCP → 5% increase in bounce rate
- Page load time < 2s → 20% higher conversion
- Users experiencing good Core Web Vitals → 2x longer session duration

### Trend Analysis

**Look for**:

- Sudden spikes/drops (deployment issues)
- Gradual degradation (technical debt accumulation)
- Cyclical patterns (time of day, day of week)
- Seasonal variations (holiday traffic)

**Action thresholds**:

- 10% degradation → investigate
- 25% degradation → escalate
- 50% degradation → incident response

## Related Resources

- [Optimization Framework](./optimization-framework.md) - Detailed workflows
- [Integration Points](./integration-points.md) - Tool integration
- [Tradeoffs Guide](./tradeoffs-guide.md) - Performance vs. other concerns
- [Web Vitals](https://web.dev/vitals/) - Official documentation
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1) - Vulnerability scoring
