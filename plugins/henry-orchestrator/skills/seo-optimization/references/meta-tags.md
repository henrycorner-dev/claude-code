# Meta Tags Reference

This reference provides comprehensive guidance for implementing meta tags for SEO, social media sharing, and browser behavior.

## Essential Meta Tags

### Title Tag

The most important on-page SEO element. Appears in search results, browser tabs, and social shares.

**Best practices:**

- Keep between 50-60 characters (search engines truncate longer titles)
- Include primary keyword near the beginning
- Make it unique for each page
- Use brand name at the end (e.g., "Page Title | Brand Name")
- Accurately describe page content

```html
<title>Complete SEO Guide for Web Developers | YourBrand</title>
```

**Dynamic implementation:**

```jsx
// React/Next.js
import Head from 'next/head';

<Head>
  <title>{pageTitle} | YourBrand</title>
</Head>;
```

```vue
<!-- Vue/Nuxt -->
<script>
export default {
  head() {
    return {
      title: `${this.pageTitle} | YourBrand`,
    };
  },
};
</script>
```

### Meta Description

Summary displayed in search results. Doesn't directly impact rankings but affects click-through rate.

**Best practices:**

- Keep between 150-160 characters
- Include target keywords naturally
- Write compelling, actionable copy
- Make it unique for each page
- Accurately summarize page content

```html
<meta
  name="description"
  content="Learn essential SEO techniques for web developers including meta tags, structured data, sitemaps, and rendering strategies. Improve your search rankings today."
/>
```

**Dynamic implementation:**

```jsx
// React/Next.js
<Head>
  <meta name="description" content={pageDescription} />
</Head>
```

### Canonical URL

Specifies the preferred version of a page to prevent duplicate content issues.

**When to use:**

- Multiple URLs access the same content
- URL parameters create duplicate pages
- HTTP and HTTPS versions both accessible
- www and non-www versions both accessible
- Paginated content

```html
<link rel="canonical" href="https://www.example.com/page" />
```

**Important notes:**

- Always use absolute URLs (include protocol and domain)
- Self-reference canonical on original pages
- Point all duplicates to the same canonical URL
- Canonical should point to indexable page (not 404, redirect, or blocked)

### Viewport Meta Tag

Essential for responsive design and mobile-friendliness.

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**Additional viewport options:**

```html
<!-- Prevent zoom (use carefully, impacts accessibility) -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>

<!-- Set specific width -->
<meta name="viewport" content="width=1024" />
```

### Robots Meta Tag

Controls how search engines crawl and index the page.

**Common directives:**

```html
<!-- Allow indexing and following links (default) -->
<meta name="robots" content="index, follow" />

<!-- Prevent indexing but follow links -->
<meta name="robots" content="noindex, follow" />

<!-- Prevent following links but allow indexing -->
<meta name="robots" content="index, nofollow" />

<!-- Prevent both indexing and following links -->
<meta name="robots" content="noindex, nofollow" />

<!-- Don't show cached version -->
<meta name="robots" content="index, follow, noarchive" />

<!-- Don't show snippet in search results -->
<meta name="robots" content="index, follow, nosnippet" />

<!-- Limit snippet length -->
<meta name="robots" content="max-snippet:150, max-image-preview:large" />
```

**Search engine specific:**

```html
<!-- Google only -->
<meta name="googlebot" content="noindex" />

<!-- Bing only -->
<meta name="bingbot" content="noindex" />
```

### Character Encoding

Specifies character encoding for the document.

```html
<meta charset="UTF-8" />
```

Always include this as the first meta tag in `<head>` for proper character interpretation.

### Language and Regional Targeting

Specify content language and regional variations.

```html
<!-- Document language -->
<html lang="en">
  <!-- Hreflang for alternate language versions -->
  <link rel="alternate" hreflang="en" href="https://example.com/en/" />
  <link rel="alternate" hreflang="es" href="https://example.com/es/" />
  <link rel="alternate" hreflang="fr" href="https://example.com/fr/" />
  <link rel="alternate" hreflang="x-default" href="https://example.com/" />

  <!-- Regional targeting -->
  <link rel="alternate" hreflang="en-US" href="https://example.com/us/" />
  <link rel="alternate" hreflang="en-GB" href="https://example.com/uk/" />
</html>
```

## Open Graph Tags

Open Graph protocol controls how content appears when shared on Facebook, LinkedIn, and other platforms.

### Core Open Graph Tags

```html
<!-- Required Open Graph tags -->
<meta property="og:title" content="The Complete SEO Guide for Web Developers" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://example.com/seo-guide" />
<meta property="og:image" content="https://example.com/images/seo-guide.jpg" />

<!-- Recommended additional tags -->
<meta
  property="og:description"
  content="Learn essential SEO techniques including meta tags, structured data, sitemaps, and more."
/>
<meta property="og:site_name" content="YourBrand" />
<meta property="og:locale" content="en_US" />
```

### Open Graph Types

**Article:**

```html
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2025-01-15T08:00:00+00:00" />
<meta property="article:modified_time" content="2025-01-20T10:30:00+00:00" />
<meta property="article:author" content="https://example.com/authors/john-doe" />
<meta property="article:section" content="Technology" />
<meta property="article:tag" content="SEO" />
<meta property="article:tag" content="Web Development" />
```

**Product:**

```html
<meta property="og:type" content="product" />
<meta property="product:price:amount" content="29.99" />
<meta property="product:price:currency" content="USD" />
<meta property="product:availability" content="in stock" />
```

**Video:**

```html
<meta property="og:type" content="video.other" />
<meta property="og:video" content="https://example.com/video.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1280" />
<meta property="og:video:height" content="720" />
```

### Open Graph Images

**Best practices:**

- Minimum size: 1200 x 630 pixels (recommended for Facebook)
- Aspect ratio: 1.91:1 for optimal display
- Maximum file size: 8 MB
- Formats: JPG, PNG (PNG for transparency)

```html
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Description of image for accessibility" />

<!-- Multiple images (platform selects best) -->
<meta property="og:image" content="https://example.com/square.jpg" />
<meta property="og:image" content="https://example.com/landscape.jpg" />
```

## Twitter Card Tags

Twitter Cards control appearance when shared on Twitter/X.

### Twitter Card Types

**Summary Card:**

```html
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@yourbrand" />
<meta name="twitter:creator" content="@authorhandle" />
<meta name="twitter:title" content="The Complete SEO Guide" />
<meta name="twitter:description" content="Learn essential SEO techniques for web developers." />
<meta name="twitter:image" content="https://example.com/image.jpg" />
<meta name="twitter:image:alt" content="SEO Guide cover image" />
```

**Summary Card with Large Image:**

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourbrand" />
<meta name="twitter:creator" content="@authorhandle" />
<meta name="twitter:title" content="The Complete SEO Guide" />
<meta name="twitter:description" content="Learn essential SEO techniques for web developers." />
<meta name="twitter:image" content="https://example.com/large-image.jpg" />
<meta name="twitter:image:alt" content="SEO Guide cover image" />
```

**Image requirements:**

- Summary card: Minimum 144 x 144 pixels (1:1 ratio)
- Large image card: Minimum 300 x 157 pixels, recommended 1200 x 628 pixels (1.91:1 ratio)
- Maximum file size: 5 MB
- Formats: JPG, PNG, WEBP, GIF

**App Card (for mobile apps):**

```html
<meta name="twitter:card" content="app" />
<meta name="twitter:site" content="@yourbrand" />
<meta name="twitter:description" content="Download our app" />
<meta name="twitter:app:name:iphone" content="App Name" />
<meta name="twitter:app:id:iphone" content="app-id" />
<meta name="twitter:app:name:googleplay" content="App Name" />
<meta name="twitter:app:id:googleplay" content="com.example.app" />
```

**Player Card (for video/audio):**

```html
<meta name="twitter:card" content="player" />
<meta name="twitter:title" content="Video Title" />
<meta name="twitter:description" content="Video description" />
<meta name="twitter:player" content="https://example.com/player.html" />
<meta name="twitter:player:width" content="1280" />
<meta name="twitter:player:height" content="720" />
<meta name="twitter:image" content="https://example.com/thumbnail.jpg" />
```

## Additional Meta Tags

### Theme Color

Sets browser UI color on mobile devices.

```html
<meta name="theme-color" content="#3367D6" />

<!-- Dark mode support -->
<meta name="theme-color" content="#3367D6" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
```

### Author and Copyright

```html
<meta name="author" content="John Doe" /> <meta name="copyright" content="© 2025 YourBrand" />
```

### Referrer Policy

Controls how much referrer information is sent with requests.

```html
<meta name="referrer" content="origin-when-cross-origin" />
```

**Options:**

- `no-referrer` - Never send referrer
- `origin` - Send only origin (no path)
- `strict-origin-when-cross-origin` - Default, secure option
- `unsafe-url` - Always send full URL (not recommended)

### Format Detection

Prevents automatic detection and linking of phone numbers, addresses, etc.

```html
<!-- Disable phone number detection -->
<meta name="format-detection" content="telephone=no" />

<!-- Disable email detection -->
<meta name="format-detection" content="email=no" />

<!-- Disable address detection -->
<meta name="format-detection" content="address=no" />
```

### Apple iOS Specific

```html
<!-- App-capable (hides Safari UI when added to home screen) -->
<meta name="apple-mobile-web-app-capable" content="yes" />

<!-- Status bar style -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- App title on home screen -->
<meta name="apple-mobile-web-app-title" content="App Name" />

<!-- Touch icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### Microsoft Tiles

```html
<meta name="msapplication-TileColor" content="#3367D6" />
<meta name="msapplication-TileImage" content="/mstile-144x144.png" />
<meta name="msapplication-config" content="/browserconfig.xml" />
```

## Complete Meta Tags Template

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Character encoding -->
    <meta charset="UTF-8" />

    <!-- Viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Primary Meta Tags -->
    <title>Page Title | Brand Name</title>
    <meta name="title" content="Page Title | Brand Name" />
    <meta name="description" content="Page description between 150-160 characters." />
    <meta name="keywords" content="keyword1, keyword2, keyword3" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="author" content="Author Name" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.example.com/page" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.example.com/page" />
    <meta property="og:title" content="Page Title | Brand Name" />
    <meta property="og:description" content="Page description for social sharing." />
    <meta property="og:image" content="https://www.example.com/image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Brand Name" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://www.example.com/page" />
    <meta name="twitter:title" content="Page Title | Brand Name" />
    <meta name="twitter:description" content="Page description for social sharing." />
    <meta name="twitter:image" content="https://www.example.com/image.jpg" />
    <meta name="twitter:site" content="@brandhandle" />
    <meta name="twitter:creator" content="@authorhandle" />

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <!-- Theme Color -->
    <meta name="theme-color" content="#3367D6" />

    <!-- Additional SEO -->
    <meta name="referrer" content="origin-when-cross-origin" />
    <link rel="manifest" href="/site.webmanifest" />
  </head>
  <body>
    <!-- Content -->
  </body>
</html>
```

## Testing Meta Tags

### Validation Tools

1. **Facebook Sharing Debugger** - https://developers.facebook.com/tools/debug/
   - Tests Open Graph tags
   - Shows preview of shared link
   - Clear cache for updated tags

2. **Twitter Card Validator** - https://cards-dev.twitter.com/validator
   - Tests Twitter Card tags
   - Shows preview of tweet
   - Requires approval for player cards

3. **LinkedIn Post Inspector** - https://www.linkedin.com/post-inspector/
   - Tests how posts appear on LinkedIn
   - Validates Open Graph tags

4. **Google Rich Results Test** - https://search.google.com/test/rich-results
   - Tests structured data
   - Shows errors and warnings

5. **Browser Developer Tools**
   - Inspect `<head>` section
   - Verify all tags present
   - Check for duplicates

### Common Issues

**Duplicate meta tags:**

- Only one of each tag should exist
- Later tags may override earlier ones
- Check for tags in both template and page-specific code

**Missing required tags:**

- Every page should have title, description, canonical
- Open Graph requires title, type, url, image
- Twitter Card requires card type and image

**Incorrect image sizes:**

- Images too small won't display properly
- Large file sizes slow page load
- Test images on actual platforms

**Dynamic content not rendering:**

- Social media crawlers may not execute JavaScript
- Use SSR or pre-rendering for dynamic meta tags
- Verify with "View Source" in browser

## Framework-Specific Implementation

### React/Next.js

```jsx
import Head from 'next/head';

export default function Page({ pageData }) {
  return (
    <>
      <Head>
        <title>{pageData.title} | Brand</title>
        <meta name="description" content={pageData.description} />
        <link rel="canonical" href={`https://example.com${pageData.url}`} />

        <meta property="og:title" content={pageData.title} />
        <meta property="og:description" content={pageData.description} />
        <meta property="og:image" content={pageData.ogImage} />
        <meta property="og:url" content={`https://example.com${pageData.url}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageData.title} />
        <meta name="twitter:description" content={pageData.description} />
        <meta name="twitter:image" content={pageData.ogImage} />
      </Head>

      <main>{/* Page content */}</main>
    </>
  );
}
```

### Vue/Nuxt

```vue
<script>
export default {
  head() {
    return {
      title: this.pageData.title,
      meta: [
        { hid: 'description', name: 'description', content: this.pageData.description },
        { hid: 'og:title', property: 'og:title', content: this.pageData.title },
        { hid: 'og:description', property: 'og:description', content: this.pageData.description },
        { hid: 'og:image', property: 'og:image', content: this.pageData.ogImage },
      ],
      link: [{ rel: 'canonical', href: `https://example.com${this.pageData.url}` }],
    };
  },
};
</script>
```

### React Helmet

```jsx
import { Helmet } from 'react-helmet';

function Page({ pageData }) {
  return (
    <>
      <Helmet>
        <title>{pageData.title} | Brand</title>
        <meta name="description" content={pageData.description} />
        <link rel="canonical" href={`https://example.com${pageData.url}`} />
        <meta property="og:title" content={pageData.title} />
        <meta property="og:description" content={pageData.description} />
      </Helmet>

      <main>{/* Content */}</main>
    </>
  );
}
```

## Best Practices Summary

✅ **DO:**

- Include title, description, canonical on every page
- Use unique, descriptive titles and descriptions
- Implement Open Graph and Twitter Card tags
- Use absolute URLs for canonical and og:url
- Optimize images for social sharing (1200x630px)
- Test meta tags before deployment
- Update meta tags when content changes

❌ **DON'T:**

- Duplicate meta tags on the same page
- Use same title/description across multiple pages
- Exceed recommended character limits
- Use relative URLs in canonical or og:url
- Forget to update og:image when changing featured image
- Block social media crawlers in robots.txt
- Use JavaScript-only meta tags without SSR
