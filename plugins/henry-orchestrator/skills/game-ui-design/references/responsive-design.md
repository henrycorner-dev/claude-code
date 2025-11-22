# Responsive and Adaptive UI Design

## Core Concepts

### Responsive vs Adaptive

**Responsive Design:**

- Fluid layouts that scale continuously
- Uses relative units (%, em, rem, vw, vh)
- Adapts smoothly to any screen size
- Single layout that flexes

**Adaptive Design:**

- Fixed layouts for specific breakpoints
- Switches between distinct layouts
- Optimized for specific device categories
- Multiple layouts for different screens

**Hybrid Approach (Recommended):**

- Combine both strategies
- Responsive within breakpoints
- Adaptive layout changes at major breakpoints

### Design Principles

**Content Priority:**

- Essential content always visible
- Progressive disclosure for secondary info
- Hide non-critical elements on small screens

**Touch Targets:**

- Minimum 44x44 pixels (iOS)
- Minimum 48x48 dp (Android)
- Larger for critical actions

**Readable Text:**

- Minimum 12-14px for body text
- Scale proportionally with screen size
- High contrast ratios

## Screen Sizes and Aspect Ratios

### Common Resolutions

**Mobile (Portrait):**

- 320x568 (iPhone SE)
- 375x667 (iPhone 8)
- 390x844 (iPhone 13)
- 360x640 (Android)
- 412x915 (Android)

**Mobile (Landscape):**

- 568x320 (iPhone SE)
- 667x375 (iPhone 8)
- 844x390 (iPhone 13)
- 915x412 (Android)

**Tablet:**

- 768x1024 (iPad)
- 1024x768 (iPad landscape)
- 820x1180 (iPad Air)
- 1280x800 (Android tablet)

**Desktop:**

- 1280x720 (720p)
- 1920x1080 (1080p, most common)
- 2560x1440 (1440p)
- 3840x2160 (4K)

**Console:**

- 1920x1080 (PS5, Xbox Series X)
- 3840x2160 (4K gaming)

### Aspect Ratios

**Common Ratios:**

- 16:9 (1920x1080, 1280x720) - Standard widescreen
- 16:10 (1920x1200, 1280x800) - Monitors
- 21:9 (2560x1080, 3440x1440) - Ultrawide
- 4:3 (1024x768, 1600x1200) - Old monitors, tablets
- 19.5:9 (2340x1080) - Modern phones
- 18:9 (2160x1080) - Phones

**Design Implications:**

- Test UI at multiple aspect ratios
- Avoid fixed positioning that breaks on ultrawide
- Use anchor points and constraints
- Account for letterboxing/pillarboxing

## Breakpoints

### Defining Breakpoints

**Standard Breakpoints:**

```
Mobile:    < 768px
Tablet:    768px - 1024px
Desktop:   1024px - 1920px
Large:     > 1920px
```

**Game-Specific Breakpoints:**

```
Phone (Portrait):  < 600px width
Phone (Landscape): < 900px width, < 600px height
Tablet:            600px - 1280px
Desktop/Console:   > 1280px
```

### Breakpoint Strategy

**Mobile-First:**

```css
/* Base styles for mobile */
.ui-panel {
  width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .ui-panel {
    width: 50%;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .ui-panel {
    width: 33%;
  }
}
```

**Desktop-First:**

```css
/* Base styles for desktop */
.ui-panel {
  width: 33%;
}

/* Tablet and down */
@media (max-width: 1024px) {
  .ui-panel {
    width: 50%;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .ui-panel {
    width: 100%;
  }
}
```

## Layout Techniques

### Canvas Scaler (Unity)

**UI Scale Mode:**

**Constant Pixel Size:**

```csharp
// Fixed pixel size, UI doesn't scale
canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ConstantPixelSize;
```

**Scale With Screen Size (Recommended):**

```csharp
canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
canvasScaler.referenceResolution = new Vector2(1920, 1080);
canvasScaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
canvasScaler.matchWidthOrHeight = 0.5f; // 0 = width, 1 = height, 0.5 = balanced
```

**Screen Match Mode:**

- Match Width: UI scales based on width (good for portrait)
- Match Height: UI scales based on height (good for landscape)
- Match Width or Height: Blend between the two

**Constant Physical Size:**

```csharp
// Size in physical units (inches, cm)
canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ConstantPhysicalSize;
```

### Anchors and Pivots (Unity)

**Anchor Presets:**

```
Top-Left      Top-Center      Top-Right
├─────────────┼─────────────┤
│             │             │
Left          Center         Right
│             │             │
├─────────────┼─────────────┤
Bottom-Left   Bottom-Center  Bottom-Right
```

**Stretch Anchors:**

```
Stretch Horizontally: Left + Right anchors at opposite sides
Stretch Vertically:   Top + Bottom anchors at opposite sides
Stretch Both:         All four anchors at corners
```

**Anchor Usage:**

- Health bar (top-left): Anchor to top-left corner
- Mini-map (top-right): Anchor to top-right corner
- Interaction prompt (bottom-center): Anchor to bottom-center
- Full-screen menu: Stretch to fill entire canvas

**Example:**

```csharp
// Anchor health bar to top-left
RectTransform healthBar = healthBarObject.GetComponent<RectTransform>();
healthBar.anchorMin = new Vector2(0, 1); // Top-left
healthBar.anchorMax = new Vector2(0, 1); // Top-left
healthBar.anchoredPosition = new Vector2(20, -20); // Offset from anchor
```

### Layout Groups (Unity)

**Horizontal Layout Group:**

```
[Item 1] [Item 2] [Item 3]
```

**Vertical Layout Group:**

```
[Item 1]
[Item 2]
[Item 3]
```

**Grid Layout Group:**

```
[Item 1] [Item 2] [Item 3]
[Item 4] [Item 5] [Item 6]
```

**Properties:**

- Spacing: Gap between elements
- Padding: Space around edges
- Child Alignment: How children align within group
- Child Force Expand: Force children to fill space

**Performance Note:** Layout Groups recalculate on any change; use sparingly for dynamic content.

### Flexbox (Web/CSS)

**Flex Container:**

```css
.menu {
  display: flex;
  flex-direction: row; /* or column */
  justify-content: center; /* horizontal alignment */
  align-items: center; /* vertical alignment */
  gap: 16px; /* spacing between items */
}
```

**Flex Items:**

```css
.menu-item {
  flex: 1; /* grow to fill space */
  flex-shrink: 1; /* shrink if needed */
  flex-basis: auto; /* initial size */
}
```

**Responsive Flex:**

```css
/* Mobile: Stack vertically */
.menu {
  flex-direction: column;
}

/* Desktop: Horizontal layout */
@media (min-width: 768px) {
  .menu {
    flex-direction: row;
  }
}
```

### Grid (Web/CSS)

**Grid Container:**

```css
.inventory {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}
```

**Fixed Grid:**

```css
.inventory {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 columns */
  grid-template-rows: repeat(4, 80px); /* 4 rows, 80px each */
  gap: 8px;
}
```

**Responsive Grid:**

```css
/* Mobile: 2 columns */
.inventory {
  grid-template-columns: repeat(2, 1fr);
}

/* Tablet: 4 columns */
@media (min-width: 768px) {
  .inventory {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Desktop: 6 columns */
@media (min-width: 1024px) {
  .inventory {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

## Safe Areas

### Mobile Safe Areas

**Device Considerations:**

- Notches (iPhone X and newer)
- Camera cutouts (Android)
- Home indicator (iPhone)
- Rounded corners

**Safe Area Zones:**

```
┌─────────────────────────┐
│ ⚠️  Notch/Camera      │  ← Avoid placing critical UI
│═════════════════════════│
│                         │
│     ✓ Safe Zone        │  ← Place UI here
│                         │
│═════════════════════════│
│ ⚠️  Home Indicator    │  ← Avoid placing buttons
└─────────────────────────┘
```

### Unity Safe Area

**Detect Safe Area:**

```csharp
public class SafeAreaHandler : MonoBehaviour
{
    private RectTransform panel;

    void Awake()
    {
        panel = GetComponent<RectTransform>();
        ApplySafeArea();
    }

    void ApplySafeArea()
    {
        Rect safeArea = Screen.safeArea;
        Vector2 anchorMin = safeArea.position;
        Vector2 anchorMax = safeArea.position + safeArea.size;

        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        panel.anchorMin = anchorMin;
        panel.anchorMax = anchorMax;
    }

#if UNITY_EDITOR
    // Test in editor
    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.S))
        {
            ApplySafeArea();
        }
    }
#endif
}
```

**Selective Safe Area:**

```csharp
// Only apply to top (for notch)
panel.anchorMin = new Vector2(0, safeArea.position.y / Screen.height);
panel.anchorMax = new Vector2(1, 1);

// Only apply to bottom (for home indicator)
panel.anchorMin = new Vector2(0, 0);
panel.anchorMax = new Vector2(1, (safeArea.position.y + safeArea.size.y) / Screen.height);
```

### CSS Safe Area

**Environment Variables:**

```css
.ui-container {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}
```

**Viewport Meta Tag:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### Console Safe Zones

**TV Overscan:**

- Traditional TVs may cut off edges (5-10%)
- Modern TVs usually don't have this issue
- Still recommended to have 5% margin

**Action Safe:**

- 90% of screen area
- Essential information must be here

**Title Safe:**

- 80% of screen area
- Text must be within this zone

```
┌─────────────────────────┐
│ 5%                      │
│  ┌───────────────────┐  │
│  │ Action Safe 90%   │  │
│  │  ┌─────────────┐  │  │
│  │  │ Title Safe  │  │  │
│  │  │    80%      │  │  │
│  │  └─────────────┘  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## Platform-Specific Adaptations

### Mobile Optimizations

**Touch-Friendly:**

- Larger buttons (minimum 44x44px)
- Increased spacing between elements
- Bottom-sheet modals instead of center dialogs
- Swipe gestures for navigation

**Performance:**

- Reduce transparency/blur effects
- Simplify animations
- Use sprite atlases
- Minimize draw calls

**Layout Adjustments:**

```
Mobile Portrait:
┌─────────┐
│  Title  │
├─────────┤
│ Content │
│ (Full)  │
│         │
├─────────┤
│ Actions │
└─────────┘

Mobile Landscape:
┌──────────────┬─────────┐
│   Content    │ Actions │
│   (Split)    │         │
└──────────────┴─────────┘
```

### Tablet Optimizations

**Utilize Space:**

- Multi-column layouts
- Side panels
- Split-screen for menus
- Picture-in-picture

**Hybrid Input:**

- Touch-friendly but also support mouse/trackpad
- Larger buttons than desktop but smaller than phone
- Support keyboard shortcuts

**Layout:**

```
Tablet:
┌────────────────────────┐
│        Header          │
├──────────┬─────────────┤
│  Main    │  Sidebar    │
│ Content  │  (Always    │
│          │   Visible)  │
├──────────┴─────────────┤
│        Footer          │
└────────────────────────┘
```

### Desktop/Console Optimizations

**Mouse/Controller:**

- Smaller UI elements (more screen real estate)
- Hover states and tooltips
- Context menus
- Keyboard shortcuts

**High Resolution:**

- Scale UI appropriately (don't leave tiny)
- Use higher quality assets
- More information density acceptable

**Layout:**

```
Desktop:
┌────────────────────────────────┐
│           Header               │
├─────────┬──────────┬───────────┤
│ Side    │  Main    │  Side     │
│ Panel   │ Content  │  Panel    │
│         │          │           │
├─────────┴──────────┴───────────┤
│           Footer               │
└────────────────────────────────┘
```

### Cross-Platform Layout Example

**Inventory Grid:**

**Mobile (2 columns):**

```
┌───┬───┐
│ 1 │ 2 │
├───┼───┤
│ 3 │ 4 │
├───┼───┤
│ 5 │ 6 │
└───┴───┘
```

**Tablet (4 columns):**

```
┌───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │
├───┼───┼───┼───┤
│ 5 │ 6 │ 7 │ 8 │
└───┴───┴───┴───┘
```

**Desktop (6 columns):**

```
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │
├───┼───┼───┼───┼───┼───┤
│ 7 │ 8 │ 9 │10 │11 │12 │
└───┴───┴───┴───┴───┴───┘
```

## Dynamic UI Scaling

### Automatic Scaling

**Calculate Scale Factor:**

```csharp
public class UIScaler : MonoBehaviour
{
    public float referenceWidth = 1920f;
    public float referenceHeight = 1080f;

    void Update()
    {
        float scaleX = Screen.width / referenceWidth;
        float scaleY = Screen.height / referenceHeight;
        float scale = Mathf.Min(scaleX, scaleY);

        transform.localScale = Vector3.one * scale;
    }
}
```

**Relative Font Sizing:**

```csharp
// Scale font based on screen height
float baseFontSize = 24f;
float referenceHeight = 1080f;
float scaledFontSize = baseFontSize * (Screen.height / referenceHeight);
textComponent.fontSize = Mathf.Clamp(scaledFontSize, 12f, 48f);
```

### User-Controlled Scaling

**UI Scale Slider:**

```
UI Scale: [━━━━━━━○━━] 100%
          50%        150%
```

**Implementation:**

```csharp
public class UIScaleController : MonoBehaviour
{
    public RectTransform uiRoot;
    public Slider scaleSlider;

    private void Start()
    {
        scaleSlider.onValueChanged.AddListener(OnScaleChanged);
        float savedScale = PlayerPrefs.GetFloat("UIScale", 1f);
        scaleSlider.value = savedScale;
        ApplyScale(savedScale);
    }

    private void OnScaleChanged(float scale)
    {
        ApplyScale(scale);
        PlayerPrefs.SetFloat("UIScale", scale);
    }

    private void ApplyScale(float scale)
    {
        uiRoot.localScale = Vector3.one * scale;
    }
}
```

## Orientation Handling

### Portrait vs Landscape

**Detect Orientation:**

```csharp
void Update()
{
    if (Screen.width > Screen.height)
    {
        // Landscape
        ApplyLandscapeLayout();
    }
    else
    {
        // Portrait
        ApplyPortraitLayout();
    }
}
```

**Lock Orientation:**

```csharp
// Lock to landscape
Screen.orientation = ScreenOrientation.LandscapeLeft;
Screen.autorotateToLandscapeLeft = true;
Screen.autorotateToLandscapeRight = true;
Screen.autorotateToPortrait = false;
Screen.autorotateToPortraitUpsideDown = false;

// Lock to portrait
Screen.orientation = ScreenOrientation.Portrait;
Screen.autorotateToPortrait = true;
Screen.autorotateToPortraitUpsideDown = true;
Screen.autorotateToLandscapeLeft = false;
Screen.autorotateToLandscapeRight = false;
```

**Adapt Layout:**

```csharp
public class OrientationHandler : MonoBehaviour
{
    public GameObject portraitUI;
    public GameObject landscapeUI;

    void Start()
    {
        UpdateOrientation();
    }

    void Update()
    {
        if (Screen.width > Screen.height && portraitUI.activeSelf)
        {
            UpdateOrientation();
        }
        else if (Screen.width < Screen.height && landscapeUI.activeSelf)
        {
            UpdateOrientation();
        }
    }

    void UpdateOrientation()
    {
        bool isLandscape = Screen.width > Screen.height;
        portraitUI.SetActive(!isLandscape);
        landscapeUI.SetActive(isLandscape);
    }
}
```

### CSS Orientation

```css
/* Portrait styles */
@media (orientation: portrait) {
  .ui-container {
    flex-direction: column;
  }
}

/* Landscape styles */
@media (orientation: landscape) {
  .ui-container {
    flex-direction: row;
  }
}
```

## Text Scaling and Readability

### Dynamic Font Sizing

**Relative Units:**

```css
body {
  font-size: 16px; /* Base size */
}

h1 {
  font-size: 2em; /* 32px */
}

p {
  font-size: 1em; /* 16px */
}

small {
  font-size: 0.875em; /* 14px */
}
```

**Viewport Units:**

```css
.title {
  font-size: 5vw; /* 5% of viewport width */
}

.subtitle {
  font-size: 3vh; /* 3% of viewport height */
}

.responsive-text {
  font-size: calc(16px + 0.5vw); /* Minimum 16px, scales with viewport */
}
```

### Text Wrap and Overflow

**Truncate with Ellipsis:**

```css
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**Multi-line Clamp:**

```css
.text-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Word Wrap:**

```css
.text-wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

### Minimum Font Sizes

**Never Go Below:**

- Mobile: 14px minimum
- Tablet: 13px minimum
- Desktop: 12px minimum
- Console (10ft experience): 18px minimum

## Testing Responsive UI

### Test Devices

**Physical Devices:**

- Various phones (small, medium, large)
- Tablets (7", 10", 12")
- Different aspect ratios
- Different DPI/pixel densities

**Emulators/Simulators:**

- Unity Device Simulator
- Browser DevTools device emulation
- Platform-specific emulators (Xcode, Android Studio)

### Test Scenarios

**Checklist:**

- [ ] UI readable at smallest supported screen
- [ ] No overlapping elements at any size
- [ ] Touch targets large enough on mobile
- [ ] Text wraps properly
- [ ] Images scale without distortion
- [ ] Safe areas respected on notched devices
- [ ] Performance acceptable on low-end devices
- [ ] Landscape and portrait both work
- [ ] All aspect ratios tested (16:9, 21:9, 4:3)
- [ ] UI scale options work correctly

### Common Issues

**Problem: Text too small on mobile**

- Solution: Increase base font size, add minimum font size

**Problem: Buttons overlap on small screens**

- Solution: Increase spacing, stack vertically, reduce button count

**Problem: UI cut off by notch**

- Solution: Apply safe area insets

**Problem: Layout breaks on ultrawide**

- Solution: Use max-width constraints, anchor properly

**Problem: Performance issues on mobile**

- Solution: Reduce transparency, simplify shaders, optimize canvas

## Best Practices Summary

✅ **DO:**

- Use anchors and constraints properly
- Test on real devices
- Respect safe areas
- Provide UI scale options
- Use relative sizing when possible
- Consider touch target sizes
- Test all aspect ratios
- Optimize for platform (touch vs mouse)
- Provide orientation support
- Scale fonts dynamically
- Use breakpoints wisely
- Profile performance

❌ **DON'T:**

- Hard-code positions and sizes
- Assume fixed screen dimensions
- Ignore safe areas
- Make UI too small on mobile
- Use tiny touch targets
- Forget about ultrawide monitors
- Test on only one device
- Use same layout for all platforms
- Force single orientation without reason
- Use fixed pixel fonts
- Over-complicate with too many breakpoints
- Ignore performance on low-end devices

## Tools and Resources

### Design Tools

- Figma: Responsive design with constraints
- Adobe XD: Auto-layout and responsive resize
- Sketch: Responsive resizing

### Testing Tools

- Unity Device Simulator
- Browser DevTools (Responsive Design Mode)
- BrowserStack: Test on real devices remotely
- TestFlight/Google Play Internal Testing

### Helpful Resources

- Material Design Guidelines (responsive)
- Apple Human Interface Guidelines
- Unity UI Best Practices
- Unreal UMG Documentation

## Conclusion

Responsive and adaptive UI design ensures your game provides an optimal experience across all devices and screen sizes. Use anchors, constraints, and relative sizing to create flexible layouts. Always test on real devices, respect safe areas, and optimize for each platform's unique characteristics. Provide user customization options and ensure accessibility for all players regardless of their device.
