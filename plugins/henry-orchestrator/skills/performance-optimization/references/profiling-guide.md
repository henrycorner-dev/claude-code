# Performance Profiling Guide

This reference provides comprehensive guidance on measuring, analyzing, and diagnosing performance issues in web applications.

## Core Web Vitals

Google's user-centric performance metrics for measuring real-world user experience.

### Largest Contentful Paint (LCP)

Measures loading performance. Time when largest content element becomes visible.

**Target:**
- Good: ≤ 2.5 seconds
- Needs Improvement: 2.5 - 4.0 seconds
- Poor: > 4.0 seconds

**Common Issues:**
- Slow server response time
- Render-blocking JavaScript/CSS
- Slow resource load times
- Client-side rendering

**Optimizations:**
- Use CDN for static assets
- Optimize images (compression, WebP, lazy loading)
- Preload critical resources
- Minimize render-blocking resources
- Use server-side rendering (SSR)

### First Input Delay (FID)

Measures interactivity. Time from user interaction to browser response.

**Target:**
- Good: ≤ 100 milliseconds
- Needs Improvement: 100 - 300 milliseconds
- Poor: > 300 milliseconds

**Common Issues:**
- Long JavaScript tasks blocking main thread
- Large JavaScript bundles
- Heavy third-party scripts

**Optimizations:**
- Code splitting
- Defer non-critical JavaScript
- Break up long tasks
- Use web workers for heavy computation
- Reduce JavaScript execution time

### Cumulative Layout Shift (CLS)

Measures visual stability. Sum of unexpected layout shifts.

**Target:**
- Good: ≤ 0.1
- Needs Improvement: 0.1 - 0.25
- Poor: > 0.25

**Common Issues:**
- Images without dimensions
- Ads/embeds/iframes without reserved space
- Dynamically injected content
- Web fonts causing FOIT/FOUT

**Optimizations:**
- Set width/height on images and video
- Reserve space for ads/embeds
- Avoid inserting content above existing content
- Use font-display: swap

## Browser DevTools Profiling

### Chrome DevTools Performance Tab

**Record Performance:**
1. Open DevTools (F12)
2. Navigate to Performance tab
3. Click Record (circle icon)
4. Interact with page
5. Stop recording

**Analyze Results:**

**Main Thread Analysis:**
- Yellow bars = JavaScript execution
- Purple bars = Rendering/layout
- Green bars = Painting
- Gray bars = Idle time

**Identify Long Tasks:**
- Red triangles in timeline = tasks >50ms
- Click to see call stack
- Find bottleneck functions

**Example Interpretation:**
```
Main Thread:
|████████| parseHTML (200ms)
|████████████████| calculateLayout (400ms) ⚠️ Long task
|████| paint (80ms)
|██| JavaScript (50ms)
```

`calculateLayout` taking 400ms is a bottleneck. Click to see what's causing expensive layout.

**Bottom-Up Tab:**
Shows functions by total self-time (time excluding calls to other functions).

```
Function              Self Time    Total Time
---------------------------|------------|------------
calculateLayout       400ms         400ms
updateDOM             150ms         200ms
renderComponent       100ms         300ms
```

Focus on optimizing functions with highest self-time.

**Call Tree Tab:**
Shows function call hierarchy.

```
renderApp (500ms)
  └─ renderComponent (300ms)
      └─ updateDOM (200ms)
          └─ calculateLayout (100ms)
```

Identify which code paths are slow.

### Network Waterfall

**Open Network Tab:**
1. DevTools → Network tab
2. Reload page
3. Analyze request waterfall

**Interpret Waterfall:**
```
|■■■■■■| HTML document
  |■■| CSS stylesheet
  |■■| JavaScript bundle
    |■■■■| API request
      |■| Image 1
      |■| Image 2
```

**Colors:**
- Queueing (light gray): Waiting for available connection
- Stalled (gray): Time before request can be sent
- DNS Lookup (dark green): DNS resolution time
- Initial Connection (orange): TCP handshake
- SSL (purple): TLS negotiation
- Sending (light green): Sending request
- Waiting (green): Time to First Byte (TTFB)
- Downloading (blue): Receiving response

**Optimization Opportunities:**
- Long TTFB → slow server
- Many sequential requests → poor resource prioritization
- Large download time → file too large, needs compression
- Long DNS lookup → use DNS prefetch
- Many queued requests → hitting connection limit

### Memory Profiling

**Take Heap Snapshot:**
1. DevTools → Memory tab
2. Select "Heap snapshot"
3. Click "Take snapshot"

**Identify Memory Leaks:**
1. Take snapshot
2. Perform action (e.g., open/close modal)
3. Take another snapshot
4. Compare snapshots

**Look for:**
- Detached DOM nodes (should be garbage collected)
- Event listeners not removed
- Closures retaining references
- Global variables accumulating data

**Example:**
```javascript
// Memory leak - event listener not removed
function createButton() {
  const button = document.createElement('button');
  button.addEventListener('click', handleClick);
  document.body.appendChild(button);
  // When button is removed, event listener persists
}

// Fixed
function createButton() {
  const button = document.createElement('button');
  const listener = button.addEventListener('click', handleClick);
  document.body.appendChild(button);

  return {
    remove() {
      button.removeEventListener('click', handleClick);
      button.remove();
    }
  };
}
```

### Coverage Analysis

**Find Unused Code:**
1. DevTools → Coverage tab (Cmd+Shift+P → "Show Coverage")
2. Click Record
3. Interact with page
4. Stop recording

**Results:**
```
File                  Size    Unused     Percentage
--------------------- ------- ---------- ----------
bundle.js             500 KB  300 KB     60%
styles.css            100 KB   20 KB     20%
```

**Actions:**
- Code split to defer unused code
- Remove dead code
- Use tree shaking
- Lazy load features

## Lighthouse

Automated auditing tool for performance, accessibility, SEO.

### Run Lighthouse

**In Chrome DevTools:**
1. Open DevTools
2. Lighthouse tab
3. Select categories (Performance, Accessibility, etc.)
4. Click "Generate report"

**CLI:**
```bash
npm install -g lighthouse
lighthouse https://example.com --view
```

**Node.js:**
```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };

  const runnerResult = await lighthouse('https://example.com', options);

  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);

  await chrome.kill();
}
```

### Interpret Lighthouse Results

**Performance Score (0-100):**
- 90-100: Good
- 50-89: Needs improvement
- 0-49: Poor

**Key Metrics:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index

**Opportunities:**
Ranked by potential savings (seconds).

```
Opportunities                              Estimated Savings
------------------------------------------ ------------------
Eliminate render-blocking resources        2.5 s
Properly size images                       1.8 s
Enable text compression                    1.2 s
Minify JavaScript                          0.8 s
```

Focus on highest-impact opportunities first.

**Diagnostics:**
Insights into best practices and issues.

```
Diagnostics
- Uses inefficient cache policy (38 resources)
- Serve images in next-gen formats
- Avoid enormous network payloads (5.2 MB)
```

## Backend Performance Profiling

### Node.js Profiling

**Built-in Profiler:**
```bash
node --prof app.js
# Generates isolate-0x...-v8.log

# Process log file
node --prof-process isolate-0x...-v8.log > profile.txt
```

**Interpret Results:**
```
Statistical profiling result from isolate-0x...-v8.log

[Summary]:
   ticks  total  nonlib   name
   5234   52.3%   57.8%  JavaScript
   3412   34.1%   37.7%  C++
    876    8.8%    9.7%  GC
    478    4.8%          Shared libraries

[JavaScript]:
   ticks  total  nonlib   name
   2134   21.3%   23.6%  LazyCompile: *processRequest /app/server.js:45
    987    9.9%   10.9%  LazyCompile: *queryDatabase /app/db.js:123
```

Focus on functions with highest tick counts.

**clinic.js:**
```bash
npm install -g clinic

# Doctor (general diagnostics)
clinic doctor -- node app.js
# Load test app
# Ctrl+C to stop
# Opens HTML report

# Flame (CPU profiling)
clinic flame -- node app.js

# Bubbleprof (async operations)
clinic bubbleprof -- node app.js
```

**0x (Flamegraphs):**
```bash
npm install -g 0x

0x app.js
# Run load test
# Ctrl+C to stop
# Opens interactive flamegraph
```

### Python Profiling

**cProfile:**
```python
import cProfile
import pstats

def main():
    # Your application code
    pass

if __name__ == '__main__':
    profiler = cProfile.Profile()
    profiler.enable()

    main()

    profiler.disable()
    stats = pstats.Stats(profiler).sort_stats('cumtime')
    stats.print_stats(20)  # Top 20 functions
```

**Output:**
```
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.000    0.000    5.234    5.234 app.py:1(main)
      100    2.134    0.021    4.123    0.041 db.py:45(query)
     1000    1.234    0.001    1.234    0.001 utils.py:12(process)
```

**py-spy (sampling profiler):**
```bash
pip install py-spy

# Record to flamegraph
py-spy record -o profile.svg -- python app.py

# Top (live view)
py-spy top -- python app.py
```

### Database Query Profiling

**PostgreSQL:**
```sql
-- Enable query timing
\timing

-- Explain query execution plan
EXPLAIN ANALYZE
SELECT * FROM users
WHERE email = 'user@example.com';
```

**Output:**
```
Index Scan using idx_users_email on users (cost=0.29..8.31 rows=1) (actual time=0.015..0.016 rows=1 loops=1)
  Index Cond: (email = 'user@example.com'::text)
Planning Time: 0.089 ms
Execution Time: 0.034 ms
```

**MySQL:**
```sql
-- Explain query
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Show profile
SET profiling = 1;
SELECT * FROM users WHERE email = 'user@example.com';
SHOW PROFILE;
```

**Output:**
```
+----------------------+----------+
| Status               | Duration |
+----------------------+----------+
| starting             | 0.000070 |
| checking permissions | 0.000010 |
| Opening tables       | 0.000020 |
| init                 | 0.000030 |
| optimizing           | 0.000010 |
| executing            | 0.000010 |
| Sending data         | 0.000050 |
| end                  | 0.000010 |
+----------------------+----------+
```

## Real User Monitoring (RUM)

Track actual user performance in production.

### Web Vitals Library

```bash
npm install web-vitals
```

**Measure Core Web Vitals:**
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating
  });

  // Send to analytics endpoint
  fetch('/analytics', {
    body,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Observer API

**Monitor Long Tasks:**
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Long task detected:', entry.duration, 'ms');
    // Send to analytics
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

**Monitor Resource Timing:**
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 1000) {
      console.log('Slow resource:', entry.name, entry.duration, 'ms');
    }
  }
});

observer.observe({ entryTypes: ['resource'] });
```

**Monitor Layout Shifts:**
```javascript
let clsValue = 0;

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      console.log('CLS:', clsValue);
    }
  }
});

observer.observe({ entryTypes: ['layout-shift'] });
```

### Navigation Timing API

```javascript
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];

  const metrics = {
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp: perfData.connectEnd - perfData.connectStart,
    ttfb: perfData.responseStart - perfData.requestStart,
    download: perfData.responseEnd - perfData.responseStart,
    domInteractive: perfData.domInteractive - perfData.fetchStart,
    domComplete: perfData.domComplete - perfData.fetchStart,
    loadComplete: perfData.loadEventEnd - perfData.fetchStart
  };

  console.log('Performance metrics:', metrics);
});
```

## Load Testing

### Artillery

**Install:**
```bash
npm install -g artillery
```

**Create Test (load-test.yml):**
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users/second for 60 seconds
    - duration: 120
      arrivalRate: 50 # 50 users/second for 120 seconds
scenarios:
  - name: 'Browse and search'
    flow:
      - get:
          url: '/'
      - think: 2 # Wait 2 seconds
      - get:
          url: '/search?q=performance'
      - think: 1
      - get:
          url: '/api/users/123'
```

**Run:**
```bash
artillery run load-test.yml
```

**Output:**
```
Summary report
  Scenarios launched:  9000
  Scenarios completed: 8950
  Requests completed:  26850
  Mean response/sec: 448.09
  Response time (msec):
    min: 12
    max: 3421
    median: 145
    p95: 523
    p99: 1234
```

### k6

**Install:**
```bash
brew install k6
```

**Create Test (load-test.js):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run:**
```bash
k6 run load-test.js
```

## Application Performance Monitoring (APM)

### New Relic

```javascript
require('newrelic');
const express = require('express');
const app = express();

// Automatic instrumentation
app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});
```

**Provides:**
- Transaction traces
- Database query performance
- Error tracking
- Real user monitoring
- Custom metrics

### Datadog APM

```javascript
const tracer = require('dd-trace').init();

app.get('/api/users', async (req, res) => {
  const span = tracer.startSpan('get-users');

  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } finally {
    span.finish();
  }
});
```

### Sentry Performance

```javascript
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: 'YOUR_DSN',
  tracesSampleRate: 1.0, // 100% of transactions
});

app.get('/api/users', async (req, res) => {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'GET /api/users',
  });

  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } finally {
    transaction.finish();
  }
});
```

## Custom Performance Marks

**User Timing API:**
```javascript
// Mark start of operation
performance.mark('search-start');

// Perform operation
await performSearch(query);

// Mark end of operation
performance.mark('search-end');

// Measure duration
performance.measure('search-duration', 'search-start', 'search-end');

// Get measurement
const measure = performance.getEntriesByName('search-duration')[0];
console.log('Search took:', measure.duration, 'ms');
```

**React Performance Markers:**
```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id, // Component identifier
  phase, // "mount" or "update"
  actualDuration, // Time spent rendering
  baseDuration, // Estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}
```

## Best Practices

**Profiling:**
1. Profile in production-like environment
2. Use realistic data volumes
3. Test on representative devices/networks
4. Profile both best and worst cases
5. Establish baseline before optimizing
6. Measure after each optimization

**Monitoring:**
1. Track Core Web Vitals in production
2. Set up alerts for performance regressions
3. Monitor 95th/99th percentile, not just averages
4. Segment metrics by device/browser/location
5. Track business metrics alongside performance

**Load Testing:**
1. Test realistic user scenarios
2. Gradually increase load (ramp-up)
3. Test sustained load, not just spikes
4. Monitor server resources during tests
5. Identify breaking point
6. Test with production data volumes

Focus on real user impact (Core Web Vitals) over synthetic benchmarks for meaningful performance improvements.
