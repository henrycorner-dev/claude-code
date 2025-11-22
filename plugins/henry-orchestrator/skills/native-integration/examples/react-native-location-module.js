// React Native Native Module Example - Location Tracking
// This example shows a complete React Native implementation with native modules for GPS tracking

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const { LocationModule } = NativeModules;
const locationEmitter = new NativeEventEmitter(LocationModule);

// Service wrapper for location operations
class LocationService {
  constructor() {
    this.subscription = null;
  }

  async requestPermission() {
    try {
      const granted = await LocationModule.requestPermission();
      return granted;
    } catch (e) {
      console.error('Permission request failed:', e);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const location = await LocationModule.getCurrentLocation();
      return location;
    } catch (e) {
      console.error('Failed to get location:', e);
      return null;
    }
  }

  startLocationUpdates(callback) {
    this.subscription = locationEmitter.addListener('onLocationUpdate', callback);
    LocationModule.startLocationUpdates();
  }

  stopLocationUpdates() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    LocationModule.stopLocationUpdates();
  }
}

// React component demonstrating location usage
const LocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const locationService = new LocationService();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isTracking) {
        locationService.stopLocationUpdates();
      }
    };
  }, []);

  const handleGetCurrentLocation = async () => {
    setError(null);

    const hasPermission = await locationService.requestPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      return;
    }

    const currentLocation = await locationService.getCurrentLocation();
    if (currentLocation) {
      setLocation(currentLocation);
    } else {
      setError('Failed to get current location');
    }
  };

  const handleStartTracking = async () => {
    setError(null);

    const hasPermission = await locationService.requestPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      return;
    }

    locationService.startLocationUpdates(newLocation => {
      setLocation(newLocation);
    });

    setIsTracking(true);
  };

  const handleStopTracking = () => {
    locationService.stopLocationUpdates();
    setIsTracking(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracking Demo</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{location.latitude.toFixed(6)}</Text>

          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{location.longitude.toFixed(6)}</Text>

          <Text style={styles.label}>Accuracy:</Text>
          <Text style={styles.value}>{location.accuracy.toFixed(2)}m</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Get Current Location"
          onPress={handleGetCurrentLocation}
          disabled={isTracking}
        />

        {!isTracking ? (
          <Button title="Start Tracking" onPress={handleStartTracking} color="#4CAF50" />
        ) : (
          <Button title="Stop Tracking" onPress={handleStopTracking} color="#f44336" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  locationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    gap: 10,
  },
});

export default LocationScreen;

// Corresponding Android implementation (LocationModule.java):
/*
package com.example.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Looper;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.*;

public class LocationModule extends ReactContextBaseJavaModule {
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private final ReactApplicationContext reactContext;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private Promise permissionPromise;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.fusedLocationClient = LocationServices.getFusedLocationProviderClient(reactContext);
    }

    @Override
    public String getName() {
        return "LocationModule";
    }

    @ReactMethod
    public void requestPermission(Promise promise) {
        if (hasLocationPermission()) {
            promise.resolve(true);
        } else {
            permissionPromise = promise;
            ActivityCompat.requestPermissions(
                getCurrentActivity(),
                new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                },
                PERMISSION_REQUEST_CODE
            );
        }
    }

    @ReactMethod
    public void getCurrentLocation(Promise promise) {
        if (!hasLocationPermission()) {
            promise.reject("PERMISSION_DENIED", "Location permission not granted");
            return;
        }

        fusedLocationClient.getLastLocation()
            .addOnSuccessListener(location -> {
                if (location != null) {
                    WritableMap locationMap = createLocationMap(location);
                    promise.resolve(locationMap);
                } else {
                    promise.reject("NO_LOCATION", "Unable to get location");
                }
            })
            .addOnFailureListener(e -> {
                promise.reject("LOCATION_ERROR", e.getMessage());
            });
    }

    @ReactMethod
    public void startLocationUpdates() {
        if (!hasLocationPermission()) {
            return;
        }

        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setInterval(5000); // 5 seconds
        locationRequest.setFastestInterval(2000); // 2 seconds
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) {
                    return;
                }
                for (Location location : locationResult.getLocations()) {
                    sendLocationEvent(location);
                }
            }
        };

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        );
    }

    @ReactMethod
    public void stopLocationUpdates() {
        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
            locationCallback = null;
        }
    }

    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;
    }

    private WritableMap createLocationMap(Location location) {
        WritableMap map = Arguments.createMap();
        map.putDouble("latitude", location.getLatitude());
        map.putDouble("longitude", location.getLongitude());
        map.putDouble("accuracy", location.getAccuracy());
        map.putDouble("altitude", location.getAltitude());
        map.putDouble("speed", location.getSpeed());
        map.putDouble("timestamp", location.getTime());
        return map;
    }

    private void sendLocationEvent(Location location) {
        WritableMap params = createLocationMap(location);
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onLocationUpdate", params);
    }

    // Handle permission result
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PERMISSION_REQUEST_CODE && permissionPromise != null) {
            boolean granted = grantResults.length > 0 &&
                             grantResults[0] == PackageManager.PERMISSION_GRANTED;
            permissionPromise.resolve(granted);
            permissionPromise = null;
        }
    }
}

// Don't forget to register the module in MainApplication.java:
// @Override
// protected List<ReactPackage> getPackages() {
//   return Arrays.<ReactPackage>asList(
//     new MainReactPackage(),
//     new LocationPackage() // Create this package class
//   );
// }
*/

// Corresponding iOS implementation (LocationModule.m):
/*
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LocationModule, RCTEventEmitter)

RCT_EXTERN_METHOD(requestPermission:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentLocation:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startLocationUpdates)

RCT_EXTERN_METHOD(stopLocationUpdates)

@end
*/

// LocationModule.swift:
/*
import Foundation
import CoreLocation
import React

@objc(LocationModule)
class LocationModule: RCTEventEmitter, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private var permissionResolver: RCTPromiseResolveBlock?

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    override func supportedEvents() -> [String]! {
        return ["onLocationUpdate"]
    }

    @objc
    func requestPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
        let status = CLLocationManager.authorizationStatus()

        switch status {
        case .authorizedAlways, .authorizedWhenInUse:
            resolve(true)
        case .notDetermined:
            permissionResolver = resolve
            locationManager.requestWhenInUseAuthorization()
        case .denied, .restricted:
            resolve(false)
        @unknown default:
            resolve(false)
        }
    }

    @objc
    func getCurrentLocation(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
        if !hasLocationPermission() {
            reject("PERMISSION_DENIED", "Location permission not granted", nil)
            return
        }

        locationManager.requestLocation()

        // Store resolver for later use in delegate
        // In production, use a proper callback system
    }

    @objc
    func startLocationUpdates() {
        if hasLocationPermission() {
            locationManager.startUpdatingLocation()
        }
    }

    @objc
    func stopLocationUpdates() {
        locationManager.stopUpdatingLocation()
    }

    // CLLocationManagerDelegate methods
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }

        let locationData: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.altitude,
            "speed": location.speed,
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000
        ]

        sendEvent(withName: "onLocationUpdate", body: locationData)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }

    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if let resolver = permissionResolver {
            let granted = status == .authorizedAlways || status == .authorizedWhenInUse
            resolver(granted)
            permissionResolver = nil
        }
    }

    private func hasLocationPermission() -> Bool {
        let status = CLLocationManager.authorizationStatus()
        return status == .authorizedAlways || status == .authorizedWhenInUse
    }
}
*/
