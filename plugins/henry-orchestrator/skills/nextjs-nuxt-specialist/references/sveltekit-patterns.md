# SvelteKit Patterns and Best Practices

Comprehensive guide to building applications with SvelteKit, covering load functions, form actions, hooks, and deployment adapters.

## Table of Contents

- [SvelteKit Overview](#sveltekit-overview)
- [Routing](#routing)
- [Load Functions](#load-functions)
- [Form Actions](#form-actions)
- [Hooks](#hooks)
- [Server-Side Rendering](#server-side-rendering)
- [Adapters](#adapters)
- [Performance Optimization](#performance-optimization)

## SvelteKit Overview

SvelteKit is the official Svelte framework for building web applications with server-side rendering, static site generation, and progressive enhancement.

### Key Features

- **Compiler-based** - No virtual DOM, highly optimized output
- **File-based routing** - Automatic routing from file structure
- **Load functions** - Universal and server-only data loading
- **Form actions** - Progressive enhancement for forms
- **Hooks** - Server and client lifecycle hooks
- **Flexible adapters** - Deploy anywhere (Vercel, Netlify, Node, static)
- **TypeScript-first** - Excellent TypeScript support

### Project Structure

```
my-app/
├── src/
│   ├── routes/                 # File-based routes
│   │   ├── +page.svelte        # /
│   │   ├── +page.server.ts     # Server-side code for /
│   │   ├── +layout.svelte      # Layout for routes
│   │   ├── about/
│   │   │   └── +page.svelte    # /about
│   │   └── blog/
│   │       ├── +page.svelte    # /blog
│   │       └── [slug]/
│   │           ├── +page.svelte        # /blog/:slug
│   │           └── +page.server.ts     # Server data for /blog/:slug
│   ├── lib/                    # Reusable components and utilities
│   ├── app.html                # HTML template
│   └── hooks.server.ts         # Server hooks
├── static/                     # Static assets
└── svelte.config.js            # SvelteKit configuration
```

## Routing

SvelteKit uses file-based routing with special file naming conventions.

### Basic Routes

```
src/routes/
├── +page.svelte                # /
├── about/
│   └── +page.svelte            # /about
├── blog/
│   ├── +page.svelte            # /blog
│   └── [slug]/
│       └── +page.svelte        # /blog/:slug
└── [[lang]]/
    └── +page.svelte            # Optional parameter: / or /:lang
```

### Route Parameters

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>
```

```typescript
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug)

  return {
    post
  }
}
```

### Multiple Parameters

```
src/routes/
└── shop/
    └── [category]/
        └── [product]/
            └── +page.svelte    # /shop/:category/:product
```

```typescript
// src/routes/shop/[category]/[product]/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const { category, product } = params

  const productData = await getProduct(category, product)

  return {
    product: productData
  }
}
```

### Rest Parameters

```
src/routes/
└── [...path]/
    └── +page.svelte            # Catch-all: matches any path
```

### Route Groups

Organize routes without affecting URLs using `(group)` syntax:

```
src/routes/
├── (marketing)/
│   ├── about/
│   │   └── +page.svelte        # /about
│   └── contact/
│       └── +page.svelte        # /contact
└── (app)/
    ├── dashboard/
    │   └── +page.svelte        # /dashboard
    └── settings/
        └── +page.svelte        # /settings
```

## Load Functions

Load functions fetch data before rendering pages. SvelteKit has two types: universal and server-only.

### Universal Load (+page.ts)

Runs on both server and client:

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/api/posts')
  const posts = await response.json()

  return {
    posts
  }
}
```

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

{#each data.posts as post}
  <article>
    <h2>{post.title}</h2>
  </article>
{/each}
```

### Server Load (+page.server.ts)

Runs only on server (can access database, secrets):

```typescript
// src/routes/posts/+page.server.ts
import type { PageServerLoad } from './$types'
import { db } from '$lib/database'

export const load: PageServerLoad = async () => {
  const posts = await db.post.findMany()

  return {
    posts
  }
}
```

### When to Use Each

**Use universal load (+page.ts) when:**
- Data can be fetched from public API
- Need to run on both server and client
- Want to use client-side navigation

**Use server load (+page.server.ts) when:**
- Need to access database directly
- Need to use environment variables/secrets
- Want to keep logic server-only
- Need to set cookies or headers

### Load Function Features

#### Parent Data Access

```typescript
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent }) => {
  // Access data from parent layout
  const parentData = await parent()

  const post = await getPost(params.slug)

  return {
    post,
    categories: parentData.categories
  }
}
```

#### Dependencies and Invalidation

```typescript
// src/routes/posts/+page.ts
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, depends }) => {
  // Mark dependencies for invalidation
  depends('app:posts')

  const response = await fetch('/api/posts')
  const posts = await response.json()

  return { posts }
}
```

**Invalidate manually:**

```svelte
<script lang="ts">
  import { invalidate } from '$app/navigation'

  async function refreshPosts() {
    await invalidate('app:posts')
  }
</script>

<button on:click={refreshPosts}>Refresh</button>
```

#### Streaming with Promises

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  return {
    // Await critical data
    user: await getUser(),

    // Stream non-critical data
    stats: getStats(), // Returns Promise
    activities: getRecentActivities() // Returns Promise
  }
}
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  export let data

  $: ({ user, stats, activities } = data)
</script>

<h1>Welcome, {user.name}</h1>

{#await stats}
  <p>Loading stats...</p>
{:then statsData}
  <Stats data={statsData} />
{/await}

{#await activities}
  <p>Loading activities...</p>
{:then activitiesData}
  <Activities data={activitiesData} />
{/await}
```

## Form Actions

Form actions enable progressive enhancement for forms without JavaScript.

### Basic Form Action

```typescript
// src/routes/login/+page.server.ts
import type { Actions } from './$types'
import { fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData()
    const email = data.get('email')
    const password = data.get('password')

    if (!email || !password) {
      return fail(400, { email, missing: true })
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return fail(400, { email, incorrect: true })
    }

    cookies.set('session', user.sessionId, { path: '/' })

    throw redirect(303, '/dashboard')
  }
}
```

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<form method="POST">
  <input
    name="email"
    type="email"
    value={form?.email ?? ''}
    required
  />

  {#if form?.missing}
    <p class="error">Email and password are required</p>
  {/if}

  {#if form?.incorrect}
    <p class="error">Invalid credentials</p>
  {/if}

  <input name="password" type="password" required />

  <button type="submit">Login</button>
</form>
```

### Named Actions

```typescript
// src/routes/todos/+page.server.ts
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData()
    const title = data.get('title')

    if (!title) {
      return fail(400, { title, missing: true })
    }

    await createTodo({ title })

    return { success: true }
  },

  delete: async ({ request }) => {
    const data = await request.formData()
    const id = data.get('id')

    await deleteTodo(id)

    return { success: true }
  }
}
```

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  export let data
</script>

<!-- Create todo -->
<form method="POST" action="?/create">
  <input name="title" required />
  <button type="submit">Add</button>
</form>

<!-- Delete todo -->
{#each data.todos as todo}
  <div>
    <span>{todo.title}</span>
    <form method="POST" action="?/delete">
      <input type="hidden" name="id" value={todo.id} />
      <button type="submit">Delete</button>
    </form>
  </div>
{/each}
```

### Progressive Enhancement

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  export let form: ActionData

  let loading = false
</script>

<form
  method="POST"
  use:enhance={() => {
    loading = true

    return async ({ result, update }) => {
      loading = false

      if (result.type === 'success') {
        // Custom success handling
        console.log('Success!')
      }

      // Apply default behavior
      await update()
    }
  }}
>
  <input name="email" type="email" required />
  <button type="submit" disabled={loading}>
    {loading ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

## Hooks

Hooks run before every request and can modify request/response.

### Server Hooks

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // Authentication
  const session = event.cookies.get('session')

  if (session) {
    event.locals.user = await getUserFromSession(session)
  }

  // Resolve request
  const response = await resolve(event)

  // Add custom header
  response.headers.set('x-custom-header', 'value')

  return response
}
```

**Use in load functions:**

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login')
  }

  return {
    user: locals.user
  }
}
```

### Handle Fetch Hook

```typescript
// src/hooks.server.ts
import type { HandleFetch } from '@sveltejs/kit'

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  // Modify outgoing fetch requests
  if (request.url.startsWith('https://api.example.com/')) {
    request.headers.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  }

  return fetch(request)
}
```

### Error Hook

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
  // Log errors
  console.error('Error:', error, 'Path:', event.url.pathname)

  return {
    message: 'An error occurred',
    code: error?.code ?? 'UNKNOWN'
  }
}
```

### Client Hooks

```typescript
// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit'

export const handleError: HandleClientError = ({ error, event }) => {
  console.error('Client error:', error)

  return {
    message: 'Something went wrong'
  }
}
```

### Sequence Multiple Hooks

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks'

const authentication = async ({ event, resolve }) => {
  // Auth logic
  return resolve(event)
}

const logging = async ({ event, resolve }) => {
  console.log('Request:', event.url.pathname)
  return resolve(event)
}

export const handle = sequence(authentication, logging)
```

## Server-Side Rendering

### SSR Configuration

```typescript
// src/routes/+page.ts
export const ssr = true // Default
```

**Disable SSR for specific routes:**

```typescript
// src/routes/admin/+page.ts
export const ssr = false // Client-side only
```

### Prerendering

```typescript
// src/routes/about/+page.ts
export const prerender = true // Generate at build time
```

**Configure in svelte.config.js:**

```javascript
// svelte.config.js
export default {
  kit: {
    prerender: {
      entries: ['*'],
      crawl: true
    }
  }
}
```

### Hydration

SvelteKit automatically hydrates server-rendered pages. Control with:

```svelte
<script lang="ts">
  export let data

  // This runs only on client after hydration
  import { browser } from '$app/environment'

  if (browser) {
    console.log('Client-side only')
  }
</script>
```

## Adapters

Adapters configure SvelteKit for different deployment platforms.

### Auto Adapter (Default)

```bash
npm install -D @sveltejs/adapter-auto
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'

export default {
  kit: {
    adapter: adapter()
  }
}
```

### Node Adapter

```bash
npm install -D @sveltejs/adapter-node
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node'

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true
    })
  }
}
```

### Static Adapter

```bash
npm install -D @sveltejs/adapter-static
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static'

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null
    })
  }
}
```

### Vercel Adapter

```bash
npm install -D @sveltejs/adapter-vercel
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel'

export default {
  kit: {
    adapter: adapter({
      runtime: 'edge' // or 'nodejs'
    })
  }
}
```

### Netlify Adapter

```bash
npm install -D @sveltejs/adapter-netlify
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-netlify'

export default {
  kit: {
    adapter: adapter({
      edge: false,
      split: false
    })
  }
}
```

## Performance Optimization

### Code Splitting

SvelteKit automatically code splits by route. Optimize further with dynamic imports:

```svelte
<script lang="ts">
  let HeavyComponent

  async function loadComponent() {
    const module = await import('$lib/components/HeavyComponent.svelte')
    HeavyComponent = module.default
  }
</script>

<button on:click={loadComponent}>Load Component</button>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{/if}
```

### Image Optimization

```svelte
<script lang="ts">
  // Use responsive images
  const imageSizes = [400, 800, 1200]
  const imageSrc = '/images/hero.jpg'
</script>

<img
  src={imageSrc}
  srcset={imageSizes.map(size => `${imageSrc}?w=${size} ${size}w`).join(', ')}
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero"
  loading="lazy"
/>
```

### Prefetching

```svelte
<script>
  import { prefetch } from '$app/navigation'
</script>

<!-- Automatic prefetching on hover -->
<a href="/blog" data-sveltekit-prefetch>Blog</a>

<!-- Programmatic prefetching -->
<button on:mouseenter={() => prefetch('/dashboard')}>
  Dashboard
</button>
```

### Bundle Analysis

```bash
npm install -D vite-bundle-visualizer
```

```javascript
// svelte.config.js
import { visualizer } from 'vite-bundle-visualizer'

export default {
  kit: {
    vite: {
      plugins: [
        visualizer({
          open: true
        })
      ]
    }
  }
}
```

This comprehensive guide covers SvelteKit patterns for building modern web applications with excellent performance and developer experience.
