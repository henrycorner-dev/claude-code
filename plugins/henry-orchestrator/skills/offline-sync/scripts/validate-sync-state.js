#!/usr/bin/env node

/**
 * Validate Sync State
 *
 * This script validates the sync state of a local database,
 * checking for inconsistencies, orphaned records, and sync metadata issues.
 */

const fs = require('fs');
const path = require('path');

class SyncStateValidator {
    constructor(db) {
        this.db = db;
        this.errors = [];
        this.warnings = [];
        this.stats = {};
    }

    /**
     * Run all validation checks
     */
    async validate() {
        console.log('=== Sync State Validation ===\n');

        await this.checkSyncMetadata();
        await this.checkDirtyFlags();
        await this.checkTimestamps();
        await this.checkVersioning();
        await this.checkSoftDeletes();
        await this.checkSyncLog();
        await this.checkOrphanedRecords();
        await this.calculateStats();

        this.printReport();

        return {
            valid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            stats: this.stats
        };
    }

    /**
     * Check sync metadata table
     */
    async checkSyncMetadata() {
        console.log('Checking sync metadata...');

        const requiredKeys = ['last_sync_at', 'device_id', 'sync_enabled'];

        for (const key of requiredKeys) {
            const metadata = await this.db.get('sync_metadata', key);

            if (!metadata) {
                this.errors.push(`Missing sync metadata: ${key}`);
            }
        }

        const lastSyncAt = await this.getLastSyncAt();

        if (lastSyncAt > Date.now()) {
            this.errors.push(`last_sync_at is in the future: ${new Date(lastSyncAt)}`);
        }

        console.log('  ✓ Sync metadata checked\n');
    }

    /**
     * Check dirty flags consistency
     */
    async checkDirtyFlags() {
        console.log('Checking dirty flags...');

        const tables = ['items', 'tasks', 'projects']; // Add your tables

        for (const table of tables) {
            try {
                const dirtyItems = await this.db.getAllFromIndex(table, 'dirty', true);

                for (const item of dirtyItems) {
                    // Check if dirty items have been synced recently
                    if (item.synced_at && item.synced_at > item.updated_at) {
                        this.warnings.push(
                            `${table}:${item.id} - dirty=true but synced_at (${item.synced_at}) > updated_at (${item.updated_at})`
                        );
                    }

                    // Check if dirty items have no updated_at
                    if (!item.updated_at) {
                        this.errors.push(`${table}:${item.id} - dirty=true but missing updated_at`);
                    }
                }

                console.log(`  ✓ ${table}: ${dirtyItems.length} dirty items`);
            } catch (error) {
                console.log(`  ⚠ ${table}: table not found`);
            }
        }

        console.log('');
    }

    /**
     * Check timestamp consistency
     */
    async checkTimestamps() {
        console.log('Checking timestamps...');

        const tables = ['items', 'tasks', 'projects'];

        for (const table of tables) {
            try {
                const items = await this.db.getAll(table);

                for (const item of items) {
                    // created_at should be <= updated_at
                    if (item.created_at > item.updated_at) {
                        this.errors.push(
                            `${table}:${item.id} - created_at (${item.created_at}) > updated_at (${item.updated_at})`
                        );
                    }

                    // synced_at should be <= current time
                    if (item.synced_at && item.synced_at > Date.now()) {
                        this.errors.push(`${table}:${item.id} - synced_at is in the future`);
                    }

                    // deleted_at should be >= created_at
                    if (item.deleted_at && item.deleted_at < item.created_at) {
                        this.errors.push(
                            `${table}:${item.id} - deleted_at (${item.deleted_at}) < created_at (${item.created_at})`
                        );
                    }
                }

                console.log(`  ✓ ${table}: ${items.length} items checked`);
            } catch (error) {
                console.log(`  ⚠ ${table}: table not found`);
            }
        }

        console.log('');
    }

    /**
     * Check version numbering
     */
    async checkVersioning() {
        console.log('Checking version numbers...');

        const tables = ['items', 'tasks', 'projects'];

        for (const table of tables) {
            try {
                const items = await this.db.getAll(table);

                for (const item of items) {
                    // Version should be >= 1
                    if (item.version < 1) {
                        this.errors.push(`${table}:${item.id} - invalid version: ${item.version}`);
                    }

                    // Dirty items should have higher version than synced items
                    if (item.dirty && item.synced_at && item.version < 1) {
                        this.warnings.push(
                            `${table}:${item.id} - dirty item with low version: ${item.version}`
                        );
                    }
                }

                console.log(`  ✓ ${table}: versions checked`);
            } catch (error) {
                console.log(`  ⚠ ${table}: table not found`);
            }
        }

        console.log('');
    }

    /**
     * Check soft deletes
     */
    async checkSoftDeletes() {
        console.log('Checking soft deletes...');

        const tables = ['items', 'tasks', 'projects'];

        for (const table of tables) {
            try {
                const items = await this.db.getAll(table);

                const deletedItems = items.filter(item => item.deleted_at !== null);

                for (const item of deletedItems) {
                    // Deleted items should be marked dirty
                    if (!item.dirty) {
                        this.warnings.push(
                            `${table}:${item.id} - deleted but not marked dirty`
                        );
                    }

                    // Deleted items should have updated_at >= deleted_at
                    if (item.updated_at < item.deleted_at) {
                        this.errors.push(
                            `${table}:${item.id} - updated_at < deleted_at`
                        );
                    }
                }

                console.log(`  ✓ ${table}: ${deletedItems.length} deleted items`);
            } catch (error) {
                console.log(`  ⚠ ${table}: table not found`);
            }
        }

        console.log('');
    }

    /**
     * Check sync log
     */
    async checkSyncLog() {
        console.log('Checking sync log...');

        try {
            const syncLogs = await this.db.getAll('sync_log');

            const unsyncedLogs = syncLogs.filter(log => !log.synced);

            for (const log of unsyncedLogs) {
                // Check if log has valid operation
                if (!['INSERT', 'UPDATE', 'DELETE'].includes(log.operation)) {
                    this.errors.push(
                        `sync_log:${log.id} - invalid operation: ${log.operation}`
                    );
                }

                // Check if log has valid timestamp
                if (!log.timestamp || log.timestamp > Date.now()) {
                    this.errors.push(
                        `sync_log:${log.id} - invalid timestamp: ${log.timestamp}`
                    );
                }
            }

            console.log(`  ✓ Sync log: ${syncLogs.length} entries (${unsyncedLogs.length} unsynced)`);
        } catch (error) {
            this.warnings.push('sync_log table not found');
        }

        console.log('');
    }

    /**
     * Check for orphaned records
     */
    async checkOrphanedRecords() {
        console.log('Checking for orphaned records...');

        // Check tasks with invalid project_id
        try {
            const tasks = await this.db.getAll('tasks');
            const projects = await this.db.getAll('projects');
            const projectIds = new Set(projects.map(p => p.id));

            for (const task of tasks) {
                if (task.project_id && !projectIds.has(task.project_id)) {
                    this.warnings.push(
                        `tasks:${task.id} - references non-existent project: ${task.project_id}`
                    );
                }
            }

            console.log(`  ✓ Checked task-project references`);
        } catch (error) {
            console.log(`  ⚠ Could not check task-project references`);
        }

        console.log('');
    }

    /**
     * Calculate statistics
     */
    async calculateStats() {
        console.log('Calculating statistics...');

        const tables = ['items', 'tasks', 'projects'];

        for (const table of tables) {
            try {
                const items = await this.db.getAll(table);

                const dirtyCount = items.filter(item => item.dirty).length;
                const deletedCount = items.filter(item => item.deleted_at !== null).length;
                const syncedCount = items.filter(item => item.synced_at !== null).length;

                this.stats[table] = {
                    total: items.length,
                    dirty: dirtyCount,
                    deleted: deletedCount,
                    synced: syncedCount,
                    clean: items.length - dirtyCount
                };
            } catch (error) {
                // Table doesn't exist
            }
        }

        console.log('');
    }

    /**
     * Print validation report
     */
    printReport() {
        console.log('=== Validation Report ===\n');

        // Errors
        if (this.errors.length > 0) {
            console.log('❌ ERRORS:');
            this.errors.forEach(error => console.log(`  - ${error}`));
            console.log('');
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
            console.log('');
        }

        // Stats
        if (Object.keys(this.stats).length > 0) {
            console.log('📊 STATISTICS:');
            for (const [table, stats] of Object.entries(this.stats)) {
                console.log(`  ${table}:`);
                console.log(`    Total: ${stats.total}`);
                console.log(`    Dirty: ${stats.dirty}`);
                console.log(`    Clean: ${stats.clean}`);
                console.log(`    Deleted: ${stats.deleted}`);
                console.log(`    Synced: ${stats.synced}`);
            }
            console.log('');
        }

        // Summary
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ All checks passed!');
        } else {
            console.log(`Found ${this.errors.length} errors and ${this.warnings.length} warnings`);
        }
    }

    /**
     * Get last sync timestamp
     */
    async getLastSyncAt() {
        const metadata = await this.db.get('sync_metadata', 'last_sync_at');
        return metadata ? parseInt(metadata.value) : 0;
    }
}

// Usage with IndexedDB
async function validateIndexedDB(dbName) {
    const { openDB } = require('idb');
    const db = await openDB(dbName);

    const validator = new SyncStateValidator(db);
    const result = await validator.validate();

    return result;
}

// Usage with SQLite (Node.js)
function validateSQLite(dbPath) {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });

    // Wrap SQLite in a compatible interface
    const dbWrapper = {
        async get(table, key) {
            const stmt = db.prepare(`SELECT * FROM ${table} WHERE key = ?`);
            return stmt.get(key);
        },
        async getAll(table) {
            const stmt = db.prepare(`SELECT * FROM ${table}`);
            return stmt.all();
        },
        async getAllFromIndex(table, index, value) {
            const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${index} = ?`);
            return stmt.all(value);
        }
    };

    const validator = new SyncStateValidator(dbWrapper);
    return validator.validate();
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node validate-sync-state.js <db-path>');
        console.log('  node validate-sync-state.js --indexeddb <db-name>');
        process.exit(1);
    }

    if (args[0] === '--indexeddb') {
        validateIndexedDB(args[1]).then(result => {
            process.exit(result.valid ? 0 : 1);
        });
    } else {
        validateSQLite(args[0]).then(result => {
            process.exit(result.valid ? 0 : 1);
        });
    }
}

module.exports = {
    SyncStateValidator,
    validateIndexedDB,
    validateSQLite
};
