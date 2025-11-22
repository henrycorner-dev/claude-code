---
description: Configures notifications (Firebase); tests delivery.
argument-hint: Optional platform preference (iOS/Android/Web) or project name
allowed-tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'TodoWrite', 'AskUserQuestion']
---

# Firebase Push Notifications Configuration & Testing

Guide the user through setting up Firebase Cloud Messaging (FCM) for push notifications and testing delivery across iOS, Android, and web platforms.

## Core Principles

- **Auto-detect platform**: Analyze existing project files to determine target platforms (iOS, Android, web, or all)
- **Verify before configuration**: Always confirm platform targets and Firebase project details with the user
- **Use TodoWrite**: Track all phases and steps throughout the process
- **Test thoroughly**: Verify notification delivery on all target platforms
- **Follow best practices**: Use official Firebase SDKs and current best practices

**Initial request:** $ARGUMENTS

---

## Phase 1: Context Analysis & Platform Detection

**Goal**: Understand the project context and determine which platforms need push notification support

**Actions**:

1. Create todo list with all phases:
   - Analyze project context and detect platforms
   - Check Firebase project setup
   - Install and configure Firebase SDKs
   - Configure platform-specific notification settings (iOS/Android/Web)
   - Set up notification handlers and permissions
   - Create test notification system
   - Test notification delivery on all platforms
   - Provide implementation examples and next steps

2. Analyze existing project to detect platforms:
   - Check for React Native project (android/, ios/, app.json, metro.config.js)
   - Check for Flutter project (pubspec.yaml, lib/main.dart, android/, ios/)
   - Check for Next.js/React web project (next.config.js, package.json, pages/ or app/)
   - Check for Vue/Nuxt project (nuxt.config.js, vite.config.js)
   - Check for Angular project (angular.json)
   - Check for native iOS project (Xcode project, .xcworkspace)
   - Check for native Android project (build.gradle, AndroidManifest.xml)
   - Check for Expo project (app.json with expo configuration)

3. Parse user arguments from $ARGUMENTS:
   - Platform preference (iOS, Android, Web, or All)
   - Project name or Firebase project ID
   - Specific requirements (background notifications, rich media, etc.)

4. Determine notification implementation approach:
   - **React Native**: Use `@react-native-firebase/messaging` or `expo-notifications` (Expo)
   - **Flutter**: Use `firebase_messaging` package
   - **Web (Next.js/React/Vue)**: Use Firebase JS SDK with service workers
   - **Native iOS**: Use Firebase iOS SDK with APNs
   - **Native Android**: Use Firebase Android SDK with FCM

5. Check for existing Firebase configuration:
   - Look for `google-services.json` (Android)
   - Look for `GoogleService-Info.plist` (iOS)
   - Look for `firebase.json` or Firebase config in code
   - Check if Firebase is already initialized in the project

**Output**: Platform detection summary with recommended notification approach

---

## Phase 2: Firebase Project Setup Verification

**Goal**: Ensure Firebase project exists and has necessary configuration files

**Actions**:

1. Update TodoWrite: Mark "Check Firebase project setup" as in_progress

2. Use AskUserQuestion to gather Firebase information:
   - Ask if user has existing Firebase project or needs to create one
   - Get Firebase project ID
   - Confirm target platforms (iOS, Android, Web, or all)
   - Ask about notification requirements (background, data-only, rich media, etc.)

3. Verify Firebase CLI installation:

   ```bash
   # Check if Firebase CLI is installed
   firebase --version
   ```

4. If Firebase CLI not installed, guide installation:

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

5. For existing Firebase project, list projects:

   ```bash
   firebase projects:list
   ```

6. Initialize Firebase in project if needed:

   ```bash
   firebase init
   # Select:
   # - Cloud Messaging (if available)
   # - Hosting (for web push)
   ```

7. Verify Firebase configuration files exist:
   - **Android**: Check for `android/app/google-services.json`
   - **iOS**: Check for `ios/GoogleService-Info.plist` or `ios/Runner/GoogleService-Info.plist`
   - **Web**: Check for Firebase config in code or environment variables

8. If configuration files missing, guide user to download:
   - Go to Firebase Console → Project Settings → Your Apps
   - Download `google-services.json` for Android
   - Download `GoogleService-Info.plist` for iOS
   - Copy Web SDK configuration

**Output**: Firebase project verified with necessary configuration files in place

---

## Phase 3: Install Firebase SDKs

**Goal**: Install and configure Firebase SDK packages for each platform

**Actions**:

1. Update TodoWrite: Mark "Install and configure Firebase SDKs" as in_progress

2. Install platform-specific Firebase packages:

   **React Native (Non-Expo)**:

   ```bash
   # Install Firebase messaging
   npm install @react-native-firebase/app @react-native-firebase/messaging

   # iOS: Install pods
   cd ios && pod install && cd ..
   ```

   **React Native (Expo)**:

   ```bash
   # Install Expo notifications
   npx expo install expo-notifications expo-device expo-constants

   # For managed workflow, also install:
   npx expo install expo-application
   ```

   **Flutter**:

   ```bash
   # Add to pubspec.yaml
   flutter pub add firebase_core
   flutter pub add firebase_messaging

   # Run pub get
   flutter pub get
   ```

   **Next.js/React Web**:

   ```bash
   # Install Firebase JS SDK
   npm install firebase
   ```

   **Vue/Nuxt**:

   ```bash
   # Install Firebase JS SDK
   npm install firebase

   # For Nuxt, optionally install:
   npm install @nuxtjs/firebase
   ```

   **Angular**:

   ```bash
   # Install Firebase and AngularFire
   npm install firebase @angular/fire
   ```

3. For iOS (React Native/Flutter), update Podfile capabilities:
   - Edit `ios/Podfile` or `ios/Runner/Info.plist`
   - Ensure background modes are enabled

4. For Android, verify dependencies in `android/app/build.gradle`:

   ```gradle
   dependencies {
       // Firebase BOM for version management
       implementation platform('com.google.firebase:firebase-bom:32.7.0')
       implementation 'com.google.firebase:firebase-messaging'
   }
   ```

5. Add Firebase configuration files to project:
   - Copy `google-services.json` to `android/app/`
   - Copy `GoogleService-Info.plist` to `ios/` or `ios/Runner/`
   - Ensure these files are in `.gitignore` or handled securely

**Output**: Firebase SDKs installed and configured for all target platforms

---

## Phase 4: Platform-Specific Notification Configuration

**Goal**: Configure notification settings for iOS, Android, and web platforms

**Actions**:

1. Update TodoWrite: Mark "Configure platform-specific notification settings" as in_progress

2. **iOS Configuration** (React Native/Flutter):

   a. Enable Push Notifications capability in Xcode:
   - Open `ios/[ProjectName].xcworkspace` in Xcode
   - Select project → Signing & Capabilities
   - Add "Push Notifications" capability
   - Add "Background Modes" capability
   - Enable "Remote notifications" under Background Modes

   b. Configure APNs (Apple Push Notification service):
   - Go to Apple Developer Portal → Certificates, IDs & Profiles
   - Create APNs Authentication Key or Certificate
   - Upload to Firebase Console → Project Settings → Cloud Messaging → iOS app

   c. Update Info.plist for permissions:

   ```xml
   <key>UIBackgroundModes</key>
   <array>
       <string>remote-notification</string>
   </array>
   ```

   d. For Flutter, update `ios/Runner/AppDelegate.swift`:

   ```swift
   import Firebase
   import UserNotifications

   @UIApplicationMain
   @objc class AppDelegate: FlutterAppDelegate {
     override func application(
       _ application: UIApplication,
       didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
     ) -> Bool {
       FirebaseApp.configure()

       if #available(iOS 10.0, *) {
         UNUserNotificationCenter.current().delegate = self
       }

       GeneratedPluginRegistrant.register(with: self)
       return super.application(application, didFinishLaunchingWithOptions: launchOptions)
     }
   }
   ```

3. **Android Configuration**:

   a. Update `AndroidManifest.xml`:

   ```xml
   <manifest>
       <uses-permission android:name="android.permission.INTERNET"/>
       <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

       <application>
           <!-- Firebase Messaging Service -->
           <service
               android:name=".MyFirebaseMessagingService"
               android:exported="false">
               <intent-filter>
                   <action android:name="com.google.firebase.MESSAGING_EVENT"/>
               </intent-filter>
           </service>

           <!-- Notification channel for Android 8+ -->
           <meta-data
               android:name="com.google.firebase.messaging.default_notification_channel_id"
               android:value="@string/default_notification_channel_id"/>
       </application>
   </manifest>
   ```

   b. Add Google Services plugin to `android/build.gradle`:

   ```gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.4.0'
       }
   }
   ```

   c. Apply plugin in `android/app/build.gradle`:

   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

   d. Set notification icon (optional but recommended):
   - Add notification icon to `android/app/src/main/res/drawable/`
   - Update in AndroidManifest.xml:

   ```xml
   <meta-data
       android:name="com.google.firebase.messaging.default_notification_icon"
       android:resource="@drawable/ic_notification"/>
   ```

4. **Web Configuration** (Next.js/React/Vue):

   a. Create `public/firebase-messaging-sw.js` (Service Worker):

   ```javascript
   importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
   importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

   firebase.initializeApp({
     apiKey: 'YOUR_API_KEY',
     authDomain: 'YOUR_AUTH_DOMAIN',
     projectId: 'YOUR_PROJECT_ID',
     storageBucket: 'YOUR_STORAGE_BUCKET',
     messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
     appId: 'YOUR_APP_ID',
   });

   const messaging = firebase.messaging();

   messaging.onBackgroundMessage(payload => {
     console.log('Received background message:', payload);

     const notificationTitle = payload.notification.title;
     const notificationOptions = {
       body: payload.notification.body,
       icon: '/firebase-logo.png',
     };

     self.registration.showNotification(notificationTitle, notificationOptions);
   });
   ```

   b. Register service worker in main app:

   ```javascript
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker
       .register('/firebase-messaging-sw.js')
       .then(registration => {
         console.log('Service Worker registered:', registration);
       })
       .catch(error => {
         console.error('Service Worker registration failed:', error);
       });
   }
   ```

   c. Add VAPID key from Firebase Console:
   - Go to Firebase Console → Project Settings → Cloud Messaging
   - Generate Web Push certificates (VAPID keys)
   - Save the public key for use in the app

**Output**: Platform-specific notification configurations completed

---

## Phase 5: Implement Notification Handlers & Request Permissions

**Goal**: Set up notification handlers and request user permissions

**Actions**:

1. Update TodoWrite: Mark "Set up notification handlers and permissions" as in_progress

2. **React Native (Non-Expo)** implementation:

   Create `src/services/notificationService.js`:

   ```javascript
   import messaging from '@react-native-firebase/messaging';
   import { Platform, PermissionsAndroid, Alert } from 'react-native';

   class NotificationService {
     async requestPermission() {
       if (Platform.OS === 'ios') {
         const authStatus = await messaging().requestPermission();
         const enabled =
           authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;

         if (enabled) {
           console.log('Authorization status:', authStatus);
           return true;
         }
         return false;
       } else {
         // Android 13+ requires runtime permission
         if (Platform.Version >= 33) {
           const granted = await PermissionsAndroid.request(
             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
           );
           return granted === PermissionsAndroid.RESULTS.GRANTED;
         }
         return true;
       }
     }

     async getToken() {
       try {
         const token = await messaging().getToken();
         console.log('FCM Token:', token);
         // Send this token to your server
         return token;
       } catch (error) {
         console.error('Error getting FCM token:', error);
         return null;
       }
     }

     setupNotificationHandlers() {
       // Foreground message handler
       messaging().onMessage(async remoteMessage => {
         console.log('Foreground notification:', remoteMessage);
         Alert.alert(
           remoteMessage.notification?.title || 'Notification',
           remoteMessage.notification?.body || ''
         );
       });

       // Background message handler
       messaging().setBackgroundMessageHandler(async remoteMessage => {
         console.log('Background notification:', remoteMessage);
       });

       // Notification opened app from background/quit state
       messaging().onNotificationOpenedApp(remoteMessage => {
         console.log('Notification opened app:', remoteMessage);
         // Navigate to specific screen based on notification data
       });

       // Check if app was opened from a notification (quit state)
       messaging()
         .getInitialNotification()
         .then(remoteMessage => {
           if (remoteMessage) {
             console.log('App opened from quit state:', remoteMessage);
           }
         });

       // Token refresh listener
       messaging().onTokenRefresh(token => {
         console.log('Token refreshed:', token);
         // Send updated token to your server
       });
     }
   }

   export default new NotificationService();
   ```

3. **React Native (Expo)** implementation:

   Create `src/services/notificationService.js`:

   ```javascript
   import * as Notifications from 'expo-notifications';
   import * as Device from 'expo-device';
   import { Platform } from 'react-native';
   import Constants from 'expo-constants';

   // Configure notification behavior
   Notifications.setNotificationHandler({
     handleNotification: async () => ({
       shouldShowAlert: true,
       shouldPlaySound: true,
       shouldSetBadge: true,
     }),
   });

   class NotificationService {
     async registerForPushNotifications() {
       let token;

       if (Platform.OS === 'android') {
         await Notifications.setNotificationChannelAsync('default', {
           name: 'default',
           importance: Notifications.AndroidImportance.MAX,
           vibrationPattern: [0, 250, 250, 250],
           lightColor: '#FF231F7C',
         });
       }

       if (Device.isDevice) {
         const { status: existingStatus } = await Notifications.getPermissionsAsync();
         let finalStatus = existingStatus;

         if (existingStatus !== 'granted') {
           const { status } = await Notifications.requestPermissionsAsync();
           finalStatus = status;
         }

         if (finalStatus !== 'granted') {
           alert('Failed to get push token for push notification!');
           return;
         }

         token = await Notifications.getExpoPushTokenAsync({
           projectId: Constants.expoConfig?.extra?.eas?.projectId,
         });
         console.log('Expo Push Token:', token);
       } else {
         alert('Must use physical device for Push Notifications');
       }

       return token;
     }

     setupNotificationListeners() {
       // Notification received while app is in foreground
       Notifications.addNotificationReceivedListener(notification => {
         console.log('Notification received:', notification);
       });

       // Notification was tapped by user
       Notifications.addNotificationResponseReceivedListener(response => {
         console.log('Notification tapped:', response);
         // Navigate to specific screen based on notification data
       });
     }
   }

   export default new NotificationService();
   ```

4. **Flutter** implementation:

   Create `lib/services/notification_service.dart`:

   ```dart
   import 'package:firebase_messaging/firebase_messaging.dart';
   import 'package:flutter_local_notifications/flutter_local_notifications.dart';

   // Background message handler (must be top-level function)
   @pragma('vm:entry-point')
   Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
     print('Background message: ${message.messageId}');
   }

   class NotificationService {
     final FirebaseMessaging _messaging = FirebaseMessaging.instance;
     final FlutterLocalNotificationsPlugin _localNotifications =
         FlutterLocalNotificationsPlugin();

     Future<void> initialize() async {
       // Request permission
       NotificationSettings settings = await _messaging.requestPermission(
         alert: true,
         badge: true,
         sound: true,
         provisional: false,
       );

       if (settings.authorizationStatus == AuthorizationStatus.authorized) {
         print('User granted permission');
       } else {
         print('User declined or has not accepted permission');
         return;
       }

       // Get FCM token
       String? token = await _messaging.getToken();
       print('FCM Token: $token');
       // Send token to your server

       // Initialize local notifications for Android
       const AndroidInitializationSettings androidSettings =
           AndroidInitializationSettings('@mipmap/ic_launcher');

       const DarwinInitializationSettings iosSettings =
           DarwinInitializationSettings(
         requestAlertPermission: true,
         requestBadgePermission: true,
         requestSoundPermission: true,
       );

       const InitializationSettings initSettings = InitializationSettings(
         android: androidSettings,
         iOS: iosSettings,
       );

       await _localNotifications.initialize(
         initSettings,
         onDidReceiveNotificationResponse: (details) {
           print('Notification tapped: ${details.payload}');
           // Navigate to specific screen
         },
       );

       // Set up message handlers
       FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

       FirebaseMessaging.onMessage.listen((RemoteMessage message) {
         print('Foreground message: ${message.notification?.title}');
         _showNotification(message);
       });

       FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
         print('Notification opened app: ${message.data}');
         // Navigate to specific screen
       });

       // Token refresh
       _messaging.onTokenRefresh.listen((newToken) {
         print('Token refreshed: $newToken');
         // Send updated token to server
       });
     }

     Future<void> _showNotification(RemoteMessage message) async {
       const AndroidNotificationDetails androidDetails =
           AndroidNotificationDetails(
         'default_channel',
         'Default Channel',
         channelDescription: 'Default notification channel',
         importance: Importance.high,
         priority: Priority.high,
       );

       const DarwinNotificationDetails iosDetails = DarwinNotificationDetails();

       const NotificationDetails details = NotificationDetails(
         android: androidDetails,
         iOS: iosDetails,
       );

       await _localNotifications.show(
         message.hashCode,
         message.notification?.title,
         message.notification?.body,
         details,
         payload: message.data.toString(),
       );
     }
   }
   ```

5. **Web (Next.js/React)** implementation:

   Create `src/firebase/messaging.js`:

   ```javascript
   import { getMessaging, getToken, onMessage } from 'firebase/messaging';
   import { initializeApp } from 'firebase/app';

   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   const messaging = getMessaging(app);

   export async function requestNotificationPermission() {
     try {
       const permission = await Notification.requestPermission();

       if (permission === 'granted') {
         console.log('Notification permission granted');

         const token = await getToken(messaging, {
           vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
         });

         console.log('FCM Token:', token);
         // Send token to your server
         return token;
       } else {
         console.log('Notification permission denied');
         return null;
       }
     } catch (error) {
       console.error('Error getting permission:', error);
       return null;
     }
   }

   export function onMessageListener() {
     return new Promise(resolve => {
       onMessage(messaging, payload => {
         console.log('Foreground message:', payload);
         resolve(payload);
       });
     });
   }
   ```

6. Initialize notification service in app entry point:

   **React Native**: In `App.js` or `index.js`

   ```javascript
   import notificationService from './src/services/notificationService';

   useEffect(() => {
     async function setupNotifications() {
       const hasPermission = await notificationService.requestPermission();
       if (hasPermission) {
         await notificationService.getToken();
         notificationService.setupNotificationHandlers();
       }
     }
     setupNotifications();
   }, []);
   ```

   **Flutter**: In `main.dart`

   ```dart
   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     await Firebase.initializeApp();

     final notificationService = NotificationService();
     await notificationService.initialize();

     runApp(MyApp());
   }
   ```

   **Next.js**: In `_app.js` or layout component

   ```javascript
   import { requestNotificationPermission, onMessageListener } from '@/firebase/messaging';

   useEffect(() => {
     requestNotificationPermission();

     onMessageListener().then(payload => {
       console.log('Received:', payload);
       // Show notification toast/banner
     });
   }, []);
   ```

**Output**: Notification handlers implemented with permission requests

---

## Phase 6: Create Test Notification System

**Goal**: Build tools to test notification delivery

**Actions**:

1. Update TodoWrite: Mark "Create test notification system" as in_progress

2. Create a test notification component/screen:

   **React Native** (`src/screens/NotificationTest.js`):

   ```javascript
   import React, { useState, useEffect } from 'react';
   import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
   import notificationService from '../services/notificationService';

   export default function NotificationTest() {
     const [token, setToken] = useState('');
     const [testTitle, setTestTitle] = useState('Test Notification');
     const [testBody, setTestBody] = useState('This is a test message');

     useEffect(() => {
       loadToken();
     }, []);

     const loadToken = async () => {
       const fcmToken = await notificationService.getToken();
       setToken(fcmToken || 'No token available');
     };

     const sendTestNotification = () => {
       alert(
         'Copy your FCM token and use Firebase Console or your backend to send a test notification'
       );
     };

     return (
       <View style={styles.container}>
         <Text style={styles.title}>Push Notification Testing</Text>

         <Text style={styles.label}>FCM Token:</Text>
         <Text style={styles.token} selectable>
           {token}
         </Text>

         <Button title="Refresh Token" onPress={loadToken} />

         <View style={styles.divider} />

         <Text style={styles.label}>Test Notification:</Text>
         <TextInput
           style={styles.input}
           placeholder="Title"
           value={testTitle}
           onChangeText={setTestTitle}
         />
         <TextInput
           style={styles.input}
           placeholder="Body"
           value={testBody}
           onChangeText={setTestBody}
           multiline
         />

         <Button title="Send Test via Firebase Console" onPress={sendTestNotification} />

         <View style={styles.divider} />

         <Text style={styles.instructions}>
           Instructions:{'\n'}
           1. Copy the FCM token above{'\n'}
           2. Go to Firebase Console → Cloud Messaging{'\n'}
           3. Click "Send test message"{'\n'}
           4. Paste your FCM token{'\n'}
           5. Send the notification
         </Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: { flex: 1, padding: 20 },
     title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
     label: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 5 },
     token: { fontSize: 12, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
     input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
     divider: { height: 20 },
     instructions: { fontSize: 14, color: '#666', marginTop: 10 },
   });
   ```

3. Create backend test endpoint (optional, for automated testing):

   **Node.js/Express** (`server/routes/notifications.js`):

   ```javascript
   const admin = require('firebase-admin');
   const express = require('express');
   const router = express.Router();

   // Initialize Firebase Admin SDK
   admin.initializeApp({
     credential: admin.credential.cert(require('../firebase-service-account.json')),
   });

   router.post('/send-test', async (req, res) => {
     const { token, title, body, data } = req.body;

     const message = {
       notification: {
         title: title || 'Test Notification',
         body: body || 'This is a test message',
       },
       data: data || {},
       token: token,
     };

     try {
       const response = await admin.messaging().send(message);
       console.log('Successfully sent message:', response);
       res.json({ success: true, messageId: response });
     } catch (error) {
       console.error('Error sending message:', error);
       res.status(500).json({ success: false, error: error.message });
     }
   });

   router.post('/send-to-topic', async (req, res) => {
     const { topic, title, body } = req.body;

     const message = {
       notification: {
         title: title || 'Test Notification',
         body: body || 'This is a test message to topic',
       },
       topic: topic,
     };

     try {
       const response = await admin.messaging().send(message);
       res.json({ success: true, messageId: response });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   });

   module.exports = router;
   ```

4. Create test script using Firebase Admin SDK:

   **Node.js script** (`scripts/send-test-notification.js`):

   ```javascript
   const admin = require('firebase-admin');
   const serviceAccount = require('../firebase-service-account.json');

   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
   });

   async function sendTestNotification() {
     const token = process.argv[2];

     if (!token) {
       console.error('Usage: node send-test-notification.js <FCM_TOKEN>');
       process.exit(1);
     }

     const message = {
       notification: {
         title: 'Test Notification',
         body: 'This is a test notification from script',
       },
       data: {
         screen: 'home',
         timestamp: Date.now().toString(),
       },
       token: token,
       android: {
         priority: 'high',
         notification: {
           sound: 'default',
           channelId: 'default',
         },
       },
       apns: {
         payload: {
           aps: {
             sound: 'default',
             badge: 1,
           },
         },
       },
     };

     try {
       const response = await admin.messaging().send(message);
       console.log('✅ Successfully sent test notification');
       console.log('Message ID:', response);
     } catch (error) {
       console.error('❌ Error sending notification:', error);
     }

     process.exit(0);
   }

   sendTestNotification();
   ```

5. Add npm script to `package.json`:
   ```json
   {
     "scripts": {
       "test:notification": "node scripts/send-test-notification.js"
     }
   }
   ```

**Output**: Test notification system created and ready to use

---

## Phase 7: Test Notification Delivery

**Goal**: Verify notifications work on all target platforms

**Actions**:

1. Update TodoWrite: Mark "Test notification delivery on all platforms" as in_progress

2. Test notification permissions:

   **iOS**:
   - Run app on iOS simulator or device
   - Verify permission dialog appears
   - Grant notification permission
   - Check that FCM token is generated and logged

   **Android**:
   - Run app on Android emulator or device
   - For Android 13+, verify permission dialog appears
   - Grant notification permission
   - Check that FCM token is generated and logged

   **Web**:
   - Open app in browser (must be HTTPS in production)
   - Verify browser permission prompt appears
   - Grant notification permission
   - Check that FCM token is generated

3. Test foreground notifications:

   **Method 1: Firebase Console**
   - Go to Firebase Console → Cloud Messaging
   - Click "Send test message"
   - Paste the FCM token from your device/browser
   - Enter title and body
   - Click "Test"
   - Verify notification appears while app is open

   **Method 2: Using test script**

   ```bash
   npm run test:notification YOUR_FCM_TOKEN_HERE
   ```

   **Verify**:
   - Notification appears in app (alert/toast/banner)
   - Notification handler logs the message
   - Custom data is received correctly

4. Test background notifications:
   - Send notification using Firebase Console or script
   - Put app in background (minimize or switch apps)
   - Verify notification appears in system tray
   - Tap notification
   - Verify app opens and handles notification data

5. Test notification from quit state:
   - Completely close/quit the app
   - Send notification using Firebase Console or script
   - Verify notification appears in system tray
   - Tap notification
   - Verify app launches and handles initial notification

6. Test platform-specific features:

   **iOS**:
   - Badge count updates
   - Sound plays
   - Notification appears on lock screen
   - Notification appears in Notification Center

   **Android**:
   - Notification appears with custom icon
   - Notification channel works correctly
   - Notification priority is respected
   - Sound/vibration works

   **Web**:
   - Browser notification appears
   - Service worker handles background messages
   - Notification click opens/focuses the web app

7. Test edge cases:
   - Token refresh (simulate by clearing app data)
   - Multiple notifications (verify all appear)
   - Notifications with custom data payloads
   - Rich notifications with images (if configured)
   - Silent/data-only notifications
   - Notification grouping (Android)

8. Document test results:

   ```markdown
   ## Notification Testing Results

   ### iOS

   - [x] Permission request works
   - [x] FCM token generated
   - [x] Foreground notifications display
   - [x] Background notifications appear
   - [x] Notification tap opens app
   - [x] Custom data received
   - [x] Badge count updates

   ### Android

   - [x] Permission request works (Android 13+)
   - [x] FCM token generated
   - [x] Foreground notifications display
   - [x] Background notifications appear
   - [x] Notification tap opens app
   - [x] Custom data received
   - [x] Custom icon displays

   ### Web

   - [x] Browser permission works
   - [x] FCM token generated
   - [x] Foreground notifications display
   - [x] Service worker handles background
   - [x] Notification click focuses app
   - [x] Custom data received

   ### Issues Found

   - [List any issues discovered during testing]

   ### Next Steps

   - [Any follow-up work needed]
   ```

**Output**: Notifications verified working on all target platforms

---

## Phase 8: Documentation & Implementation Examples

**Goal**: Provide comprehensive documentation and code examples

**Actions**:

1. Mark all todos as completed

2. Create `PUSH_NOTIFICATIONS.md` documentation:

   ```markdown
   # Push Notifications Setup - Complete Guide

   ## Overview

   This project uses Firebase Cloud Messaging (FCM) for push notifications across:

   - iOS (APNs via FCM)
   - Android (FCM native)
   - Web (FCM with Service Workers)

   ## Architecture

   \`\`\`
   Firebase Cloud Messaging
   |
   |--- iOS (APNs)
   |--- Android (FCM)
   |--- Web (Service Workers)
   \`\`\`

   ## Configuration Files

   - \`android/app/google-services.json\` - Android Firebase config
   - \`ios/GoogleService-Info.plist\` - iOS Firebase config
   - \`public/firebase-messaging-sw.js\` - Web service worker (web only)
   - \`.env\` - Firebase web config (web only)

   ## Notification Service

   ### Getting FCM Token

   \`\`\`javascript
   const token = await notificationService.getToken();
   // Send this token to your backend to enable notifications
   \`\`\`

   ### Handling Notifications

   **Foreground**: App is open and active

   - Notification is handled by \`onMessage\` listener
   - Display in-app alert or custom UI

   **Background**: App is in background but not killed

   - System displays notification automatically
   - Tap opens app and triggers \`onNotificationOpenedApp\`

   **Quit**: App is completely closed

   - System displays notification automatically
   - Tap launches app and triggers \`getInitialNotification\`

   ## Sending Notifications

   ### Method 1: Firebase Console (Testing)

   1. Go to Firebase Console → Cloud Messaging
   2. Click "Send test message"
   3. Paste FCM token
   4. Enter title and body
   5. Click "Test"

   ### Method 2: Firebase Admin SDK (Backend)

   \`\`\`javascript
   const message = {
   notification: {
   title: 'Hello',
   body: 'World',
   },
   data: {
   screen: 'home',
   id: '123',
   },
   token: userFcmToken,
   };

   const response = await admin.messaging().send(message);
   \`\`\`

   ### Method 3: FCM HTTP API

   \`\`\`bash
   curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \\
   -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
   -H "Content-Type: application/json" \\
   -d '{
   "message": {
   "token": "FCM_TOKEN",
   "notification": {
   "title": "Hello",
   "body": "World"
   }
   }
   }'
   \`\`\`

   ## Notification Payload Structure

   ### Basic Notification

   \`\`\`json
   {
   "notification": {
   "title": "Notification Title",
   "body": "Notification body text"
   },
   "token": "DEVICE_FCM_TOKEN"
   }
   \`\`\`

   ### With Custom Data

   \`\`\`json
   {
   "notification": {
   "title": "New Message",
   "body": "You have a new message"
   },
   "data": {
   "screen": "chat",
   "chatId": "123",
   "userId": "456"
   },
   "token": "DEVICE_FCM_TOKEN"
   }
   \`\`\`

   ### Platform-Specific Options

   \`\`\`json
   {
   "notification": {
   "title": "Hello",
   "body": "World"
   },
   "android": {
   "priority": "high",
   "notification": {
   "channelId": "default",
   "sound": "default",
   "color": "#FF0000"
   }
   },
   "apns": {
   "payload": {
   "aps": {
   "sound": "default",
   "badge": 1
   }
   }
   },
   "token": "DEVICE_FCM_TOKEN"
   }
   \`\`\`

   ## Topic Messaging

   Subscribe users to topics for targeted notifications:

   \`\`\`javascript
   // Subscribe to topic
   await messaging().subscribeToTopic('news');

   // Send to topic
   const message = {
   notification: {
   title: 'Breaking News',
   body: 'Something important happened'
   },
   topic: 'news'
   };
   await admin.messaging().send(message);
   \`\`\`

   ## Troubleshooting

   ### iOS Issues

   **No token generated**

   - Verify APNs certificates are uploaded to Firebase
   - Check Push Notifications capability is enabled in Xcode
   - Ensure app is run on real device (simulator has limitations)

   **Notifications not appearing**

   - Check notification permissions are granted
   - Verify Background Modes → Remote notifications is enabled
   - Check device is not in Do Not Disturb mode

   ### Android Issues

   **No token generated**

   - Verify google-services.json is in android/app/
   - Check Google Services plugin is applied
   - Ensure internet permission is in AndroidManifest

   **Notifications not appearing**

   - Check notification permissions (Android 13+)
   - Verify notification channel is created
   - Check device notification settings

   ### Web Issues

   **No token generated**

   - Verify using HTTPS (required for service workers)
   - Check service worker is registered
   - Ensure VAPID key is correct

   **Background notifications not working**

   - Verify firebase-messaging-sw.js is in public/ directory
   - Check service worker scope is correct
   - Check browser console for errors

   ## Security Best Practices

   1. **Never commit Firebase config files to git**
      - Add to .gitignore: google-services.json, GoogleService-Info.plist
      - Use environment variables for web config

   2. **Validate tokens on backend**
      - Verify FCM tokens before sending notifications
      - Implement token validation and cleanup

   3. **Secure custom data**
      - Don't send sensitive data in notification payload
      - Use notification as trigger to fetch secure data

   4. **Rate limiting**
      - Implement rate limiting on backend
      - Prevent notification spam

   ## Testing Checklist

   - [ ] iOS foreground notifications
   - [ ] iOS background notifications
   - [ ] iOS notification tap navigation
   - [ ] Android foreground notifications
   - [ ] Android background notifications
   - [ ] Android notification tap navigation
   - [ ] Web foreground notifications
   - [ ] Web background notifications (service worker)
   - [ ] Web notification click handling
   - [ ] Token refresh handling
   - [ ] Custom data payload handling
   - [ ] Topic subscriptions
   - [ ] Batch notifications

   ## Additional Resources

   - [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
   - [React Native Firebase Messaging](https://rnfirebase.io/messaging/usage)
   - [Flutter Firebase Messaging](https://firebase.flutter.dev/docs/messaging/overview)
   - [Firebase JS SDK Messaging](https://firebase.google.com/docs/cloud-messaging/js/client)
   ```

3. Create implementation examples document:

   **Common use cases** (`docs/notification-examples.md`):

   ```markdown
   # Push Notification Implementation Examples

   ## 1. Welcome Notification (New User)

   \`\`\`javascript
   const message = {
   notification: {
   title: 'Welcome to Our App!',
   body: 'Thanks for joining. Let\\'s get started!',
   },
   data: {
   screen: 'onboarding',
   action: 'start_tour',
   },
   token: userToken,
   };
   \`\`\`

   ## 2. Chat Message Notification

   \`\`\`javascript
   const message = {
   notification: {
   title: senderName,
   body: messagePreview,
   },
   data: {
   screen: 'chat',
   chatId: chatId,
   senderId: senderId,
   messageId: messageId,
   },
   android: {
   notification: {
   channelId: 'chat_messages',
   priority: 'high',
   },
   },
   apns: {
   payload: {
   aps: {
   badge: unreadCount,
   sound: 'chat_notification.wav',
   },
   },
   },
   token: recipientToken,
   };
   \`\`\`

   ## 3. Time-Sensitive Notification (Scheduled)

   \`\`\`javascript
   const message = {
   notification: {
   title: 'Don\\'t Forget!',
   body: 'Your meeting starts in 10 minutes',
   },
   data: {
   screen: 'calendar',
   eventId: eventId,
   type: 'reminder',
   },
   android: {
   notification: {
   priority: 'high',
   defaultSound: true,
   defaultVibrateTimings: true,
   },
   },
   apns: {
   payload: {
   aps: {
   sound: 'default',
   'interruption-level': 'time-sensitive',
   },
   },
   },
   token: userToken,
   };
   \`\`\`

   ## 4. Rich Notification with Image

   \`\`\`javascript
   const message = {
   notification: {
   title: 'New Product Launch',
   body: 'Check out our latest product!',
   },
   data: {
   screen: 'product',
   productId: productId,
   },
   android: {
   notification: {
   imageUrl: 'https://example.com/product-image.jpg',
   },
   },
   apns: {
   fcm_options: {
   image: 'https://example.com/product-image.jpg',
   },
   },
   token: userToken,
   };
   \`\`\`

   ## 5. Silent Data-Only Notification

   \`\`\`javascript
   const message = {
   data: {
   type: 'sync',
   action: 'refresh_data',
   timestamp: Date.now().toString(),
   },
   android: {
   priority: 'high',
   },
   apns: {
   headers: {
   'apns-priority': '5',
   },
   payload: {
   aps: {
   'content-available': 1,
   },
   },
   },
   token: userToken,
   };
   \`\`\`

   ## 6. Topic Notification (Broadcast)

   \`\`\`javascript
   const message = {
   notification: {
   title: 'App Update Available',
   body: 'Version 2.0 is now available. Update now!',
   },
   data: {
   screen: 'update',
   version: '2.0.0',
   },
   topic: 'all_users',
   };
   \`\`\`

   ## 7. Conditional Topic Notification

   \`\`\`javascript
   const message = {
   notification: {
   title: 'Special Offer',
   body: 'Limited time offer just for you!',
   },
   data: {
   screen: 'offers',
   offerId: offerId,
   },
   condition: "'premium_users' in topics && 'notifications_enabled' in topics",
   };
   \`\`\`

   ## 8. Notification with Actions (Android)

   \`\`\`javascript
   const message = {
   notification: {
   title: 'Friend Request',
   body: 'John Doe wants to connect',
   },
   data: {
   screen: 'profile',
   userId: userId,
   },
   android: {
   notification: {
   clickAction: 'FRIEND_REQUEST',
   actions: [
   {
   title: 'Accept',
   action: 'accept',
   },
   {
   title: 'Decline',
   action: 'decline',
   },
   ],
   },
   },
   token: userToken,
   };
   \`\`\`
   ```

4. Create Quick Reference Card:

   ```markdown
   ## Quick Reference

   ### Get FCM Token

   \`\`\`javascript
   const token = await notificationService.getToken();
   \`\`\`

   ### Request Permission

   \`\`\`javascript
   const granted = await notificationService.requestPermission();
   \`\`\`

   ### Subscribe to Topic

   \`\`\`javascript
   await messaging().subscribeToTopic('news');
   \`\`\`

   ### Unsubscribe from Topic

   \`\`\`javascript
   await messaging().unsubscribeFromTopic('news');
   \`\`\`

   ### Send Test Notification

   \`\`\`bash
   npm run test:notification YOUR_FCM_TOKEN
   \`\`\`

   ### Check Notification Status

   \`\`\`javascript
   const status = await messaging().hasPermission();
   // iOS: 0=not determined, 1=denied, 2=authorized
   // Android: 0=denied, 1=authorized
   \`\`\`
   ```

5. Provide implementation summary to user:

   ```
   Push Notifications Setup Complete!

   Platforms Configured:
   - iOS: ✓ APNs certificates uploaded, permissions configured
   - Android: ✓ google-services.json added, manifest configured
   - Web: ✓ Service worker registered, VAPID key configured

   Files Created:
   - Notification service implementation
   - Test notification screen/component
   - Backend test endpoint (optional)
   - Comprehensive documentation

   Testing:
   ✓ Permission requests working
   ✓ FCM tokens generated on all platforms
   ✓ Foreground notifications displaying
   ✓ Background notifications appearing
   ✓ Notification tap navigation working
   ✓ Custom data payloads handled correctly

   Quick Start:

   1. Get FCM Token:
      const token = await notificationService.getToken();

   2. Send Test via Firebase Console:
      - Go to Firebase Console → Cloud Messaging
      - Click "Send test message"
      - Paste token and send

   3. Send from Backend:
      npm run test:notification YOUR_FCM_TOKEN

   Next Steps:

   1. Backend Integration:
      - Store FCM tokens in your database
      - Create API endpoints to send notifications
      - Implement notification triggers (events, user actions)
      - Set up notification scheduling

   2. Advanced Features:
      - Topic subscriptions for user segments
      - Rich notifications with images/videos
      - Notification grouping and threading
      - Custom notification sounds
      - In-app notification center
      - Notification analytics tracking

   3. Production Preparation:
      - Set up notification channels (Android)
      - Configure APNs production certificates
      - Implement token refresh handling
      - Set up error handling and logging
      - Add rate limiting
      - Create notification templates
      - Test on real devices

   4. User Experience:
      - Add notification settings screen
      - Allow users to customize preferences
      - Implement quiet hours
      - Add notification history
      - Provide opt-out options

   Documentation:
   - PUSH_NOTIFICATIONS.md - Complete setup guide
   - docs/notification-examples.md - Implementation examples
   - Inline code comments

   Resources:
   - Firebase Console: https://console.firebase.google.com
   - FCM Documentation: https://firebase.google.com/docs/cloud-messaging
   - Testing Guide: See PUSH_NOTIFICATIONS.md
   ```

**Output**: Complete push notification system with documentation and examples

---

## Important Notes

### Platform-Specific Requirements

**iOS**:

- Requires physical device for testing (simulator has limitations)
- Must upload APNs authentication key or certificate to Firebase
- Requires Apple Developer Program membership for production
- Different behavior in development vs production builds

**Android**:

- Android 13+ requires POST_NOTIFICATIONS runtime permission
- Must create notification channels for Android 8+
- Google Play Services required on device
- Works on emulators

**Web**:

- Requires HTTPS (except localhost)
- Service worker required for background notifications
- Different behavior across browsers (Chrome, Firefox, Safari)
- Safari has limited support on iOS

### Best Practices

1. **Token Management**:
   - Store tokens securely on backend
   - Handle token refresh events
   - Clean up invalid/expired tokens
   - Associate tokens with users

2. **Notification Design**:
   - Keep messages concise and actionable
   - Include clear call-to-action
   - Respect user preferences
   - Don't spam users

3. **Testing**:
   - Test on real devices, not just simulators
   - Test all notification states (foreground, background, quit)
   - Test on different OS versions
   - Test network failure scenarios

4. **Security**:
   - Never expose Firebase service account keys
   - Validate all notification data
   - Use environment variables for sensitive config
   - Implement server-side token validation

### Common Issues

**Token not generated**:

- Check Firebase configuration files are correctly placed
- Verify network connectivity
- Check Google Play Services (Android)
- Ensure permissions are granted

**Notifications not appearing**:

- Check device notification settings
- Verify Do Not Disturb is off
- Check notification channels (Android)
- Verify background modes (iOS)

**Service worker not working (Web)**:

- Must use HTTPS
- Check service worker file is in correct location
- Verify service worker scope
- Check browser console for errors

### Performance Considerations

- Batch notifications when possible
- Use topics for broadcast messages
- Implement exponential backoff for retries
- Monitor FCM quota limits
- Cache tokens locally

### Analytics & Monitoring

- Track notification delivery rates
- Monitor click-through rates
- Log notification errors
- Track user engagement
- A/B test notification content

---

**Begin with Phase 1: Context Analysis & Platform Detection**
