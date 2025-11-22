---
name: native-integration
description: This skill should be used when the user asks to "add camera access", "implement GPS tracking", "set up biometric authentication", "create platform channel", "access device sensors", "integrate native functionality", "use device APIs", "add native module", "bridge to native code", or mentions Flutter MethodChannel/EventChannel, React Native NativeModules, Capacitor plugins, or Cordova plugins for accessing device hardware.
version: 0.1.0
---

# Native Integration

Bridge mobile and desktop applications to native device APIs (camera, GPS, biometrics, sensors) through platform channels and native modules.

## Overview

Native integration enables cross-platform applications to access platform-specific device capabilities that aren't available through standard web APIs. This skill provides guidance for implementing platform channels and native modules across Flutter, React Native, Capacitor, and Cordova frameworks.

**Core capabilities covered:**
- Platform channel implementation (Flutter, React Native, Capacitor, Cordova)
- Device API access (camera, GPS, biometrics, sensors, Bluetooth)
- Permission handling across platforms
- Bidirectional communication patterns
- Error handling and graceful degradation

## When to Use This Skill

Use this skill when implementing features that require:
- **Camera access** - Taking photos, recording video, scanning QR codes
- **Location services** - GPS tracking, geofencing, maps integration
- **Biometric authentication** - Fingerprint, Face ID, Touch ID
- **Device sensors** - Accelerometer, gyroscope, magnetometer, proximity
- **Bluetooth connectivity** - BLE devices, peripherals, beacons
- **File system access** - Reading/writing files, accessing device storage
- **Haptic feedback** - Vibration, tactile responses
- **Platform-specific features** - HealthKit (iOS), Google Fit (Android)

## Platform Channel Patterns

### Communication Types

**Method Channels** - One-off method calls from app to native code
- Use for: Taking a photo, requesting current location, single operations
- Pattern: Promise-based request/response

**Event Channels** - Streaming data from native to app
- Use for: GPS updates, sensor data, continuous monitoring
- Pattern: Observable/stream-based data flow

**Message Channels** - Bidirectional asynchronous messaging
- Use for: Complex data structures, custom serialization
- Pattern: Custom codec implementation

### Framework-Specific Implementation

**Flutter:**
- `MethodChannel` for method calls
- `EventChannel` for streaming data
- `BasicMessageChannel` for custom messaging
- Platform-specific implementations in Kotlin/Swift

**React Native:**
- `NativeModules` for method calls
- `NativeEventEmitter` for events
- Promise-based APIs
- Platform packages for registration

**Capacitor:**
- Plugin architecture with TypeScript definitions
- Web fallback support
- Automatic iOS/Android bridging
- Consistent API across platforms

**Cordova:**
- Plugin.xml configuration
- exec() bridge for communication
- Callback-based APIs
- Platform-specific implementations

## Device API Implementation

### Camera Access

Implement camera functionality with proper permission handling:

1. **Check availability** - Verify camera hardware exists
2. **Request permissions** - Handle iOS/Android permission models
3. **Initialize camera** - Configure resolution, flash, orientation
4. **Capture media** - Take photos or record video
5. **Handle errors** - Permission denied, hardware unavailable

**Key considerations:**
- iOS requires `NSCameraUsageDescription` in Info.plist
- Android requires runtime permission requests (API 23+)
- Handle different camera types (front/back, wide/telephoto)
- Manage memory for captured images

### GPS/Location Services

Implement location tracking with accuracy options:

1. **Request permissions** - "When in use" vs "Always" (iOS), Fine vs Coarse (Android)
2. **Configure accuracy** - High accuracy vs battery saving
3. **Get current location** - One-time position request
4. **Subscribe to updates** - Continuous location tracking
5. **Handle background location** - Special permissions and considerations

**Key considerations:**
- Battery impact of accuracy settings
- Background location requires additional permissions
- Geofencing capabilities
- Distance filters to reduce updates

### Biometric Authentication

Implement secure biometric authentication:

1. **Check availability** - Verify biometric hardware and enrollment
2. **Determine type** - Face ID, Touch ID, fingerprint, iris
3. **Present prompt** - Localized reason for authentication
4. **Handle result** - Success, failure, fallback to passcode
5. **Error handling** - Locked out, not enrolled, cancelled

**Key considerations:**
- iOS requires `NSFaceIDUsageDescription` in Info.plist
- Android BiometricPrompt API (API 28+)
- Fallback authentication methods
- Security best practices for storing auth results

### Device Sensors

Access accelerometer, gyroscope, and other sensors:

1. **Check sensor availability** - Not all devices have all sensors
2. **Configure update frequency** - Balance data rate with battery
3. **Subscribe to sensor events** - Start receiving data
4. **Process sensor data** - Handle x, y, z values
5. **Unsubscribe when done** - Prevent battery drain

**Common sensors:**
- Accelerometer - Device motion and orientation
- Gyroscope - Rotation rate
- Magnetometer - Compass heading
- Proximity - Nearby objects
- Ambient light - Screen brightness adjustment

## Permission Handling

### Permission Model Differences

**iOS:**
- Declared in Info.plist with usage descriptions
- Requested at runtime when feature is first used
- Three states: Not Determined, Denied, Authorized
- Cannot request permission again after denial (must direct to Settings)

**Android:**
- Declared in AndroidManifest.xml
- Runtime permissions required for dangerous permissions (API 23+)
- Can request permissions multiple times
- "Don't ask again" option after repeated denials

### Permission Flow

1. **Check current permission status**
2. **Show rationale if needed** (especially on Android)
3. **Request permission**
4. **Handle result** - Granted, denied, or "don't ask again"
5. **Direct to settings** if permanently denied

**Best practices:**
- Request permissions in context (when user taps "Take Photo")
- Explain why permission is needed
- Provide fallback functionality if permission denied
- Respect user privacy choices

## Error Handling Patterns

### Consistent Error Codes

Define standard error codes across platforms:

```
PERMISSION_DENIED - User denied permission
NOT_AVAILABLE - Feature not available on device
OPERATION_FAILED - Generic operation failure
CANCELLED - User cancelled operation
TIMEOUT - Operation timed out
```

### Graceful Degradation

Handle missing features gracefully:

1. **Feature detection** - Check if API is available
2. **Fallback options** - Alternative implementation or UI
3. **User feedback** - Clear error messages
4. **Recovery options** - How user can enable feature

### Platform-Specific Error Handling

**iOS:**
- LAError codes for biometrics
- CLError codes for location
- AVError codes for camera

**Android:**
- BiometricPrompt error codes
- LocationSettingsStatusCodes
- Camera2 exceptions

## Threading and Performance

### Background Thread Execution

Long-running operations should run on background threads:

**Flutter/Android:**
- Use Kotlin coroutines or RxJava
- Return results on main thread for UI updates

**Flutter/iOS:**
- Use Grand Central Dispatch (GCD)
- Dispatch back to main queue for results

**React Native:**
- Native modules run on separate thread by default
- Return results automatically marshalled to JS thread

### Memory Management

**Important considerations:**
- Release camera resources when done
- Unsubscribe from location updates
- Cancel pending operations on screen unmount
- Avoid memory leaks with proper cleanup

## Testing Native Integrations

### Testing Strategy

1. **Unit test native code** - Platform-specific test frameworks
2. **Mock platform channels** - Test app-side logic without native code
3. **Integration testing** - Test complete flow with mock responses
4. **Manual testing on devices** - Hardware features require real devices
5. **Permission flow testing** - Test all permission states

### Emulator Limitations

Many features don't work in emulators:
- Biometrics (fingerprint, Face ID)
- Camera (limited functionality)
- GPS (can simulate location)
- Bluetooth (limited support)
- Sensors (can simulate some)

**Always test hardware features on real devices**

## Common Pitfalls

1. **Not handling permissions properly** - Always check before accessing features
2. **Forgetting platform differences** - iOS and Android handle many things differently
3. **Memory leaks** - Not cleaning up listeners and handlers
4. **Thread safety issues** - UI updates must be on main thread
5. **Type mismatches** - Data serialization between platforms can fail
6. **Missing null checks** - Native APIs frequently return null
7. **Testing only on emulators** - Hardware features behave differently on real devices
8. **Ignoring battery impact** - Location and sensor access can drain battery quickly

## Additional Resources

### Reference Files

For detailed implementation patterns and API references:

- **`references/platform-channels.md`** - Complete platform channel patterns for Flutter, React Native, Capacitor, and Cordova with code examples, error handling, threading, and testing guidance
- **`references/device-apis.md`** - Comprehensive device API reference covering camera, GPS, biometrics, sensors, Bluetooth, file system, haptics, battery, network connectivity, and platform-specific features like HealthKit and Google Fit

### Example Files

Working implementation examples in `examples/`:

- **`flutter-camera-channel.dart`** - Complete Flutter camera integration with MethodChannel, including Dart UI code, Kotlin (Android) implementation, and Swift (iOS) implementation showing permission handling, photo capture, and error handling
- **`react-native-location-module.js`** - Complete React Native location tracking with NativeModules and EventEmitter, including JavaScript UI code, Java (Android) implementation with FusedLocationProviderClient, and Swift (iOS) implementation with CoreLocation
- **`capacitor-biometric-plugin.ts`** - Complete Capacitor biometric authentication plugin with TypeScript definitions, web fallback, Swift (iOS) implementation using LocalAuthentication, and Java (Android) implementation using BiometricPrompt

## Implementation Workflow

When implementing native integration:

1. **Identify the device capability needed** (camera, GPS, biometrics, etc.)
2. **Choose the appropriate communication pattern** (MethodChannel, EventChannel, NativeModules, etc.)
3. **Consult `references/platform-channels.md`** for framework-specific patterns
4. **Review `references/device-apis.md`** for API-specific implementation details
5. **Study relevant example files** for complete working implementations
6. **Implement platform-specific code** for iOS and Android
7. **Add proper permission handling** in manifest/Info.plist and runtime
8. **Test on real devices** to verify hardware functionality
9. **Handle errors gracefully** with user-friendly messages
10. **Clean up resources** to prevent memory leaks and battery drain

Focus on proper permission handling, error management, and platform-specific differences for robust native integrations.
