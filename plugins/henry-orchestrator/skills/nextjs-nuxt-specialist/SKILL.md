---
name: nextjs-nuxt-specialist
description: This skill should be used when the user asks to "optimize SSR", "set up Next.js", "configure Nuxt", "implement getServerSideProps", "add server-side rendering", "create dynamic routes", "implement data fetching", "add edge functions", "deploy edge middleware", "set up static site generation", "configure ISR", "optimize SSG", "build with SvelteKit", "set up Astro", "configure Remix", or mentions SSR/SSG frameworks, routing patterns, data fetching strategies, or edge computing.
version: 0.1.0
---

# Next.js & Nuxt Specialist

This skill provides comprehensive guidance for building and optimizing server-side rendered (SSR) and statically generated (SSG) web applications using modern frameworks including Next.js, Nuxt, SvelteKit, Astro, and Remix.

## When to Use This Skill

Use this skill when working with:

- **Framework Setup**: Initializing and configuring SSR/SSG frameworks
- **Rendering Strategies**: Implementing SSR, SSG, ISR, or hybrid approaches
- **Data Fetching**: Server-side data fetching, API routes, and data hydration
- **Routing**: File-based routing, dynamic routes, route parameters, and middleware
- **Edge Computing**: Edge functions, edge middleware, and edge runtime optimization
- **Performance**: Optimizing bundle size, code splitting, and rendering performance
- **Deployment**: Platform-specific deployment configurations and optimizations

## Core Concepts

### Rendering Strategies

Modern frameworks support multiple rendering strategies, each with specific use cases:

**Server-Side Rendering (SSR)**
- Renders pages on each request on the server
- Provides fresh data on every request
- Best for: Personalized content, authentication-required pages, real-time data
- Trade-off: Slower TTFB, higher server load

**Static Site Generation (SSG)**
- Pre-renders pages at build time
- Serves static HTML files
- Best for: Marketing pages, documentation, blogs, unchanging content
- Trade-off: Stale data until next build, longer build times

**Incremental Static Regeneration (ISR)**
- Combines SSG benefits with periodic updates
- Regenerates pages in background after specified interval
- Best for: Content that changes occasionally, high-traffic sites
- Trade-off: Complex caching, potential stale data between regenerations

**Client-Side Rendering (CSR)**
- Renders entirely in browser after initial page load
- Used for dynamic, interactive sections
- Best for: Dashboards, admin panels, highly interactive UIs
- Trade-off: Poor SEO, slower initial render

### Data Fetching Patterns

Each framework implements data fetching differently, but follows similar principles:

**Server-Side Data Fetching**
- Fetch data before rendering on server
- Direct database access possible
- Credentials and secrets stay on server
- Examples: `getServerSideProps` (Next.js), `server` load functions (SvelteKit)

**Build-Time Data Fetching**
- Fetch data during build process
- Results baked into static HTML
- Examples: `getStaticProps` (Next.js), Astro component frontmatter

**Client-Side Data Fetching**
- Fetch data after page loads in browser
- Use for personalized/real-time data
- Examples: `useEffect` with fetch, SWR, React Query

**Hybrid Approaches**
- Combine multiple strategies on single page
- Server-fetch critical data, client-fetch supplementary data
- Optimal for performance and user experience

### Routing Architecture

SSR/SSG frameworks use file-based routing with conventions:

**File-Based Routing**
- File structure determines routes
- `pages/about.tsx` → `/about`
- Reduces boilerplate, improves developer experience

**Dynamic Routes**
- Bracket notation for parameters: `[id].tsx`, `[slug].vue`
- Catch-all routes: `[...slug].tsx`
- Optional catch-all: `[[...slug]].tsx`

**Route Middleware**
- Execute code before rendering pages
- Use for: Authentication, redirects, headers, logging
- Framework-specific implementations vary

**API Routes**
- Backend endpoints in same codebase
- File-based like page routes
- `pages/api/users.ts` → `/api/users`

### Edge Functions

Edge functions run on CDN edge nodes closer to users:

**Benefits**
- Lower latency (geographic proximity)
- Reduced server costs (offload compute)
- Global distribution automatically

**Use Cases**
- Authentication and authorization
- A/B testing and feature flags
- Request/response transformation
- Geolocation-based content
- Rate limiting and security

**Limitations**
- Limited runtime environment
- Smaller bundle size limits
- No access to Node.js-specific APIs
- Cold start considerations

## Framework-Specific Guidance

This skill supports five major SSR/SSG frameworks. Each has unique patterns, conventions, and optimizations.

### Next.js

Next.js is the most popular React-based framework with robust SSR/SSG capabilities.

**Key Features:**
- App Router (React Server Components) and Pages Router
- Built-in optimization (Image, Font, Script components)
- Flexible rendering: SSR, SSG, ISR, CSR
- Edge Runtime support
- API Routes and Route Handlers

For detailed Next.js patterns, consult **`references/nextjs-patterns.md`** which covers:
- App Router vs Pages Router migration
- Server Components and Client Components
- Data fetching with `fetch`, Server Actions
- Dynamic routing and route groups
- Middleware and edge functions
- Performance optimization techniques

### Nuxt

Nuxt is the leading Vue-based SSR/SSG framework with excellent developer experience.

**Key Features:**
- Auto-imports for components, composables, utilities
- File-based routing with layouts
- Universal rendering (SSR + hydration)
- Powerful module ecosystem
- Built-in state management

For detailed Nuxt patterns, consult **`references/nuxt-patterns.md`** which covers:
- Nuxt 3 Composition API patterns
- Server routes and API endpoints
- `useFetch` and `useAsyncData` composables
- Dynamic routing and route middleware
- Nitro server engine optimization
- Module configuration and plugins

### SvelteKit

SvelteKit is Svelte's official framework for building SSR/SSG applications.

**Key Features:**
- Compiler-based (no virtual DOM)
- Minimal runtime overhead
- Form actions and progressive enhancement
- Flexible adapters for deployment
- Built-on Vite for fast HMR

For detailed SvelteKit patterns, consult **`references/sveltekit-patterns.md`** which covers:
- `+page.svelte` and `+page.server.ts` patterns
- Load functions (universal vs server)
- Form actions for mutations
- Hooks (handle, handleError, handleFetch)
- Adapter configuration for various platforms
- Performance optimization strategies

### Astro

Astro is a content-focused framework optimized for static sites with islands architecture.

**Key Features:**
- Islands architecture (partial hydration)
- Framework-agnostic (React, Vue, Svelte together)
- Zero JavaScript by default
- Content Collections for type-safe content
- Built-in image optimization

For detailed Astro patterns, consult **`references/astro-patterns.md`** which covers:
- Component islands and client directives
- Content Collections API
- Hybrid rendering (SSR + SSG)
- Framework integration patterns
- Image optimization
- Build performance optimization

### Remix

Remix is a React framework focused on web standards and progressive enhancement.

**Key Features:**
- Web standards-based (Web Fetch API, FormData)
- Nested routing with data loading
- Built-in error boundaries
- Progressive enhancement first
- Optimistic UI patterns

For detailed Remix patterns, consult **`references/remix-patterns.md`** which covers:
- Loader and action functions
- Nested routes and outlets
- Form handling and mutations
- Error boundaries and catch boundaries
- Resource routes
- Optimistic UI implementation

## Edge Functions and Middleware

Edge computing enables running code closer to users on CDN edge nodes.

**Common Edge Use Cases:**
- Authentication checks before page render
- Geolocation-based redirects
- A/B testing and feature flags
- Request/response header manipulation
- Bot protection and rate limiting

For comprehensive edge function patterns across frameworks, consult **`references/edge-functions.md`** which covers:
- Vercel Edge Functions
- Cloudflare Workers/Pages Functions
- Netlify Edge Functions
- Framework-specific edge middleware
- Edge runtime limitations and workarounds
- Performance optimization for edge

## Performance Optimization

SSR/SSG frameworks require specific optimization strategies:

**Bundle Optimization**
- Code splitting and dynamic imports
- Tree shaking unused code
- Route-based chunking
- Critical CSS extraction

**Image Optimization**
- Responsive images with srcset
- Modern formats (WebP, AVIF)
- Lazy loading below fold
- Framework-specific image components

**Data Fetching Optimization**
- Parallel data fetching
- Request deduplication
- Caching strategies (ISR, SWR)
- Streaming and Suspense

**Runtime Optimization**
- Server-side caching
- Edge caching and CDN
- Database query optimization
- Reducing JavaScript payload

For detailed performance strategies, consult **`references/performance-optimization.md`**.

## Working with This Skill

### Initial Setup

When setting up a new project:

1. Identify requirements (rendering strategy, framework preference)
2. Choose appropriate framework based on use case
3. Consult framework-specific reference for setup patterns
4. Implement recommended project structure
5. Configure deployment platform

### Adding Features

When adding routing, data fetching, or edge functions:

1. Review framework-specific patterns in references
2. Check examples directory for working code
3. Implement using framework conventions
4. Test SSR/SSG behavior in development
5. Verify production build and deployment

### Optimization

When optimizing existing applications:

1. Identify bottlenecks (rendering, data fetching, bundle size)
2. Consult performance optimization reference
3. Apply framework-specific optimization techniques
4. Measure improvements with Lighthouse/Web Vitals
5. Iterate based on metrics

## Additional Resources

### Reference Files

For comprehensive framework-specific guidance:

- **`references/nextjs-patterns.md`** - Next.js App Router, Pages Router, data fetching, routing, middleware, edge functions, optimization
- **`references/nuxt-patterns.md`** - Nuxt 3 patterns, composables, server routes, Nitro, modules, optimization
- **`references/sveltekit-patterns.md`** - SvelteKit load functions, form actions, hooks, adapters, optimization
- **`references/astro-patterns.md`** - Astro islands, content collections, hybrid rendering, image optimization
- **`references/remix-patterns.md`** - Remix loaders, actions, nested routing, error boundaries, optimistic UI
- **`references/edge-functions.md`** - Edge runtime patterns, platform-specific implementations, limitations
- **`references/performance-optimization.md`** - Bundle optimization, caching strategies, runtime performance

### Example Files

Working examples in `examples/`:

- **`examples/nextjs-app-router/`** - Complete Next.js app router project with Server Components, data fetching, routing
- **`examples/nuxt-ssr/`** - Nuxt 3 SSR application with composables, server routes, middleware
- **`examples/edge-middleware.ts`** - Edge middleware implementations for authentication, redirects, headers

Consult these examples for proven patterns and complete implementations.

## Quick Decision Guide

**Choose Next.js when:**
- Building React-based applications
- Need robust ecosystem and community
- Require enterprise features and support
- Want flexibility in rendering strategies

**Choose Nuxt when:**
- Building Vue-based applications
- Want excellent DX with auto-imports
- Need powerful module ecosystem
- Prefer convention over configuration

**Choose SvelteKit when:**
- Want minimal runtime overhead
- Need compiler optimizations
- Prefer progressive enhancement
- Building performance-critical apps

**Choose Astro when:**
- Building content-focused sites
- Want minimal JavaScript by default
- Need framework flexibility (multi-framework)
- Optimizing for static generation

**Choose Remix when:**
- Want web standards-first approach
- Need nested routing with data loading
- Building forms-heavy applications
- Prefer progressive enhancement

For detailed comparison and migration guides, consult the framework-specific references.

## Common Workflows

### Setting Up SSR

1. Choose framework based on requirements
2. Initialize project with official CLI
3. Configure rendering mode (SSR/SSG/hybrid)
4. Set up data fetching layer
5. Implement routing structure
6. Add middleware if needed
7. Configure deployment platform

### Implementing Data Fetching

1. Identify data requirements (server vs client)
2. Choose appropriate data fetching method
3. Implement data fetching in framework-specific way
4. Handle loading and error states
5. Optimize with caching/deduplication
6. Test in development and production modes

### Adding Edge Functions

1. Identify edge-suitable workloads
2. Check deployment platform support
3. Implement edge function/middleware
4. Test edge runtime constraints
5. Deploy and verify edge execution
6. Monitor performance and errors

### Optimizing Performance

1. Audit with Lighthouse/Web Vitals
2. Identify performance bottlenecks
3. Apply relevant optimization techniques
4. Measure impact of changes
5. Iterate until targets met

Consult framework-specific references for detailed implementation steps.
