-- SaaS Multi-Tenant Database Schema
-- Schema for a project management SaaS with organizations, teams, projects, and tasks

-- Tenants (Organizations)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    max_users INTEGER DEFAULT 5,
    max_projects INTEGER DEFAULT 3,
    storage_limit_mb INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    trial_ends_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_is_active ON tenants(is_active) WHERE is_active = true;

-- Users (global user accounts)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Tenant Memberships (users can belong to multiple tenants)
CREATE TABLE tenant_memberships (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by INTEGER REFERENCES users(id),
    UNIQUE (tenant_id, user_id)
);

CREATE INDEX idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);
CREATE INDEX idx_tenant_memberships_user_id ON tenant_memberships(user_id);

-- Invitations
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by INTEGER NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, email)
);

CREATE INDEX idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);

-- Teams (within a tenant)
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_teams_tenant_id ON teams(tenant_id);

-- Team Members
CREATE TABLE team_members (
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'on_hold')),
    start_date DATE,
    due_date DATE,
    color VARCHAR(7),  -- Hex color code
    is_private BOOLEAN DEFAULT false,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Project Members (users assigned to project)
CREATE TABLE project_members (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Task Lists (boards/sections within project)
CREATE TABLE task_lists (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_lists_tenant_id ON task_lists(tenant_id);
CREATE INDEX idx_task_lists_project_id ON task_lists(project_id);

-- Tasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_list_id INTEGER REFERENCES task_lists(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    due_date DATE,
    completed_at TIMESTAMP,
    display_order INTEGER DEFAULT 0,
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_task_list_id ON tasks(task_list_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Task Dependencies
CREATE TABLE task_dependencies (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Comments
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_tenant_id ON comments(tenant_id);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Attachments
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (task_id IS NOT NULL AND comment_id IS NULL) OR
        (task_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE INDEX idx_attachments_tenant_id ON attachments(tenant_id);
CREATE INDEX idx_attachments_task_id ON attachments(task_id);
CREATE INDEX idx_attachments_comment_id ON attachments(comment_id);

-- Labels/Tags
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,  -- Hex color
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_labels_tenant_id ON labels(tenant_id);

-- Task Labels (many-to-many)
CREATE TABLE task_labels (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_task_labels_label_id ON task_labels(label_id);

-- Activity Log (audit trail)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('project', 'task', 'comment', 'attachment')),
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'assigned', 'completed')),
    changes JSONB,  -- Store old and new values
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Time Tracking
CREATE TABLE time_entries (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    hours DECIMAL(5, 2) NOT NULL CHECK (hours > 0),
    entry_date DATE NOT NULL,
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_time_entries_tenant_id ON time_entries(tenant_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_entry_date ON time_entries(entry_date);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = false;

-- Webhooks (for integrations)
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,  -- Array of event types to trigger on
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_tenant_id ON webhooks(tenant_id);

-- Row-Level Security Policies (PostgreSQL)

-- Enable RLS on tenant-scoped tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access data from their tenants
CREATE POLICY tenant_isolation_policy ON projects
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_memberships
        WHERE user_id = current_setting('app.current_user_id')::int
    ));

CREATE POLICY tenant_isolation_policy ON tasks
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_memberships
        WHERE user_id = current_setting('app.current_user_id')::int
    ));

CREATE POLICY tenant_isolation_policy ON comments
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_memberships
        WHERE user_id = current_setting('app.current_user_id')::int
    ));

CREATE POLICY tenant_isolation_policy ON time_entries
    USING (tenant_id IN (
        SELECT tenant_id FROM tenant_memberships
        WHERE user_id = current_setting('app.current_user_id')::int
    ));

-- Useful Views

-- Project Statistics
CREATE VIEW project_stats AS
SELECT
    p.id,
    p.tenant_id,
    p.name,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'done' THEN t.id END) as overdue_tasks,
    COUNT(DISTINCT pm.user_id) as member_count,
    MAX(t.updated_at) as last_activity
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id;

-- User Workload
CREATE VIEW user_workload AS
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    tm.tenant_id,
    COUNT(t.id) as assigned_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_tasks,
    COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'done' THEN 1 END) as overdue_tasks,
    SUM(t.estimated_hours) as total_estimated_hours
FROM users u
JOIN tenant_memberships tm ON u.id = tm.user_id
LEFT JOIN tasks t ON u.id = t.assigned_to AND tm.tenant_id = t.tenant_id
GROUP BY u.id, tm.tenant_id;

-- Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Log activity on task changes
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
    changes_json JSONB;
    action_type VARCHAR(50);
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        changes_json := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'updated';
        changes_json := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        );
        IF OLD.status != 'done' AND NEW.status = 'done' THEN
            action_type := 'completed';
        END IF;
        IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            action_type := 'assigned';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        changes_json := to_jsonb(OLD);
    END IF;

    INSERT INTO activities (tenant_id, user_id, entity_type, entity_id, action, changes)
    VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        current_setting('app.current_user_id')::int,
        'task',
        COALESCE(NEW.id, OLD.id),
        action_type,
        changes_json
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_task_activity_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_task_activity();

-- Sample Data

INSERT INTO tenants (name, slug, subdomain, plan) VALUES
('Acme Corp', 'acme-corp', 'acme', 'professional'),
('Globex Inc', 'globex-inc', 'globex', 'enterprise');

INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('alice@acme.com', '$2a$10$...', 'Alice', 'Smith'),
('bob@acme.com', '$2a$10$...', 'Bob', 'Johnson'),
('charlie@globex.com', '$2a$10$...', 'Charlie', 'Brown');

INSERT INTO tenant_memberships (tenant_id, user_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'member'),
(2, 3, 'owner');

INSERT INTO projects (tenant_id, name, description, status, created_by) VALUES
(1, 'Website Redesign', 'Redesign company website with modern UI', 'active', 1),
(1, 'Mobile App', 'Build iOS and Android app', 'active', 1),
(2, 'Marketing Campaign', 'Q1 2024 campaign planning', 'active', 3);

INSERT INTO tasks (tenant_id, project_id, title, status, priority, assigned_to, created_by) VALUES
(1, 1, 'Design homepage mockup', 'in_progress', 'high', 1, 1),
(1, 1, 'Set up development environment', 'done', 'medium', 2, 1),
(1, 2, 'Research competitor apps', 'todo', 'medium', 2, 1);
