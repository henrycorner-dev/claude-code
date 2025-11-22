# Remix Patterns and Best Practices

Comprehensive guide to building web applications with Remix, covering loaders, actions, nested routing, and progressive enhancement.

## Table of Contents

- [Remix Overview](#remix-overview)
- [Routing](#routing)
- [Loaders and Actions](#loaders-and-actions)
- [Forms and Mutations](#forms-and-mutations)
- [Error Handling](#error-handling)
- [Optimistic UI](#optimistic-ui)
- [Resource Routes](#resource-routes)
- [Performance Optimization](#performance-optimization)

## Remix Overview

Remix is a full-stack web framework built on Web Fetch API and focused on web standards, progressive enhancement, and excellent user experience.

### Key Features

- **Web Standards** - Built on Web Fetch API, FormData, Response
- **Nested Routing** - Layout nesting with data loading
- **Progressive Enhancement** - Works without JavaScript
- **Optimistic UI** - Instant feedback before server response
- **Error Boundaries** - Granular error handling per route
- **Server-First** - Server-side rendering by default

### Project Structure

```
my-app/
├── app/
│   ├── routes/              # File-based routing
│   │   ├── _index.tsx       # /
│   │   ├── about.tsx        # /about
│   │   ├── posts/
│   │   │   ├── _index.tsx   # /posts
│   │   │   └── $slug.tsx    # /posts/:slug
│   │   └── api/
│   │       └── posts.ts     # /api/posts
│   ├── root.tsx             # Root layout
│   └── entry.server.tsx     # Server entry
├── public/                  # Static assets
└── remix.config.js          # Remix configuration
```

## Routing

Remix uses file-based routing with special naming conventions.

### Basic Routes

```
app/routes/
├── _index.tsx          # /
├── about.tsx           # /about
└── blog/
    └── _index.tsx      # /blog
```

### Dynamic Routes

```typescript
// app/routes/posts.$slug.tsx
import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getPost(params.slug!)

  if (!post) {
    throw new Response('Not Found', { status: 404 })
  }

  return { post }
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

### Nested Routes

```
app/routes/
├── blog.tsx                # Layout for /blog/*
├── blog._index.tsx         # /blog
└── blog.$slug.tsx          # /blog/:slug
```

```typescript
// app/routes/blog.tsx (Layout)
import { Outlet } from '@remix-run/react'

export default function BlogLayout() {
  return (
    <div>
      <nav>
        <a href="/blog">Blog Home</a>
      </nav>
      <main>
        <Outlet />  {/* Nested routes render here */}
      </main>
    </div>
  )
}
```

### Pathless Layout Routes

```
app/routes/
├── __auth/
│   ├── login.tsx           # /login (uses __auth layout)
│   └── register.tsx        # /register (uses __auth layout)
└── __auth.tsx              # Layout (doesn't add to URL)
```

```typescript
// app/routes/__auth.tsx
import { Outlet } from '@remix-run/react'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <header>Auth Header</header>
      <Outlet />
    </div>
  )
}
```

### Splat Routes

```typescript
// app/routes/files.$.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const filePath = params['*']; // Captures everything after /files/

  return { filePath };
}
```

## Loaders and Actions

Loaders fetch data before rendering. Actions handle mutations (POST, PUT, DELETE).

### Loaders

```typescript
// app/routes/posts._index.tsx
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const page = url.searchParams.get('page') || '1'

  const posts = await getPosts({ page: parseInt(page) })

  return json({ posts })
}

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>()

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

### Actions

```typescript
// app/routes/posts.new.tsx
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')

  if (!title || !content) {
    return json({ error: 'Title and content are required' }, { status: 400 })
  }

  const post = await createPost({ title, content })

  return redirect(`/posts/${post.slug}`)
}

export default function NewPost() {
  const actionData = useActionData<typeof action>()

  return (
    <Form method="post">
      {actionData?.error && <p className="error">{actionData.error}</p>}

      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </Form>
  )
}
```

### Parallel Data Loading

```typescript
// app/routes/dashboard.tsx
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader() {
  // Parallel data fetching
  const [user, stats, activities] = await Promise.all([
    getUser(),
    getStats(),
    getActivities()
  ])

  return json({ user, stats, activities })
}

export default function Dashboard() {
  const { user, stats, activities } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <Stats data={stats} />
      <Activities data={activities} />
    </div>
  )
}
```

### Accessing Parent Data

```typescript
// app/routes/blog.$slug.tsx
import { useMatches } from '@remix-run/react'

export default function Post() {
  const matches = useMatches()

  // Access data from parent routes
  const blogLayoutData = matches.find(m => m.id === 'routes/blog')?.data

  return <div>{/* Use parent data */}</div>
}
```

## Forms and Mutations

Remix provides progressive enhancement for forms using Web Platform FormData.

### Basic Form

```typescript
// app/routes/contact.tsx
import { ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const message = formData.get('message')

  await sendContactEmail({ email, message })

  return json({ success: true })
}

export default function Contact() {
  const actionData = useActionData<typeof action>()

  return (
    <div>
      {actionData?.success && <p>Message sent!</p>}

      <Form method="post">
        <input name="email" type="email" required />
        <textarea name="message" required />
        <button type="submit">Send</button>
      </Form>
    </div>
  )
}
```

### Multiple Actions

```typescript
// app/routes/posts.$id.tsx
import { ActionFunctionArgs, json } from '@remix-run/node'
import { Form } from '@remix-run/react'

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  switch (intent) {
    case 'update':
      await updatePost(params.id!, {
        title: formData.get('title'),
        content: formData.get('content')
      })
      return json({ success: true })

    case 'delete':
      await deletePost(params.id!)
      return redirect('/posts')

    default:
      return json({ error: 'Invalid intent' }, { status: 400 })
  }
}

export default function EditPost() {
  return (
    <div>
      {/* Update form */}
      <Form method="post">
        <input name="intent" value="update" type="hidden" />
        <input name="title" />
        <textarea name="content" />
        <button type="submit">Update</button>
      </Form>

      {/* Delete form */}
      <Form method="post">
        <input name="intent" value="delete" type="hidden" />
        <button type="submit">Delete</button>
      </Form>
    </div>
  )
}
```

### Form Validation

```typescript
// app/routes/signup.tsx
import { ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

interface ActionData {
  errors?: {
    email?: string
    password?: string
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  const errors: ActionData['errors'] = {}

  if (!email || !email.includes('@')) {
    errors.email = 'Valid email is required'
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 })
  }

  await createUser({ email, password })

  return redirect('/dashboard')
}

export default function Signup() {
  const actionData = useActionData<ActionData>()

  return (
    <Form method="post">
      <div>
        <input name="email" type="email" />
        {actionData?.errors?.email && (
          <span className="error">{actionData.errors.email}</span>
        )}
      </div>

      <div>
        <input name="password" type="password" />
        {actionData?.errors?.password && (
          <span className="error">{actionData.errors.password}</span>
        )}
      </div>

      <button type="submit">Sign Up</button>
    </Form>
  )
}
```

### Loading States

```typescript
import { Form, useNavigation } from '@remix-run/react'

export default function NewPost() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Form method="post">
      <input name="title" disabled={isSubmitting} />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </Form>
  )
}
```

## Error Handling

### Error Boundaries

```typescript
// app/routes/posts.$slug.tsx
import { ErrorResponse, useRouteError } from '@remix-run/react'

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getPost(params.slug!)

  if (!post) {
    throw new Response('Post not found', { status: 404 })
  }

  return json({ post })
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (error instanceof Response) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>The post you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Unexpected Error</h1>
      <p>Something went wrong.</p>
    </div>
  )
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()

  return <article>{post.title}</article>
}
```

### Root Error Boundary

```typescript
// app/root.tsx
import { Links, Meta, Outlet, Scripts, useRouteError } from '@remix-run/react'

export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Application Error</h1>
        <p>Sorry, something went wrong.</p>
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

## Optimistic UI

Provide instant feedback before server response.

### Optimistic Form Submission

```typescript
// app/routes/todos._index.tsx
import { ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'

export async function loader() {
  const todos = await getTodos()
  return json({ todos })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'create') {
    const title = formData.get('title')
    const todo = await createTodo({ title })
    return json({ todo })
  }

  if (intent === 'toggle') {
    const id = formData.get('id')
    const completed = formData.get('completed') === 'true'
    await toggleTodo(id, !completed)
  }

  return json({ success: true })
}

export default function Todos() {
  const { todos } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  // Optimistic todos = actual + pending submissions
  const optimisticTodos = fetcher.formData
    ? [
        ...todos,
        {
          id: 'temp',
          title: fetcher.formData.get('title'),
          completed: false
        }
      ]
    : todos

  return (
    <div>
      {optimisticTodos.map(todo => (
        <div key={todo.id}>
          <fetcher.Form method="post">
            <input name="intent" value="toggle" type="hidden" />
            <input name="id" value={todo.id} type="hidden" />
            <input name="completed" value={String(todo.completed)} type="hidden" />
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
            />
            <span>{todo.title}</span>
          </fetcher.Form>
        </div>
      ))}

      <fetcher.Form method="post">
        <input name="intent" value="create" type="hidden" />
        <input name="title" required />
        <button type="submit">Add Todo</button>
      </fetcher.Form>
    </div>
  )
}
```

## Resource Routes

Resource routes return data (JSON, XML, PDF) instead of HTML.

### JSON API

```typescript
// app/routes/api.posts.ts
import { LoaderFunctionArgs, json } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const posts = await getPosts();

  return json({ posts });
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();

  const post = await createPost(data);

  return json({ post }, { status: 201 });
}
```

### File Downloads

```typescript
// app/routes/reports.$id.pdf.ts
import { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ params }: LoaderFunctionArgs) {
  const report = await generateReport(params.id!);

  return new Response(report.pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${params.id}.pdf"`,
    },
  });
}
```

### RSS Feed

```typescript
// app/routes/blog.rss.ts
export async function loader() {
  const posts = await getPosts();

  const rss = `<?xml version="1.0"?>
    <rss version="2.0">
      <channel>
        <title>My Blog</title>
        ${posts
          .map(
            post => `
          <item>
            <title>${post.title}</title>
            <link>https://example.com/blog/${post.slug}</link>
          </item>
        `
          )
          .join('')}
      </channel>
    </rss>
  `;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

## Performance Optimization

### Prefetching

```typescript
import { Link } from '@remix-run/react'

export default function Posts() {
  return (
    <div>
      {/* Prefetch on hover */}
      <Link to="/posts/my-post" prefetch="intent">
        My Post
      </Link>

      {/* Prefetch on render */}
      <Link to="/important" prefetch="render">
        Important Page
      </Link>
    </div>
  )
}
```

### Deferred Data

```typescript
// app/routes/dashboard.tsx
import { defer } from '@remix-run/node'
import { Await, useLoaderData } from '@remix-run/react'
import { Suspense } from 'react'

export async function loader() {
  return defer({
    user: await getUser(),           // Wait for critical data
    stats: getStats(),                // Don't wait, stream later
    activities: getActivities()       // Don't wait, stream later
  })
}

export default function Dashboard() {
  const { user, stats, activities } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <Suspense fallback={<div>Loading stats...</div>}>
        <Await resolve={stats}>
          {(statsData) => <Stats data={statsData} />}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading activities...</div>}>
        <Await resolve={activities}>
          {(activitiesData) => <Activities data={activitiesData} />}
        </Await>
      </Suspense>
    </div>
  )
}
```

### Caching Headers

```typescript
export async function loader() {
  const posts = await getPosts();

  return json(
    { posts },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    }
  );
}
```

This comprehensive guide covers Remix patterns for building modern, progressively enhanced web applications with excellent user and developer experience.
