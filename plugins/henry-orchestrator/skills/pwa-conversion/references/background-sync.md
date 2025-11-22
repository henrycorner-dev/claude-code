# Background Sync for PWAs

This reference provides comprehensive guidance on implementing Background Sync API in Progressive Web Apps.

## Overview

Background Sync enables deferred actions that reliably execute even when the user closes the page or loses network connectivity. It ensures critical operations (like form submissions, messaging, uploads) complete successfully.

## How Background Sync Works

```
[User Action] → [Register Sync] → [Service Worker] → [Sync Event]
                                          ↓
                      [Execute Action When Online]
```

The browser fires the sync event when:
- Network connectivity is restored
- Immediately if already online
- User reopens the app (for periodic sync)

## Basic Background Sync Implementation

### Step 1: Register a Sync Event

```javascript
// In your application code (client-side)
async function registerBackgroundSync(tag) {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if Background Sync is supported
    if ('sync' in registration) {
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } else {
      console.warn('Background Sync not supported');
      return false;
    }
  } catch (error) {
    console.error('Failed to register background sync:', error);
    return false;
  }
}

// Example: Register sync when form is submitted
async function handleFormSubmit(formData) {
  // Save data to IndexedDB for sync later
  await saveToIndexedDB('pending-submissions', formData);

  // Register sync
  const syncRegistered = await registerBackgroundSync('sync-form-submission');

  if (!syncRegistered) {
    // Fallback: try to submit immediately
    await submitFormData(formData);
  }
}
```

### Step 2: Handle Sync Event in Service Worker

```javascript
// In your service worker (sw.js or public/sw.js)

self.addEventListener('sync', (event) => {
  console.log('Sync event fired:', event.tag);

  if (event.tag === 'sync-form-submission') {
    event.waitUntil(syncFormSubmissions());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-uploads') {
    event.waitUntil(syncUploads());
  }
});

async function syncFormSubmissions() {
  try {
    // Get pending submissions from IndexedDB
    const db = await openDatabase();
    const submissions = await getAllFromStore(db, 'pending-submissions');

    if (submissions.length === 0) {
      return;
    }

    // Submit each pending form
    for (const submission of submissions) {
      try {
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          // Remove from IndexedDB on success
          await deleteFromStore(db, 'pending-submissions', submission.id);
          console.log('Submission synced successfully:', submission.id);
        } else {
          // Keep for retry if server error
          console.error('Submission failed:', response.status);
        }
      } catch (error) {
        console.error('Error syncing submission:', error);
        // Will retry on next sync event
      }
    }

    // Notify user of sync completion
    if ('Notification' in self && Notification.permission === 'granted') {
      self.registration.showNotification('Sync Complete', {
        body: 'Your data has been synchronized',
        icon: '/icon-192x192.png'
      });
    }
  } catch (error) {
    // Sync failed, will retry
    console.error('Sync failed:', error);
    throw error; // Throwing error tells browser to retry
  }
}
```

## IndexedDB Helper Functions

```javascript
// Utility functions for IndexedDB operations

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDatabase', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains('pending-submissions')) {
        db.createObjectStore('pending-submissions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending-messages')) {
        db.createObjectStore('pending-messages', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending-uploads')) {
        db.createObjectStore('pending-uploads', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function saveToIndexedDB(storeName, data) {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.add({
      data,
      timestamp: Date.now()
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

## Common Use Cases

### 1. Form Submission Sync

```javascript
// Client-side: Save form and register sync
async function submitForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    // Try immediate submission
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showMessage('Form submitted successfully');
    }
  } catch (error) {
    // Network error, save for sync
    await saveToIndexedDB('pending-submissions', data);
    await registerBackgroundSync('sync-form-submission');
    showMessage('Form will be submitted when online');
  }
}
```

### 2. Message Queue Sync

```javascript
// Client-side: Queue message
async function sendMessage(message) {
  const messageData = {
    text: message,
    userId: currentUser.id,
    timestamp: Date.now()
  };

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    if (response.ok) {
      return true;
    }
  } catch (error) {
    await saveToIndexedDB('pending-messages', messageData);
    await registerBackgroundSync('sync-messages');
    return false;
  }
}

// Service worker: Sync messages
async function syncMessages() {
  const db = await openDatabase();
  const messages = await getAllFromStore(db, 'pending-messages');

  for (const message of messages) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.data)
      });

      if (response.ok) {
        await deleteFromStore(db, 'pending-messages', message.id);
      }
    } catch (error) {
      console.error('Failed to sync message:', error);
    }
  }
}
```

### 3. File Upload Sync

```javascript
// Client-side: Queue file upload
async function uploadFile(file) {
  // Convert file to base64 for IndexedDB storage
  const base64 = await fileToBase64(file);

  const uploadData = {
    filename: file.name,
    type: file.type,
    size: file.size,
    data: base64
  };

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      return true;
    }
  } catch (error) {
    await saveToIndexedDB('pending-uploads', uploadData);
    await registerBackgroundSync('sync-uploads');
    return false;
  }
}

// Service worker: Sync uploads
async function syncUploads() {
  const db = await openDatabase();
  const uploads = await getAllFromStore(db, 'pending-uploads');

  for (const upload of uploads) {
    try {
      // Convert base64 back to blob
      const blob = base64ToBlob(upload.data.data, upload.data.type);

      const formData = new FormData();
      formData.append('file', blob, upload.data.filename);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await deleteFromStore(db, 'pending-uploads', upload.id);
      }
    } catch (error) {
      console.error('Failed to sync upload:', error);
    }
  }
}

// Helper functions
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToBlob(base64, type) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type });
}
```

## Periodic Background Sync

For recurring sync operations (requires user engagement):

```javascript
// Client-side: Register periodic sync
async function registerPeriodicSync() {
  try {
    const registration = await navigator.serviceWorker.ready;

    if ('periodicSync' in registration) {
      // Request permission (requires user engagement)
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync'
      });

      if (status.state === 'granted') {
        await registration.periodicSync.register('sync-content', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log('Periodic sync registered');
      }
    }
  } catch (error) {
    console.error('Failed to register periodic sync:', error);
  }
}

// Service worker: Handle periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Fetch latest content
    const response = await fetch('/api/content/latest');
    const data = await response.json();

    // Cache updated content
    const cache = await caches.open('content-cache');
    await cache.put('/api/content/latest', new Response(JSON.stringify(data)));

    console.log('Content synced successfully');
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}
```

## React Component Example

```typescript
// components/SyncStatus.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SyncStatus() {
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending syncs
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function checkPendingSync() {
    const db = await openDatabase();
    const stores = ['pending-submissions', 'pending-messages', 'pending-uploads'];

    let hasPending = false;
    for (const store of stores) {
      const items = await getAllFromStore(db, store);
      if (items.length > 0) {
        hasPending = true;
        break;
      }
    }

    setHasPendingSync(hasPending);
  }

  if (!hasPendingSync) {
    return null;
  }

  return (
    <div className="sync-status">
      {isOnline ? (
        <span>🔄 Syncing pending changes...</span>
      ) : (
        <span>📴 Changes will sync when online</span>
      )}
    </div>
  );
}
```

## Best Practices

1. **Graceful Degradation**: Always attempt immediate execution first, use background sync as fallback.

2. **Store Efficiently**: Use IndexedDB for queued operations, not localStorage (size limits).

3. **Idempotency**: Ensure sync operations can be safely retried without side effects.

4. **User Feedback**: Inform users when operations are queued for sync.

5. **Cleanup**: Remove successfully synced items from IndexedDB to prevent unbounded growth.

6. **Error Handling**: Throw errors in sync handler to trigger browser retry mechanism.

7. **Timeout**: Implement reasonable timeout for sync operations (browser will kill long-running syncs).

8. **Conflict Resolution**: Handle cases where data changed server-side before sync completes.

9. **Batch Operations**: Group multiple pending items into single API call when possible.

10. **Monitor Queue**: Provide UI to show pending sync status and manual retry option.

## Browser Support Detection

```javascript
function checkBackgroundSyncSupport() {
  return new Promise(async (resolve) => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      resolve('sync' in registration);
    } else {
      resolve(false);
    }
  });
}

// Usage
const supported = await checkBackgroundSyncSupport();
if (!supported) {
  console.warn('Background Sync not supported, using immediate sync only');
}
```

## Debugging

### Chrome DevTools

1. Open DevTools → Application → Service Workers
2. Check "Background Sync" section
3. View registered sync tags
4. Manually trigger sync events for testing

### Testing Offline Behavior

```javascript
// Simulate offline mode in DevTools
// Or programmatically test sync registration

async function testBackgroundSync() {
  const tag = 'test-sync';

  // Register sync
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register(tag);

  // Check if registered
  const tags = await registration.sync.getTags();
  console.log('Registered sync tags:', tags);
}
```

## Limitations

1. **Network Required**: Sync only fires when device has network connectivity.

2. **Browser Control**: Browser decides when to fire sync (with some heuristics).

3. **No Guaranteed Timing**: Cannot specify exact sync time, only request sync.

4. **User Engagement**: Periodic sync requires user engagement (site visit).

5. **Storage Limits**: IndexedDB has quota limits (varies by browser).

6. **Retry Limits**: Browser limits retry attempts for failed syncs.

## Alternative: Retry with Exponential Backoff

If Background Sync is not supported, implement manual retry:

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
try {
  await retryWithBackoff(() => fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  }));
} catch (error) {
  console.error('All retries failed:', error);
}
```

## Additional Resources

- [Background Sync API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [Periodic Background Sync (Web.dev)](https://web.dev/periodic-background-sync/)
- [IndexedDB API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker Cookbook](https://serviceworke.rs/)
