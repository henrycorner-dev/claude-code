---
name: game-ui-design
description: This skill should be used when the user asks to "create a HUD", "design a health bar", "build a menu system", "create a pause menu", "implement touch controls", "add controller input", "make UI responsive", "adapt UI for mobile", "handle gamepad navigation", or mentions game UI elements (health bars, mini-maps, crosshairs, radial menus, virtual joysticks). Provides comprehensive guidance for designing and implementing game user interfaces with focus on HUDs, menus, input handling, and adaptive layouts across Unity, Unreal Engine, and web platforms.
version: 0.1.0
---

# Game UI Design

## Overview

Game UI design encompasses the visual and interactive elements that connect players with game systems. Effective game UI balances information delivery with aesthetic appeal while adapting to various platforms, input methods, and screen configurations.

This skill covers:
- **HUD Design**: Health bars, mini-maps, crosshairs, objective markers, and in-game overlays
- **Menu Systems**: Main menus, pause screens, settings interfaces, and inventory management
- **Input Handling**: Keyboard/mouse, controller/gamepad, touch controls, and cross-platform input
- **Responsive Design**: Multi-platform support, safe areas, screen adaptation, and orientation handling

## When to Use This Skill

Apply this skill when:
- Designing or implementing HUD elements (health bars, ammo counters, mini-maps)
- Creating menu systems (main menu, pause menu, settings)
- Implementing input handling for multiple devices (controller, touch, keyboard/mouse)
- Adapting UI for different platforms (mobile, console, PC)
- Solving navigation or interaction challenges in game interfaces
- Optimizing UI for various screen sizes and aspect ratios

## Core Principles

### Visual Hierarchy

Organize information by importance:

**Primary Information** (largest, highest contrast):
- Player health and status
- Current objective
- Critical alerts

**Secondary Information** (visible but less prominent):
- Resources (ammo, currency)
- Mini-map or radar
- Ability cooldowns

**Tertiary Information** (contextual):
- Interaction prompts
- Tutorial hints
- Damage indicators

### Screen Layout

Position elements strategically:
- **Top-Left**: Health, shields (most critical for LTR readers)
- **Top-Right**: Resources, mini-map
- **Bottom-Left**: Inventory, buffs
- **Bottom-Right**: Score, XP
- **Top-Center**: Objectives, timers
- **Bottom-Center**: Interaction prompts

### Clarity and Readability

Ensure UI remains readable in all conditions:
- Use high-contrast colors and fonts
- Add outlines or drop shadows to text
- Minimum font sizes: 18-24px (console), 14-16px (PC), 14px+ (mobile)
- Test against varied backgrounds and lighting
- Provide colorblind-accessible options

### Feedback and Response

Provide immediate feedback for all interactions:
- **Visual**: Scale, color change, animation
- **Audio**: Click sounds, confirmation chimes
- **Haptic**: Controller rumble, mobile vibration

## HUD Design Essentials

### Common HUD Elements

**Health Bars:**
- Linear, segmented, or radial displays
- Color coding: Green (healthy) → Yellow (caution) → Red (critical)
- Damage feedback: Flash, shake, pulse
- Support multiple layers (health + shields + armor)

**Resource Management:**
- Ammunition displays with reserves
- Cooldown indicators (numerical or circular fill)
- Stamina/mana bars with regeneration visualization

**Mini-Maps:**
- Player position (centered or dynamic)
- Objective markers
- Enemy/ally indicators
- Fog of war for unexplored areas

**Damage Indicators:**
- Directional arrows or screen-edge vignettes
- Color-coded by threat level
- Fade based on time and distance

Consult **`references/hud-patterns.md`** for detailed HUD design patterns, positioning strategies, genre-specific layouts, and visual design guidelines.

### HUD Best Practices

- Show only essential information during action
- Use progressive disclosure (hide less important info)
- Group related information spatially
- Provide HUD scale and opacity options
- Test readability in worst-case scenarios
- Consider "minimal HUD" mode for experienced players

## Menu System Design

### Menu Architecture

Structure menus hierarchically with clear navigation:

```
Main Menu → New Game → Character Creation → Gameplay
         → Settings → Graphics / Audio / Controls
         → Load Game → Save Slot Selection
```

Use state management to track current menu, previous menu, and navigation stack for proper back-button behavior.

### Essential Menu Components

**Buttons:**
- Clear states: Normal, hover, pressed, disabled, focused
- Minimum touch target: 44x44 pixels
- Visual feedback for all interactions
- Consistent sizing within menus

**Input Fields:**
- Placeholder text and character limits
- Real-time validation feedback
- Virtual keyboard support (mobile/console)

**Sliders:**
- Show current value (percentage or label)
- Immediate feedback (e.g., audio playback for volume)
- Large enough handles for touch/controller

**Toggle Switches:**
- Clear ON/OFF states with animation
- Use in addition to color (accessibility)

### Navigation Patterns

**Linear Navigation:**
- Wrap-around: Last item → First item
- Arrow keys/D-pad for movement
- Enter/A to confirm, ESC/B to cancel

**Grid Navigation:**
- Two-dimensional movement
- Support both D-pad and analog stick
- Visual focus indicators

**Tab Navigation:**
- Shoulder buttons (LB/RB) for tab switching
- Remember last selected item in each tab
- Clear active tab indicator

Consult **`references/menu-systems.md`** for comprehensive menu architecture patterns, component design, state management, visual styling, and implementation examples.

### Menu Best Practices

- Keep hierarchy shallow (3-4 levels maximum)
- Provide clear back/cancel options
- Animate transitions smoothly (200-400ms)
- Remember user position when returning
- Confirm destructive actions (quit, delete save)
- Test with keyboard, mouse, and controller

## Input Handling

### Multi-Input Support

Design for all input methods simultaneously:

**Keyboard and Mouse:**
- Arrow keys + Tab navigation
- Mouse hover and click
- Show keyboard shortcuts on buttons
- Support rebinding

**Controller/Gamepad:**
- D-pad or analog stick for navigation
- Face buttons for confirm/cancel (A/× confirm, B/◯ cancel)
- Shoulder buttons for tab switching
- Show platform-specific button icons (Xbox vs PlayStation)

**Touch Input:**
- Large touch targets (minimum 44x44px)
- Swipe gestures for common actions
- Virtual joysticks and button overlays
- Long-press for context menus
- Haptic feedback

### Input Systems

**Unity New Input System:**
- Define Input Actions (Player, UI, Vehicle)
- Switch action maps based on context (gameplay vs menu)
- Support multiple devices simultaneously

**Unreal Enhanced Input:**
- Input Actions and Input Mapping Contexts
- Swap contexts when entering/exiting menus

**Web-based:**
- Gamepad API for controller support
- Touch events for mobile
- Keyboard event listeners
- Auto-detect input method and switch icons

### Controller Navigation

Optimize for controller:
- Radial menus for quick access
- Shoulder buttons for tab switching
- Trigger buttons for fast scrolling
- Clear focus indicators
- Haptic feedback on selection

Consult **`references/input-handling.md`** for detailed input implementation, controller mapping, touch gesture patterns, input remapping, and cross-platform input abstraction.

### Input Best Practices

- Auto-detect input device and switch prompts
- Support full key/button remapping
- Provide accessibility options (toggle vs hold, aim assist)
- Test with actual hardware
- Handle disconnected controllers gracefully
- Use appropriate button prompts per platform

## Responsive and Adaptive Design

### Platform Adaptation

Adapt UI for each platform:

**Mobile:**
- Larger touch targets (44x44px minimum)
- Bottom-sheet modals instead of center dialogs
- Simplified layouts (fewer columns)
- Virtual controls with customizable positions
- Respect safe areas (notches, home indicators)

**Tablet:**
- Multi-column layouts
- Split-screen for menus
- Support both touch and mouse/trackpad
- Utilize extra screen space

**Desktop/Console:**
- Smaller UI elements (more screen space)
- Higher information density
- Hover states and tooltips
- Keyboard shortcuts

### Screen Size Handling

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop/Console: > 1024px

**Unity Canvas Scaler:**
- Use "Scale With Screen Size" mode
- Set reference resolution (e.g., 1920x1080)
- Adjust match width/height (0.5 for balanced)

**Anchors and Constraints:**
- Anchor UI elements to appropriate corners
- Use stretch anchors for full-screen panels
- Test at multiple aspect ratios (16:9, 21:9, 4:3, 19.5:9)

### Safe Areas

Respect device safe zones:

**Mobile Safe Areas:**
- Avoid notches and camera cutouts
- Account for home indicators
- Use Screen.safeArea (Unity) or env(safe-area-inset-*) (CSS)

**Console Safe Zones:**
- TV overscan: Keep important UI within 90% (action safe)
- Text within 80% (title safe)
- 5% margin recommended

### Orientation Handling

Support both orientations:
- Detect portrait vs landscape
- Adapt layout dynamically
- Lock orientation if game requires it
- Test control positions for each orientation

Consult **`references/responsive-design.md`** for detailed responsive techniques, canvas scaling, safe area implementation, platform-specific optimizations, and layout strategies.

### Responsive Best Practices

- Use anchors and relative sizing
- Test on real devices
- Provide UI scale options (50% - 150%)
- Respect all safe areas
- Optimize for platform (touch vs mouse)
- Test all aspect ratios and orientations

## Implementation Examples

### Unity Health Bar

See **`examples/unity-health-bar.cs`** for a complete Unity health bar implementation featuring:
- Smooth lerp animation
- Damage bar (shows recent damage)
- Color gradient based on health
- Auto-hide with fade
- Text display

Key features:
- Configurable animation speeds
- Damage flash feedback
- Progressive disclosure
- Fully customizable in Inspector

### Unreal Pause Menu

See **`examples/unreal-pause-menu.cpp`** for a complete UMG pause menu implementation featuring:
- Resume, Settings, Main Menu, Quit buttons
- Controller navigation with ESC/B to close
- Fade in/out animations
- Sound effects
- Input mode switching

Key features:
- Event-driven button callbacks
- Animation support
- Mouse cursor handling
- Game pause management

### Web Touch Controls

See **`examples/web-touch-controls.js`** for a complete web-based touch control system featuring:
- Virtual joystick with deadzone
- Action buttons with visual feedback
- Swipe gesture detection
- Orientation adaptation
- Haptic feedback

Key features:
- Responsive layout
- Desktop mouse support (testing)
- Debug display
- Customizable appearance

## Additional Resources

### Reference Files

For detailed patterns and techniques, consult:

- **`references/hud-patterns.md`** - HUD design patterns, screen zones, genre-specific layouts, visual hierarchy, diegetic vs non-diegetic UI, common elements (health bars, mini-maps, crosshairs, damage indicators), mobile considerations, and performance optimization

- **`references/menu-systems.md`** - Menu architecture, navigation patterns, component design (buttons, sliders, dropdowns, tabs, modals), visual design principles, state management, accessibility, platform-specific menu types, and implementation patterns

- **`references/input-handling.md`** - Input methods (keyboard/mouse, controller, touch, motion), input systems (Unity, Unreal, Web), controller navigation patterns, touch gestures, input remapping, feedback systems, cross-platform detection, and accessibility

- **`references/responsive-design.md`** - Screen sizes, aspect ratios, breakpoints, layout techniques (Canvas Scaler, anchors, flexbox, grid), safe areas, platform-specific optimizations, orientation handling, dynamic scaling, and testing strategies

### Working Examples

Practical implementations in **`examples/`**:
- **`unity-health-bar.cs`** - Animated health bar with damage feedback
- **`unreal-pause-menu.cpp`** - Complete pause menu system with UMG
- **`web-touch-controls.js`** - Mobile touch controls for web games

## Platform-Specific Notes

### Unity
- Use Canvas Scaler with "Scale With Screen Size"
- New Input System for modern input handling
- TextMeshPro for high-quality text
- Layout Groups for dynamic layouts (use sparingly)
- Profile canvas rebuilds for performance

### Unreal Engine
- UMG (Unreal Motion Graphics) for UI
- Enhanced Input System for input handling
- Widget Blueprints for visual design
- Size To Content for dynamic sizing
- Use Invalidation Boxes for performance

### Web-based Games
- CSS Flexbox or Grid for layout
- Gamepad API for controller support
- Touch events for mobile
- Viewport units (vw, vh) for responsive sizing
- RequestAnimationFrame for smooth updates

## Common Pitfalls to Avoid

❌ **Don't:**
- Hard-code positions and sizes
- Ignore safe areas on mobile
- Use tiny text or touch targets
- Rely only on color for information
- Forget to test with controllers
- Make UI elements too small on high-DPI screens
- Ignore performance (excessive redraws)

✅ **Do:**
- Use anchors and relative sizing
- Test on real devices
- Provide accessibility options
- Support multiple input methods
- Animate state transitions
- Profile and optimize
- Iterate based on playtesting

## Testing Checklist

Essential tests for game UI:

- [ ] Readable at smallest supported screen
- [ ] No overlapping elements at any size
- [ ] Touch targets large enough (44x44px minimum)
- [ ] Text wraps or truncates properly
- [ ] All UI elements within safe areas
- [ ] Controller navigation works smoothly
- [ ] Keyboard navigation supported
- [ ] Hover states clear and consistent
- [ ] Loading states shown for async operations
- [ ] Confirmation dialogs for destructive actions
- [ ] Performance acceptable (60fps on target hardware)
- [ ] Tested with colorblind simulation
- [ ] UI scale options work correctly

## Summary

Effective game UI design balances information delivery, aesthetics, and usability across diverse platforms and input methods. Focus on clarity, provide immediate feedback, and adapt interfaces to each platform's strengths. Always test with real players and iterate based on feedback. Use the reference files for detailed patterns and examples for practical implementation guidance.
