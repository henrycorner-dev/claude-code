---
description: Sets up cross-platform app (React Native/Flutter); handles platform setup
argument-hint: Optional project name or framework preference (React Native/Flutter)
allowed-tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'TodoWrite', 'AskUserQuestion']
---

# Cross-Platform Mobile App Scaffolding

Guide the user through scaffolding a complete cross-platform mobile application by intelligently auto-selecting between React Native and Flutter based on project context, existing files, user preferences, and team expertise.

## Core Principles

- **Auto-select intelligently**: Analyze existing project files, team expertise, and user preferences to determine the best framework
- **Verify before scaffolding**: Always confirm the selected framework and configuration with the user before running any scaffold commands
- **Use TodoWrite**: Track all phases and steps throughout the process
- **Handle platform setup**: Configure both iOS and Android platforms correctly
- **Follow best practices**: Use official CLI tools and current best practices for each framework

**Initial request:** $ARGUMENTS

---

## Phase 1: Context Analysis & Framework Selection

**Goal**: Understand the project context and auto-select the most appropriate mobile framework

**Actions**:

1. Create todo list with all phases:
   - Analyze project context and team expertise
   - Auto-select mobile framework (React Native vs Flutter)
   - Confirm framework and configuration with user
   - Check system requirements and prepare environment
   - Scaffold mobile application
   - Configure platform-specific settings (iOS/Android)
   - Install dependencies and set up development tools
   - Verify installation and test on emulators
   - Provide next steps and documentation

2. Analyze existing project context:
   - Check if package.json exists (JavaScript/TypeScript project)
   - Check for existing mobile framework files (android/, ios/, flutter/, .dart files)
   - Check for existing web framework that might influence choice (React → React Native)
   - Look for team's language preferences (JavaScript/TypeScript vs Dart)
   - Check git history for technology preferences
   - Detect if part of monorepo or standalone project

3. Parse user arguments from $ARGUMENTS:
   - Project name (if provided)
   - Framework preference (React Native, Flutter, Expo)
   - Platform targets (iOS, Android, both)
   - TypeScript preference (for React Native)
   - Specific requirements or integrations

4. Auto-select framework based on:
   - **Existing ecosystem**: If React/JavaScript project exists, favor React Native
   - **Team expertise**: Consider developer background
   - **User preference**: If user mentioned specific framework in arguments, prioritize that
   - **Modern defaults**: For new projects without constraints:
     - React Native (Expo) for JavaScript/TypeScript teams and rapid prototyping
     - React Native CLI for full native control and existing React experience
     - Flutter for Dart preference, high-performance requirements, or non-JS teams
   - **TypeScript**: Default to TypeScript for React Native projects

5. Determine project configuration:
   - **React Native with Expo**: Best for quick starts, managed workflow, easier setup
   - **React Native CLI**: Better for native modules, full control, brownfield apps
   - **Flutter**: Cross-platform with single codebase, strong performance, beautiful UI

**Output**: Auto-selected mobile framework recommendation with reasoning

---

## Phase 2: Framework & Configuration Confirmation

**Goal**: Present the auto-selected framework to the user and get confirmation or adjustments

**Actions**:

1. Present the auto-selected framework in a clear format:

   ```
   Auto-Selected Mobile Technology Stack:

   Framework: [React Native with Expo / React Native CLI / Flutter]
   Language: [TypeScript / JavaScript / Dart]
   Platforms: [iOS + Android / iOS only / Android only]
   Package Manager: [npm/yarn/pnpm] (for React Native)

   Reasoning:
   - [Explain why this framework was chosen]
   ```

2. Use AskUserQuestion to confirm or modify:
   - Ask if the selected framework is acceptable
   - Offer to change between React Native variants (Expo vs CLI)
   - Offer to change to Flutter if React Native selected (or vice versa)
   - Ask about TypeScript preference (React Native only)
   - Ask about target platforms (iOS, Android, or both)
   - Ask about additional features (navigation, state management, etc.)

3. Update framework choice based on user feedback

**Output**: Confirmed mobile technology stack ready for scaffolding

---

## Phase 3: Environment Preparation & System Requirements

**Goal**: Check system requirements and prepare the environment

**Actions**:

1. Determine project name:
   - Use from $ARGUMENTS if provided
   - Use current directory name if scaffolding in place
   - Ask user if unclear

2. Check system requirements based on framework:

   **For React Native (Expo)**:
   - Node.js (v18 or newer)
   - npm/yarn/pnpm
   - Git
   - Optional: iOS Simulator (macOS only), Android Studio

   **For React Native (CLI)**:
   - Node.js (v18 or newer)
   - npm/yarn/pnpm
   - Watchman (macOS/Linux)
   - Xcode (macOS, for iOS development)
   - CocoaPods (macOS, for iOS dependencies)
   - Android Studio + Android SDK
   - JDK (Java Development Kit)

   **For Flutter**:
   - Flutter SDK (latest stable)
   - Dart SDK (included with Flutter)
   - Xcode (macOS, for iOS development)
   - Android Studio + Android SDK
   - VS Code or Android Studio IDE

3. Run system checks:

   ```bash
   # Node.js version (for React Native)
   node --version

   # Watchman (for React Native CLI, macOS/Linux)
   watchman --version

   # Flutter doctor (for Flutter)
   flutter doctor

   # Check for Xcode (macOS)
   xcode-select --version

   # Check for Android SDK
   # Look for ANDROID_HOME environment variable
   ```

4. Report missing requirements and provide installation guidance:
   - List any missing dependencies
   - Provide installation commands or links
   - Explain which dependencies are optional vs required
   - Explain which dependencies are needed for iOS vs Android

5. Determine scaffolding commands:

   **React Native with Expo**:

   ```bash
   npx create-expo-app [project-name] --template blank-typescript
   # OR for JavaScript:
   npx create-expo-app [project-name] --template blank
   ```

   **React Native CLI**:

   ```bash
   npx react-native@latest init [ProjectName] --template react-native-template-typescript
   # OR for JavaScript:
   npx react-native@latest init [ProjectName]
   ```

   **Flutter**:

   ```bash
   flutter create [project_name] --org com.example --platforms ios,android
   ```

**Output**: Environment verified with scaffolding commands prepared

---

## Phase 4: Scaffolding Execution

**Goal**: Run the scaffolding commands and create the project structure

**Actions**:

1. Update TodoWrite: Mark "Scaffold mobile application" as in_progress

2. Execute the scaffolding command based on chosen framework:

   **For React Native with Expo**:

   ```bash
   npx create-expo-app [project-name] --template blank-typescript
   ```

   - Creates project with Expo SDK
   - Includes Metro bundler configuration
   - Sets up app.json and package.json
   - Includes TypeScript configuration

   **For React Native CLI**:

   ```bash
   npx react-native@latest init [ProjectName] --template react-native-template-typescript
   ```

   - Creates native iOS and Android projects
   - Sets up Metro bundler
   - Configures iOS workspace and Podfile
   - Configures Android Gradle build

   **For Flutter**:

   ```bash
   flutter create [project_name] \
     --org com.example \
     --platforms ios,android \
     --description "Mobile app description"
   ```

   - Creates Flutter project structure
   - Generates iOS and Android native projects
   - Sets up pubspec.yaml for dependencies
   - Creates lib/ directory with main.dart

3. Handle scaffolding output:
   - Monitor command output for errors
   - Note any warnings or recommendations
   - Verify successful project creation

4. Handle errors gracefully:
   - If command fails, read error output carefully
   - Suggest solutions based on error type:
     - Node version issues
     - Missing dependencies
     - Permission problems
     - Network connectivity
   - Retry with adjustments if needed

**Output**: Mobile project scaffolded successfully

---

## Phase 5: Platform-Specific Configuration

**Goal**: Configure iOS and Android platforms for development

**Actions**:

1. Update TodoWrite: Mark "Configure platform-specific settings (iOS/Android)" as in_progress

2. **For React Native CLI** (iOS setup on macOS):

   ```bash
   # Navigate to iOS directory
   cd [project-name]/ios

   # Install CocoaPods dependencies
   pod install

   # Return to project root
   cd ..
   ```

3. **For Flutter** (if needed, usually auto-configured):

   ```bash
   # Flutter automatically runs pub get
   # Verify with:
   flutter doctor -v
   ```

4. Configure platform-specific settings:

   **iOS Configuration** (macOS only):
   - Update Bundle Identifier in Xcode or Info.plist
   - Set minimum iOS version (iOS 13.0+ recommended)
   - Configure signing (can be done later)
   - Update Display Name

   **Android Configuration**:
   - Update package name in android/app/build.gradle
   - Set minimum SDK version (API 21+ recommended)
   - Update app name in android/app/src/main/res/values/strings.xml
   - Configure signing (can be done later for release)

5. Framework-specific configuration files:

   **React Native (Expo)**:
   - Update app.json:
     ```json
     {
       "expo": {
         "name": "App Name",
         "slug": "app-slug",
         "version": "1.0.0",
         "orientation": "portrait",
         "icon": "./assets/icon.png",
         "splash": {
           "image": "./assets/splash.png",
           "resizeMode": "contain",
           "backgroundColor": "#ffffff"
         },
         "ios": {
           "supportsTablet": true,
           "bundleIdentifier": "com.example.app"
         },
         "android": {
           "adaptiveIcon": {
             "foregroundImage": "./assets/adaptive-icon.png",
             "backgroundColor": "#FFFFFF"
           },
           "package": "com.example.app"
         }
       }
     }
     ```

   **React Native CLI**:
   - iOS: Edit ios/[ProjectName]/Info.plist
   - Android: Edit android/app/src/main/AndroidManifest.xml

   **Flutter**:
   - Edit ios/Runner/Info.plist (iOS)
   - Edit android/app/src/main/AndroidManifest.xml (Android)
   - Update pubspec.yaml for app metadata

**Output**: Platforms configured for both iOS and Android

---

## Phase 6: Dependencies & Development Setup

**Goal**: Install core dependencies and set up development environment

**Actions**:

1. Update TodoWrite: Mark "Install dependencies and set up development tools" as in_progress

2. Navigate to project directory:

   ```bash
   cd [project-name]
   ```

3. Install dependencies (if not already done):

   **React Native**:

   ```bash
   npm install
   # or
   yarn install
   ```

   **Flutter**:

   ```bash
   flutter pub get
   ```

4. Add commonly useful packages based on framework:

   **React Native Essential Packages**:

   ```bash
   # Navigation
   npm install @react-navigation/native @react-navigation/native-stack
   npm install react-native-screens react-native-safe-area-context

   # For Expo:
   npx expo install react-native-screens react-native-safe-area-context

   # State Management (optional)
   npm install zustand
   # or
   npm install @reduxjs/toolkit react-redux

   # UI Components (optional)
   npm install react-native-paper
   # or
   npm install @rneui/themed @rneui/base

   # Async Storage
   npm install @react-native-async-storage/async-storage

   # HTTP Client
   npm install axios
   ```

   **Flutter Essential Packages**:
   Edit pubspec.yaml:

   ```yaml
   dependencies:
     flutter:
       sdk: flutter

     # HTTP client
     http: ^1.1.0

     # State management
     provider: ^6.1.0
     # or
     riverpod: ^2.4.0

     # Navigation (built-in, but can use)
     go_router: ^12.0.0

     # Local storage
     shared_preferences: ^2.2.0

     # JSON serialization
     json_annotation: ^4.8.0

   dev_dependencies:
     flutter_test:
       sdk: flutter
     flutter_lints: ^3.0.0
     build_runner: ^2.4.0
     json_serializable: ^6.7.0
   ```

   Then run:

   ```bash
   flutter pub get
   ```

5. Set up development tools:

   **For React Native**:
   - Create .vscode/settings.json for VS Code users
   - Set up ESLint and Prettier
   - Configure TypeScript (if using)

   **For Flutter**:
   - Flutter analyzer is built-in
   - Dart formatter is built-in
   - Set up IDE plugins (Flutter, Dart)

6. Create environment configuration:

   **React Native**:
   Create .env.example:

   ```
   API_BASE_URL=https://api.example.com
   APP_ENV=development
   ```

   **Flutter**:
   Create lib/config/env.dart or use flutter_dotenv package

7. Update .gitignore if needed:
   - iOS build artifacts
   - Android build artifacts
   - Environment files (.env)
   - IDE files

8. Initialize Git if not already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Scaffold [Framework] mobile app"
   ```

**Output**: Dependencies installed and development environment configured

---

## Phase 7: Testing & Verification

**Goal**: Verify the mobile app runs on iOS and Android

**Actions**:

1. Update TodoWrite: Mark "Verify installation and test on emulators" as in_progress

2. **For React Native with Expo**:

   ```bash
   # Start Expo development server
   npm start
   # or
   npx expo start

   # Options shown in terminal:
   # - Press 'i' for iOS simulator (macOS only)
   # - Press 'a' for Android emulator
   # - Scan QR code with Expo Go app on physical device
   ```

3. **For React Native CLI**:

   **iOS** (macOS only):

   ```bash
   npx react-native run-ios
   # or specify simulator:
   npx react-native run-ios --simulator="iPhone 15 Pro"
   ```

   **Android**:

   ```bash
   # Start Android emulator first via Android Studio
   # OR use command line:
   emulator -avd [AVD_NAME]

   # Then run:
   npx react-native run-android
   ```

4. **For Flutter**:

   ```bash
   # List available devices/emulators
   flutter devices

   # Run on iOS simulator (macOS only)
   flutter run -d ios
   # or specify device
   flutter run -d "iPhone 15 Pro"

   # Run on Android emulator
   flutter run -d android
   # or specify device
   flutter run -d emulator-5554
   ```

5. Verify app launches successfully:
   - Check that emulator/simulator opens
   - Verify app installs and launches
   - Check for no compilation errors
   - Verify hot reload works (make a small text change)
   - Test on both iOS and Android if possible

6. Common troubleshooting:

   **React Native iOS**:
   - If build fails, try: `cd ios && pod install && cd ..`
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Clean build: `cd ios && xcodebuild clean && cd ..`

   **React Native Android**:
   - Verify ANDROID_HOME is set: `echo $ANDROID_HOME`
   - Clear Gradle cache: `cd android && ./gradlew clean && cd ..`
   - Ensure emulator is running before building

   **Flutter**:
   - Run `flutter doctor` to check for issues
   - Run `flutter clean` then `flutter pub get`
   - Check that iOS/Android emulator is running

7. Stop development servers after verification

**Output**: Verified working mobile app on target platforms

---

## Phase 8: Documentation & Next Steps

**Goal**: Provide comprehensive documentation and clear next steps

**Actions**:

1. Mark all todos as completed

2. Create MOBILE_SETUP.md in project root:

   ```markdown
   # [Project Name] - Mobile App Setup

   ## Technology Stack

   - Framework: [React Native with Expo / React Native CLI / Flutter]
   - Language: [TypeScript / JavaScript / Dart]
   - Platforms: iOS, Android
   - Package Manager: [npm/yarn/pnpm] (React Native) or pub (Flutter)

   ## Project Structure

   [For React Native]
   \`\`\`
   project-name/
   ├── App.tsx # Main app component
   ├── app.json # Expo configuration (if Expo)
   ├── package.json # Dependencies and scripts
   ├── tsconfig.json # TypeScript configuration
   ├── ios/ # iOS native code
   ├── android/ # Android native code
   ├── assets/ # Images, fonts, etc.
   └── src/ # Application source code
   ├── components/ # Reusable components
   ├── screens/ # Screen components
   ├── navigation/ # Navigation setup
   ├── services/ # API services
   └── utils/ # Utility functions
   \`\`\`

   [For Flutter]
   \`\`\`
   project_name/
   ├── lib/
   │ ├── main.dart # App entry point
   │ ├── screens/ # Screen widgets
   │ ├── widgets/ # Reusable widgets
   │ ├── models/ # Data models
   │ ├── services/ # API services
   │ └── utils/ # Utilities
   ├── ios/ # iOS native code
   ├── android/ # Android native code
   ├── assets/ # Images, fonts, etc.
   ├── pubspec.yaml # Dependencies and assets
   └── test/ # Unit tests
   \`\`\`

   ## Getting Started

   ### Development

   [React Native with Expo]
   \`\`\`bash
   npm start # Start Expo dev server
   npm run ios # Run on iOS simulator
   npm run android # Run on Android emulator
   \`\`\`

   [React Native CLI]
   \`\`\`bash
   npm start # Start Metro bundler
   npx react-native run-ios # Build and run on iOS
   npx react-native run-android # Build and run on Android
   \`\`\`

   [Flutter]
   \`\`\`bash
   flutter run # Run on connected device
   flutter run -d ios # Run on iOS simulator
   flutter run -d android # Run on Android emulator
   \`\`\`

   ### Testing

   [React Native]
   \`\`\`bash
   npm test # Run Jest tests
   npm run test:watch # Run tests in watch mode
   \`\`\`

   [Flutter]
   \`\`\`bash
   flutter test # Run all tests
   flutter test --coverage # Run tests with coverage
   \`\`\`

   ### Building

   [React Native with Expo]
   \`\`\`bash
   eas build --platform ios # Cloud build for iOS
   eas build --platform android # Cloud build for Android
   \`\`\`

   [React Native CLI - iOS]
   \`\`\`bash
   cd ios
   xcodebuild -workspace [ProjectName].xcworkspace \
    -scheme [ProjectName] \
    -configuration Release
   \`\`\`

   [React Native CLI - Android]
   \`\`\`bash
   cd android
   ./gradlew assembleRelease
   \`\`\`

   [Flutter]
   \`\`\`bash
   flutter build ios # Build for iOS
   flutter build apk # Build APK for Android
   flutter build appbundle # Build App Bundle for Google Play
   \`\`\`

   ## Platform Configuration

   ### iOS

   - Minimum iOS version: 13.0
   - Bundle Identifier: [com.example.app]
   - Configuration: ios/Runner/Info.plist (Flutter) or ios/[ProjectName]/Info.plist (RN)

   ### Android

   - Minimum SDK: 21 (Android 5.0)
   - Package name: [com.example.app]
   - Configuration: android/app/build.gradle

   ## Environment Variables

   [List required environment variables]

   ## Installed Packages

   [List key packages and their purpose]

   ## Next Steps

   1. Configure app icons and splash screens
   2. Set up navigation structure
   3. Implement authentication flow
   4. Connect to backend API
   5. Add state management
   6. Implement core features
   7. Set up testing
   8. Configure CI/CD
   ```

3. Create development guide for common tasks:

   ```markdown
   ## Common Development Tasks

   ### Adding a new screen

   [Framework-specific instructions]

   ### Adding dependencies

   [Package installation commands]

   ### Debugging

   [Debugging tools and techniques]

   ### Performance optimization

   [Performance tips]
   ```

4. Provide summary to user:

   ```
   Cross-Platform Mobile App Setup Complete!

   Framework: [React Native with Expo / React Native CLI / Flutter]
   Language: [TypeScript / JavaScript / Dart]
   Platforms: iOS ✓, Android ✓

   Project Location: [path]

   Quick Start:
   cd [project-name]
   [npm start / npx expo start / flutter run]

   Verified:
   ✓ Project scaffolded successfully
   ✓ Dependencies installed
   ✓ iOS configuration ready
   ✓ Android configuration ready
   ✓ Development environment working

   Next Steps:

   1. Configure App Identity:
      - Update app name and bundle identifier
      - Add app icons (use app icon generators)
      - Create splash screen

   2. Set Up Navigation:
      [React Native]
      - Configure React Navigation
      - Create navigation structure
      - Set up tab/stack navigators

      [Flutter]
      - Set up routing (go_router or Navigator 2.0)
      - Create navigation structure

   3. Implement Core Features:
      - Authentication (Firebase Auth, Auth0, custom)
      - State management (Redux/Zustand/Provider/Riverpod)
      - API integration
      - Local data persistence

   4. Testing Setup:
      - Unit tests
      - Widget/Component tests
      - E2E tests (Detox for RN, integration_test for Flutter)

   5. Deployment Preparation:
      - Configure app signing (iOS & Android)
      - Set up Fastlane for automation
      - Create release builds
      - Submit to App Store / Play Store

   Additional Recommendations:

   [React Native]
   - Use Expo EAS for easier builds and updates
   - Consider react-native-firebase for backend services
   - Use react-native-bootsplash for splash screens
   - Add react-native-vector-icons for icons
   - Consider Flipper for debugging

   [Flutter]
   - Use Firebase for backend services
   - Use flutter_launcher_icons for icon generation
   - Use flutter_native_splash for splash screens
   - Consider Freezed for immutable models
   - Use flutter_gen for type-safe assets

   Development Tools:
   - VS Code with relevant extensions
   - React Native Debugger / Flutter DevTools
   - Postman for API testing
   - Figma for design handoff

   Resources:
   [React Native]
   - Official Docs: https://reactnative.dev
   - Expo Docs: https://docs.expo.dev
   - React Navigation: https://reactnavigation.org

   [Flutter]
   - Official Docs: https://flutter.dev
   - Dart Docs: https://dart.dev
   - Pub.dev: https://pub.dev

   Testing on Physical Devices:
   [React Native with Expo]
   - Install Expo Go app from App Store / Play Store
   - Scan QR code from terminal

   [React Native CLI / Flutter]
   - iOS: Connect device via USB, trust computer, select in Xcode
   - Android: Enable Developer Mode, USB Debugging, connect device
   ```

5. Create quick reference for platform-specific issues:

   ```markdown
   ## Troubleshooting Guide

   ### iOS Issues

   - "No provisioning profile found" → Configure signing in Xcode
   - Pod install fails → Update CocoaPods, run pod repo update
   - Build fails → Clean build folder, delete DerivedData

   ### Android Issues

   - Emulator won't start → Check ANDROID_HOME, AVD configuration
   - Build fails → Clear Gradle cache, sync project
   - App won't install → Uninstall old version, clean build

   ### React Native Specific

   - Metro bundler issues → Clear cache: npx react-native start --reset-cache
   - Red screen errors → Check logs, verify imports
   - Native module errors → Re-run pod install (iOS), rebuild (Android)

   ### Flutter Specific

   - "Waiting for another flutter command" → Delete .flutter-plugins-dependencies
   - Gradle issues → Delete .gradle folder, run flutter clean
   - iOS build fails → Update CocoaPods, run pod repo update
   ```

**Output**: Complete mobile project documentation with clear guidance

---

## Important Notes

### Framework Selection Guidance

**Choose React Native (Expo) when**:

- Team has React/JavaScript experience
- Rapid prototyping needed
- Want managed build service
- Don't need many custom native modules
- Want easier OTA updates

**Choose React Native (CLI) when**:

- Need full native module access
- Have specific native requirements
- Want complete control over native code
- Integrating with existing native app
- Need advanced performance optimization

**Choose Flutter when**:

- Team prefers Dart or wants to learn it
- Need highly performant UI animations
- Want single codebase for mobile + web + desktop
- Prefer widget-based UI composition
- Want strong compile-time type safety
- Need pixel-perfect cross-platform UI

### Platform Support Requirements

**iOS Development Requirements** (macOS only):

- Xcode (latest stable version)
- iOS Simulator (included with Xcode)
- CocoaPods (for React Native CLI)
- Active Apple Developer Account (for device testing & deployment)

**Android Development Requirements** (any OS):

- Android Studio
- Android SDK (API level 21+)
- Android Emulator or physical device
- JDK 11 or higher

### Performance Considerations

- React Native: JavaScript bridge can be bottleneck for intensive tasks
- Flutter: Compiled to native code, generally better performance
- Both: Use native modules for performance-critical features

### Common Pitfalls to Avoid

- Not testing on both platforms regularly
- Ignoring platform-specific UI guidelines
- Overusing complex animations
- Not optimizing images and assets
- Neglecting accessibility
- Hardcoding platform-specific logic
- Not handling different screen sizes
- Forgetting to configure deep linking
- Not setting up proper error tracking

### Essential Tools & Services

**Development**:

- VS Code with relevant extensions
- Android Studio for Android development
- Xcode for iOS development (macOS)

**Testing**:

- Jest (React Native)
- Flutter Test (Flutter)
- Detox / Maestro for E2E testing

**Backend & Services**:

- Firebase (auth, database, analytics, crash reporting)
- AWS Amplify
- Supabase

**Deployment & CI/CD**:

- Expo EAS (for Expo apps)
- Fastlane (automation)
- GitHub Actions / Bitrise / Codemagic
- App Center

**Monitoring**:

- Sentry (error tracking)
- Firebase Crashlytics
- Firebase Analytics / Google Analytics

---

**Begin with Phase 1: Context Analysis & Framework Selection**
