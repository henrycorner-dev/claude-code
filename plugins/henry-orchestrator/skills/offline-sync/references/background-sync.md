# Background Sync Implementation Guide

Platform-specific guide for implementing background synchronization on iOS, Android, Web, Desktop, and cross-platform apps.

## Overview

Background sync allows applications to synchronize data even when not actively in use, providing seamless user experience and ensuring data consistency across devices.

## Web (Progressive Web Apps)

### Background Sync API

```javascript
// main.js - Register background sync
async function registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in (await navigator.serviceWorker.ready)) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-data');
            console.log('Background sync registered');
        } catch (error) {
            console.error('Background sync registration failed:', error);
            // Fallback to immediate sync
            await sync();
        }
    } else {
        // Background sync not supported, sync immediately
        await sync();
    }
}

// Trigger sync on data change
async function onDataChange() {
    await registerBackgroundSync();
}

// Sync when coming back online
window.addEventListener('online', async () => {
    console.log('Back online, syncing...');
    await registerBackgroundSync();
});
```

### Service Worker Implementation

```javascript
// sw.js
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(performSync());
    }
});

async function performSync() {
    try {
        console.log('[ServiceWorker] Performing background sync');

        // Open IndexedDB
        const db = await openIndexedDB();

        // Get unsynced items
        const unsyncedItems = await getUnsyncedItems(db);

        if (unsyncedItems.length === 0) {
            console.log('[ServiceWorker] Nothing to sync');
            return;
        }

        // Push to server
        const response = await fetch('/api/sync/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({ items: unsyncedItems })
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }

        const { accepted } = await response.json();

        // Mark as synced
        await markAsSynced(db, accepted);

        console.log('[ServiceWorker] Sync completed:', accepted.length, 'items');

        // Show notification to user
        await self.registration.showNotification('Sync Complete', {
            body: `Synced ${accepted.length} items`,
            icon: '/icon.png',
            tag: 'sync-complete'
        });

    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
        throw error; // Re-throw to trigger retry
    }
}

// Helper functions
async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AppDatabase', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getUnsyncedItems(db) {
    return new Promise((resolve) => {
        const tx = db.transaction('items', 'readonly');
        const store = tx.objectStore('items');
        const index = store.index('dirty');
        const request = index.getAll(IDBKeyRange.only(true));

        request.onsuccess = () => resolve(request.result);
    });
}

async function markAsSynced(db, ids) {
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');

    for (const id of ids) {
        const item = await new Promise((resolve) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
        });

        if (item) {
            item.dirty = false;
            item.synced_at = Date.now();
            store.put(item);
        }
    }

    return new Promise((resolve) => {
        tx.oncomplete = resolve;
    });
}

async function getAuthToken() {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
        const tx = db.transaction('sync_metadata', 'readonly');
        const request = tx.objectStore('sync_metadata').get('auth_token');
        request.onsuccess = () => resolve(request.result?.value);
    });
}
```

### Periodic Background Sync

```javascript
// main.js - Register periodic sync
async function registerPeriodicSync() {
    if ('serviceWorker' in navigator && 'periodicSync' in (await navigator.serviceWorker.ready)) {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Check permission
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync'
            });

            if (status.state === 'granted') {
                await registration.periodicSync.register('sync-data-periodic', {
                    minInterval: 24 * 60 * 60 * 1000 // 24 hours (minimum)
                });
                console.log('Periodic background sync registered');
            } else {
                console.log('Periodic background sync permission denied');
            }
        } catch (error) {
            console.error('Periodic sync registration failed:', error);
        }
    }
}

// sw.js - Handle periodic sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-data-periodic') {
        event.waitUntil(performSync());
    }
});

// Check registered periodic syncs
async function listPeriodicSyncs() {
    const registration = await navigator.serviceWorker.ready;
    const tags = await registration.periodicSync.getTags();
    console.log('Registered periodic syncs:', tags);
}

// Unregister periodic sync
async function unregisterPeriodicSync(tag) {
    const registration = await navigator.serviceWorker.ready;
    await registration.periodicSync.unregister(tag);
}
```

## iOS (Swift)

### Background Fetch

```swift
import UIKit
import BackgroundTasks

class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication,
                    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Register background task
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.app.sync",
            using: nil
        ) { task in
            self.handleBackgroundSync(task: task as! BGAppRefreshTask)
        }

        return true
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        scheduleBackgroundSync()
    }

    func scheduleBackgroundSync() {
        let request = BGAppRefreshTaskRequest(identifier: "com.app.sync")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

        do {
            try BGTaskScheduler.shared.submit(request)
            print("Background sync scheduled")
        } catch {
            print("Failed to schedule background sync: \(error)")
        }
    }

    func handleBackgroundSync(task: BGAppRefreshTask) {
        // Schedule next sync
        scheduleBackgroundSync()

        // Set expiration handler
        task.expirationHandler = {
            print("Background sync expired")
            // Cancel ongoing operations
        }

        // Perform sync
        Task {
            do {
                try await performSync()
                task.setTaskCompleted(success: true)
            } catch {
                print("Background sync failed: \(error)")
                task.setTaskCompleted(success: false)
            }
        }
    }

    func performSync() async throws {
        // Sync logic here
        let syncManager = SyncManager.shared
        try await syncManager.sync()
    }
}

// Info.plist configuration:
// Add BGTaskSchedulerPermittedIdentifiers array with "com.app.sync"
```

### Silent Push Notifications

```swift
import UserNotifications

class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication,
                    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Register for remote notifications
        application.registerForRemoteNotifications()

        return true
    }

    func application(_ application: UIApplication,
                    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {

        // Handle silent push
        if userInfo["sync"] != nil {
            Task {
                do {
                    try await performSync()
                    completionHandler(.newData)
                } catch {
                    completionHandler(.failed)
                }
            }
        } else {
            completionHandler(.noData)
        }
    }
}

// Send silent push from server:
// {
//   "aps": {
//     "content-available": 1
//   },
//   "sync": true
// }
```

### URLSession Background Tasks

```swift
import Foundation

class BackgroundSyncManager: NSObject, URLSessionDownloadDelegate {

    static let shared = BackgroundSyncManager()

    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.background(withIdentifier: "com.app.sync.session")
        config.sessionSendsLaunchEvents = true
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    func syncInBackground() {
        guard let url = URL(string: "https://api.example.com/sync") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let task = session.downloadTask(with: request)
        task.resume()
    }

    // URLSessionDownloadDelegate
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                   didFinishDownloadingTo location: URL) {
        // Handle download completion
        print("Background download completed")
    }

    func urlSession(_ session: URLSession, task: URLSessionTask,
                   didCompleteWithError error: Error?) {
        if let error = error {
            print("Background task failed: \(error)")
        } else {
            print("Background task succeeded")
        }
    }
}
```

## Android (Kotlin)

### WorkManager

```kotlin
import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Perform sync
            val syncManager = SyncManager.getInstance(applicationContext)
            syncManager.sync()

            Result.success()
        } catch (e: Exception) {
            Log.e("SyncWorker", "Sync failed", e)

            // Retry with exponential backoff
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}

// Schedule periodic sync
class SyncScheduler(private val context: Context) {

    fun schedulePeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES,
            5, TimeUnit.MINUTES // Flex interval
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "sync-periodic",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }

    fun scheduleImmediateSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            "sync-immediate",
            ExistingWorkPolicy.REPLACE,
            syncRequest
        )
    }

    fun cancelSync() {
        WorkManager.getInstance(context).cancelUniqueWork("sync-periodic")
    }
}

// Initialize in Application class
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        val syncScheduler = SyncScheduler(this)
        syncScheduler.schedulePeriodicSync()
    }
}
```

### Foreground Service (for immediate sync)

```kotlin
import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class SyncForegroundService : Service() {

    override fun onCreate() {
        super.onCreate()

        // Create notification channel (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "sync_channel",
                "Sync Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, "sync_channel")
            .setContentTitle("Syncing Data")
            .setContentText("Synchronizing your data...")
            .setSmallIcon(R.drawable.ic_sync)
            .build()

        startForeground(1, notification)

        // Perform sync in coroutine
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val syncManager = SyncManager.getInstance(applicationContext)
                syncManager.sync()

                // Update notification
                updateNotification("Sync Complete", "Your data is up to date")

            } catch (e: Exception) {
                Log.e("SyncService", "Sync failed", e)
                updateNotification("Sync Failed", "Failed to sync data")
            } finally {
                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun updateNotification(title: String, text: String) {
        val notification = NotificationCompat.Builder(this, "sync_channel")
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_sync)
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(1, notification)
    }
}

// Start service
fun startSyncService(context: Context) {
    val intent = Intent(context, SyncForegroundService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
    } else {
        context.startService(intent)
    }
}
```

## React Native

### Background Fetch

```javascript
import BackgroundFetch from 'react-native-background-fetch';

// Configure background fetch
async function initBackgroundFetch() {
    const status = await BackgroundFetch.configure(
        {
            minimumFetchInterval: 15, // Minutes (iOS minimum is 15)
            stopOnTerminate: false,   // Android: continue after app termination
            startOnBoot: true,        // Android: start on device boot
            enableHeadless: true,     // Android: allow headless execution
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
            requiresCharging: false,
            requiresDeviceIdle: false,
            requiresBatteryNotLow: false,
            requiresStorageNotLow: false
        },
        async (taskId) => {
            console.log('[BackgroundFetch] Task:', taskId);

            try {
                await sync();
                BackgroundFetch.finish(taskId);
            } catch (error) {
                console.error('[BackgroundFetch] Sync failed:', error);
                BackgroundFetch.finish(taskId);
            }
        },
        (taskId) => {
            // Task timeout (iOS only)
            console.log('[BackgroundFetch] Timeout:', taskId);
            BackgroundFetch.finish(taskId);
        }
    );

    console.log('[BackgroundFetch] Status:', status);
}

// Schedule one-time background task
async function scheduleBackgroundTask() {
    await BackgroundFetch.scheduleTask({
        taskId: 'com.app.sync',
        delay: 5000,              // Milliseconds (minimum 5000)
        periodic: false,          // One-time task
        forceAlarmManager: false, // Android: use AlarmManager
        stopOnTerminate: false,
        enableHeadless: true
    });
}

// Headless task (Android only)
// index.js
import BackgroundFetch from 'react-native-background-fetch';

const BackgroundSyncTask = async (event) => {
    console.log('[Headless] Background sync:', event.taskId);

    try {
        await sync();
        BackgroundFetch.finish(event.taskId);
    } catch (error) {
        console.error('[Headless] Sync failed:', error);
        BackgroundFetch.finish(event.taskId);
    }
};

BackgroundFetch.registerHeadlessTask(BackgroundSyncTask);
```

### Network State Monitoring

```javascript
import NetInfo from '@react-native-community/netinfo';

// Monitor network state
const unsubscribe = NetInfo.addEventListener(state => {
    console.log('Connection type:', state.type);
    console.log('Is connected?', state.isConnected);
    console.log('Is internet reachable?', state.isInternetReachable);

    if (state.isConnected && state.isInternetReachable) {
        console.log('Network available, syncing...');
        sync();
    }
});

// Get current network state
NetInfo.fetch().then(state => {
    if (state.isConnected) {
        sync();
    }
});

// Cleanup
// unsubscribe();
```

## Electron (Desktop)

### Node.js Timers

```javascript
const { app } = require('electron');
const schedule = require('node-schedule');

let syncJob;

app.on('ready', () => {
    // Sync every 15 minutes
    syncJob = schedule.scheduleJob('*/15 * * * *', async () => {
        console.log('Scheduled sync running...');
        await sync();
    });

    // Sync on app start
    sync();
});

app.on('window-all-closed', () => {
    // Keep app running in background for sync
    // Don't quit on macOS
    if (process.platform !== 'darwin') {
        // Cancel sync job
        if (syncJob) {
            syncJob.cancel();
        }
        app.quit();
    }
});

// System events
const powerMonitor = require('electron').powerMonitor;

powerMonitor.on('resume', () => {
    console.log('System resumed, syncing...');
    sync();
});

powerMonitor.on('unlock-screen', () => {
    console.log('Screen unlocked, syncing...');
    sync();
});
```

### System Tray Background App

```javascript
const { app, Tray, Menu } = require('electron');
const path = require('path');

let tray;
let syncInterval;

app.on('ready', () => {
    // Create system tray icon
    tray = new Tray(path.join(__dirname, 'icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Sync Now',
            click: () => sync()
        },
        {
            label: 'Sync Status',
            click: () => showSyncStatus()
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Sync App');

    // Background sync every 15 minutes
    syncInterval = setInterval(async () => {
        await sync();
        tray.setToolTip(`Last synced: ${new Date().toLocaleTimeString()}`);
    }, 15 * 60 * 1000);

    // Initial sync
    sync();
});

app.on('before-quit', () => {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
});
```

## Flutter

### WorkManager (Android) + Background Fetch (iOS)

```dart
import 'package:workmanager/workmanager.dart';

// Callback function
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    print('Background sync running: $task');

    try {
      await performSync();
      return Future.value(true);
    } catch (e) {
      print('Sync failed: $e');
      return Future.value(false);
    }
  });
}

// Initialize WorkManager
void initBackgroundSync() {
  Workmanager().initialize(
    callbackDispatcher,
    isInDebugMode: true
  );

  // Register periodic task
  Workmanager().registerPeriodicTask(
    'sync-periodic',
    'syncTask',
    frequency: Duration(minutes: 15),
    constraints: Constraints(
      networkType: NetworkType.connected,
      requiresBatteryNotLow: true,
      requiresCharging: false,
      requiresDeviceIdle: false,
      requiresStorageNotLow: false,
    ),
  );
}

// Cancel background sync
void cancelBackgroundSync() {
  Workmanager().cancelByUniqueName('sync-periodic');
}

// Sync function
Future<void> performSync() async {
  final syncManager = SyncManager();
  await syncManager.sync();
}
```

## Best Practices

### 1. Battery Optimization

```javascript
// Check battery status before sync
async function shouldSync() {
    if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();

        if (battery.level < 0.2 && !battery.charging) {
            console.log('Low battery, skipping sync');
            return false;
        }
    }

    return true;
}

// Use exponential backoff
let syncDelay = 1000;
const maxDelay = 60000;

async function syncWithBackoff() {
    if (!await shouldSync()) {
        return;
    }

    try {
        await sync();
        syncDelay = 1000; // Reset delay on success
    } catch (error) {
        syncDelay = Math.min(syncDelay * 2, maxDelay);
        setTimeout(syncWithBackoff, syncDelay);
    }
}
```

### 2. Network Conditions

```javascript
// Check network type (Web)
if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') {
        // Good network, sync large data
        await fullSync();
    } else {
        // Slow network, sync only critical data
        await minimalSync();
    }
}

// Check metered connection
if (connection.saveData) {
    console.log('Data saver enabled, skipping non-essential sync');
}
```

### 3. User Preferences

```javascript
// Allow users to configure sync
const syncPreferences = {
    enabled: true,
    frequency: 15, // minutes
    onlyOnWifi: false,
    onlyWhenCharging: false,
    syncInBackground: true
};

async function shouldSyncBasedOnPreferences() {
    if (!syncPreferences.enabled) {
        return false;
    }

    if (syncPreferences.onlyOnWifi) {
        const connection = navigator.connection;
        if (connection && connection.type !== 'wifi') {
            return false;
        }
    }

    if (syncPreferences.onlyWhenCharging) {
        const battery = await navigator.getBattery();
        if (!battery.charging) {
            return false;
        }
    }

    return true;
}
```

### 4. Sync Indicators

```javascript
// Show sync status to users
const syncIndicator = {
    show(message) {
        // Show UI indicator
        document.getElementById('sync-status').textContent = message;
        document.getElementById('sync-status').classList.add('visible');
    },

    hide() {
        document.getElementById('sync-status').classList.remove('visible');
    },

    showProgress(current, total) {
        this.show(`Syncing ${current}/${total}...`);
    },

    showError(error) {
        this.show(`Sync failed: ${error.message}`);
        setTimeout(() => this.hide(), 5000);
    },

    showSuccess() {
        this.show('Sync complete');
        setTimeout(() => this.hide(), 2000);
    }
};

// Use in sync function
async function syncWithIndicators() {
    syncIndicator.show('Syncing...');

    try {
        const unsyncedItems = await getUnsyncedItems();

        for (let i = 0; i < unsyncedItems.length; i++) {
            await syncItem(unsyncedItems[i]);
            syncIndicator.showProgress(i + 1, unsyncedItems.length);
        }

        syncIndicator.showSuccess();
    } catch (error) {
        syncIndicator.showError(error);
    }
}
```

## Platform Comparison

| Platform | API | Min Interval | Battery Aware | Network Aware | Reliability |
|----------|-----|--------------|---------------|---------------|-------------|
| Web | Background Sync API | Event-based | Yes | Yes | High |
| Web | Periodic Sync | 24 hours | Yes | Yes | Medium |
| iOS | Background Fetch | 15 minutes | Yes | Yes | Medium |
| iOS | Silent Push | Real-time | Yes | Yes | High |
| Android | WorkManager | 15 minutes | Yes | Yes | High |
| React Native | Background Fetch | 15 minutes | Yes | Yes | High |
| Electron | Node.js Timers | Any | No | No | High |
| Flutter | WorkManager | 15 minutes | Yes | Yes | High |

## Resources

- [Background Sync API (Web)](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [WorkManager (Android)](https://developer.android.com/topic/libraries/architecture/workmanager)
- [Background Tasks (iOS)](https://developer.apple.com/documentation/backgroundtasks)
- [react-native-background-fetch](https://github.com/transistorsoft/react-native-background-fetch)
- [Flutter WorkManager](https://pub.dev/packages/workmanager)
