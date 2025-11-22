# Schema Design Patterns

This reference provides detailed schema design patterns, anti-patterns, and real-world examples for database modeling.

## Table of Contents

1. [Common Design Patterns](#common-design-patterns)
2. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
3. [Advanced Relationship Patterns](#advanced-relationship-patterns)
4. [Temporal Data Patterns](#temporal-data-patterns)
5. [Multi-Tenancy Patterns](#multi-tenancy-patterns)
6. [Soft Delete Pattern](#soft-delete-pattern)
7. [Tree and Hierarchical Data](#tree-and-hierarchical-data)
8. [Polymorphic Associations](#polymorphic-associations)
9. [Event Sourcing Pattern](#event-sourcing-pattern)
10. [Audit Trail Pattern](#audit-trail-pattern)

---

## Common Design Patterns

### Single Table Inheritance (STI)

Store different types in one table with a discriminator column.

**Use case:** Related types sharing most attributes

```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,  -- 'car', 'truck', 'motorcycle'
    brand VARCHAR(100),
    model VARCHAR(100),
    -- Common fields
    year INTEGER,
    color VARCHAR(50),
    -- Car-specific (nullable for other types)
    num_doors INTEGER,
    -- Truck-specific
    payload_capacity INTEGER,
    -- Motorcycle-specific
    engine_cc INTEGER
);
```

**Pros:**
- Simple queries (no joins)
- Easy to add common fields
- Single table to maintain

**Cons:**
- Many NULL values for type-specific fields
- Table becomes wide with many types
- Harder to enforce constraints per type

### Class Table Inheritance (CTI)

Store each type in separate tables with shared parent table.

**Use case:** Types with significantly different attributes

```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    color VARCHAR(50)
);

CREATE TABLE cars (
    id INTEGER PRIMARY KEY REFERENCES vehicles(id),
    num_doors INTEGER NOT NULL,
    trunk_capacity INTEGER
);

CREATE TABLE trucks (
    id INTEGER PRIMARY KEY REFERENCES vehicles(id),
    payload_capacity INTEGER NOT NULL,
    num_axles INTEGER
);

CREATE TABLE motorcycles (
    id INTEGER PRIMARY KEY REFERENCES vehicles(id),
    engine_cc INTEGER NOT NULL,
    has_sidecar BOOLEAN
);
```

**Pros:**
- No NULL values
- Type-specific constraints
- Cleaner data model

**Cons:**
- Requires joins for full data
- More complex queries
- Multiple tables to maintain

### Lookup Tables (Enumeration Tables)

Store valid values in a reference table instead of CHECK constraints.

**Use case:** Constrained value sets that might change

```sql
CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,  -- 'pending', 'processing', 'shipped', 'delivered'
    description TEXT,
    display_order INTEGER
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status_id INTEGER REFERENCES order_statuses(id),
    customer_id INTEGER REFERENCES customers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Pros:**
- Easy to add new values without migrations
- Can add metadata (descriptions, display order)
- Foreign key ensures valid values

**Cons:**
- Extra join for queries
- Slight performance overhead

**Alternative with ENUM (PostgreSQL):**
```sql
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status order_status NOT NULL DEFAULT 'pending'
);
```

### Adjacency List Pattern

Simple parent-child relationship for hierarchies.

**Use case:** Categories, organizational charts, comment threads

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example data
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Electronics', NULL),
(2, 'Computers', 1),
(3, 'Laptops', 2),
(4, 'Desktops', 2),
(5, 'Gaming Laptops', 3);
```

**Pros:**
- Simple to implement
- Easy to move nodes (update parent_id)
- Easy to insert/delete

**Cons:**
- Recursive queries needed for full tree
- Performance issues with deep trees
- No depth information

**Query children:**
```sql
SELECT * FROM categories WHERE parent_id = 2;  -- Get direct children
```

**Query entire subtree (PostgreSQL recursive CTE):**
```sql
WITH RECURSIVE category_tree AS (
    SELECT id, name, parent_id, 1 as depth
    FROM categories WHERE id = 1

    UNION ALL

    SELECT c.id, c.name, c.parent_id, ct.depth + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY depth, name;
```

---

## Anti-Patterns to Avoid

### Entity-Attribute-Value (EAV)

Store attributes as rows instead of columns.

**Anti-pattern example:**
```sql
-- DON'T DO THIS
CREATE TABLE entity_attributes (
    entity_id INTEGER,
    attribute_name VARCHAR(100),
    attribute_value TEXT
);

-- Results in hard-to-query data:
-- entity_id | attribute_name | attribute_value
-- 1         | name           | John
-- 1         | email          | john@example.com
-- 1         | age            | 30
```

**Why it's bad:**
- No type safety (everything is TEXT)
- No constraints on values
- Queries become complex
- Terrible performance

**Better alternatives:**
- Use JSONB for flexible attributes (PostgreSQL)
- Create separate columns for known attributes
- Use Single Table Inheritance with nullable columns

### Storing Delimited Lists

Store multiple values in one column as comma-separated.

**Anti-pattern example:**
```sql
-- DON'T DO THIS
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    tag_ids VARCHAR(255)  -- '1,5,8,12'
);
```

**Why it's bad:**
- Can't use foreign keys
- Hard to query ("find posts with tag 5")
- No validation of values
- Violates 1NF (non-atomic values)

**Correct approach:**
```sql
-- Use junction table
CREATE TABLE posts (id SERIAL PRIMARY KEY, title VARCHAR(255));
CREATE TABLE tags (id SERIAL PRIMARY KEY, name VARCHAR(100));
CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (post_id, tag_id)
);
```

### Polymorphic Foreign Keys (Without Check)

Foreign key that can reference multiple tables.

**Anti-pattern example:**
```sql
-- RISKY PATTERN
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    commentable_type VARCHAR(50),  -- 'Post', 'Photo', 'Video'
    commentable_id INTEGER,  -- No foreign key constraint!
    content TEXT
);
```

**Why it's risky:**
- No referential integrity (can reference non-existent records)
- Database can't enforce relationships
- Orphaned records possible

**Better alternatives:**
1. **Separate foreign keys (recommended):**
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    photo_id INTEGER REFERENCES photos(id),
    video_id INTEGER REFERENCES videos(id),
    content TEXT,
    CHECK (
        (post_id IS NOT NULL)::int +
        (photo_id IS NOT NULL)::int +
        (video_id IS NOT NULL)::int = 1
    )
);
```

2. **Exclusive Arc Pattern (PostgreSQL):**
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    photo_id INTEGER REFERENCES photos(id),
    video_id INTEGER REFERENCES videos(id),
    content TEXT
);

-- Trigger to ensure exactly one foreign key is set
CREATE OR REPLACE FUNCTION check_exclusive_arc()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.post_id IS NOT NULL)::int +
       (NEW.photo_id IS NOT NULL)::int +
       (NEW.video_id IS NOT NULL)::int != 1 THEN
        RAISE EXCEPTION 'Exactly one foreign key must be set';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_exclusive_arc
BEFORE INSERT OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION check_exclusive_arc();
```

### Using Floats for Money

Store currency as FLOAT or DOUBLE.

**Anti-pattern example:**
```sql
-- DON'T DO THIS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price FLOAT  -- WRONG!
);
```

**Why it's bad:**
- Floating point precision errors
- 0.1 + 0.2 ≠ 0.3 in floating point
- Accumulates errors in calculations

**Correct approach:**
```sql
-- Use DECIMAL/NUMERIC
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2)  -- 10 digits total, 2 after decimal
);

-- Or store as integer cents
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price_cents INTEGER  -- Store 1999 for $19.99
);
```

---

## Advanced Relationship Patterns

### Self-Referencing Many-to-Many

Users following users, products related to products.

**Example: Social network followers**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id),
    followee_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id != followee_id)  -- Can't follow yourself
);

-- Query: Who does Alice follow?
SELECT u.username
FROM follows f
JOIN users u ON f.followee_id = u.id
WHERE f.follower_id = (SELECT id FROM users WHERE username = 'alice');

-- Query: Who follows Alice?
SELECT u.username
FROM follows f
JOIN users u ON f.follower_id = u.id
WHERE f.followee_id = (SELECT id FROM users WHERE username = 'alice');
```

### Bidirectional Relationship with Attributes

Junction table with metadata about the relationship.

**Example: Team members with roles**
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE team_memberships (
    team_id INTEGER REFERENCES teams(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,  -- 'owner', 'admin', 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    permissions JSONB,  -- Store flexible permissions
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_memberships_user ON team_memberships(user_id);
```

---

## Temporal Data Patterns

### Valid Time Period

Track when data is valid (business perspective).

**Example: Price history**
```sql
CREATE TABLE product_prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    price DECIMAL(10, 2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,  -- NULL means current
    EXCLUDE USING gist (
        product_id WITH =,
        daterange(valid_from, valid_to) WITH &&
    )  -- Prevent overlapping periods
);

-- Query current price
SELECT price FROM product_prices
WHERE product_id = 123
AND valid_from <= CURRENT_DATE
AND (valid_to IS NULL OR valid_to > CURRENT_DATE);

-- Query price at specific date
SELECT price FROM product_prices
WHERE product_id = 123
AND valid_from <= '2024-01-15'
AND (valid_to IS NULL OR valid_to > '2024-01-15');
```

### Transaction Time (System Versioning)

Track when data was recorded in the database.

**Example: Audit trail with history**
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers_history (
    history_id SERIAL PRIMARY KEY,
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    operation CHAR(1) NOT NULL  -- 'I'nsert, 'U'pdate, 'D'elete
);

-- Trigger to record changes
CREATE OR REPLACE FUNCTION record_customer_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO customers_history (id, name, email, valid_from, valid_to, operation)
        VALUES (OLD.id, OLD.name, OLD.email, OLD.updated_at, CURRENT_TIMESTAMP, 'U');
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO customers_history (id, name, email, valid_from, valid_to, operation)
        VALUES (OLD.id, OLD.name, OLD.email, OLD.updated_at, CURRENT_TIMESTAMP, 'D');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_history_trigger
AFTER UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION record_customer_history();
```

---

## Multi-Tenancy Patterns

### Shared Schema (Discriminator Column)

All tenants share same tables with tenant_id column.

```sql
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    UNIQUE (tenant_id, email)
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    FOREIGN KEY (tenant_id, user_id) REFERENCES users(tenant_id, id)
);

-- Row-Level Security (PostgreSQL)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON posts
    USING (tenant_id = current_setting('app.current_tenant_id')::int);
```

**Pros:**
- Simple deployment (one database)
- Easy to add new tenants
- Cost-effective

**Cons:**
- Risk of data leakage between tenants
- One tenant can affect others (noisy neighbor)
- Harder to customize per tenant

### Separate Schemas

Each tenant gets their own schema within one database.

```sql
-- Create schema for each tenant
CREATE SCHEMA tenant_acme;
CREATE SCHEMA tenant_globex;

-- Same table structure in each schema
CREATE TABLE tenant_acme.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE tenant_globex.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

-- Application sets search_path per tenant
SET search_path TO tenant_acme, public;
```

**Pros:**
- Better isolation than shared schema
- Can customize schema per tenant
- Easier to export/backup individual tenant

**Cons:**
- Schema changes must apply to all tenants
- More complex migrations
- Database connection limits

### Separate Databases

Each tenant gets their own database.

**Pros:**
- Complete isolation
- Can use different database versions
- Easy to scale out (different servers)
- Easy to backup/restore individual tenant

**Cons:**
- More complex deployment
- Higher infrastructure cost
- Harder to do cross-tenant queries

---

## Soft Delete Pattern

Mark records as deleted instead of removing them.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_not_deleted ON posts(id) WHERE deleted_at IS NULL;

-- Queries need to filter deleted records
SELECT * FROM posts WHERE deleted_at IS NULL;

-- "Delete" a post
UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = 123;

-- Restore a post
UPDATE posts SET deleted_at = NULL WHERE id = 123;

-- Permanently delete old soft-deleted records
DELETE FROM posts
WHERE deleted_at IS NOT NULL
AND deleted_at < NOW() - INTERVAL '90 days';
```

**Pros:**
- Can recover accidentally deleted data
- Maintains referential integrity
- Useful for auditing

**Cons:**
- Queries must always filter deleted_at
- Indexes include deleted records
- Unique constraints need to handle deleted records

**Unique constraint with soft delete:**
```sql
CREATE UNIQUE INDEX idx_posts_unique_slug
ON posts(slug) WHERE deleted_at IS NULL;
```

---

## Tree and Hierarchical Data

### Nested Set Model

Store hierarchies with left and right values.

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lft INTEGER NOT NULL,
    rgt INTEGER NOT NULL,
    UNIQUE (lft),
    UNIQUE (rgt),
    CHECK (lft < rgt)
);

-- Example tree:
--     Electronics (1,10)
--       Computers (2,7)
--         Laptops (3,4)
--         Desktops (5,6)
--       Phones (8,9)

INSERT INTO categories (id, name, lft, rgt) VALUES
(1, 'Electronics', 1, 10),
(2, 'Computers', 2, 7),
(3, 'Laptops', 3, 4),
(4, 'Desktops', 5, 6),
(5, 'Phones', 8, 9);

-- Get all descendants of Computers (lft=2, rgt=7)
SELECT * FROM categories
WHERE lft > 2 AND rgt < 7
ORDER BY lft;

-- Get entire subtree including root
SELECT * FROM categories
WHERE lft >= 2 AND rgt <= 7
ORDER BY lft;

-- Get path to node (ancestors)
SELECT * FROM categories WHERE lft < 3 AND rgt > 4 ORDER BY lft;
```

**Pros:**
- Fast reads (no recursion)
- Easy to get entire subtree
- Easy to get depth

**Cons:**
- Complex inserts/moves (must update many rows)
- Can't use foreign keys easily
- Better for read-heavy trees

### Materialized Path

Store full path from root as string.

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL UNIQUE  -- '.1.2.5.'
);

INSERT INTO categories (id, name, path) VALUES
(1, 'Electronics', '.1.'),
(2, 'Computers', '.1.2.'),
(3, 'Laptops', '.1.2.3.'),
(4, 'Desktops', '.1.2.4.'),
(5, 'Phones', '.1.5.');

-- Get all descendants
SELECT * FROM categories
WHERE path LIKE '.1.2.%' AND path != '.1.2.';

-- Get ancestors
SELECT * FROM categories
WHERE '.1.2.3.' LIKE path || '%';

CREATE INDEX idx_categories_path ON categories USING btree(path);
```

**Pros:**
- Simple queries
- Easy to move subtrees
- Works well with indexes

**Cons:**
- Path length limited
- Harder to maintain path integrity

---

## Polymorphic Associations

### Tagged Union (with Check Constraint)

Allow one table to reference multiple tables safely.

```sql
CREATE TABLE images (id SERIAL PRIMARY KEY, url VARCHAR(500));
CREATE TABLE videos (id SERIAL PRIMARY KEY, url VARCHAR(500));

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES images(id),
    video_id INTEGER REFERENCES videos(id),
    content TEXT NOT NULL,
    CHECK (
        (image_id IS NOT NULL AND video_id IS NULL) OR
        (image_id IS NULL AND video_id IS NOT NULL)
    )
);

CREATE INDEX idx_comments_image ON comments(image_id) WHERE image_id IS NOT NULL;
CREATE INDEX idx_comments_video ON comments(video_id) WHERE video_id IS NOT NULL;
```

---

## Event Sourcing Pattern

Store all changes as immutable events.

```sql
CREATE TABLE account_events (
    id SERIAL PRIMARY KEY,
    account_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_events_account ON account_events(account_id, created_at);

-- Events
INSERT INTO account_events (account_id, event_type, event_data) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'account_created', '{"initial_balance": 1000}'),
('550e8400-e29b-41d4-a716-446655440000', 'deposit', '{"amount": 500}'),
('550e8400-e29b-41d4-a716-446655440000', 'withdrawal', '{"amount": 200}');

-- Rebuild current state from events
SELECT
    account_id,
    SUM(CASE event_type
        WHEN 'account_created' THEN (event_data->>'initial_balance')::numeric
        WHEN 'deposit' THEN (event_data->>'amount')::numeric
        WHEN 'withdrawal' THEN -(event_data->>'amount')::numeric
    END) as balance
FROM account_events
WHERE account_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY account_id;
```

---

## Audit Trail Pattern

Track who changed what and when.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.updated_by);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), OLD.updated_by);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION log_changes();
```

---

This reference covers the most important schema design patterns. Refer to these patterns when modeling complex relationships and data structures.
