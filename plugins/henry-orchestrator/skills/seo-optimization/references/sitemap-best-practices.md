# Sitemap Best Practices

This reference provides comprehensive guidance for creating, optimizing, and maintaining XML sitemaps for better search engine crawling and indexing.

## What is a Sitemap?

A sitemap is an XML file that lists all important pages on a website, helping search engines discover and crawl content efficiently. It provides metadata about pages including update frequency, priority, and last modification date.

## XML Sitemap Structure

Basic sitemap structure:

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

### URL Elements

**loc** (required) - The full URL of the page

```xml
<loc>https://example.com/blog/seo-guide</loc>
```

Must be:

- Absolute URL (include protocol and domain)
- Properly encoded (& becomes &amp;)
- Under 2,048 characters
- From single host (same domain)

**lastmod** (optional) - Last modification date

```xml
<lastmod>2025-01-15</lastmod>
<lastmod>2025-01-15T10:30:00+00:00</lastmod>
```

Formats:

- `YYYY-MM-DD` - Date only
- `YYYY-MM-DDThh:mm:ss+00:00` - Date and time with timezone

**changefreq** (optional) - Expected update frequency

```xml
<changefreq>weekly</changefreq>
```

Values:

- `always` - Changes every access
- `hourly` - Hourly updates
- `daily` - Daily updates
- `weekly` - Weekly updates
- `monthly` - Monthly updates
- `yearly` - Yearly updates
- `never` - Archived content

**Note:** This is a hint, not a directive. Search engines may ignore it.

**priority** (optional) - Relative priority (0.0 to 1.0)

```xml
<priority>0.8</priority>
```

- Default: 0.5
- Range: 0.0 (lowest) to 1.0 (highest)
- Relative to other pages on same site
- Not compared across sites

**Note:** Search engines largely ignore this now. Focus on other signals.

## Sitemap Limits

### Size Limits

- **Maximum URLs:** 50,000 per sitemap
- **Maximum file size:** 50 MB uncompressed
- **Recommended:** Keep under 10,000 URLs for faster processing

If exceeding limits, use sitemap index file.

### Character Encoding

- Must be UTF-8 encoded
- Declare encoding in XML declaration

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

### URL Escaping

Escape special characters:

```xml
<!-- Wrong -->
<loc>https://example.com/product?id=1&color=red</loc>

<!-- Correct -->
<loc>https://example.com/product?id=1&amp;color=red</loc>
```

**Entity escaping:**

- `&` → `&amp;`
- `'` → `&apos;`
- `"` → `&quot;`
- `>` → `&gt;`
- `<` → `&lt;`

## Sitemap Index

Use sitemap index when you have multiple sitemaps:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2025-01-14</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2025-01-10</lastmod>
  </sitemap>
</sitemapindex>
```

**Benefits:**

- Organize by content type
- Easier to maintain
- Track section-specific indexing
- Stay within size limits

**Structure example:**

```
/sitemap-index.xml (main index)
├── /sitemap-posts.xml
├── /sitemap-products.xml
├── /sitemap-pages.xml
└── /sitemap-images.xml
```

## Image Sitemaps

Include images in sitemap for better image search visibility:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/blog/seo-guide</loc>
    <image:image>
      <image:loc>https://example.com/images/seo-guide-hero.jpg</image:loc>
      <image:title>SEO Guide Hero Image</image:title>
      <image:caption>Complete guide to SEO optimization</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://example.com/images/seo-diagram.jpg</image:loc>
      <image:title>SEO Process Diagram</image:title>
    </image:image>
  </url>
</urlset>
```

**Image properties:**

- `image:loc` (required) - Image URL
- `image:title` (optional) - Image title
- `image:caption` (optional) - Image caption
- `image:geo_location` (optional) - Geographic location
- `image:license` (optional) - License URL

**Limits:**

- Maximum 1,000 images per page
- Images must be crawlable (not blocked by robots.txt)

## Video Sitemaps

Include video metadata for video search:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://example.com/videos/seo-tutorial</loc>
    <video:video>
      <video:thumbnail_loc>https://example.com/thumbs/seo-tutorial.jpg</video:thumbnail_loc>
      <video:title>SEO Tutorial for Beginners</video:title>
      <video:description>Learn the basics of SEO in this comprehensive tutorial.</video:description>
      <video:content_loc>https://example.com/videos/seo-tutorial.mp4</video:content_loc>
      <video:player_loc>https://example.com/videoplayer?video=123</video:player_loc>
      <video:duration>600</video:duration>
      <video:publication_date>2025-01-15T08:00:00+00:00</video:publication_date>
      <video:tag>SEO</video:tag>
      <video:tag>tutorial</video:tag>
      <video:category>Education</video:category>
      <video:family_friendly>yes</video:family_friendly>
      <video:restriction relationship="allow">US CA GB</video:restriction>
      <video:platform relationship="allow">web mobile</video:platform>
      <video:requires_subscription>no</video:requires_subscription>
      <video:uploader info="https://example.com/user/john">John Doe</video:uploader>
      <video:live>no</video:live>
    </video:video>
  </url>
</urlset>
```

**Required video properties:**

- `thumbnail_loc` - Thumbnail image URL
- `title` - Video title (max 100 characters)
- `description` - Video description (max 2,048 characters)
- `content_loc` or `player_loc` - Video file URL or player embed URL

## News Sitemaps

For news publishers (requires Google News approval):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://example.com/news/breaking-story</loc>
    <news:news>
      <news:publication>
        <news:name>Example News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2025-01-15T08:00:00+00:00</news:publication_date>
      <news:title>Breaking: Major SEO Update Announced</news:title>
    </news:news>
  </url>
</urlset>
```

**Requirements:**

- Only include articles from last 2 days
- Update continuously
- Match publication date
- Follow Google News content policies

## Dynamic Sitemap Generation

### Node.js Example

```javascript
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');

async function generateSitemap() {
  // Create stream
  const sitemap = new SitemapStream({ hostname: 'https://example.com' });

  // Fetch content
  const posts = await fetchAllPosts();
  const products = await fetchAllProducts();
  const pages = await fetchStaticPages();

  // Add pages
  pages.forEach(page => {
    sitemap.write({
      url: page.path,
      changefreq: 'monthly',
      priority: 0.7,
    });
  });

  // Add blog posts
  posts.forEach(post => {
    sitemap.write({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
      changefreq: 'weekly',
      priority: 0.8,
      img: [
        {
          url: post.featuredImage,
          title: post.title,
        },
      ],
    });
  });

  // Add products
  products.forEach(product => {
    sitemap.write({
      url: `/products/${product.slug}`,
      lastmod: product.updatedAt,
      changefreq: 'daily',
      priority: 0.9,
    });
  });

  // End stream
  sitemap.end();

  // Generate XML
  const xml = await streamToPromise(sitemap);

  // Write to file
  fs.writeFileSync('public/sitemap.xml', xml.toString());

  console.log('Sitemap generated successfully');
}

generateSitemap();
```

### Next.js Example

```javascript
// pages/sitemap.xml.js

function generateSiteMap(posts, products, pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(page => {
      return `
    <url>
      <loc>${`https://example.com${page.path}`}</loc>
      <lastmod>${page.updatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `;
    })
    .join('')}
  ${posts
    .map(post => {
      return `
    <url>
      <loc>${`https://example.com/blog/${post.slug}`}</loc>
      <lastmod>${post.updatedAt}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
    })
    .join('')}
  ${products
    .map(product => {
      return `
    <url>
      <loc>${`https://example.com/products/${product.slug}`}</loc>
      <lastmod>${product.updatedAt}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>
  `;
    })
    .join('')}
</urlset>
`;
}

export async function getServerSideProps({ res }) {
  const posts = await fetchAllPosts();
  const products = await fetchAllProducts();
  const pages = await fetchStaticPages();

  const sitemap = generateSiteMap(posts, products, pages);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {
  // getServerSideProps handles the response
  return null;
}
```

### WordPress

WordPress can generate sitemaps automatically:

**Built-in (WordPress 5.5+):**

- Available at `/wp-sitemap.xml`
- No configuration needed
- Basic functionality

**Plugins (recommended):**

- **Yoast SEO** - Advanced sitemap features
- **Rank Math** - Comprehensive SEO including sitemaps
- **All in One SEO** - Sitemap generation and management

**Manual generation:**

```php
<?php
function generate_custom_sitemap() {
  $posts = get_posts([
    'post_type' => ['post', 'page', 'product'],
    'posts_per_page' => -1,
  ]);

  header('Content-Type: application/xml; charset=utf-8');
  echo '<?xml version="1.0" encoding="UTF-8"?>';
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  foreach ($posts as $post) {
    $permalink = get_permalink($post->ID);
    $modified = get_the_modified_date('c', $post->ID);

    echo '<url>';
    echo '<loc>' . esc_url($permalink) . '</loc>';
    echo '<lastmod>' . $modified . '</lastmod>';
    echo '</url>';
  }

  echo '</urlset>';
  exit;
}
```

## Submission and Discovery

### robots.txt

Add sitemap location to robots.txt:

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-images.xml
```

**Benefits:**

- Helps search engines discover sitemap
- Works for all search engines
- Simple to implement

### Google Search Console

Submit sitemap directly:

1. Go to Search Console
2. Navigate to Sitemaps
3. Enter sitemap URL
4. Click Submit

**Monitor:**

- Discovered URLs
- Indexed URLs
- Errors and warnings
- Last read date

### Bing Webmaster Tools

Similar process to Google:

1. Access Bing Webmaster Tools
2. Go to Sitemaps
3. Submit sitemap URL
4. Monitor status

### Automatic Discovery

Search engines also discover sitemaps by:

- Crawling robots.txt
- Following sitemap links in HTML
- Finding common locations (`/sitemap.xml`)

## What to Include

### Include

✅ **Pages you want indexed:**

- Important content pages
- Blog posts and articles
- Product pages
- Category/tag pages (if valuable)
- Landing pages

✅ **Updated content:**

- Recently published pages
- Recently updated pages
- Active pages

✅ **Canonical URLs:**

- Only include the canonical version
- Not URL parameters or variations

### Exclude

❌ **Pages you don't want indexed:**

- Admin pages
- Login/logout pages
- Thank you pages
- Cart/checkout pages
- Search result pages
- Duplicate content
- Pages with noindex meta tag

❌ **Low-value pages:**

- Tag pages with little content
- Paginated pages (include canonical only)
- Author archives (unless substantial)

❌ **Blocked content:**

- Pages blocked by robots.txt
- Pages requiring authentication
- Pages with redirect

## Sitemap Optimization

### Prioritize Important Content

Use separate sitemaps for content types:

```
/sitemap-index.xml
├── /sitemap-products.xml (high priority)
├── /sitemap-posts.xml (medium priority)
├── /sitemap-pages.xml (medium priority)
└── /sitemap-tags.xml (low priority)
```

### Keep Sitemaps Fresh

**Update frequency:**

- Real-time for critical updates (e-commerce inventory)
- Daily for frequently updated sites
- Weekly/monthly for mostly static sites

**Automatic regeneration:**

- On content publish/update
- Scheduled cron jobs
- On-demand generation

### Accurate lastmod Dates

Only include `lastmod` if you track it accurately:

```xml
<!-- Good: Accurate modification tracking -->
<lastmod>2025-01-15T10:30:00+00:00</lastmod>

<!-- Bad: Always current date -->
<lastmod><?php echo date('c'); ?></lastmod>
```

Inaccurate dates can hurt crawl efficiency.

### Remove Dead URLs

Regularly audit sitemap:

- Check for 404 errors
- Remove redirected URLs
- Remove deleted content
- Verify URL accessibility

## Common Issues

### Sitemap Not Found (404)

**Causes:**

- Incorrect file location
- File not publicly accessible
- Permissions issues
- Wrong URL in robots.txt

**Solution:**

- Verify file exists at specified URL
- Check file permissions (should be readable)
- Test URL in browser
- Update robots.txt if needed

### Sitemap Too Large

**Problem:** Exceeds 50MB or 50,000 URLs

**Solution:**

- Split into multiple sitemaps
- Create sitemap index
- Organize by content type or date

### Encoding Errors

**Problem:** Special characters not properly encoded

**Solution:**

- Use UTF-8 encoding
- Escape XML entities
- Validate XML syntax

```javascript
// Proper URL encoding
function escapeXml(url) {
  return url
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### Redirect URLs in Sitemap

**Problem:** Sitemap contains URLs that redirect

**Solution:**

- Only include final destination URLs
- Update sitemap when URLs change
- Remove old URLs after redirect

### Blocked by robots.txt

**Problem:** URLs in sitemap blocked by robots.txt

**Solution:**

- Review robots.txt rules
- Remove blocked URLs from sitemap
- Or update robots.txt to allow

## Validation

### XML Validators

- **XML Sitemap Validator** - https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Search Console** - Built-in validation on submission
- **Online XML validators** - Check syntax

### Manual Checks

```bash
# Check if sitemap is accessible
curl -I https://example.com/sitemap.xml

# Validate XML syntax
xmllint --noout sitemap.xml

# Check file size
ls -lh sitemap.xml

# Count URLs
grep -c "<loc>" sitemap.xml
```

### Common Validation Errors

**Invalid XML:**

```xml
<!-- Wrong: Unescaped ampersand -->
<loc>https://example.com?id=1&color=red</loc>

<!-- Correct -->
<loc>https://example.com?id=1&amp;color=red</loc>
```

**Wrong namespace:**

```xml
<!-- Wrong -->
<urlset xmlns="http://www.google.com/schemas/sitemap/0.9">

<!-- Correct -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
```

**Invalid date format:**

```xml
<!-- Wrong -->
<lastmod>01/15/2025</lastmod>

<!-- Correct -->
<lastmod>2025-01-15</lastmod>
```

## Monitoring and Maintenance

### Regular Tasks

**Weekly:**

- Check Search Console for errors
- Verify sitemap is accessible
- Review newly discovered URLs

**Monthly:**

- Audit sitemap for accuracy
- Remove dead URLs
- Update content priorities
- Check indexing status

**Quarterly:**

- Review sitemap strategy
- Optimize structure
- Update automation
- Analyze crawl efficiency

### Key Metrics

Monitor in Search Console:

- Discovered URLs vs Submitted
- Indexed URLs vs Submitted
- Coverage errors
- Last read date
- Error rate

**Healthy sitemap:**

- 90%+ submission indexed
- Low error rate (<5%)
- Read within 7 days
- No major warnings

## Best Practices Summary

✅ **DO:**

- Include all important indexable pages
- Use sitemap index for large sites
- Keep sitemaps under 50MB and 50,000 URLs
- Update sitemaps when content changes
- Submit to Search Console and Bing
- Include sitemap location in robots.txt
- Use accurate lastmod dates (or omit)
- Validate XML syntax
- Monitor sitemap health regularly

❌ **DON'T:**

- Include pages with noindex meta tag
- Include redirected or 404 URLs
- Include duplicate content
- Use relative URLs
- Exceed size limits
- Include blocked URLs (robots.txt)
- Use inaccurate modification dates
- Forget to update after content changes
- Ignore Search Console errors

## Tools and Resources

**Generation:**

- **sitemap.js** - Node.js sitemap generator
- **next-sitemap** - Next.js sitemap plugin
- **Yoast SEO** - WordPress sitemap plugin
- **Screaming Frog** - Desktop tool for large sites

**Validation:**

- **Google Search Console** - Primary validation tool
- **XML Sitemaps Validator** - Online validation
- **xmllint** - Command-line validation

**Documentation:**

- **Sitemaps.org** - Official protocol documentation
- **Google Search Central** - Google-specific guidelines
- **Bing Webmaster** - Bing sitemap documentation
