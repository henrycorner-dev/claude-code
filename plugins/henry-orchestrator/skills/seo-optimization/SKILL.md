---
name: seo-optimization
description: This skill should be used when the user asks to "optimize SEO", "add meta tags", "implement structured data", "create sitemap", "add JSON-LD", "improve search rankings", "set up SSR for SEO", "configure SSG", "add Open Graph tags", "implement schema markup", or mentions SEO optimization, search engine visibility, or metadata management.
version: 0.1.0
---

# SEO Optimization

This skill provides comprehensive guidance for implementing search engine optimization (SEO) best practices in web applications, including meta tags, server-side rendering (SSR), static site generation (SSG), sitemaps, and structured data with JSON-LD.

## When to Use This Skill

Apply this skill when optimizing web applications for search engines, implementing metadata, configuring rendering strategies for better SEO performance, or adding structured data to enhance search result appearances.

## Core SEO Components

### Meta Tags

Meta tags provide essential information to search engines and social media platforms about page content.

**Essential meta tags to implement:**

1. **Title Tag** - Most important ranking factor (50-60 characters optimal)
2. **Meta Description** - Appears in search results (150-160 characters optimal)
3. **Canonical URL** - Prevents duplicate content issues
4. **Viewport** - Ensures mobile-friendliness
5. **Robots** - Controls search engine crawling and indexing

**Open Graph tags** for social media sharing:

- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`

**Twitter Card tags** for Twitter sharing:

- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

For detailed meta tag implementations and best practices, consult `references/meta-tags.md`.

### Server-Side Rendering (SSR) vs Static Site Generation (SSG)

Choose rendering strategy based on content characteristics:

**SSR (Server-Side Rendering):**

- Dynamic content that changes frequently
- Personalized user experiences
- Real-time data requirements
- E-commerce product pages with inventory

**SSG (Static Site Generation):**

- Content that changes infrequently
- Marketing pages, blogs, documentation
- Better performance and caching
- Lower hosting costs

**Hybrid Approach:**

- Combine SSG for static pages with ISR (Incremental Static Regeneration)
- Pre-render at build time, revalidate periodically

For framework-specific implementations (Next.js, Nuxt.js, SvelteKit, Astro), see `references/ssr-ssg-implementation.md`.

### Sitemaps

Sitemaps help search engines discover and crawl site content efficiently.

**Types of sitemaps:**

1. **XML Sitemap** - Primary sitemap for search engines
2. **HTML Sitemap** - User-facing navigation page
3. **Image Sitemap** - For image-heavy sites
4. **Video Sitemap** - For video content
5. **News Sitemap** - For news publishers

**Key sitemap requirements:**

- Maximum 50,000 URLs per sitemap
- Maximum 50MB uncompressed size
- Use sitemap index for larger sites
- Include lastmod, changefreq, priority tags appropriately
- Submit to Google Search Console and Bing Webmaster Tools

For sitemap generation code and validation, see `examples/sitemap-generator.js` and `references/sitemap-best-practices.md`.

### Structured Data (JSON-LD)

Structured data markup helps search engines understand page content and enables rich results in search.

**Common schema types:**

- **Article** - Blog posts, news articles
- **Product** - E-commerce items with pricing, availability
- **Organization** - Company information, logo, contact
- **Person** - Author profiles, team members
- **BreadcrumbList** - Navigation hierarchy
- **FAQPage** - Frequently asked questions
- **HowTo** - Step-by-step guides
- **Recipe** - Cooking recipes
- **Event** - Concerts, conferences, webinars
- **LocalBusiness** - Physical business locations

**Implementation approach:**

- Use JSON-LD format (recommended by Google)
- Place in `<script type="application/ld+json">` tag
- Validate with Google Rich Results Test
- Test with Schema.org validator

For complete schema implementations and examples, see `references/structured-data.md` and `examples/` directory.

## SEO Implementation Workflow

### Step 1: Audit Current SEO State

Analyze existing implementation:

- Check for meta tags on all pages
- Verify canonical URLs are set correctly
- Test mobile responsiveness
- Validate structured data markup
- Review sitemap coverage
- Check robots.txt configuration

Use tools: Google Search Console, Lighthouse, Screaming Frog

### Step 2: Implement Meta Tags

Add essential meta tags to all pages:

- Dynamic title and description based on content
- Canonical URLs to prevent duplication
- Open Graph and Twitter Card tags for social sharing
- Language and regional targeting when applicable

Place meta tags in `<head>` section, prioritizing order for optimal parsing.

### Step 3: Choose and Configure Rendering Strategy

Select SSR, SSG, or hybrid based on content characteristics:

- Identify static vs dynamic pages
- Configure framework for chosen strategy
- Implement data fetching methods appropriately
- Test that content is visible in page source (View Source test)

### Step 4: Generate and Submit Sitemaps

Create comprehensive sitemaps:

- Generate XML sitemap automatically from routes
- Include all indexable pages
- Update sitemap on content changes
- Submit to search engines via webmaster tools
- Add sitemap location to robots.txt

### Step 5: Add Structured Data

Implement JSON-LD markup:

- Identify relevant schema types for content
- Add structured data to appropriate pages
- Validate markup with testing tools
- Monitor for rich result appearances
- Update schemas when content changes

### Step 6: Monitor and Iterate

Track SEO performance:

- Monitor search rankings for target keywords
- Review click-through rates in Search Console
- Analyze crawl errors and coverage issues
- Test Core Web Vitals performance
- Update metadata based on performance data

## Technical SEO Considerations

### Performance Optimization

Page speed is a ranking factor:

- Optimize images (WebP, lazy loading, responsive images)
- Minimize JavaScript and CSS
- Enable compression (Gzip, Brotli)
- Use CDN for static assets
- Implement caching strategies

### Mobile-First Indexing

Google primarily uses mobile version for indexing:

- Ensure responsive design
- Test mobile usability
- Verify mobile page speed
- Check mobile viewport configuration
- Avoid intrusive interstitials

### URL Structure

Clean, descriptive URLs improve SEO:

- Use hyphens to separate words
- Keep URLs concise and readable
- Avoid unnecessary parameters
- Implement proper redirects (301 for permanent)
- Use lowercase consistently

### Internal Linking

Strategic internal links distribute page authority:

- Link to important pages from high-authority pages
- Use descriptive anchor text
- Maintain reasonable link depth (3-4 clicks from homepage)
- Fix broken internal links
- Implement breadcrumb navigation

### Security and Accessibility

HTTPS and accessibility affect rankings:

- Use HTTPS (SSL certificate required)
- Ensure proper heading hierarchy (H1, H2, H3)
- Add alt text to images
- Implement ARIA labels where appropriate
- Test keyboard navigation

## Framework-Specific Guidance

### Next.js

Next.js provides built-in SEO features:

- Use `next/head` for meta tags
- Implement `getStaticProps` for SSG
- Use `getServerSideProps` for SSR
- Generate sitemap with `next-sitemap` package
- Add structured data in component head

See `examples/nextjs-seo-example.jsx` for complete implementation.

### Nuxt.js

Nuxt offers SEO modules:

- Configure `head` in `nuxt.config.js`
- Use `@nuxtjs/sitemap` module
- Implement `asyncData` or `fetch` for data
- Add JSON-LD with `vue-meta`
- Use `@nuxtjs/robots` for robots.txt

### React (Client-Side)

Client-side React requires additional setup:

- Use React Helmet for meta tags
- Consider prerendering with Prerender.io or Rendertron
- Implement dynamic rendering for search bots
- Use React Snap for static site generation
- Ensure content is in page source

### WordPress

WordPress has strong SEO foundation:

- Use Yoast SEO or Rank Math plugin
- Configure permalinks structure
- Generate XML sitemaps automatically
- Add schema markup with plugins
- Optimize images with Smush or ShortPixel

## Common SEO Mistakes to Avoid

❌ **Duplicate Content** - Use canonical tags, avoid multiple URLs for same content

❌ **Missing or Generic Titles/Descriptions** - Create unique, descriptive metadata for each page

❌ **Blocking Search Engines** - Check robots.txt doesn't block important pages

❌ **Slow Page Speed** - Optimize performance, especially on mobile

❌ **JavaScript-Only Content** - Ensure content renders server-side or use dynamic rendering

❌ **Broken Links** - Regularly audit and fix 404 errors

❌ **Missing Alt Text** - Add descriptive alt text to all images

❌ **Non-Mobile-Friendly** - Implement responsive design

❌ **Invalid Structured Data** - Validate JSON-LD before deployment

❌ **Ignoring Analytics** - Monitor Search Console for errors and opportunities

## Additional Resources

### Reference Files

For detailed implementation guidance:

- **`references/meta-tags.md`** - Complete meta tag reference with HTML examples
- **`references/ssr-ssg-implementation.md`** - Framework-specific rendering configurations
- **`references/structured-data.md`** - Comprehensive JSON-LD schema examples
- **`references/sitemap-best-practices.md`** - Sitemap generation and optimization

### Example Files

Working implementations in `examples/`:

- **`nextjs-seo-example.jsx`** - Next.js page with complete SEO setup
- **`sitemap-generator.js`** - Node.js sitemap generation script
- **`structured-data-examples.json`** - JSON-LD templates for common schemas
- **`meta-tags-template.html`** - HTML head section template

## Quick Reference

### Essential Meta Tags Template

```html
<title>Page Title (50-60 chars)</title>
<meta name="description" content="Page description (150-160 chars)" />
<link rel="canonical" href="https://example.com/page" />
<meta name="robots" content="index, follow" />
<meta property="og:title" content="Open Graph Title" />
<meta property="og:description" content="Open Graph Description" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="https://example.com/page" />
```

### Basic JSON-LD Article Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2025-01-15",
  "image": "https://example.com/image.jpg"
}
```

### Sitemap XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Testing and Validation

Before deployment, validate SEO implementation:

1. **Google Rich Results Test** - Test structured data
2. **Google Search Console** - Submit sitemap, check coverage
3. **Lighthouse SEO Audit** - Check technical SEO score
4. **Mobile-Friendly Test** - Verify mobile usability
5. **PageSpeed Insights** - Test performance metrics
6. **Schema Markup Validator** - Validate JSON-LD syntax
7. **View Source Test** - Ensure content visible in HTML source

Regular monitoring ensures ongoing SEO health and identifies opportunities for improvement.
