# Web App Optimization - Complete Example

This example demonstrates an end-to-end performance optimization workflow for a web application using Henry Orchestrator's quality agents.

## Scenario

**Company**: E-commerce site "ShopFast"
**Problem**: Landing page is slow, failing Core Web Vitals, impacting conversion rate
**Goal**: Meet Core Web Vitals targets and improve conversion rate by 10%

## Initial State

### Performance Metrics (Baseline)

```
Core Web Vitals:
- LCP: 4.2s (Poor - target: <2.5s)
- INP: 350ms (Poor - target: <200ms)
- CLS: 0.18 (Needs Improvement - target: <0.1)

Additional Metrics:
- TTFB: 850ms
- FCP: 2.1s
- Speed Index: 5.3s
- Bundle Size: 1.2MB (gzipped: 380KB)
- Image Size: 3.5MB total

Performance Score: 42/100
```

### Business Impact

```
Current State:
- Bounce rate: 35% (industry avg: 25%)
- Conversion rate: 2.1%
- Average order value: $85
- Monthly revenue: $450,000

Projected with optimization:
- Bounce rate: 25% (10% improvement)
- Conversion rate: 2.3% (10% improvement)
- Monthly revenue increase: $45,000
```

## Phase 1: Assessment and Planning

### Step 1: Baseline Analysis with performance-engineer

**Command**:

```bash
/henry-orchestrator:henry-team performance-engineer - Baseline landing page performance and identify bottlenecks
```

**performance-engineer findings**:

```markdown
## Performance Baseline Report

### Core Web Vitals Analysis

**LCP: 4.2s (Poor)**

- Root cause: Large hero image (2.8MB JPEG, 4000x3000)
- Element: Main hero image above fold
- Impact: 60% of LCP time waiting for image

**INP: 350ms (Poor)**

- Root cause: Heavy JavaScript execution blocking main thread
- Longest task: 280ms (Bundle parsing and execution)
- Impact: Delayed interactivity after click

**CLS: 0.18 (Needs Improvement)**

- Root causes:
  1. Images without width/height causing layout shift (0.12)
  2. Web font loading causing FOIT (Flash of Invisible Text) (0.04)
  3. Ads inserted without reserved space (0.02)

### Resource Analysis

**Bundle Breakdown**:
```

Total: 1.2MB (380KB gzipped)
├─ vendor.js: 650KB (React, lodash, moment, etc.)
├─ main.js: 420KB (Application code)
├─ styles.css: 80KB (CSS)
└─ fonts: 50KB (Web fonts)

```

**Unused JavaScript**: 320KB (27% of bundle)
**Render-blocking resources**: 3 CSS files, 2 JavaScript files

**Images**:
```

Total: 3.5MB
├─ hero.jpg: 2.8MB (4000x3000, unoptimized)
├─ product-1.jpg: 450KB (1200x1200)
├─ product-2.jpg: 380KB (1200x1200)
└─ logo.png: 120KB (500x500, should be SVG)

```

### Prioritized Recommendations

**High Impact (Do First)**:
1. Optimize hero image → Expected LCP improvement: 1.8s
2. Code splitting → Expected INP improvement: 120ms
3. Add image dimensions → Expected CLS improvement: 0.12

**Medium Impact**:
4. Font optimization → Expected CLS improvement: 0.04
5. Lazy load below-fold images → Expected bundle reduction: 830KB
6. Remove unused JavaScript → Expected bundle reduction: 320KB

**Low Impact (Nice to have)**:
7. Optimize third-party scripts
8. Implement Service Worker caching
9. CDN optimization
```

### Step 2: Create Optimization Plan

**Estimated Timeline**: 2 sprints (4 weeks)
**Resources Needed**: frontend-engineer, performance-engineer, qa-tester

**Sprint 1 (Week 1-2): High Impact Items**

- Optimize hero image (WebP, responsive sizes, lazy loading)
- Implement code splitting
- Add image dimensions

**Sprint 2 (Week 3-4): Medium Impact Items + Validation**

- Font optimization
- Lazy load below-fold content
- Remove unused code
- Full validation and testing

## Phase 2: Implementation

### Sprint 1, Week 1: Image Optimization

**Task Assignment**:

```bash
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Optimize landing page images for Core Web Vitals
```

#### Implementation

**Before**:

```html
<!-- Unoptimized hero image -->
<div class="hero">
  <img src="/images/hero.jpg" alt="Summer Sale" />
  <h1>Summer Sale - 50% Off</h1>
</div>
```

**After**:

```html
<!-- Optimized hero image with responsive sizes and WebP -->
<div class="hero">
  <picture>
    <source
      type="image/webp"
      srcset="
        /images/hero-400.webp   400w,
        /images/hero-800.webp   800w,
        /images/hero-1200.webp 1200w,
        /images/hero-1600.webp 1600w
      "
      sizes="100vw"
    />
    <source
      type="image/jpeg"
      srcset="
        /images/hero-400.jpg   400w,
        /images/hero-800.jpg   800w,
        /images/hero-1200.jpg 1200w,
        /images/hero-1600.jpg 1600w
      "
      sizes="100vw"
    />
    <img
      src="/images/hero-1200.jpg"
      alt="Summer Sale"
      width="1200"
      height="600"
      fetchpriority="high"
    />
  </picture>
  <h1>Summer Sale - 50% Off</h1>
</div>

<!-- Product images with lazy loading -->
<div class="products">
  <img
    src="/images/product-1-400.webp"
    srcset="/images/product-1-400.webp 400w, /images/product-1-800.webp 800w"
    sizes="(max-width: 768px) 100vw, 400px"
    alt="Product 1"
    width="400"
    height="400"
    loading="lazy"
    decoding="async"
  />
  <!-- More products -->
</div>
```

**Image Generation Script**:

```bash
# Convert to WebP and generate responsive sizes
for img in hero product-1 product-2; do
  # Generate WebP versions
  cwebp -q 85 ${img}.jpg -o ${img}-400.webp -resize 400 0
  cwebp -q 85 ${img}.jpg -o ${img}-800.webp -resize 800 0
  cwebp -q 85 ${img}.jpg -o ${img}-1200.webp -resize 1200 0
  cwebp -q 85 ${img}.jpg -o ${img}-1600.webp -resize 1600 0

  # Generate JPEG fallbacks
  convert ${img}.jpg -quality 85 -resize 400x ${img}-400.jpg
  convert ${img}.jpg -quality 85 -resize 800x ${img}-800.jpg
  convert ${img}.jpg -quality 85 -resize 1200x ${img}-1200.jpg
  convert ${img}.jpg -quality 85 -resize 1600x ${img}-1600.jpg
done
```

**Results After Image Optimization**:

```
Image Sizes:
- hero.jpg: 2.8MB → 280KB (90% reduction)
- product images: 830KB → 180KB (78% reduction)
- Total: 3.5MB → 460KB (87% reduction)

Core Web Vitals:
- LCP: 4.2s → 2.6s (38% improvement) ✓
- CLS: 0.18 → 0.06 (67% improvement) ✓

Still needs work:
- LCP: 2.6s (target: <2.5s) - close!
- INP: 350ms (target: <200ms) - not addressed yet
```

### Sprint 1, Week 2: Code Splitting

**Task Assignment**:

```bash
/henry-orchestrator:henry-team frontend-engineer - Implement code splitting and lazy loading for JavaScript bundles
```

#### Implementation

**Before**:

```javascript
// main.js - Everything bundled together
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';

import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

**After**:

```javascript
// main.js - Code splitting with lazy loading
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Only import what's needed for initial load
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

**Webpack Configuration**:

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor bundle
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
        },
        // Separate React bundle
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
        },
        // Common code shared between pages
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

**Replace Heavy Dependencies**:

```javascript
// Before: moment.js (entire library)
import moment from 'moment';
const date = moment().format('YYYY-MM-DD');

// After: date-fns (tree-shakeable)
import { format } from 'date-fns';
const date = format(new Date(), 'yyyy-MM-dd');

// Before: lodash (entire library)
import _ from 'lodash';
const unique = _.uniq(array);

// After: Import specific functions
import uniq from 'lodash/uniq';
const unique = uniq(array);
```

**Results After Code Splitting**:

```
Bundle Sizes:
Before:
- main.js: 1.2MB (380KB gzipped)

After:
- main.js: 85KB (28KB gzipped) - Initial bundle
- react.js: 140KB (45KB gzipped) - Cached
- vendor.js: 180KB (58KB gzipped) - Cached
- HomePage.js: 120KB (38KB gzipped) - Lazy loaded
- ProductPage.js: 95KB (30KB gzipped) - Lazy loaded
- CheckoutPage.js: 180KB (58KB gzipped) - Lazy loaded
- AccountPage.js: 75KB (24KB gzipped) - Lazy loaded
- AdminPage.js: 140KB (45KB gzipped) - Lazy loaded

Initial Load (first visit):
- Before: 380KB
- After: 131KB (28 + 45 + 58) - 66% reduction ✓

Initial Load (return visit with cache):
- After: 66KB (28 + 38 for HomePage) - 83% reduction ✓

Core Web Vitals:
- INP: 350ms → 195ms (44% improvement) ✓
- LCP: 2.6s → 2.1s (19% improvement) ✓

All targets met! 🎉
- LCP: 2.1s < 2.5s ✓
- INP: 195ms < 200ms ✓
- CLS: 0.06 < 0.1 ✓
```

## Phase 3: Validation and Testing

### Step 1: Performance Validation

**Command**:

```bash
/henry-orchestrator:henry-team performance-engineer qa-tester - Validate optimizations meet targets and verify no regressions
```

**performance-engineer validation**:

```markdown
## Validation Report

### Core Web Vitals (After Optimization)

**Lighthouse Audit** (5 runs, median):

- Performance Score: 42 → 94 (+124%)
- LCP: 4.2s → 2.1s (50% improvement) ✓
- INP: 350ms → 195ms (44% improvement) ✓
- CLS: 0.18 → 0.06 (67% improvement) ✓
- TTFB: 850ms → 820ms (4% improvement)
- FCP: 2.1s → 1.2s (43% improvement) ✓

**WebPageTest** (Dulles, VA - Cable, 3 runs):

- First View LCP: 2.3s ✓
- Repeat View LCP: 1.1s ✓ (cached)
- Speed Index: 5.3s → 2.1s ✓
- Total Blocking Time: 680ms → 180ms ✓

All Core Web Vitals targets met ✓
```

**qa-tester validation**:

```markdown
## Regression Testing Report

### Functional Testing

✓ All pages load correctly
✓ Navigation between pages works
✓ Images display correctly (WebP with JPEG fallback)
✓ Lazy loading works on scroll
✓ Code splitting doesn't break functionality

### Cross-browser Testing

✓ Chrome 120: All features work, WebP supported
✓ Safari 17: Fallback to JPEG, all features work
✓ Firefox 121: WebP supported, all features work
✓ Edge 120: WebP supported, all features work

### Mobile Testing

✓ iPhone 13 (iOS 17): LCP 2.4s, all features work
✓ Samsung Galaxy S21 (Android 13): LCP 2.2s, all features work
✓ Responsive images load correct sizes

### Performance Regression Tests

✓ Bundle size within budget (< 150KB initial)
✓ LCP < 2.5s on all tested devices
✓ No new console errors or warnings
✓ All images have width/height attributes

No regressions detected ✓
```

### Step 2: Performance Budget Enforcement

**Lighthouse CI Configuration**:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["https://shopfast.example.com"]
    },
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "interactive": ["error", { "maxNumericValue": 3800 }],
        "categories:performance": ["error", { "minScore": 0.9 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 200000 }],
        "resource-summary:image:size": ["error", { "maxNumericValue": 500000 }]
      }
    }
  }
}
```

**GitHub Actions Workflow**:

```yaml
name: Performance Budget
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
          budgetPath: .lighthouserc.json
          uploadArtifacts: true
```

## Phase 4: Monitoring and Iteration

### Real User Monitoring (RUM)

**Implementation**:

```javascript
// Track Core Web Vitals in production
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  // Send to Google Analytics
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });

  // Send to custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify({ name, value, id }),
    headers: { 'Content-Type': 'application/json' },
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

**Dashboard Configuration**:

```javascript
// Analytics dashboard queries
const webVitalsQueries = {
  // 75th percentile (good user experience threshold)
  lcp_p75:
    "SELECT PERCENTILE(value, 75) FROM web_vitals WHERE name='LCP' AND timestamp > NOW() - 7d",
  inp_p75:
    "SELECT PERCENTILE(value, 75) FROM web_vitals WHERE name='INP' AND timestamp > NOW() - 7d",
  cls_p75:
    "SELECT PERCENTILE(value, 75) FROM web_vitals WHERE name='CLS' AND timestamp > NOW() - 7d",

  // Trends over time
  lcp_trend:
    "SELECT DATE(timestamp), PERCENTILE(value, 75) FROM web_vitals WHERE name='LCP' GROUP BY DATE(timestamp) ORDER BY DATE(timestamp) DESC LIMIT 30",
};
```

### Alerts

**Performance Degradation Alert**:

```yaml
alert: LCP Degradation
condition: lcp_p75 > 3000ms for 15 minutes
severity: warning
action: Investigate recent deployments, check CDN, review error logs
notification: #performance-alerts Slack channel
```

## Results Summary

### Performance Improvements

| Metric                | Before | After | Improvement | Target | Status |
| --------------------- | ------ | ----- | ----------- | ------ | ------ |
| **LCP**               | 4.2s   | 2.1s  | 50%         | <2.5s  | ✓ Pass |
| **INP**               | 350ms  | 195ms | 44%         | <200ms | ✓ Pass |
| **CLS**               | 0.18   | 0.06  | 67%         | <0.1   | ✓ Pass |
| **Performance Score** | 42     | 94    | 124%        | >90    | ✓ Pass |
| **Bundle Size**       | 380KB  | 131KB | 66%         | <150KB | ✓ Pass |
| **Image Size**        | 3.5MB  | 460KB | 87%         | <500KB | ✓ Pass |

### Business Impact

**Measured after 4 weeks**:

```
Bounce Rate:
- Before: 35%
- After: 26%
- Improvement: 26% reduction ✓

Conversion Rate:
- Before: 2.1%
- After: 2.4%
- Improvement: 14% increase ✓ (exceeded 10% goal)

Average Session Duration:
- Before: 2m 15s
- After: 3m 42s
- Improvement: 64% increase ✓

Revenue Impact:
- Projected: $45,000/month
- Actual: $54,000/month
- Exceeded projection by 20% ✓

ROI:
- Development cost: ~80 hours (~$12,000)
- Monthly revenue increase: $54,000
- Payback period: < 1 month ✓
- Annual impact: $648,000
```

### Lessons Learned

**What Worked Well**:

1. **Image optimization had biggest single impact** - 38% LCP improvement
2. **Code splitting improved both load time and interactivity** - 66% bundle reduction
3. **Measurements guided prioritization** - Focused on high-impact items first
4. **No regressions** - Comprehensive testing prevented issues

**Challenges**:

1. **Safari WebP support** - Needed JPEG fallbacks (added 15% to implementation time)
2. **Image generation pipeline** - Manual process initially, automated in sprint 2
3. **Cache invalidation** - Had to update cache-busting strategy for split bundles

**Next Steps**:

1. **Further optimizations** (Sprint 3+):
   - Implement Service Worker for offline support
   - Optimize third-party scripts (analytics, chat widget)
   - Add resource hints (preconnect, dns-prefetch)
   - Optimize web fonts with font-display: swap

2. **Expand to other pages**:
   - Product pages (different optimization needs)
   - Checkout flow (critical path)
   - Account pages (lower priority)

3. **Continuous improvement**:
   - Monthly performance reviews
   - Automated performance regression testing in CI/CD
   - Performance budget enforcement
   - RUM monitoring and alerting

## Related Resources

- [Optimization Framework](../references/optimization-framework.md) - Detailed workflows
- [Metrics Guide](../references/metrics-guide.md) - Comprehensive metrics
- [Integration Points](../references/integration-points.md) - Tool setup
- [Database Optimization Example](./database-optimization.md) - Backend optimization
