# Migration Strategies

This reference provides detailed guidance on database migrations, zero-downtime deployments, and rollback strategies.

## Table of Contents

1. [Migration Fundamentals](#migration-fundamentals)
2. [Safe Migration Patterns](#safe-migration-patterns)
3. [Dangerous Operations](#dangerous-operations)
4. [Zero-Downtime Migrations](#zero-downtime-migrations)
5. [Rollback Strategies](#rollback-strategies)
6. [Data Migrations](#data-migrations)
7. [Framework-Specific Patterns](#framework-specific-patterns)
8. [Testing Migrations](#testing-migrations)
9. [Production Migration Checklist](#production-migration-checklist)

---

## Migration Fundamentals

### What Are Migrations?

Migrations are version-controlled, incremental changes to database schema. They allow teams to:

- Track schema evolution over time
- Reproduce schema across environments
- Coordinate schema changes with application code
- Rollback changes when needed

### Migration File Structure

**Timestamp-based naming:**

```
20240115120000_create_users_table.sql
20240115130000_add_email_to_users.sql
20240115140000_create_posts_table.sql
```

**Basic migration template:**

```sql
-- migrate:up
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down
DROP TABLE users;
```

### Migration States

Migrations have three states:

1. **Pending:** Not yet applied to database
2. **Applied:** Successfully executed
3. **Failed:** Execution encountered error

**Tracking table:**

```sql
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Safe Migration Patterns

### Adding a Column (Safe)

**Without default:**

```sql
-- migrate:up
ALTER TABLE users ADD COLUMN bio TEXT;

-- migrate:down
ALTER TABLE users DROP COLUMN bio;
```

**With default value:**

```sql
-- migrate:up
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- migrate:down
ALTER TABLE users DROP COLUMN is_active;
```

**Note:** Adding columns is usually safe, but on very large tables, adding a column with a default can lock the table briefly. See [Zero-Downtime Migrations](#zero-downtime-migrations).

### Adding an Index (Mostly Safe)

**Regular index (blocks writes):**

```sql
-- migrate:up
CREATE INDEX idx_users_email ON users(email);

-- migrate:down
DROP INDEX idx_users_email;
```

**Concurrent index (PostgreSQL - doesn't block):**

```sql
-- migrate:up
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- migrate:down
DROP INDEX CONCURRENTLY idx_users_email;
```

**Note:** `CONCURRENTLY` cannot run inside a transaction, so handle errors carefully.

### Creating a New Table (Safe)

```sql
-- migrate:up
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);

-- migrate:down
DROP TABLE posts;
```

### Adding a Non-Null Constraint (Two Steps)

**Step 1: Add column as nullable**

```sql
-- migrate:up
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- migrate:down
ALTER TABLE users DROP COLUMN email;
```

**Step 2: Deploy application code that populates email**

**Step 3: Make column NOT NULL**

```sql
-- migrate:up
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- migrate:down
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
```

---

## Dangerous Operations

### Dropping a Column (DANGEROUS)

**Problem:** Application may still be reading this column.

**Safe approach:**

1. Deploy code that stops reading the column
2. Wait for all old code to be retired
3. Drop the column in a later migration

```sql
-- ONLY after verifying no code reads this column
-- migrate:up
ALTER TABLE users DROP COLUMN deprecated_field;

-- migrate:down
ALTER TABLE users ADD COLUMN deprecated_field VARCHAR(255);
```

**Note:** Rolling back a dropped column loses data unless you have a backup.

### Renaming a Column (DANGEROUS)

**Problem:** Application code expects the old name.

**Safe approach (multi-phase):**

**Phase 1: Add new column, backfill data**

```sql
-- migrate:up
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
UPDATE users SET full_name = name;

-- migrate:down
ALTER TABLE users DROP COLUMN full_name;
```

**Phase 2: Deploy code that reads from both columns, writes to both**

**Phase 3: Drop old column**

```sql
-- migrate:up
ALTER TABLE users DROP COLUMN name;

-- migrate:down
ALTER TABLE users ADD COLUMN name VARCHAR(255);
UPDATE users SET name = full_name;
```

**Alternative (PostgreSQL - view-based):**

```sql
-- Create view with old column name
CREATE VIEW users_legacy AS
SELECT id, full_name AS name, email FROM users;

-- Application can continue using 'name' via the view
```

### Changing Column Type (DANGEROUS)

**Problem:** May require rewriting entire table, causes long locks.

**Example - String to Integer:**

```sql
-- BAD: Can lock table for hours on large tables
ALTER TABLE products ALTER COLUMN sku TYPE INTEGER USING sku::integer;
```

**Safe approach (multi-phase):**

**Phase 1: Add new column**

```sql
ALTER TABLE products ADD COLUMN sku_int INTEGER;
UPDATE products SET sku_int = sku::integer WHERE sku ~ '^[0-9]+$';
```

**Phase 2: Deploy code that reads from both, writes to both**

**Phase 3: Make new column primary, drop old**

```sql
ALTER TABLE products DROP COLUMN sku;
ALTER TABLE products RENAME COLUMN sku_int TO sku;
```

### Adding a Foreign Key (Can Be Slow)

**Problem:** Validates all existing rows, can lock tables.

**Fast method (PostgreSQL):**

```sql
-- Add constraint without validation
ALTER TABLE posts
ADD CONSTRAINT fk_posts_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
NOT VALID;

-- Validate in background (doesn't block writes)
ALTER TABLE posts VALIDATE CONSTRAINT fk_posts_user_id;
```

---

## Zero-Downtime Migrations

Zero-downtime migrations require careful coordination between schema changes and application code.

### General Strategy

1. **Expand:** Add new schema elements (columns, tables)
2. **Migrate:** Deploy code that works with both old and new schema
3. **Contract:** Remove old schema elements after all code is updated

### Example: Adding a Required Column

**Traditional approach (causes downtime):**

```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL;
-- ERROR: existing rows violate NOT NULL
```

**Zero-downtime approach:**

**Step 1: Add nullable column with default**

```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT 'noemail@example.com';
```

**Step 2: Deploy code that populates email for new users**

**Step 3: Backfill existing users**

```sql
-- Run in batches to avoid long locks
UPDATE users SET email = 'user' || id || '@example.com'
WHERE email = 'noemail@example.com' AND id BETWEEN 1 AND 10000;

UPDATE users SET email = 'user' || id || '@example.com'
WHERE email = 'noemail@example.com' AND id BETWEEN 10001 AND 20000;
-- ... continue in batches
```

**Step 4: Add NOT NULL constraint**

```sql
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

**Step 5: Remove default if needed**

```sql
ALTER TABLE users ALTER COLUMN email DROP DEFAULT;
```

### Example: Splitting a Table

**Goal:** Split `users` into `users` and `user_profiles`.

**Step 1: Create new table**

```sql
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(500)
);
```

**Step 2: Deploy code that writes to both tables**

**Step 3: Backfill data**

```sql
INSERT INTO user_profiles (user_id, bio, avatar_url)
SELECT id, bio, avatar_url FROM users
WHERE bio IS NOT NULL OR avatar_url IS NOT NULL;
```

**Step 4: Deploy code that reads from new table**

**Step 5: Drop old columns**

```sql
ALTER TABLE users DROP COLUMN bio;
ALTER TABLE users DROP COLUMN avatar_url;
```

---

## Rollback Strategies

### Types of Rollbacks

1. **Schema Rollback:** Undo database changes (run `down` migration)
2. **Application Rollback:** Revert to previous code version
3. **Data Rollback:** Restore data from backup (last resort)

### When Rollbacks Fail

**Scenario 1: Data was deleted**

```sql
-- migrate:up
ALTER TABLE users DROP COLUMN phone;

-- migrate:down (FAILS - data is gone)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- Column is restored but data is lost!
```

**Solution:** Backup before risky migrations.

**Scenario 2: Migration partially applied**

```sql
-- migrate:up
CREATE TABLE orders (...);
CREATE INDEX idx_orders_user (user_id);
-- ERROR: Out of disk space!
```

**Solution:** Wrap migrations in transactions when possible.

```sql
BEGIN;
CREATE TABLE orders (...);
CREATE INDEX idx_orders_user (user_id);
COMMIT;
```

**Note:** Some operations can't run in transactions (e.g., `CREATE INDEX CONCURRENTLY`).

### Rollback Best Practices

1. **Test rollbacks in staging:** Don't assume `down` migrations work
2. **Document data loss:** Note when rollback loses data
3. **Use transactions:** Ensure all-or-nothing application
4. **Keep migrations small:** Easier to rollback small changes
5. **Have a backup:** Always backup before major migrations

---

## Data Migrations

Data migrations transform or move data, separate from schema changes.

### Inline Data Migration

Combine schema and data changes in one migration.

```sql
-- migrate:up
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Backfill data
UPDATE users SET full_name = first_name || ' ' || last_name
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- migrate:down
ALTER TABLE users DROP COLUMN full_name;
```

**Pros:** Simple, atomic
**Cons:** Can be slow on large tables

### Separate Data Migration

Run data migration separately from schema migration.

**Schema migration:**

```sql
-- 20240115_add_full_name.sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
```

**Data migration script:**

```ruby
# backfill_full_name.rb
User.find_in_batches(batch_size: 1000) do |batch|
  batch.each do |user|
    user.update_column(:full_name, "#{user.first_name} #{user.last_name}")
  end
  sleep 0.1  # Be nice to the database
end
```

**Pros:** Can pause/resume, won't timeout
**Cons:** More complex, requires orchestration

### Batched Data Migration

Process data in chunks to avoid long locks.

```sql
-- Backfill in batches
DO $$
DECLARE
    batch_size INTEGER := 1000;
    rows_updated INTEGER;
BEGIN
    LOOP
        UPDATE users SET full_name = first_name || ' ' || last_name
        WHERE full_name IS NULL AND id IN (
            SELECT id FROM users WHERE full_name IS NULL LIMIT batch_size
        );

        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        EXIT WHEN rows_updated = 0;

        RAISE NOTICE 'Updated % rows', rows_updated;
        COMMIT;  -- Release locks
        PERFORM pg_sleep(0.1);  -- Throttle
    END LOOP;
END $$;
```

---

## Framework-Specific Patterns

### Rails (Active Record)

**Generate migration:**

```bash
rails generate migration AddEmailToUsers email:string
```

**Migration file:**

```ruby
class AddEmailToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :email, :string
    add_index :users, :email, unique: true
  end
end
```

**Run migration:**

```bash
rails db:migrate
```

**Rollback:**

```bash
rails db:rollback
```

**Disable DDL transactions (for concurrent indexes):**

```ruby
class AddIndexToUsers < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  def change
    add_index :users, :email, algorithm: :concurrently
  end
end
```

### Django

**Create migration:**

```bash
python manage.py makemigrations
```

**Migration file:**

```python
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254),
        ),
    ]
```

**Run migration:**

```bash
python manage.py migrate
```

**Data migration:**

```python
from django.db import migrations

def backfill_full_name(apps, schema_editor):
    User = apps.get_model('myapp', 'User')
    for user in User.objects.all():
        user.full_name = f"{user.first_name} {user.last_name}"
        user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0002_add_full_name'),
    ]

    operations = [
        migrations.RunPython(backfill_full_name),
    ]
```

### Node.js (TypeORM)

**Generate migration:**

```bash
typeorm migration:create -n AddEmailToUsers
```

**Migration file:**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailToUsers1642234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users ADD COLUMN email VARCHAR(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users DROP COLUMN email
        `);
  }
}
```

**Run migration:**

```bash
typeorm migration:run
```

### Prisma

**Update schema file:**

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

**Create migration:**

```bash
prisma migrate dev --name add_email_to_users
```

**Deploy to production:**

```bash
prisma migrate deploy
```

### golang-migrate

**Create migration:**

```bash
migrate create -ext sql -dir db/migrations -seq add_email_to_users
```

**Up migration (000001_add_email_to_users.up.sql):**

```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);
CREATE INDEX idx_users_email ON users(email);
```

**Down migration (000001_add_email_to_users.down.sql):**

```sql
DROP INDEX idx_users_email;
ALTER TABLE users DROP COLUMN email;
```

**Run migration:**

```bash
migrate -path db/migrations -database postgres://localhost/mydb up
```

---

## Testing Migrations

### Test in Development

```bash
# Apply migration
rails db:migrate

# Test rollback
rails db:rollback

# Re-apply
rails db:migrate

# Check schema
rails db:schema:dump
```

### Test with Production Data

**Copy production data to staging:**

```bash
# Export production schema and sample data
pg_dump -h prod.example.com -U user -d proddb --schema-only > schema.sql
pg_dump -h prod.example.com -U user -d proddb \
  --table users --data-only --inserts > users_sample.sql

# Import to staging
psql -h staging.example.com -U user -d stagingdb < schema.sql
psql -h staging.example.com -U user -d stagingdb < users_sample.sql

# Run migration on staging
rails db:migrate
```

### Measure Migration Performance

```sql
-- Time a migration
\timing on
ALTER TABLE users ADD COLUMN email VARCHAR(255);
-- Time: 1234.567 ms
```

**Estimate table lock time:**

```sql
EXPLAIN ANALYZE
ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT 'noemail@example.com';
```

### Test with Large Datasets

Create test data to simulate production:

```sql
-- Generate 1 million test users
INSERT INTO users (username, created_at)
SELECT
    'user' || generate_series || '@example.com',
    NOW() - (random() * INTERVAL '365 days')
FROM generate_series(1, 1000000);
```

---

## Production Migration Checklist

### Before Migration

- [ ] Review migration code with team
- [ ] Test migration in development
- [ ] Test migration in staging with production-like data
- [ ] Test rollback procedure
- [ ] Estimate migration duration
- [ ] **Backup production database**
- [ ] Schedule during low-traffic window
- [ ] Notify team of maintenance window
- [ ] Prepare rollback plan
- [ ] Monitor database metrics before migration

### During Migration

- [ ] Enable maintenance mode if needed
- [ ] Run migration
- [ ] Monitor for errors
- [ ] Check database locks
- [ ] Verify data integrity
- [ ] Monitor application performance
- [ ] Monitor database metrics

### After Migration

- [ ] Verify application functions correctly
- [ ] Check for errors in logs
- [ ] Monitor performance metrics
- [ ] Re-enable traffic
- [ ] Document any issues
- [ ] Keep backup until migration is verified successful

### Emergency Rollback

- [ ] Enable maintenance mode
- [ ] Stop application processes
- [ ] Run rollback migration
- [ ] Restore from backup if needed
- [ ] Verify data integrity
- [ ] Restart application
- [ ] Document what went wrong

---

## Advanced Techniques

### Ghost Schema Pattern

Create new schema alongside old, then swap.

```sql
-- Create new version of table with changes
CREATE TABLE users_v2 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,  -- New column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data
INSERT INTO users_v2 (id, username, email, created_at)
SELECT id, username, 'noemail@example.com', created_at FROM users;

-- Swap tables atomically
BEGIN;
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_v2 RENAME TO users;
COMMIT;

-- Verify and drop old table
DROP TABLE users_old;
```

### Online Schema Change Tools

For very large tables, use specialized tools:

**gh-ost (GitHub):**

```bash
gh-ost \
  --user="root" \
  --password="password" \
  --host=localhost \
  --database=mydb \
  --table=users \
  --alter="ADD COLUMN email VARCHAR(255)" \
  --execute
```

**pt-online-schema-change (Percona):**

```bash
pt-online-schema-change \
  --alter "ADD COLUMN email VARCHAR(255)" \
  D=mydb,t=users \
  --execute
```

These tools:

- Create shadow table with changes
- Copy data in chunks
- Swap tables atomically
- Minimal locking

### Blue-Green Database Migrations

For critical migrations:

1. Duplicate production database to "green"
2. Apply migration to green
3. Deploy application pointing to green
4. Keep blue as rollback option

---

## Common Migration Mistakes

### Mistake 1: Not Using Transactions

```sql
-- BAD: No transaction
CREATE TABLE orders (...);
CREATE INDEX idx_orders_user (user_id);
-- If second command fails, table exists without index
```

```sql
-- GOOD: Transaction ensures atomicity
BEGIN;
CREATE TABLE orders (...);
CREATE INDEX idx_orders_user (user_id);
COMMIT;
```

### Mistake 2: Adding NOT NULL Without Default

```sql
-- BAD: Fails on existing rows
ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL;
```

```sql
-- GOOD: Add with default, then remove default
ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT 'noemail@example.com' NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP DEFAULT;
```

### Mistake 3: Forgetting Indexes on Foreign Keys

```sql
-- BAD: Foreign key without index (slow joins)
ALTER TABLE posts ADD COLUMN user_id INTEGER REFERENCES users(id);
```

```sql
-- GOOD: Add index for foreign key
ALTER TABLE posts ADD COLUMN user_id INTEGER REFERENCES users(id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### Mistake 4: Running Long Migrations During Peak Hours

Schedule intensive migrations during low-traffic periods.

### Mistake 5: Not Testing Rollback

Always test that `down` migration works before production.

---

## Summary

**Golden Rules:**

1. **Always backup before migrations**
2. **Test in staging with production-like data**
3. **Use transactions when possible**
4. **Make migrations reversible**
5. **Keep migrations small and focused**
6. **Use concurrent index creation for large tables**
7. **Coordinate schema changes with code deploys**
8. **Document expected downtime**
9. **Have a rollback plan**
10. **Monitor during and after migration**

Refer to this guide when planning and executing database migrations to ensure safe, reliable schema evolution.
