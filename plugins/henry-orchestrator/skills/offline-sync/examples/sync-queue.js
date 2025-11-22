/**
 * Sync Queue with Retry Logic Example
 *
 * This example demonstrates a robust sync queue that handles:
 * - Exponential backoff retry
 * - Partial success handling
 * - Network status monitoring
 * - Priority-based syncing
 */

class SyncQueue {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl;
        this.authToken = config.authToken;
        this.maxRetries = config.maxRetries || 5;
        this.initialRetryDelay = config.initialRetryDelay || 1000;
        this.maxRetryDelay = config.maxRetryDelay || 60000;
        this.batchSize = config.batchSize || 10;

        this.queue = [];
        this.isSyncing = false;
        this.retryAttempts = new Map();

        this.initNetworkMonitoring();
    }

    /**
     * Add item to sync queue
     */
    enqueue(item, priority = 0) {
        const queueItem = {
            id: item.id || this.generateId(),
            data: item,
            priority,
            addedAt: Date.now(),
            retries: 0
        };

        this.queue.push(queueItem);

        // Sort by priority (higher priority first)
        this.queue.sort((a, b) => b.priority - a.priority);

        console.log(`Enqueued item ${queueItem.id} (priority: ${priority})`);

        // Trigger sync if not already syncing
        if (!this.isSyncing) {
            this.processQueue();
        }

        return queueItem.id;
    }

    /**
     * Process sync queue
     */
    async processQueue() {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        if (this.queue.length === 0) {
            console.log('Queue is empty');
            return;
        }

        if (!navigator.onLine) {
            console.log('Offline, waiting for network');
            return;
        }

        this.isSyncing = true;

        console.log(`Processing queue: ${this.queue.length} items`);

        while (this.queue.length > 0) {
            // Get batch of items
            const batch = this.queue.slice(0, this.batchSize);

            try {
                await this.syncBatch(batch);

                // Remove successfully synced items
                this.queue = this.queue.slice(batch.length);

                // Reset retry attempts
                batch.forEach(item => this.retryAttempts.delete(item.id));

            } catch (error) {
                console.error('Batch sync failed:', error);

                // Handle failed items
                for (const item of batch) {
                    await this.handleFailedItem(item, error);
                }

                break; // Stop processing if batch fails
            }
        }

        this.isSyncing = false;

        // Process remaining items if any
        if (this.queue.length > 0) {
            setTimeout(() => this.processQueue(), this.getRetryDelay());
        }
    }

    /**
     * Sync a batch of items
     */
    async syncBatch(batch) {
        console.log(`Syncing batch of ${batch.length} items...`);

        const items = batch.map(item => item.data);

        const response = await fetch(`${this.apiUrl}/sync/push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            },
            body: JSON.stringify({ items })
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }

        const result = await response.json();

        console.log(`Batch synced: ${result.accepted?.length || 0} accepted`);

        // Handle partial success
        if (result.failed && result.failed.length > 0) {
            console.warn(`${result.failed.length} items failed`);

            // Re-queue failed items
            for (const failedId of result.failed) {
                const item = batch.find(i => i.data.id === failedId);
                if (item) {
                    await this.handleFailedItem(item, new Error('Item rejected by server'));
                }
            }
        }

        return result;
    }

    /**
     * Handle failed sync item
     */
    async handleFailedItem(item, error) {
        item.retries++;

        const currentRetries = this.retryAttempts.get(item.id) || 0;

        if (currentRetries >= this.maxRetries) {
            console.error(`Item ${item.id} exceeded max retries, moving to failed queue`);
            await this.moveToFailedQueue(item, error);
            // Remove from main queue
            this.queue = this.queue.filter(i => i.id !== item.id);
        } else {
            this.retryAttempts.set(item.id, currentRetries + 1);
            console.log(`Will retry item ${item.id} (attempt ${currentRetries + 1}/${this.maxRetries})`);
        }
    }

    /**
     * Move permanently failed items to separate queue
     */
    async moveToFailedQueue(item, error) {
        const failedItem = {
            ...item,
            failedAt: Date.now(),
            error: error.message
        };

        // Store in IndexedDB or localStorage
        const failedQueue = JSON.parse(localStorage.getItem('failed_sync_queue') || '[]');
        failedQueue.push(failedItem);
        localStorage.setItem('failed_sync_queue', JSON.stringify(failedQueue));

        console.log(`Item ${item.id} moved to failed queue`);
    }

    /**
     * Get retry delay with exponential backoff
     */
    getRetryDelay() {
        const maxRetryCount = Math.max(...Array.from(this.retryAttempts.values()));
        const delay = Math.min(
            this.initialRetryDelay * Math.pow(2, maxRetryCount),
            this.maxRetryDelay
        );

        console.log(`Next retry in ${delay}ms`);
        return delay;
    }

    /**
     * Initialize network status monitoring
     */
    initNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('Network online, resuming sync');
            this.processQueue();
        });

        window.addEventListener('offline', () => {
            console.log('Network offline, pausing sync');
            this.isSyncing = false;
        });
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            queueSize: this.queue.length,
            isSyncing: this.isSyncing,
            isOnline: navigator.onLine,
            retryAttempts: Object.fromEntries(this.retryAttempts)
        };
    }

    /**
     * Clear queue
     */
    clear() {
        this.queue = [];
        this.retryAttempts.clear();
        console.log('Queue cleared');
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Advanced Sync Queue with Persistence
 */
class PersistentSyncQueue extends SyncQueue {
    constructor(config = {}) {
        super(config);
        this.dbName = 'SyncQueueDB';
        this.dbVersion = 1;
        this.loadQueue();
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Queue store
                const queueStore = db.createObjectStore('queue', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                queueStore.createIndex('priority', 'priority', { unique: false });
                queueStore.createIndex('addedAt', 'addedAt', { unique: false });

                // Failed items store
                const failedStore = db.createObjectStore('failed_queue', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                failedStore.createIndex('failedAt', 'failedAt', { unique: false });
            };
        });
    }

    async loadQueue() {
        const db = await this.initDatabase();
        const tx = db.transaction('queue', 'readonly');
        const store = tx.objectStore('queue');

        const request = store.getAll();

        request.onsuccess = () => {
            this.queue = request.result;
            console.log(`Loaded ${this.queue.length} items from persistent queue`);
        };
    }

    async enqueue(item, priority = 0) {
        const queueItem = {
            id: item.id || this.generateId(),
            data: item,
            priority,
            addedAt: Date.now(),
            retries: 0
        };

        // Persist to IndexedDB
        const db = await this.initDatabase();
        const tx = db.transaction('queue', 'readwrite');
        await tx.objectStore('queue').add(queueItem);

        // Add to in-memory queue
        this.queue.push(queueItem);
        this.queue.sort((a, b) => b.priority - a.priority);

        console.log(`Enqueued and persisted item ${queueItem.id}`);

        if (!this.isSyncing) {
            this.processQueue();
        }

        return queueItem.id;
    }

    async syncBatch(batch) {
        // Call parent syncBatch
        const result = await super.syncBatch(batch);

        // Remove synced items from IndexedDB
        const db = await this.initDatabase();
        const tx = db.transaction('queue', 'readwrite');
        const store = tx.objectStore('queue');

        for (const item of batch) {
            await store.delete(item.id);
        }

        return result;
    }

    async moveToFailedQueue(item, error) {
        const failedItem = {
            ...item,
            failedAt: Date.now(),
            error: error.message
        };

        // Persist to IndexedDB failed queue
        const db = await this.initDatabase();
        const tx = db.transaction(['queue', 'failed_queue'], 'readwrite');

        // Remove from main queue
        await tx.objectStore('queue').delete(item.id);

        // Add to failed queue
        await tx.objectStore('failed_queue').add(failedItem);

        console.log(`Item ${item.id} moved to persistent failed queue`);
    }

    async getFailedItems() {
        const db = await this.initDatabase();
        const tx = db.transaction('failed_queue', 'readonly');
        const store = tx.objectStore('failed_queue');

        return new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    }

    async retryFailedItems() {
        const failedItems = await this.getFailedItems();

        console.log(`Retrying ${failedItems.length} failed items`);

        for (const item of failedItems) {
            // Reset retries
            item.retries = 0;
            this.retryAttempts.delete(item.id);

            // Re-enqueue
            await this.enqueue(item.data, item.priority);

            // Remove from failed queue
            const db = await this.initDatabase();
            const tx = db.transaction('failed_queue', 'readwrite');
            await tx.objectStore('failed_queue').delete(item.id);
        }
    }
}

// USAGE EXAMPLES

// Example 1: Basic sync queue
async function basicExample() {
    console.log('=== Basic Sync Queue Example ===');

    const queue = new SyncQueue({
        apiUrl: 'https://api.example.com',
        authToken: 'auth-token',
        maxRetries: 3,
        initialRetryDelay: 1000,
        batchSize: 5
    });

    // Add items to queue
    queue.enqueue({ id: '1', title: 'Item 1' });
    queue.enqueue({ id: '2', title: 'Item 2' }, 10); // High priority
    queue.enqueue({ id: '3', title: 'Item 3' });

    // Check status
    console.log('Queue status:', queue.getStatus());
}

// Example 2: Priority-based syncing
async function priorityExample() {
    console.log('=== Priority-Based Sync Example ===');

    const queue = new SyncQueue({
        apiUrl: 'https://api.example.com',
        authToken: 'auth-token'
    });

    // Normal priority
    queue.enqueue({ id: '1', title: 'Normal task' }, 0);

    // High priority (syncs first)
    queue.enqueue({ id: '2', title: 'Critical update' }, 100);

    // Low priority
    queue.enqueue({ id: '3', title: 'Background task' }, -10);
}

// Example 3: Persistent sync queue
async function persistentExample() {
    console.log('=== Persistent Sync Queue Example ===');

    const queue = new PersistentSyncQueue({
        apiUrl: 'https://api.example.com',
        authToken: 'auth-token'
    });

    // Add items - persisted to IndexedDB
    await queue.enqueue({ id: '1', title: 'Persistent item 1' });
    await queue.enqueue({ id: '2', title: 'Persistent item 2' });

    // Queue survives page refresh
    console.log('Queue status:', queue.getStatus());

    // Retry failed items
    // await queue.retryFailedItems();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SyncQueue,
        PersistentSyncQueue
    };
}
