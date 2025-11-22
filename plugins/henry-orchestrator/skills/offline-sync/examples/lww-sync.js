/**
 * Last-Write-Wins (LWW) Sync Implementation Example
 *
 * This example demonstrates a complete LWW sync implementation
 * with IndexedDB for web applications.
 */

import { openDB } from 'idb';

class LWWSyncManager {
    constructor(apiUrl, authToken) {
        this.apiUrl = apiUrl;
        this.authToken = authToken;
        this.dbName = 'LWWSyncDB';
        this.dbVersion = 1;
    }

    async initDatabase() {
        return await openDB(this.dbName, this.dbVersion, {
            upgrade(db) {
                // Items store
                const itemsStore = db.createObjectStore('items', { keyPath: 'id' });
                itemsStore.createIndex('dirty', 'dirty');
                itemsStore.createIndex('updated_at', 'updated_at');
                itemsStore.createIndex('deleted_at', 'deleted_at');

                // Sync metadata store
                db.createObjectStore('sync_metadata', { keyPath: 'key' });
            }
        });
    }

    // CREATE
    async createItem(title, description) {
        const db = await this.initDatabase();

        const id = this.generateUUID();
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

        // Trigger sync
        await this.syncInBackground();

        return item;
    }

    // READ
    async getItems() {
        const db = await this.initDatabase();
        const items = await db.getAll('items');

        // Filter out deleted items
        return items.filter(item => !item.deleted_at);
    }

    async getItem(id) {
        const db = await this.initDatabase();
        return await db.get('items', id);
    }

    // UPDATE
    async updateItem(id, updates) {
        const db = await this.initDatabase();

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

        // Trigger sync
        await this.syncInBackground();

        return updatedItem;
    }

    // DELETE (soft delete)
    async deleteItem(id) {
        const db = await this.initDatabase();

        const item = await db.get('items', id);
        if (!item) throw new Error('Item not found');

        const deletedItem = {
            ...item,
            deleted_at: Date.now(),
            updated_at: Date.now(),
            dirty: true
        };

        await db.put('items', deletedItem);

        // Trigger sync
        await this.syncInBackground();

        return deletedItem;
    }

    // SYNC
    async sync() {
        console.log('Starting LWW sync...');

        try {
            // 1. Pull remote changes
            await this.pullChanges();

            // 2. Push local changes
            await this.pushChanges();

            console.log('LWW sync completed successfully');
            return { success: true };
        } catch (error) {
            console.error('LWW sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    async pullChanges() {
        const lastSyncAt = await this.getLastSyncAt();

        const response = await fetch(`${this.apiUrl}/sync/pull?since=${lastSyncAt}`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Pull failed: ${response.status}`);
        }

        const { items, timestamp } = await response.json();

        const db = await this.initDatabase();
        const tx = db.transaction('items', 'readwrite');
        const store = tx.objectStore('items');

        for (const remoteItem of items) {
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
                await this.resolveConflictLWW(store, localItem, remoteItem);
            } else {
                // No conflict: update local with remote
                await store.put({
                    ...remoteItem,
                    synced_at: Date.now(),
                    dirty: false
                });
            }
        }

        await tx.done;
        await this.updateLastSyncAt(timestamp);

        console.log(`Pulled ${items.length} items from server`);
    }

    async pushChanges() {
        const db = await this.initDatabase();
        const unsyncedItems = await db.getAllFromIndex('items', 'dirty', IDBKeyRange.only(true));

        if (unsyncedItems.length === 0) {
            console.log('No items to push');
            return;
        }

        const response = await fetch(`${this.apiUrl}/sync/push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            },
            body: JSON.stringify({ items: unsyncedItems })
        });

        if (!response.ok) {
            throw new Error(`Push failed: ${response.status}`);
        }

        const { accepted, conflicts } = await response.json();

        const tx = db.transaction('items', 'readwrite');
        const store = tx.objectStore('items');

        // Mark accepted items as synced
        for (const id of accepted) {
            const item = await store.get(id);
            if (item) {
                item.dirty = false;
                item.synced_at = Date.now();
                await store.put(item);
            }
        }

        // Handle server conflicts
        for (const conflict of conflicts) {
            await this.resolveConflictLWW(store, conflict.local, conflict.remote);
        }

        await tx.done;

        console.log(`Pushed ${accepted.length} items to server`);
    }

    async resolveConflictLWW(store, localItem, remoteItem) {
        console.log(`Conflict detected for item ${localItem.id}`);

        if (remoteItem.updated_at > localItem.updated_at) {
            // Remote is newer, accept remote
            await store.put({
                ...remoteItem,
                synced_at: Date.now(),
                dirty: false
            });
            console.log(`  -> Resolved: Accepted remote (newer timestamp)`);
        } else {
            // Local is newer or equal, keep local (will be pushed)
            console.log(`  -> Resolved: Keeping local (newer or equal timestamp)`);
        }
    }

    // BACKGROUND SYNC
    async syncInBackground() {
        if ('serviceWorker' in navigator && 'sync' in (await navigator.serviceWorker.ready)) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('lww-sync');
            } catch (error) {
                console.error('Background sync registration failed:', error);
                // Fallback to immediate sync
                await this.sync();
            }
        } else {
            // Background sync not supported
            await this.sync();
        }
    }

    // HELPERS
    async getLastSyncAt() {
        const db = await this.initDatabase();
        const metadata = await db.get('sync_metadata', 'last_sync_at');
        return metadata?.value || 0;
    }

    async updateLastSyncAt(timestamp) {
        const db = await this.initDatabase();
        await db.put('sync_metadata', {
            key: 'last_sync_at',
            value: timestamp
        });
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// USAGE EXAMPLE
async function main() {
    const syncManager = new LWWSyncManager('https://api.example.com', 'auth-token');

    // Create item
    const item = await syncManager.createItem('Task 1', 'Description');
    console.log('Created item:', item);

    // Update item
    await syncManager.updateItem(item.id, { title: 'Updated Task 1' });
    console.log('Updated item');

    // Get all items
    const items = await syncManager.getItems();
    console.log('All items:', items);

    // Delete item
    await syncManager.deleteItem(item.id);
    console.log('Deleted item');

    // Manual sync
    await syncManager.sync();
}

// Monitor network status
window.addEventListener('online', async () => {
    console.log('Back online, syncing...');
    const syncManager = new LWWSyncManager('https://api.example.com', 'auth-token');
    await syncManager.sync();
});

export default LWWSyncManager;
