// Next.js page with comprehensive SEO implementation
// This example demonstrates meta tags, structured data, and SSG

import Head from 'next/head';

export default function BlogPost({ post }) {
  // Structured data for Article
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [
      post.featuredImage.url1x1,
      post.featuredImage.url4x3,
      post.featuredImage.url16x9,
    ],
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `https://example.com/authors/${post.author.slug}`,
      image: post.author.avatar,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Example Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
        width: 600,
        height: 60,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://example.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.wordCount,
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://example.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.category,
        item: `https://example.com/blog/category/${post.categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `https://example.com/blog/${post.slug}`,
      },
    ],
  };

  // Canonical URL
  const canonicalUrl = `https://example.com/blog/${post.slug}`;

  // Open Graph image with proper dimensions
  const ogImage = post.featuredImage.url16x9; // 1200x630 recommended

  return (
    <>
      <Head>
        {/* Character encoding */}
        <meta charSet="UTF-8" />

        {/* Primary Meta Tags */}
        <title>{post.title} | Example Blog</title>
        <meta name="title" content={`${post.title} | Example Blog`} />
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <meta name="author" content={post.author.name} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-image-preview:large" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Example Blog" />
        <meta property="og:locale" content="en_US" />

        {/* Article-specific Open Graph tags */}
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={post.title} />
        <meta name="twitter:site" content="@exampleblog" />
        <meta name="twitter:creator" content={`@${post.author.twitter}`} />

        {/* Structured Data - Article */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData),
          }}
        />

        {/* Structured Data - Breadcrumb */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />
      </Head>

      {/* Page Content */}
      <article>
        {/* Breadcrumb Navigation (matches structured data) */}
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href={`/blog/category/${post.categorySlug}`}>{post.category}</a></li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header>
          <h1>{post.title}</h1>
          <p className="excerpt">{post.excerpt}</p>

          <div className="meta">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span> by </span>
            <a href={`/authors/${post.author.slug}`}>{post.author.name}</a>
          </div>

          {/* Featured Image with alt text */}
          <img
            src={post.featuredImage.url16x9}
            alt={post.featuredImage.alt || post.title}
            width="1200"
            height="630"
            loading="eager" // Above fold, load immediately
          />
        </header>

        {/* Article Content */}
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Article Footer */}
        <footer>
          <div className="tags">
            {post.tags.map((tag) => (
              <a key={tag} href={`/blog/tag/${tag}`}>
                #{tag}
              </a>
            ))}
          </div>

          <div className="author-bio">
            <img
              src={post.author.avatar}
              alt={`${post.author.name} avatar`}
              width="80"
              height="80"
              loading="lazy"
            />
            <div>
              <h3>{post.author.name}</h3>
              <p>{post.author.bio}</p>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}

// Static Site Generation - Pre-render at build time
export async function getStaticProps({ params }) {
  // Fetch post data
  const post = await fetchPost(params.slug);

  // Return as props
  return {
    props: {
      post,
    },
    // Optional: Revalidate every 60 seconds (ISR)
    revalidate: 60,
  };
}

// Define which paths to pre-render
export async function getStaticPaths() {
  // Fetch all posts
  const posts = await fetchAllPosts();

  // Generate paths
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    // 'blocking' - SSR on-demand for new posts, then cache
    fallback: 'blocking',
  };
}

// Helper function to fetch post data
async function fetchPost(slug) {
  // In real application, fetch from CMS, database, or file system
  // This is a placeholder showing expected data structure
  return {
    slug: 'seo-guide-2025',
    title: 'Complete SEO Guide for 2025',
    excerpt: 'Learn essential SEO techniques to improve your search rankings in 2025.',
    content: '<p>Article content here...</p>',
    featuredImage: {
      url1x1: 'https://example.com/images/seo-guide-1x1.jpg',
      url4x3: 'https://example.com/images/seo-guide-4x3.jpg',
      url16x9: 'https://example.com/images/seo-guide-16x9.jpg',
      alt: 'SEO Guide illustration',
    },
    author: {
      name: 'John Doe',
      slug: 'john-doe',
      bio: 'SEO expert with 10 years of experience.',
      avatar: 'https://example.com/authors/john-doe.jpg',
      twitter: 'johndoe',
    },
    category: 'SEO',
    categorySlug: 'seo',
    tags: ['SEO', 'search optimization', 'rankings'],
    publishedAt: '2025-01-15T08:00:00+00:00',
    updatedAt: '2025-01-20T10:30:00+00:00',
    wordCount: 2500,
  };
}

async function fetchAllPosts() {
  // Fetch all posts for static path generation
  // In real application, query CMS or database
  return [
    { slug: 'seo-guide-2025' },
    { slug: 'meta-tags-explained' },
    { slug: 'structured-data-tutorial' },
    // ... more posts
  ];
}
