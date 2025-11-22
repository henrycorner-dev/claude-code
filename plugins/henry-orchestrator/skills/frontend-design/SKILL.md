---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics. Trigger phrases include "create a landing page", "build a dashboard", "design a hero section", "make an animated UI", "build a portfolio site", or "create modern web interface". Leverages cutting-edge libraries (anime.js, three.js, Framer Motion) and contemporary design paradigms (neobrutalism, glassmorphism, cyberpunk, 3D, etc.).
license: Complete terms in LICENSE.txt
version: 2.0.0
tags: [frontend, design, ui, ux, creativity, animation, 3d, production]
dependencies:
  - modern-browser
  - libraries: anime.js, three.js, framer-motion, gsap (optional)
---

This skill guides creation of extraordinary, production-grade frontend interfaces that combine cutting-edge creative libraries with exceptional UX/UI design. Build experiences that are visually stunning, technically sophisticated, and deeply memorable.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about purpose, audience, technical constraints, or desired aesthetic direction.

## Core Principles

**Creative Excellence**: Push boundaries with anime.js, three.js, Framer Motion, and modern creative libraries
**Performance First**: Every animation, effect, and interaction must be optimized for 60fps
**UX Priority**: Beauty serves function—never sacrifice usability for aesthetics
**Distinctive Design**: Avoid generic patterns; commit to bold, intentional design choices

## Workflow

### 1. **Requirements Analysis**

Understand the context deeply:

- **Purpose & Users**: What problem does this solve? Who will use it? What devices?
- **Technical Constraints**: Framework preferences, performance budgets, browser targets
- **Content & Data**: What information needs to be communicated?
- **Success Metrics**: How will we measure if this interface works?

### 2. **Design Direction Selection**

Choose ONE clear aesthetic direction and commit fully. Select from modern design paradigms:

**Contemporary Styles:**

1. **Neobrutalism**: Bold borders, clashing colors, raw aesthetics, deliberately "ugly-beautiful", stark shadows, chaotic yet intentional layouts
2. **Glassmorphism**: Frosted glass effects, backdrop-filter blur, transparency layers, subtle borders, light on dark or dark on light
3. **Neumorphism**: Soft UI, subtle shadows and highlights, monochromatic palettes, tactile feel, gentle depth
4. **Claymorphism**: 3D inflated elements, soft shadows, playful rounded shapes, optimistic color palettes
5. **Skeuomorphism**: Realistic textures, physical material mimicry, depth and dimension, familiar real-world metaphors
6. **Bold Typography**: Type as hero, experimental layouts, kinetic text, oversized headlines, typography-driven composition
7. **Bento Style**: Grid-based compartmentalization, rounded containers, organized chaos, dashboard aesthetics, colorful segmentation
8. **Retro/Nostalgia**: 80s/90s aesthetics, pixel art influences, vintage color palettes, CRT effects, vaporwave vibes
9. **Cyberpunk**: Neon glows, dark themes, futuristic HUDs, glitch effects, tech noir, holographic elements
10. **Immersive 3D**: three.js integration, spatial navigation, parallax depth, WebGL effects, dimensional interfaces

**Or blend multiple styles intentionally** for unique hybrid aesthetics.

**CRITICAL**: Document your chosen direction clearly before implementation. This guides all subsequent decisions.

### 3. **Creative Library Selection**

Choose libraries that amplify your design direction:

**Animation Libraries:**

- **anime.js**: Lightweight, powerful timeline animations, perfect for sequenced reveals, morphing, and complex choreography
- **Framer Motion**: React-specific, gesture-based interactions, layout animations, smooth page transitions
- **GSAP**: Professional-grade timeline control, scroll-triggered animations, advanced easing
- **Motion One**: Modern, performant web animations API wrapper

**3D & Visual Effects:**

- **three.js**: Full 3D scenes, WebGL shaders, particle systems, immersive experiences
- **react-three-fiber**: Declarative three.js in React, easier 3D component composition
- **p5.js**: Generative art, creative coding, dynamic visual patterns
- **curtains.js**: Image and video WebGL effects, displacement, ripple effects

**UI Enhancement:**

- **Lottie**: Complex vector animations from After Effects
- **particles.js**: Particle backgrounds and effects
- **rellax.js**: Smooth parallax scrolling

**Choose 1-3 libraries maximum to maintain performance budgets.**

### 4. **Implementation with Performance Priority**

Build production-grade code with these non-negotiable performance requirements:

#### Performance Standards:

```markdown
✓ 60fps animations (monitor with browser DevTools)
✓ First Contentful Paint < 1.5s
✓ Time to Interactive < 3.5s
✓ Lighthouse Performance Score > 90
✓ Bundle size optimized (code splitting, lazy loading)
✓ Responsive across devices (mobile-first approach)
```

#### Optimization Techniques:

- **Animation Performance**: Use `transform` and `opacity` only; avoid layout-triggering properties
- **GPU Acceleration**: Apply `will-change` strategically, remove after animation
- **Lazy Loading**: Defer heavy libraries until needed (three.js scenes on scroll trigger)
- **Code Splitting**: Dynamic imports for non-critical creative libraries
- **Asset Optimization**: Compress images, use WebP/AVIF, optimize 3D models
- **Debounce/Throttle**: Scroll and resize event handlers
- **RequestAnimationFrame**: For custom animations
- **Reduced Motion**: Respect `prefers-reduced-motion` media query

#### Example Performance Pattern:

```javascript
// Lazy load three.js only when 3D section enters viewport
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      import('three').then(({ Scene, PerspectiveCamera }) => {
        // Initialize 3D scene
      });
      observer.unobserve(entry.target);
    }
  });
});
```

### 5. **UX-Driven Design Decisions**

Creative design must enhance, never hinder, user experience:

#### UX Priorities:

- **Clarity Over Cleverness**: Users should instantly understand interface purpose
- **Feedback & Affordance**: Interactive elements signal their interactivity
- **Loading States**: Beautiful loaders for async operations
- **Error Handling**: Graceful, helpful error messages with visual consistency
- **Accessibility**: WCAG 2.1 AA minimum (keyboard nav, screen readers, color contrast)
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Micro-interactions**: Delightful hover states, click feedback, transition smoothness
- **Information Hierarchy**: Visual weight guides attention to important content
- **White Space**: Breathing room prevents cognitive overload
- **Mobile Touch Targets**: Minimum 44x44px, generous spacing

#### UX Anti-Patterns to Avoid:

✗ Animations that delay interaction
✗ Auto-playing videos/audio without control
✗ Scroll-jacking that breaks user expectations
✗ Text over busy backgrounds (poor readability)
✗ Infinite parallax that causes motion sickness
✗ Hidden navigation requiring discovery
✗ Form inputs without clear labels
✗ Hover-only interactions on touch devices

### 6. **Creative Implementation Guidelines**

#### Typography (Always Creative & Readable):

- **Display Fonts**: Explore Google Fonts, Adobe Fonts, or custom typefaces that embody your aesthetic
- **Avoid Generic**: Never default to Inter, Roboto, Arial, system fonts
- **Combinations**: Pair contrasting fonts (geometric + serif, display + mono)
- **Hierarchy**: Clear size/weight distinction between headings, body, captions
- **Readability**: 16px minimum body text, 1.5-1.7 line height, 60-75 characters per line
- **Variable Fonts**: Explore weight/width animations
- **Examples**: Playfair Display + Space Mono, Clash Display + Inter (only if justified), Syne + JetBrains Mono

#### Color & Theme (Bold & Cohesive):

- **CSS Variables**: Define entire design system in :root
- **Dominant + Accent**: One dominant color, 1-2 sharp accents
- **Contrast**: WCAG AA minimum (4.5:1 text, 3:1 UI components)
- **Dark Mode**: Consider automatic dark mode support
- **Gradients**: Use creatively (not just purple gradients!)
- **Color Psychology**: Match palette to emotional tone

#### Motion & Animation (High-Impact):

```javascript
// anime.js example: Staggered reveal
anime({
  targets: '.card',
  translateY: [40, 0],
  opacity: [0, 1],
  delay: anime.stagger(100),
  easing: 'easeOutExpo',
  duration: 1200,
});

// Framer Motion: Layout animations
<motion.div layout layoutId="card" />;

// three.js: Particle system background
// (Include only when 3D enhances the concept)
```

**Animation Guidelines:**

- Page load: One orchestrated entrance (staggered reveals)
- Scroll: Trigger animations at intersection observer thresholds
- Hover: Subtle scale/color changes (0.2s duration)
- Click: Immediate feedback (<100ms)
- Transitions: 200-400ms for most UI, 600-1200ms for dramatic moments
- Easing: `easeOutExpo`, `easeOutCubic` for natural feel

#### Spatial Composition (Unexpected Layouts):

- **Grid Breaking**: Elements that escape grid boundaries
- **Asymmetry**: Intentional imbalance creates visual interest
- **Overlap**: Layered elements with z-index hierarchy
- **Diagonal Flow**: Break horizontal/vertical tyranny
- **Generous Space**: Negative space as design element
- **Bento Layouts**: Grid-based compartments for dashboards
- **Responsive**: Mobile-first, fluid typography (clamp), container queries

#### Backgrounds & Visual Details:

```css
/* Glassmorphism */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);

/* Neobrutalism */
border: 3px solid #000;
box-shadow: 6px 6px 0 #000;

/* Gradient mesh */
background:
  radial-gradient(at 20% 30%, #ff00ff 0, transparent 50%),
  radial-gradient(at 80% 70%, #00ffff 0, transparent 50%);

/* Noise texture */
background-image: url('data:image/svg+xml,%3Csvg...');
```

Apply contextual effects: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, grain overlays, scanline effects, glitch animations.

### 7. **Quality Assurance Checklist**

Before delivery, validate:

**Design Quality:**

- [ ] Distinctive aesthetic that avoids generic AI patterns
- [ ] Cohesive design system (colors, typography, spacing defined)
- [ ] Intentional animations enhance UX (not arbitrary)
- [ ] Visual hierarchy guides user attention
- [ ] Responsive across mobile, tablet, desktop

**Technical Quality:**

- [ ] Production-ready, functional code
- [ ] 60fps animations (verified in DevTools)
- [ ] Lighthouse score > 90
- [ ] No console errors or warnings
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

**UX Quality:**

- [ ] Accessibility: WCAG 2.1 AA (contrast, keyboard nav, ARIA labels)
- [ ] `prefers-reduced-motion` respected
- [ ] Loading states for async operations
- [ ] Error states handled gracefully
- [ ] Touch targets minimum 44x44px
- [ ] Clear affordances for interactive elements

**Performance:**

- [ ] Critical CSS inlined, non-critical deferred
- [ ] Images optimized (WebP/AVIF, lazy loaded)
- [ ] Heavy libraries lazy loaded
- [ ] No layout shift (CLS < 0.1)
- [ ] Bundle size optimized

### 8. **Deliverable Format**

Provide complete, runnable code with:

1. **Implementation Files**: HTML/CSS/JS or framework components (React, Vue, etc.)
2. **Design Rationale**: Brief explanation of chosen aesthetic direction and key decisions
3. **Library CDN Links**: Include all necessary library imports
4. **Usage Instructions**: How to run/integrate the code
5. **Performance Notes**: Optimization techniques applied
6. **Accessibility Features**: ARIA labels, keyboard navigation, reduced motion

## Anti-Patterns (NEVER Use)

**Generic AI Aesthetics:**
✗ Default fonts: Inter, Roboto, Arial, system fonts (unless intentionally justified)
✗ Purple gradients on white backgrounds
✗ Predictable card-grid layouts without distinction
✗ Cookie-cutter component patterns
✗ Centering everything without compositional intent

**Performance Sins:**
✗ Animating width/height/top/left (use transform)
✗ Loading entire three.js bundle for simple animations
✗ Inline styles for every element
✗ Unoptimized images
✗ Scroll event listeners without throttling

**UX Violations:**
✗ Animations blocking user interaction
✗ Poor color contrast
✗ Hover-only interactions on mobile
✗ Auto-playing media without controls
✗ Ignoring `prefers-reduced-motion`

## Creative Library Implementation Examples

### anime.js - Staggered Card Reveal:

```javascript
anime({
  targets: '.feature-card',
  translateY: [60, 0],
  opacity: [0, 1],
  rotate: [5, 0],
  delay: anime.stagger(150, { start: 300 }),
  easing: 'spring(1, 80, 10, 0)',
  duration: 1800,
});
```

### Framer Motion - Page Transitions:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
>
  {content}
</motion.div>
```

### three.js - Particle Background (Lazy Loaded):

```javascript
// Load only when needed
const init3DBackground = async () => {
  const THREE = await import('three');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // ... particle system implementation
};

// Trigger on scroll into view
observer.observe(document.querySelector('.hero-3d'));
```

## Design Style Quick Reference

1. **Neobrutalism**: Black borders, offset shadows, brutalist typography, clashing colors
2. **Glassmorphism**: `backdrop-filter: blur()`, transparency, subtle borders, layered depth
3. **Neumorphism**: Soft shadows (`box-shadow: 5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff`), monochrome
4. **Claymorphism**: Inflated 3D shapes, playful rounded forms, soft shadows, vibrant colors
5. **Skeuomorphism**: Realistic textures, gradients mimicking materials, depth, tactile affordances
6. **Bold Typography**: Type as primary visual element, huge scale contrast, kinetic text animations
7. **Bento Style**: Grid compartments, rounded containers, organized sections, dashboard-like
8. **Retro/Nostalgia**: Pixel fonts, CRT scanlines, limited color palettes, 8-bit aesthetics
9. **Cyberpunk**: Neon glows (`text-shadow`, `box-shadow` with cyan/magenta), dark themes, glitch effects
10. **Immersive 3D**: three.js scenes, spatial navigation, parallax depth, WebGL shaders

## Remember

Claude is capable of extraordinary creative work. **Don't hold back**. Combine cutting-edge libraries with bold design choices. Prioritize performance and UX relentlessly. Create interfaces that users will remember and love to use.

Every design should feel intentional, distinctive, and perfectly executed. Never settle for generic solutions when creative excellence is possible.
