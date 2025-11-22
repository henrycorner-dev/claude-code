/**
 * Sitemap Generator for Node.js
 *
 * Generates XML sitemap with support for:
 * - Multiple content types
 * - Image sitemaps
 * - Sitemap index
 * - Automatic URL escaping
 * - Compression (gzip)
 *
 * Usage:
 *   node sitemap-generator.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Configuration
const CONFIG = {
  hostname: 'https://example.com',
  outputDir: './public',
  compress: true, // Generate .gz version
};

// Escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Format date to ISO 8601
function formatDate(date) {
  return new Date(date).toISOString();
}

// Generate URL entry
function generateUrlEntry(url) {
  const { loc, lastmod, changefreq, priority, images } = url;

  let entry = '  <url>\n';
  entry += `    <loc>${escapeXml(loc)}</loc>\n`;

  if (lastmod) {
    entry += `    <lastmod>${formatDate(lastmod)}</lastmod>\n`;
  }

  if (changefreq) {
    entry += `    <changefreq>${changefreq}</changefreq>\n`;
  }

  if (priority !== undefined) {
    entry += `    <priority>${priority}</priority>\n`;
  }

  // Add images if provided
  if (images && images.length > 0) {
    images.forEach(image => {
      entry += '    <image:image>\n';
      entry += `      <image:loc>${escapeXml(image.url)}</image:loc>\n`;
      if (image.title) {
        entry += `      <image:title>${escapeXml(image.title)}</image:title>\n`;
      }
      if (image.caption) {
        entry += `      <image:caption>${escapeXml(image.caption)}</image:caption>\n`;
      }
      entry += '    </image:image>\n';
    });
  }

  entry += '  </url>\n';

  return entry;
}

// Generate sitemap XML
function generateSitemap(urls, options = {}) {
  const { includeImages = false } = options;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  if (includeImages) {
    xml += '\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
  }

  xml += '>\n';

  urls.forEach(url => {
    xml += generateUrlEntry(url);
  });

  xml += '</urlset>';

  return xml;
}

// Generate sitemap index
function generateSitemapIndex(sitemaps) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${escapeXml(sitemap.loc)}</loc>\n`;
    if (sitemap.lastmod) {
      xml += `    <lastmod>${formatDate(sitemap.lastmod)}</lastmod>\n`;
    }
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>';

  return xml;
}

// Write sitemap to file
function writeSitemap(filename, content, compress = false) {
  const outputPath = path.join(CONFIG.outputDir, filename);

  // Write uncompressed
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✓ Generated: ${filename}`);

  // Write compressed version
  if (compress) {
    const gzPath = `${outputPath}.gz`;
    const compressed = zlib.gzipSync(content);
    fs.writeFileSync(gzPath, compressed);
    console.log(`✓ Compressed: ${filename}.gz`);
  }
}

// Fetch static pages
async function fetchStaticPages() {
  // In real application, read from file system or CMS
  return [
    {
      loc: `${CONFIG.hostname}/`,
      lastmod: new Date(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${CONFIG.hostname}/about`,
      lastmod: new Date('2025-01-10'),
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${CONFIG.hostname}/contact`,
      lastmod: new Date('2025-01-10'),
      changefreq: 'monthly',
      priority: 0.6,
    },
  ];
}

// Fetch blog posts
async function fetchBlogPosts() {
  // In real application, query database or CMS
  return [
    {
      loc: `${CONFIG.hostname}/blog/seo-guide-2025`,
      lastmod: new Date('2025-01-15'),
      changefreq: 'weekly',
      priority: 0.8,
      images: [
        {
          url: `${CONFIG.hostname}/images/seo-guide-hero.jpg`,
          title: 'SEO Guide 2025',
          caption: 'Complete guide to SEO optimization',
        },
      ],
    },
    {
      loc: `${CONFIG.hostname}/blog/meta-tags-explained`,
      lastmod: new Date('2025-01-12'),
      changefreq: 'weekly',
      priority: 0.8,
      images: [
        {
          url: `${CONFIG.hostname}/images/meta-tags.jpg`,
          title: 'Meta Tags Explained',
        },
      ],
    },
    {
      loc: `${CONFIG.hostname}/blog/structured-data-tutorial`,
      lastmod: new Date('2025-01-08'),
      changefreq: 'weekly',
      priority: 0.8,
    },
  ];
}

// Fetch products
async function fetchProducts() {
  // In real application, query database
  return [
    {
      loc: `${CONFIG.hostname}/products/wireless-headphones`,
      lastmod: new Date('2025-01-20'),
      changefreq: 'daily',
      priority: 0.9,
      images: [
        {
          url: `${CONFIG.hostname}/products/headphones-1.jpg`,
          title: 'Wireless Headphones - Front View',
        },
        {
          url: `${CONFIG.hostname}/products/headphones-2.jpg`,
          title: 'Wireless Headphones - Side View',
        },
      ],
    },
    {
      loc: `${CONFIG.hostname}/products/bluetooth-speaker`,
      lastmod: new Date('2025-01-18'),
      changefreq: 'daily',
      priority: 0.9,
    },
  ];
}

// Split URLs into chunks (max 50,000 per sitemap)
function chunkUrls(urls, chunkSize = 50000) {
  const chunks = [];
  for (let i = 0; i < urls.length; i += chunkSize) {
    chunks.push(urls.slice(i, i + chunkSize));
  }
  return chunks;
}

// Main function
async function generateSitemaps() {
  console.log('Generating sitemaps...\n');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Fetch all content
  const staticPages = await fetchStaticPages();
  const blogPosts = await fetchBlogPosts();
  const products = await fetchProducts();

  const sitemapFiles = [];

  // Generate pages sitemap
  const pagesXml = generateSitemap(staticPages);
  writeSitemap('sitemap-pages.xml', pagesXml, CONFIG.compress);
  sitemapFiles.push({
    loc: `${CONFIG.hostname}/sitemap-pages.xml`,
    lastmod: new Date(),
  });

  // Generate blog sitemap (with images)
  const blogXml = generateSitemap(blogPosts, { includeImages: true });
  writeSitemap('sitemap-blog.xml', blogXml, CONFIG.compress);
  sitemapFiles.push({
    loc: `${CONFIG.hostname}/sitemap-blog.xml`,
    lastmod: new Date(),
  });

  // Generate products sitemap (with images)
  const productsXml = generateSitemap(products, { includeImages: true });
  writeSitemap('sitemap-products.xml', productsXml, CONFIG.compress);
  sitemapFiles.push({
    loc: `${CONFIG.hostname}/sitemap-products.xml`,
    lastmod: new Date(),
  });

  // Generate sitemap index
  const indexXml = generateSitemapIndex(sitemapFiles);
  writeSitemap('sitemap.xml', indexXml, CONFIG.compress);

  console.log('\n✓ All sitemaps generated successfully!');
  console.log(`\nSubmit to search engines:`);
  console.log(`- ${CONFIG.hostname}/sitemap.xml`);
  console.log(`\nAdd to robots.txt:`);
  console.log(`Sitemap: ${CONFIG.hostname}/sitemap.xml`);
}

// Handle large sitemaps (example)
async function generateLargeSitemap() {
  console.log('Generating large sitemap with chunking...\n');

  // Simulate large number of URLs
  const urls = [];
  for (let i = 1; i <= 100000; i++) {
    urls.push({
      loc: `${CONFIG.hostname}/page-${i}`,
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 0.5,
    });
  }

  // Split into chunks
  const chunks = chunkUrls(urls);
  const sitemapFiles = [];

  // Generate sitemap for each chunk
  chunks.forEach((chunk, index) => {
    const filename = `sitemap-${index + 1}.xml`;
    const xml = generateSitemap(chunk);
    writeSitemap(filename, xml, CONFIG.compress);

    sitemapFiles.push({
      loc: `${CONFIG.hostname}/${filename}`,
      lastmod: new Date(),
    });
  });

  // Generate index
  const indexXml = generateSitemapIndex(sitemapFiles);
  writeSitemap('sitemap.xml', indexXml, CONFIG.compress);

  console.log(`\n✓ Generated ${chunks.length} sitemaps with ${urls.length} total URLs`);
}

// Run generator
if (require.main === module) {
  generateSitemaps().catch(console.error);

  // Uncomment to test large sitemap generation
  // generateLargeSitemap().catch(console.error);
}

// Export for use as module
module.exports = {
  generateSitemap,
  generateSitemapIndex,
  generateSitemaps,
  escapeXml,
  formatDate,
};
