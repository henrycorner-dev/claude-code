# Accessibility Guide - WCAG Compliance & ARIA Patterns

## WCAG 2.1 Compliance Levels

### Level A (Minimum)

**1.1.1 Non-text Content**

- All images must have alt text
- Decorative images: `alt=""`
- Informative images: descriptive alt text
- Complex images: extended description via aria-describedby

**1.3.1 Info and Relationships**

- Use semantic HTML (headings, lists, tables)
- Form inputs must have associated labels
- Group related content with fieldset/legend

**2.1.1 Keyboard**

- All functionality available via keyboard
- No keyboard traps
- Tab order follows logical flow

**2.4.1 Bypass Blocks**

- Skip navigation links for repeated content
- Landmark regions (nav, main, aside)

**3.1.1 Language of Page**

- Declare language: `<html lang="en">`

**4.1.1 Parsing**

- Valid HTML structure
- Unique IDs
- Proper nesting

### Level AA (Standard - Recommended)

**1.4.3 Contrast (Minimum)**

- Normal text: 4.5:1 contrast ratio
- Large text (18pt/14pt bold): 3:1 contrast ratio
- Tools: WebAIM Contrast Checker, Chrome DevTools

**1.4.5 Images of Text**

- Avoid images of text when possible
- Use actual text styled with CSS

**2.4.6 Headings and Labels**

- Descriptive headings (h1-h6)
- Clear form labels

**2.4.7 Focus Visible**

- Visible keyboard focus indicator
- Don't remove outline without replacement

**3.2.3 Consistent Navigation**

- Navigation in same order across pages

**3.3.3 Error Suggestion**

- Provide correction suggestions for input errors

### Level AAA (Enhanced)

**1.4.6 Contrast (Enhanced)**

- Normal text: 7:1 contrast ratio
- Large text: 4.5:1 contrast ratio

**2.4.8 Location**

- Breadcrumb navigation
- Site maps

**3.3.5 Help**

- Context-sensitive help available

## ARIA Patterns & Usage

### When to Use ARIA

**Use ARIA when:**

- Native HTML doesn't provide needed semantics
- Creating custom widgets (tabs, accordions, modals)
- Adding dynamic content announcements
- Complex interactive components

**Don't use ARIA when:**

- Native HTML element exists (use `<button>` not `<div role="button">`)
- It duplicates native semantics
- It's decorative only

### Core ARIA Attributes

#### Labels & Descriptions

```html
<!-- aria-label: Provides accessible name -->
<button aria-label="Close dialog">×</button>

<!-- aria-labelledby: References visible label -->
<h2 id="dialog-title">Confirm Action</h2>
<div role="dialog" aria-labelledby="dialog-title">...</div>

<!-- aria-describedby: Provides additional description -->
<input id="password" type="password" aria-describedby="password-requirements" />
<p id="password-requirements">Must be at least 8 characters with one number</p>
```

#### States & Properties

```html
<!-- aria-expanded: Collapsible state -->
<button aria-expanded="false" aria-controls="submenu">Menu</button>
<ul id="submenu" hidden>
  ...
</ul>

<!-- aria-pressed: Toggle button state -->
<button aria-pressed="false">Mute</button>

<!-- aria-checked: Checkbox/radio state -->
<div role="checkbox" aria-checked="true">Subscribe</div>

<!-- aria-selected: Selection state -->
<div role="tab" aria-selected="true">Tab 1</div>

<!-- aria-disabled: Disabled state -->
<button aria-disabled="true">Submit</button>

<!-- aria-hidden: Hide from screen readers -->
<span aria-hidden="true">👍</span>
```

#### Live Regions

```html
<!-- aria-live: Announce dynamic changes -->
<div aria-live="polite" aria-atomic="true">Items in cart: 3</div>

<!-- polite: Wait for user pause -->
<!-- assertive: Interrupt immediately -->
<!-- off: No announcement (default) -->

<!-- aria-atomic: Announce entire region or just changes -->
<div aria-live="polite" aria-atomic="false">
  <p>Message 1</p>
  <p>Message 2</p>
  <!-- Only new messages announced -->
</div>

<!-- role="status": Implicit aria-live="polite" -->
<div role="status">Loading...</div>

<!-- role="alert": Implicit aria-live="assertive" -->
<div role="alert">Error: Form submission failed</div>
```

### Common ARIA Patterns

#### Tab Pattern

```html
<div class="tabs">
  <div role="tablist" aria-label="Settings tabs">
    <button role="tab" aria-selected="true" aria-controls="general-panel" id="general-tab">
      General
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="privacy-panel"
      id="privacy-tab"
      tabindex="-1"
    >
      Privacy
    </button>
  </div>

  <div role="tabpanel" id="general-panel" aria-labelledby="general-tab">
    General settings content
  </div>

  <div role="tabpanel" id="privacy-panel" aria-labelledby="privacy-tab" hidden>
    Privacy settings content
  </div>
</div>
```

**Keyboard support:**

- Tab: Focus into tablist, focus into active panel
- Arrow Left/Right: Navigate between tabs
- Home/End: First/last tab
- Enter/Space: Activate focused tab

#### Accordion Pattern

```html
<div class="accordion">
  <h3>
    <button aria-expanded="true" aria-controls="section1-content" id="section1-button">
      Section 1
    </button>
  </h3>
  <div id="section1-content" role="region" aria-labelledby="section1-button">Section 1 content</div>

  <h3>
    <button aria-expanded="false" aria-controls="section2-content" id="section2-button">
      Section 2
    </button>
  </h3>
  <div id="section2-content" role="region" aria-labelledby="section2-button" hidden>
    Section 2 content
  </div>
</div>
```

**Keyboard support:**

- Tab: Focus each accordion button
- Enter/Space: Toggle section
- Arrow Up/Down: Navigate buttons (optional)

#### Modal Dialog Pattern

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-description">Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Requirements:**

- Focus trapped within dialog
- Esc key closes dialog
- Focus returns to trigger element
- Background content inert (aria-modal="true")

#### Navigation Menu

```html
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/home">Home</a>
    </li>
    <li role="none">
      <button role="menuitem" aria-haspopup="true" aria-expanded="false">Products</button>
      <ul role="menu">
        <li role="none">
          <a role="menuitem" href="/products/software">Software</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

## Testing Procedures

### Automated Testing

**Tools:**

- axe DevTools (Chrome/Firefox extension)
- Lighthouse (Chrome DevTools)
- WAVE (Web Accessibility Evaluation Tool)
- Pa11y (command line)

**Run automated tests:**

```bash
# Using Pa11y
npm install -g pa11y
pa11y https://example.com

# Using axe-core CLI
npm install -g @axe-core/cli
axe https://example.com
```

### Manual Testing

#### Keyboard Navigation Test

1. Hide mouse cursor
2. Use only keyboard:
   - **Tab**: Move forward through interactive elements
   - **Shift+Tab**: Move backward
   - **Enter**: Activate links/buttons
   - **Space**: Toggle checkboxes, activate buttons
   - **Arrow keys**: Navigate within components (tabs, menus)
   - **Esc**: Close modals/dropdowns

3. Check:
   - [ ] All interactive elements reachable
   - [ ] Visible focus indicator
   - [ ] Logical tab order
   - [ ] No keyboard traps
   - [ ] Modals trap focus appropriately

#### Screen Reader Test

**Tools:**

- NVDA (Windows, free)
- JAWS (Windows, paid)
- VoiceOver (macOS/iOS, built-in)
- TalkBack (Android, built-in)

**VoiceOver (macOS):**

- **Cmd+F5**: Toggle VoiceOver
- **VO+A**: Start reading
- **VO+Arrow**: Navigate elements
- **VO+Space**: Activate element
- **VO+U**: Rotor menu

**Test checklist:**

- [ ] All content announced correctly
- [ ] Images have meaningful alt text
- [ ] Form fields have labels
- [ ] Headings create logical outline
- [ ] Links have descriptive text
- [ ] Button purposes are clear
- [ ] Dynamic content changes announced
- [ ] Error messages announced

#### Contrast Testing

**Tools:**

- Chrome DevTools (Inspect > Accessibility pane)
- WebAIM Contrast Checker
- Colour Contrast Analyser (desktop app)

**Check:**

- [ ] Body text: 4.5:1 minimum
- [ ] Large text (18pt+/14pt bold+): 3:1 minimum
- [ ] UI components: 3:1 minimum
- [ ] Icons/graphics: 3:1 minimum

#### Zoom Test

1. Zoom browser to 200%
2. Check:
   - [ ] No horizontal scrolling
   - [ ] Text remains readable
   - [ ] No content cut off
   - [ ] Functionality still works

### Testing Checklist

#### Perceivable

- [ ] All images have alt text
- [ ] Videos have captions/transcripts
- [ ] Color not sole means of conveying info
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Text can resize to 200%

#### Operable

- [ ] All functionality keyboard accessible
- [ ] No keyboard traps
- [ ] Enough time for time-limited content
- [ ] No content flashing more than 3x/second
- [ ] Skip navigation link present
- [ ] Descriptive page titles
- [ ] Visible focus indicators

#### Understandable

- [ ] Language declared (lang attribute)
- [ ] Labels and instructions for inputs
- [ ] Error messages are clear
- [ ] Consistent navigation
- [ ] Consistent identification

#### Robust

- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Works with assistive technologies
- [ ] Compatible with current/future browsers

## Common Accessibility Issues & Solutions

### Issue 1: Missing Alt Text

❌ **Bad:**

```html
<img src="product.jpg" />
```

✅ **Good:**

```html
<!-- Informative -->
<img src="product.jpg" alt="Blue wireless headphones" />

<!-- Decorative -->
<img src="decoration.jpg" alt="" />

<!-- Complex (chart/diagram) -->
<img src="chart.jpg" alt="Sales chart" aria-describedby="chart-desc" />
<div id="chart-desc">Detailed description: Sales increased 25% in Q3...</div>
```

### Issue 2: Unlabeled Form Inputs

❌ **Bad:**

```html
<input type="text" placeholder="Email" />
```

✅ **Good:**

```html
<label for="email">Email address</label> <input id="email" type="email" required />
```

### Issue 3: Non-Semantic Buttons

❌ **Bad:**

```html
<div onclick="submit()">Submit</div>
```

✅ **Good:**

```html
<button type="submit">Submit</button>
```

### Issue 4: Poor Color Contrast

❌ **Bad:**

```css
.text {
  color: #777; /* 2.7:1 contrast on white */
  background: white;
}
```

✅ **Good:**

```css
.text {
  color: #595959; /* 4.5:1 contrast on white */
  background: white;
}
```

### Issue 5: No Focus Indicator

❌ **Bad:**

```css
button:focus {
  outline: none; /* NEVER do this without replacement */
}
```

✅ **Good:**

```css
button:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

### Issue 6: Inaccessible Modal

❌ **Bad:**

```html
<div class="modal">
  <p>Content</p>
</div>
```

✅ **Good:**

```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
  <p>Content</p>
  <button aria-label="Close">×</button>
</div>

<!-- Focus trap implemented with JavaScript -->
```

### Issue 7: Link Text Not Descriptive

❌ **Bad:**

```html
<a href="/products">Click here</a> <a href="/docs">Read more</a>
```

✅ **Good:**

```html
<a href="/products">View our products</a> <a href="/docs">Read documentation about accessibility</a>
```

### Issue 8: Icon-Only Buttons

❌ **Bad:**

```html
<button>🗑️</button>
```

✅ **Good:**

```html
<button aria-label="Delete item">
  <span aria-hidden="true">🗑️</span>
</button>

<!-- Or with icon font -->
<button aria-label="Delete item">
  <i class="icon-trash" aria-hidden="true"></i>
</button>
```

## Responsive Accessibility Considerations

### Touch Target Size

Minimum 44x44px for touch targets (WCAG 2.1 AA):

```css
button,
a,
input[type='checkbox'],
input[type='radio'] {
  min-width: 44px;
  min-height: 44px;
}
```

### Responsive Focus Indicators

Ensure focus visible at all viewport sizes:

```css
:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Larger outline on touch devices */
@media (pointer: coarse) {
  :focus-visible {
    outline-width: 3px;
  }
}
```

### Mobile Screen Reader Gestures

- **Swipe right**: Next element
- **Swipe left**: Previous element
- **Double tap**: Activate element
- **Two-finger swipe down**: Read from current position
- **Rotor**: Two-finger twist to access navigation options

### Responsive Navigation Accessibility

```html
<!-- Mobile menu with proper ARIA -->
<button
  class="menu-toggle"
  aria-expanded="false"
  aria-controls="main-menu"
  aria-label="Open navigation menu"
>
  <span aria-hidden="true">☰</span>
</button>

<nav id="main-menu" aria-label="Main navigation" hidden>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

## Resources

### Official Documentation

- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

### Testing Tools

- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools
- Color Contrast Checker: https://webaim.org/resources/contrastchecker/

### Screen Readers

- NVDA (Windows): https://www.nvaccess.org/
- JAWS (Windows): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (macOS/iOS): Built-in
- TalkBack (Android): Built-in

### Learning Resources

- WebAIM: https://webaim.org/
- A11y Project: https://www.a11yproject.com/
- Inclusive Components: https://inclusive-components.design/
