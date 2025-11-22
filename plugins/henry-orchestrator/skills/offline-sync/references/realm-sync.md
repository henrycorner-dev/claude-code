# Realm/MongoDB Realm Sync Implementation Guide

Comprehensive guide for implementing offline sync using Realm and MongoDB Realm Sync.

## Overview

Realm provides built-in synchronization with MongoDB Atlas, offering automatic conflict resolution, real-time updates, and offline-first architecture with minimal configuration.

## Setup and Installation

### iOS (Swift)

```swift
// Install via CocoaPods
// Podfile
pod 'RealmSwift', '~>10'

// Import
import RealmSwift
```

### Android (Kotlin)

```kotlin
// build.gradle
dependencies {
    implementation 'io.realm.kotlin:library-sync:1.11.0'
}
```

### React Native

```bash
npm install realm
# or
yarn add realm
```

### Flutter

```yaml
# pubspec.yaml
dependencies:
  realm: ^1.0.0
```

## Configuration

### Initialize Realm App

```javascript
// JavaScript/React Native
import Realm from 'realm';

const app = new Realm.App({ id: 'your-app-id' });

// Authenticate user
const credentials = Realm.Credentials.emailPassword('user@example.com', 'password');
const user = await app.logIn(credentials);

// Open synced realm
const config = {
    schema: [TaskSchema, ProjectSchema],
    sync: {
        user: user,
        partitionValue: user.id, // Or team ID, project ID, etc.
        flexible: true, // Use flexible sync
    }
};

const realm = await Realm.open(config);
```

### Swift Configuration

```swift
let app = App(id: "your-app-id")

// Authenticate
app.login(credentials: Credentials.emailPassword(email: "user@example.com", password: "password")) { result in
    switch result {
    case .success(let user):
        var config = user.flexibleSyncConfiguration()
        config.objectTypes = [Task.self, Project.self]

        Realm.asyncOpen(configuration: config) { result in
            switch result {
            case .success(let realm):
                // Realm opened successfully
            case .failure(let error):
                print("Failed to open realm: \(error)")
            }
        }
    case .failure(let error):
        print("Login failed: \(error)")
    }
}
```

## Schema Definition

### JavaScript Schema

```javascript
const TaskSchema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
        _id: 'objectId',
        title: 'string',
        description: 'string?',
        completed: { type: 'bool', default: false },
        owner_id: 'string',
        created_at: 'date',
        updated_at: 'date'
    }
};

const ProjectSchema = {
    name: 'Project',
    primaryKey: '_id',
    properties: {
        _id: 'objectId',
        name: 'string',
        tasks: 'Task[]',
        owner_id: 'string',
        members: 'string[]'
    }
};
```

### Swift Schema

```swift
class Task: Object {
    @Persisted(primaryKey: true) var _id: ObjectId
    @Persisted var title: String
    @Persisted var description: String?
    @Persisted var completed: Bool = false
    @Persisted var owner_id: String
    @Persisted var created_at: Date
    @Persisted var updated_at: Date
}

class Project: Object {
    @Persisted(primaryKey: true) var _id: ObjectId
    @Persisted var name: String
    @Persisted var tasks: List<Task>
    @Persisted var owner_id: String
    @Persisted var members: List<String>
}
```

## Sync Modes

### Partition-Based Sync

Data partitioned by a field value (user ID, team ID, etc.):

```javascript
// Each user syncs only their own data
const config = {
    schema: [TaskSchema],
    sync: {
        user: user,
        partitionValue: user.id, // Only sync documents where owner_id = user.id
    }
};
```

**Best for**: Clear data ownership, tenant isolation, simple access control

### Flexible Sync

Query-based sync with custom subscription rules:

```javascript
const config = {
    schema: [TaskSchema, ProjectSchema],
    sync: {
        user: user,
        flexible: true,
    }
};

const realm = await Realm.open(config);

// Subscribe to specific queries
const tasks = realm.objects('Task');
await realm.subscriptions.update(mutableSubs => {
    // Subscribe to user's own tasks
    mutableSubs.add(tasks.filtered('owner_id == $0', user.id), { name: 'myTasks' });

    // Subscribe to shared project tasks
    mutableSubs.add(
        tasks.filtered('project.members IN $0', [user.id]),
        { name: 'sharedTasks' }
    );
});
```

**Best for**: Complex access patterns, shared data, collaborative apps

## CRUD Operations

### Create

```javascript
realm.write(() => {
    realm.create('Task', {
        _id: new Realm.BSON.ObjectId(),
        title: 'New Task',
        description: 'Task description',
        completed: false,
        owner_id: user.id,
        created_at: new Date(),
        updated_at: new Date()
    });
});
// Automatically synced when online
```

### Read

```javascript
// Query all tasks
const allTasks = realm.objects('Task');

// Filter tasks
const incompleteTasks = realm.objects('Task').filtered('completed == false');

// Listen for changes (live queries)
const tasks = realm.objects('Task');
tasks.addListener((tasks, changes) => {
    console.log(`${changes.insertions.length} tasks inserted`);
    console.log(`${changes.modifications.length} tasks modified`);
    console.log(`${changes.deletions.length} tasks deleted`);
});
```

### Update

```javascript
const task = realm.objects('Task').filtered('_id == $0', taskId)[0];

realm.write(() => {
    task.title = 'Updated Title';
    task.updated_at = new Date();
});
// Change synced automatically
```

### Delete

```javascript
const task = realm.objects('Task').filtered('_id == $0', taskId)[0];

realm.write(() => {
    realm.delete(task);
});
// Deletion synced across devices
```

## Conflict Resolution

### Built-in Conflict Resolution

Realm uses **last-write-wins** (LWW) at the property level:

```javascript
// Device A (offline)
realm.write(() => {
    task.title = 'Title from Device A';
    task.updated_at = new Date('2024-01-01T10:00:00'); // Older
});

// Device B (offline)
realm.write(() => {
    task.title = 'Title from Device B';
    task.updated_at = new Date('2024-01-01T10:05:00'); // Newer
});

// When both sync:
// Result: task.title = 'Title from Device B' (newer timestamp wins)
```

**Property-level merging**: Different properties can win from different devices

```javascript
// Device A
realm.write(() => {
    task.title = 'Title A';
    task.description = 'Description A';
});

// Device B
realm.write(() => {
    task.title = 'Title B'; // This might win
    task.completed = true;  // This will merge
});

// Result: Merged object with properties from both devices
```

### Custom Conflict Handlers

For advanced scenarios, implement custom merge logic:

```javascript
// Monitor sync errors
realm.syncSession.addConnectionNotification(
    (newState, oldState) => {
        if (newState === Realm.ConnectionState.Disconnected) {
            console.log('Sync disconnected');
        }
    }
);

// Handle specific conflict scenarios in application logic
realm.objects('Task').addListener((tasks, changes) => {
    changes.modifications.forEach(index => {
        const task = tasks[index];
        // Check if modification requires special handling
        if (requiresManualReview(task)) {
            flagForUserReview(task);
        }
    });
});
```

## Subscription Management

### Adding Subscriptions

```javascript
await realm.subscriptions.update(mutableSubs => {
    // Add named subscription
    mutableSubs.add(
        realm.objects('Task').filtered('owner_id == $0', user.id),
        { name: 'myTasks' }
    );

    // Add anonymous subscription
    mutableSubs.add(
        realm.objects('Project').filtered('members IN $0', [user.id])
    );
});

// Wait for sync to complete
await realm.subscriptions.waitForSynchronization();
```

### Removing Subscriptions

```javascript
await realm.subscriptions.update(mutableSubs => {
    // Remove by name
    mutableSubs.removeByName('myTasks');

    // Remove all subscriptions
    mutableSubs.removeAll();

    // Remove specific query
    const query = realm.objects('Task').filtered('completed == true');
    mutableSubs.remove(query);
});
```

### Updating Subscriptions

```javascript
await realm.subscriptions.update(mutableSubs => {
    // Remove old subscription
    mutableSubs.removeByName('oldTasks');

    // Add updated subscription
    mutableSubs.add(
        realm.objects('Task').filtered('updated_at > $0', lastWeek),
        { name: 'recentTasks' }
    );
});
```

## Offline Handling

### Check Sync State

```javascript
const syncSession = realm.syncSession;

// Check connection state
if (syncSession.state === 'active') {
    console.log('Syncing...');
} else if (syncSession.state === 'inactive') {
    console.log('Offline');
}

// Monitor upload/download progress
syncSession.addProgressNotification(
    'upload',
    'forCurrentlyOutstandingWork',
    (transferred, transferable) => {
        console.log(`Upload: ${transferred} / ${transferable} bytes`);
    }
);

syncSession.addProgressNotification(
    'download',
    'reportIndefinitely',
    (transferred, transferable) => {
        console.log(`Download: ${transferred} / ${transferable} bytes`);
    }
);
```

### Manual Sync Triggers

```javascript
// Pause sync
realm.syncSession.pause();

// Resume sync
realm.syncSession.resume();

// Wait for uploads to complete
await realm.syncSession.uploadAllLocalChanges();

// Wait for downloads to complete
await realm.syncSession.downloadAllServerChanges();
```

## Error Handling

### Sync Errors

```javascript
realm.syncSession.addErrorNotification((session, error) => {
    console.error('Sync error:', error);

    if (error.name === 'ClientReset') {
        handleClientReset(error);
    } else if (error.name === 'PermissionDenied') {
        handlePermissionError(error);
    } else if (error.name === 'BadChangeset') {
        handleBadChangeset(error);
    }
});
```

### Client Reset

Handle cases where local Realm must be discarded:

```javascript
const config = {
    schema: [TaskSchema],
    sync: {
        user: user,
        flexible: true,
        clientReset: {
            mode: 'recoverOrDiscard', // Options: 'manual', 'discardLocal', 'recoverUnsyncedChanges', 'recoverOrDiscard'
            onBefore: (realm) => {
                console.log('Client reset about to happen');
                // Backup unsynced changes if needed
            },
            onAfter: (beforeRealm, afterRealm) => {
                console.log('Client reset completed');
                // Restore or merge data if needed
            }
        }
    }
};
```

## Performance Optimization

### Batch Operations

```javascript
realm.write(() => {
    for (let i = 0; i < 1000; i++) {
        realm.create('Task', {
            _id: new Realm.BSON.ObjectId(),
            title: `Task ${i}`,
            owner_id: user.id,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
});
// Single write transaction, synced as one batch
```

### Indexing

```javascript
const TaskSchema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
        _id: 'objectId',
        title: { type: 'string', indexed: true }, // Index for faster queries
        owner_id: { type: 'string', indexed: true },
        completed: 'bool',
        created_at: 'date'
    }
};
```

### Lazy Loading

```javascript
// Use pagination for large result sets
const pageSize = 20;
const offset = 0;

const tasks = realm.objects('Task')
    .filtered('owner_id == $0', user.id)
    .sorted('created_at', true)
    .slice(offset, offset + pageSize);
```

## Security and Authentication

### Authentication Methods

```javascript
// Email/Password
const credentials = Realm.Credentials.emailPassword('user@example.com', 'password');

// Anonymous
const credentials = Realm.Credentials.anonymous();

// API Key
const credentials = Realm.Credentials.apiKey('api-key');

// Custom JWT
const credentials = Realm.Credentials.jwt('jwt-token');

// Google OAuth
const credentials = Realm.Credentials.google({ idToken: 'google-id-token' });

// Apple Sign-In
const credentials = Realm.Credentials.apple('apple-id-token');

const user = await app.logIn(credentials);
```

### Access Control

Define rules in MongoDB Atlas:

```javascript
// MongoDB Atlas App Services > Rules
{
  "Task": {
    "read": "owner_id == %%user.id",
    "write": "owner_id == %%user.id",
    "insert": true,
    "delete": "owner_id == %%user.id"
  },
  "Project": {
    "read": "members IN %%user.id",
    "write": "owner_id == %%user.id",
    "insert": "%%user.id != null",
    "delete": "owner_id == %%user.id"
  }
}
```

## Migration and Schema Changes

### Additive Changes

Safe changes that don't require migration:

```javascript
// Add optional property
const TaskSchemaV2 = {
    name: 'Task',
    properties: {
        // ... existing properties
        priority: 'int?', // New optional property
    }
};
```

### Breaking Changes

Requires migration:

```javascript
const TaskSchemaV2 = {
    name: 'Task',
    schemaVersion: 2, // Increment version
    properties: {
        // ... properties
    },
    migration: (oldRealm, newRealm) => {
        const oldObjects = oldRealm.objects('Task');
        const newObjects = newRealm.objects('Task');

        for (let i = 0; i < oldObjects.length; i++) {
            newObjects[i].priority = 0; // Set default for new property
        }
    }
};
```

## Testing

### Mock Realm for Testing

```javascript
// Jest/Mocha test
import Realm from 'realm';

describe('Task operations', () => {
    let realm;

    beforeEach(async () => {
        // Use in-memory Realm for tests
        realm = await Realm.open({
            schema: [TaskSchema],
            inMemory: true
        });
    });

    afterEach(() => {
        realm.close();
    });

    it('should create task', () => {
        realm.write(() => {
            const task = realm.create('Task', {
                _id: new Realm.BSON.ObjectId(),
                title: 'Test Task',
                owner_id: 'test-user',
                created_at: new Date(),
                updated_at: new Date()
            });
            expect(task.title).toBe('Test Task');
        });
    });
});
```

## Best Practices

1. **Use Transactions**: Always wrap writes in `realm.write()`
2. **Close Realms**: Call `realm.close()` when done
3. **Handle Client Reset**: Implement robust client reset handling
4. **Monitor Sync Progress**: Show users sync status
5. **Index Frequently Queried Fields**: Improve query performance
6. **Batch Updates**: Group multiple operations in single transaction
7. **Validate Data**: Validate before writing to Realm
8. **Handle Errors**: Catch and handle sync errors gracefully
9. **Test Offline**: Simulate offline scenarios in testing
10. **Secure Credentials**: Never hardcode credentials in app

## Resources

- [Realm Documentation](https://www.mongodb.com/docs/realm/)
- [Realm Swift SDK](https://www.mongodb.com/docs/realm/sdk/swift/)
- [Realm Kotlin SDK](https://www.mongodb.com/docs/realm/sdk/kotlin/)
- [Realm React Native](https://www.mongodb.com/docs/realm/sdk/react-native/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
