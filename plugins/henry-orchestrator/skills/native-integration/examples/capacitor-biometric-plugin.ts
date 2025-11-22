// Capacitor Plugin Example - Biometric Authentication
// This example shows a complete Capacitor plugin implementation for biometric authentication

import { registerPlugin } from '@capacitor/core';

// TypeScript definitions for the plugin
export interface BiometricAuthPlugin {
  /**
   * Check if biometric authentication is available on the device
   */
  isAvailable(): Promise<{ available: boolean; biometryType: string }>;

  /**
   * Authenticate using biometrics
   */
  authenticate(options: AuthOptions): Promise<{ success: boolean }>;

  /**
   * Check if biometric credentials are enrolled
   */
  hasEnrolledBiometrics(): Promise<{ enrolled: boolean }>;
}

export interface AuthOptions {
  reason?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  negativeButtonText?: string;
  fallbackTitle?: string;
}

const BiometricAuth = registerPlugin<BiometricAuthPlugin>('BiometricAuth', {
  web: () => import('./web').then(m => new m.BiometricAuthWeb()),
});

export default BiometricAuth;

// Web implementation (web.ts)
/*
import { WebPlugin } from '@capacitor/core';
import type { BiometricAuthPlugin, AuthOptions } from './definitions';

export class BiometricAuthWeb extends WebPlugin implements BiometricAuthPlugin {
  async isAvailable(): Promise<{ available: boolean; biometryType: string }> {
    // Check for Web Authentication API
    const available = window.PublicKeyCredential !== undefined;
    return {
      available,
      biometryType: available ? 'webauthn' : 'none'
    };
  }

  async authenticate(options: AuthOptions): Promise<{ success: boolean }> {
    // Web implementation would use WebAuthn API
    throw this.unimplemented('Biometric authentication is not implemented on web');
  }

  async hasEnrolledBiometrics(): Promise<{ enrolled: boolean }> {
    return { enrolled: false };
  }
}
*/

// iOS implementation (BiometricAuthPlugin.swift)
/*
import Foundation
import Capacitor
import LocalAuthentication

@objc(BiometricAuthPlugin)
public class BiometricAuthPlugin: CAPPlugin {

    @objc func isAvailable(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?

        let available = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        var biometryType = "none"
        if available {
            switch context.biometryType {
            case .faceID:
                biometryType = "face"
            case .touchID:
                biometryType = "fingerprint"
            case .none:
                biometryType = "none"
            @unknown default:
                biometryType = "unknown"
            }
        }

        call.resolve([
            "available": available,
            "biometryType": biometryType
        ])
    }

    @objc func authenticate(_ call: CAPPluginCall) {
        let context = LAContext()
        let reason = call.getString("reason") ?? "Authenticate to continue"

        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            call.reject("Biometric authentication not available", "\(error?.localizedDescription ?? "")")
            return
        }

        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        ) { success, error in
            DispatchQueue.main.async {
                if success {
                    call.resolve(["success": true])
                } else {
                    let errorCode = (error as? LAError)?.code
                    var errorMessage = "Authentication failed"

                    if let laError = error as? LAError {
                        switch laError.code {
                        case .userCancel:
                            errorMessage = "User cancelled"
                        case .userFallback:
                            errorMessage = "User chose fallback"
                        case .biometryNotEnrolled:
                            errorMessage = "No biometrics enrolled"
                        case .biometryNotAvailable:
                            errorMessage = "Biometrics not available"
                        case .biometryLockout:
                            errorMessage = "Too many failed attempts"
                        default:
                            errorMessage = laError.localizedDescription
                        }
                    }

                    call.reject(errorMessage, "\(errorCode?.rawValue ?? -1)")
                }
            }
        }
    }

    @objc func hasEnrolledBiometrics(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?

        let canEvaluate = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        let enrolled = canEvaluate && error == nil

        call.resolve(["enrolled": enrolled])
    }
}
*/

// Android implementation (BiometricAuthPlugin.java)
/*
package com.example.plugins;

import android.os.Build;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "BiometricAuth")
public class BiometricAuthPlugin extends Plugin {

    @PluginMethod
    public void isAvailable(PluginCall call) {
        BiometricManager biometricManager = BiometricManager.from(getContext());

        int canAuthenticate = biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG
        );

        boolean available = canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS;

        String biometryType = "none";
        if (available) {
            // Android doesn't provide a direct way to determine fingerprint vs face
            // We can only know if biometrics are available
            biometryType = "fingerprint"; // Default assumption
        }

        JSObject ret = new JSObject();
        ret.put("available", available);
        ret.put("biometryType", biometryType);
        call.resolve(ret);
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        FragmentActivity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        BiometricManager biometricManager = BiometricManager.from(getContext());
        int canAuthenticate = biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG
        );

        if (canAuthenticate != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject("Biometric authentication not available");
            return;
        }

        Executor executor = ContextCompat.getMainExecutor(getContext());

        BiometricPrompt biometricPrompt = new BiometricPrompt(
            activity,
            executor,
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                    super.onAuthenticationSucceeded(result);
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                }

                @Override
                public void onAuthenticationFailed() {
                    super.onAuthenticationFailed();
                    // Don't reject here - user can try again
                }

                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                    super.onAuthenticationError(errorCode, errString);

                    String errorMessage = errString.toString();
                    switch (errorCode) {
                        case BiometricPrompt.ERROR_USER_CANCELED:
                        case BiometricPrompt.ERROR_NEGATIVE_BUTTON:
                            errorMessage = "User cancelled";
                            break;
                        case BiometricPrompt.ERROR_NO_BIOMETRICS:
                            errorMessage = "No biometrics enrolled";
                            break;
                        case BiometricPrompt.ERROR_HW_NOT_PRESENT:
                        case BiometricPrompt.ERROR_HW_UNAVAILABLE:
                            errorMessage = "Biometrics not available";
                            break;
                        case BiometricPrompt.ERROR_LOCKOUT:
                        case BiometricPrompt.ERROR_LOCKOUT_PERMANENT:
                            errorMessage = "Too many failed attempts";
                            break;
                    }

                    call.reject(errorMessage, String.valueOf(errorCode));
                }
            }
        );

        String title = call.getString("title", "Biometric Authentication");
        String subtitle = call.getString("subtitle", "");
        String description = call.getString("description", "");
        String negativeButtonText = call.getString("negativeButtonText", "Cancel");

        BiometricPrompt.PromptInfo.Builder promptInfoBuilder = new BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setNegativeButtonText(negativeButtonText);

        if (!subtitle.isEmpty()) {
            promptInfoBuilder.setSubtitle(subtitle);
        }

        if (!description.isEmpty()) {
            promptInfoBuilder.setDescription(description);
        }

        BiometricPrompt.PromptInfo promptInfo = promptInfoBuilder.build();
        biometricPrompt.authenticate(promptInfo);
    }

    @PluginMethod
    public void hasEnrolledBiometrics(PluginCall call) {
        BiometricManager biometricManager = BiometricManager.from(getContext());

        int canAuthenticate = biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG
        );

        boolean enrolled = canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS;

        JSObject ret = new JSObject();
        ret.put("enrolled", enrolled);
        call.resolve(ret);
    }
}
*/

// Usage example in a React app
/*
import React, { useState, useEffect } from 'react';
import BiometricAuth from './BiometricAuth';

const BiometricAuthScreen: React.FC = () => {
  const [available, setAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState('none');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const result = await BiometricAuth.isAvailable();
    setAvailable(result.available);
    setBiometryType(result.biometryType);
  };

  const handleAuthenticate = async () => {
    try {
      const result = await BiometricAuth.authenticate({
        reason: 'Please authenticate to access secure content',
        title: 'Biometric Login',
        subtitle: 'Use your biometrics to continue',
        negativeButtonText: 'Cancel'
      });

      setAuthenticated(result.success);
      console.log('Authentication successful!');
    } catch (error) {
      console.error('Authentication failed:', error);
      setAuthenticated(false);
    }
  };

  return (
    <div className="biometric-screen">
      <h2>Biometric Authentication</h2>

      {available ? (
        <div>
          <p>Biometry Type: {biometryType}</p>
          <button onClick={handleAuthenticate}>
            Authenticate with Biometrics
          </button>
          {authenticated && (
            <p style={{ color: 'green' }}>✓ Authenticated Successfully</p>
          )}
        </div>
      ) : (
        <p>Biometric authentication is not available on this device</p>
      )}
    </div>
  );
};

export default BiometricAuthScreen;
*/

// Plugin registration in capacitor.config.json
/*
{
  "plugins": {
    "BiometricAuth": {
      "android": {
        "fallbackToPasscode": false
      },
      "ios": {
        "fallbackToPasscode": false
      }
    }
  }
}
*/

// iOS Info.plist requirements
/*
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID for secure authentication</string>
*/

// Android AndroidManifest.xml requirements
/*
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
*/
