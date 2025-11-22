# Conflict Resolution Algorithms and Patterns

Detailed guide on conflict resolution strategies for offline sync, including Last-Write-Wins, Operational Transforms, CRDTs, and custom merge strategies.

## Overview

Conflicts occur when the same data is modified on multiple devices while offline. Choosing the right conflict resolution strategy depends on your application's requirements and data characteristics.

## Conflict Detection

### Timestamp-Based Detection

```javascript
function detectConflict(local, remote) {
  // Both have been modified since last sync
  return local.dirty && remote.updated_at > local.synced_at;
}
```

### Version-Based Detection

```javascript
function detectConflictVersion(local, remote) {
  // Version vectors diverged
  return local.version !== remote.version && local.updated_at !== remote.updated_at;
}
```

### Hash-Based Detection

```javascript
import crypto from 'crypto';

function computeHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function detectConflictHash(local, remote) {
  const localHash = computeHash(local.data);
  const remoteHash = computeHash(remote.data);

  return localHash !== remoteHash && local.dirty === true;
}
```

## Last-Write-Wins (LWW)

### Simple Timestamp Comparison

```javascript
function resolveLWW(local, remote) {
  if (remote.updated_at > local.updated_at) {
    return {
      resolution: 'remote',
      winner: remote,
      reason: 'Remote timestamp newer',
    };
  } else {
    return {
      resolution: 'local',
      winner: local,
      reason: 'Local timestamp newer or equal',
    };
  }
}
```

### Property-Level LWW

```javascript
function resolveLWWPerProperty(local, remote) {
  const merged = { id: local.id };

  for (const key in local) {
    if (key === 'id') continue;

    if (local[`${key}_updated_at`] > remote[`${key}_updated_at`]) {
      merged[key] = local[key];
      merged[`${key}_updated_at`] = local[`${key}_updated_at`];
    } else {
      merged[key] = remote[key];
      merged[`${key}_updated_at`] = remote[`${key}_updated_at`];
    }
  }

  return merged;
}

// Example data structure
const item = {
  id: '123',
  title: 'Task',
  title_updated_at: 1000,
  description: 'Description',
  description_updated_at: 2000,
  status: 'done',
  status_updated_at: 1500,
};
```

### LWW with Causal Ordering

```javascript
function resolveLWWCausal(local, remote) {
  // Check if one change causally depends on the other
  if (local.updated_at < remote.synced_at) {
    // Local change happened before remote was synced
    return { resolution: 'remote', winner: remote };
  } else if (remote.updated_at < local.synced_at) {
    // Remote change happened before local was synced
    return { resolution: 'local', winner: local };
  } else {
    // Concurrent changes, use timestamp
    return resolveLWW(local, remote);
  }
}
```

## Operational Transforms (OT)

### Text Editing Operations

```javascript
class Operation {
  constructor(type, position, content) {
    this.type = type; // 'insert', 'delete', 'retain'
    this.position = position;
    this.content = content;
  }
}

// Transform operation A against operation B
function transform(opA, opB) {
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opA.position < opB.position) {
      return { opA, opB: new Operation('insert', opB.position + opA.content.length, opB.content) };
    } else if (opA.position > opB.position) {
      return { opA: new Operation('insert', opA.position + opB.content.length, opA.content), opB };
    } else {
      // Same position, use tie-breaker (e.g., device ID)
      return { opA, opB: new Operation('insert', opB.position + opA.content.length, opB.content) };
    }
  }

  if (opA.type === 'delete' && opB.type === 'delete') {
    if (opA.position < opB.position) {
      return { opA, opB: new Operation('delete', opB.position - 1, opB.content) };
    } else if (opA.position > opB.position) {
      return { opA: new Operation('delete', opA.position - 1, opA.content), opB };
    } else {
      // Same position, both deleted same character
      return { opA: null, opB: null };
    }
  }

  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opA.position <= opB.position) {
      return { opA, opB: new Operation('delete', opB.position + opA.content.length, opB.content) };
    } else {
      return { opA: new Operation('insert', opA.position - 1, opA.content), opB };
    }
  }

  if (opA.type === 'delete' && opB.type === 'insert') {
    if (opA.position < opB.position) {
      return { opA, opB: new Operation('insert', opB.position - 1, opB.content) };
    } else {
      return { opA: new Operation('delete', opA.position + opB.content.length, opA.content), opB };
    }
  }

  return { opA, opB };
}

// Apply operation to document
function apply(document, operation) {
  if (operation.type === 'insert') {
    return (
      document.slice(0, operation.position) + operation.content + document.slice(operation.position)
    );
  } else if (operation.type === 'delete') {
    return document.slice(0, operation.position) + document.slice(operation.position + 1);
  }
  return document;
}

// Example usage
let doc = 'Hello';
const op1 = new Operation('insert', 5, ' World'); // Insert " World" at position 5
const op2 = new Operation('insert', 0, 'Say '); // Insert "Say " at position 0

// Transform operations
const { opA: op1_prime, opB: op2_prime } = transform(op1, op2);

// Apply transformed operations
doc = apply(doc, op2_prime); // "Say Hello"
doc = apply(doc, op1_prime); // "Say Hello World"
```

### List Operations

```javascript
class ListOperation {
  constructor(type, index, element) {
    this.type = type; // 'insert', 'delete', 'update'
    this.index = index;
    this.element = element;
  }
}

function transformList(opA, opB) {
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opA.index < opB.index) {
      return { opA, opB: new ListOperation('insert', opB.index + 1, opB.element) };
    } else if (opA.index >= opB.index) {
      return { opA: new ListOperation('insert', opA.index + 1, opA.element), opB };
    }
  }

  if (opA.type === 'delete' && opB.type === 'delete') {
    if (opA.index < opB.index) {
      return { opA, opB: new ListOperation('delete', opB.index - 1, opB.element) };
    } else if (opA.index > opB.index) {
      return { opA: new ListOperation('delete', opA.index - 1, opA.element), opB };
    } else {
      // Same index deleted, only one delete needed
      return { opA, opB: null };
    }
  }

  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opA.index <= opB.index) {
      return { opA, opB: new ListOperation('delete', opB.index + 1, opB.element) };
    } else {
      return { opA: new ListOperation('insert', opA.index - 1, opA.element), opB };
    }
  }

  if (opA.type === 'delete' && opB.type === 'insert') {
    if (opA.index < opB.index) {
      return { opA, opB: new ListOperation('insert', opB.index - 1, opB.element) };
    } else {
      return { opA: new ListOperation('delete', opA.index + 1, opA.element), opB };
    }
  }

  return { opA, opB };
}
```

## Conflict-Free Replicated Data Types (CRDTs)

### G-Counter (Grow-Only Counter)

```javascript
class GCounter {
  constructor(replicaId) {
    this.replicaId = replicaId;
    this.counts = {}; // replicaId -> count
  }

  increment(value = 1) {
    this.counts[this.replicaId] = (this.counts[this.replicaId] || 0) + value;
  }

  value() {
    return Object.values(this.counts).reduce((sum, count) => sum + count, 0);
  }

  merge(other) {
    for (const [replicaId, count] of Object.entries(other.counts)) {
      this.counts[replicaId] = Math.max(this.counts[replicaId] || 0, count);
    }
  }

  toJSON() {
    return { replicaId: this.replicaId, counts: this.counts };
  }
}

// Example usage
const counter1 = new GCounter('device-1');
counter1.increment(5);

const counter2 = new GCounter('device-2');
counter2.increment(3);

// Merge counters
counter1.merge(counter2);
console.log(counter1.value()); // 8
```

### PN-Counter (Positive-Negative Counter)

```javascript
class PNCounter {
  constructor(replicaId) {
    this.replicaId = replicaId;
    this.positive = new GCounter(replicaId);
    this.negative = new GCounter(replicaId);
  }

  increment(value = 1) {
    this.positive.increment(value);
  }

  decrement(value = 1) {
    this.negative.increment(value);
  }

  value() {
    return this.positive.value() - this.negative.value();
  }

  merge(other) {
    this.positive.merge(other.positive);
    this.negative.merge(other.negative);
  }

  toJSON() {
    return {
      replicaId: this.replicaId,
      positive: this.positive.toJSON(),
      negative: this.negative.toJSON(),
    };
  }
}

// Example usage
const counter1 = new PNCounter('device-1');
counter1.increment(10);
counter1.decrement(3);

const counter2 = new PNCounter('device-2');
counter2.increment(5);
counter2.decrement(2);

counter1.merge(counter2);
console.log(counter1.value()); // (10 + 5) - (3 + 2) = 10
```

### LWW-Element-Set (Last-Write-Wins Set)

```javascript
class LWWSet {
  constructor(replicaId) {
    this.replicaId = replicaId;
    this.adds = {}; // element -> timestamp
    this.removes = {}; // element -> timestamp
  }

  add(element, timestamp = Date.now()) {
    this.adds[element] = Math.max(this.adds[element] || 0, timestamp);
  }

  remove(element, timestamp = Date.now()) {
    this.removes[element] = Math.max(this.removes[element] || 0, timestamp);
  }

  has(element) {
    const addTime = this.adds[element] || 0;
    const removeTime = this.removes[element] || 0;

    // Element exists if added after being removed (or never removed)
    return addTime > removeTime;
  }

  values() {
    return Object.keys(this.adds).filter(element => this.has(element));
  }

  merge(other) {
    // Merge adds
    for (const [element, timestamp] of Object.entries(other.adds)) {
      this.adds[element] = Math.max(this.adds[element] || 0, timestamp);
    }

    // Merge removes
    for (const [element, timestamp] of Object.entries(other.removes)) {
      this.removes[element] = Math.max(this.removes[element] || 0, timestamp);
    }
  }

  toJSON() {
    return { replicaId: this.replicaId, adds: this.adds, removes: this.removes };
  }
}

// Example usage
const set1 = new LWWSet('device-1');
set1.add('apple', 1000);
set1.add('banana', 2000);

const set2 = new LWWSet('device-2');
set2.add('orange', 1500);
set2.remove('apple', 3000);

set1.merge(set2);
console.log(set1.values()); // ['banana', 'orange'] (apple removed at time 3000)
```

### OR-Set (Observed-Remove Set)

```javascript
class ORSet {
  constructor(replicaId) {
    this.replicaId = replicaId;
    this.elements = new Map(); // element -> Set of unique IDs
    this.idCounter = 0;
  }

  add(element) {
    const uniqueId = `${this.replicaId}-${this.idCounter++}-${Date.now()}`;

    if (!this.elements.has(element)) {
      this.elements.set(element, new Set());
    }

    this.elements.get(element).add(uniqueId);
    return uniqueId;
  }

  remove(element) {
    // Remove all observed IDs for this element
    this.elements.delete(element);
  }

  has(element) {
    return this.elements.has(element) && this.elements.get(element).size > 0;
  }

  values() {
    return Array.from(this.elements.keys()).filter(element => this.has(element));
  }

  merge(other) {
    for (const [element, ids] of other.elements) {
      if (!this.elements.has(element)) {
        this.elements.set(element, new Set());
      }

      // Union of unique IDs
      for (const id of ids) {
        this.elements.get(element).add(id);
      }
    }
  }

  toJSON() {
    const serialized = {};
    for (const [element, ids] of this.elements) {
      serialized[element] = Array.from(ids);
    }
    return { replicaId: this.replicaId, elements: serialized };
  }
}

// Example usage
const set1 = new ORSet('device-1');
set1.add('apple');
set1.add('banana');

const set2 = new ORSet('device-2');
set2.add('apple'); // Different unique ID
set2.add('orange');

set1.remove('apple'); // Only removes IDs observed on device-1

set1.merge(set2);
console.log(set1.values()); // ['banana', 'apple', 'orange'] (apple from device-2 preserved)
```

### LWW-Register (Last-Write-Wins Register)

```javascript
class LWWRegister {
  constructor(replicaId, initialValue = null) {
    this.replicaId = replicaId;
    this.value = initialValue;
    this.timestamp = 0;
  }

  set(value, timestamp = Date.now()) {
    if (timestamp > this.timestamp) {
      this.value = value;
      this.timestamp = timestamp;
    }
  }

  get() {
    return this.value;
  }

  merge(other) {
    if (other.timestamp > this.timestamp) {
      this.value = other.value;
      this.timestamp = other.timestamp;
    } else if (other.timestamp === this.timestamp) {
      // Tie-breaker: use replica ID
      if (other.replicaId > this.replicaId) {
        this.value = other.value;
      }
    }
  }

  toJSON() {
    return { replicaId: this.replicaId, value: this.value, timestamp: this.timestamp };
  }
}
```

## Custom Merge Strategies

### Field-Level Merge

```javascript
function mergeContact(local, remote) {
  return {
    id: local.id,
    // Name: use newer
    name: remote.name_updated_at > local.name_updated_at ? remote.name : local.name,
    name_updated_at: Math.max(local.name_updated_at, remote.name_updated_at),

    // Email: prefer non-empty
    email: remote.email || local.email,
    email_updated_at: Math.max(local.email_updated_at, remote.email_updated_at),

    // Phone: use newer
    phone: remote.phone_updated_at > local.phone_updated_at ? remote.phone : local.phone,
    phone_updated_at: Math.max(local.phone_updated_at, remote.phone_updated_at),

    // Tags: union of both
    tags: [...new Set([...local.tags, ...remote.tags])],

    // Notes: concatenate if different
    notes: local.notes === remote.notes ? local.notes : `${local.notes}\n---\n${remote.notes}`,

    updated_at: Math.max(local.updated_at, remote.updated_at),
    version: Math.max(local.version, remote.version) + 1,
  };
}
```

### Three-Way Merge

```javascript
function threeWayMerge(base, local, remote) {
  const merged = { ...base };

  for (const key in base) {
    const baseValue = base[key];
    const localValue = local[key];
    const remoteValue = remote[key];

    if (localValue === remoteValue) {
      // No conflict
      merged[key] = localValue;
    } else if (localValue === baseValue) {
      // Only remote changed
      merged[key] = remoteValue;
    } else if (remoteValue === baseValue) {
      // Only local changed
      merged[key] = localValue;
    } else {
      // Both changed, apply custom logic
      merged[key] = resolveConflictForField(key, localValue, remoteValue);
    }
  }

  return merged;
}

function resolveConflictForField(fieldName, localValue, remoteValue) {
  // Custom logic per field
  if (fieldName === 'tags') {
    return [...new Set([...localValue, ...remoteValue])];
  } else if (fieldName === 'count') {
    return Math.max(localValue, remoteValue);
  } else {
    // Default: use local
    return localValue;
  }
}
```

### Semantic Merge

```javascript
function semanticMerge(local, remote) {
  // Example: Task status follows a state machine
  const statusPriority = {
    pending: 1,
    in_progress: 2,
    review: 3,
    done: 4,
    archived: 5,
  };

  // Always move to higher priority status
  const status =
    statusPriority[local.status] > statusPriority[remote.status] ? local.status : remote.status;

  // Completion date: use earliest if both marked done
  let completed_at = null;
  if (local.status === 'done' && remote.status === 'done') {
    completed_at = Math.min(local.completed_at, remote.completed_at);
  } else if (status === 'done') {
    completed_at = local.status === 'done' ? local.completed_at : remote.completed_at;
  }

  return {
    ...local,
    status,
    completed_at,
    updated_at: Math.max(local.updated_at, remote.updated_at),
  };
}
```

## User-Driven Conflict Resolution

### Store Conflicts for User Review

```javascript
class ConflictStore {
  constructor(db) {
    this.db = db;
  }

  async storeConflict(recordId, local, remote) {
    const conflict = {
      id: generateUUID(),
      record_id: recordId,
      local_data: JSON.stringify(local),
      remote_data: JSON.stringify(remote),
      created_at: Date.now(),
      resolved: false,
    };

    await this.db.put('conflicts', conflict);

    return conflict.id;
  }

  async getConflicts() {
    return await this.db.getAllFromIndex('conflicts', 'resolved', false);
  }

  async resolveConflict(conflictId, resolution) {
    const conflict = await this.db.get('conflicts', conflictId);

    if (!conflict) {
      throw new Error('Conflict not found');
    }

    const localData = JSON.parse(conflict.local_data);
    const remoteData = JSON.parse(conflict.remote_data);

    let resolvedData;
    if (resolution === 'local') {
      resolvedData = localData;
    } else if (resolution === 'remote') {
      resolvedData = remoteData;
    } else {
      // User provided merged data
      resolvedData = resolution;
    }

    // Update the record
    await this.db.put('items', {
      ...resolvedData,
      updated_at: Date.now(),
      dirty: true,
    });

    // Mark conflict as resolved
    await this.db.put('conflicts', {
      ...conflict,
      resolved: true,
      resolved_at: Date.now(),
      resolution_type: typeof resolution === 'string' ? resolution : 'custom',
    });
  }
}
```

### UI for Conflict Resolution

```javascript
// React component example
function ConflictResolutionUI({ conflict, onResolve }) {
  const localData = JSON.parse(conflict.local_data);
  const remoteData = JSON.parse(conflict.remote_data);

  return (
    <div className="conflict-card">
      <h3>Conflict Detected</h3>

      <div className="conflict-comparison">
        <div className="local-version">
          <h4>Your Version</h4>
          <pre>{JSON.stringify(localData, null, 2)}</pre>
          <button onClick={() => onResolve(conflict.id, 'local')}>Keep Mine</button>
        </div>

        <div className="remote-version">
          <h4>Server Version</h4>
          <pre>{JSON.stringify(remoteData, null, 2)}</pre>
          <button onClick={() => onResolve(conflict.id, 'remote')}>Use Server</button>
        </div>
      </div>

      <div className="custom-merge">
        <h4>Or Merge Manually</h4>
        <button onClick={() => openMergeEditor(localData, remoteData)}>Merge Manually</button>
      </div>
    </div>
  );
}
```

## Conflict Resolution Decision Matrix

| Data Type    | Recommended Strategy   | Why                                    |
| ------------ | ---------------------- | -------------------------------------- |
| User Profile | Field-level LWW        | Different fields updated independently |
| Documents    | OT or CRDT             | Preserve concurrent edits              |
| Counters     | PN-Counter CRDT        | Commutative operations                 |
| Sets         | OR-Set CRDT            | Preserve additions                     |
| Task Status  | Semantic Merge         | Follow state machine rules             |
| Timestamps   | Max                    | Always use latest                      |
| Booleans     | LWW or User Resolution | Depends on importance                  |
| Foreign Keys | User Resolution        | Needs context to resolve               |

## Best Practices

1. **Choose Strategy Per Data Type**: Different data needs different strategies
2. **Log All Conflicts**: Track conflicts for debugging and analytics
3. **Provide User Resolution**: Allow users to manually resolve important conflicts
4. **Test Conflict Scenarios**: Write tests for concurrent edits
5. **Document Strategy**: Clearly document which strategy is used where
6. **Monitor Conflict Rate**: High conflict rate may indicate design issues
7. **Version Everything**: Use version counters for conflict detection
8. **Preserve History**: Keep audit log of all changes
9. **Fail Gracefully**: Default to safe resolution (e.g., user review)
10. **Consider Causality**: Use vector clocks for causal ordering

## Resources

- [Conflict-Free Replicated Data Types](https://crdt.tech/)
- [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation)
- [A comprehensive study of CRDTs](https://arxiv.org/abs/1805.06358)
- [Automerge CRDT Library](https://github.com/automerge/automerge)
- [Yjs CRDT Framework](https://github.com/yjs/yjs)
