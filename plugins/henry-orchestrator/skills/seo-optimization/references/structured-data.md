# Structured Data (JSON-LD) Reference

This reference provides comprehensive guidance for implementing structured data using JSON-LD to enhance search engine understanding and enable rich results.

## What is Structured Data?

Structured data is standardized format for providing information about a page and classifying page content. Using vocabulary from Schema.org, search engines can better understand page context and display rich results in search.

### Why JSON-LD?

JSON-LD (JavaScript Object Notation for Linked Data) is the recommended format by Google for several reasons:

- Easy to add and maintain
- Doesn't affect page rendering
- Separate from HTML markup
- Easy to generate dynamically
- Simple validation

**Alternatives (less recommended):**

- Microdata - Inline with HTML
- RDFa - Inline with HTML attributes

## Basic JSON-LD Structure

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TypeName",
    "property": "value"
  }
</script>
```

Place in `<head>` or `<body>` of HTML document.

## Common Schema Types

### Article

For blog posts, news articles, and long-form content.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Complete SEO Guide for Web Developers",
  "description": "Learn essential SEO techniques including meta tags, structured data, and more.",
  "image": "https://example.com/images/seo-guide.jpg",
  "author": {
    "@type": "Person",
    "name": "John Doe",
    "url": "https://example.com/authors/john-doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Publisher",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2025-01-15T08:00:00+00:00",
  "dateModified": "2025-01-20T10:30:00+00:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/seo-guide"
  }
}
```

**Required properties:**

- headline
- image (array or single object)
- datePublished
- author

**Recommended properties:**

- dateModified
- publisher
- description

### BlogPosting

Specific type of Article for blog posts.

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "10 SEO Tips for 2025",
  "image": [
    "https://example.com/images/seo-tips-1x1.jpg",
    "https://example.com/images/seo-tips-4x3.jpg",
    "https://example.com/images/seo-tips-16x9.jpg"
  ],
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "url": "https://example.com/authors/jane-smith",
    "image": "https://example.com/authors/jane-smith.jpg"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SEO Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-20",
  "description": "Discover the top SEO strategies to improve your rankings in 2025.",
  "keywords": "SEO, search optimization, rankings, 2025",
  "articleSection": "SEO Guides",
  "wordCount": 2500
}
```

### Product

For e-commerce product pages.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Bluetooth Headphones",
  "image": [
    "https://example.com/products/headphones-1.jpg",
    "https://example.com/products/headphones-2.jpg"
  ],
  "description": "High-quality wireless headphones with noise cancellation.",
  "sku": "WBH-12345",
  "mpn": "925872",
  "brand": {
    "@type": "Brand",
    "name": "AudioTech"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/headphones",
    "priceCurrency": "USD",
    "price": 149.99,
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Example Store"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 287
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 5,
        "bestRating": 5
      },
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "reviewBody": "Excellent sound quality and comfortable to wear."
    }
  ]
}
```

**Availability values:**

- `https://schema.org/InStock`
- `https://schema.org/OutOfStock`
- `https://schema.org/PreOrder`
- `https://schema.org/LimitedAvailability`
- `https://schema.org/OnlineOnly`

### Organization

For company/organization information.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Leading provider of web solutions.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "Customer Service",
    "email": "support@example.com",
    "availableLanguage": ["English", "Spanish"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.facebook.com/example",
    "https://www.twitter.com/example",
    "https://www.linkedin.com/company/example",
    "https://www.instagram.com/example"
  ],
  "founder": {
    "@type": "Person",
    "name": "John Founder"
  },
  "foundingDate": "2010-01-15"
}
```

### Person

For author profiles, team members, or individual pages.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "John Doe",
  "url": "https://example.com/about/john-doe",
  "image": "https://example.com/images/john-doe.jpg",
  "jobTitle": "Senior SEO Specialist",
  "worksFor": {
    "@type": "Organization",
    "name": "Example Company"
  },
  "email": "john@example.com",
  "telephone": "+1-555-987-6543",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "addressCountry": "US"
  },
  "sameAs": ["https://twitter.com/johndoe", "https://linkedin.com/in/johndoe"],
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "Stanford University"
  },
  "description": "SEO expert with 10 years of experience helping businesses improve their search rankings."
}
```

### BreadcrumbList

For navigation hierarchy, helps search engines understand site structure.

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
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "SEO Guides",
      "item": "https://example.com/blog/seo-guides"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Complete SEO Guide",
      "item": "https://example.com/blog/seo-guides/complete-seo-guide"
    }
  ]
}
```

### FAQPage

For FAQ pages, enables FAQ rich results in search.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO (Search Engine Optimization) is the practice of optimizing websites to improve their visibility in search engine results pages (SERPs). It involves technical optimization, content creation, and building authority through backlinks."
      }
    },
    {
      "@type": "Question",
      "name": "How long does SEO take to work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO typically takes 3-6 months to show significant results, though this varies based on competition, site authority, and the optimization techniques used. Some improvements may be seen sooner, while competitive keywords may take longer."
      }
    },
    {
      "@type": "Question",
      "name": "What is structured data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Structured data is code that helps search engines understand page content. Using formats like JSON-LD, it provides explicit clues about the meaning of a page, enabling rich results and enhanced search appearances."
      }
    }
  ]
}
```

**Best practices:**

- Include 5-10 questions per page
- Provide complete, helpful answers
- Use natural language
- Don't use for advertising or harmful content

### HowTo

For step-by-step guides and tutorials.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Optimize Images for SEO",
  "description": "Step-by-step guide to optimizing images for better SEO performance.",
  "image": "https://example.com/images/image-optimization.jpg",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Image compression tool"
    }
  ],
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Images to optimize"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Resize Images",
      "text": "Resize images to appropriate dimensions for web use. Avoid uploading images larger than needed.",
      "image": "https://example.com/images/step1.jpg",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Compress Images",
      "text": "Use image compression tools to reduce file size without sacrificing quality. Aim for under 100KB per image.",
      "image": "https://example.com/images/step2.jpg",
      "url": "https://example.com/guide#step2"
    },
    {
      "@type": "HowToStep",
      "name": "Add Alt Text",
      "text": "Include descriptive alt text for all images to improve accessibility and SEO.",
      "image": "https://example.com/images/step3.jpg",
      "url": "https://example.com/guide#step3"
    }
  ]
}
```

**Time format:** Use ISO 8601 duration format (PT30M = 30 minutes, PT2H = 2 hours)

### Recipe

For cooking recipes, enables recipe rich results.

```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Chocolate Chip Cookies",
  "image": [
    "https://example.com/recipes/cookies-1x1.jpg",
    "https://example.com/recipes/cookies-4x3.jpg",
    "https://example.com/recipes/cookies-16x9.jpg"
  ],
  "author": {
    "@type": "Person",
    "name": "Mary Baker"
  },
  "datePublished": "2025-01-15",
  "description": "Classic chocolate chip cookies with a crispy edge and chewy center.",
  "prepTime": "PT20M",
  "cookTime": "PT15M",
  "totalTime": "PT35M",
  "keywords": "chocolate chip cookies, dessert, baking",
  "recipeYield": "24 cookies",
  "recipeCategory": "Dessert",
  "recipeCuisine": "American",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "150 calories",
    "carbohydrateContent": "20g",
    "proteinContent": "2g",
    "fatContent": "7g"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "ratingCount": 324
  },
  "recipeIngredient": [
    "2 cups all-purpose flour",
    "1 cup butter, softened",
    "3/4 cup granulated sugar",
    "2 large eggs",
    "2 cups chocolate chips"
  ],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "text": "Preheat oven to 375°F (190°C)."
    },
    {
      "@type": "HowToStep",
      "text": "Cream together butter and sugar until fluffy."
    },
    {
      "@type": "HowToStep",
      "text": "Beat in eggs one at a time."
    },
    {
      "@type": "HowToStep",
      "text": "Mix in flour, then fold in chocolate chips."
    },
    {
      "@type": "HowToStep",
      "text": "Drop spoonfuls onto baking sheet and bake for 12-15 minutes."
    }
  ]
}
```

### Event

For concerts, conferences, webinars, and other events.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "SEO Conference 2025",
  "description": "Annual conference for SEO professionals featuring industry experts and workshops.",
  "image": "https://example.com/events/seo-conf-2025.jpg",
  "startDate": "2025-06-15T09:00:00-07:00",
  "endDate": "2025-06-17T17:00:00-07:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Convention Center",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Convention Way",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94102",
      "addressCountry": "US"
    }
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/events/seo-conf-2025/tickets",
    "price": 299,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-01-15"
  },
  "organizer": {
    "@type": "Organization",
    "name": "SEO Institute",
    "url": "https://example.com"
  },
  "performer": {
    "@type": "Person",
    "name": "Keynote Speaker Name"
  }
}
```

**eventAttendanceMode values:**

- `OfflineEventAttendanceMode` - In-person only
- `OnlineEventAttendanceMode` - Virtual only
- `MixedEventAttendanceMode` - Hybrid event

**For virtual events:**

```json
{
  "@type": "Event",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://example.com/webinar-link"
  }
}
```

### LocalBusiness

For physical business locations.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Example Coffee Shop",
  "image": "https://example.com/coffee-shop.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "url": "https://example.com",
  "telephone": "+1-555-234-5678",
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.6,
    "reviewCount": 142
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Alice Smith"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 5
      },
      "reviewBody": "Great coffee and friendly staff!"
    }
  ]
}
```

**Specific business types:**

- Restaurant
- Hotel
- Store
- MedicalBusiness
- AutoDealer
- etc.

### VideoObject

For video content.

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "SEO Tips for Beginners",
  "description": "Learn the basics of SEO in this comprehensive tutorial.",
  "thumbnailUrl": "https://example.com/videos/seo-tips-thumbnail.jpg",
  "uploadDate": "2025-01-15T08:00:00Z",
  "duration": "PT10M30S",
  "contentUrl": "https://example.com/videos/seo-tips.mp4",
  "embedUrl": "https://example.com/embed/seo-tips",
  "publisher": {
    "@type": "Organization",
    "name": "SEO Academy",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

### WebSite

For site-wide search functionality.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example Website",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

Enables sitelinks search box in Google search results.

## Multiple Schemas on One Page

Combine multiple schemas using an array:

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete SEO Guide"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example Company"
  }
]
```

Or use `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Complete SEO Guide"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [...]
    }
  ]
}
```

## Dynamic Implementation

### Next.js

```jsx
import Head from 'next/head';

export default function BlogPost({ post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage,
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
```

### React Component

```jsx
export function StructuredData({ data }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

// Usage
<StructuredData data={productSchema} />;
```

### Vue/Nuxt

```vue
<script>
export default {
  head() {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: this.post.title,
    };

    return {
      script: [
        {
          type: 'application/ld+json',
          json: jsonLd,
        },
      ],
    };
  },
};
</script>
```

## Validation and Testing

### Google Rich Results Test

https://search.google.com/test/rich-results

- Paste URL or code
- See eligible rich results
- View errors and warnings
- Test different schema types

### Schema Markup Validator

https://validator.schema.org/

- Validates JSON-LD syntax
- Checks schema.org compliance
- Shows structured data hierarchy
- Identifies missing required properties

### Google Search Console

Monitor structured data in production:

- Navigate to Enhancements section
- View detected schema types
- See errors and valid items
- Track rich result performance

## Best Practices

✅ **DO:**

- Use JSON-LD format (recommended by Google)
- Include all required properties for schema type
- Provide accurate, up-to-date information
- Match visible page content
- Validate before deployment
- Use specific schema types when available
- Include multiple images in different aspect ratios
- Use ISO 8601 format for dates and durations

❌ **DON'T:**

- Include content not visible on page
- Use structured data for deceptive purposes
- Violate Google's structured data guidelines
- Include personally identifiable information inappropriately
- Use irrelevant schema types
- Duplicate schemas on same page
- Forget to update when content changes
- Use outdated schema properties

## Common Mistakes

### Missing Required Properties

Each schema type has required properties. Missing them prevents rich results.

**Check documentation:**

- https://schema.org/Article
- https://developers.google.com/search/docs/appearance/structured-data

### Content Mismatch

Structured data must match visible page content. Don't add data not present on page.

### Invalid Date Format

Use ISO 8601 format:

- `2025-01-15` (date only)
- `2025-01-15T08:00:00+00:00` (date and time with timezone)
- `PT30M` (duration: 30 minutes)

### Image Requirements Not Met

Different rich results require specific image formats:

- Article: 1200px wide minimum, 16:9, 4:3, or 1:1 aspect ratio
- Product: High resolution, multiple views
- Recipe: Final dish photo

## Resources

- **Schema.org** - https://schema.org/ - Official vocabulary reference
- **Google Search Central** - https://developers.google.com/search/docs/appearance/structured-data
- **Rich Results Test** - https://search.google.com/test/rich-results
- **Structured Data Markup Helper** - https://www.google.com/webmasters/markup-helper/
