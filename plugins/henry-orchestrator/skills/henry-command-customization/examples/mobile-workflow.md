# Example: Mobile-Specific Workflow

## Overview

This example demonstrates adapting a Henry command for platform-specific needs. Shows how to modify agent selection and workflow to match platform requirements (mobile iOS/Android).

## Scenario

**Standard henry-feature is web-focused:**
- Uses ui-visual-designer for web design
- Implementation assumes web technologies
- Testing focuses on browsers
- Performance targets are web-oriented

**Need: Mobile app feature development for iOS/Android**

## Key Differences for Mobile

### Design
- Must follow platform guidelines (iOS HIG, Material Design)
- Mobile-specific patterns (navigation, gestures)
- Different screen sizes and orientations
- Offline-first considerations

### Implementation
- Native (Swift/Kotlin) or React Native
- Platform-specific APIs and permissions
- Background task handling
- Memory and battery constraints

### Testing
- Multiple devices and OS versions
- Offline/online transitions
- Interruptions (calls, notifications)
- App store compliance

### Performance
- Cold start time (< 2s)
- Memory footprint
- ANR (Application Not Responding) rate
- Crash-free rate

## Solution: Mobile Feature Command

Create platform-specific command with mobile-focused agents and phases.

### File: `.claude/commands/mobile-feature.md`

```markdown
---
description: Mobile app feature development for iOS/Android
argument-hint: [feature-name] [platform]
version: "1.0.0"
---

# Mobile Feature Development

End-to-end mobile feature development with platform-specific considerations for iOS and Android.

## Phase 1: Mobile UX Design

**Goal**: Create platform-appropriate UX design

**Actions**:
1. Launch ux-ui-designer for mobile-first design
2. Apply platform-specific guidelines:
   - iOS: Human Interface Guidelines
   - Android: Material Design principles
3. Design for mobile-specific patterns:
   - Navigation: Tab bars (iOS), Bottom nav (Android)
   - Gestures: Swipe, long-press, pinch-to-zoom
   - Components: Native-feeling controls
4. Consider offline-first requirements
5. Design for multiple screen sizes:
   - Phones: Various sizes
   - Tablets: iPad, Android tablets
6. Handle edge cases:
   - Keyboard appearance
   - Safe area insets (notches, home indicators)
   - Orientation changes

**Agents**: ux-ui-designer, mobile-app-engineer

**Deliverables**:
- Platform-specific wireframes
- Design mockups for key screens
- Interactive prototypes
- Design assets (icons, images in required sizes)

**User Interaction**: Review and approve designs. Confirm platform(s): iOS, Android, or both

## Phase 2: Mobile Implementation

**Goal**: Implement feature for target platform(s)

**Actions**:
1. Launch mobile-app-engineer for implementation
2. Choose technology stack:
   - Native: Swift (iOS) / Kotlin (Android)
   - Cross-platform: React Native, Flutter
3. Implement core feature:
   - Follow platform best practices
   - Use platform-appropriate architecture (MVVM, Redux, etc.)
   - Implement offline-first if required
4. Handle platform-specific requirements:
   - Permissions (camera, location, notifications)
   - Background tasks
   - Push notifications
   - Deep linking
5. Optimize for mobile:
   - Minimize cold start time
   - Reduce memory footprint
   - Efficient image loading
   - Minimize network requests
6. Handle edge cases:
   - Low connectivity
   - Background/foreground transitions
   - Interruptions (calls, app switching)

**Agents**: mobile-app-engineer

**Deliverables**:
- Mobile app implementation
- Platform-specific optimizations
- Offline support (if required)

**User Interaction**: Provide build for testing if needed

## Phase 3: Mobile-Specific QA

**Goal**: Comprehensive testing across devices and scenarios

**Actions**:
1. Launch qa-tester for mobile test strategy
2. Device testing:
   - iOS: Test on multiple iPhone models (various screen sizes)
   - iOS: Test on iPad if applicable
   - Android: Test on multiple manufacturers (Samsung, Google Pixel, etc.)
   - Test on various OS versions
3. Scenario testing:
   - Offline/online transitions
   - Background/foreground transitions
   - Interruptions:
     * Incoming calls
     * Notifications
     * Low battery warnings
     * App switching
   - Permission flows
4. Performance testing:
   - Cold start time
   - Memory usage
   - Battery drain
   - Network efficiency
5. App store compliance:
   - iOS: App Store Review Guidelines
   - Android: Google Play Policy
   - Privacy policy requirements
   - Required disclosures

**Agents**: qa-tester, mobile-app-engineer

**Deliverables**:
- Mobile test results
- Device compatibility matrix
- Test coverage report
- Known issues and workarounds

## Phase 4: Performance Optimization

**Goal**: Meet mobile performance targets

**Actions**:
1. Launch performance-engineer for mobile metrics
2. Measure and optimize cold start time:
   - Target: < 2 seconds
   - Optimize app initialization
   - Lazy load dependencies
3. Reduce memory footprint:
   - Profile memory usage
   - Fix memory leaks
   - Optimize image loading
4. Minimize ANR (Android) / Hang rate (iOS):
   - Target ANR rate: < 0.5%
   - Move heavy work off main thread
   - Optimize blocking operations
5. Achieve high crash-free rate:
   - Target: > 99.5%
   - Fix crash issues
   - Add error handling
6. Optimize battery usage:
   - Profile energy impact
   - Minimize background activity
   - Optimize network requests
7. Reduce app size (if needed):
   - Remove unused code
   - Optimize assets
   - Use compression

**Agents**: performance-engineer, mobile-app-engineer

**Deliverables**:
- Performance benchmarks
- Optimization report
- Before/after metrics comparison

## Summary

Complete mobile feature ready for release:

**Design:**
- ✅ Platform-appropriate UX following iOS/Android guidelines
- ✅ Mobile-first design with offline support
- ✅ Responsive across device sizes

**Implementation:**
- ✅ Native or cross-platform implementation
- ✅ Platform-specific features handled
- ✅ Optimized for mobile constraints

**Testing:**
- ✅ Tested on multiple devices and OS versions
- ✅ Scenario testing (offline, interruptions, etc.)
- ✅ App store compliance validated

**Performance:**
- ✅ Cold start time: [X]s (target: < 2s)
- ✅ Memory usage: [X]MB
- ✅ ANR/Hang rate: [X]% (target: < 0.5%)
- ✅ Crash-free rate: [X]% (target: > 99.5%)

**Next Steps:**
- Prepare app store listing (if new app)
- Submit for internal testing:
  * iOS: TestFlight
  * Android: Google Play Internal Testing
- Gather user feedback and iterate
- Plan phased rollout

---

## Usage Examples

**iOS feature:**
```
/mobile-feature offline-notes iOS
```

**Android feature:**
```
/mobile-feature payment-flow Android
```

**Cross-platform React Native:**
```
/mobile-feature user-profile "iOS and Android"
```

**Tablet-optimized:**
```
/mobile-feature dashboard-view "iPad and Android tablets"
```
```

### Usage

```bash
# iOS feature
/mobile-feature biometric-auth iOS

# Android feature
/mobile-feature home-screen-widget Android

# Cross-platform
/mobile-feature offline-sync "iOS and Android"
```

## Key Modifications from Standard henry-feature

### Agent Changes

| Standard | Mobile | Reason |
|----------|--------|--------|
| ui-visual-designer | mobile-app-engineer | Mobile needs platform-specific expertise |
| frontend-engineer | mobile-app-engineer | Mobile app development, not web |
| performance-engineer (web metrics) | performance-engineer (mobile metrics) | Different performance targets |

### Phase Adjustments

**Phase 1: Design**
- Added platform guideline compliance
- Added mobile-specific patterns
- Added offline considerations
- Added multiple screen size handling

**Phase 2: Implementation**
- Changed from web to mobile technologies
- Added platform-specific requirements (permissions, etc.)
- Added offline-first implementation
- Added mobile optimization considerations

**Phase 3: Testing**
- Changed from browser testing to device testing
- Added OS version testing
- Added mobile-specific scenarios (interruptions, etc.)
- Added app store compliance check

**Phase 4: Performance**
- Changed metrics from web (LCP, FID) to mobile (cold start, ANR)
- Added mobile-specific targets
- Added battery and memory optimization
- Added app size optimization

## Platform-Specific Variations

### iOS-Specific Workflow

If targeting iOS only, can optimize further:

```markdown
## Phase 1: iOS Design

**Actions**:
- Follow iOS Human Interface Guidelines strictly
- Use iOS-native components (UIKit/SwiftUI)
- Consider iOS-specific features:
  * Face ID / Touch ID
  * Siri Shortcuts
  * Widgets
  * App Clips

## Phase 2: Swift Implementation

**Actions**:
- Implement using Swift and SwiftUI/UIKit
- Follow iOS architecture patterns (MVVM, Coordinator)
- Use iOS system frameworks
- Integrate with iOS features

## Phase 3: iOS Testing

**Actions**:
- Test on iPhone models (SE, standard, Pro, Pro Max)
- Test on iPad (if universal app)
- Test on various iOS versions (n, n-1, n-2)
- TestFlight beta testing
```

### Android-Specific Workflow

If targeting Android only:

```markdown
## Phase 1: Android Design

**Actions**:
- Follow Material Design guidelines
- Use Material Design components
- Consider Android-specific features:
  * Home screen widgets
  * Live wallpapers
  * Quick Settings tiles
  * Android Auto / Wear OS (if applicable)

## Phase 2: Kotlin Implementation

**Actions**:
- Implement using Kotlin and Jetpack Compose/Views
- Follow Android architecture patterns (MVVM, MVI)
- Use Android Jetpack libraries
- Handle Android fragmentation

## Phase 3: Android Testing

**Actions**:
- Test on multiple manufacturers
- Test on various screen sizes and densities
- Test on Android versions (API 21+ typically)
- Google Play Internal Testing
```

### React Native Workflow

If using React Native:

```markdown
## Phase 2: React Native Implementation

**Actions**:
- Implement using React Native
- Use platform-agnostic components where possible
- Handle platform differences with Platform.select
- Implement native modules if needed
- Optimize bundle size
- Consider Expo vs bare workflow

## Phase 3: Cross-Platform Testing

**Actions**:
- Test on both iOS and Android
- Verify platform-specific variations
- Test on various devices on both platforms
- Ensure consistent experience (or appropriate differences)
```

## When to Use Mobile Workflow

### Use When:
- ✅ Building mobile app feature
- ✅ Need platform-specific guidance
- ✅ Mobile-specific concerns (offline, performance, etc.)
- ✅ App store submission requirements

### Use Standard henry-feature When:
- ❌ Building web application
- ❌ Progressive Web App (PWA)
- ❌ Electron/desktop app
- ❌ Backend-only feature

## Tips

**Platform guidelines:**
- iOS: https://developer.apple.com/design/human-interface-guidelines/
- Android: https://m3.material.io/

**Performance targets:**
- Cold start: < 2 seconds
- ANR rate: < 0.5%
- Crash-free rate: > 99.5%
- Memory: Minimize for low-end devices

**Testing devices:**
- iOS: Cover iPhone SE (small), standard, Pro Max (large), iPad
- Android: Cover multiple manufacturers, screen sizes, Android versions

**App store requirements:**
- iOS App Store: Review Guidelines, Privacy Requirements
- Google Play: Developer Policy, Privacy Policy

## Combining with Other Patterns

### Mobile + Extended

Add additional mobile-specific phases:

```markdown
# Mobile Feature with Analytics

[Standard mobile phases 1-4]

## Phase 5: Analytics Integration

**Goal**: Add mobile analytics tracking

**Actions**:
1. Integrate analytics SDK (Firebase, Amplitude, etc.)
2. Define events to track
3. Implement tracking
4. Verify data collection
```

### Mobile + Conditional

Add conditional platform-specific phases:

```markdown
# Mobile Feature with Platform Extensions

[Standard mobile phases]

## Phase 5: iOS Extensions (Conditional)

**Condition**: Only for iOS

**Actions**:
- Implement iOS widgets
- Add Siri Shortcuts
- Create App Clips

## Phase 6: Android Extensions (Conditional)

**Condition**: Only for Android

**Actions**:
- Implement home screen widgets
- Add Quick Settings tiles
```

## Related Examples

- **Subset Agents**: `examples/subset-agents.md`
- **Extended Workflow**: `examples/extended-workflow.md`
- **Sequential Workflow**: `examples/sequential-workflow.md`
- **All Patterns**: `references/customization-patterns.md`
