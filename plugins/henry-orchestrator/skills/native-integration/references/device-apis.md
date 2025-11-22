# Device API Reference

Comprehensive reference for common device APIs across platforms.

## Camera Access

### Flutter (camera package)

```dart
import 'package:camera/camera.dart';

class CameraService {
  CameraController? controller;

  Future<void> initialize() async {
    final cameras = await availableCameras();
    final firstCamera = cameras.first;

    controller = CameraController(
      firstCamera,
      ResolutionPreset.high,
      enableAudio: false,
    );

    await controller!.initialize();
  }

  Future<XFile> takePicture() async {
    if (!controller!.value.isInitialized) {
      throw Exception('Camera not initialized');
    }
    return await controller!.takePicture();
  }

  void dispose() {
    controller?.dispose();
  }
}
```

### React Native (react-native-camera)

```javascript
import { RNCamera } from 'react-native-camera';

const CameraComponent = () => {
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      return data.uri;
    }
  };

  return (
    <RNCamera
      ref={cameraRef}
      style={{ flex: 1 }}
      type={RNCamera.Constants.Type.back}
      captureAudio={false}
    />
  );
};
```

### Native Camera APIs

**Android:**

```kotlin
import android.hardware.camera2.*

class CameraManager {
  private var cameraDevice: CameraDevice? = null
  private lateinit var captureSession: CameraCaptureSession

  fun openCamera(cameraId: String) {
    val manager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    manager.openCamera(cameraId, object : CameraDevice.StateCallback() {
      override fun onOpened(camera: CameraDevice) {
        cameraDevice = camera
      }
      override fun onDisconnected(camera: CameraDevice) {
        camera.close()
      }
      override fun onError(camera: CameraDevice, error: Int) {
        camera.close()
      }
    }, null)
  }
}
```

**iOS:**

```swift
import AVFoundation

class CameraManager: NSObject {
  let captureSession = AVCaptureSession()
  var photoOutput = AVCapturePhotoOutput()

  func setupCamera() {
    captureSession.beginConfiguration()

    guard let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera,
                                                     for: .video,
                                                     position: .back) else { return }

    guard let videoDeviceInput = try? AVCaptureDeviceInput(device: videoDevice),
          captureSession.canAddInput(videoDeviceInput) else { return }

    captureSession.addInput(videoDeviceInput)

    if captureSession.canAddOutput(photoOutput) {
      captureSession.addOutput(photoOutput)
    }

    captureSession.commitConfiguration()
  }

  func capturePhoto() {
    let settings = AVCapturePhotoSettings()
    photoOutput.capturePhoto(with: settings, delegate: self)
  }
}
```

## GPS/Location Services

### Flutter (geolocator)

```dart
import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<Position> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied');
      }
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );
  }

  Stream<Position> getLocationStream() {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      )
    );
  }
}
```

### React Native (@react-native-community/geolocation)

```javascript
import Geolocation from '@react-native-community/geolocation';

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position.coords),
      error => reject(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  });
};

export const watchPosition = callback => {
  return Geolocation.watchPosition(
    position => callback(position.coords),
    error => console.error(error),
    { enableHighAccuracy: true, distanceFilter: 10 }
  );
};
```

### Native Location APIs

**Android:**

```kotlin
import com.google.android.gms.location.*

class LocationManager(private val context: Context) {
  private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

  fun getLastLocation(callback: (Location?) -> Unit) {
    fusedLocationClient.lastLocation.addOnSuccessListener { location ->
      callback(location)
    }
  }

  fun requestLocationUpdates(callback: (Location) -> Unit) {
    val locationRequest = LocationRequest.create().apply {
      interval = 10000
      fastestInterval = 5000
      priority = LocationRequest.PRIORITY_HIGH_ACCURACY
    }

    val locationCallback = object : LocationCallback() {
      override fun onLocationResult(result: LocationResult) {
        result.lastLocation?.let { callback(it) }
      }
    }

    fusedLocationClient.requestLocationUpdates(
      locationRequest,
      locationCallback,
      Looper.getMainLooper()
    )
  }
}
```

**iOS:**

```swift
import CoreLocation

class LocationManager: NSObject, CLLocationManagerDelegate {
  let locationManager = CLLocationManager()

  override init() {
    super.init()
    locationManager.delegate = self
    locationManager.desiredAccuracy = kCLLocationAccuracyBest
  }

  func requestLocation() {
    locationManager.requestWhenInUseAuthorization()
    locationManager.requestLocation()
  }

  func startUpdatingLocation() {
    locationManager.startUpdatingLocation()
  }

  // Delegate methods
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else { return }
    // Handle location update
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    // Handle error
  }
}
```

## Biometric Authentication

### Flutter (local_auth)

```dart
import 'package:local_auth/local_auth.dart';

class BiometricAuth {
  final LocalAuthentication auth = LocalAuthentication();

  Future<bool> canCheckBiometrics() async {
    return await auth.canCheckBiometrics;
  }

  Future<List<BiometricType>> getAvailableBiometrics() async {
    return await auth.getAvailableBiometrics();
  }

  Future<bool> authenticate() async {
    try {
      return await auth.authenticate(
        localizedReason: 'Please authenticate to access the app',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }
}
```

### React Native (react-native-biometrics)

```javascript
import ReactNativeBiometrics from 'react-native-biometrics';

const biometrics = new ReactNativeBiometrics();

export const checkBiometrics = async () => {
  const { available, biometryType } = await biometrics.isSensorAvailable();
  return { available, biometryType };
};

export const authenticate = async () => {
  try {
    const { success } = await biometrics.simplePrompt({
      promptMessage: 'Confirm fingerprint',
    });
    return success;
  } catch (error) {
    return false;
  }
};
```

### Native Biometric APIs

**Android:**

```kotlin
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat

class BiometricManager(private val activity: FragmentActivity) {
  private val executor = ContextCompat.getMainExecutor(activity)

  fun authenticate(onSuccess: () -> Unit, onError: (String) -> Unit) {
    val biometricPrompt = BiometricPrompt(activity, executor,
      object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          onSuccess()
        }

        override fun onAuthenticationFailed() {
          onError("Authentication failed")
        }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          onError(errString.toString())
        }
      })

    val promptInfo = BiometricPrompt.PromptInfo.Builder()
      .setTitle("Biometric Authentication")
      .setSubtitle("Log in using your biometric credential")
      .setNegativeButtonText("Cancel")
      .build()

    biometricPrompt.authenticate(promptInfo)
  }
}
```

**iOS:**

```swift
import LocalAuthentication

class BiometricManager {
  func authenticate(completion: @escaping (Bool, Error?) -> Void) {
    let context = LAContext()
    var error: NSError?

    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      let reason = "Authenticate to access the app"

      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
        DispatchQueue.main.async {
          completion(success, error)
        }
      }
    } else {
      completion(false, error)
    }
  }
}
```

## Device Sensors

### Accelerometer

**Flutter (sensors_plus):**

```dart
import 'package:sensors_plus/sensors_plus.dart';

StreamSubscription<AccelerometerEvent>? subscription;

void startListening() {
  subscription = accelerometerEvents.listen((AccelerometerEvent event) {
    print('X: ${event.x}, Y: ${event.y}, Z: ${event.z}');
  });
}

void stopListening() {
  subscription?.cancel();
}
```

**React Native (react-native-sensors):**

```javascript
import { accelerometer } from 'react-native-sensors';

const subscription = accelerometer.subscribe(({ x, y, z }) => {
  console.log('X:', x, 'Y:', y, 'Z:', z);
});

// Stop listening
subscription.unsubscribe();
```

### Gyroscope

**Flutter:**

```dart
import 'package:sensors_plus/sensors_plus.dart';

gyroscopeEvents.listen((GyroscopeEvent event) {
  print('X: ${event.x}, Y: ${event.y}, Z: ${event.z}');
});
```

**Native Android:**

```kotlin
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager

class GyroscopeManager(context: Context) : SensorEventListener {
  private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
  private val gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

  fun start() {
    sensorManager.registerListener(this, gyroscope, SensorManager.SENSOR_DELAY_NORMAL)
  }

  fun stop() {
    sensorManager.unregisterListener(this)
  }

  override fun onSensorChanged(event: SensorEvent) {
    val x = event.values[0]
    val y = event.values[1]
    val z = event.values[2]
    // Handle gyroscope data
  }

  override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
}
```

## Bluetooth

### Flutter (flutter_blue_plus)

```dart
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class BluetoothService {
  Future<void> scanDevices() async {
    // Start scanning
    FlutterBluePlus.startScan(timeout: Duration(seconds: 4));

    // Listen to scan results
    FlutterBluePlus.scanResults.listen((results) {
      for (ScanResult result in results) {
        print('Device: ${result.device.name}');
      }
    });

    // Stop scanning
    await Future.delayed(Duration(seconds: 4));
    FlutterBluePlus.stopScan();
  }

  Future<void> connectToDevice(BluetoothDevice device) async {
    await device.connect();

    // Discover services
    List<BluetoothService> services = await device.discoverServices();
    for (var service in services) {
      for (var characteristic in service.characteristics) {
        if (characteristic.properties.read) {
          var value = await characteristic.read();
          print('Value: $value');
        }
      }
    }
  }
}
```

### React Native (react-native-ble-plx)

```javascript
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export const scanDevices = callback => {
  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error(error);
      return;
    }
    callback(device);
  });

  setTimeout(() => {
    manager.stopDeviceScan();
  }, 5000);
};

export const connectToDevice = async deviceId => {
  const device = await manager.connectToDevice(deviceId);
  await device.discoverAllServicesAndCharacteristics();
  return device;
};
```

## File System Access

### Flutter (path_provider)

```dart
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class FileService {
  Future<String> get localPath async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<File> writeFile(String filename, String content) async {
    final path = await localPath;
    final file = File('$path/$filename');
    return file.writeAsString(content);
  }

  Future<String> readFile(String filename) async {
    final path = await localPath;
    final file = File('$path/$filename');
    return await file.readAsString();
  }
}
```

### React Native (react-native-fs)

```javascript
import RNFS from 'react-native-fs';

export const writeFile = async (filename, content) => {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  await RNFS.writeFile(path, content, 'utf8');
};

export const readFile = async filename => {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  return await RNFS.readFile(path, 'utf8');
};
```

## Haptic Feedback

### Flutter (vibration)

```dart
import 'package:vibration/vibration.dart';

class HapticService {
  Future<void> lightImpact() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 50);
    }
  }

  Future<void> mediumImpact() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 100);
    }
  }

  Future<void> heavyImpact() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 150);
    }
  }
}
```

### React Native (react-native-haptic-feedback)

```javascript
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const lightImpact = () => {
  ReactNativeHapticFeedback.trigger('impactLight', options);
};

export const mediumImpact = () => {
  ReactNativeHapticFeedback.trigger('impactMedium', options);
};

export const heavyImpact = () => {
  ReactNativeHapticFeedback.trigger('impactHeavy', options);
};
```

## Battery Status

### Flutter (battery_plus)

```dart
import 'package:battery_plus/battery_plus.dart';

class BatteryService {
  final Battery battery = Battery();

  Future<int> getBatteryLevel() async {
    return await battery.batteryLevel;
  }

  Stream<BatteryState> getBatteryStateStream() {
    return battery.onBatteryStateChanged;
  }

  Future<bool> isInBatterySaveMode() async {
    return await battery.isInBatterySaveMode;
  }
}
```

### React Native (@react-native-community/netinfo for network, custom for battery)

**Native module needed for battery - not standardized in RN core**

## Network Connectivity

### Flutter (connectivity_plus)

```dart
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity connectivity = Connectivity();

  Future<ConnectivityResult> checkConnectivity() async {
    return await connectivity.checkConnectivity();
  }

  Stream<ConnectivityResult> get connectivityStream {
    return connectivity.onConnectivityChanged;
  }
}
```

### React Native (@react-native-community/netinfo)

```javascript
import NetInfo from '@react-native-community/netinfo';

export const checkConnectivity = async () => {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected,
    type: state.type,
  };
};

export const subscribeToNetworkChanges = callback => {
  return NetInfo.addEventListener(state => {
    callback({
      isConnected: state.isConnected,
      type: state.type,
    });
  });
};
```

## Platform-Specific Features

### iOS-Only: HealthKit

```swift
import HealthKit

class HealthKitManager {
  let healthStore = HKHealthStore()

  func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
    guard HKHealthStore.isHealthDataAvailable() else {
      completion(false, nil)
      return
    }

    let typesToRead: Set<HKObjectType> = [
      HKObjectType.quantityType(forIdentifier: .stepCount)!,
      HKObjectType.quantityType(forIdentifier: .heartRate)!
    ]

    healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
      completion(success, error)
    }
  }

  func readStepCount(completion: @escaping (Double?, Error?) -> Void) {
    let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
    let now = Date()
    let startOfDay = Calendar.current.startOfDay(for: now)

    let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

    let query = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
      guard let result = result, let sum = result.sumQuantity() else {
        completion(nil, error)
        return
      }
      completion(sum.doubleValue(for: HKUnit.count()), nil)
    }

    healthStore.execute(query)
  }
}
```

### Android-Only: Google Fit

```kotlin
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.data.DataType

class GoogleFitManager(private val context: Context) {
  fun requestPermissions(activity: Activity) {
    val fitnessOptions = FitnessOptions.builder()
      .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
      .build()

    if (!GoogleSignIn.hasPermissions(GoogleSignIn.getLastSignedInAccount(context), fitnessOptions)) {
      GoogleSignIn.requestPermissions(
        activity,
        REQUEST_OAUTH_REQUEST_CODE,
        GoogleSignIn.getLastSignedInAccount(context),
        fitnessOptions
      )
    }
  }

  fun readStepCount(callback: (Long?) -> Unit) {
    val account = GoogleSignIn.getLastSignedInAccount(context) ?: return

    Fitness.getHistoryClient(context, account)
      .readDailyTotal(DataType.TYPE_STEP_COUNT_DELTA)
      .addOnSuccessListener { dataSet ->
        val total = dataSet.dataPoints.firstOrNull()
          ?.getValue(Field.FIELD_STEPS)?.asInt()?.toLong()
        callback(total)
      }
      .addOnFailureListener {
        callback(null)
      }
  }
}
```
