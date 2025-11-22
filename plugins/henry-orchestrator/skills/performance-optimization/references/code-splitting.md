# Code Splitting and Bundle Optimization

This reference provides comprehensive guidance on reducing JavaScript bundle sizes through code splitting, tree shaking, and lazy loading techniques.

## Why Code Splitting Matters

**Problem Without Code Splitting:**
```
bundle.js (2.5 MB)
└── All application code loaded upfront
    ├── Homepage code (needed immediately)
    ├── Dashboard code (not needed on homepage)
    ├── Admin panel code (only for admins)
    ├── All third-party libraries
    └── Rarely-used utilities
```

**Impact:**
- Slow initial page load (parse + execute 2.5 MB JavaScript)
- Poor Time to Interactive (TTI)
- Wasted bandwidth for unused code
- Poor mobile experience

**With Code Splitting:**
```
main.js (200 KB) - Core + Homepage
dashboard.js (300 KB) - Loaded on dashboard route
admin.js (150 KB) - Loaded for admin users
vendors.js (400 KB) - Shared third-party libraries
```

**Benefits:**
- Fast initial load (only 600 KB)
- Improved TTI and FCP
- Parallel loading
- Better caching (vendors bundle rarely changes)

## Webpack Code Splitting

### Entry Points

Manually configure multiple entry points.

**webpack.config.js:**
```javascript
module.exports = {
  entry: {
    main: './src/index.js',
    admin: './src/admin.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

**Use case:**
- Completely separate applications (e.g., user-facing + admin panel)
- Multiple HTML pages

**Trade-offs:**
- Manual configuration
- Potential code duplication
- Less automatic optimization

### Dynamic Imports

Load code on-demand using dynamic `import()`.

**Basic Dynamic Import:**
```javascript
// Before
import { heavy } from './heavy-module';
heavy.process();

// After
const button = document.querySelector('#load-heavy');
button.addEventListener('click', async () => {
  const { heavy } = await import('./heavy-module');
  heavy.process();
});
```

**Webpack automatically:**
1. Creates separate chunk for `heavy-module.js`
2. Loads chunk when `import()` is called
3. Caches chunk for subsequent imports

**Route-Based Splitting (React Router):**
```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Component-Based Splitting:**
```javascript
import { lazy, Suspense } from 'react';

// Heavy component loaded on-demand
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setShowChart(true)}>Show Chart</button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart data={chartData} />
        </Suspense>
      )}
    </div>
  );
}
```

**Named Exports with Dynamic Imports:**
```javascript
// Import specific exports
const { calculate } = await import('./math-utils');

// Import default export
const module = await import('./my-module');
const result = module.default();
```

### SplitChunksPlugin

Automatic code splitting with intelligent chunk optimization.

**webpack.config.js:**
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all', // Split both async and sync chunks
      cacheGroups: {
        // Separate vendor dependencies
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        // Separate common code shared across chunks
        common: {
          minChunks: 2, // Module must be shared by at least 2 chunks
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

**Advanced Configuration:**
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000, // Minimum size for chunk creation (bytes)
      maxSize: 244000, // Attempt to split chunks larger than this
      minChunks: 1, // Minimum times module must be shared
      maxAsyncRequests: 30, // Max parallel requests for async loading
      maxInitialRequests: 30, // Max parallel requests for initial load
      cacheGroups: {
        // Vendor splitting by package
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendor',
          priority: 20
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](lodash|moment|date-fns)[\\/]/,
          name: 'utility-vendor',
          priority: 15
        },
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // Split CSS
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

**Result:**
```
dist/
├── main.[hash].js (50 KB) - Application code
├── react-vendor.[hash].js (120 KB) - React libraries
├── utility-vendor.[hash].js (80 KB) - Utility libraries
├── vendors.[hash].js (150 KB) - Other dependencies
└── common.[hash].js (30 KB) - Shared application code
```

## React Code Splitting Patterns

### React.lazy + Suspense

**Basic Usage:**
```javascript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyComponent />
    </Suspense>
  );
}
```

**Multiple Lazy Components:**
```javascript
const Header = lazy(() => import('./Header'));
const Sidebar = lazy(() => import('./Sidebar'));
const Content = lazy(() => import('./Content'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Header />
      <div className="layout">
        <Sidebar />
        <Content />
      </div>
    </Suspense>
  );
}
```

**Nested Suspense Boundaries:**
```javascript
function App() {
  return (
    // Outer Suspense for critical layout
    <Suspense fallback={<FullPageLoader />}>
      <Header />
      <MainContent />
    </Suspense>
  );
}

function MainContent() {
  return (
    <div>
      {/* Inner Suspense for secondary content */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <Suspense fallback={<ContentSkeleton />}>
        <Content />
      </Suspense>
    </div>
  );
}
```

### Error Boundaries with Code Splitting

```javascript
import { Component, lazy, Suspense } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chunk loading failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load component. Please refresh.</div>;
    }
    return this.props.children;
  }
}

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Preloading Chunks

Prefetch chunks before user navigates to improve perceived performance.

**Prefetch on Hover:**
```javascript
import { lazy, Suspense, useState } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

// Store promise to reuse
let dashboardPromise = null;

function prefetchDashboard() {
  if (!dashboardPromise) {
    dashboardPromise = import('./Dashboard');
  }
  return dashboardPromise;
}

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div>
      <button
        onMouseEnter={prefetchDashboard} // Prefetch on hover
        onClick={() => setShowDashboard(true)}
      >
        Go to Dashboard
      </button>

      {showDashboard && (
        <Suspense fallback={<Spinner />}>
          <Dashboard />
        </Suspense>
      )}
    </div>
  );
}
```

**Webpack Magic Comments:**
```javascript
// Prefetch (load during browser idle time)
const Dashboard = lazy(() =>
  import(/* webpackPrefetch: true */ './Dashboard')
);

// Preload (load in parallel with parent chunk)
const CriticalComponent = lazy(() =>
  import(/* webpackPreload: true */ './CriticalComponent')
);

// Custom chunk name
const Admin = lazy(() =>
  import(/* webpackChunkName: "admin-panel" */ './Admin')
);

// Combine multiple comments
const Profile = lazy(() =>
  import(
    /* webpackChunkName: "profile" */
    /* webpackPrefetch: true */
    './Profile'
  )
);
```

## Vue Code Splitting

### Async Components

**Basic Async Component:**
```javascript
import { defineAsyncComponent } from 'vue';

export default {
  components: {
    // Simple async component
    AsyncComponent: defineAsyncComponent(() =>
      import('./components/AsyncComponent.vue')
    ),

    // With loading and error states
    AsyncComponentWithOptions: defineAsyncComponent({
      loader: () => import('./components/Heavy.vue'),
      loadingComponent: LoadingSpinner,
      errorComponent: ErrorComponent,
      delay: 200, // Show loading after 200ms
      timeout: 3000 // Show error after 3s
    })
  }
};
```

### Vue Router Lazy Loading

**Route-Based Splitting:**
```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      './views/Admin.vue'
    )
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

**Grouping Components:**
```javascript
// Components with same chunk name are bundled together
const UserProfile = () => import(/* webpackChunkName: "user" */ './UserProfile.vue');
const UserSettings = () => import(/* webpackChunkName: "user" */ './UserSettings.vue');
const UserPosts = () => import(/* webpackChunkName: "user" */ './UserPosts.vue');

// Results in single "user" chunk containing all three components
```

## Next.js Code Splitting

Next.js has automatic code splitting built-in.

### Automatic Route-Based Splitting

```
pages/
├── index.js         → /        (separate chunk)
├── about.js         → /about   (separate chunk)
└── dashboard.js     → /dashboard (separate chunk)
```

Each page is automatically split into its own chunk.

### Dynamic Imports with next/dynamic

**Client-Side Only Components:**
```javascript
import dynamic from 'next/dynamic';

// Component only loads on client (SSR disabled)
const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  ssr: false,
  loading: () => <Spinner />
});

export default function Page() {
  return (
    <div>
      <DynamicComponent />
    </div>
  );
}
```

**Named Exports:**
```javascript
const DynamicHeader = dynamic(() =>
  import('../components/Layout').then(mod => mod.Header)
);
```

**Conditional Loading:**
```javascript
export default function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  // Only import when needed
  const Chart = showChart
    ? dynamic(() => import('../components/Chart'))
    : null;

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {Chart && <Chart />}
    </div>
  );
}
```

## Tree Shaking

Remove unused code from bundles.

### ES Modules Required

```javascript
// BAD: CommonJS (doesn't tree shake)
const _ = require('lodash');
const result = _.debounce(fn);

// GOOD: ES modules (tree shakes)
import { debounce } from 'lodash-es';
const result = debounce(fn);
```

### Package.json sideEffects

Tell webpack which files have side effects.

**package.json:**
```json
{
  "name": "my-library",
  "sideEffects": false // No files have side effects (all can be tree shaken)
}
```

**With exceptions:**
```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### Webpack Production Mode

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // Enables tree shaking and minification
  optimization: {
    usedExports: true, // Mark unused exports
    minimize: true // Remove unused code
  }
};
```

### Import Entire vs Named

```javascript
// BAD: Imports entire library (250 KB)
import _ from 'lodash';
_.debounce(fn);

// BETTER: Named import (tree shakes with lodash-es)
import { debounce } from 'lodash-es';

// BEST: Direct import (always works, even with lodash)
import debounce from 'lodash/debounce';
```

## Bundle Analysis

### Webpack Bundle Analyzer

**Install:**
```bash
npm install --save-dev webpack-bundle-analyzer
```

**webpack.config.js:**
```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // Generates HTML file
      openAnalyzer: true,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

**Run:**
```bash
npm run build
# Opens interactive treemap of bundle
```

**Interpret Results:**
- Large boxes = large modules (optimization targets)
- Duplicate modules = potential for code splitting
- Unexpected modules = check why they're included

### Source Map Explorer

**Install:**
```bash
npm install --save-dev source-map-explorer
```

**package.json:**
```json
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

**Run:**
```bash
npm run build
npm run analyze
```

### Next.js Bundle Analyzer

**Install:**
```bash
npm install @next/bundle-analyzer
```

**next.config.js:**
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
});
```

**Analyze:**
```bash
ANALYZE=true npm run build
```

## Performance Budgets

Set maximum bundle sizes to prevent regressions.

**webpack.config.js:**
```javascript
module.exports = {
  performance: {
    maxAssetSize: 244000, // 244 KB per asset
    maxEntrypointSize: 244000, // 244 KB per entry point
    hints: 'error' // Fail build if exceeded
  }
};
```

**Next.js (next.config.js):**
```javascript
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 244000,
        maxEntrypointSize: 244000,
        hints: 'error'
      };
    }
    return config;
  }
};
```

## Best Practices

### Route-Based Splitting

**DO:**
```javascript
// Split each route
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
```

**Reasoning:** Natural split points, clear boundaries, balanced chunk sizes.

### Component-Based Splitting

**DO:**
```javascript
// Split large, conditionally-rendered components
const HeavyChart = lazy(() => import('./components/Chart'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
const CodeEditor = lazy(() => import('./components/CodeEditor'));
```

**DON'T:**
```javascript
// Don't split small components
const Button = lazy(() => import('./components/Button')); // Overkill
```

**Reasoning:** Only split components that provide meaningful bundle reduction (>50 KB).

### Vendor Splitting

**DO:**
```javascript
// Separate stable vendor dependencies
optimization: {
  splitChunks: {
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
    }
  }
}
```

**Reasoning:** Vendor code changes less frequently, better caching.

### Prefetching/Preloading

**DO:**
```javascript
// Prefetch likely next page on link hover
<Link to="/dashboard" onMouseEnter={prefetchDashboard}>
  Dashboard
</Link>
```

**DON'T:**
```javascript
// Don't preload everything
const Everything = lazy(() =>
  import(/* webpackPreload: true */ './Everything')
);
```

**Reasoning:** Prefetch strategically, not aggressively.

### Error Handling

**DO:**
```javascript
<ErrorBoundary>
  <Suspense fallback={<Spinner />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

**Reasoning:** Network failures can cause chunk loading to fail.

## Common Mistakes

### Mistake 1: Splitting Too Much

```javascript
// BAD: Over-splitting
const Button = lazy(() => import('./Button')); // 2 KB component
const Input = lazy(() => import('./Input')); // 3 KB component
```

**Impact:** More network requests, worse performance.

**Fix:** Only split components >50 KB.

### Mistake 2: Not Using Suspense Boundaries

```javascript
// BAD: No fallback
const LazyComponent = lazy(() => import('./Heavy'));
<LazyComponent />; // Error - Suspense required
```

**Fix:**
```javascript
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

### Mistake 3: Ignoring Bundle Analysis

**Problem:** No visibility into bundle composition.

**Fix:** Run bundle analyzer regularly, set up CI checks.

### Mistake 4: Loading All Chunks Upfront

```javascript
// BAD: Defeating code splitting
import Home from './Home';
import Dashboard from './Dashboard';
import Admin from './Admin';
```

**Fix:** Use lazy loading for routes/components not needed immediately.

## Framework-Specific Tips

### Create React App

```javascript
// Automatic code splitting with React.lazy
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
```

CRA handles all Webpack configuration automatically.

### Vite

```javascript
// Vite uses Rollup, supports dynamic imports natively
const Dashboard = () => import('./Dashboard.vue');
```

Vite has excellent code splitting by default.

### Parcel

```javascript
// Parcel automatically code splits dynamic imports
import('./Dashboard').then(module => {
  // Use module
});
```

Zero configuration required.

## Summary

**Key Takeaways:**
1. Split by routes first (biggest impact, easiest to implement)
2. Split large components that are conditionally rendered
3. Separate vendor dependencies for better caching
4. Use bundle analyzer to identify optimization opportunities
5. Set performance budgets to prevent regressions
6. Prefetch/preload strategically for better UX
7. Don't over-split (creates more problems than it solves)

**Prioritization:**
1. Route-based splitting (high impact, low effort)
2. Vendor splitting (medium impact, low effort)
3. Component splitting (medium impact, medium effort)
4. Prefetching/preloading (low-medium impact, medium effort)

Focus on route-based splitting first for the best return on investment.
