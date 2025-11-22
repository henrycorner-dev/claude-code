# Edge Functions and Middleware Patterns

Comprehensive guide to implementing edge functions and middleware across Next.js, Nuxt, SvelteKit, Astro, and Remix frameworks.

## Table of Contents

- [Edge Computing Overview](#edge-computing-overview)
- [Next.js Edge Functions](#nextjs-edge-functions)
- [Nuxt Edge Functions](#nuxt-edge-functions)
- [SvelteKit Edge Functions](#sveltekit-edge-functions)
- [Remix Edge Functions](#remix-edge-functions)
- [Platform-Specific Implementations](#platform-specific-implementations)
- [Common Patterns](#common-patterns)
- [Limitations and Workarounds](#limitations-and-workarounds)

## Edge Computing Overview

Edge functions run on CDN edge nodes globally distributed close to users, providing:

- **Lower Latency** - Execute closer to users geographically
- **Reduced Server Load** - Offload compute from origin servers
- **Global Distribution** - Automatic worldwide deployment
- **Scalability** - Automatic scaling at edge locations

### Use Cases

**Authentication & Authorization:**

- Verify JWT tokens
- Check session cookies
- Enforce access control
- Redirect unauthenticated users

**Request/Response Transformation:**

- Modify headers
- Rewrite URLs
- Add security headers
- Compress responses

**Geolocation:**

- Redirect based on country
- Serve localized content
- Block regions
- Route to regional APIs

**A/B Testing:**

- Assign test variants
- Serve different content
- Track experiments
- Feature flags

**Bot Protection:**

- Detect bots
- Rate limiting
- CAPTCHA challenges
- DDoS mitigation

### Edge Runtime Constraints

**No Node.js APIs:**

- No `fs`, `path`, `crypto` (Node version)
- No native modules
- Limited npm packages

**Bundle Size Limits:**

- 1-4 MB depending on platform
- Tree shaking essential
- Minimize dependencies

**Execution Time Limits:**

- 10-50 seconds maximum
- Optimize for fast execution
- Handle cold starts

**Memory Limits:**

- 128 MB typical
- Optimize data structures
- Stream large responses

## Next.js Edge Functions

### Edge Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Authentication
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### Geolocation-Based Routing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US';
  const city = request.geo?.city || 'Unknown';

  // Redirect EU users
  if (['DE', 'FR', 'GB', 'IT', 'ES'].includes(country)) {
    return NextResponse.rewrite(new URL('/eu', request.url));
  }

  // Add geo headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-country', country);
  response.headers.set('x-user-city', city);

  return response;
}
```

### A/B Testing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check existing variant
  let variant = request.cookies.get('ab-variant')?.value;

  if (!variant) {
    // Assign random variant
    variant = Math.random() < 0.5 ? 'A' : 'B';
  }

  const response =
    variant === 'B'
      ? NextResponse.rewrite(new URL('/variant-b', request.url))
      : NextResponse.next();

  // Set cookie for persistence
  response.cookies.set('ab-variant', variant, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
```

### Edge API Routes

```typescript
// app/api/hello/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'World';

  return new Response(JSON.stringify({ message: `Hello, ${name}!` }), {
    headers: {
      'content-type': 'application/json',
    },
  });
}
```

### JWT Verification at Edge

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify JWT at edge
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

## Nuxt Edge Functions

### Server Middleware

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth-token');

  if (!token && event.path.startsWith('/dashboard')) {
    return sendRedirect(event, '/login');
  }

  // Add user to event context
  if (token) {
    event.context.user = await verifyToken(token);
  }
});
```

### Geolocation Handling

```typescript
// server/middleware/geo.ts
export default defineEventHandler(event => {
  // Cloudflare Workers headers
  const country = getHeader(event, 'cf-ipcountry') || 'US';

  // Vercel headers
  const vercelCountry = getHeader(event, 'x-vercel-ip-country');

  const userCountry = vercelCountry || country;

  event.context.country = userCountry;
});
```

### Edge-Cached API Routes

```typescript
// server/api/posts.get.ts
export default defineCachedEventHandler(
  async event => {
    const posts = await db.posts.findMany();

    return posts;
  },
  {
    maxAge: 60 * 10, // Cache 10 minutes
    swr: true, // Stale-while-revalidate
    getKey: () => 'posts-list',
  }
);
```

### Nuxt on Edge Runtime

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages', // or 'vercel-edge'
    routeRules: {
      '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } },
      '/admin/**': { ssr: false },
      '/blog/**': { swr: 3600 },
    },
  },
});
```

## SvelteKit Edge Functions

### Hooks for Authentication

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const user = await getUserFromSession(sessionId);
    event.locals.user = user;
  }

  // Protect routes
  if (event.url.pathname.startsWith('/dashboard') && !event.locals.user) {
    return new Response('Redirect', {
      status: 303,
      headers: { Location: '/login' },
    });
  }

  return resolve(event);
};
```

### Edge Deployment

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'edge',
      regions: ['iad1', 'sfo1'], // Deploy to specific regions
    }),
  },
};
```

### Edge API Routes

```typescript
// src/routes/api/data/+server.ts
import type { RequestHandler } from './$types';

export const config = {
  runtime: 'edge',
};

export const GET: RequestHandler = async ({ request }) => {
  const data = await fetchFromAPI();

  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=60',
    },
  });
};
```

## Remix Edge Functions

### Remix on Edge Runtime

Remix can run on Cloudflare Workers or Vercel Edge:

```typescript
// app/routes/_index.tsx
export const config = {
  runtime: 'edge',
};

export async function loader({ request }: LoaderFunctionArgs) {
  const country = request.headers.get('x-vercel-ip-country');

  return json({ country });
}
```

### Edge Middleware Pattern

```typescript
// app/routes/dashboard.tsx
import { redirect } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get('Cookie');
  const session = await getSessionFromCookie(cookie);

  if (!session) {
    throw redirect('/login');
  }

  return json({ user: session.user });
}
```

## Platform-Specific Implementations

### Vercel Edge Functions

```typescript
// api/edge.ts
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { geo, ip } = request;

  return new Response(
    JSON.stringify({
      country: geo?.country,
      city: geo?.city,
      ip,
    }),
    {
      headers: { 'content-type': 'application/json' },
    }
  );
}
```

### Cloudflare Workers

```typescript
// functions/api/hello.ts
export async function onRequest(context) {
  const { request, env } = context;

  const country = request.headers.get('cf-ipcountry');

  return new Response(JSON.stringify({ country }), {
    headers: { 'content-type': 'application/json' },
  });
}
```

### Netlify Edge Functions

```typescript
// netlify/edge-functions/hello.ts
export default async (request: Request) => {
  const country = request.headers.get('x-country');

  return new Response(JSON.stringify({ country }), {
    headers: { 'content-type': 'application/json' },
  });
};
```

## Common Patterns

### Rate Limiting

```typescript
// Next.js middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const limit = 10; // requests per minute
  const windowMs = 60 * 1000;

  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];

  // Filter recent requests
  const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < windowMs);

  if (recentRequests.length >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return NextResponse.next();
}
```

### Feature Flags

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const FEATURE_FLAGS = {
  newDashboard: 0.1, // 10% of users
  betaFeature: 0.5, // 50% of users
};

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value || 'anonymous';

  // Deterministic feature flag based on user ID
  const userHash = hashString(userId);
  const enableNewDashboard = userHash % 100 < FEATURE_FLAGS.newDashboard * 100;

  if (enableNewDashboard && request.nextUrl.pathname === '/dashboard') {
    return NextResponse.rewrite(new URL('/dashboard-v2', request.url));
  }

  return NextResponse.next();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

### Custom Headers

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );

  return response;
}
```

## Limitations and Workarounds

### No Node.js APIs

**Problem:** Cannot use `fs`, `crypto` (Node), `path`, etc.

**Workaround:** Use Web Crypto API:

```typescript
// Instead of Node crypto
import crypto from 'crypto';
const hash = crypto.createHash('sha256').update(data).digest('hex');

// Use Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode('string');
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
```

### Limited npm Packages

**Problem:** Many npm packages rely on Node.js APIs.

**Workaround:** Use edge-compatible alternatives:

- `jose` instead of `jsonwebtoken`
- `@upstash/redis` instead of `ioredis`
- Fetch API instead of `axios`

### Database Connections

**Problem:** Traditional databases require persistent connections.

**Workaround:** Use edge-compatible databases:

- Upstash Redis (HTTP-based)
- PlanetScale (MySQL over HTTP)
- Cloudflare D1 (SQLite)
- Supabase (PostgreSQL over HTTP)

```typescript
// Using Upstash Redis at edge
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function GET() {
  const data = await redis.get('key');
  return Response.json({ data });
}
```

### Environment Variables

**Problem:** Environment access differs per platform.

**Workaround:**

```typescript
// Cloudflare Workers
export async function onRequest(context) {
  const { env } = context;
  const apiKey = env.API_KEY;
}

// Vercel Edge
export default async function handler(request: Request) {
  const apiKey = process.env.API_KEY;
}
```

This comprehensive guide covers edge function patterns across major frameworks and platforms, enabling you to build performant, globally distributed applications.
