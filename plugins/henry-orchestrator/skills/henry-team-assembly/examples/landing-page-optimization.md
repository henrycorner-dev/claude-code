# Example: Landing Page Optimization

This example demonstrates assembling a team to optimize a landing page for SEO, performance, and implementation quality.

## Scenario

**Project**: Optimize marketing landing page
**Tech Stack**: Next.js, React, Tailwind CSS
**Current Issues**: Poor Core Web Vitals, missing SEO metadata, suboptimal images
**Goal**: Achieve 90+ Lighthouse scores, rank on page 1 for target keywords

## Team Assembly

### Selected Agents

```
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer - Optimize landing page
```

**Team Composition Rationale:**

1. **seo-specialist**
   - **Expertise**: Technical SEO, structured data, on-page optimization, keyword research
   - **Responsibilities**: SEO audit, metadata optimization, structured data implementation
   - **Deliverables**: SEO recommendations, keyword strategy, structured data schema

2. **frontend-engineer**
   - **Expertise**: React, Next.js, responsive design, accessibility
   - **Responsibilities**: Implement optimizations, refactor components, ensure accessibility
   - **Deliverables**: Optimized code, responsive layouts, accessible markup

3. **performance-engineer**
   - **Expertise**: Core Web Vitals, image optimization, bundle analysis, caching
   - **Responsibilities**: Performance audit, optimization recommendations, benchmark testing
   - **Deliverables**: Performance baseline, optimization plan, target metrics

**Team Size**: 3 agents (small team)
**Execution Mode**: Sequential with parallel phases

## Expected Workflow

### Phase 1: Parallel Audit (1-2 hours)

All three agents audit the current landing page:

**SEO Specialist audits:**

- Meta tags (title, description, Open Graph)
- Heading structure (H1, H2, etc.)
- Internal linking
- Structured data (JSON-LD)
- Mobile-friendliness
- Canonical URLs
- XML sitemap

**Frontend Engineer audits:**

- Component structure and reusability
- Accessibility (ARIA, semantic HTML)
- Responsive design implementation
- Image formats and sizing
- Third-party script usage
- CSS/JS bundle sizes

**Performance Engineer audits:**

- Core Web Vitals (LCP, FID, CLS)
- Time to First Byte (TTFB)
- Image loading and optimization
- JavaScript execution time
- Resource prioritization
- Caching strategy
- Bundle size and code splitting

### Phase 2: Synthesis and Planning (1 hour)

**Identify Overlapping Concerns:**

**Image Optimization** (all three agents flagged):

- SEO: Images missing alt text, affecting accessibility score
- Frontend: Using PNG instead of WebP, not responsive
- Performance: Largest Contentful Paint (LCP) delayed by large hero image

**Resolution**:

- Convert to WebP with fallbacks
- Implement responsive images with srcset
- Add descriptive alt text for SEO and a11y
- Lazy load below-fold images
- Preload hero image with fetchpriority="high"

**Third-Party Scripts** (SEO + Performance flagged):

- SEO: Google Analytics blocking render
- Performance: Third-party scripts delaying First Input Delay (FID)

**Resolution**:

- Load analytics with `async` attribute
- Use Partytown to run in web worker
- Implement consent management for GDPR

**Mobile Experience** (all three flagged):

- SEO: Mobile-friendliness issues
- Frontend: Viewport not optimized, touch targets too small
- Performance: CLS from responsive layout shifts

**Resolution**:

- Fix viewport meta tag
- Increase touch target sizes (min 48x48px)
- Reserve space for images to prevent CLS
- Test on real devices

### Phase 3: Implementation (2-3 hours)

**Frontend Engineer implements** (with input from others):

```typescript
// Before
<img src="/hero.png" width="800" height="600" />

// After - incorporates all three agent recommendations
<Image
  src="/hero.webp"
  alt="Professional team collaborating on innovative solutions" // SEO
  width={800}
  height={600}
  priority // Performance - preload LCP image
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" // Frontend - responsive
  placeholder="blur" // Performance - prevent CLS
  blurDataURL="data:image/..." // Performance
/>
```

**SEO Specialist provides:**

```typescript
// Structured data for landing page
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Professional Services - Acme Corp',
  description: 'Transform your business with our expert consulting services...',
  url: 'https://acme.com/services',
  mainEntity: {
    '@type': 'Service',
    name: 'Business Consulting',
    provider: {
      '@type': 'Organization',
      name: 'Acme Corp',
    },
  },
};
```

**Performance Engineer specifies:**

```typescript
// Next.js config optimizations
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### Phase 4: Validation (1 hour)

**SEO Specialist validates:**

- Run Google Rich Results Test
- Check Search Console for errors
- Validate structured data
- Test mobile-friendliness
- Verify meta tags in source

**Performance Engineer validates:**

- Run Lighthouse audits
- Measure Core Web Vitals in field
- Check bundle sizes
- Test on slow 3G connection
- Verify caching headers

**Frontend Engineer validates:**

- Cross-browser testing
- Responsive design on multiple devices
- Accessibility audit (WAVE, axe)
- Visual regression testing
- Component functionality

## Results

### Before Optimization

- **Lighthouse Performance**: 62
- **Lighthouse SEO**: 78
- **Lighthouse Accessibility**: 85
- **LCP**: 4.2s
- **FID**: 180ms
- **CLS**: 0.25
- **Search Ranking**: Page 3 for target keywords

### After Optimization

- **Lighthouse Performance**: 94 ✅
- **Lighthouse SEO**: 100 ✅
- **Lighthouse Accessibility**: 98 ✅
- **LCP**: 1.8s ✅ (target: < 2.5s)
- **FID**: 45ms ✅ (target: < 100ms)
- **CLS**: 0.05 ✅ (target: < 0.1)
- **Search Ranking**: Page 1 for 3 target keywords 🎉

## Conflict Resolution Example

### Scenario: Animation vs. Performance

**Frontend Engineer Proposal:**
"Add smooth scroll animations and parallax effects for better UX"

**Performance Engineer Concern:**
"Animations can cause layout shifts (CLS) and JavaScript execution delays (FID)"

**SEO Specialist Input:**
"Animations don't affect SEO directly, but poor UX metrics (bounce rate) can hurt rankings"

**Resolution:**
Implement performance-friendly animations:

- Use CSS transforms (translateX/Y, scale, opacity) instead of animating layout properties
- Use `will-change` sparingly and remove after animation
- Implement Intersection Observer for scroll-triggered animations
- Use `prefers-reduced-motion` media query for accessibility
- Test impact on Core Web Vitals

```css
/* Performance-friendly animation */
@media (prefers-reduced-motion: no-preference) {
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px); /* Transform, not margin/top */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Outcome**: Enhanced UX without sacrificing performance or SEO.

## Success Metrics

**SEO Metrics:**

- ✅ Lighthouse SEO score: 100
- ✅ All meta tags present and optimized
- ✅ Structured data validated
- ✅ Mobile-friendly test passed
- 🎯 Target: Page 1 ranking within 3 months

**Performance Metrics:**

- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Lighthouse Performance > 90
- ✅ Image formats: WebP/AVIF
- ✅ Bundle size reduced by 40%

**User Experience Metrics:**

- ✅ Accessibility score > 95
- ✅ Zero critical a11y issues
- ✅ Responsive on all tested devices
- 🎯 Target: Bounce rate < 40%

## Command Usage

```bash
# Step 1: Initial audit
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer - Audit landing page at /pages/index.tsx

# Step 2: All agents receive context
"Please audit our landing page at /pages/index.tsx. We need to improve:
- SEO for keywords: 'professional consulting services', 'business transformation'
- Core Web Vitals (currently failing)
- Overall page quality

Current Lighthouse scores: Performance 62, SEO 78, Accessibility 85"

# Step 3: Agents work in parallel (audit phase)
# Each produces their specialized audit

# Step 4: Synthesis
# Identify overlapping issues (images, third-party scripts)
# Create unified optimization plan

# Step 5: Implementation (sequential)
# Frontend engineer implements with guidance from other agents

# Step 6: Validation (parallel)
# All agents validate their respective areas
```

## Key Takeaways

1. **Multi-discipline optimization**: SEO, performance, and implementation quality are interdependent
2. **Overlapping concerns**: Image optimization affected all three areas - team collaboration prevented siloed solutions
3. **Sequential implementation after parallel planning**: Audit in parallel, plan together, implement sequentially
4. **Measurable results**: Clear before/after metrics demonstrate value
5. **User-centric**: Optimizations improve both search rankings and user experience

## Variations

### Add UX/UI Designer (4 agents)

```
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer ux-ui-designer - Redesign and optimize landing page
```

Use when: Page needs visual/UX redesign in addition to technical optimization

### Add A11y Specialist (4 agents)

```
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer a11y-specialist - Optimize with accessibility focus
```

Use when: Accessibility is critical (public sector, inclusive product)

### Minimal Team (2 agents)

```
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Quick performance optimization
```

Use when: SEO is already good, focus purely on technical performance

## Related Examples

- See `examples/authentication-review.md` for security-focused team coordination
- See `examples/mobile-app-feature.md` for product development team
- See `references/conflict-resolution.md` for handling agent disagreements
