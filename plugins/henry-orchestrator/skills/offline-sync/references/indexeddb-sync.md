# IndexedDB Sync Implementation Guide

Comprehensive guide for implementing offline sync with IndexedDB for web applications and Progressive Web Apps (PWAs).

## Overview

IndexedDB is a low-level API for client-side storage in web browsers. It provides asynchronous, transactional database capabilities for storing structured data including files and blobs.

## Setup and Installation

IndexedDB is built into all modern browsers - no installation required.

### Browser Support

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+
- Opera 15+

### Wrapper Libraries (Optional)

```bash
# idb (Promise-based wrapper)
npm install idb

# Dexie.js (Simplified API)
npm install dexie

# localForage (Simple key-value API)
npm install localforage
```

## Database Initialization

### Vanilla IndexedDB

```javascript
let db;

function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AppDatabase', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store with sync metadata
            const itemsStore = db.createObjectStore('items', { keyPath: 'id' });
            itemsStore.createIndex('dirty', 'dirty', { unique: false });
            itemsStore.createIndex('updated_at', 'updated_at', { unique: false });
            itemsStore.createIndex('deleted_at', 'deleted_at', { unique: false });

            // Create sync log store
            const syncLogStore = db.createObjectStore('sync_log', {
                keyPath: 'id',
                autoIncrement: true
            });
            syncLogStore.createIndex('record_id', 'record_id', { unique: false });
            syncLogStore.createIndex('synced', 'synced', { unique: false });
            syncLogStore.createIndex('timestamp', 'timestamp', { unique: false });

            // Create metadata store
            const metadataStore = db.createObjectStore('sync_metadata', { keyPath: 'key' });
        };
    });
}
```

### Using idb (Recommended)

```javascript
import { openDB } from 'idb';

async function initDatabase() {
    const db = await openDB('AppDatabase', 1, {
        upgrade(db) {
            // Items store
            const itemsStore = db.createObjectStore('items', { keyPath: 'id' });
            itemsStore.createIndex('dirty', 'dirty');
            itemsStore.createIndex('updated_at', 'updated_at');
            itemsStore.createIndex('deleted_at', 'deleted_at');

            // Sync log store
            const syncLogStore = db.createObjectStore('sync_log', {
                keyPath: 'id',
                autoIncrement: true
            });
            syncLogStore.createIndex('record_id', 'record_id');
            syncLogStore.createIndex('synced', 'synced');
            syncLogStore.createIndex('timestamp', 'timestamp');

            // Metadata store
            db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
    });

    return db;
}
```

### Using Dexie.js

```javascript
import Dexie from 'dexie';

class AppDatabase extends Dexie {
    constructor() {
        super('AppDatabase');

        this.version(1).stores({
            items: 'id, dirty, updated_at, deleted_at',
            sync_log: '++id, record_id, synced, timestamp',
            sync_metadata: 'key'
        });

        // Define TypeScript types (optional)
        this.items = this.table('items');
        this.sync_log = this.table('sync_log');
        this.sync_metadata = this.table('sync_metadata');
    }
}

const db = new AppDatabase();
```

## CRUD Operations with Sync Tracking

### Create (Insert)

```javascript
// Using idb
async function createItem(title, description) {
    const db = await initDatabase();

    const id = generateUUID();
    const now = Date.now();

    const item = {
        id,
        title,
        description,
        status: 'pending',
        created_at: now,
        updated_at: now,
        deleted_at: null,
        synced_at: null,
        dirty: true,
        version: 1
    };

    await db.add('items', item);
    await logChange('items', id, 'INSERT', { title, description });

    return id;
}

async function logChange(tableName, recordId, operation, data) {
    const db = await initDatabase();

    await db.add('sync_log', {
        table_name: tableName,
        record_id: recordId,
        operation,
        timestamp: Date.now(),
        synced: false,
        data: JSON.stringify(data)
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

### Read

```javascript
// Get all items (excluding deleted)
async function getItems() {
    const db = await initDatabase();
    const items = await db.getAllFromIndex('items', 'deleted_at', IDBKeyRange.only(null));
    return items;
}

// Get unsynced items
async function getUnsyncedItems() {
    const db = await initDatabase();
    const items = await db.getAllFromIndex('items', 'dirty', IDBKeyRange.only(true));
    return items;
}

// Get item by ID
async function getItem(id) {
    const db = await initDatabase();
    return await db.get('items', id);
}
```

### Update

```javascript
async function updateItem(id, updates) {
    const db = await initDatabase();

    const item = await db.get('items', id);
    if (!item) throw new Error('Item not found');

    const updatedItem = {
        ...item,
        ...updates,
        updated_at: Date.now(),
        dirty: true,
        version: item.version + 1
    };

    await db.put('items', updatedItem);
    await logChange('items', id, 'UPDATE', updates);

    return updatedItem;
}
```

### Delete (Soft Delete)

```javascript
async function deleteItem(id) {
    const db = await initDatabase();

    const item = await db.get('items', id);
    if (!item) throw new Error('Item not found');

    const deletedItem = {
        ...item,
        deleted_at: Date.now(),
        updated_at: Date.now(),
        dirty: true
    };

    await db.put('items', deletedItem);
    await logChange('items', id, 'DELETE', null);

    return deletedItem;
}

// Hard delete (after confirmed sync)
async function hardDeleteItem(id) {
    const db = await initDatabase();

    await db.delete('items', id);

    // Delete sync log entries
    const syncLogs = await db.getAllFromIndex('sync_log', 'record_id', IDBKeyRange.only(id));
    for (const log of syncLogs) {
        await db.delete('sync_log', log.id);
    }
}
```

## Sync Protocol Implementation

### Pull Phase (Download Changes)

```javascript
async function pullChanges() {
    const lastSyncAt = await getLastSyncAt();

    // Fetch changes from server
    const response = await fetch(`/api/sync/pull?since=${lastSyncAt}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });

    const { items, timestamp } = await response.json();

    const db = await initDatabase();

    // Apply changes in transaction
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');

    for (const remoteItem of items) {
        await applyRemoteChange(store, remoteItem);
    }

    await tx.done;

    // Update last sync timestamp
    await updateLastSyncAt(timestamp);
}

async function applyRemoteChange(store, remoteItem) {
    const localItem = await store.get(remoteItem.id);

    if (!localItem) {
        // New item from server
        await store.add({
            ...remoteItem,
            synced_at: Date.now(),
            dirty: false
        });
    } else if (localItem.dirty) {
        // Conflict: both local and remote changed
        await resolveConflict(store, localItem, remoteItem);
    } else {
        // No conflict: update local with remote
        await store.put({
            ...remoteItem,
            synced_at: Date.now(),
            dirty: false
        });
    }
}
```

### Push Phase (Upload Changes)

```javascript
async function pushChanges() {
    const unsyncedItems = await getUnsyncedItems();

    if (unsyncedItems.length === 0) {
        return { success: true, synced: 0 };
    }

    // Send to server
    const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ items: unsyncedItems })
    });

    const { accepted, conflicts } = await response.json();

    const db = await initDatabase();
    const tx = db.transaction(['items', 'sync_log'], 'readwrite');

    // Mark accepted items as synced
    for (const id of accepted) {
        const item = await tx.objectStore('items').get(id);
        if (item) {
            item.dirty = false;
            item.synced_at = Date.now();
            await tx.objectStore('items').put(item);
        }

        // Mark sync log entries as synced
        const syncLogs = await tx.objectStore('sync_log').index('record_id').getAll(IDBKeyRange.only(id));
        for (const log of syncLogs) {
            log.synced = true;
            await tx.objectStore('sync_log').put(log);
        }
    }

    // Handle conflicts
    for (const conflict of conflicts) {
        await handleServerConflict(tx.objectStore('items'), conflict);
    }

    await tx.done;

    return { success: true, synced: accepted.length };
}
```

### Complete Sync Cycle

```javascript
async function sync() {
    try {
        console.log('Starting sync...');

        // Check network connectivity
        if (!navigator.onLine) {
            console.log('Offline, skipping sync');
            return { success: false, reason: 'offline' };
        }

        // 1. Pull remote changes
        await pullChanges();

        // 2. Push local changes
        const result = await pushChanges();

        console.log('Sync completed successfully');
        return result;
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, error: error.message };
    }
}
```

## Conflict Resolution Strategies

### Last-Write-Wins (LWW)

```javascript
async function resolveConflictLWW(store, localItem, remoteItem) {
    if (remoteItem.updated_at > localItem.updated_at) {
        // Remote is newer, accept remote
        await store.put({
            ...remoteItem,
            synced_at: Date.now(),
            dirty: false
        });
        console.log(`Conflict resolved: Accepted remote for ${localItem.id}`);
    } else {
        // Local is newer, keep local (will be pushed)
        console.log(`Conflict resolved: Keeping local for ${localItem.id}`);
    }
}
```

### Custom Merge Strategy

```javascript
async function resolveConflictMerge(store, localItem, remoteItem) {
    const merged = {
        id: localItem.id,
        title: remoteItem.updated_at > localItem.updated_at ? remoteItem.title : localItem.title,
        description: mergeText(localItem.description, remoteItem.description),
        status: localItem.status, // Prefer local status
        created_at: localItem.created_at,
        updated_at: Math.max(localItem.updated_at, remoteItem.updated_at),
        deleted_at: localItem.deleted_at || remoteItem.deleted_at,
        synced_at: Date.now(),
        dirty: true, // Mark as dirty to push merged version
        version: Math.max(localItem.version, remoteItem.version) + 1
    };

    await store.put(merged);
    console.log(`Conflict resolved: Merged changes for ${localItem.id}`);
}

function mergeText(local, remote) {
    if (!local) return remote;
    if (!remote) return local;
    if (local === remote) return local;
    return `${local}\n---\n${remote}`;
}
```

## Background Sync with Service Worker

### Register Service Worker

```javascript
// main.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

// Register background sync
async function registerBackgroundSync() {
    const registration = await navigator.serviceWorker.ready;

    if ('sync' in registration) {
        try {
            await registration.sync.register('sync-data');
            console.log('Background sync registered');
        } catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }
}

// Trigger background sync when items are modified
async function onDataChange() {
    await registerBackgroundSync();
}
```

### Service Worker Implementation

```javascript
// sw.js
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Open IndexedDB from service worker
        const db = await openDB('AppDatabase', 1);

        // Get unsynced items
        const unsyncedItems = await db.getAllFromIndex('items', 'dirty', IDBKeyRange.only(true));

        if (unsyncedItems.length === 0) {
            return;
        }

        // Push to server
        const response = await fetch('/api/sync/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getStoredAuthToken()}`
            },
            body: JSON.stringify({ items: unsyncedItems })
        });

        if (response.ok) {
            const { accepted } = await response.json();

            // Mark as synced
            const tx = db.transaction('items', 'readwrite');
            for (const id of accepted) {
                const item = await tx.objectStore('items').get(id);
                if (item) {
                    item.dirty = false;
                    item.synced_at = Date.now();
                    await tx.objectStore('items').put(item);
                }
            }
            await tx.done;

            console.log('Background sync completed');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
        throw error; // Re-throw to trigger retry
    }
}

async function getStoredAuthToken() {
    const db = await openDB('AppDatabase', 1);
    const metadata = await db.get('sync_metadata', 'auth_token');
    return metadata?.value;
}

// Helper: idb in service worker
async function openDB(name, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
```

### Periodic Background Sync

```javascript
// main.js
async function registerPeriodicBackgroundSync() {
    const registration = await navigator.serviceWorker.ready;

    if ('periodicSync' in registration) {
        try {
            await registration.periodicSync.register('sync-data-periodic', {
                minInterval: 15 * 60 * 1000 // 15 minutes
            });
            console.log('Periodic background sync registered');
        } catch (error) {
            console.error('Periodic background sync registration failed:', error);
        }
    }
}

// sw.js
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-data-periodic') {
        event.waitUntil(syncData());
    }
});
```

## Network Detection and Auto-Sync

```javascript
// Monitor online/offline status
window.addEventListener('online', async () => {
    console.log('Back online, syncing...');
    await sync();
});

window.addEventListener('offline', () => {
    console.log('Offline - changes will be queued');
});

// Check connectivity before operations
async function withOnlineCheck(operation) {
    if (navigator.onLine) {
        return await operation();
    } else {
        console.log('Offline - operation queued');
        await registerBackgroundSync();
        return null;
    }
}
```

## Sync Metadata Management

```javascript
async function getLastSyncAt() {
    const db = await initDatabase();
    const metadata = await db.get('sync_metadata', 'last_sync_at');
    return metadata?.value || 0;
}

async function updateLastSyncAt(timestamp) {
    const db = await initDatabase();
    await db.put('sync_metadata', {
        key: 'last_sync_at',
        value: timestamp
    });
}

async function getDeviceId() {
    const db = await initDatabase();
    let metadata = await db.get('sync_metadata', 'device_id');

    if (!metadata) {
        const deviceId = generateUUID();
        await db.put('sync_metadata', {
            key: 'device_id',
            value: deviceId
        });
        return deviceId;
    }

    return metadata.value;
}
```

## Storage Quota Management

```javascript
// Check storage quota
async function checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage;
        const quota = estimate.quota;
        const percentUsed = (usage / quota) * 100;

        console.log(`Storage: ${usage} / ${quota} bytes (${percentUsed.toFixed(2)}% used)`);

        return { usage, quota, percentUsed };
    }
}

// Request persistent storage
async function requestPersistentStorage() {
    if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persistent storage: ${isPersisted}`);
        return isPersisted;
    }
    return false;
}

// Clean up old data when approaching quota
async function cleanupOldData() {
    const { percentUsed } = await checkStorageQuota();

    if (percentUsed > 80) {
        console.log('Storage quota high, cleaning up...');

        const db = await initDatabase();

        // Delete old synced items
        const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago

        const tx = db.transaction('items', 'readwrite');
        const store = tx.objectStore('items');
        const index = store.index('synced_at');

        let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffDate));

        while (cursor) {
            if (!cursor.value.dirty && cursor.value.deleted_at) {
                await cursor.delete();
            }
            cursor = await cursor.continue();
        }

        await tx.done;

        console.log('Cleanup completed');
    }
}
```

## Error Handling and Retry Logic

```javascript
class SyncManager {
    constructor() {
        this.retryDelay = 1000;
        this.maxRetryDelay = 60000;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.isSyncing = false;
    }

    async syncWithRetry() {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        this.isSyncing = true;

        try {
            const result = await sync();
            this.resetRetry();
            return result;
        } catch (error) {
            console.error('Sync error:', error);

            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);

                console.log(`Retrying in ${this.retryDelay}ms (attempt ${this.retryCount})`);

                setTimeout(() => {
                    this.isSyncing = false;
                    this.syncWithRetry();
                }, this.retryDelay);
            } else {
                console.error('Max retries reached');
                this.resetRetry();
                this.isSyncing = false;
            }
        }
    }

    resetRetry() {
        this.retryCount = 0;
        this.retryDelay = 1000;
        this.isSyncing = false;
    }
}

const syncManager = new SyncManager();
```

## Performance Optimization

### Batch Reads with Cursors

```javascript
async function getAllItemsBatched(batchSize = 100) {
    const db = await initDatabase();
    const items = [];

    const tx = db.transaction('items', 'readonly');
    const store = tx.objectStore('items');

    let cursor = await store.openCursor();

    while (cursor) {
        items.push(cursor.value);

        if (items.length % batchSize === 0) {
            // Process batch
            await processBatch(items.slice(-batchSize));
        }

        cursor = await cursor.continue();
    }

    // Process remaining items
    if (items.length % batchSize !== 0) {
        await processBatch(items.slice(-(items.length % batchSize)));
    }

    await tx.done;

    return items;
}
```

### Lazy Loading with Pagination

```javascript
async function getItemsPaginated(page = 0, pageSize = 20) {
    const db = await initDatabase();

    const tx = db.transaction('items', 'readonly');
    const store = tx.objectStore('items');
    const index = store.index('updated_at');

    const items = [];
    let skipped = 0;
    const skipCount = page * pageSize;

    let cursor = await index.openCursor(null, 'prev'); // Descending order

    while (cursor && items.length < pageSize) {
        if (skipped >= skipCount) {
            if (!cursor.value.deleted_at) {
                items.push(cursor.value);
            }
        } else {
            skipped++;
        }

        cursor = await cursor.continue();
    }

    await tx.done;

    return items;
}
```

## Dexie.js Shortcuts

```javascript
import Dexie from 'dexie';

const db = new Dexie('AppDatabase');

db.version(1).stores({
    items: 'id, dirty, updated_at, deleted_at'
});

// CRUD operations are simpler with Dexie
async function createItem(title, description) {
    const id = generateUUID();
    await db.items.add({
        id,
        title,
        description,
        created_at: Date.now(),
        updated_at: Date.now(),
        dirty: true,
        version: 1
    });
    return id;
}

// Query unsynced items
const unsyncedItems = await db.items.where('dirty').equals(true).toArray();

// Update with changes
await db.items.update(id, { title: 'New Title', updated_at: Date.now(), dirty: true });

// Delete (soft)
await db.items.update(id, { deleted_at: Date.now(), dirty: true });

// Transactions
await db.transaction('rw', db.items, async () => {
    await db.items.add({ ... });
    await db.items.update(id, { ... });
});
```

## Best Practices

1. **Use idb or Dexie**: Wrapper libraries simplify IndexedDB usage
2. **Implement Service Workers**: Enable background sync for PWAs
3. **Monitor Storage Quota**: Check and manage storage limits
4. **Request Persistent Storage**: Prevent data eviction
5. **Use Indexes**: Create indexes on dirty, updated_at, deleted_at
6. **Batch Operations**: Group reads/writes in transactions
7. **Handle Offline**: Monitor network status, queue operations
8. **Cleanup Old Data**: Remove old synced items to save space
9. **Show Sync Status**: Indicate sync progress to users
10. **Test Offline**: Use DevTools to simulate offline scenarios

## Resources

- [IndexedDB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb Library](https://github.com/jakearchibald/idb)
- [Dexie.js](https://dexie.org/)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API)
