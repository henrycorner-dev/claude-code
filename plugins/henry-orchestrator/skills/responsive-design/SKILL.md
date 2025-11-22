---
name: responsive-design
description: This skill should be used when the user asks to "make responsive", "add mobile support", "create mobile-first design", "add media queries", "use Tailwind for responsive", "implement Bootstrap grid", "add accessibility", "implement ARIA", "make WCAG compliant", or mentions responsive web design, mobile-first CSS, accessibility standards, or adaptive layouts.
version: 0.1.0
---

# Responsive Design Skill

## Purpose

This skill provides guidance for implementing responsive web design using mobile-first CSS approaches, modern frameworks like Tailwind CSS and Bootstrap, media queries, and accessibility standards including ARIA and WCAG compliance. The goal is to create adaptive, accessible web interfaces that work seamlessly across devices and meet modern web standards.

## When to Use This Skill

Load this skill when implementing:
- Mobile-first responsive layouts
- Framework-based responsive designs (Tailwind CSS, Bootstrap)
- Custom media queries and breakpoints
- Accessibility features (ARIA attributes, WCAG compliance)
- Adaptive navigation patterns
- Responsive typography and spacing
- Touch-friendly interfaces

## Core Concepts

### Mobile-First Approach

Start with mobile designs and progressively enhance for larger screens:

1. **Base styles**: Design for smallest screen first (320px-480px)
2. **Progressive enhancement**: Add complexity for larger viewports
3. **Content priority**: Ensure critical content is accessible on all devices
4. **Performance**: Lighter styles load first, enhanced features load conditionally

Benefits:
- Faster mobile performance
- Forces content prioritization
- Easier to enhance than reduce
- Better user experience on constrained devices

### Responsive Frameworks

#### Tailwind CSS

Utility-first framework with built-in responsive modifiers:

**Breakpoints:**
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up
- `2xl:` - 1536px and up

**Pattern:**
```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Mobile: full width, Tablet: half, Desktop: third -->
</div>
```

#### Bootstrap

Component-based framework with grid system:

**Breakpoints:**
- `xs` - <576px (default)
- `sm` - ≥576px
- `md` - ≥768px
- `lg` - ≥992px
- `xl` - ≥1200px
- `xxl` - ≥1400px

**Pattern:**
```html
<div class="col-12 col-md-6 col-lg-4">
  <!-- Mobile: full width, Tablet: half, Desktop: third -->
</div>
```

### Media Queries

Custom breakpoints for specific design needs:

**Standard breakpoints:**
- Mobile: 320px - 480px
- Tablet: 481px - 768px
- Laptop: 769px - 1024px
- Desktop: 1025px - 1200px
- Large screens: 1201px+

**Common patterns:**
```css
/* Mobile-first base styles */
.element {
  width: 100%;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .element {
    width: 50%;
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element {
    width: 33.333%;
    padding: 2rem;
  }
}
```

### Accessibility Fundamentals

#### ARIA (Accessible Rich Internet Applications)

Semantic attributes that enhance screen reader support:

**Key ARIA attributes:**
- `aria-label`: Accessible name for elements
- `aria-labelledby`: Reference to labeling element
- `aria-describedby`: Reference to description
- `aria-hidden`: Hide decorative elements from screen readers
- `aria-live`: Announce dynamic content changes
- `aria-expanded`: State for collapsible elements
- `role`: Define element purpose (navigation, button, etc.)

**Usage:**
```html
<button aria-label="Close dialog" aria-expanded="false">
  <span aria-hidden="true">×</span>
</button>
```

#### WCAG Compliance

Web Content Accessibility Guidelines ensure content is accessible to all users:

**WCAG 2.1 Levels:**
- **A**: Minimum accessibility (required)
- **AA**: Standard compliance (recommended)
- **AAA**: Enhanced accessibility (ideal)

**Key requirements:**
1. **Perceivable**: Content must be presentable to all users
2. **Operable**: Interface must be navigable by all input methods
3. **Understandable**: Content and operation must be clear
4. **Robust**: Content must work with assistive technologies

For detailed WCAG guidelines and testing procedures, consult `references/accessibility-guide.md`.

## Implementation Workflow

### 1. Choose Framework or Custom Approach

**Use Tailwind when:**
- Rapid prototyping needed
- Utility-first approach preferred
- Custom design system required
- Small to medium projects

**Use Bootstrap when:**
- Pre-built components needed
- Team familiar with Bootstrap
- Consistent UI patterns desired
- Quick MVP development

**Use custom CSS when:**
- Full control over styles required
- Minimal framework overhead desired
- Specific performance constraints
- Unique design requirements

### 2. Implement Mobile-First Layout

Start with base mobile styles:

```css
/* Base mobile styles */
.container {
  width: 100%;
  padding: 1rem;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet enhancement */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }

  .grid {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

/* Desktop enhancement */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 3. Add Responsive Typography

Scale text appropriately:

```css
/* Mobile base */
body {
  font-size: 16px;
  line-height: 1.5;
}

h1 {
  font-size: 1.75rem; /* 28px */
}

/* Tablet */
@media (min-width: 768px) {
  body {
    font-size: 18px;
  }

  h1 {
    font-size: 2.25rem; /* 36px */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  h1 {
    font-size: 3rem; /* 48px */
  }
}
```

### 4. Implement Touch-Friendly Interactions

Ensure interactive elements are accessible on touch devices:

**Minimum touch target: 44x44px (WCAG 2.1 AA)**

```css
button, a, input {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}

/* Hover states only on non-touch devices */
@media (hover: hover) {
  button:hover {
    background-color: #0056b3;
  }
}
```

### 5. Add Accessibility Features

Implement ARIA and semantic HTML:

```html
<!-- Navigation with ARIA -->
<nav role="navigation" aria-label="Main navigation">
  <button aria-expanded="false" aria-controls="menu">
    Menu
  </button>
  <ul id="menu" aria-hidden="true">
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
  </ul>
</nav>

<!-- Form with proper labels -->
<form>
  <label for="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-help"
  />
  <span id="email-help">We'll never share your email</span>
</form>
```

### 6. Test Across Devices and Assistive Technologies

**Testing checklist:**
- [ ] Mobile devices (320px, 375px, 414px widths)
- [ ] Tablets (768px, 1024px)
- [ ] Desktop (1280px, 1920px)
- [ ] Screen readers (NVDA, JAWS, VoiceOver)
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Color contrast (WCAG AA: 4.5:1 for text)
- [ ] Zoom (up to 200% without horizontal scroll)

## Common Patterns

### Responsive Navigation

Mobile menu that expands to horizontal nav:

```html
<!-- Tailwind approach -->
<nav class="flex flex-col md:flex-row md:items-center">
  <button class="md:hidden" aria-label="Toggle menu">Menu</button>
  <ul class="hidden md:flex md:space-x-4">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
  </ul>
</nav>
```

### Responsive Grid

```html
<!-- Tailwind grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Bootstrap grid -->
<div class="row g-4">
  <div class="col-12 col-sm-6 col-lg-4">Item 1</div>
  <div class="col-12 col-sm-6 col-lg-4">Item 2</div>
  <div class="col-12 col-sm-6 col-lg-4">Item 3</div>
</div>
```

### Responsive Images

```html
<!-- Responsive image with srcset -->
<img
  src="image-small.jpg"
  srcset="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Descriptive text"
/>

<!-- Tailwind responsive image -->
<img
  src="image.jpg"
  alt="Descriptive text"
  class="w-full md:w-1/2 lg:w-1/3 h-auto"
/>
```

## Additional Resources

### Reference Files

For detailed patterns, techniques, and compliance guidance:

- **`references/accessibility-guide.md`** - Comprehensive WCAG compliance guide, ARIA patterns, testing procedures, and common accessibility issues with solutions
- **`references/framework-patterns.md`** - Advanced Tailwind and Bootstrap patterns, custom breakpoint strategies, and framework-specific best practices

### Example Files

Working examples demonstrating responsive patterns:

- **`examples/responsive-landing-page.html`** - Complete mobile-first landing page with Tailwind CSS
- **`examples/accessible-navigation.html`** - ARIA-compliant navigation with keyboard support
- **`examples/custom-media-queries.css`** - Custom breakpoint system with advanced patterns

## Quick Reference

### Tailwind Responsive Syntax
```html
<div class="text-sm md:text-base lg:text-lg">
  Responsive text sizing
</div>
```

### Bootstrap Responsive Classes
```html
<div class="d-block d-md-flex">
  Block on mobile, flex on tablet+
</div>
```

### Media Query Template
```css
/* Mobile first */
.element { /* base styles */ }

@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

### ARIA Quick Reference
```html
<button aria-label="Close" aria-pressed="false">×</button>
<div role="alert" aria-live="polite">Status message</div>
<nav aria-label="Main navigation">Navigation</nav>
```

## Best Practices

✅ **DO:**
- Start with mobile styles, enhance for larger screens
- Use semantic HTML (nav, main, article, section)
- Provide text alternatives for images (alt text)
- Ensure 4.5:1 color contrast for text
- Make touch targets at least 44x44px
- Test with keyboard navigation
- Use ARIA only when semantic HTML isn't sufficient
- Test with actual screen readers

❌ **DON'T:**
- Design desktop-first then strip features for mobile
- Use fixed pixel widths for containers
- Rely only on color to convey information
- Use images of text instead of actual text
- Create custom controls without keyboard support
- Add ARIA to every element unnecessarily
- Forget to test on real devices
- Ignore browser developer tools' accessibility audits

## Implementation Notes

When implementing responsive designs:

1. **Framework selection matters**: Choose based on project needs, not popularity
2. **Performance is key**: Responsive doesn't mean bloated; optimize assets
3. **Accessibility is non-negotiable**: Build it in from the start, not retrofitted
4. **Test early and often**: Use browser dev tools, real devices, and assistive tech
5. **Content strategy**: Prioritize what users need on smaller screens
6. **Progressive enhancement**: Ensure core functionality works without JavaScript

Consult the reference files for advanced techniques, detailed compliance checklists, and framework-specific patterns that go beyond these core concepts.
