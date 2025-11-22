---
name: database-design
description: This skill should be used when the user asks to "model a schema", "design a database", "choose between SQL and NoSQL", "create a migration", "optimize a query", "normalize a schema", "add database indexes", "design table relationships", or mentions database design, schema modeling, or query optimization.
version: 0.1.0
---

# Database Design

This skill provides guidance for designing database schemas, choosing appropriate database technologies, handling migrations, and optimizing queries. Use this skill to help users make informed decisions about data modeling and database architecture.

## Purpose

Database design is critical to application performance, maintainability, and scalability. This skill helps with:

- Modeling data schemas with proper relationships and constraints
- Choosing between SQL and NoSQL databases based on use case
- Creating and managing database migrations safely
- Optimizing slow queries and improving database performance
- Applying normalization and denormalization strategies
- Designing indexes for query performance

## When to Use This Skill

Use this skill when users need to:

- Design a new database schema from requirements
- Refactor an existing schema for better performance or clarity
- Decide between database technologies (PostgreSQL, MySQL, MongoDB, etc.)
- Create migration scripts for schema changes
- Debug and optimize slow database queries
- Add appropriate indexes to improve query performance
- Model complex relationships (one-to-many, many-to-many, polymorphic)

## Core Concepts

### Database Selection Criteria

**Use SQL databases (PostgreSQL, MySQL) when:**
- Data has clear relationships and structure
- ACID compliance is required
- Complex queries with joins are common
- Data integrity and constraints are critical
- Transactions span multiple tables

**Use NoSQL databases (MongoDB, DynamoDB) when:**
- Schema flexibility is needed
- Horizontal scaling is a priority
- Document-based data model fits naturally
- High write throughput is required
- Data access patterns are simple (key-value, document retrieval)

### Schema Design Principles

**Normalization:** Organize data to reduce redundancy
- 1NF: Atomic values, no repeating groups
- 2NF: No partial dependencies on composite keys
- 3NF: No transitive dependencies
- Use for transactional systems, data integrity

**Denormalization:** Intentionally add redundancy for performance
- Reduce joins by duplicating data
- Pre-compute aggregations
- Use for read-heavy workloads, reporting

### Common Relationships

**One-to-Many:** Most common relationship type
```sql
-- Users have many posts
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL
);
```

**Many-to-Many:** Requires junction table
```sql
-- Students enroll in many courses
CREATE TABLE students (id SERIAL PRIMARY KEY, name VARCHAR(255));
CREATE TABLE courses (id SERIAL PRIMARY KEY, title VARCHAR(255));
CREATE TABLE enrollments (
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    PRIMARY KEY (student_id, course_id)
);
```

**One-to-One:** Rare, often indicates data split
```sql
-- User has one profile (extended attributes)
CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255));
CREATE TABLE profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(500)
);
```

## Schema Design Workflow

### Step 1: Understand Requirements

Identify entities, attributes, and relationships:
- What data needs to be stored?
- What queries will be performed?
- What are the access patterns?
- What are the performance requirements?

### Step 2: Design Entity-Relationship Model

Create a conceptual model:
- List all entities (tables)
- Define attributes for each entity
- Identify primary keys
- Map relationships between entities
- Consider cardinality (one-to-many, many-to-many)

### Step 3: Apply Normalization

Normalize to 3NF by default:
- Eliminate repeating groups
- Remove partial dependencies
- Remove transitive dependencies
- Consider denormalization only when performance requires it

### Step 4: Add Constraints and Indexes

Define data integrity rules:
- Primary keys and foreign keys
- NOT NULL constraints
- UNIQUE constraints
- CHECK constraints
- Indexes for frequently queried columns

### Step 5: Plan for Evolution

Design for change:
- Avoid over-engineering
- Use migrations for schema changes
- Version your schema
- Plan for backwards compatibility

## Migration Management

### Migration Best Practices

**Always use migrations for schema changes:**
- Create migration files with timestamps
- Make migrations reversible (up and down)
- Test migrations in development first
- Backup production data before migrating
- Run migrations in a transaction when possible

**Safe migration patterns:**
- Add columns with DEFAULT values to avoid NULL issues
- Add indexes CONCURRENTLY (PostgreSQL) to avoid locks
- Rename via multi-step process (add, migrate data, drop old)
- Use feature flags for application code changes

**Dangerous operations:**
- Dropping columns with data
- Changing column types without conversion
- Adding NOT NULL to existing columns without DEFAULT
- Creating indexes on large tables without CONCURRENTLY

### Migration Tools by Framework

- **Rails:** `rails generate migration`, `rake db:migrate`
- **Django:** `python manage.py makemigrations`, `migrate`
- **Node/TypeORM:** `typeorm migration:create`, `migration:run`
- **Golang/golang-migrate:** `migrate create`, `migrate up`
- **Prisma:** `prisma migrate dev`, `prisma migrate deploy`

## Query Optimization

### Optimization Process

1. **Identify slow queries:** Use query logs, APM tools
2. **Analyze execution plan:** Use EXPLAIN/EXPLAIN ANALYZE
3. **Add appropriate indexes:** Based on WHERE, JOIN, ORDER BY
4. **Refactor query:** Simplify logic, reduce subqueries
5. **Measure improvement:** Compare before and after performance

### Index Strategy

**When to add indexes:**
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY clauses
- Columns in GROUP BY clauses
- Foreign key columns

**Index types:**
- **B-tree (default):** Most queries, equality and range
- **Hash:** Equality comparisons only
- **GIN/GiST:** Full-text search, JSON, arrays (PostgreSQL)
- **Partial:** Index subset of rows (WHERE condition)
- **Composite:** Multiple columns (order matters)

**Index trade-offs:**
- Improves read performance
- Slows down writes (INSERT, UPDATE, DELETE)
- Consumes disk space
- More indexes ≠ better (maintain only needed ones)

### Common Query Patterns

**N+1 Query Problem:**
```sql
-- Bad: Loads posts, then queries for each user
SELECT * FROM posts;  -- Returns 100 posts
SELECT * FROM users WHERE id = ?;  -- Runs 100 times

-- Good: Join to load everything at once
SELECT posts.*, users.* FROM posts
JOIN users ON posts.user_id = users.id;
```

**Pagination with OFFSET:**
```sql
-- Inefficient for large offsets (scans and discards rows)
SELECT * FROM posts ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;

-- Better: Cursor-based pagination
SELECT * FROM posts
WHERE created_at < ?  -- Last seen timestamp
ORDER BY created_at DESC LIMIT 20;
```

**Counting Rows:**
```sql
-- Slow: Full table scan
SELECT COUNT(*) FROM large_table;

-- Faster: Approximate (PostgreSQL)
SELECT reltuples::bigint FROM pg_class WHERE relname = 'large_table';
```

## Database-Specific Considerations

### PostgreSQL Strengths
- Advanced features: JSONB, arrays, full-text search
- Strong data integrity and ACID compliance
- Excellent for complex queries and analytics
- Rich index types (GIN, GiST, BRIN)
- Mature replication and extensions ecosystem

### MySQL Strengths
- High read performance
- Simple replication setup
- Wide hosting support
- Good for web applications with simple queries

### MongoDB Strengths
- Flexible schema for evolving data models
- Natural document storage for nested data
- Horizontal scaling with sharding
- Fast writes and simple queries

### SQLite Strengths
- Serverless, embedded database
- Single file, easy deployment
- Perfect for mobile apps, desktop apps, prototypes
- Excellent for read-heavy workloads

## Additional Resources

### Reference Files

For detailed patterns and advanced techniques:
- **`references/schema-patterns.md`** - Common schema design patterns, anti-patterns, and real-world examples
- **`references/migration-strategies.md`** - Advanced migration techniques, zero-downtime deployments, and rollback strategies
- **`references/query-optimization.md`** - Deep dive into query optimization, execution plans, and performance tuning

### Example Files

Working examples in `examples/`:
- **`examples/ecommerce-schema.sql`** - Complete e-commerce database schema
- **`examples/social-network-schema.sql`** - Social network with relationships
- **`examples/saas-multi-tenant-schema.sql`** - Multi-tenant SaaS design
- **`examples/nosql-schema.json`** - MongoDB schema examples

### Scripts

Utility scripts in `scripts/`:
- **`scripts/analyze-query.sh`** - Run EXPLAIN ANALYZE on queries
- **`scripts/find-missing-indexes.sql`** - Identify missing indexes (PostgreSQL)
- **`scripts/migration-template.sh`** - Generate migration file template

## Implementation Workflow

When helping users with database design:

1. **Gather requirements**: Ask about entities, relationships, and query patterns
2. **Choose database type**: Recommend SQL vs NoSQL based on requirements
3. **Design schema**: Create tables with appropriate relationships
4. **Add constraints**: Define primary keys, foreign keys, and validation rules
5. **Plan indexes**: Identify columns that need indexes based on queries
6. **Create migration**: Generate migration file with reversible changes
7. **Test and validate**: Verify schema works with sample data
8. **Document decisions**: Explain trade-offs and rationale

## Common Scenarios

### Scenario: "Design a blog database"

1. Identify entities: users, posts, comments, tags
2. Define relationships: users have many posts, posts have many comments
3. Create schema with foreign keys
4. Add indexes on foreign keys and commonly queried fields
5. Consider full-text search on post content

### Scenario: "My query is slow"

1. Ask for the query and table schema
2. Run EXPLAIN ANALYZE to see execution plan
3. Look for sequential scans, high costs
4. Suggest indexes on filtered/joined columns
5. Consider query refactoring if needed

### Scenario: "Should I use SQL or NoSQL?"

1. Ask about data structure and relationships
2. Ask about query patterns (simple lookups vs complex joins)
3. Ask about scale requirements
4. Recommend based on ACID needs, schema flexibility, scaling strategy

### Scenario: "I need to add a column to a production table"

1. Create a migration with ADD COLUMN and DEFAULT value
2. Warn about locking behavior for large tables
3. Suggest CONCURRENTLY for indexes (PostgreSQL)
4. Recommend testing on staging first
5. Plan for rollback if needed

## Best Practices Summary

**Schema Design:**
- Start with normalized design (3NF)
- Denormalize only when performance requires it
- Use foreign keys to enforce relationships
- Add appropriate constraints (NOT NULL, UNIQUE, CHECK)
- Choose appropriate data types (don't over-size)

**Migrations:**
- Always use migration files, never manual changes
- Make migrations reversible
- Add DEFAULT when adding NOT NULL columns
- Test migrations on copy of production data
- Use transactions when possible

**Query Optimization:**
- Add indexes based on actual query patterns
- Use EXPLAIN to understand execution plans
- Avoid N+1 queries (use joins or eager loading)
- Paginate with cursors for large datasets
- Monitor slow query logs

**General:**
- Choose database technology based on requirements, not trends
- Document schema decisions and trade-offs
- Version control schema and migrations
- Backup before making production changes
- Monitor database performance metrics

---

This skill provides the foundation for database design tasks. Consult the reference files for detailed patterns and advanced techniques.
