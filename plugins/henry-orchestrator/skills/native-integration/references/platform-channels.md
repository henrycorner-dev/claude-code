# Platform Channel Patterns

This reference provides detailed patterns for implementing platform channels across different frameworks.

## Flutter Platform Channels

### MethodChannel Pattern

**Use for:** One-off method calls from Dart to native code

```dart
// Dart side
class CameraService {
  static const platform = MethodChannel('com.example.app/camera');

  Future<String> takePicture() async {
    try {
      final String result = await platform.invokeMethod('takePicture');
      return result;
    } on PlatformException catch (e) {
      throw 'Failed to take picture: ${e.message}';
    }
  }
}
```

```kotlin
// Android (Kotlin)
class MainActivity: FlutterActivity() {
  private val CHANNEL = "com.example.app/camera"

  override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
    super.configureFlutterEngine(flutterEngine)
    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
      call, result ->
      if (call.method == "takePicture") {
        takePicture(result)
      } else {
        result.notImplemented()
      }
    }
  }

  private fun takePicture(result: MethodChannel.Result) {
    // Implementation
    result.success("path/to/image.jpg")
  }
}
```

```swift
// iOS (Swift)
class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let controller = window?.rootViewController as! FlutterViewController
    let channel = FlutterMethodChannel(name: "com.example.app/camera",
                                      binaryMessenger: controller.binaryMessenger)

    channel.setMethodCallHandler { (call: FlutterMethodCall, result: @escaping FlutterResult) in
      if call.method == "takePicture" {
        self.takePicture(result: result)
      } else {
        result(FlutterMethodNotImplemented)
      }
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  private func takePicture(result: FlutterResult) {
    // Implementation
    result("path/to/image.jpg")
  }
}
```

### EventChannel Pattern

**Use for:** Streaming data from native to Dart (GPS updates, sensor data)

```dart
// Dart side
class LocationService {
  static const stream = EventChannel('com.example.app/location');

  Stream<Map<String, double>> get locationStream {
    return stream.receiveBroadcastStream().map((dynamic event) {
      return Map<String, double>.from(event);
    });
  }
}
```

```kotlin
// Android (Kotlin)
class LocationStreamHandler(private val context: Context) : EventChannel.StreamHandler {
  private var locationManager: LocationManager? = null
  private var locationListener: LocationListener? = null

  override fun onListen(arguments: Any?, events: EventChannel.EventSink) {
    locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    locationListener = object : LocationListener {
      override fun onLocationChanged(location: Location) {
        events.success(mapOf(
          "latitude" to location.latitude,
          "longitude" to location.longitude
        ))
      }
    }
    locationManager?.requestLocationUpdates(
      LocationManager.GPS_PROVIDER, 1000, 10f, locationListener!!
    )
  }

  override fun onCancel(arguments: Any?) {
    locationManager?.removeUpdates(locationListener!!)
    locationListener = null
    locationManager = null
  }
}

// In MainActivity
EventChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example.app/location")
  .setStreamHandler(LocationStreamHandler(this))
```

### BasicMessageChannel Pattern

**Use for:** Bidirectional asynchronous messaging with custom codecs

Less common, but useful for complex data structures or custom serialization.

## React Native Native Modules

### Native Module Pattern

```javascript
// JavaScript side
import { NativeModules } from 'react-native';
const { CameraModule } = NativeModules;

export const takePicture = async () => {
  try {
    const imagePath = await CameraModule.takePicture();
    return imagePath;
  } catch (e) {
    console.error(e);
  }
};
```

```java
// Android (Java)
package com.example.app;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class CameraModule extends ReactContextBaseJavaModule {
  CameraModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "CameraModule";
  }

  @ReactMethod
  public void takePicture(Promise promise) {
    try {
      // Implementation
      promise.resolve("path/to/image.jpg");
    } catch (Exception e) {
      promise.reject("CAMERA_ERROR", e);
    }
  }
}
```

```objc
// iOS (Objective-C)
#import <React/RCTBridgeModule.h>

@interface CameraModule : NSObject <RCTBridgeModule>
@end

@implementation CameraModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(takePicture:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // Implementation
  resolve(@"path/to/image.jpg");
}

@end
```

### Native Event Emitters

**Use for:** Sending events from native to JavaScript

```javascript
// JavaScript
import { NativeEventEmitter, NativeModules } from 'react-native';
const { LocationModule } = NativeModules;
const locationEmitter = new NativeEventEmitter(LocationModule);

locationEmitter.addListener('onLocationUpdate', location => {
  console.log(location);
});
```

```java
// Android
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class LocationModule extends ReactContextBaseJavaModule {
  private void sendEvent(String eventName, WritableMap params) {
    getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }

  private void onLocationUpdate(Location location) {
    WritableMap params = Arguments.createMap();
    params.putDouble("latitude", location.getLatitude());
    params.putDouble("longitude", location.getLongitude());
    sendEvent("onLocationUpdate", params);
  }
}
```

## Capacitor Plugins

### Plugin Structure

```typescript
// TypeScript definitions
export interface CameraPlugin {
  takePicture(options: CameraOptions): Promise<{ imagePath: string }>;
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
}
```

```typescript
// Web implementation
import { WebPlugin } from '@capacitor/core';

export class CameraWeb extends WebPlugin implements CameraPlugin {
  async takePicture(options: CameraOptions): Promise<{ imagePath: string }> {
    // Web implementation using browser APIs
    throw this.unimplemented('Not implemented on web.');
  }
}
```

```swift
// iOS implementation
import Capacitor

@objc(CameraPlugin)
public class CameraPlugin: CAPPlugin {
  @objc func takePicture(_ call: CAPPluginCall) {
    let quality = call.getInt("quality") ?? 80
    let allowEditing = call.getBool("allowEditing") ?? false

    // Implementation
    call.resolve(["imagePath": "path/to/image.jpg"])
  }
}
```

```java
// Android implementation
import com.getcapacitor.*;

@NativePlugin
public class CameraPlugin extends Plugin {
  @PluginMethod
  public void takePicture(PluginCall call) {
    Integer quality = call.getInt("quality", 80);
    Boolean allowEditing = call.getBoolean("allowEditing", false);

    // Implementation
    JSObject ret = new JSObject();
    ret.put("imagePath", "path/to/image.jpg");
    call.resolve(ret);
  }
}
```

## Cordova Plugins

### Plugin Structure

```javascript
// JavaScript interface
cordova.define('com.example.camera', function (require, exports, module) {
  var exec = require('cordova/exec');

  var Camera = {
    takePicture: function (success, error, options) {
      exec(success, error, 'Camera', 'takePicture', [options]);
    },
  };

  module.exports = Camera;
});
```

```java
// Android
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

public class Camera extends CordovaPlugin {
  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
    if (action.equals("takePicture")) {
      JSONObject options = args.getJSONObject(0);
      this.takePicture(options, callbackContext);
      return true;
    }
    return false;
  }

  private void takePicture(JSONObject options, CallbackContext callbackContext) {
    // Implementation
    callbackContext.success("path/to/image.jpg");
  }
}
```

## Permission Handling Patterns

### Flutter Permissions

```dart
import 'package:permission_handler/permission_handler.dart';

Future<bool> requestCameraPermission() async {
  final status = await Permission.camera.request();
  return status.isGranted;
}
```

### React Native Permissions

```javascript
import { PermissionsAndroid, Platform } from 'react-native';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles permissions differently
};
```

### Native Permission Requests

**Android (manifest + runtime):**

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

```kotlin
// Runtime permission request
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
    != PackageManager.PERMISSION_GRANTED) {
  ActivityCompat.requestPermissions(this,
    arrayOf(Manifest.permission.CAMERA),
    CAMERA_PERMISSION_CODE)
}
```

**iOS (Info.plist):**

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take pictures</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show your position</string>
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for authentication</string>
```

## Error Handling Best Practices

### Consistent Error Codes

Define error codes that work across platforms:

```dart
// Flutter
class NativeError {
  static const String permissionDenied = "PERMISSION_DENIED";
  static const String notAvailable = "NOT_AVAILABLE";
  static const String failed = "OPERATION_FAILED";
}

try {
  await platform.invokeMethod('takePicture');
} on PlatformException catch (e) {
  switch (e.code) {
    case NativeError.permissionDenied:
      // Handle permission error
      break;
    case NativeError.notAvailable:
      // Handle unavailable feature
      break;
    default:
      // Handle generic error
  }
}
```

### Graceful Degradation

```javascript
// React Native
const takePicture = async () => {
  if (!CameraModule) {
    // Fallback to web-based solution or show error
    console.warn('Camera module not available');
    return null;
  }

  try {
    return await CameraModule.takePicture();
  } catch (e) {
    // Handle error
    return null;
  }
};
```

## Threading Considerations

### Background Thread Execution

**Flutter (Android):**

```kotlin
MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
  .setMethodCallHandler { call, result ->
    when (call.method) {
      "heavyOperation" -> {
        // Run on background thread
        CoroutineScope(Dispatchers.IO).launch {
          val data = performHeavyOperation()
          // Return result on main thread
          withContext(Dispatchers.Main) {
            result.success(data)
          }
        }
      }
    }
  }
```

**React Native (iOS):**

```objc
RCT_EXPORT_METHOD(heavyOperation:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    // Heavy operation
    NSString *result = [self performHeavyOperation];

    dispatch_async(dispatch_get_main_queue(), ^{
      resolve(result);
    });
  });
}
```

## Common Pitfalls

1. **Not handling permissions properly**: Always check and request permissions before accessing native features
2. **Forgetting platform differences**: iOS and Android handle features differently (e.g., background location)
3. **Memory leaks**: Clean up listeners and handlers properly
4. **Thread safety**: Ensure UI updates happen on main thread
5. **Type mismatches**: Ensure data types match between platforms (e.g., int vs long)
6. **Missing null checks**: Native APIs can return null
7. **Not testing on real devices**: Emulators don't support all features (especially biometrics, camera)

## Testing Native Integrations

1. **Unit test the native code** separately using platform-specific testing frameworks
2. **Integration test** the channel communication with mock responses
3. **Manual testing** on real devices for hardware features
4. **Test permission flows** including denied, granted, and "ask again" states
5. **Test error scenarios**: disconnected, unavailable hardware, etc.
