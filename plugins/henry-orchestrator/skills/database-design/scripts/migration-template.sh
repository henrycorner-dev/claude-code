#!/bin/bash
# Generate a database migration file template
# Usage: ./migration-template.sh [migration_name] [type]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Show help
show_help() {
    cat << EOF
Usage: $0 [OPTIONS] MIGRATION_NAME [TYPE]

Generate a timestamped database migration file template.

ARGUMENTS:
    MIGRATION_NAME      Name of the migration (e.g., "add_email_to_users")
    TYPE               Type of migration (optional):
                        - table: Create/drop table
                        - column: Add/remove column
                        - index: Add/remove index
                        - data: Data migration
                        - constraint: Add/remove constraint
                        - default: Generic migration (default)

OPTIONS:
    -h, --help          Show this help message
    -d, --dir DIR       Output directory (default: ./migrations)
    -f, --format FMT    Format: sql (default), js, ts, rb, py
    -s, --separator SEP Separator for migration name: underscore (default), dash

EXAMPLES:
    # Generate SQL migration
    $0 add_email_to_users column

    # Generate TypeScript migration
    $0 -f ts create_users_table table

    # Generate Ruby migration in custom directory
    $0 -d db/migrate add_user_index index

    # Generate data migration
    $0 backfill_user_names data
EOF
}

# Default options
OUTPUT_DIR="./migrations"
FORMAT="sql"
SEPARATOR="_"
MIGRATION_TYPE="default"

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -s|--separator)
            SEPARATOR="$2"
            shift 2
            ;;
        *)
            break
            ;;
    esac
done

# Check arguments
if [ $# -lt 1 ]; then
    echo "Error: Missing migration name"
    echo ""
    show_help
    exit 1
fi

MIGRATION_NAME="$1"
if [ $# -ge 2 ]; then
    MIGRATION_TYPE="$2"
fi

# Convert name based on separator
if [ "$SEPARATOR" == "dash" ]; then
    MIGRATION_NAME="${MIGRATION_NAME//_/-}"
fi

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Determine file extension
case $FORMAT in
    sql)
        EXT="sql"
        ;;
    js)
        EXT="js"
        ;;
    ts)
        EXT="ts"
        ;;
    rb)
        EXT="rb"
        ;;
    py)
        EXT="py"
        ;;
    *)
        echo "Error: Unknown format '$FORMAT'"
        exit 1
        ;;
esac

# Generate filename
FILENAME="${TIMESTAMP}_${MIGRATION_NAME}.${EXT}"
FILEPATH="${OUTPUT_DIR}/${FILENAME}"

# Generate migration template based on type and format
generate_sql_migration() {
    local type=$1
    case $type in
        table)
            cat > "$FILEPATH" << 'EOF'
-- Migration: Create table
-- Created: TIMESTAMP

-- migrate:up
CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_table_name_field ON table_name(field);

-- migrate:down
DROP TABLE IF EXISTS table_name;
EOF
            ;;
        column)
            cat > "$FILEPATH" << 'EOF'
-- Migration: Add column
-- Created: TIMESTAMP

-- migrate:up
ALTER TABLE table_name ADD COLUMN column_name VARCHAR(255);

-- Optional: Update existing rows
-- UPDATE table_name SET column_name = 'default_value' WHERE column_name IS NULL;

-- Optional: Add NOT NULL constraint
-- ALTER TABLE table_name ALTER COLUMN column_name SET NOT NULL;

-- migrate:down
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
EOF
            ;;
        index)
            cat > "$FILEPATH" << 'EOF'
-- Migration: Add index
-- Created: TIMESTAMP

-- migrate:up
CREATE INDEX idx_table_name_column ON table_name(column_name);

-- For PostgreSQL, use CONCURRENTLY to avoid blocking writes:
-- CREATE INDEX CONCURRENTLY idx_table_name_column ON table_name(column_name);

-- Composite index:
-- CREATE INDEX idx_table_name_col1_col2 ON table_name(column1, column2);

-- Partial index:
-- CREATE INDEX idx_table_name_column ON table_name(column_name) WHERE condition;

-- migrate:down
DROP INDEX IF EXISTS idx_table_name_column;

-- For PostgreSQL CONCURRENTLY:
-- DROP INDEX CONCURRENTLY IF EXISTS idx_table_name_column;
EOF
            ;;
        constraint)
            cat > "$FILEPATH" << 'EOF'
-- Migration: Add constraint
-- Created: TIMESTAMP

-- migrate:up

-- Foreign key constraint
ALTER TABLE table_name
    ADD CONSTRAINT fk_table_name_ref
    FOREIGN KEY (ref_id) REFERENCES ref_table(id);

-- Unique constraint
-- ALTER TABLE table_name
--     ADD CONSTRAINT unique_table_name_column UNIQUE (column_name);

-- Check constraint
-- ALTER TABLE table_name
--     ADD CONSTRAINT check_table_name_condition
--     CHECK (column_name > 0);

-- NOT NULL constraint
-- ALTER TABLE table_name
--     ALTER COLUMN column_name SET NOT NULL;

-- migrate:down
ALTER TABLE table_name DROP CONSTRAINT IF EXISTS fk_table_name_ref;
EOF
            ;;
        data)
            cat > "$FILEPATH" << 'EOF'
-- Migration: Data migration
-- Created: TIMESTAMP

-- migrate:up

-- Simple data update
UPDATE table_name
SET column_name = 'new_value'
WHERE condition;

-- Batch update for large tables (PostgreSQL)
-- DO $$
-- DECLARE
--     batch_size INTEGER := 1000;
--     rows_updated INTEGER;
-- BEGIN
--     LOOP
--         UPDATE table_name
--         SET column_name = 'new_value'
--         WHERE id IN (
--             SELECT id FROM table_name
--             WHERE column_name IS NULL
--             LIMIT batch_size
--         );
--
--         GET DIAGNOSTICS rows_updated = ROW_COUNT;
--         EXIT WHEN rows_updated = 0;
--
--         RAISE NOTICE 'Updated % rows', rows_updated;
--         COMMIT;
--         PERFORM pg_sleep(0.1);
--     END LOOP;
-- END $$;

-- migrate:down
-- WARNING: Data migrations are often not reversible
-- Consider backing up data before running this migration
UPDATE table_name
SET column_name = NULL
WHERE column_name = 'new_value';
EOF
            ;;
        *)
            cat > "$FILEPATH" << 'EOF'
-- Migration: Description
-- Created: TIMESTAMP

-- migrate:up
-- Add your migration SQL here


-- migrate:down
-- Add rollback SQL here

EOF
            ;;
    esac
}

generate_typescript_migration() {
    cat > "$FILEPATH" << 'EOF'
import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationNameTIMESTAMP implements MigrationInterface {
    name = 'MigrationNameTIMESTAMP'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add migration SQL here
        await queryRunner.query(`
            -- Your SQL here
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add rollback SQL here
        await queryRunner.query(`
            -- Your rollback SQL here
        `);
    }
}
EOF
}

generate_javascript_migration() {
    cat > "$FILEPATH" << 'EOF'
/**
 * Migration: Description
 * Created: TIMESTAMP
 */

exports.up = function(knex) {
    return knex.schema
        .createTable('table_name', function(table) {
            table.increments('id').primary();
            table.string('name', 255).notNullable();
            table.timestamps(true, true);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('table_name');
};
EOF
}

generate_ruby_migration() {
    cat > "$FILEPATH" << 'EOF'
class MigrationName < ActiveRecord::Migration[7.0]
  def change
    create_table :table_name do |t|
      t.string :name, null: false
      t.timestamps
    end

    add_index :table_name, :name
  end
end
EOF
}

generate_python_migration() {
    cat > "$FILEPATH" << 'EOF'
"""
Migration: Description
Created: TIMESTAMP
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = 'REVISION_ID'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add migration SQL here
    op.create_table(
        'table_name',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_table_name_name', 'table_name', ['name'])


def downgrade() -> None:
    # Add rollback SQL here
    op.drop_index('idx_table_name_name', table_name='table_name')
    op.drop_table('table_name')
EOF
}

# Generate migration based on format
case $FORMAT in
    sql)
        generate_sql_migration "$MIGRATION_TYPE"
        ;;
    ts)
        generate_typescript_migration
        ;;
    js)
        generate_javascript_migration
        ;;
    rb)
        generate_ruby_migration
        ;;
    py)
        generate_python_migration
        ;;
esac

# Replace placeholders
sed -i.bak "s/TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S')/g" "$FILEPATH"
sed -i.bak "s/MigrationName/$(echo $MIGRATION_NAME | sed 's/_/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1' | sed 's/ //g')/g" "$FILEPATH"
rm "${FILEPATH}.bak" 2>/dev/null || true

echo -e "${GREEN}✓ Migration created successfully${NC}"
echo -e "${BLUE}File:${NC} $FILEPATH"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Edit the migration file and add your schema changes"
echo "  2. Test the migration in development"
echo "  3. Run the migration: <your-migration-tool> up"
echo ""
echo -e "${YELLOW}Safety checklist:${NC}"
echo "  □ Migration has both 'up' and 'down' (rollback)"
echo "  □ Tested on development database"
echo "  □ Consider using transactions"
echo "  □ Use CONCURRENTLY for indexes on large tables"
echo "  □ Backup production before running"
