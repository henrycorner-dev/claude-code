-- SQLite Schema with Sync Metadata
-- This schema includes all necessary fields and indexes for offline sync

-- ============================================================================
-- DROP EXISTING TABLES (for clean setup)
-- ============================================================================

DROP TABLE IF EXISTS sync_log;
DROP TABLE IF EXISTS conflicts;
DROP TABLE IF EXISTS sync_metadata;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS user_profiles;

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

CREATE TABLE user_profiles (
    -- Primary key (UUID for distributed IDs)
    id TEXT PRIMARY KEY NOT NULL,

    -- Business data
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    preferences TEXT, -- JSON string

    -- Sync metadata
    created_at INTEGER NOT NULL,     -- Unix timestamp (milliseconds)
    updated_at INTEGER NOT NULL,     -- Unix timestamp (milliseconds)
    deleted_at INTEGER,               -- Soft delete timestamp
    synced_at INTEGER,                -- Last successful sync timestamp
    dirty BOOLEAN DEFAULT 1 NOT NULL, -- Has unsynced changes
    version INTEGER DEFAULT 1 NOT NULL -- Version counter for conflicts
);

-- Indexes for sync queries
CREATE INDEX idx_user_profiles_dirty ON user_profiles(dirty) WHERE dirty = 1;
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at);
CREATE INDEX idx_user_profiles_deleted_at ON user_profiles(deleted_at);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE projects (
    -- Primary key
    id TEXT PRIMARY KEY NOT NULL,

    -- Business data
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL,
    color TEXT,
    icon TEXT,

    -- Sync metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    synced_at INTEGER,
    dirty BOOLEAN DEFAULT 1 NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,

    -- Foreign keys
    FOREIGN KEY (owner_id) REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_projects_dirty ON projects(dirty) WHERE dirty = 1;
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

CREATE TABLE tasks (
    -- Primary key
    id TEXT PRIMARY KEY NOT NULL,

    -- Business data
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT 0 NOT NULL,
    due_date INTEGER,
    owner_id TEXT NOT NULL,
    project_id TEXT,

    -- Sync metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    synced_at INTEGER,
    dirty BOOLEAN DEFAULT 1 NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,

    -- Foreign keys
    FOREIGN KEY (owner_id) REFERENCES user_profiles(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Indexes
CREATE INDEX idx_tasks_dirty ON tasks(dirty) WHERE dirty = 1;
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- ============================================================================
-- SYNC LOG TABLE
-- Track all changes for delta sync
-- ============================================================================

CREATE TABLE sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Change information
    table_name TEXT NOT NULL,        -- Table that was modified
    record_id TEXT NOT NULL,         -- ID of the modified record
    operation TEXT NOT NULL,         -- 'INSERT', 'UPDATE', 'DELETE'
    timestamp INTEGER NOT NULL,      -- When the change occurred
    data TEXT,                       -- JSON snapshot of changed data

    -- Sync status
    synced BOOLEAN DEFAULT 0 NOT NULL,
    sync_attempts INTEGER DEFAULT 0 NOT NULL,
    last_sync_error TEXT
);

-- Indexes for sync log
CREATE INDEX idx_sync_log_synced ON sync_log(synced) WHERE synced = 0;
CREATE INDEX idx_sync_log_timestamp ON sync_log(timestamp);
CREATE INDEX idx_sync_log_record_id ON sync_log(record_id);
CREATE INDEX idx_sync_log_table_name ON sync_log(table_name);

-- ============================================================================
-- CONFLICTS TABLE
-- Store conflicts for user resolution
-- ============================================================================

CREATE TABLE conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Conflict information
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    local_data TEXT NOT NULL,     -- JSON of local version
    remote_data TEXT NOT NULL,    -- JSON of remote version

    -- Status
    created_at INTEGER NOT NULL,
    resolved BOOLEAN DEFAULT 0 NOT NULL,
    resolved_at INTEGER,
    resolution_type TEXT,         -- 'local', 'remote', 'custom'
    resolved_data TEXT            -- JSON of resolved data
);

-- Indexes for conflicts
CREATE INDEX idx_conflicts_resolved ON conflicts(resolved) WHERE resolved = 0;
CREATE INDEX idx_conflicts_record_id ON conflicts(record_id);
CREATE INDEX idx_conflicts_table_name ON conflicts(table_name);

-- ============================================================================
-- SYNC METADATA TABLE
-- Store sync state and configuration
-- ============================================================================

CREATE TABLE sync_metadata (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Insert default metadata
INSERT INTO sync_metadata (key, value, updated_at) VALUES
    ('last_sync_at', '0', strftime('%s', 'now') * 1000),
    ('device_id', '', strftime('%s', 'now') * 1000),
    ('sync_enabled', 'true', strftime('%s', 'now') * 1000),
    ('schema_version', '1', strftime('%s', 'now') * 1000);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC SYNC LOG
-- ============================================================================

-- Tasks: Log INSERT
CREATE TRIGGER tasks_insert_log
AFTER INSERT ON tasks
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'tasks',
        NEW.id,
        'INSERT',
        strftime('%s', 'now') * 1000,
        json_object(
            'id', NEW.id,
            'title', NEW.title,
            'description', NEW.description,
            'status', NEW.status,
            'priority', NEW.priority,
            'completed', NEW.completed,
            'owner_id', NEW.owner_id,
            'project_id', NEW.project_id
        )
    );
END;

-- Tasks: Log UPDATE
CREATE TRIGGER tasks_update_log
AFTER UPDATE ON tasks
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'tasks',
        NEW.id,
        'UPDATE',
        strftime('%s', 'now') * 1000,
        json_object(
            'id', NEW.id,
            'title', NEW.title,
            'description', NEW.description,
            'status', NEW.status,
            'priority', NEW.priority,
            'completed', NEW.completed,
            'owner_id', NEW.owner_id,
            'project_id', NEW.project_id,
            'deleted_at', NEW.deleted_at
        )
    );
END;

-- Tasks: Log DELETE
CREATE TRIGGER tasks_delete_log
AFTER DELETE ON tasks
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'tasks',
        OLD.id,
        'DELETE',
        strftime('%s', 'now') * 1000,
        NULL
    );
END;

-- Projects: Log INSERT
CREATE TRIGGER projects_insert_log
AFTER INSERT ON projects
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'projects',
        NEW.id,
        'INSERT',
        strftime('%s', 'now') * 1000,
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'owner_id', NEW.owner_id
        )
    );
END;

-- Projects: Log UPDATE
CREATE TRIGGER projects_update_log
AFTER UPDATE ON projects
BEGIN
    INSERT INTO sync_log (table_name, record_id, operation, timestamp, data)
    VALUES (
        'projects',
        NEW.id,
        'UPDATE',
        strftime('%s', 'now') * 1000,
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'owner_id', NEW.owner_id,
            'deleted_at', NEW.deleted_at
        )
    );
END;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Active (non-deleted) tasks
CREATE VIEW active_tasks AS
SELECT *
FROM tasks
WHERE deleted_at IS NULL;

-- View: Unsynced items (across all tables)
CREATE VIEW unsynced_items AS
SELECT 'tasks' AS table_name, id, updated_at, version
FROM tasks
WHERE dirty = 1
UNION ALL
SELECT 'projects' AS table_name, id, updated_at, version
FROM projects
WHERE dirty = 1
UNION ALL
SELECT 'user_profiles' AS table_name, id, updated_at, version
FROM user_profiles
WHERE dirty = 1
ORDER BY updated_at ASC;

-- View: Pending sync log entries
CREATE VIEW pending_sync_log AS
SELECT *
FROM sync_log
WHERE synced = 0
ORDER BY timestamp ASC;

-- View: Unresolved conflicts
CREATE VIEW unresolved_conflicts AS
SELECT *
FROM conflicts
WHERE resolved = 0
ORDER BY created_at ASC;

-- ============================================================================
-- UTILITY FUNCTIONS (stored as commented SQL for reference)
-- ============================================================================

-- Generate UUID v4 (requires application code)
-- Example in JavaScript:
-- function generateUUID() {
--     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
--         const r = Math.random() * 16 | 0;
--         const v = c === 'x' ? r : (r & 0x3 | 0x8);
--         return v.toString(16);
--     });
-- }

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample user profile
INSERT INTO user_profiles (
    id, user_id, display_name, email,
    created_at, updated_at, dirty, version
) VALUES (
    'user-uuid-123',
    'user-123',
    'John Doe',
    'john@example.com',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000,
    1,
    1
);

-- Insert sample project
INSERT INTO projects (
    id, name, description, owner_id,
    created_at, updated_at, dirty, version
) VALUES (
    'project-uuid-456',
    'My Project',
    'Project description',
    'user-uuid-123',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000,
    1,
    1
);

-- Insert sample tasks
INSERT INTO tasks (
    id, title, description, status, priority, owner_id, project_id,
    created_at, updated_at, dirty, version
) VALUES
    (
        'task-uuid-1',
        'Task 1',
        'First task',
        'pending',
        1,
        'user-uuid-123',
        'project-uuid-456',
        strftime('%s', 'now') * 1000,
        strftime('%s', 'now') * 1000,
        1,
        1
    ),
    (
        'task-uuid-2',
        'Task 2',
        'Second task',
        'in_progress',
        2,
        'user-uuid-123',
        'project-uuid-456',
        strftime('%s', 'now') * 1000,
        strftime('%s', 'now') * 1000,
        1,
        1
    ),
    (
        'task-uuid-3',
        'Task 3',
        'Third task',
        'done',
        0,
        'user-uuid-123',
        NULL,
        strftime('%s', 'now') * 1000,
        strftime('%s', 'now') * 1000,
        1,
        1
    );

-- ============================================================================
-- QUERIES FOR SYNC OPERATIONS
-- ============================================================================

-- Get all unsynced items for push
-- SELECT * FROM tasks WHERE dirty = 1 AND deleted_at IS NULL;

-- Get items modified since last sync for pull
-- SELECT * FROM tasks WHERE updated_at > ? ORDER BY updated_at ASC;

-- Mark item as synced
-- UPDATE tasks SET dirty = 0, synced_at = ? WHERE id = ?;

-- Soft delete
-- UPDATE tasks SET deleted_at = ?, updated_at = ?, dirty = 1 WHERE id = ?;

-- Get sync log for delta sync
-- SELECT * FROM sync_log WHERE synced = 0 ORDER BY timestamp ASC LIMIT 100;

-- Mark sync log entries as synced
-- UPDATE sync_log SET synced = 1 WHERE id IN (?);

-- Get conflicts for user resolution
-- SELECT * FROM conflicts WHERE resolved = 0;

-- Clean up old synced items (garbage collection)
-- DELETE FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < ? AND dirty = 0;

-- Clean up old sync log entries
-- DELETE FROM sync_log WHERE synced = 1 AND timestamp < ?;
