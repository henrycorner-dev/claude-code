/**
 * CRDT Counter Example
 *
 * This example demonstrates PN-Counter (Positive-Negative Counter)
 * implementation for conflict-free distributed counting.
 */

class PNCounter {
  constructor(replicaId) {
    this.replicaId = replicaId;
    this.positive = {}; // replicaId -> count
    this.negative = {}; // replicaId -> count
  }

  /**
   * Increment the counter
   */
  increment(value = 1) {
    this.positive[this.replicaId] = (this.positive[this.replicaId] || 0) + value;
  }

  /**
   * Decrement the counter
   */
  decrement(value = 1) {
    this.negative[this.replicaId] = (this.negative[this.replicaId] || 0) + value;
  }

  /**
   * Get current counter value
   */
  value() {
    const positiveSum = Object.values(this.positive).reduce((sum, count) => sum + count, 0);
    const negativeSum = Object.values(this.negative).reduce((sum, count) => sum + count, 0);
    return positiveSum - negativeSum;
  }

  /**
   * Merge another counter into this one
   */
  merge(other) {
    // Merge positive counts
    for (const [replicaId, count] of Object.entries(other.positive)) {
      this.positive[replicaId] = Math.max(this.positive[replicaId] || 0, count);
    }

    // Merge negative counts
    for (const [replicaId, count] of Object.entries(other.negative)) {
      this.negative[replicaId] = Math.max(this.negative[replicaId] || 0, count);
    }
  }

  /**
   * Serialize counter for storage/transmission
   */
  toJSON() {
    return {
      replicaId: this.replicaId,
      positive: this.positive,
      negative: this.negative,
    };
  }

  /**
   * Deserialize counter from JSON
   */
  static fromJSON(json) {
    const counter = new PNCounter(json.replicaId);
    counter.positive = json.positive || {};
    counter.negative = json.negative || {};
    return counter;
  }
}

/**
 * Distributed Counter Manager
 * Manages CRDT counters with persistence and sync
 */
class DistributedCounterManager {
  constructor(deviceId, storage) {
    this.deviceId = deviceId;
    this.storage = storage; // localStorage, IndexedDB, etc.
    this.counters = new Map();
  }

  /**
   * Get or create a counter
   */
  getCounter(counterId) {
    if (!this.counters.has(counterId)) {
      // Try to load from storage
      const stored = this.storage.getItem(`counter_${counterId}`);
      if (stored) {
        this.counters.set(counterId, PNCounter.fromJSON(JSON.parse(stored)));
      } else {
        this.counters.set(counterId, new PNCounter(this.deviceId));
      }
    }

    return this.counters.get(counterId);
  }

  /**
   * Increment a counter
   */
  increment(counterId, value = 1) {
    const counter = this.getCounter(counterId);
    counter.increment(value);
    this.persist(counterId, counter);
    return counter.value();
  }

  /**
   * Decrement a counter
   */
  decrement(counterId, value = 1) {
    const counter = this.getCounter(counterId);
    counter.decrement(value);
    this.persist(counterId, counter);
    return counter.value();
  }

  /**
   * Get counter value
   */
  getValue(counterId) {
    const counter = this.getCounter(counterId);
    return counter.value();
  }

  /**
   * Merge remote counter state
   */
  mergeRemote(counterId, remoteCounterJSON) {
    const localCounter = this.getCounter(counterId);
    const remoteCounter = PNCounter.fromJSON(remoteCounterJSON);

    localCounter.merge(remoteCounter);
    this.persist(counterId, localCounter);

    return localCounter.value();
  }

  /**
   * Get counter for sync
   */
  getCounterForSync(counterId) {
    const counter = this.getCounter(counterId);
    return counter.toJSON();
  }

  /**
   * Persist counter to storage
   */
  persist(counterId, counter) {
    this.storage.setItem(`counter_${counterId}`, JSON.stringify(counter.toJSON()));
  }

  /**
   * Sync with server
   */
  async sync(apiUrl, authToken) {
    const counterIds = Array.from(this.counters.keys());

    for (const counterId of counterIds) {
      try {
        // Push local counter state
        const localCounter = this.getCounterForSync(counterId);

        const response = await fetch(`${apiUrl}/counters/${counterId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(localCounter),
        });

        if (response.ok) {
          const { merged } = await response.json();
          this.mergeRemote(counterId, merged);
          console.log(`Synced counter ${counterId}, new value: ${this.getValue(counterId)}`);
        }
      } catch (error) {
        console.error(`Failed to sync counter ${counterId}:`, error);
      }
    }
  }
}

// USAGE EXAMPLES

// Example 1: Basic counter operations
function basicExample() {
  console.log('=== Basic CRDT Counter Example ===');

  // Device 1 counter
  const counter1 = new PNCounter('device-1');
  counter1.increment(10);
  counter1.decrement(3);
  console.log('Device 1 counter:', counter1.value()); // 7

  // Device 2 counter (offline)
  const counter2 = new PNCounter('device-2');
  counter2.increment(5);
  counter2.decrement(2);
  console.log('Device 2 counter:', counter2.value()); // 3

  // Merge counters (when both devices sync)
  counter1.merge(counter2);
  console.log('Merged counter on device 1:', counter1.value()); // 10

  counter2.merge(counter1);
  console.log('Merged counter on device 2:', counter2.value()); // 10

  // Both devices now have the same value!
}

// Example 2: Distributed likes counter
async function likesCounterExample() {
  console.log('=== Distributed Likes Counter Example ===');

  const manager = new DistributedCounterManager('user-123', localStorage);

  // User likes a post
  const postId = 'post-456';
  manager.increment(postId, 1);
  console.log('Post likes:', manager.getValue(postId)); // 1

  // Simulate receiving remote state
  const remoteState = {
    replicaId: 'user-789',
    positive: { 'user-789': 5 },
    negative: { 'user-789': 1 },
  };

  manager.mergeRemote(postId, remoteState);
  console.log('Post likes after merge:', manager.getValue(postId)); // 5 (1 local + 4 remote)
}

// Example 3: Shopping cart quantity
async function shoppingCartExample() {
  console.log('=== Shopping Cart CRDT Counter Example ===');

  const manager = new DistributedCounterManager('cart-session-1', sessionStorage);

  const productId = 'product-123';

  // Add items to cart
  manager.increment(productId, 2);
  console.log('Cart quantity:', manager.getValue(productId)); // 2

  // Remove one item
  manager.decrement(productId, 1);
  console.log('Cart quantity:', manager.getValue(productId)); // 1

  // Add more items
  manager.increment(productId, 3);
  console.log('Cart quantity:', manager.getValue(productId)); // 4

  // Simulate sync with server
  // await manager.sync('https://api.example.com', 'auth-token');
}

// Example 4: Multi-device concurrent operations
function concurrentOperationsExample() {
  console.log('=== Concurrent Operations Example ===');

  // Initial state on server
  const serverCounter = new PNCounter('server');
  serverCounter.increment(100);

  // Device A (offline)
  const deviceA = PNCounter.fromJSON(serverCounter.toJSON());
  deviceA.replicaId = 'device-a';
  deviceA.increment(5); // User adds 5

  // Device B (offline, same time)
  const deviceB = PNCounter.fromJSON(serverCounter.toJSON());
  deviceB.replicaId = 'device-b';
  deviceB.increment(10); // User adds 10

  console.log('Device A value:', deviceA.value()); // 105
  console.log('Device B value:', deviceB.value()); // 110

  // Both devices sync with server
  serverCounter.merge(deviceA);
  serverCounter.merge(deviceB);

  console.log('Server value after sync:', serverCounter.value()); // 115

  // Sync back to devices
  deviceA.merge(serverCounter);
  deviceB.merge(serverCounter);

  console.log('Device A value after sync:', deviceA.value()); // 115
  console.log('Device B value after sync:', deviceB.value()); // 115

  // All devices converge to the same value!
}

// Example 5: Real-time collaboration counter
class RealtimeCounter {
  constructor(counterId, userId) {
    this.counterId = counterId;
    this.manager = new DistributedCounterManager(userId, localStorage);
    this.ws = null;
  }

  connect(wsUrl) {
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      // Subscribe to counter updates
      this.ws.send(
        JSON.stringify({
          type: 'subscribe',
          counterId: this.counterId,
        })
      );
    };

    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);

      if (message.type === 'counter_update') {
        // Merge remote counter state
        this.manager.mergeRemote(this.counterId, message.counter);
        console.log('Counter updated:', this.manager.getValue(this.counterId));

        // Trigger UI update
        this.onUpdate?.(this.manager.getValue(this.counterId));
      }
    };
  }

  increment(value = 1) {
    const newValue = this.manager.increment(this.counterId, value);

    // Broadcast update
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'counter_increment',
          counterId: this.counterId,
          counter: this.manager.getCounterForSync(this.counterId),
        })
      );
    }

    return newValue;
  }

  decrement(value = 1) {
    const newValue = this.manager.decrement(this.counterId, value);

    // Broadcast update
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'counter_decrement',
          counterId: this.counterId,
          counter: this.manager.getCounterForSync(this.counterId),
        })
      );
    }

    return newValue;
  }

  getValue() {
    return this.manager.getValue(this.counterId);
  }

  onUpdate(callback) {
    this.onUpdate = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Run examples
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PNCounter,
    DistributedCounterManager,
    RealtimeCounter,
  };
}

// Run examples if executed directly
if (typeof window !== 'undefined') {
  basicExample();
  likesCounterExample();
  shoppingCartExample();
  concurrentOperationsExample();
}
