# Nuxt Patterns and Best Practices

Comprehensive guide to building applications with Nuxt 3, covering Composition API, server routes, Nitro engine, and Vue ecosystem integration.

## Table of Contents

- [Nuxt 3 Overview](#nuxt-3-overview)
- [Data Fetching](#data-fetching)
- [Routing](#routing)
- [Server Routes and API](#server-routes-and-api)
- [State Management](#state-management)
- [Composables](#composables)
- [Nitro Server Engine](#nitro-server-engine)
- [Modules and Plugins](#modules-and-plugins)
- [Performance Optimization](#performance-optimization)

## Nuxt 3 Overview

Nuxt 3 is a complete rewrite built on Vue 3, Vite, and Nitro with improved performance and developer experience.

### Key Features

- **Vue 3 Composition API** - Reactive state and composables
- **Auto-imports** - Components, composables, and utilities
- **File-based routing** - Automatic route generation
- **Server routes** - Full-stack framework with API routes
- **Nitro engine** - Universal server deployment
- **Hybrid rendering** - Mix SSR, SSG, and SPA per route
- **TypeScript** - First-class TypeScript support

### Project Structure

```
my-app/
├── .nuxt/              # Build output (generated)
├── app.vue             # Main app component (optional)
├── nuxt.config.ts      # Nuxt configuration
├── package.json
├── tsconfig.json
├── assets/             # Uncompiled assets (CSS, images)
├── components/         # Vue components (auto-imported)
├── composables/        # Composable functions (auto-imported)
├── layouts/            # Layout components
├── middleware/         # Route middleware
├── pages/              # File-based routing
├── plugins/            # Nuxt plugins
├── public/             # Static files served at root
└── server/             # Server-side code
    ├── api/            # API endpoints
    ├── routes/         # Server routes
    └── middleware/     # Server middleware
```

## Data Fetching

Nuxt 3 provides composables for data fetching with SSR support and automatic hydration.

### useFetch

`useFetch` is the primary composable for fetching data:

```vue
<script setup lang="ts">
const { data: posts, pending, error, refresh } = await useFetch('/api/posts');
</script>

<template>
  <div>
    <p v-if="pending">Loading...</p>
    <p v-else-if="error">Error: {{ error.message }}</p>
    <div v-else>
      <article v-for="post in posts" :key="post.id">
        <h2>{{ post.title }}</h2>
      </article>
    </div>
  </div>
</template>
```

#### useFetch Options

```typescript
const { data, pending, error, refresh } = await useFetch('/api/posts', {
  // Query parameters
  query: { limit: 10, page: 1 },

  // HTTP method
  method: 'GET',

  // Request headers
  headers: {
    Authorization: 'Bearer token',
  },

  // Request body
  body: { title: 'New Post' },

  // Pick specific fields from response
  pick: ['id', 'title'],

  // Transform response data
  transform: data => {
    return data.map(post => ({
      ...post,
      titleUpper: post.title.toUpperCase(),
    }));
  },

  // Cache key (for deduplication)
  key: 'posts-list',

  // Server-only execution
  server: true,

  // Lazy loading (don't block navigation)
  lazy: true,

  // Watch sources for refetch
  watch: [searchQuery],
});
```

### useAsyncData

`useAsyncData` provides more control for custom data fetching:

```vue
<script setup lang="ts">
const { data: user, pending } = await useAsyncData('user', async () => {
  const response = await $fetch('/api/user');
  return response;
});
</script>

<template>
  <div>
    <p v-if="pending">Loading user...</p>
    <p v-else>Welcome, {{ user.name }}!</p>
  </div>
</template>
```

#### useAsyncData with Dependencies

```vue
<script setup lang="ts">
const route = useRoute();

const { data: post } = await useAsyncData(
  `post-${route.params.id}`,
  async () => {
    const response = await $fetch(`/api/posts/${route.params.id}`);
    return response;
  },
  {
    watch: [() => route.params.id],
  }
);
</script>
```

### useLazyFetch and useLazyAsyncData

Non-blocking versions for client-side navigation:

```vue
<script setup lang="ts">
// Don't block navigation - load in background
const { pending, data: posts } = useLazyFetch('/api/posts');
</script>

<template>
  <div>
    <button @click="refresh">Refresh</button>
    <p v-if="pending">Loading...</p>
    <PostList v-else :posts="posts" />
  </div>
</template>
```

### $fetch

Direct fetch utility for manual requests:

```typescript
// In components or composables
const posts = await $fetch('/api/posts');

// With options
const post = await $fetch('/api/posts', {
  method: 'POST',
  body: {
    title: 'New Post',
    content: 'Content here',
  },
});
```

### Data Fetching Best Practices

**Parallel Fetching:**

```vue
<script setup lang="ts">
// Both requests happen in parallel
const [{ data: user }, { data: posts }] = await Promise.all([
  useFetch('/api/user'),
  useFetch('/api/posts'),
]);
</script>
```

**Sequential Fetching:**

```vue
<script setup lang="ts">
const { data: user } = await useFetch('/api/user');

// Wait for user before fetching posts
const { data: posts } = await useFetch(`/api/posts?userId=${user.value.id}`);
</script>
```

**Conditional Fetching:**

```vue
<script setup lang="ts">
const userId = ref<string | null>(null);

const { data: user } = await useAsyncData('user', () => $fetch(`/api/users/${userId.value}`), {
  // Only fetch when userId is set
  watch: [userId],
  immediate: false,
});

// Later in component
function loadUser(id: string) {
  userId.value = id;
}
</script>
```

## Routing

Nuxt uses file-based routing with automatic route generation from the `pages/` directory.

### Basic Routing

```
pages/
├── index.vue           # /
├── about.vue           # /about
├── posts/
│   ├── index.vue       # /posts
│   └── [id].vue        # /posts/:id
└── [...slug].vue       # /* (catch-all)
```

### Dynamic Routes

```vue
<!-- pages/posts/[id].vue -->
<script setup lang="ts">
const route = useRoute();

const { data: post } = await useFetch(`/api/posts/${route.params.id}`);
</script>

<template>
  <article>
    <h1>{{ post.title }}</h1>
    <div>{{ post.content }}</div>
  </article>
</template>
```

### Nested Routes

```
pages/
└── parent/
    ├── index.vue       # /parent
    ├── child.vue       # /parent/child
    └── [id]/
        └── index.vue   # /parent/:id
```

**With Layouts:**

```vue
<!-- pages/parent.vue -->
<template>
  <div>
    <h1>Parent</h1>
    <NuxtPage />
    <!-- Nested routes render here -->
  </div>
</template>
```

### Navigation

```vue
<script setup lang="ts">
const router = useRouter();

function goToPost(id: string) {
  // Programmatic navigation
  router.push(`/posts/${id}`);

  // Or with object
  router.push({
    path: '/posts',
    query: { page: 1 },
  });
}
</script>

<template>
  <div>
    <!-- Declarative navigation -->
    <NuxtLink to="/about">About</NuxtLink>
    <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>

    <!-- Programmatic -->
    <button @click="goToPost('123')">View Post</button>
  </div>
</template>
```

### Route Middleware

Define middleware in `middleware/` directory:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('user');

  if (!user.value) {
    return navigateTo('/login');
  }
});
```

**Use in pages:**

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});
</script>

<template>
  <div>Dashboard content</div>
</template>
```

**Inline middleware:**

```vue
<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      // Inline middleware logic
      if (!userIsAdmin()) {
        return navigateTo('/unauthorized');
      }
    },
  ],
});
</script>
```

**Global middleware:**

```typescript
// middleware/analytics.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Runs on every route change
  console.log('Navigating to:', to.path);
});
```

### Layouts

Define layouts in `layouts/` directory:

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
      <!-- Page content renders here -->
    </main>

    <footer>Footer content</footer>
  </div>
</template>
```

**Use layouts in pages:**

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
});
</script>

<template>
  <div>Home page content</div>
</template>
```

**Custom layouts:**

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <aside>Admin sidebar</aside>
    <main>
      <slot />
    </main>
  </div>
</template>
```

```vue
<!-- pages/admin/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});
</script>
```

## Server Routes and API

Nuxt 3 includes a full-featured server built on Nitro.

### API Routes

Create API endpoints in `server/api/`:

```typescript
// server/api/posts/index.get.ts
export default defineEventHandler(async event => {
  const posts = await getPosts();

  return {
    posts,
  };
});
```

**HTTP method conventions:**

```
server/api/
├── posts/
│   ├── index.get.ts      # GET /api/posts
│   ├── index.post.ts     # POST /api/posts
│   ├── [id].get.ts       # GET /api/posts/:id
│   ├── [id].put.ts       # PUT /api/posts/:id
│   └── [id].delete.ts    # DELETE /api/posts/:id
```

### Event Handler Utilities

```typescript
// server/api/posts/index.post.ts
export default defineEventHandler(async event => {
  // Read request body
  const body = await readBody(event);

  // Get query parameters
  const query = getQuery(event);

  // Get route parameters
  const { id } = getRouterParams(event);

  // Get headers
  const token = getHeader(event, 'authorization');

  // Set response status
  setResponseStatus(event, 201);

  // Set response headers
  setResponseHeader(event, 'x-custom-header', 'value');

  // Throw errors
  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    });
  }

  return {
    success: true,
  };
});
```

### Server Middleware

```typescript
// server/middleware/auth.ts
export default defineEventHandler(event => {
  const token = getHeader(event, 'authorization');

  if (!token && event.path.startsWith('/api/protected')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
});
```

### Server Routes

Non-API routes in `server/routes/`:

```typescript
// server/routes/rss.xml.ts
export default defineEventHandler(event => {
  const posts = await getPosts();

  const rss = generateRSS(posts);

  setResponseHeader(event, 'content-type', 'application/xml');

  return rss;
});
```

### Database Access

```typescript
// server/api/posts/[id].get.ts
import { db } from '~/server/database';

export default defineEventHandler(async event => {
  const { id } = getRouterParams(event);

  const post = await db.posts.findUnique({
    where: { id },
  });

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    });
  }

  return post;
});
```

## State Management

Nuxt 3 provides `useState` for reactive shared state.

### useState

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>('user', () => null);

  const login = async (email: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    user.value = response.user;
  };

  const logout = () => {
    user.value = null;
  };

  return {
    user: readonly(user),
    login,
    logout,
  };
};
```

**Use in components:**

```vue
<script setup lang="ts">
const { user, login, logout } = useAuth();
</script>

<template>
  <div>
    <p v-if="user">Welcome, {{ user.name }}</p>
    <button v-else @click="login('user@example.com', 'password')">Login</button>
  </div>
</template>
```

### Pinia (Recommended for Complex State)

```bash
npm install pinia @pinia/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
});
```

```typescript
// stores/auth.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: state => !!state.user,
  },

  actions: {
    async login(email: string, password: string) {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      this.user = response.user;
      this.token = response.token;
    },

    logout() {
      this.user = null;
      this.token = null;
    },
  },
});
```

**Use in components:**

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div>
    <p v-if="authStore.isAuthenticated">Welcome, {{ authStore.user.name }}</p>
  </div>
</template>
```

## Composables

Nuxt auto-imports composables from `composables/` directory.

### Creating Composables

```typescript
// composables/usePosts.ts
export const usePosts = () => {
  const posts = useState<Post[]>('posts', () => []);

  const fetchPosts = async () => {
    const { data } = await useFetch('/api/posts');
    posts.value = data.value;
  };

  const addPost = async (post: CreatePostDto) => {
    const newPost = await $fetch('/api/posts', {
      method: 'POST',
      body: post,
    });

    posts.value.push(newPost);
  };

  return {
    posts: readonly(posts),
    fetchPosts,
    addPost,
  };
};
```

### Built-in Composables

```typescript
// Navigation
const router = useRouter();
const route = useRoute();

// Fetching
const { data } = await useFetch('/api/data');
const { data } = await useAsyncData('key', fetchFn);

// State
const counter = useState('counter', () => 0);

// Head/SEO
useHead({
  title: 'Page Title',
  meta: [{ name: 'description', content: 'Page description' }],
});

// Runtime config
const config = useRuntimeConfig();

// Cookies
const token = useCookie('token');

// Error handling
const error = useError();
const { showError, clearError } = useError();
```

## Nitro Server Engine

Nitro is Nuxt's server engine with universal deployment support.

### Server API

```typescript
// server/api/hello.ts
export default defineEventHandler(event => {
  return {
    api: 'works!',
  };
});
```

### Cached Handlers

```typescript
// server/api/posts.get.ts
export default defineCachedEventHandler(
  async event => {
    const posts = await db.posts.findMany();
    return posts;
  },
  {
    maxAge: 60 * 10, // Cache for 10 minutes
    getKey: event => `posts-list`,
  }
);
```

### Server Utils

```typescript
// server/utils/database.ts
export const db = {
  async getPosts() {
    // Database query
    return [];
  },
};
```

**Use in API routes:**

```typescript
// server/api/posts/index.get.ts
export default defineEventHandler(async () => {
  const posts = await db.getPosts();
  return posts;
});
```

### Server Plugins

```typescript
// server/plugins/database.ts
export default defineNitroPlugin(nitroApp => {
  console.log('Nitro plugin initialization');

  // Initialize database connection
  nitroApp.hooks.hook('request', event => {
    console.log('Request received:', event.path);
  });
});
```

## Modules and Plugins

### Nuxt Modules

Install and configure modules:

```bash
npm install @nuxtjs/tailwindcss
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
});
```

**Popular modules:**

- `@nuxtjs/tailwindcss` - Tailwind CSS
- `@pinia/nuxt` - State management
- `@nuxt/image` - Image optimization
- `@nuxtjs/i18n` - Internationalization
- `nuxt-icon` - Icon components

### Plugins

```typescript
// plugins/api.ts
export default defineNuxtPlugin(nuxtApp => {
  const api = {
    getPosts: () => $fetch('/api/posts'),
    getPost: (id: string) => $fetch(`/api/posts/${id}`),
  };

  return {
    provide: {
      api,
    },
  };
});
```

**Use in components:**

```vue
<script setup lang="ts">
const { $api } = useNuxtApp();

const posts = await $api.getPosts();
</script>
```

## Performance Optimization

### Hybrid Rendering

Configure per-route rendering:

```vue
<script setup lang="ts">
definePageMeta({
  // Static generation
  prerender: true,
});
</script>
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Static pages
    '/': { prerender: true },
    '/about': { prerender: true },

    // ISR (revalidate every hour)
    '/blog/**': { swr: 3600 },

    // SPA (client-side only)
    '/admin/**': { ssr: false },

    // Cached for 1 hour
    '/api/**': { cache: { maxAge: 3600 } },
  },
});
```

### Lazy Loading Components

```vue
<script setup lang="ts">
// Lazy load component
const LazyComponent = defineAsyncComponent(() => import('~/components/HeavyComponent.vue'));
</script>

<template>
  <div>
    <LazyComponent />
  </div>
</template>
```

**Or use `Lazy` prefix:**

```vue
<template>
  <div>
    <!-- Auto-lazy loaded -->
    <LazyHeavyComponent />
  </div>
</template>
```

### Payload Extraction

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true,
  },
});
```

### Image Optimization

```bash
npm install @nuxt/image
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
});
```

```vue
<template>
  <NuxtImg src="/hero.jpg" width="1200" height="600" format="webp" quality="80" />
</template>
```

This comprehensive guide covers Nuxt 3 patterns for building modern Vue applications with SSR/SSG capabilities. Consult the Nuxt documentation for advanced features and latest updates.
