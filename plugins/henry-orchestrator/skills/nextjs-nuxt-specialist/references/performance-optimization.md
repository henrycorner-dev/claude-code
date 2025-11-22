# Performance Optimization for SSR/SSG Frameworks

Comprehensive guide to optimizing performance across Next.js, Nuxt, SvelteKit, Astro, and Remix applications.

## Table of Contents

- [Performance Metrics](#performance-metrics)
- [Bundle Optimization](#bundle-optimization)
- [Image Optimization](#image-optimization)
- [Data Fetching Optimization](#data-fetching-optimization)
- [Caching Strategies](#caching-strategies)
- [Runtime Optimization](#runtime-optimization)
- [Rendering Strategies](#rendering-strategies)
- [Monitoring and Debugging](#monitoring-and-debugging)

## Performance Metrics

### Core Web Vitals

Focus on three critical metrics:

**Largest Contentful Paint (LCP)** - Loading performance

- Target: < 2.5 seconds
- Measures: Time to render largest content element
- Optimize: Reduce server response time, optimize images, eliminate render-blocking resources

**First Input Delay (FID) / Interaction to Next Paint (INP)** - Interactivity

- Target: < 100ms (FID), < 200ms (INP)
- Measures: Time from user interaction to browser response
- Optimize: Reduce JavaScript execution time, code splitting, defer non-critical JS

**Cumulative Layout Shift (CLS)** - Visual stability

- Target: < 0.1
- Measures: Unexpected layout shifts
- Optimize: Set dimensions for images/videos, avoid injecting content, use CSS transforms

### Additional Metrics

**Time to First Byte (TTFB)**

- Server response time
- Target: < 600ms

**First Contentful Paint (FCP)**

- First content rendered
- Target: < 1.8 seconds

**Total Blocking Time (TBT)**

- Main thread blocking time
- Target: < 200ms

**Speed Index**

- How quickly content is visually displayed
- Target: < 3.4 seconds

## Bundle Optimization

### Code Splitting

**Next.js:**

```typescript
// Dynamic imports
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // Disable SSR for this component
})

// Route-based splitting (automatic)
// Each page in app/ or pages/ is automatically code split
```

**Nuxt:**

```vue
<script setup lang="ts">
// Lazy load component
const HeavyComponent = defineAsyncComponent(() => import('~/components/HeavyComponent.vue'));
</script>

<template>
  <div>
    <!-- Or use Lazy prefix -->
    <LazyHeavyComponent />
  </div>
</template>
```

**SvelteKit:**

```svelte
<script lang="ts">
  let Component

  async function loadComponent() {
    const module = await import('$lib/components/Heavy.svelte')
    Component = module.default
  }
</script>

{#if Component}
  <svelte:component this={Component} />
{/if}
```

### Tree Shaking

Ensure imports are tree-shakeable:

```typescript
// Bad - imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 100);

// Good - imports only needed function
import { debounce } from 'lodash-es';
const result = debounce(fn, 100);

// Better - direct import
import debounce from 'lodash-es/debounce';
const result = debounce(fn, 100);
```

### Bundle Analysis

**Next.js:**

```bash
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({})

# Analyze
ANALYZE=true npm run build
```

**Nuxt:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  build: {
    analyze: true,
  },
});
```

**SvelteKit:**

```bash
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [visualizer()]
}
```

### Minimize Dependencies

```bash
# Analyze package sizes
npm install -g cost-of-modules
cost-of-modules

# Check bundle impact before installing
npm install -g bundle-phobia-cli
bundle-phobia package-name
```

## Image Optimization

### Framework-Specific Solutions

**Next.js Image Component:**

```typescript
import Image from 'next/image'

export default function Gallery() {
  return (
    <div>
      {/* Optimized with automatic WebP/AVIF */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority  // Load eagerly for LCP
        placeholder="blur"
        blurDataURL="/hero-blur.jpg"
      />

      {/* Responsive image */}
      <Image
        src="/product.jpg"
        alt="Product"
        sizes="(max-width: 768px) 100vw, 50vw"
        fill
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
```

**Nuxt Image:**

```bash
npm install @nuxt/image
```

```vue
<template>
  <NuxtImg
    src="/hero.jpg"
    width="1200"
    height="600"
    format="webp"
    quality="80"
    loading="lazy"
    placeholder
  />
</template>
```

**Astro Image:**

```astro
---
import { Image } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---

<Image
  src={heroImage}
  alt="Hero"
  width={1200}
  height={600}
  format="webp"
  quality={80}
/>
```

### Manual Optimization

**Responsive Images:**

```html
<img
  src="/hero-800.jpg"
  srcset="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Hero"
  loading="lazy"
  decoding="async"
/>
```

**Modern Formats:**

```html
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="Hero" />
</picture>
```

### Image Best Practices

1. **Set explicit dimensions** - Prevent CLS
2. **Use modern formats** - WebP/AVIF (30-50% smaller)
3. **Lazy load below fold** - Reduce initial load
4. **Prioritize LCP image** - Load eagerly
5. **Optimize quality** - 80% quality often imperceptible
6. **Responsive images** - Serve appropriate sizes
7. **Use CDN** - Faster delivery, automatic optimization

## Data Fetching Optimization

### Parallel Fetching

```typescript
// Next.js App Router
async function getData() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json()),
  ]);

  return { user, posts, comments };
}
```

### Request Deduplication

**Next.js:**

```typescript
// Multiple components fetching same data = single request
async function getUser() {
  const res = await fetch('/api/user', {
    cache: 'force-cache',
  });
  return res.json();
}

// Component A
const user = await getUser();

// Component B (same request, deduped)
const user = await getUser();
```

**Nuxt:**

```typescript
// Automatic deduplication
const { data } = await useFetch('/api/user', {
  key: 'user', // Same key = deduped
});
```

### Streaming and Suspense

**Next.js:**

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>
    </div>
  )
}
```

**Remix:**

```typescript
import { defer } from '@remix-run/node'
import { Await, useLoaderData } from '@remix-run/react'
import { Suspense } from 'react'

export async function loader() {
  return defer({
    user: await getUser(),    // Critical - wait
    posts: getPosts()          // Non-critical - stream
  })
}

export default function Dashboard() {
  const { user, posts } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{user.name}</h1>

      <Suspense fallback={<Loading />}>
        <Await resolve={posts}>
          {(postsData) => <PostList posts={postsData} />}
        </Await>
      </Suspense>
    </div>
  )
}
```

### Prefetching

**Next.js:**

```typescript
import Link from 'next/link'

// Automatic prefetch on hover
<Link href="/dashboard" prefetch>Dashboard</Link>

// Programmatic prefetch
import { useRouter } from 'next/navigation'

const router = useRouter()
router.prefetch('/dashboard')
```

**Remix:**

```typescript
import { Link } from '@remix-run/react'

// Prefetch on intent (hover/focus)
<Link to="/dashboard" prefetch="intent">Dashboard</Link>

// Prefetch on render
<Link to="/dashboard" prefetch="render">Dashboard</Link>
```

## Caching Strategies

### HTTP Caching

```typescript
// Next.js Route Handler
export async function GET() {
  const data = await fetchData();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

### ISR (Incremental Static Regeneration)

**Next.js:**

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

async function getData() {
  const res = await fetch('/api/data', {
    next: { revalidate: 60 },
  });
  return res.json();
}
```

**Nuxt:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/blog/**': {
      swr: 3600, // Stale-while-revalidate for 1 hour
    },
  },
});
```

### CDN Caching

```typescript
// Set cache headers for CDN
return new Response(html, {
  headers: {
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'max-age=3600',
    'Vercel-CDN-Cache-Control': 'max-age=3600',
  },
});
```

### Client-Side Caching

**SWR (Next.js/React):**

```typescript
import useSWR from 'swr'

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000  // Refresh every minute
  })

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return <div>Hello {data.name}!</div>
}
```

**Nuxt useFetch:**

```typescript
const { data } = await useFetch('/api/user', {
  key: 'user',
  getCachedData: key => {
    // Custom cache logic
    return useNuxtData(key).data;
  },
});
```

## Runtime Optimization

### JavaScript Execution

**Reduce Main Thread Blocking:**

```typescript
// Split heavy computations
async function heavyComputation(data) {
  const chunks = chunkArray(data, 100);

  for (const chunk of chunks) {
    await processChunk(chunk);

    // Yield to main thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

**Web Workers:**

```typescript
// worker.ts
self.onmessage = e => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// main.ts
const worker = new Worker('/worker.js');

worker.postMessage(data);
worker.onmessage = e => {
  console.log('Result:', e.data);
};
```

### CSS Optimization

**Critical CSS:**

```typescript
// Extract above-the-fold CSS
import { getCriticalCSS } from 'critical-css';

const criticalCSS = await getCriticalCSS({
  url: 'https://example.com',
  width: 1300,
  height: 900,
});
```

**CSS-in-JS Optimization:**

```typescript
// Use compile-time CSS extraction
// styled-components, emotion with SSR extraction
// Or use zero-runtime solutions: vanilla-extract, Linaria
```

### Font Optimization

**Next.js:**

```typescript
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**Manual:**

```html
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />

<style>
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('/fonts/Inter-Regular.woff2') format('woff2');
  }
</style>
```

## Rendering Strategies

### Choose the Right Strategy

**Static Site Generation (SSG)** - Best performance

- Marketing pages
- Documentation
- Blogs
- Unchanging content

**Incremental Static Regeneration (ISR)** - Balanced

- E-commerce product pages
- News sites
- Content that changes occasionally

**Server-Side Rendering (SSR)** - Always fresh

- Personalized dashboards
- User-specific content
- Real-time data

**Client-Side Rendering (CSR)** - Highly interactive

- Admin panels
- Complex dashboards
- After authentication

### Hybrid Rendering

```typescript
// Next.js - Mix strategies per route
// app/page.tsx - SSG
export const dynamic = 'force-static';

// app/dashboard/page.tsx - SSR
export const dynamic = 'force-dynamic';

// app/blog/[slug]/page.tsx - ISR
export const revalidate = 3600;
```

```typescript
// Nuxt - Per-route configuration
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true }, // SSG
    '/dashboard/**': { ssr: false }, // CSR
    '/blog/**': { swr: 3600 }, // ISR
    '/api/**': { cors: true }, // API
  },
});
```

## Monitoring and Debugging

### Lighthouse

```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse https://example.com --view

# CI integration
lighthouse https://example.com --output=json --output-path=./report.json
```

### Web Vitals Monitoring

**Next.js:**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Custom Web Vitals:**

```typescript
// app/_app.tsx (Next.js Pages Router)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  const url = '/api/analytics';

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Profiling

**React DevTools Profiler:**

```typescript
import { Profiler } from 'react'

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log({ id, phase, actualDuration })
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

**Chrome DevTools:**

1. Open DevTools → Performance tab
2. Record interaction
3. Analyze flamegraph for bottlenecks
4. Check Network waterfall
5. Examine Coverage tab for unused code

### Bundle Size Monitoring

```bash
# Next.js
npx @next/bundle-analyzer

# Generic
npm install -g bundlesize
```

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/bundle.js",
      "maxSize": "200 kB"
    }
  ]
}
```

### Performance Budget

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
  },
};
```

This comprehensive guide provides strategies to optimize performance across all major SSR/SSG frameworks. Apply techniques relevant to your specific framework and use case for best results.
