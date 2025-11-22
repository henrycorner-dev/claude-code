// Flutter Platform Channel Example - Camera Integration
// This example shows a complete Flutter implementation with platform channels for camera access

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:io';

// Service class for camera operations
class CameraService {
  static const platform = MethodChannel('com.example.app/camera');

  // Take a picture using native camera
  Future<String?> takePicture() async {
    try {
      final String? result = await platform.invokeMethod('takePicture');
      return result;
    } on PlatformException catch (e) {
      print("Failed to take picture: '${e.message}'.");
      return null;
    }
  }

  // Check if camera is available
  Future<bool> isCameraAvailable() async {
    try {
      final bool result = await platform.invokeMethod('isCameraAvailable');
      return result;
    } on PlatformException catch (e) {
      print("Failed to check camera: '${e.message}'.");
      return false;
    }
  }

  // Request camera permission
  Future<bool> requestCameraPermission() async {
    try {
      final bool result = await platform.invokeMethod('requestPermission');
      return result;
    } on PlatformException catch (e) {
      print("Failed to request permission: '${e.message}'.");
      return false;
    }
  }
}

// UI Widget demonstrating camera usage
class CameraScreen extends StatefulWidget {
  @override
  _CameraScreenState createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  final CameraService _cameraService = CameraService();
  String? _imagePath;
  bool _isLoading = false;

  Future<void> _takePicture() async {
    setState(() => _isLoading = true);

    // Check camera availability
    final isAvailable = await _cameraService.isCameraAvailable();
    if (!isAvailable) {
      _showError('Camera is not available on this device');
      setState(() => _isLoading = false);
      return;
    }

    // Request permission
    final hasPermission = await _cameraService.requestCameraPermission();
    if (!hasPermission) {
      _showError('Camera permission denied');
      setState(() => _isLoading = false);
      return;
    }

    // Take picture
    final imagePath = await _cameraService.takePicture();

    setState(() {
      _imagePath = imagePath;
      _isLoading = false;
    });

    if (imagePath == null) {
      _showError('Failed to take picture');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Camera Demo')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_imagePath != null)
              Image.file(
                File(_imagePath!),
                height: 300,
                width: 300,
                fit: BoxFit.cover,
              )
            else
              Container(
                height: 300,
                width: 300,
                color: Colors.grey[300],
                child: Icon(Icons.camera_alt, size: 100, color: Colors.grey[600]),
              ),
            SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _takePicture,
              icon: _isLoading
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(Icons.camera),
              label: Text(_isLoading ? 'Taking Picture...' : 'Take Picture'),
            ),
          ],
        ),
      ),
    );
  }
}

// Corresponding Android implementation (MainActivity.kt):
/*
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.Manifest
import android.content.pm.PackageManager
import android.provider.MediaStore
import android.content.Intent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.File

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.app/camera"
    private val CAMERA_REQUEST_CODE = 100
    private val PERMISSION_REQUEST_CODE = 101
    private var pendingResult: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
            call, result ->
            when (call.method) {
                "takePicture" -> {
                    pendingResult = result
                    takePicture()
                }
                "isCameraAvailable" -> {
                    result.success(packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY))
                }
                "requestPermission" -> {
                    if (hasCameraPermission()) {
                        result.success(true)
                    } else {
                        pendingResult = result
                        requestCameraPermission()
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun hasCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestCameraPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.CAMERA),
            PERMISSION_REQUEST_CODE
        )
    }

    private fun takePicture() {
        if (!hasCameraPermission()) {
            pendingResult?.error("PERMISSION_DENIED", "Camera permission not granted", null)
            pendingResult = null
            return
        }

        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        val photoFile = File.createTempFile("photo", ".jpg", cacheDir)
        val photoUri = FileProvider.getUriForFile(
            this,
            "${packageName}.fileprovider",
            photoFile
        )
        intent.putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
        startActivityForResult(intent, CAMERA_REQUEST_CODE)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == CAMERA_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                // Return the photo file path
                val photoFile = File(cacheDir, "photo.jpg")
                pendingResult?.success(photoFile.absolutePath)
            } else {
                pendingResult?.error("CANCELLED", "User cancelled camera", null)
            }
            pendingResult = null
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == PERMISSION_REQUEST_CODE) {
            val granted = grantResults.isNotEmpty() &&
                         grantResults[0] == PackageManager.PERMISSION_GRANTED
            pendingResult?.success(granted)
            pendingResult = null
        }
    }
}
*/

// Corresponding iOS implementation (AppDelegate.swift):
/*
import UIKit
import Flutter
import AVFoundation

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    var pendingResult: FlutterResult?

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let channel = FlutterMethodChannel(
            name: "com.example.app/camera",
            binaryMessenger: controller.binaryMessenger
        )

        channel.setMethodCallHandler { [weak self] (call: FlutterMethodCall, result: @escaping FlutterResult) in
            guard let self = self else { return }

            switch call.method {
            case "takePicture":
                self.pendingResult = result
                self.takePicture()
            case "isCameraAvailable":
                result(UIImagePickerController.isSourceTypeAvailable(.camera))
            case "requestPermission":
                self.requestCameraPermission(result: result)
            default:
                result(FlutterMethodNotImplemented)
            }
        }

        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    private func hasCameraPermission() -> Bool {
        return AVCaptureDevice.authorizationStatus(for: .video) == .authorized
    }

    private func requestCameraPermission(result: @escaping FlutterResult) {
        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .authorized:
            result(true)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    result(granted)
                }
            }
        case .denied, .restricted:
            result(false)
        @unknown default:
            result(false)
        }
    }

    private func takePicture() {
        guard let controller = window?.rootViewController else {
            pendingResult?(FlutterError(code: "UNAVAILABLE", message: "Controller not found", details: nil))
            return
        }

        if !hasCameraPermission() {
            pendingResult?(FlutterError(code: "PERMISSION_DENIED", message: "Camera permission not granted", details: nil))
            return
        }

        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = self
        controller.present(picker, animated: true)
    }
}

extension AppDelegate: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(
        _ picker: UIImagePickerController,
        didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]
    ) {
        picker.dismiss(animated: true)

        guard let image = info[.originalImage] as? UIImage else {
            pendingResult?(FlutterError(code: "NO_IMAGE", message: "No image captured", details: nil))
            return
        }

        // Save image to temp directory
        let tempDir = FileManager.default.temporaryDirectory
        let fileName = "photo_\(Date().timeIntervalSince1970).jpg"
        let fileURL = tempDir.appendingPathComponent(fileName)

        if let data = image.jpegData(compressionQuality: 0.8) {
            try? data.write(to: fileURL)
            pendingResult?(fileURL.path)
        } else {
            pendingResult?(FlutterError(code: "SAVE_FAILED", message: "Failed to save image", details: nil))
        }

        pendingResult = nil
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
        pendingResult?(FlutterError(code: "CANCELLED", message: "User cancelled camera", details: nil))
        pendingResult = nil
    }
}
*/
