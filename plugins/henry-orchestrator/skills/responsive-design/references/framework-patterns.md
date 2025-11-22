# Framework Patterns - Tailwind CSS & Bootstrap

## Tailwind CSS Responsive Patterns

### Breakpoint System

Default breakpoints in Tailwind:

```js
module.exports = {
  theme: {
    screens: {
      sm: '640px', // Small devices (landscape phones)
      md: '768px', // Medium devices (tablets)
      lg: '1024px', // Large devices (laptops)
      xl: '1280px', // Extra large devices (desktops)
      '2xl': '1536px', // 2X large devices (large desktops)
    },
  },
};
```

### Custom Breakpoints

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      // Max-width breakpoints
      'max-md': { max: '767px' },
      // Range breakpoints
      tablet: { min: '768px', max: '1023px' },
    },
  },
};
```

### Layout Patterns

#### Responsive Grid

```html
<!-- Equal columns that stack on mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Auto-fit grid (no media queries needed) -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Asymmetric grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="md:col-span-2">Main content (2/3)</div>
  <div>Sidebar (1/3)</div>
</div>
```

#### Responsive Flexbox

```html
<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="md:w-2/3">Main</div>
  <div class="md:w-1/3">Sidebar</div>
</div>

<!-- Centered content with max width -->
<div class="flex justify-center">
  <div class="w-full max-w-7xl px-4 sm:px-6 lg:px-8">Content</div>
</div>

<!-- Responsive alignment -->
<div class="flex flex-col items-start md:flex-row md:items-center md:justify-between">
  <h1>Title</h1>
  <button>Action</button>
</div>
```

#### Responsive Container

```html
<!-- Responsive padding and max-width -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl">Content</div>
</div>

<!-- Custom container pattern -->
<div class="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4">Content</div>
```

### Typography Patterns

#### Responsive Font Sizes

```html
<!-- Progressive text sizing -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Heading</h1>

<p class="text-sm sm:text-base md:text-lg">Body text</p>

<!-- Responsive line height and letter spacing -->
<p class="text-base leading-relaxed sm:text-lg sm:leading-loose tracking-tight sm:tracking-normal">
  Paragraph text
</p>
```

#### Responsive Truncation

```html
<!-- Single line truncate -->
<p class="truncate">Long text that will be truncated with ellipsis...</p>

<!-- Multi-line clamp (requires @tailwindcss/line-clamp) -->
<p class="line-clamp-3 sm:line-clamp-none">
  Long text that shows 3 lines on mobile, full text on desktop...
</p>
```

### Spacing Patterns

#### Responsive Padding & Margin

```html
<!-- Progressive spacing -->
<div class="p-4 sm:p-6 md:p-8 lg:p-12">Content with responsive padding</div>

<section class="mb-8 sm:mb-12 md:mb-16 lg:mb-24">Section with responsive bottom margin</section>

<!-- Negative margins for full-width breakout -->
<div class="max-w-7xl mx-auto px-4">
  <img class="-mx-4 sm:mx-0 w-screen sm:w-full" src="image.jpg" alt="" />
</div>
```

#### Responsive Gaps

```html
<!-- Grid/flex gap -->
<div class="flex gap-2 sm:gap-4 md:gap-6 lg:gap-8">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="space-y-4 sm:space-y-6 md:space-y-8">
  <div>Block 1</div>
  <div>Block 2</div>
</div>
```

### Component Patterns

#### Responsive Navigation

```html
<!-- Mobile menu with hamburger -->
<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <img class="h-8 w-auto" src="logo.svg" alt="Logo" />
      </div>

      <!-- Desktop menu -->
      <div class="hidden md:flex md:items-center md:space-x-8">
        <a href="#" class="text-gray-700 hover:text-gray-900">Home</a>
        <a href="#" class="text-gray-700 hover:text-gray-900">About</a>
        <a href="#" class="text-gray-700 hover:text-gray-900">Contact</a>
      </div>

      <!-- Mobile menu button -->
      <button class="md:hidden inline-flex items-center justify-center p-2" aria-expanded="false">
        <span class="sr-only">Open menu</span>
        <!-- Icon -->
      </button>
    </div>
  </div>

  <!-- Mobile menu panel -->
  <div class="md:hidden" id="mobile-menu">
    <div class="px-2 pt-2 pb-3 space-y-1">
      <a href="#" class="block px-3 py-2 text-gray-700">Home</a>
      <a href="#" class="block px-3 py-2 text-gray-700">About</a>
      <a href="#" class="block px-3 py-2 text-gray-700">Contact</a>
    </div>
  </div>
</nav>
```

#### Responsive Card Grid

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <img class="w-full h-48 object-cover" src="image.jpg" alt="" />
    <div class="p-4 sm:p-6">
      <h3 class="text-lg sm:text-xl font-semibold mb-2">Card Title</h3>
      <p class="text-sm sm:text-base text-gray-600">Card description</p>
      <button class="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded">Action</button>
    </div>
  </div>
</div>
```

#### Responsive Hero Section

```html
<section class="relative bg-gray-900 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <!-- Text content -->
      <div class="text-center lg:text-left">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
          Hero Title
        </h1>
        <p class="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">Hero description text</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button class="px-6 py-3 bg-blue-600 rounded-lg">Primary CTA</button>
          <button class="px-6 py-3 border border-white rounded-lg">Secondary</button>
        </div>
      </div>

      <!-- Image -->
      <div class="order-first lg:order-last">
        <img class="w-full h-auto rounded-lg shadow-2xl" src="hero.jpg" alt="" />
      </div>
    </div>
  </div>
</section>
```

#### Responsive Form

```html
<form class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
    <!-- Full width field -->
    <div class="sm:col-span-2">
      <label class="block text-sm font-medium mb-2">Email</label>
      <input type="email" class="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg" />
    </div>

    <!-- Half width fields on desktop -->
    <div>
      <label class="block text-sm font-medium mb-2">First Name</label>
      <input type="text" class="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg" />
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">Last Name</label>
      <input type="text" class="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg" />
    </div>

    <!-- Textarea -->
    <div class="sm:col-span-2">
      <label class="block text-sm font-medium mb-2">Message</label>
      <textarea rows="4" class="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg"></textarea>
    </div>

    <!-- Submit button -->
    <div class="sm:col-span-2">
      <button class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg">Submit</button>
    </div>
  </div>
</form>
```

### Advanced Patterns

#### Responsive Images with Aspect Ratio

```html
<!-- Fixed aspect ratio -->
<div class="aspect-w-16 aspect-h-9">
  <img class="object-cover" src="image.jpg" alt="" />
</div>

<!-- Responsive aspect ratio -->
<div class="aspect-square sm:aspect-video lg:aspect-[4/3]">
  <img class="object-cover" src="image.jpg" alt="" />
</div>
```

#### Show/Hide Content

```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop only content</div>

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">Mobile only content</div>

<!-- Complex visibility -->
<div class="block sm:hidden lg:block xl:hidden">Visible on mobile and large screens only</div>
```

#### Responsive Columns with Prose

```html
<!-- Single column on mobile, 2 columns on desktop -->
<div class="prose max-w-none columns-1 md:columns-2 lg:columns-3 gap-8">
  <p>Content that flows across columns...</p>
</div>
```

## Bootstrap Responsive Patterns

### Breakpoint System

Bootstrap 5 breakpoints:

```scss
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
);
```

### Grid System

#### Basic Grid

```html
<!-- Equal columns -->
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">Column 1</div>
    <div class="col-12 col-md-6 col-lg-4">Column 2</div>
    <div class="col-12 col-md-12 col-lg-4">Column 3</div>
  </div>
</div>

<!-- Auto-layout columns -->
<div class="row">
  <div class="col">Equal width</div>
  <div class="col">Equal width</div>
  <div class="col">Equal width</div>
</div>

<!-- Variable width -->
<div class="row">
  <div class="col-md-8">Main content</div>
  <div class="col-md-4">Sidebar</div>
</div>
```

#### Grid with Gutters

```html
<!-- Default gutters -->
<div class="row g-3">
  <div class="col-6">Item</div>
  <div class="col-6">Item</div>
</div>

<!-- Responsive gutters -->
<div class="row g-2 g-md-3 g-lg-4">
  <div class="col-6">Item</div>
  <div class="col-6">Item</div>
</div>

<!-- No gutters -->
<div class="row g-0">
  <div class="col-6">Item</div>
  <div class="col-6">Item</div>
</div>
```

#### Offset & Order

```html
<!-- Offset columns -->
<div class="row">
  <div class="col-md-4 offset-md-4">Centered column</div>
</div>

<!-- Responsive order -->
<div class="row">
  <div class="col-12 col-md-8 order-2 order-md-1">Main (second on mobile)</div>
  <div class="col-12 col-md-4 order-1 order-md-2">Sidebar (first on mobile)</div>
</div>
```

### Component Patterns

#### Responsive Navigation

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container">
    <a class="navbar-brand" href="#">Logo</a>

    <!-- Toggler for mobile -->
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Menu items -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Contact</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

#### Responsive Cards

```html
<div class="container">
  <div class="row g-4">
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100">
        <img src="image.jpg" class="card-img-top" alt="" />
        <div class="card-body">
          <h5 class="card-title">Card Title</h5>
          <p class="card-text">Card description</p>
          <a href="#" class="btn btn-primary">Action</a>
        </div>
      </div>
    </div>
    <!-- Repeat for more cards -->
  </div>
</div>
```

#### Responsive Tables

```html
<!-- Scrollable on mobile -->
<div class="table-responsive">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td>555-1234</td>
        <td><button class="btn btn-sm btn-primary">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Stack on mobile -->
<table class="table table-responsive-md">
  <!-- Stacks below md breakpoint -->
</table>
```

### Utility Classes

#### Display Utilities

```html
<!-- Responsive display -->
<div class="d-none d-md-block">Hide on mobile, show on tablet+</div>
<div class="d-block d-md-none">Show on mobile, hide on tablet+</div>

<!-- Flex utilities -->
<div class="d-flex flex-column flex-md-row">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### Spacing Utilities

```html
<!-- Responsive margin -->
<div class="mb-3 mb-md-4 mb-lg-5">Responsive bottom margin</div>

<!-- Responsive padding -->
<div class="p-2 p-md-3 p-lg-4">Responsive padding</div>

<!-- Auto margins for centering -->
<div class="mx-auto" style="max-width: 500px;">Centered</div>
```

#### Text Utilities

```html
<!-- Responsive alignment -->
<p class="text-center text-md-start">Centered on mobile, left-aligned on tablet+</p>

<!-- Responsive font size -->
<p class="fs-6 fs-md-5 fs-lg-4">Responsive font size</p>
```

### Advanced Patterns

#### Responsive Modal

```html
<div class="modal fade" id="exampleModal">
  <div class="modal-dialog modal-dialog-centered modal-md modal-lg-lg modal-xl-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal Title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-12 col-md-6">Content</div>
          <div class="col-12 col-md-6">Content</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### Responsive Offcanvas

```html
<!-- Show as offcanvas on mobile, regular sidebar on desktop -->
<div class="offcanvas-lg offcanvas-start" id="sidebar">
  <div class="offcanvas-header">
    <h5>Sidebar</h5>
    <button class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    <!-- Sidebar content -->
  </div>
</div>

<!-- Toggle button (hidden on large screens) -->
<button class="btn d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#sidebar">Menu</button>
```

## Custom Breakpoint Strategies

### Container Queries (Modern Approach)

```css
/* More granular than media queries */
.container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-title {
    font-size: 1.5rem;
  }
}
```

### Viewport-Based Units

```css
/* Fluid typography */
.title {
  font-size: clamp(1.5rem, 5vw, 3rem);
  /* Min: 1.5rem, Preferred: 5% viewport, Max: 3rem */
}

/* Fluid spacing */
.section {
  padding: clamp(2rem, 5vh, 5rem) clamp(1rem, 5vw, 3rem);
}
```

### Aspect Ratio Maintenance

```css
/* Maintain aspect ratio */
.video-wrapper {
  aspect-ratio: 16 / 9;
}

/* Fallback for older browsers */
.video-wrapper-fallback {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 ratio */
}

.video-wrapper-fallback iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

## Performance Optimization

### Load Framework Conditionally

```html
<!-- Load only needed components -->
<link href="bootstrap-grid.min.css" rel="stylesheet" />

<!-- Purge unused Tailwind classes -->
<!-- tailwind.config.js -->
<script>
  module.exports = {
    content: ['./src/**/*.{html,js}'],
    // Only used classes will be included
  };
</script>
```

### Critical CSS

```html
<!-- Inline critical mobile CSS -->
<style>
  /* Mobile-first base styles */
  body {
    font-size: 16px;
  }
  .container {
    padding: 1rem;
  }
</style>

<!-- Load desktop enhancements async -->
<link rel="stylesheet" href="desktop.css" media="(min-width: 768px)" />
```

## Best Practices

### Tailwind Best Practices

✅ **DO:**

- Use arbitrary values sparingly: `w-[347px]`
- Extract repeated patterns to components
- Use `@apply` in CSS for component styles
- Leverage JIT mode for custom values
- Use responsive prefixes consistently

❌ **DON'T:**

- Repeat long class strings (extract to component)
- Mix Tailwind with inline styles
- Override Tailwind with `!important`
- Use arbitrary values when utility exists

### Bootstrap Best Practices

✅ **DO:**

- Use built-in components when possible
- Leverage utility classes for customization
- Follow mobile-first approach with breakpoints
- Use Sass variables for theming
- Test with actual Bootstrap JS components

❌ **DON'T:**

- Fight the framework with excessive custom CSS
- Skip responsive classes (add col-12 for mobile)
- Nest containers unnecessarily
- Ignore accessibility features

## Migration Patterns

### From Bootstrap to Tailwind

```html
<!-- Bootstrap -->
<div class="container">
  <div class="row g-4">
    <div class="col-12 col-md-6 col-lg-4">Content</div>
  </div>
</div>

<!-- Tailwind equivalent -->
<div class="max-w-7xl mx-auto px-4">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>Content</div>
  </div>
</div>
```

### From Custom CSS to Framework

```css
/* Custom CSS */
.card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}

@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}
```

```html
<!-- Tailwind equivalent -->
<div class="p-4 md:p-6 border border-gray-300 rounded-lg">Card content</div>

<!-- Bootstrap equivalent -->
<div class="card p-3 p-md-4">
  <div class="card-body">Card content</div>
</div>
```

## Framework Comparison

| Feature        | Tailwind           | Bootstrap            | Custom CSS   |
| -------------- | ------------------ | -------------------- | ------------ |
| Learning curve | Medium             | Low                  | High         |
| File size      | Small (with purge) | Medium-Large         | Variable     |
| Customization  | Excellent          | Good                 | Excellent    |
| Components     | Minimal            | Extensive            | Manual       |
| JS required    | No                 | Yes (for components) | No           |
| Mobile-first   | Yes                | Yes                  | Manual       |
| Best for       | Custom designs     | Rapid prototyping    | Full control |

## Resources

### Tailwind CSS

- Documentation: https://tailwindcss.com/docs
- Components: https://tailwindui.com/
- Cheat sheet: https://nerdcave.com/tailwind-cheat-sheet

### Bootstrap

- Documentation: https://getbootstrap.com/docs/
- Examples: https://getbootstrap.com/docs/5.3/examples/
- Themes: https://themes.getbootstrap.com/

### Tools

- PurgeCSS: Remove unused CSS
- PostCSS: Transform CSS with JavaScript
- Sass: CSS preprocessor for customization
