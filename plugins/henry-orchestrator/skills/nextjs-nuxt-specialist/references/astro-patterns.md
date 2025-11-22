# Astro Patterns and Best Practices

Comprehensive guide to building content-focused websites with Astro, covering islands architecture, content collections, and hybrid rendering.

## Table of Contents

- [Astro Overview](#astro-overview)
- [Islands Architecture](#islands-architecture)
- [Content Collections](#content-collections)
- [Routing](#routing)
- [Data Fetching](#data-fetching)
- [Framework Integration](#framework-integration)
- [Hybrid Rendering](#hybrid-rendering)
- [Performance Optimization](#performance-optimization)

## Astro Overview

Astro is a modern web framework optimized for content-rich websites with zero JavaScript by default and islands architecture for selective interactivity.

### Key Features

- **Zero JavaScript by default** - Ship only necessary JavaScript
- **Islands architecture** - Partial hydration for components
- **Framework-agnostic** - Use React, Vue, Svelte, etc. together
- **Content Collections** - Type-safe content management
- **Built-in optimizations** - Image optimization, CSS scoping
- **Flexible deployment** - Static or server-side rendering

### Project Structure

```
my-app/
├── src/
│   ├── components/         # Reusable components (.astro, .jsx, .vue)
│   ├── layouts/            # Layout components
│   ├── pages/              # File-based routing
│   │   ├── index.astro     # /
│   │   ├── about.astro     # /about
│   │   └── blog/
│   │       ├── [...slug].astro  # /blog/*
│   │       └── index.astro      # /blog
│   └── content/            # Content collections
│       └── blog/           # Collection name
│           ├── post-1.md
│           └── post-2.md
├── public/                 # Static assets
└── astro.config.mjs        # Astro configuration
```

## Islands Architecture

Astro components are static by default. Add interactivity selectively with client directives.

### Client Directives

**client:load** - Hydrate immediately on page load:

```astro
---
import Counter from '../components/Counter.jsx'
---

<Counter client:load />
```

**client:idle** - Hydrate when browser is idle:

```astro
<HeavyComponent client:idle />
```

**client:visible** - Hydrate when component enters viewport:

```astro
<LazyComponent client:visible />
```

**client:media** - Hydrate based on media query:

```astro
<MobileMenu client:media="(max-width: 768px)" />
```

**client:only** - Skip server rendering, client-only:

```astro
<BrowserOnlyComponent client:only="react" />
```

### Static Components (Default)

```astro
---
// src/components/Header.astro
interface Props {
  title: string
}

const { title } = Astro.props
---

<header>
  <h1>{title}</h1>
</header>
```

### Interactive Islands

```jsx
// src/components/Counter.jsx (React)
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

```astro
---
// src/pages/index.astro
import Counter from '../components/Counter.jsx'
---

<html>
  <body>
    <h1>My Site</h1>
    <!-- Static by default -->
    <p>This text is static HTML</p>

    <!-- Interactive island -->
    <Counter client:load />
  </body>
</html>
```

## Content Collections

Content Collections provide type-safe content management with validation.

### Defining Collections

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content'

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional()
  })
})

export const collections = {
  blog: blogCollection
}
```

### Creating Content

```markdown
---
# src/content/blog/first-post.md
title: "My First Post"
description: "This is my first blog post"
pubDate: 2024-01-01
author: "John Doe"
tags: ["astro", "blogging"]
---

# My First Post

This is the content of my first post.
```

### Querying Collections

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content'

const allPosts = await getCollection('blog')
const sortedPosts = allPosts.sort((a, b) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
)
---

<html>
  <body>
    <h1>Blog Posts</h1>
    {sortedPosts.map(post => (
      <article>
        <h2>
          <a href={`/blog/${post.slug}`}>{post.data.title}</a>
        </h2>
        <p>{post.data.description}</p>
        <time>{post.data.pubDate.toDateString()}</time>
      </article>
    ))}
  </body>
</html>
```

### Rendering Content

```astro
---
// src/pages/blog/[...slug].astro
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }))
}

const { post } = Astro.props
const { Content } = await post.render()
---

<html>
  <body>
    <article>
      <h1>{post.data.title}</h1>
      <time>{post.data.pubDate.toDateString()}</time>
      <Content />
    </article>
  </body>
</html>
```

### Filtering Collections

```astro
---
import { getCollection } from 'astro:content'

// Filter by tag
const astroPosts = await getCollection('blog', ({ data }) => {
  return data.tags?.includes('astro')
})

// Filter published posts
const publishedPosts = await getCollection('blog', ({ data }) => {
  return data.pubDate <= new Date()
})
---
```

## Routing

Astro uses file-based routing with `.astro` pages.

### Static Routes

```
src/pages/
├── index.astro         # /
├── about.astro         # /about
└── blog/
    └── index.astro     # /blog
```

### Dynamic Routes

```astro
---
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await fetchPosts()

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }))
}

const { post } = Astro.props
---

<h1>{post.title}</h1>
```

### Rest Parameters

```astro
---
// src/pages/[...path].astro
const { path } = Astro.params
// Matches: /a, /a/b, /a/b/c, etc.
---

<h1>Path: {path}</h1>
```

### API Routes

```typescript
// src/pages/api/posts.json.ts
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request }) => {
  const posts = await fetchPosts()

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json()

  await createPost(data)

  return new Response(JSON.stringify({ success: true }), {
    status: 201
  })
}
```

## Data Fetching

### Fetching in Components

```astro
---
// src/components/Posts.astro
const response = await fetch('https://api.example.com/posts')
const posts = await response.json()
---

{posts.map(post => (
  <article>
    <h2>{post.title}</h2>
  </article>
))}
```

### Fetching in Pages

```astro
---
// src/pages/index.astro
const posts = await fetch('https://api.example.com/posts')
  .then(r => r.json())
---

<html>
  <body>
    <h1>Latest Posts</h1>
    {posts.map(post => (
      <article>{post.title}</article>
    ))}
  </body>
</html>
```

### Using Content Collections

```astro
---
import { getCollection, getEntry } from 'astro:content'

// Get all entries
const allPosts = await getCollection('blog')

// Get single entry
const post = await getEntry('blog', 'first-post')
---
```

## Framework Integration

Astro supports multiple UI frameworks in the same project.

### Configuration

```bash
npx astro add react vue svelte
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vue from '@astrojs/vue'
import svelte from '@astrojs/svelte'

export default defineConfig({
  integrations: [react(), vue(), svelte()]
})
```

### Using Multiple Frameworks

```astro
---
// src/pages/index.astro
import ReactCounter from '../components/ReactCounter.jsx'
import VueCounter from '../components/VueCounter.vue'
import SvelteCounter from '../components/SvelteCounter.svelte'
---

<html>
  <body>
    <h1>Framework Mix</h1>

    <!-- React component -->
    <ReactCounter client:load />

    <!-- Vue component -->
    <VueCounter client:visible />

    <!-- Svelte component -->
    <SvelteCounter client:idle />
  </body>
</html>
```

### Passing Props

```astro
---
import Counter from '../components/Counter.jsx'

const initialCount = 10
---

<Counter count={initialCount} client:load />
```

### Sharing State

```jsx
// src/components/store.js
import { atom } from 'nanostores'

export const count = atom(0)
```

```jsx
// src/components/ReactCounter.jsx
import { useStore } from '@nanostores/react'
import { count } from './store'

export default function ReactCounter() {
  const $count = useStore(count)

  return (
    <button onClick={() => count.set($count + 1)}>
      React: {$count}
    </button>
  )
}
```

```vue
<!-- src/components/VueCounter.vue -->
<script setup>
import { useStore } from '@nanostores/vue'
import { count } from './store'

const $count = useStore(count)
</script>

<template>
  <button @click="count.set($count + 1)">
    Vue: {{ $count }}
  </button>
</template>
```

## Hybrid Rendering

Astro supports mixing static and server-rendered pages.

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

export default defineConfig({
  output: 'hybrid', // or 'server'
  adapter: node({
    mode: 'standalone'
  })
})
```

### Server-Side Rendering

```astro
---
// src/pages/dynamic.astro
export const prerender = false // Enable SSR for this page

const currentTime = new Date().toISOString()
---

<html>
  <body>
    <h1>Server Time: {currentTime}</h1>
  </body>
</html>
```

### Static Generation

```astro
---
// src/pages/static.astro
export const prerender = true // Static generation

const buildTime = new Date().toISOString()
---

<html>
  <body>
    <h1>Built at: {buildTime}</h1>
  </body>
</html>
```

### On-Demand Rendering

```astro
---
// src/pages/api/data.json.ts
export const prerender = false

export async function GET({ request }) {
  const data = await fetchLatestData()

  return new Response(JSON.stringify(data))
}
---
```

## Performance Optimization

### Image Optimization

```astro
---
import { Image } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---

<!-- Optimized image -->
<Image
  src={heroImage}
  alt="Hero"
  width={1200}
  height={600}
  format="webp"
  quality={80}
/>

<!-- Responsive image -->
<Image
  src={heroImage}
  alt="Hero"
  widths={[400, 800, 1200]}
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
/>
```

### CSS Scoping

Astro automatically scopes CSS to components:

```astro
---
// src/components/Card.astro
---

<div class="card">
  <h2>Card Title</h2>
</div>

<style>
  /* Automatically scoped - won't affect other components */
  .card {
    background: white;
    padding: 1rem;
  }

  h2 {
    color: blue;
  }
</style>
```

### Global CSS

```astro
---
// src/layouts/Layout.astro
---

<html>
  <head>
    <style is:global>
      /* Global styles */
      body {
        margin: 0;
        font-family: system-ui;
      }
    </style>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Partial Hydration Strategy

```astro
---
import HeroSection from '../components/HeroSection.astro'  // Static
import Newsletter from '../components/Newsletter.jsx'       // Interactive
import Footer from '../components/Footer.astro'             // Static
---

<html>
  <body>
    <!-- Static HTML -->
    <HeroSection />

    <!-- Only this is interactive -->
    <Newsletter client:visible />

    <!-- Static HTML -->
    <Footer />
  </body>
</html>
```

### Prefetching

```astro
<a href="/blog" rel="prefetch">Blog</a>
```

### View Transitions

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions'
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Build Optimizations

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',
    splitting: true
  },
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  }
})
```

This comprehensive guide covers Astro patterns for building fast, content-focused websites with optimal performance and developer experience.
