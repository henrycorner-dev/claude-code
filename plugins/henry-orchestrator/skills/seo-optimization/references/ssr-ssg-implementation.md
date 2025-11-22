# SSR and SSG Implementation Guide

This reference provides comprehensive guidance for implementing Server-Side Rendering (SSR) and Static Site Generation (SSG) for optimal SEO performance across different frameworks.

## Understanding Rendering Strategies

### Client-Side Rendering (CSR)

Content is rendered in the browser using JavaScript.

**Pros:**

- Rich interactivity
- Reduced server load
- Fast subsequent navigation

**Cons:**

- Poor SEO without additional setup
- Slower initial page load
- Content not in HTML source
- Requires JavaScript enabled

**SEO impact:** Poor by default. Search engines may not execute JavaScript or wait for content to load.

### Server-Side Rendering (SSR)

Content is rendered on the server for each request.

**Pros:**

- Excellent SEO (content in HTML source)
- Fast first contentful paint
- Works without JavaScript
- Dynamic content support

**Cons:**

- Higher server load
- Slower time to interactive
- More complex infrastructure
- Higher hosting costs

**SEO impact:** Excellent. Content is immediately available to search engines.

### Static Site Generation (SSG)

Content is pre-rendered at build time as static HTML files.

**Pros:**

- Best performance (served from CDN)
- Excellent SEO
- Lowest hosting costs
- High scalability

**Cons:**

- Requires rebuild for content changes
- Not suitable for highly dynamic content
- Build time increases with page count
- May need ISR for frequent updates

**SEO impact:** Excellent. Content is immediately available and loads very fast.

### Incremental Static Regeneration (ISR)

Hybrid approach that combines SSG benefits with periodic revalidation.

**Pros:**

- Static performance benefits
- Content updates without full rebuild
- Stale-while-revalidate strategy
- Best of both worlds

**Cons:**

- Complexity in cache management
- Not all platforms support it
- First user after expiry sees stale content

**SEO impact:** Excellent. Provides fresh content with static performance.

## Choosing the Right Strategy

### Decision Matrix

| Content Type             | Recommended Strategy | Reason                              |
| ------------------------ | -------------------- | ----------------------------------- |
| Marketing pages          | SSG                  | Rarely changes, needs speed         |
| Blog posts               | SSG or SSG+ISR       | Mostly static, occasional updates   |
| Documentation            | SSG                  | Static content, version controlled  |
| Product catalog          | SSG+ISR or SSR       | Prices/inventory change frequently  |
| User dashboards          | CSR with SSR shell   | Personalized, requires auth         |
| Search results           | SSR                  | Dynamic, needs SEO                  |
| Real-time feeds          | CSR with SSR shell   | Highly dynamic                      |
| E-commerce product pages | SSG+ISR              | Mostly static with periodic updates |

### Hybrid Approaches

Combine strategies for optimal results:

1. **SSG shell + CSR content** - Pre-render layout, load dynamic content client-side
2. **SSG + ISR** - Static generation with periodic revalidation
3. **SSR critical pages + SSG others** - SSR for search results, SSG for product pages
4. **Edge SSR** - Render at edge locations for lower latency

## Next.js Implementation

Next.js provides all rendering strategies with simple APIs.

### Static Site Generation (SSG)

```jsx
// pages/blog/[slug].js

// Generates static pages at build time
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);

  return {
    props: {
      post,
    },
    // Optional: revalidate every 60 seconds (ISR)
    revalidate: 60,
  };
}

// Defines which paths to pre-render
export async function getStaticPaths() {
  const posts = await fetchAllPosts();

  const paths = posts.map(post => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    // false = 404 for missing paths
    // true = generate on-demand
    // 'blocking' = SSR on-demand, then cache
    fallback: 'blocking',
  };
}

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title} | Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
```

### Server-Side Rendering (SSR)

```jsx
// pages/products/[id].js

// Runs on every request
export async function getServerSideProps({ params, req, res }) {
  // Access request/response for cookies, headers, etc.
  const userLocation = req.headers['x-user-location'];

  const product = await fetchProduct(params.id);
  const inventory = await fetchInventory(params.id, userLocation);

  // Optional: set cache headers
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

  return {
    props: {
      product,
      inventory,
    },
  };
}

export default function Product({ product, inventory }) {
  return (
    <>
      <Head>
        <title>{product.name} | Store</title>
        <meta name="description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Head>

      <div>
        <h1>{product.name}</h1>
        <p>{inventory.inStock ? 'In Stock' : 'Out of Stock'}</p>
      </div>
    </>
  );
}
```

### Incremental Static Regeneration (ISR)

```jsx
// pages/products/[id].js

export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);

  return {
    props: {
      product,
    },
    // Revalidate every 60 seconds
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  // Pre-render top 100 products
  const topProducts = await fetchTopProducts(100);

  const paths = topProducts.map(product => ({
    params: { id: product.id.toString() },
  }));

  return {
    paths,
    // Generate other pages on-demand
    fallback: 'blocking',
  };
}

export default function Product({ product }) {
  return (
    <>
      <Head>
        <title>{product.name} | Store</title>
        <meta name="description" content={product.description} />
      </Head>

      <div>
        <h1>{product.name}</h1>
        <p>${product.price}</p>
      </div>
    </>
  );
}
```

### Client-Side Data Fetching

```jsx
// pages/dashboard.js
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch client-side (not in HTML source)
    fetchUserData().then(setData);
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard</title>
        {/* Add noindex for personalized pages */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div>{data ? <UserDashboard data={data} /> : <Loading />}</div>
    </>
  );
}
```

### Next.js App Router (Next.js 13+)

```jsx
// app/blog/[slug]/page.js

// Static by default, can be made dynamic
export async function generateStaticParams() {
  const posts = await fetchAllPosts();

  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Metadata for SEO
export async function generateMetadata({ params }) {
  const post = await fetchPost(params.slug);

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

// Page component
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// Revalidation
export const revalidate = 60; // ISR: revalidate every 60 seconds
```

## Nuxt.js Implementation

Nuxt.js provides similar capabilities with Vue.js.

### Static Site Generation (SSG)

```vue
<!-- pages/blog/_slug.vue -->

<template>
  <article>
    <h1>{{ post.title }}</h1>
    <div v-html="post.content"></div>
  </article>
</template>

<script>
export default {
  async asyncData({ params, $content }) {
    const post = await $content('blog', params.slug).fetch();

    return {
      post,
    };
  },

  head() {
    return {
      title: `${this.post.title} | Blog`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.post.excerpt,
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.post.title,
        },
      ],
    };
  },
};
</script>
```

**nuxt.config.js for SSG:**

```js
export default {
  // SSG mode
  target: 'static',

  // Generate routes
  generate: {
    async routes() {
      const { $content } = require('@nuxt/content');
      const posts = await $content('blog').fetch();

      return posts.map(post => `/blog/${post.slug}`);
    },
  },
};
```

### Server-Side Rendering (SSR)

```vue
<!-- pages/products/_id.vue -->

<template>
  <div>
    <h1>{{ product.name }}</h1>
    <p>{{ inventory.inStock ? 'In Stock' : 'Out of Stock' }}</p>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios }) {
    const product = await $axios.$get(`/api/products/${params.id}`);
    const inventory = await $axios.$get(`/api/inventory/${params.id}`);

    return {
      product,
      inventory,
    };
  },

  head() {
    return {
      title: `${this.product.name} | Store`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.product.description,
        },
      ],
    };
  },
};
</script>
```

**nuxt.config.js for SSR:**

```js
export default {
  // SSR mode (default)
  ssr: true,
  target: 'server',
};
```

### Nuxt 3 Implementation

```vue
<!-- pages/blog/[slug].vue -->

<script setup>
const route = useRoute();
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`);

// SEO metadata
useHead({
  title: `${post.value.title} | Blog`,
  meta: [
    {
      name: 'description',
      content: post.value.excerpt,
    },
  ],
});
</script>

<template>
  <article>
    <h1>{{ post.title }}</h1>
    <div v-html="post.content"></div>
  </article>
</template>
```

## SvelteKit Implementation

SvelteKit provides flexible rendering with adapters.

### Static Site Generation

```js
// src/routes/blog/[slug]/+page.js

export const prerender = true;

export async function load({ params, fetch }) {
  const response = await fetch(`/api/posts/${params.slug}`);
  const post = await response.json();

  return {
    post,
  };
}
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->

<script>
  export let data;
  const { post } = data;
</script>

<svelte:head>
  <title>{post.title} | Blog</title>
  <meta name="description" content={post.excerpt} />
  <meta property="og:title" content={post.title} />
</svelte:head>

<article>
  <h1>{post.title}</h1>
  {@html post.content}
</article>
```

### Server-Side Rendering

```js
// src/routes/products/[id]/+page.server.js

export async function load({ params }) {
  const product = await fetchProduct(params.id);
  const inventory = await fetchInventory(params.id);

  return {
    product,
    inventory,
  };
}
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->

<script>
  export let data;
  const { product, inventory } = data;
</script>

<svelte:head>
  <title>{product.name} | Store</title>
  <meta name="description" content={product.description} />
</svelte:head>

<div>
  <h1>{product.name}</h1>
  <p>{inventory.inStock ? 'In Stock' : 'Out of Stock'}</p>
</div>
```

**svelte.config.js for SSG:**

```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
    }),
  },
};
```

## Gatsby Implementation

Gatsby is primarily an SSG framework with extensive plugin ecosystem.

### Static Site Generation

```jsx
// src/pages/blog/{mdx.slug}.js

import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

export default function BlogPost({ data }) {
  const { mdx } = data;

  return (
    <>
      <Seo title={mdx.frontmatter.title} description={mdx.frontmatter.excerpt} />

      <article>
        <h1>{mdx.frontmatter.title}</h1>
        <MDXRenderer>{mdx.body}</MDXRenderer>
      </article>
    </>
  );
}

export const query = graphql`
  query ($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        excerpt
        date
      }
      body
    }
  }
`;
```

### SEO Component

```jsx
// src/components/Seo.js

import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

export default function Seo({ title, description, image, pathname }) {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
    }
  `);

  const seo = {
    title: title || site.siteMetadata.title,
    description: description || site.siteMetadata.description,
    url: `${site.siteMetadata.siteUrl}${pathname || ''}`,
    image: image || `${site.siteMetadata.siteUrl}/default-og.jpg`,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />

      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
}
```

## Astro Implementation

Astro is an SSG framework optimized for content-focused sites.

```astro
---
// src/pages/blog/[slug].astro

export async function getStaticPaths() {
  const posts = await fetchAllPosts();

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{post.title} | Blog</title>
    <meta name="description" content={post.excerpt} />
    <link rel="canonical" href={`https://example.com/blog/${post.slug}`} />

    <meta property="og:title" content={post.title} />
    <meta property="og:description" content={post.excerpt} />
    <meta property="og:image" content={post.image} />
  </head>
  <body>
    <article>
      <h1>{post.title}</h1>
      <Fragment set:html={post.content} />
    </article>
  </body>
</html>
```

## Remix Implementation

Remix provides SSR with excellent data loading patterns.

```jsx
// app/routes/blog.$slug.jsx

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ params }) {
  const post = await fetchPost(params.slug);

  return json({
    post,
  });
}

export function meta({ data }) {
  return [
    { title: `${data.post.title} | Blog` },
    { name: 'description', content: data.post.excerpt },
    { property: 'og:title', content: data.post.title },
    { property: 'og:description', content: data.post.excerpt },
  ];
}

export default function BlogPost() {
  const { post } = useLoaderData();

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

## React (CSR) with Prerendering

For client-side React apps, implement prerendering for SEO.

### React Snap

```bash
npm install react-snap
```

```json
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "include": ["/", "/about", "/blog/post-1", "/blog/post-2"]
  }
}
```

### Prerender.io / Rendertron

Middleware that detects search engine crawlers and serves pre-rendered HTML.

```js
// server.js (Node.js)
const prerender = require('prerender-node');

app.use(prerender.set('prerenderToken', 'YOUR_TOKEN'));
```

## Performance Optimization

### Caching Strategies

```js
// Next.js API route with caching
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

  const data = fetchData();
  res.json(data);
}
```

### Edge Rendering

Deploy to edge locations for lower latency:

- **Vercel Edge Functions** - Next.js edge runtime
- **Cloudflare Workers** - Run at edge locations
- **Netlify Edge Functions** - Deno-based edge runtime

### Streaming SSR

Stream HTML as it's generated for faster TTFB:

```jsx
// Next.js 13 App Router (automatic streaming)
export default async function Page() {
  const data = await fetchData();

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <SlowComponent data={data} />
      </Suspense>
    </div>
  );
}
```

## Testing SSR/SSG for SEO

### View Source Test

Most important test - verify content appears in HTML source:

```bash
# Fetch page and check source
curl -s https://example.com/page | grep "expected content"
```

Content must appear in the initial HTML response, not loaded via JavaScript.

### Lighthouse Audit

```bash
# Run Lighthouse
lighthouse https://example.com --view
```

Check:

- SEO score
- Performance metrics
- Accessibility
- Best practices

### Google Search Console

Monitor:

- Index coverage
- Page experience
- Core Web Vitals
- Mobile usability

### Tools

1. **Fetch as Google** - See how Google renders your page
2. **Rich Results Test** - Validate structured data
3. **Mobile-Friendly Test** - Check mobile rendering
4. **PageSpeed Insights** - Performance metrics

## Common Issues and Solutions

### Issue: Content Not in Source

**Problem:** Content loaded client-side not visible to search engines.

**Solution:** Implement SSR or SSG for content pages.

### Issue: Slow Server Response

**Problem:** SSR adds server processing time.

**Solution:**

- Use edge rendering
- Implement caching
- Optimize database queries
- Consider SSG with ISR

### Issue: Build Time Too Long

**Problem:** SSG build time grows with page count.

**Solution:**

- Use incremental builds
- Pre-render only critical pages
- Use on-demand ISR for others

### Issue: Personalized Content

**Problem:** User-specific content can't be pre-rendered.

**Solution:**

- Use SSR shell with client-side content
- Add noindex meta tag
- Implement edge personalization

## Best Practices Summary

✅ **DO:**

- Use SSG for content that changes infrequently
- Implement ISR for content needing periodic updates
- Use SSR for highly dynamic or personalized content
- Verify content in HTML source with "View Source"
- Set appropriate cache headers
- Monitor Core Web Vitals
- Test with Lighthouse and Search Console

❌ **DON'T:**

- Serve SEO-critical content client-side only
- Rebuild entire site for minor content updates
- Ignore caching opportunities
- Over-complicate with unnecessary SSR
- Forget to test with actual search engine crawlers
- Mix strategies without clear reason
