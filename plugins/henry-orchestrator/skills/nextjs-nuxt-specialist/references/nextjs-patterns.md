# Next.js Patterns and Best Practices

Comprehensive guide to building applications with Next.js, covering both App Router (React Server Components) and Pages Router patterns.

## Table of Contents

- [App Router vs Pages Router](#app-router-vs-pages-router)
- [Data Fetching](#data-fetching)
- [Routing](#routing)
- [Server Components and Client Components](#server-components-and-client-components)
- [Middleware and Edge Functions](#middleware-and-edge-functions)
- [Performance Optimization](#performance-optimization)
- [Common Patterns](#common-patterns)

## App Router vs Pages Router

Next.js supports two routing systems: the newer App Router (Next.js 13+) and the legacy Pages Router. Both are fully supported and can coexist in the same project.

### When to Use App Router

**Use App Router when:**
- Starting new projects (recommended by Next.js team)
- Want to use React Server Components
- Need streaming and Suspense
- Want better code organization with colocation
- Need layouts and nested routing

**Key Features:**
- React Server Components by default
- Streaming with Suspense
- Nested layouts and templates
- Server Actions for mutations
- Improved data fetching patterns

### When to Use Pages Router

**Use Pages Router when:**
- Maintaining existing applications
- Team unfamiliar with Server Components
- Need `getServerSideProps`/`getStaticProps` patterns
- Using libraries incompatible with Server Components

**Key Features:**
- Battle-tested and stable
- Familiar data fetching methods
- Wide ecosystem compatibility
- Well-documented patterns

### Migration Strategy

Incremental migration is possible using both routers simultaneously:

```
app/
  dashboard/
    page.tsx        # App Router: /dashboard
pages/
  about.tsx         # Pages Router: /about
  api/
    users.ts        # Pages Router API: /api/users
```

**Migration Priority:**
1. New features → App Router
2. API routes → Can stay in Pages Router or migrate to Route Handlers
3. Static pages → Migrate when convenient
4. Dynamic pages → Migrate last (most complex)

## Data Fetching

### App Router Data Fetching

App Router uses native `fetch` API with automatic request deduplication and caching.

#### Server Component Data Fetching

Server Components can fetch data directly using async/await:

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache' // SSG behavior
  })

  if (!res.ok) throw new Error('Failed to fetch posts')

  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

#### Fetch Caching Options

Control caching behavior with `cache` and `next.revalidate` options:

```typescript
// Static Site Generation (cached indefinitely)
fetch('https://api.example.com/posts', { cache: 'force-cache' })

// Server-Side Rendering (no caching)
fetch('https://api.example.com/posts', { cache: 'no-store' })

// Incremental Static Regeneration (revalidate every 60 seconds)
fetch('https://api.example.com/posts', {
  next: { revalidate: 60 }
})

// Tag-based revalidation
fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
```

#### Parallel Data Fetching

Fetch multiple data sources in parallel for better performance:

```typescript
// app/dashboard/page.tsx
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
}

async function getPosts(userId: string) {
  const res = await fetch(`https://api.example.com/posts?userId=${userId}`)
  return res.json()
}

export default async function DashboardPage({
  params
}: {
  params: { id: string }
}) {
  // Parallel fetching - both requests start simultaneously
  const [user, posts] = await Promise.all([
    getUser(params.id),
    getPosts(params.id)
  ])

  return (
    <div>
      <h1>{user.name}'s Dashboard</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

#### Sequential Data Fetching

When one request depends on another:

```typescript
// app/post/[id]/page.tsx
async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`)
  return res.json()
}

async function getComments(postId: string) {
  const res = await fetch(`https://api.example.com/comments?postId=${postId}`)
  return res.json()
}

export default async function PostPage({
  params
}: {
  params: { id: string }
}) {
  // Sequential: getComments waits for getPost
  const post = await getPost(params.id)
  const comments = await getComments(post.id)

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      <Comments comments={comments} />
    </article>
  )
}
```

#### Streaming with Suspense

Stream data progressively to improve perceived performance:

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

async function UserInfo({ id }: { id: string }) {
  const user = await fetch(`https://api.example.com/users/${id}`).then(r => r.json())
  return <div>{user.name}</div>
}

async function RecentPosts({ userId }: { userId: string }) {
  // Slow query - will stream in later
  await new Promise(resolve => setTimeout(resolve, 3000))
  const posts = await fetch(`https://api.example.com/posts?userId=${userId}`).then(r => r.json())
  return <PostList posts={posts} />
}

export default function DashboardPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo id={params.id} />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts userId={params.id} />
      </Suspense>
    </div>
  )
}
```

#### Server Actions

Server Actions enable mutations without API routes:

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')

  const res = await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })

  if (!res.ok) {
    throw new Error('Failed to create post')
  }

  revalidatePath('/posts')
  return res.json()
}
```

```typescript
// app/posts/new/page.tsx
import { createPost } from '@/app/actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

### Pages Router Data Fetching

Pages Router uses Next.js-specific data fetching methods.

#### getServerSideProps (SSR)

Fetch data on every request:

```typescript
// pages/posts/[id].tsx
import type { GetServerSideProps } from 'next'

interface Post {
  id: string
  title: string
  content: string
}

interface Props {
  post: Post
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params!

  const res = await fetch(`https://api.example.com/posts/${id}`)

  if (!res.ok) {
    return {
      notFound: true
    }
  }

  const post = await res.json()

  return {
    props: {
      post
    }
  }
}

export default function PostPage({ post }: Props) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

#### getStaticProps (SSG)

Generate static pages at build time:

```typescript
// pages/posts/index.tsx
import type { GetStaticProps } from 'next'

interface Props {
  posts: Post[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return {
    props: {
      posts
    },
    revalidate: 60 // ISR: revalidate every 60 seconds
  }
}

export default function PostsPage({ posts }: Props) {
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  )
}
```

#### getStaticPaths

Generate dynamic routes at build time:

```typescript
// pages/posts/[id].tsx
import type { GetStaticPaths, GetStaticProps } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  const paths = posts.map((post: Post) => ({
    params: { id: post.id }
  }))

  return {
    paths,
    fallback: 'blocking' // or false, or true
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!
  const res = await fetch(`https://api.example.com/posts/${id}`)
  const post = await res.json()

  return {
    props: { post },
    revalidate: 60
  }
}

export default function PostPage({ post }: { post: Post }) {
  return <article>{post.title}</article>
}
```

## Routing

### App Router Routing

App Router uses file-system based routing with special file conventions.

#### Route Structure

```
app/
  page.tsx                  # /
  dashboard/
    page.tsx                # /dashboard
    settings/
      page.tsx              # /dashboard/settings
  blog/
    [slug]/
      page.tsx              # /blog/:slug
    [...slug]/
      page.tsx              # /blog/* (catch-all)
    [[...slug]]/
      page.tsx              # /blog/* (optional catch-all)
```

#### Dynamic Routes

```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({
  params
}: {
  params: { slug: string }
}) {
  return <h1>Post: {params.slug}</h1>
}

// app/shop/[category]/[product]/page.tsx
export default function Product({
  params
}: {
  params: { category: string; product: string }
}) {
  return (
    <div>
      <p>Category: {params.category}</p>
      <p>Product: {params.product}</p>
    </div>
  )
}
```

#### Route Groups

Organize routes without affecting URL structure:

```
app/
  (marketing)/
    about/
      page.tsx              # /about
    contact/
      page.tsx              # /contact
  (shop)/
    products/
      page.tsx              # /products
    cart/
      page.tsx              # /cart
```

#### Parallel Routes

Render multiple pages in the same layout simultaneously:

```
app/
  @team/
    page.tsx
  @analytics/
    page.tsx
  layout.tsx
  page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2">
        <div>{team}</div>
        <div>{analytics}</div>
      </div>
    </div>
  )
}
```

#### Intercepting Routes

Intercept routes to show modals or overlays:

```
app/
  photos/
    [id]/
      page.tsx              # /photos/123
    (..)photos/
      [id]/
        page.tsx            # Intercepts /photos/123 when navigating from same level
```

```typescript
// app/photos/(..)photos/[id]/page.tsx
import Modal from '@/components/Modal'

export default function PhotoModal({
  params
}: {
  params: { id: string }
}) {
  return (
    <Modal>
      <img src={`/photos/${params.id}.jpg`} alt="Photo" />
    </Modal>
  )
}
```

#### Layouts

Layouts wrap pages and persist across route changes:

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </div>
  )
}
```

**Layout Nesting:**

```
app/
  layout.tsx                # Root layout (required)
  dashboard/
    layout.tsx              # Dashboard layout
    settings/
      layout.tsx            # Settings layout (nested)
      page.tsx
```

Layouts nest automatically - Settings page renders with all three layouts.

#### Templates

Templates create new instances on navigation (unlike layouts which persist):

```typescript
// app/template.tsx
export default function Template({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* This div re-mounts on every navigation */}
      {children}
    </div>
  )
}
```

**Use templates when:**
- Need to re-trigger animations on navigation
- Need to reset state on route change
- Need to track page views in analytics

### Pages Router Routing

Pages Router uses simpler file-based routing:

```
pages/
  index.tsx                 # /
  about.tsx                 # /about
  blog/
    index.tsx               # /blog
    [slug].tsx              # /blog/:slug
  shop/
    [...slug].tsx           # /shop/* (catch-all)
    [[...slug]].tsx         # /shop/* (optional catch-all)
```

## Server Components and Client Components

### Server Components (Default)

Server Components render on the server only. They can:

- Fetch data directly
- Access backend resources
- Keep sensitive data on server
- Reduce client bundle size
- Cannot use browser APIs or React hooks (useState, useEffect)

```typescript
// app/posts/page.tsx (Server Component by default)
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

### Client Components

Client Components render on both server (initial render) and client (interactivity). Mark with `'use client'` directive:

```typescript
// components/Counter.tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### Composition Patterns

#### Server Component with Client Component Children

```typescript
// app/dashboard/page.tsx (Server Component)
import ClientButton from '@/components/ClientButton'

async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Dashboard() {
  const data = await getData()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Data: {data.value}</p>
      <ClientButton />
    </div>
  )
}
```

#### Passing Server Components to Client Components

Cannot pass Server Components as props directly, but can pass as children:

```typescript
// components/ClientWrapper.tsx
'use client'

export default function ClientWrapper({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="wrapper">
      {children}
    </div>
  )
}
```

```typescript
// app/page.tsx (Server Component)
import ClientWrapper from '@/components/ClientWrapper'
import ServerComponent from '@/components/ServerComponent'

export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent />
    </ClientWrapper>
  )
}
```

#### Sharing Data Between Server Components

Use props to pass data down:

```typescript
// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()

  return (
    <div>
      <Header data={data} />
      <Main data={data} />
    </div>
  )
}
```

### When to Use Each

**Use Server Components for:**
- Data fetching
- Backend resource access
- Keeping sensitive data on server
- Reducing client bundle size
- Static content

**Use Client Components for:**
- Interactivity (onClick, onChange)
- React hooks (useState, useEffect, useReducer)
- Browser APIs (localStorage, geolocation)
- Custom hooks
- Class components

## Middleware and Edge Functions

### Middleware

Middleware runs before requests are completed, enabling authentication, redirects, and header manipulation.

```typescript
// middleware.ts (root of project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add custom header
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
}
```

#### Middleware Use Cases

**Authentication:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token (simplified)
  if (!isValidToken(token.value)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

**Geolocation Redirects:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US'

  // Redirect EU users to EU-specific site
  if (country === 'DE' || country === 'FR') {
    return NextResponse.redirect(new URL('/eu', request.url))
  }

  return NextResponse.next()
}
```

**A/B Testing:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user already has variant
  const variant = request.cookies.get('ab-test-variant')

  if (variant) {
    return NextResponse.next()
  }

  // Assign random variant
  const newVariant = Math.random() < 0.5 ? 'A' : 'B'
  const response = NextResponse.next()
  response.cookies.set('ab-test-variant', newVariant)

  return response
}
```

### Route Handlers (API Routes)

App Router uses Route Handlers instead of API Routes:

```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const body = await request.json()

  const res = await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const post = await res.json()

  return NextResponse.json(post, { status: 201 })
}
```

**Dynamic Route Handlers:**

```typescript
// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`).then(r => r.json())

  return NextResponse.json(post)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await fetch(`https://api.example.com/posts/${params.id}`, {
    method: 'DELETE'
  })

  return NextResponse.json({ message: 'Deleted' })
}
```

### Edge Runtime

Use Edge Runtime for lower latency:

```typescript
// app/api/hello/route.ts
export const runtime = 'edge'

export async function GET(request: Request) {
  return new Response('Hello from Edge!')
}
```

**Edge Runtime Limitations:**
- No Node.js APIs (fs, path, crypto)
- Smaller bundle size limits
- Limited npm packages
- No native modules

## Performance Optimization

### Image Optimization

Use Next.js Image component for automatic optimization:

```typescript
import Image from 'next/image'

export default function Gallery() {
  return (
    <div>
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority // Load eagerly for above-fold images
      />

      <Image
        src="/product.jpg"
        alt="Product"
        width={400}
        height={300}
        loading="lazy" // Default: lazy load below-fold images
        placeholder="blur"
        blurDataURL="/product-blur.jpg"
      />
    </div>
  )
}
```

### Font Optimization

Use `next/font` for automatic font optimization:

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Code Splitting

Dynamic imports for code splitting:

```typescript
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // Disable SSR for this component
})

export default function Page() {
  return (
    <div>
      <DynamicComponent />
    </div>
  )
}
```

### Bundle Analysis

```bash
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})

# Run analysis
ANALYZE=true npm run build
```

## Common Patterns

### Error Handling

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Loading States

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}
```

### Not Found Pages

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  )
}
```

### Metadata

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(r => r.json())

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image]
    }
  }
}
```

This comprehensive guide covers the most important Next.js patterns for building modern web applications. Consult the Next.js documentation for advanced use cases and updates.
