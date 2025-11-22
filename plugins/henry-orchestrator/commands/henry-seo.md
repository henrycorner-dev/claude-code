---
description: Audits/optimizes SEO; generates sitemap, meta tags.
argument-hint: Optional page/component path or 'all' for full site audit
allowed-tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'TodoWrite', 'AskUserQuestion']
---

# SEO Audit & Optimization

Comprehensively audit and optimize SEO for web applications by analyzing existing SEO implementation, generating/updating sitemaps, creating optimized meta tags, and providing actionable recommendations.

## Core Principles

- **Thorough analysis**: Examine all pages, components, and routes for SEO opportunities
- **Modern SEO standards**: Follow current best practices for meta tags, structured data, and performance
- **Framework-aware**: Adapt SEO implementation based on the detected framework (Next.js, React, Vue, etc.)
- **Automatic generation**: Create sitemaps and meta tags with minimal user input
- **Use TodoWrite**: Track all audit and optimization phases

**Initial request:** $ARGUMENTS

---

## Phase 1: Project Analysis & Framework Detection

**Goal**: Understand the project structure and detect the web framework being used

**Actions**:

1. Create todo list with all phases:
   - Analyze project structure and detect framework
   - Audit existing SEO implementation
   - Generate/update sitemap
   - Generate/update meta tags
   - Add structured data (Schema.org)
   - Optimize for performance and accessibility
   - Generate SEO report with recommendations

2. Detect project framework and structure:
   - Check package.json for dependencies (Next.js, React, Vue, Nuxt, Remix, Astro, SvelteKit, Angular)
   - Identify routing structure:
     - Next.js: `app/` (App Router) or `pages/` (Pages Router)
     - React: Check for React Router configuration
     - Vue/Nuxt: `pages/` directory
     - Remix: `app/routes/`
     - Astro: `src/pages/`
     - SvelteKit: `src/routes/`
     - Angular: Check routing module
   - Identify if SSR/SSG is enabled
   - Check for existing SEO files (sitemap.xml, robots.txt, manifest.json)

3. Parse user arguments from $ARGUMENTS:
   - Specific page/component path to audit
   - 'all' for full site audit (default if not specified)
   - Domain/base URL if provided

4. Determine scope:
   - Single page audit vs full site audit
   - Focus areas (meta tags, sitemap, structured data, etc.)

**Output**: Project framework identified with audit scope defined

---

## Phase 2: SEO Audit

**Goal**: Audit existing SEO implementation and identify gaps

**Actions**:

1. Update TodoWrite: Mark "Audit existing SEO implementation" as in_progress

2. Check for existing SEO infrastructure:
   - Sitemap file (sitemap.xml, sitemap.ts for Next.js)
   - Robots.txt file
   - Meta tags in HTML/components
   - Open Graph tags
   - Twitter Card tags
   - Canonical URLs
   - Structured data (JSON-LD)
   - Favicon and app icons
   - Manifest.json (PWA)

3. Analyze each page/route for:
   - Title tag (optimal: 50-60 characters)
   - Meta description (optimal: 150-160 characters)
   - H1 tag (should be unique per page)
   - Open Graph tags (og:title, og:description, og:image, og:url, og:type)
   - Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
   - Canonical URL
   - Alt text for images
   - Semantic HTML usage
   - Internal linking structure

4. Check technical SEO:
   - HTTPS enforcement
   - Mobile responsiveness (viewport meta tag)
   - Page load performance indicators
   - Structured data validation
   - XML sitemap existence and format
   - Robots.txt configuration

5. Create audit summary:

   ```
   SEO Audit Summary:

   Framework: [detected framework]
   Total Pages: [count]

   Existing SEO Elements:
   ✓ [present elements]
   ✗ [missing elements]

   Issues Found:
   - [list of issues with severity: critical/warning/info]

   Opportunities:
   - [list of optimization opportunities]
   ```

**Output**: Comprehensive SEO audit with identified issues and opportunities

---

## Phase 3: Sitemap Generation

**Goal**: Generate or update XML sitemap for the application

**Actions**:

1. Update TodoWrite: Mark "Generate/update sitemap" as in_progress

2. Collect all routes/pages:
   - **Next.js App Router**: Scan `app/` directory for page.tsx/jsx files
   - **Next.js Pages Router**: Scan `pages/` directory
   - **React with React Router**: Parse router configuration
   - **Vue/Nuxt**: Scan `pages/` directory
   - **Remix**: Scan `app/routes/`
   - **Astro**: Scan `src/pages/`
   - **SvelteKit**: Scan `src/routes/`
   - **Angular**: Parse routing modules

3. Determine base URL:
   - Check environment variables (NEXT_PUBLIC_SITE_URL, VITE_BASE_URL, etc.)
   - Check package.json for homepage field
   - Ask user if not found

4. For each route, determine:
   - URL path
   - Last modified date (from git or file system)
   - Change frequency (estimate based on route type)
   - Priority (0.0-1.0, estimate based on route depth)

5. Generate sitemap based on framework:

   **For Next.js (App Router or Pages Router with API route)**:
   - Create or update `app/sitemap.ts` (App Router) or `pages/api/sitemap.xml.ts` (Pages Router)
   - Use Next.js sitemap generation API

   Example sitemap.ts:

   ```typescript
   import { MetadataRoute } from 'next';

   export default function sitemap(): MetadataRoute.Sitemap {
     return [
       {
         url: 'https://example.com',
         lastModified: new Date(),
         changeFrequency: 'weekly',
         priority: 1,
       },
       {
         url: 'https://example.com/about',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.8,
       },
       // ... more routes
     ];
   }
   ```

   **For static sites or other frameworks**:
   - Create `public/sitemap.xml`
   - Generate standard XML sitemap format:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://example.com/</loc>
       <lastmod>2024-01-15</lastmod>
       <changefreq>weekly</changefreq>
       <priority>1.0</priority>
     </url>
     <!-- ... more URLs -->
   </urlset>
   ```

6. Update or create robots.txt:

   ```
   User-agent: *
   Allow: /
   Sitemap: https://[domain]/sitemap.xml
   ```

7. Verify sitemap:
   - Check XML syntax
   - Ensure all URLs are absolute
   - Verify changefreq values are valid
   - Confirm priority values are 0.0-1.0

**Output**: Sitemap generated/updated and robots.txt configured

---

## Phase 4: Meta Tags Optimization

**Goal**: Generate and optimize meta tags for all pages

**Actions**:

1. Update TodoWrite: Mark "Generate/update meta tags" as in_progress

2. For each page/route, generate comprehensive meta tags:

   **Framework-specific implementation**:

   **Next.js (App Router)** - Use Metadata API:

   ```typescript
   // app/[route]/page.tsx
   import { Metadata } from 'next';

   export const metadata: Metadata = {
     title: 'Page Title | Site Name',
     description: 'Compelling page description under 160 characters',
     keywords: ['keyword1', 'keyword2', 'keyword3'],
     authors: [{ name: 'Author Name' }],
     openGraph: {
       title: 'Page Title',
       description: 'Description for social sharing',
       url: 'https://example.com/page',
       siteName: 'Site Name',
       images: [
         {
           url: 'https://example.com/og-image.jpg',
           width: 1200,
           height: 630,
           alt: 'Image description',
         },
       ],
       locale: 'en_US',
       type: 'website',
     },
     twitter: {
       card: 'summary_large_image',
       title: 'Page Title',
       description: 'Description for Twitter',
       images: ['https://example.com/twitter-image.jpg'],
       creator: '@twitterhandle',
     },
     robots: {
       index: true,
       follow: true,
       googleBot: {
         index: true,
         follow: true,
         'max-video-preview': -1,
         'max-image-preview': 'large',
         'max-snippet': -1,
       },
     },
     alternates: {
       canonical: 'https://example.com/page',
     },
   };
   ```

   **Next.js (Pages Router)** - Use next/head:

   ```typescript
   import Head from 'next/head'

   export default function Page() {
     return (
       <>
         <Head>
           <title>Page Title | Site Name</title>
           <meta name="description" content="Page description" />
           <meta name="keywords" content="keyword1, keyword2, keyword3" />
           <link rel="canonical" href="https://example.com/page" />

           {/* Open Graph */}
           <meta property="og:type" content="website" />
           <meta property="og:title" content="Page Title" />
           <meta property="og:description" content="Description" />
           <meta property="og:url" content="https://example.com/page" />
           <meta property="og:image" content="https://example.com/og-image.jpg" />

           {/* Twitter */}
           <meta name="twitter:card" content="summary_large_image" />
           <meta name="twitter:title" content="Page Title" />
           <meta name="twitter:description" content="Description" />
           <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
         </Head>
         {/* Page content */}
       </>
     )
   }
   ```

   **React/Vite** - Use react-helmet-async:

   ```typescript
   import { Helmet } from 'react-helmet-async'

   export default function Page() {
     return (
       <>
         <Helmet>
           <title>Page Title | Site Name</title>
           <meta name="description" content="Page description" />
           <link rel="canonical" href="https://example.com/page" />
           {/* ... other meta tags */}
         </Helmet>
         {/* Page content */}
       </>
     )
   }
   ```

   **Astro**:

   ```astro
   ---
   // src/pages/page.astro
   const title = "Page Title | Site Name"
   const description = "Page description"
   const canonicalURL = "https://example.com/page"
   const ogImage = "https://example.com/og-image.jpg"
   ---

   <head>
     <title>{title}</title>
     <meta name="description" content={description} />
     <link rel="canonical" href={canonicalURL} />

     <!-- Open Graph -->
     <meta property="og:title" content={title} />
     <meta property="og:description" content={description} />
     <meta property="og:url" content={canonicalURL} />
     <meta property="og:image" content={ogImage} />

     <!-- Twitter -->
     <meta name="twitter:card" content="summary_large_image" />
     <meta name="twitter:title" content={title} />
     <meta name="twitter:description" content={description} />
     <meta name="twitter:image" content={ogImage} />
   </head>
   ```

3. Create reusable SEO components:
   - Create a shared SEO/Head component for consistent meta tags
   - Include props for page-specific overrides
   - Set sensible defaults for site-wide meta tags

4. Essential meta tags checklist for each page:
   - ✓ Title (unique, 50-60 chars)
   - ✓ Description (unique, 150-160 chars)
   - ✓ Canonical URL
   - ✓ Viewport (for mobile)
   - ✓ Open Graph (title, description, image, url, type)
   - ✓ Twitter Card (card type, title, description, image)
   - ✓ Robots directives (if needed)

5. Install necessary dependencies if missing:
   - Next.js: Built-in (no extra deps)
   - React: `npm install react-helmet-async`
   - Vue: `npm install @vueuse/head` or use Nuxt built-in
   - Astro: Built-in

**Output**: Meta tags implemented across all pages with framework-appropriate approach

---

## Phase 5: Structured Data (Schema.org)

**Goal**: Add JSON-LD structured data for better search engine understanding

**Actions**:

1. Update TodoWrite: Mark "Add structured data (Schema.org)" as in_progress

2. Determine appropriate schema types based on content:
   - **Website/Organization**: For homepage
   - **Article/BlogPosting**: For blog posts
   - **Product**: For product pages
   - **BreadcrumbList**: For navigation
   - **FAQ**: For FAQ sections
   - **HowTo**: For tutorial/guide pages
   - **LocalBusiness**: For business sites

3. Generate JSON-LD structured data:

   **Homepage - Organization/Website**:

   ```json
   {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "Company Name",
     "url": "https://example.com",
     "logo": "https://example.com/logo.png",
     "description": "Company description",
     "sameAs": [
       "https://twitter.com/company",
       "https://linkedin.com/company/company",
       "https://github.com/company"
     ],
     "contactPoint": {
       "@type": "ContactPoint",
       "contactType": "Customer Service",
       "email": "support@example.com"
     }
   }
   ```

   **Blog Post - Article**:

   ```json
   {
     "@context": "https://schema.org",
     "@type": "Article",
     "headline": "Article Title",
     "description": "Article description",
     "image": "https://example.com/article-image.jpg",
     "author": {
       "@type": "Person",
       "name": "Author Name"
     },
     "publisher": {
       "@type": "Organization",
       "name": "Company Name",
       "logo": {
         "@type": "ImageObject",
         "url": "https://example.com/logo.png"
       }
     },
     "datePublished": "2024-01-15",
     "dateModified": "2024-01-20"
   }
   ```

   **Breadcrumbs**:

   ```json
   {
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [
       {
         "@type": "ListItem",
         "position": 1,
         "name": "Home",
         "item": "https://example.com"
       },
       {
         "@type": "ListItem",
         "position": 2,
         "name": "Category",
         "item": "https://example.com/category"
       },
       {
         "@type": "ListItem",
         "position": 3,
         "name": "Page",
         "item": "https://example.com/category/page"
       }
     ]
   }
   ```

4. Implement structured data in framework:

   **Next.js (App Router)**:

   ```typescript
   export default function Page() {
     const jsonLd = {
       '@context': 'https://schema.org',
       '@type': 'Article',
       headline: 'Article Title',
       // ... more fields
     }

     return (
       <>
         <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
         />
         {/* Page content */}
       </>
     )
   }
   ```

   **Other frameworks**: Similar approach with script tag in head

5. Validate structured data:
   - Check JSON syntax
   - Ensure required properties are present for each type
   - Recommend testing with Google Rich Results Test

**Output**: Structured data implemented for appropriate pages

---

## Phase 6: Performance & Accessibility Optimization

**Goal**: Optimize SEO-related performance and accessibility aspects

**Actions**:

1. Update TodoWrite: Mark "Optimize for performance and accessibility" as in_progress

2. Image optimization:
   - Check for missing alt text on images
   - Recommend next/image (Next.js) or appropriate image optimization
   - Suggest WebP format for better performance
   - Ensure OG images are 1200x630px

3. HTML semantics:
   - Verify proper heading hierarchy (H1 > H2 > H3)
   - Check for semantic HTML5 elements (header, nav, main, article, footer)
   - Ensure one H1 per page

4. Performance optimization:
   - Check for viewport meta tag
   - Recommend lazy loading for images
   - Suggest preloading critical resources
   - Check for render-blocking resources

5. Mobile optimization:
   - Verify responsive viewport meta tag
   - Check for mobile-friendly CSS
   - Suggest mobile testing

6. Accessibility for SEO:
   - ARIA labels where appropriate
   - Keyboard navigation support
   - Sufficient color contrast
   - Focus indicators

**Output**: Performance and accessibility recommendations implemented

---

## Phase 7: SEO Report & Recommendations

**Goal**: Generate comprehensive SEO report with actionable recommendations

**Actions**:

1. Update TodoWrite: Mark "Generate SEO report with recommendations" as in_progress

2. Create SEO_REPORT.md in project root:

   ```markdown
   # SEO Audit Report

   Generated: [date]
   Framework: [detected framework]

   ## Summary

   - Total pages audited: [count]
   - Critical issues fixed: [count]
   - Warnings addressed: [count]
   - Optimizations applied: [count]

   ## Changes Made

   ### Sitemap

   - [✓] Created/Updated sitemap at [path]
   - [✓] Updated robots.txt with sitemap reference
   - [✓] Included [count] URLs

   ### Meta Tags

   - [✓] Added/Updated meta tags for [count] pages
   - [✓] Implemented Open Graph tags
   - [✓] Implemented Twitter Card tags
   - [✓] Added canonical URLs

   ### Structured Data

   - [✓] Added JSON-LD for [types]
   - [✓] Implemented breadcrumbs
   - [✓] Added organization schema

   ### Technical SEO

   - [✓] Optimized page titles (50-60 chars)
   - [✓] Optimized meta descriptions (150-160 chars)
   - [✓] Fixed heading hierarchy
   - [✓] Added alt text to images

   ## Recommendations

   ### High Priority

   1. Submit sitemap to Google Search Console
   2. Test structured data with Google Rich Results Test
   3. Monitor Core Web Vitals
   4. Set up Google Analytics 4

   ### Medium Priority

   1. Create custom 404 page
   2. Implement pagination meta tags (if applicable)
   3. Add hreflang tags for multi-language sites
   4. Create XML sitemap index for large sites (>50k URLs)

   ### Low Priority

   1. Consider implementing AMP (if applicable)
   2. Add RSS feed for blog content
   3. Implement lazy loading for below-fold images
   4. Add preconnect/dns-prefetch for external resources

   ## Testing Checklist

   - [ ] Test pages in Google Mobile-Friendly Test
   - [ ] Validate structured data in Rich Results Test
   - [ ] Check sitemap in Google Search Console
   - [ ] Test social media cards (Twitter, Facebook)
   - [ ] Run Lighthouse SEO audit
   - [ ] Check page speed with PageSpeed Insights
   - [ ] Verify canonical URLs are correct
   - [ ] Test robots.txt with Google Search Console

   ## Monitoring

   Tools to use for ongoing SEO monitoring:

   - Google Search Console
   - Google Analytics 4
   - Lighthouse CI
   - Bing Webmaster Tools

   ## Resources

   - [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
   - [Schema.org Documentation](https://schema.org/)
   - [Open Graph Protocol](https://ogp.me/)
   - [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
   ```

3. Create .env.example with SEO-related variables:

   ```
   # SEO Configuration
   NEXT_PUBLIC_SITE_URL=https://example.com
   NEXT_PUBLIC_SITE_NAME=Your Site Name
   NEXT_PUBLIC_TWITTER_HANDLE=@yourhandle
   ```

4. Present summary to user:

   ```
   SEO Optimization Complete!

   Changes Made:
   ✓ Sitemap: [generated/updated] at [path]
   ✓ Meta Tags: Optimized for [count] pages
   ✓ Structured Data: Added [types]
   ✓ Robots.txt: [created/updated]

   Files Created/Modified:
   - [list of files]

   Next Steps:
   1. Review SEO_REPORT.md for detailed findings
   2. Test your changes:
      - Google Rich Results Test: https://search.google.com/test/rich-results
      - Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
      - Lighthouse audit: npm run build && npm run start (then run Lighthouse)
   3. Submit sitemap to Google Search Console
   4. Monitor performance with Google Analytics

   Pro Tips:
   - Keep titles unique and under 60 characters
   - Write compelling meta descriptions (150-160 chars)
   - Update sitemap when adding new pages
   - Test social media cards before sharing
   - Monitor Core Web Vitals regularly
   ```

**Output**: Comprehensive SEO report with clear next steps

---

## Important Notes

### SEO Best Practices

- **Unique content**: Every page should have unique title and description
- **Keyword usage**: Natural keyword integration, avoid keyword stuffing
- **Internal linking**: Link related pages together
- **URL structure**: Clean, descriptive URLs with hyphens
- **Mobile-first**: Ensure mobile responsiveness
- **Page speed**: Optimize for fast loading (aim for <3s)
- **HTTPS**: Always use secure connections
- **Regular updates**: Keep content fresh and relevant

### Framework-Specific Considerations

- **Next.js**: Use Metadata API (App Router) or next/head (Pages Router)
- **React**: Install react-helmet-async for meta tag management
- **Vue/Nuxt**: Use Nuxt's built-in head management
- **Astro**: Use frontmatter and built-in head management
- **SvelteKit**: Use svelte:head
- **Angular**: Use Meta and Title services

### Common Pitfalls to Avoid

- Duplicate meta tags
- Missing canonical URLs
- Inconsistent Open Graph images
- Missing alt text on images
- Thin content (pages with little text)
- Orphan pages (no internal links)
- Slow page load times
- Missing mobile viewport tag
- Broken internal/external links

### Maintenance

After initial SEO setup:

- Update sitemap when adding new pages
- Review and update meta tags quarterly
- Monitor Google Search Console for issues
- Track keyword rankings
- Analyze user behavior in Google Analytics
- Keep content fresh and updated
- Fix broken links promptly

---

**Begin with Phase 1: Project Analysis & Framework Detection**
