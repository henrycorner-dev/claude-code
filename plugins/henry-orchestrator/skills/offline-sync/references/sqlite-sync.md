# SQLite Manual Sync Implementation Guide

Comprehensive guide for implementing offline sync with SQLite, including manual sync protocol, conflict resolution, and cross-platform patterns.

## Overview

SQLite is a lightweight, embedded SQL database that requires manual implementation of sync logic but provides full control over the sync protocol and conflict resolution strategy.

## Setup and Installation

### iOS (Swift)

```swift
// SQLite comes built-in with iOS
import SQLite3

// Or use wrapper library
// CocoaPods: pod 'SQLite.swift'
import SQLite
```

### Android (Kotlin)

```kotlin
// SQLite comes built-in with Android
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

// Or use Room (recommended)
dependencies {
    implementation "androidx.room:room-runtime:2.5.0"
    kapt "androidx.room:room-compiler:2.5.0"
    implementation "androidx.room:room-ktx:2.5.0"
}
```

### React Native

```bash
npm install react-native-sqlite-storage
# or
npm install expo-sqlite
```

### Electron

```bash
npm install better-sqlite3
# or
npm install sqlite3
```

### Python

```bash
pip install sqlite3  # Built-in
# or
pip install sqlalchemy
```

## Schema Design for Sync

### Core Sync Metadata

Add sync metadata to every synced table:

```sql
CREATE TABLE items (
    -- Primary key (use UUID for distributed IDs)
    id TEXT PRIMARY KEY,

    -- Business data
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',

    -- Sync metadata
    created_at INTEGER NOT NULL,     -- Unix timestamp
    updated_at INTEGER NOT NULL,     -- Unix timestamp
    deleted_at INTEGER,               -- Soft delete timestamp
    synced_at INTEGER,                -- Last successful sync
    dirty BOOLEAN DEFAULT 1,          -- Has unsynced changes
    version INTEGER DEFAULT 1         -- Version counter for conflicts
);

-- Index for sync queries
CREATE INDEX idx_items_dirty ON items(dirty);
CREATE INDEX idx_items_updated_at ON items(updated_at);
CREATE INDEX idx_items_deleted_at ON items(deleted_at);
```

### Sync Log Table

Track all changes for delta sync:

```sql
CREATE TABLE sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
    timestamp INTEGER NOT NULL,
    synced BOOLEAN DEFAULT 0,
    data TEXT,  -- JSON snapshot of changed data
    FOREIGN KEY (record_id) REFERENCES items(id)
);

CREATE INDEX idx_sync_log_synced ON sync_log(synced);
CREATE INDEX idx_sync_log_timestamp ON sync_log(timestamp);
```

### Sync Metadata Table

Store sync state:

```sql
CREATE TABLE sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Store last sync timestamp
INSERT INTO sync_metadata (key, value) VALUES ('last_sync_at', '0');
INSERT INTO sync_metadata (key, value) VALUES ('device_id', 'unique-device-id');
```

## CRUD Operations with Sync Tracking

### Create (Insert)

```javascript
// JavaScript/Node.js with better-sqlite3
const db = require('better-sqlite3')('app.db');

function createItem(title, description) {
    const id = generateUUID();
    const now = Date.now();

    const stmt = db.prepare(`
        INSERT INTO items (id, title, description, created_at, updated_at, dirty, version)
        VALUES (?, ?, ?, ?, ?, 1, 1)
    `);

    stmt.run(id, title, description, now, now);

    // Log change
    logChange('items', id, 'INSERT', { title, description });

    return id;
}

function logChange(tableName, recordId, operation, data) {
    const stmt = db.prepare(`
        INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
        VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(tableName, recordId, operation, Date.now(), JSON.stringify(data));
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
function getItems() {
    const stmt = db.prepare('SELECT * FROM items WHERE deleted_at IS NULL');
    return stmt.all();
}

function getUnsyncedItems() {
    const stmt = db.prepare('SELECT * FROM items WHERE dirty = 1');
    return stmt.all();
}
```

### Update

```javascript
function updateItem(id, updates) {
    const now = Date.now();

    // Get current version
    const current = db.prepare('SELECT version FROM items WHERE id = ?').get(id);

    const stmt = db.prepare(`
        UPDATE items
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            updated_at = ?,
            dirty = 1,
            version = version + 1
        WHERE id = ?
    `);

    stmt.run(updates.title, updates.description, now, id);

    // Log change
    logChange('items', id, 'UPDATE', updates);
}
```

### Delete (Soft Delete)

```javascript
function deleteItem(id) {
    const now = Date.now();

    const stmt = db.prepare(`
        UPDATE items
        SET deleted_at = ?,
            updated_at = ?,
            dirty = 1
        WHERE id = ?
    `);

    stmt.run(now, now, id);

    // Log change
    logChange('items', id, 'DELETE', null);
}

// Hard delete (only after confirmed sync)
function hardDeleteItem(id) {
    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    db.prepare('DELETE FROM sync_log WHERE record_id = ?').run(id);
}
```

## Sync Protocol Implementation

### Pull Phase (Download Changes)

```javascript
async function pullChanges() {
    const lastSyncAt = getLastSyncAt();

    // Fetch changes from server since last sync
    const response = await fetch(`/api/sync/pull?since=${lastSyncAt}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const { items, timestamp } = await response.json();

    // Apply changes with conflict resolution
    db.transaction(() => {
        for (const remoteItem of items) {
            applyRemoteChange(remoteItem);
        }
    })();

    // Update last sync timestamp
    updateLastSyncAt(timestamp);
}

function applyRemoteChange(remoteItem) {
    const localItem = db.prepare('SELECT * FROM items WHERE id = ?').get(remoteItem.id);

    if (!localItem) {
        // New item from server
        insertRemoteItem(remoteItem);
    } else if (localItem.dirty) {
        // Conflict: both local and remote changed
        resolveConflict(localItem, remoteItem);
    } else {
        // No conflict: update local with remote
        updateFromRemote(remoteItem);
    }
}

function insertRemoteItem(remoteItem) {
    const stmt = db.prepare(`
        INSERT INTO items (id, title, description, created_at, updated_at, deleted_at, synced_at, dirty, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    stmt.run(
        remoteItem.id,
        remoteItem.title,
        remoteItem.description,
        remoteItem.created_at,
        remoteItem.updated_at,
        remoteItem.deleted_at,
        Date.now(),
        remoteItem.version
    );
}

function updateFromRemote(remoteItem) {
    const stmt = db.prepare(`
        UPDATE items
        SET title = ?,
            description = ?,
            updated_at = ?,
            deleted_at = ?,
            synced_at = ?,
            version = ?
        WHERE id = ?
    `);

    stmt.run(
        remoteItem.title,
        remoteItem.description,
        remoteItem.updated_at,
        remoteItem.deleted_at,
        Date.now(),
        remoteItem.version,
        remoteItem.id
    );
}
```

### Push Phase (Upload Changes)

```javascript
async function pushChanges() {
    const unsyncedItems = getUnsyncedItems();

    if (unsyncedItems.length === 0) {
        return;
    }

    // Send to server
    const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: unsyncedItems })
    });

    const { accepted, conflicts } = await response.json();

    // Mark accepted items as synced
    db.transaction(() => {
        for (const id of accepted) {
            markAsSynced(id);
        }

        // Handle conflicts returned by server
        for (const conflict of conflicts) {
            handleServerConflict(conflict);
        }
    })();
}

function markAsSynced(id) {
    const stmt = db.prepare(`
        UPDATE items
        SET dirty = 0,
            synced_at = ?
        WHERE id = ?
    `);

    stmt.run(Date.now(), id);

    // Mark sync log entries as synced
    db.prepare(`
        UPDATE sync_log
        SET synced = 1
        WHERE record_id = ? AND synced = 0
    `).run(id);
}
```

### Complete Sync Cycle

```javascript
async function sync() {
    try {
        console.log('Starting sync...');

        // 1. Pull remote changes
        await pullChanges();

        // 2. Push local changes
        await pushChanges();

        console.log('Sync completed successfully');
        return { success: true };
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, error };
    }
}
```

## Conflict Resolution Strategies

### Last-Write-Wins (LWW)

```javascript
function resolveConflictLWW(localItem, remoteItem) {
    if (remoteItem.updated_at > localItem.updated_at) {
        // Remote is newer, accept remote
        updateFromRemote(remoteItem);
        console.log(`Conflict resolved: Accepted remote for ${localItem.id}`);
    } else {
        // Local is newer, keep local (will be pushed)
        console.log(`Conflict resolved: Keeping local for ${localItem.id}`);
    }
}
```

### Version Vector

```javascript
function resolveConflictVersionVector(localItem, remoteItem) {
    if (remoteItem.version > localItem.version) {
        // Remote has higher version
        updateFromRemote(remoteItem);
    } else if (localItem.version > remoteItem.version) {
        // Local has higher version (will be pushed)
        return;
    } else {
        // Same version but different content - use timestamp
        resolveConflictLWW(localItem, remoteItem);
    }
}
```

### Custom Merge Strategy

```javascript
function resolveConflictMerge(localItem, remoteItem) {
    // Merge both changes
    const merged = {
        id: localItem.id,
        title: remoteItem.updated_at > localItem.updated_at ? remoteItem.title : localItem.title,
        description: mergeText(localItem.description, remoteItem.description),
        updated_at: Math.max(localItem.updated_at, remoteItem.updated_at),
        version: Math.max(localItem.version, remoteItem.version) + 1
    };

    const stmt = db.prepare(`
        UPDATE items
        SET title = ?,
            description = ?,
            updated_at = ?,
            version = ?,
            dirty = 1
        WHERE id = ?
    `);

    stmt.run(merged.title, merged.description, merged.updated_at, merged.version, merged.id);

    console.log(`Conflict resolved: Merged changes for ${localItem.id}`);
}

function mergeText(local, remote) {
    // Simple merge: concatenate if different
    if (local === remote) return local;
    return `${local}\n---\n${remote}`;
}
```

### User Resolution

```javascript
function resolveConflictUserChoice(localItem, remoteItem) {
    // Store conflict for user to resolve
    const stmt = db.prepare(`
        INSERT INTO conflicts (local_id, local_data, remote_data, created_at)
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(
        localItem.id,
        JSON.stringify(localItem),
        JSON.stringify(remoteItem),
        Date.now()
    );

    console.log(`Conflict flagged for user resolution: ${localItem.id}`);
}

// Later, user resolves
function applyUserResolution(conflictId, chosenVersion) {
    // 'local', 'remote', or merged data
    const conflict = db.prepare('SELECT * FROM conflicts WHERE id = ?').get(conflictId);

    if (chosenVersion === 'local') {
        // Keep local, mark for push
        db.prepare('UPDATE items SET dirty = 1 WHERE id = ?').run(conflict.local_id);
    } else if (chosenVersion === 'remote') {
        // Accept remote
        const remoteData = JSON.parse(conflict.remote_data);
        updateFromRemote(remoteData);
    }

    // Remove conflict
    db.prepare('DELETE FROM conflicts WHERE id = ?').run(conflictId);
}
```

## Delta Sync with Sync Log

### Generate Delta from Sync Log

```javascript
function getDeltaSinceLastSync() {
    const stmt = db.prepare(`
        SELECT * FROM sync_log
        WHERE synced = 0
        ORDER BY timestamp ASC
    `);

    return stmt.all();
}

function applyDelta(delta) {
    db.transaction(() => {
        for (const change of delta) {
            if (change.operation === 'INSERT') {
                const data = JSON.parse(change.data);
                insertRemoteItem({ id: change.record_id, ...data });
            } else if (change.operation === 'UPDATE') {
                const data = JSON.parse(change.data);
                updateFromRemote({ id: change.record_id, ...data });
            } else if (change.operation === 'DELETE') {
                deleteItem(change.record_id);
            }
        }
    })();
}
```

## Background Sync

### JavaScript/Node.js (Electron)

```javascript
const schedule = require('node-schedule');

// Sync every 5 minutes
const job = schedule.scheduleJob('*/5 * * * *', async () => {
    await sync();
});

// Sync on network reconnection
window.addEventListener('online', () => {
    console.log('Network reconnected, syncing...');
    sync();
});
```

### React Native

```javascript
import NetInfo from '@react-native-community/netinfo';
import BackgroundFetch from 'react-native-background-fetch';

// Monitor network changes
NetInfo.addEventListener(state => {
    if (state.isConnected) {
        sync();
    }
});

// Background fetch (iOS/Android)
BackgroundFetch.configure(
    {
        minimumFetchInterval: 15, // Minutes
        stopOnTerminate: false,
        startOnBoot: true
    },
    async (taskId) => {
        console.log('[BackgroundFetch] Task:', taskId);
        await sync();
        BackgroundFetch.finish(taskId);
    },
    (error) => {
        console.error('[BackgroundFetch] Error:', error);
    }
);
```

### Android (Kotlin with WorkManager)

```kotlin
import androidx.work.*
import java.util.concurrent.TimeUnit

class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            syncDatabase()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// Schedule periodic sync
val syncWorkRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES
).setConstraints(
    Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()
).build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "sync",
    ExistingPeriodicWorkPolicy.KEEP,
    syncWorkRequest
)
```

### iOS (Swift with Background Fetch)

```swift
import BackgroundTasks

// Register background task
BGTaskScheduler.shared.register(
    forTaskWithIdentifier: "com.app.sync",
    using: nil
) { task in
    self.handleSyncTask(task: task as! BGAppRefreshTask)
}

func handleSyncTask(task: BGAppRefreshTask) {
    scheduleNextSync()

    let queue = OperationQueue()
    queue.maxConcurrentOperationCount = 1

    let syncOperation = SyncOperation()

    task.expirationHandler = {
        queue.cancelAllOperations()
    }

    syncOperation.completionBlock = {
        task.setTaskCompleted(success: !syncOperation.isCancelled)
    }

    queue.addOperation(syncOperation)
}

func scheduleNextSync() {
    let request = BGAppRefreshTaskRequest(identifier: "com.app.sync")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

    try? BGTaskScheduler.shared.submit(request)
}
```

## Error Handling and Retry Logic

### Exponential Backoff

```javascript
class SyncManager {
    constructor() {
        this.retryDelay = 1000; // Start with 1 second
        this.maxRetryDelay = 60000; // Max 1 minute
        this.retryCount = 0;
        this.maxRetries = 5;
    }

    async syncWithRetry() {
        try {
            await sync();
            this.resetRetry();
        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);

                console.log(`Sync failed, retrying in ${this.retryDelay}ms (attempt ${this.retryCount})`);

                setTimeout(() => this.syncWithRetry(), this.retryDelay);
            } else {
                console.error('Max retries reached, giving up');
                this.resetRetry();
            }
        }
    }

    resetRetry() {
        this.retryCount = 0;
        this.retryDelay = 1000;
    }
}
```

### Partial Sync Success

```javascript
async function pushChangesWithPartialSuccess() {
    const unsyncedItems = getUnsyncedItems();
    const successfulIds = [];
    const failedItems = [];

    for (const item of unsyncedItems) {
        try {
            await pushSingleItem(item);
            successfulIds.push(item.id);
        } catch (error) {
            console.error(`Failed to sync item ${item.id}:`, error);
            failedItems.push({ item, error });
        }
    }

    // Mark successful items as synced
    db.transaction(() => {
        for (const id of successfulIds) {
            markAsSynced(id);
        }
    })();

    return { successfulIds, failedItems };
}
```

## Performance Optimization

### Batch Operations

```javascript
function batchInsert(items) {
    const stmt = db.prepare(`
        INSERT INTO items (id, title, description, created_at, updated_at, dirty)
        VALUES (?, ?, ?, ?, ?, 1)
    `);

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            stmt.run(item.id, item.title, item.description, item.created_at, item.updated_at);
        }
    });

    insertMany(items);
}
```

### Pagination for Large Syncs

```javascript
async function pullChangesWithPagination() {
    const lastSyncAt = getLastSyncAt();
    let page = 0;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(
            `/api/sync/pull?since=${lastSyncAt}&page=${page}&limit=${pageSize}`
        );

        const { items, hasMore: more, timestamp } = await response.json();

        db.transaction(() => {
            for (const item of items) {
                applyRemoteChange(item);
            }
        })();

        hasMore = more;
        page++;

        updateLastSyncAt(timestamp);
    }
}
```

### Indexes for Performance

```sql
-- Index sync queries
CREATE INDEX idx_items_dirty ON items(dirty) WHERE dirty = 1;
CREATE INDEX idx_items_updated_at ON items(updated_at DESC);
CREATE INDEX idx_sync_log_unsynced ON sync_log(synced, timestamp) WHERE synced = 0;

-- Partial indexes for deleted items
CREATE INDEX idx_items_active ON items(updated_at) WHERE deleted_at IS NULL;
```

## Testing Strategies

### Unit Tests

```javascript
// Jest/Mocha
const Database = require('better-sqlite3');

describe('Sync operations', () => {
    let db;

    beforeEach(() => {
        db = new Database(':memory:');
        // Initialize schema
        initSchema(db);
    });

    afterEach(() => {
        db.close();
    });

    it('should mark item as dirty after update', () => {
        const id = createItem('Test', 'Description');
        updateItem(id, { title: 'Updated' });

        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
        expect(item.dirty).toBe(1);
    });

    it('should resolve conflict with LWW', () => {
        const localItem = {
            id: '123',
            title: 'Local',
            updated_at: 1000,
            dirty: 1
        };

        const remoteItem = {
            id: '123',
            title: 'Remote',
            updated_at: 2000
        };

        resolveConflictLWW(localItem, remoteItem);

        const item = db.prepare('SELECT * FROM items WHERE id = ?').get('123');
        expect(item.title).toBe('Remote');
    });
});
```

### Integration Tests

```javascript
describe('Full sync cycle', () => {
    it('should sync changes between two databases', async () => {
        const db1 = new Database('db1.db');
        const db2 = new Database('db2.db');

        // Create item on db1
        const id = createItem(db1, 'Item 1', 'Description');

        // Sync db1 to server
        await pushChanges(db1);

        // Sync server to db2
        await pullChanges(db2);

        // Verify item exists on db2
        const item = db2.prepare('SELECT * FROM items WHERE id = ?').get(id);
        expect(item.title).toBe('Item 1');

        db1.close();
        db2.close();
    });
});
```

## Best Practices

1. **Use UUIDs**: Generate client-side IDs to avoid conflicts
2. **Soft Deletes**: Use deleted_at instead of hard deletes
3. **Version Tracking**: Increment version on every change
4. **Batch Transactions**: Group operations in transactions
5. **Index Strategically**: Index dirty, updated_at, deleted_at
6. **Paginate Large Syncs**: Avoid loading entire dataset
7. **Exponential Backoff**: Retry failed syncs with backoff
8. **Monitor Sync State**: Show users sync progress
9. **Handle Partial Success**: Don't rollback entire sync if one item fails
10. **Test Offline**: Simulate network failures in tests

## Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Room Persistence Library (Android)](https://developer.android.com/training/data-storage/room)
- [SQLite.swift](https://github.com/stephencelis/SQLite.swift)
- [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)
