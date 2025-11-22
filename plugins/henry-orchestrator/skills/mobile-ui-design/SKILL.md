---
name: mobile-ui-design
description: This skill should be used when the user asks to "build a mobile app", "create mobile UI", "implement bottom navigation", "add tab bar", "create navigation drawer", "follow Material Design", "follow Human Interface Guidelines", "design for iOS", "design for Android", or mentions mobile-specific patterns like "bottom tabs", "side drawer", "mobile navigation", "touch targets", "responsive mobile design", or platform-specific UI components. Provides guidance for creating platform-appropriate mobile interfaces following Material Design and Human Interface Guidelines.
version: 0.1.0
---

# Mobile UI Design

This skill provides guidance for designing and implementing mobile user interfaces that follow platform-specific design patterns and best practices. It covers Material Design for Android, Human Interface Guidelines for iOS, and cross-platform considerations.

## Purpose

Mobile UI design requires understanding platform-specific conventions, navigation patterns, and interaction models. This skill helps create mobile interfaces that:

- Follow platform design guidelines (Material Design, Human Interface Guidelines)
- Implement appropriate navigation patterns (bottom tabs, navigation drawers, stack navigation)
- Ensure proper touch targets and spacing for mobile devices
- Handle platform-specific interactions and gestures
- Create responsive layouts for various screen sizes
- Maintain consistency within each platform ecosystem

## When to Use This Skill

Use this skill when:

- Building mobile applications (native or cross-platform)
- Implementing mobile navigation patterns
- Designing mobile-first interfaces
- Converting web designs to mobile
- Creating platform-specific UI components
- Ensuring mobile accessibility and usability

## Core Principles

### Platform-Specific Design

**Material Design (Android):**
- Material components and elevation
- Floating Action Buttons (FABs)
- Bottom navigation bars
- Navigation drawers
- Card-based layouts
- Material color systems and theming

**Human Interface Guidelines (iOS):**
- Tab bars at the bottom
- Navigation bars at the top
- Modal presentations and sheets
- SF Symbols for icons
- iOS-specific gestures (swipe back, long press)
- System fonts and spacing

### Navigation Patterns

#### Bottom Navigation/Tab Bars

Primary navigation pattern for mobile apps with 3-5 top-level destinations.

**iOS Tab Bar:**
```swift
// SwiftUI example
TabView {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house")
        }
    SearchView()
        .tabItem {
            Label("Search", systemImage: "magnifyingglass")
        }
    ProfileView()
        .tabItem {
            Label("Profile", systemImage: "person")
        }
}
```

**Android Bottom Navigation:**
```kotlin
// Jetpack Compose example
Scaffold(
    bottomBar = {
        NavigationBar {
            NavigationBarItem(
                icon = { Icon(Icons.Default.Home, "Home") },
                label = { Text("Home") },
                selected = selectedItem == 0,
                onClick = { selectedItem = 0 }
            )
            NavigationBarItem(
                icon = { Icon(Icons.Default.Search, "Search") },
                label = { Text("Search") },
                selected = selectedItem == 1,
                onClick = { selectedItem = 1 }
            )
        }
    }
) { /* Content */ }
```

#### Navigation Drawer

Secondary navigation pattern, typically for Android apps with many sections.

**When to Use:**
- Apps with 5+ top-level sections
- Settings and account management
- Less frequently accessed features
- Supporting navigation, not primary

**Implementation Considerations:**
- Access via hamburger menu or swipe from left edge
- Include header with user info/branding
- Group related items with dividers
- Highlight current section

#### Stack Navigation

Hierarchical navigation for drilling into content.

**iOS Navigation Stack:**
- Navigation bar at top with back button
- Large titles that collapse on scroll
- Swipe from left edge to go back
- Push/pop transitions

**Android Navigation:**
- App bar at top with up/back button
- Shared element transitions
- System back button support

### Touch Targets and Spacing

#### Minimum Touch Targets

**iOS:**
- Minimum: 44pt × 44pt (88px × 88px @2x)
- Comfortable: 48pt × 48pt
- Status bar height: 44pt (non-notch), 47pt (notch)
- Tab bar height: 49pt

**Android:**
- Minimum: 48dp × 48dp
- Comfortable: 56dp × 56dp for primary actions
- App bar height: 56dp (portrait), 48dp (landscape)
- Bottom navigation: 56dp

#### Spacing

**iOS:**
- System spacing: 8pt, 16pt, 20pt
- Safe area insets for notch/home indicator
- Margins: 16pt-20pt from screen edges

**Android:**
- Base unit: 8dp grid system
- Common spacing: 8dp, 16dp, 24dp
- Screen margins: 16dp typical
- Card elevation: 1dp-8dp

### Responsive Design

#### Screen Sizes

**iOS:**
- iPhone SE: 375×667pt
- iPhone 13/14: 390×844pt
- iPhone 14 Pro Max: 430×932pt
- iPad: 768×1024pt and up

**Android:**
- Small: 360dp width typical
- Medium: 400dp+ width
- Large: 600dp+ (tablets)
- Extra large: 840dp+ (large tablets)

#### Breakpoint Strategies

- Design for smallest target screen first
- Use flexible layouts (not fixed sizes)
- Test on both portrait and landscape
- Consider split-screen multitasking
- Adapt navigation for tablets (sidebar vs bottom bar)

## Implementation Workflow

### 1. Choose Platform Strategy

Determine the approach:

- **Native:** Swift/SwiftUI (iOS) or Kotlin/Jetpack Compose (Android)
- **Cross-platform:** React Native, Flutter, or similar
- **Web-based:** Progressive Web App with mobile-first design

### 2. Select Navigation Pattern

Based on app structure:

- **3-5 main sections:** Bottom tabs/navigation bar (primary choice)
- **5+ sections:** Navigation drawer + bottom tabs
- **Deep hierarchies:** Stack navigation with clear back navigation
- **Content-focused:** Hide navigation when scrolling, reveal on demand

### 3. Design Information Architecture

Map out screen hierarchy:

- Define top-level sections
- Identify common actions (search, add, settings)
- Plan user flows between screens
- Determine where FABs or primary actions appear

### 4. Create Layouts

Follow platform guidelines:

- Use platform-native components when possible
- Respect safe areas and insets
- Implement proper touch targets
- Add appropriate spacing and padding
- Use platform-specific icons

### 5. Test on Devices

Validate design:

- Test on physical devices (not just simulators)
- Verify touch targets are easily tappable
- Check scrolling and gestures feel natural
- Ensure text is readable at system font sizes
- Test with accessibility features enabled

## Component Patterns

### Cards

**Material Design Cards:**
```kotlin
Card(
    modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Card Title", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Card content goes here")
    }
}
```

**iOS Cards:**
```swift
// iOS uses grouped lists or custom containers
GroupBox {
    VStack(alignment: .leading, spacing: 8) {
        Text("Card Title")
            .font(.headline)
        Text("Card content goes here")
            .font(.body)
    }
    .padding()
}
.background(Color(.systemBackground))
.cornerRadius(10)
.shadow(radius: 2)
```

### Lists

**iOS Lists:**
- Use native `List` or `UITableView`
- Swipe actions for delete/archive
- Disclosure indicators for navigation
- System separators

**Android Lists:**
- RecyclerView or LazyColumn
- Use Material list items with proper density
- Ripple effects on touch
- Dividers where appropriate

### Buttons and Actions

**Primary Actions:**
- iOS: Prominent button or toolbar button
- Android: FAB for primary screen action or prominent button

**Secondary Actions:**
- iOS: Toolbar buttons or context menus
- Android: App bar actions or overflow menu

## Accessibility Considerations

### Platform Accessibility Features

**iOS:**
- VoiceOver support with proper labels
- Dynamic Type for text scaling
- High Contrast mode
- Reduce Motion for animations

**Android:**
- TalkBack screen reader support
- Font scaling (up to 200%)
- Color correction modes
- Switch Access for motor impairments

### Implementation Guidelines

- Provide text alternatives for images and icons
- Ensure minimum 4.5:1 contrast ratio for text
- Support system font size settings
- Make all interactive elements keyboard/screen reader accessible
- Test with platform accessibility tools (Accessibility Inspector, TalkBack)

## Additional Resources

### Reference Files

For comprehensive platform-specific guidelines:
- **`references/design-systems.md`** - Detailed Material Design and HIG specifications, component guidelines, and platform-specific patterns
- **`references/navigation-patterns.md`** - In-depth navigation implementations, flow patterns, and best practices for each navigation type

### Examples

Working implementations in `examples/`:
- **`bottom-navigation-ios.swift`** - Complete iOS tab bar implementation
- **`bottom-navigation-android.kt`** - Complete Android bottom navigation
- **`navigation-drawer-android.kt`** - Material 3 navigation drawer
- **`responsive-layout.tsx`** - React Native responsive pattern

### External Resources

**Material Design:**
- https://m3.material.io - Material Design 3 guidelines
- https://developer.android.com/jetpack/compose - Jetpack Compose documentation

**Human Interface Guidelines:**
- https://developer.apple.com/design/human-interface-guidelines - Official iOS HIG
- https://developer.apple.com/design/resources - Design resources and templates

## Quick Reference

### Navigation Decision Matrix

| App Structure | iOS | Android | Notes |
|--------------|-----|---------|-------|
| 3-5 main sections | Tab Bar | Bottom Navigation | Primary pattern |
| 5+ sections | Tab Bar + More | Navigation Drawer | Consider reorganizing |
| Deep hierarchy | Navigation Stack | Navigation Component | Use with primary nav |
| Content-focused | Hide bars on scroll | Collapsing toolbar | Show on reverse scroll |

### Common Mistakes to Avoid

- **Don't mix platform patterns:** Don't use Material FABs on iOS or iOS tab bars styled for Android
- **Don't use tiny touch targets:** Always use minimum 44pt/48dp touch targets
- **Don't ignore safe areas:** Account for notches, home indicators, and status bars
- **Don't create custom navigation:** Use platform-standard patterns unless absolutely necessary
- **Don't forget landscape:** Test and design for landscape orientation
- **Don't hardcode sizes:** Use flexible layouts and respect system font sizes

### Mobile-First Best Practices

1. **Start with mobile constraints:** Design for smallest screen first
2. **Prioritize content:** Mobile has limited space, show what matters
3. **Design for thumbs:** Place primary actions in easy-to-reach areas
4. **Minimize input:** Use pickers, toggles, and smart defaults
5. **Provide feedback:** Visual and haptic feedback for all interactions
6. **Optimize performance:** Mobile devices have less power than desktops
7. **Test on real devices:** Simulators don't capture the full experience

## Platform-Specific Implementation Tips

### iOS Development

- Use SwiftUI for modern iOS apps (iOS 14+)
- Leverage SF Symbols for consistent iconography
- Implement proper state management with `@State`, `@Binding`, `@ObservedObject`
- Use native components over custom when possible
- Follow Apple's modifiers and view builders pattern

### Android Development

- Use Jetpack Compose for modern Android apps (API 21+)
- Follow Material Design 3 (Material You) guidelines
- Implement proper theme support (light/dark)
- Use Material color roles (primary, secondary, tertiary)
- Leverage Material components library

### Cross-Platform Development

**React Native:**
- Use platform-specific files (`.ios.js`, `.android.js`) when needed
- Leverage `Platform.select()` for platform differences
- Use React Navigation for navigation patterns
- Consider React Native Paper or Native Base for Material components

**Flutter:**
- Use Material widgets for Android look
- Use Cupertino widgets for iOS look
- Platform-adaptive widgets automatically select appropriate style
- Flutter has excellent built-in navigation support

## Summary

Mobile UI design requires understanding platform conventions and implementing appropriate patterns for each ecosystem. Focus on:

1. **Platform adherence:** Follow Material Design for Android, HIG for iOS
2. **Appropriate navigation:** Bottom tabs for primary, drawers for secondary
3. **Touch-optimized:** Minimum 44pt/48dp touch targets, proper spacing
4. **Responsive:** Design for multiple screen sizes and orientations
5. **Accessible:** Support system accessibility features
6. **Performant:** Optimize for mobile device capabilities

Consult the reference files for detailed platform specifications and the examples directory for working implementations.
