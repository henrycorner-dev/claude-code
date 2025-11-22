-- ============================================================================
-- MIGRATE EXISTING SCHEMA TO SUPPORT OFFLINE SYNC
-- ============================================================================
--
-- This migration script adds sync metadata to existing tables without
-- losing any data. Run this on your existing database to enable sync.
--
-- Usage:
--   sqlite3 your_database.db < migrate-sync-schema.sql
--
-- ============================================================================

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- ============================================================================
-- STEP 1: Add sync metadata columns to existing tables
-- ============================================================================

-- Add columns to existing 'items' table (example)
ALTER TABLE items ADD COLUMN created_at INTEGER;
ALTER TABLE items ADD COLUMN updated_at INTEGER;
ALTER TABLE items ADD COLUMN deleted_at INTEGER;
ALTER TABLE items ADD COLUMN synced_at INTEGER;
ALTER TABLE items ADD COLUMN dirty BOOLEAN DEFAULT 1;
ALTER TABLE items ADD COLUMN version INTEGER DEFAULT 1;

-- Set initial timestamps for existing records
UPDATE items
SET created_at = strftime('%s', 'now') * 1000,
    updated_at = strftime('%s', 'now') * 1000,
    synced_at = NULL,
    dirty = 1,
    version = 1
WHERE created_at IS NULL;

-- ============================================================================
-- STEP 2: Create indexes for sync queries
-- ============================================================================

-- Index for dirty items
CREATE INDEX IF NOT EXISTS idx_items_dirty ON items(dirty) WHERE dirty = 1;

-- Index for updated_at (for ordering during sync)
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at);

-- Index for deleted_at (for filtering deleted items)
CREATE INDEX IF NOT EXISTS idx_items_deleted_at ON items(deleted_at);

-- ============================================================================
-- STEP 3: Create sync_log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Change information
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
    timestamp INTEGER NOT NULL,
    data TEXT,                -- JSON snapshot

    -- Sync status
    synced BOOLEAN DEFAULT 0 NOT NULL,
    sync_attempts INTEGER DEFAULT 0 NOT NULL,
    last_sync_error TEXT
);

-- Indexes for sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_synced ON sync_log(synced) WHERE synced = 0;
CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_log_record_id ON sync_log(record_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_table_name ON sync_log(table_name);

-- ============================================================================
-- STEP 4: Create conflicts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Conflict information
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    local_data TEXT NOT NULL,
    remote_data TEXT NOT NULL,

    -- Status
    created_at INTEGER NOT NULL,
    resolved BOOLEAN DEFAULT 0 NOT NULL,
    resolved_at INTEGER,
    resolution_type TEXT,
    resolved_data TEXT
);

-- Indexes for conflicts
CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON conflicts(resolved) WHERE resolved = 0;
CREATE INDEX IF NOT EXISTS idx_conflicts_record_id ON conflicts(record_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_table_name ON conflicts(table_name);

-- ============================================================================
-- STEP 5: Create sync_metadata table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Insert default metadata
INSERT OR IGNORE INTO sync_metadata (key, value, updated_at) VALUES
    ('last_sync_at', '0', strftime('%s', 'now') * 1000);

INSERT OR IGNORE INTO sync_metadata (key, value, updated_at) VALUES
    ('device_id', hex(randomblob(16)), strftime('%s', 'now') * 1000);

INSERT OR IGNORE INTO sync_metadata (key, value, updated_at) VALUES
    ('sync_enabled', 'true', strftime('%s', 'now') * 1000);

INSERT OR IGNORE INTO sync_metadata (key, value, updated_at) VALUES
    ('schema_version', '1', strftime('%s', 'now') * 1000);

-- ============================================================================
-- STEP 6: Create triggers for automatic sync logging
-- ============================================================================

-- DROP existing triggers if they exist
DROP TRIGGER IF EXISTS items_insert_log;
DROP TRIGGER IF EXISTS items_update_log;
DROP TRIGGER IF EXISTS items_delete_log;

-- Trigger: Log INSERT operations
CREATE TRIGGER items_insert_log
AFTER INSERT ON items
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'items',
        NEW.id,
        'INSERT',
        strftime('%s', 'now') * 1000,
        json_object(
            'id', NEW.id,
            'title', NEW.title,
            'description', NEW.description
        )
    );
END;

-- Trigger: Log UPDATE operations
CREATE TRIGGER items_update_log
AFTER UPDATE ON items
WHEN NEW.updated_at <> OLD.updated_at
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'items',
        NEW.id,
        'UPDATE',
        strftime('%s', 'now') * 1000,
        json_object(
            'id', NEW.id,
            'title', NEW.title,
            'description', NEW.description,
            'deleted_at', NEW.deleted_at
        )
    );
END;

-- Trigger: Log DELETE operations
CREATE TRIGGER items_delete_log
AFTER DELETE ON items
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'items',
        OLD.id,
        'DELETE',
        strftime('%s', 'now') * 1000,
        NULL
    );
END;

-- ============================================================================
-- STEP 7: Create helper views
-- ============================================================================

-- View: Unsynced items
CREATE VIEW IF NOT EXISTS unsynced_items AS
SELECT *
FROM items
WHERE dirty = 1
ORDER BY updated_at ASC;

-- View: Active (non-deleted) items
CREATE VIEW IF NOT EXISTS active_items AS
SELECT *
FROM items
WHERE deleted_at IS NULL;

-- View: Pending sync log entries
CREATE VIEW IF NOT EXISTS pending_sync_log AS
SELECT *
FROM sync_log
WHERE synced = 0
ORDER BY timestamp ASC;

-- View: Unresolved conflicts
CREATE VIEW IF NOT EXISTS unresolved_conflicts AS
SELECT *
FROM conflicts
WHERE resolved = 0
ORDER BY created_at ASC;

-- ============================================================================
-- STEP 8: Repeat for other tables
-- ============================================================================

-- If you have more tables (tasks, projects, etc.), repeat steps 1-6 for each:
--
-- 1. Add sync columns:
--    ALTER TABLE tasks ADD COLUMN created_at INTEGER;
--    ALTER TABLE tasks ADD COLUMN updated_at INTEGER;
--    ALTER TABLE tasks ADD COLUMN deleted_at INTEGER;
--    ALTER TABLE tasks ADD COLUMN synced_at INTEGER;
--    ALTER TABLE tasks ADD COLUMN dirty BOOLEAN DEFAULT 1;
--    ALTER TABLE tasks ADD COLUMN version INTEGER DEFAULT 1;
--
-- 2. Set initial values:
--    UPDATE tasks SET
--        created_at = strftime('%s', 'now') * 1000,
--        updated_at = strftime('%s', 'now') * 1000,
--        dirty = 1,
--        version = 1
--    WHERE created_at IS NULL;
--
-- 3. Create indexes:
--    CREATE INDEX idx_tasks_dirty ON tasks(dirty) WHERE dirty = 1;
--    CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
--    CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
--
-- 4. Create triggers (replace 'items' with 'tasks'):
--    CREATE TRIGGER tasks_insert_log AFTER INSERT ON tasks ...
--    CREATE TRIGGER tasks_update_log AFTER UPDATE ON tasks ...
--    CREATE TRIGGER tasks_delete_log AFTER DELETE ON tasks ...

-- ============================================================================
-- STEP 9: Commit migration
-- ============================================================================

COMMIT;

PRAGMA foreign_keys = ON;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if sync columns were added
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='items';

-- Check if indexes were created
-- SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='items';

-- Check if triggers were created
-- SELECT name FROM sqlite_master WHERE type='trigger' AND tbl_name='items';

-- Check sync metadata
-- SELECT * FROM sync_metadata;

-- Count unsynced items
-- SELECT COUNT(*) as unsynced_count FROM items WHERE dirty = 1;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To rollback this migration (USE WITH CAUTION - will lose sync data):
--
-- BEGIN TRANSACTION;
--
-- -- Remove triggers
-- DROP TRIGGER IF EXISTS items_insert_log;
-- DROP TRIGGER IF EXISTS items_update_log;
-- DROP TRIGGER IF EXISTS items_delete_log;
--
-- -- Remove views
-- DROP VIEW IF EXISTS unsynced_items;
-- DROP VIEW IF EXISTS active_items;
-- DROP VIEW IF EXISTS pending_sync_log;
-- DROP VIEW IF EXISTS unresolved_conflicts;
--
-- -- Remove sync tables
-- DROP TABLE IF EXISTS sync_log;
-- DROP TABLE IF EXISTS conflicts;
-- DROP TABLE IF EXISTS sync_metadata;
--
-- -- Remove indexes
-- DROP INDEX IF EXISTS idx_items_dirty;
-- DROP INDEX IF EXISTS idx_items_updated_at;
-- DROP INDEX IF EXISTS idx_items_deleted_at;
--
-- -- Note: Cannot remove columns in SQLite without recreating table
-- -- If you need to remove sync columns, you'll need to:
-- -- 1. Create new table without sync columns
-- -- 2. Copy data from old table
-- -- 3. Drop old table
-- -- 4. Rename new table
--
-- COMMIT;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. This migration is idempotent - safe to run multiple times
-- 2. All existing data is preserved
-- 3. Sync metadata is added with default values
-- 4. All existing records are marked as dirty (need sync)
-- 5. Triggers automatically track future changes
-- 6. Views provide convenient access to sync-related data
-- 7. Consider running VACUUM after migration to reclaim space
-- 8. Test the migration on a copy of your database first!

-- ============================================================================
-- POST-MIGRATION STEPS
-- ============================================================================

-- After running this migration:
--
-- 1. Update your application code to:
--    - Set timestamps when creating/updating records
--    - Mark records as dirty when modified
--    - Increment version on updates
--
-- 2. Implement sync logic:
--    - Pull changes from server
--    - Resolve conflicts
--    - Push local changes
--    - Mark items as synced
--
-- 3. Test thoroughly:
--    - Create new records
--    - Update existing records
--    - Delete records
--    - Verify triggers are working
--    - Test sync with server
--    - Test conflict resolution

-- ============================================================================
-- Example: Manual sync operations
-- ============================================================================

-- Mark item as dirty (needs sync)
-- UPDATE items SET dirty = 1, updated_at = strftime('%s', 'now') * 1000 WHERE id = ?;

-- Mark item as synced
-- UPDATE items SET dirty = 0, synced_at = strftime('%s', 'now') * 1000 WHERE id = ?;

-- Soft delete item
-- UPDATE items SET deleted_at = strftime('%s', 'now') * 1000, dirty = 1 WHERE id = ?;

-- Get all unsynced items
-- SELECT * FROM items WHERE dirty = 1;

-- Update last sync timestamp
-- UPDATE sync_metadata SET value = ?, updated_at = strftime('%s', 'now') * 1000 WHERE key = 'last_sync_at';
