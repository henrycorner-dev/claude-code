---
name: Offline Sync
description: This skill should be used when the user asks to "implement offline sync", "add local storage", "handle conflict resolution", "set up background sync", "implement offline-first", "sync local data", "resolve sync conflicts", "use Realm", "use SQLite for sync", "implement CRDT", or mentions offline data synchronization, local-first architecture, or conflict-free data replication.
version: 0.1.0
---

# Offline Sync Skill

Implement robust offline-first data synchronization with local storage, conflict resolution, and background sync capabilities across mobile, web, and desktop platforms.

## Purpose

This skill provides guidance for building offline-first applications that:

- Store data locally using Realm, SQLite, or IndexedDB
- Synchronize data with remote servers when connectivity is available
- Handle conflicts when local and remote data diverge
- Provide seamless user experiences regardless of network conditions

## When to Use This Skill

Use this skill when implementing:

- Offline-first mobile apps (iOS, Android, React Native, Flutter)
- Progressive Web Apps (PWAs) with offline capabilities
- Desktop applications (Electron) requiring local data storage
- Applications needing conflict resolution for collaborative data
- Background synchronization systems
- Local-first architecture patterns

## Core Concepts

### Offline-First Architecture

Build applications that function fully offline and sync when online:

1. **Local Storage First**: All operations write to local storage immediately
2. **Deferred Sync**: Queue changes for synchronization when online
3. **Optimistic UI**: Update UI instantly, resolve conflicts later
4. **Conflict Resolution**: Define strategies for handling divergent data

### Storage Solutions

#### Realm/MongoDB Realm

- Built-in sync protocol and conflict resolution
- Mobile-first with iOS, Android, React Native support
- Automatic schema versioning and migration
- Real-time data sync with MongoDB Atlas

#### SQLite

- Lightweight, cross-platform SQL database
- Manual sync implementation required
- Full control over sync protocol and conflict handling
- Available on mobile, desktop, and embedded systems

#### IndexedDB

- Browser-based NoSQL storage for web apps
- Asynchronous API for non-blocking operations
- Available in all modern browsers and PWAs
- Manual sync and conflict resolution needed

### Sync Patterns

#### Push-Pull Sync

1. **Pull**: Fetch remote changes since last sync
2. **Merge**: Apply remote changes to local database
3. **Push**: Upload local changes to server
4. **Resolve**: Handle any conflicts detected

#### Delta Sync

- Transfer only changed data (deltas) instead of full records
- Reduce bandwidth and improve sync performance
- Track timestamps or version vectors for change detection

#### Background Sync

- Queue operations when offline
- Automatically retry when connectivity returns
- Use platform-specific APIs (iOS Background Fetch, Android WorkManager, Web Background Sync API)

## Conflict Resolution Strategies

### Last-Write-Wins (LWW)

Simplest strategy using timestamps:

```
if remote.timestamp > local.timestamp:
    accept remote version
else:
    keep local version
```

**Best for**: Single-user apps, data where latest value is authoritative

**Limitations**: Can lose concurrent edits

### Operational Transforms (OT)

Transform concurrent operations to maintain consistency:

```
operation_a' = transform(operation_a, operation_b)
operation_b' = transform(operation_b, operation_a)
```

**Best for**: Real-time collaborative editing (Google Docs style)

**Complexity**: Requires operation transformation functions for each data type

### Conflict-Free Replicated Data Types (CRDTs)

Data structures that automatically resolve conflicts:

- **G-Counter**: Grow-only counter (add-only)
- **PN-Counter**: Positive-negative counter (increment/decrement)
- **LWW-Element-Set**: Last-write-wins set
- **OR-Set**: Observed-remove set (preserves all additions)

**Best for**: Distributed systems, collaborative apps, high availability

**Benefits**: Guaranteed eventual consistency without coordination

### Custom Merge Strategies

Application-specific logic for conflict resolution:

```
function mergeContact(local, remote):
    merged = {}
    merged.name = remote.name if remote.updated_at > local.updated_at else local.name
    merged.email = remote.email if remote.email else local.email
    merged.phone = newer(local.phone, remote.phone)
    return merged
```

**Best for**: Domain-specific requirements, complex business logic

## Implementation Workflow

### Step 1: Choose Storage Solution

Select storage based on platform and requirements:

- **Realm**: For mobile apps needing built-in sync
- **SQLite**: For full control and cross-platform compatibility
- **IndexedDB**: For web applications and PWAs
- **Multiple**: For cross-platform apps (SQLite on mobile, IndexedDB on web)

### Step 2: Design Schema with Sync Metadata

Add fields for tracking sync state:

```sql
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    data TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    deleted_at INTEGER,  -- Soft deletes for sync
    synced_at INTEGER,   -- Last successful sync
    dirty BOOLEAN        -- Has unsynced changes
);
```

### Step 3: Implement Local Operations

Wrap all data operations to track changes:

```javascript
function createItem(data) {
  const item = {
    id: generateUUID(),
    data: data,
    created_at: Date.now(),
    updated_at: Date.now(),
    dirty: true,
    synced_at: null,
  };
  db.insert('items', item);
  queueForSync(item.id);
  return item;
}
```

### Step 4: Implement Sync Protocol

Build sync engine with pull-push cycle:

1. **Pull**: Fetch remote changes since last sync
2. **Detect Conflicts**: Compare timestamps/versions
3. **Resolve Conflicts**: Apply chosen strategy
4. **Push**: Upload local changes
5. **Mark Synced**: Update sync metadata

### Step 5: Handle Background Sync

Configure platform-specific background sync:

- **iOS**: Background Fetch, Silent Push Notifications
- **Android**: WorkManager for periodic sync
- **Web**: Background Sync API, Service Workers
- **Desktop**: Native timers, system events

### Step 6: Test Conflict Scenarios

Verify conflict resolution with test cases:

1. Concurrent edits to same record
2. Delete-update conflicts (local delete, remote update)
3. Network interruption during sync
4. Multiple devices syncing simultaneously

## Additional Resources

### Reference Files

For detailed implementation guides:

- **`references/realm-sync.md`** - Realm/MongoDB Realm sync setup and patterns
- **`references/sqlite-sync.md`** - SQLite manual sync implementation guide
- **`references/indexeddb-sync.md`** - IndexedDB sync wrapper implementation
- **`references/conflict-resolution.md`** - Detailed conflict resolution algorithms (OT, CRDTs)
- **`references/background-sync.md`** - Platform-specific background sync implementation

### Example Files

Working implementations in `examples/`:

- **`examples/lww-sync.js`** - Last-write-wins sync implementation
- **`examples/crdt-counter.js`** - CRDT counter example
- **`examples/sync-queue.js`** - Sync queue with retry logic
- **`examples/realm-config.js`** - Realm sync configuration
- **`examples/sqlite-schema.sql`** - SQLite schema with sync metadata

### Utility Scripts

Helper scripts in `scripts/`:

- **`scripts/validate-sync-state.js`** - Validate local/remote sync state
- **`scripts/test-conflict-resolution.js`** - Test conflict scenarios
- **`scripts/migrate-sync-schema.sql`** - Add sync metadata to existing schema

## Best Practices

### Performance Optimization

- **Batch Operations**: Group multiple changes into single sync
- **Incremental Sync**: Only sync changed records
- **Pagination**: Fetch large datasets in chunks
- **Indexes**: Index sync metadata fields (dirty, updated_at, synced_at)

### Error Handling

- **Retry Logic**: Exponential backoff for failed syncs
- **Partial Success**: Mark individual records as synced even if batch fails
- **Conflict Logging**: Log conflicts for debugging and user review
- **Network Detection**: Monitor connectivity changes to trigger sync

### Security Considerations

- **Authentication**: Verify user identity before sync
- **Authorization**: Ensure users only sync their own data
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Validation**: Validate all incoming data from server

### User Experience

- **Sync Indicators**: Show sync status to users (syncing, synced, conflicts)
- **Conflict UI**: Allow users to manually resolve conflicts when needed
- **Offline Indicators**: Clearly indicate when app is offline
- **Optimistic Updates**: Update UI immediately, show sync errors if they occur

## Common Patterns

### Sync Queue with Retry

Maintain a queue of pending sync operations:

```javascript
class SyncQueue {
  async processQueue() {
    const pending = await db.query('SELECT * FROM items WHERE dirty = true');
    for (const item of pending) {
      try {
        await syncItem(item);
        await db.update('items', { id: item.id, dirty: false, synced_at: Date.now() });
      } catch (error) {
        await scheduleRetry(item.id, error);
      }
    }
  }
}
```

### Version Vectors for Multi-Device Sync

Track changes from multiple devices:

```javascript
{
    "id": "item-123",
    "data": {...},
    "versions": {
        "device-a": 5,
        "device-b": 3,
        "device-c": 7
    }
}
```

### Soft Deletes for Sync

Never hard-delete records that need to sync:

```sql
-- Mark as deleted instead of removing
UPDATE items SET deleted_at = ?, dirty = true WHERE id = ?;

-- Filter deleted items in queries
SELECT * FROM items WHERE deleted_at IS NULL;
```

## Troubleshooting

### Sync Loops

**Symptom**: Endless sync cycles, same data re-syncing

**Solution**: Ensure synced_at updates after successful sync, compare timestamps correctly

### Data Loss

**Symptom**: Local changes disappear after sync

**Solution**: Verify conflict resolution logic, check dirty flag updates, test LWW timestamp comparison

### Performance Issues

**Symptom**: Slow sync, UI freezes during sync

**Solution**: Use incremental sync, batch operations, run sync on background thread, add database indexes

### Conflicts Not Resolving

**Symptom**: Conflicts persist across multiple syncs

**Solution**: Log conflict data, verify merge logic, check version/timestamp propagation

## Platform-Specific Notes

### Mobile (iOS/Android)

- Use platform background sync APIs
- Handle app lifecycle (pause/resume)
- Consider battery and data usage
- Test with unreliable network conditions

### Web (PWAs)

- Use Service Workers for background sync
- Handle browser lifecycle and tab visibility
- Cache data for offline access
- Consider storage quota limits

### Desktop (Electron)

- Leverage native modules for SQLite
- Use system events for background sync
- Handle application updates during sync
- Consider file-based sync alternatives

### Cross-Platform (React Native/Flutter)

- Abstract storage layer for platform differences
- Use platform-appropriate background sync
- Test on all target platforms
- Consider platform-specific storage limits

## Next Steps

1. **Choose Storage**: Select Realm, SQLite, or IndexedDB based on requirements
2. **Review References**: Read detailed guides for chosen storage solution
3. **Design Schema**: Add sync metadata to data models
4. **Implement Sync**: Build sync engine with conflict resolution
5. **Test Conflicts**: Verify conflict scenarios work correctly
6. **Add Background Sync**: Configure platform-specific background sync
7. **Monitor Performance**: Profile sync operations and optimize

For detailed implementation guides, consult the reference files in `references/` directory. For working code examples, see the `examples/` directory.
