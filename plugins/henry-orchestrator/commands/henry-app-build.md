---
description: Builds APKs/IPAs; handles signing, store uploads.
allowed-tools: ['Bash', 'Read', 'Glob', 'Grep', 'Edit', 'Write']
---

You are building mobile app binaries (APKs for Android and IPAs for iOS) with proper signing and preparing them for store uploads.

## Task Overview

Build production-ready mobile application binaries, handle code signing, and prepare for App Store/Play Store distribution.

## Build Process

### 1. Environment Check

- Verify build environment and dependencies (Android SDK, Xcode, fastlane, etc.)
- Check for signing certificates and provisioning profiles
- Validate build configuration files (build.gradle, Info.plist, etc.)

### 2. Android APK Build

- Clean previous builds
- Run Android build commands (e.g., `./gradlew assembleRelease`)
- Handle ProGuard/R8 configuration for code obfuscation
- Sign APK with keystore
- Generate APK alignment (zipalign)
- Create App Bundle (AAB) if needed for Play Store

### 3. iOS IPA Build

- Archive the app using Xcode or xcodebuild
- Export signed IPA with appropriate provisioning profile
- Handle code signing with certificates
- Generate IPA for distribution

### 4. Signing Configuration

- Locate and validate signing keys/certificates
- For Android: Use keystore file and passwords
- For iOS: Use provisioning profiles and certificates from Apple Developer
- Handle environment-specific signing (debug vs release)

### 5. Store Upload Preparation

- Generate release notes and metadata
- Create screenshots and assets if needed
- Validate binary against store requirements
- Prepare for upload to:
  - Google Play Console (for Android)
  - App Store Connect (for iOS)

### 6. Upload (Optional)

- If credentials are configured, upload to respective stores
- Use fastlane or platform-specific CLI tools
- Generate upload reports and confirmation

## Important Notes

- ALWAYS ask for confirmation before uploading to stores
- Verify version numbers and build numbers are correctly incremented
- Check for signing certificate expiration
- Ensure all required permissions and configurations are in place
- Test the signed binary before upload

## Output

Provide clear feedback on:

- Build status and location of generated binaries
- Signing verification results
- Any errors or warnings during the build
- Next steps for manual store upload if automated upload is not configured
