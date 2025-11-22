"""
SQL Injection Prevention Examples
Demonstrates secure database query patterns
"""

import sqlite3
from typing import Optional, List, Dict, Any


# INSECURE: Never do this!
def insecure_login(username: str, password: str):
    """
    VULNERABLE to SQL injection
    DO NOT USE THIS PATTERN
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # String concatenation - DANGEROUS!
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()

    return user


# Example attack on insecure_login:
# username = "admin' OR '1'='1' --"
# password = "anything"
# Resulting query: SELECT * FROM users WHERE username = 'admin' OR '1'='1' --' AND password = 'anything'
# This bypasses authentication!


# SECURE: Use parameterized queries
def secure_login(username: str, password: str) -> Optional[Dict]:
    """
    Secure login using parameterized query
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Parameterized query - SAFE
    query = "SELECT * FROM users WHERE username = ? AND password = ?"

    cursor.execute(query, (username, password))
    user = cursor.fetchone()
    conn.close()

    return user


def get_user_by_id(user_id: int) -> Optional[Dict]:
    """
    Fetch user by ID using parameterized query
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    return user


def search_users(search_term: str) -> List[Dict]:
    """
    Search users with LIKE - still parameterized
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Parameterize the search term, not the % wildcards
    query = "SELECT * FROM users WHERE username LIKE ?"

    # Add wildcards in Python, not in SQL
    search_pattern = f"%{search_term}%"

    cursor.execute(query, (search_pattern,))
    users = cursor.fetchall()
    conn.close()

    return users


def update_user_email(user_id: int, new_email: str) -> bool:
    """
    Update user email securely
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    query = "UPDATE users SET email = ? WHERE id = ?"

    cursor.execute(query, (new_email, user_id))
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    return affected > 0


def delete_user(user_id: int) -> bool:
    """
    Delete user securely
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    query = "DELETE FROM users WHERE id = ?"

    cursor.execute(query, (user_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    return affected > 0


def get_users_by_status(status: str) -> List[Dict]:
    """
    Filter users by status
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Validate status against whitelist before query
    allowed_statuses = {'active', 'inactive', 'suspended'}
    if status not in allowed_statuses:
        raise ValueError(f"Invalid status. Must be one of: {allowed_statuses}")

    cursor.execute("SELECT * FROM users WHERE status = ?", (status,))
    users = cursor.fetchall()
    conn.close()

    return users


def dynamic_order_by(column: str, direction: str = 'ASC') -> List[Dict]:
    """
    Dynamic ORDER BY with whitelist validation
    Note: ORDER BY cannot be parameterized, so use whitelist
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Whitelist allowed columns
    allowed_columns = {'id', 'username', 'email', 'created_at'}
    if column not in allowed_columns:
        raise ValueError(f"Invalid column. Must be one of: {allowed_columns}")

    # Whitelist direction
    if direction.upper() not in {'ASC', 'DESC'}:
        raise ValueError("Direction must be ASC or DESC")

    # Build query with validated inputs
    query = f"SELECT * FROM users ORDER BY {column} {direction.upper()}"

    cursor.execute(query)
    users = cursor.fetchall()
    conn.close()

    return users


def batch_insert_users(users: List[Dict]) -> bool:
    """
    Batch insert multiple users securely
    """
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"

    # Prepare data tuples
    data = [(u['username'], u['email'], u['password_hash']) for u in users]

    cursor.executemany(query, data)
    conn.commit()
    conn.close()

    return True


# ORM Examples (SQLAlchemy)
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)


# Create engine and session
engine = create_engine('sqlite:///database.db')
Session = sessionmaker(bind=engine)


def orm_login(username: str, password_hash: str) -> Optional[User]:
    """
    ORM-based login (automatically parameterized)
    """
    session = Session()

    user = session.query(User).filter_by(
        username=username,
        password_hash=password_hash
    ).first()

    session.close()
    return user


def orm_search_users(search_term: str) -> List[User]:
    """
    ORM-based search with LIKE
    """
    session = Session()

    users = session.query(User).filter(
        User.username.like(f"%{search_term}%")
    ).all()

    session.close()
    return users


def orm_update_email(user_id: int, new_email: str) -> bool:
    """
    ORM-based update
    """
    session = Session()

    user = session.query(User).filter_by(id=user_id).first()

    if user:
        user.email = new_email
        session.commit()
        session.close()
        return True

    session.close()
    return False


# PostgreSQL with psycopg2
import psycopg2
from psycopg2 import sql


def postgres_dynamic_table(table_name: str, user_id: int):
    """
    Dynamic table name with identifier composition
    """
    conn = psycopg2.connect("dbname=mydb user=postgres")
    cursor = conn.cursor()

    # Whitelist table names
    allowed_tables = {'users', 'admins', 'moderators'}
    if table_name not in allowed_tables:
        raise ValueError(f"Invalid table. Must be one of: {allowed_tables}")

    # Use sql.Identifier for table name, parameterize values
    query = sql.SQL("SELECT * FROM {} WHERE id = %s").format(
        sql.Identifier(table_name)
    )

    cursor.execute(query, (user_id,))
    result = cursor.fetchone()
    conn.close()

    return result


def postgres_bulk_insert(users: List[Dict]):
    """
    Efficient bulk insert in PostgreSQL
    """
    conn = psycopg2.connect("dbname=mydb user=postgres")
    cursor = conn.cursor()

    # Use COPY for efficient bulk insert
    from io import StringIO

    # Or use execute_values
    from psycopg2.extras import execute_values

    query = "INSERT INTO users (username, email, password_hash) VALUES %s"

    values = [(u['username'], u['email'], u['password_hash']) for u in users]

    execute_values(cursor, query, values)
    conn.commit()
    conn.close()


# NoSQL (MongoDB) Examples
from pymongo import MongoClient


def mongo_secure_query(username: str):
    """
    Secure MongoDB query
    """
    client = MongoClient('mongodb://localhost:27017/')
    db = client['mydb']
    users = db['users']

    # Use explicit $eq operator to prevent injection
    user = users.find_one({
        'username': {'$eq': username}
    })

    return user


def mongo_insecure_query(username: str):
    """
    INSECURE MongoDB query
    DO NOT USE THIS PATTERN
    """
    client = MongoClient('mongodb://localhost:27017/')
    db = client['mydb']
    users = db['users']

    # Vulnerable if username is a dict like {"$ne": None}
    user = users.find_one({'username': username})

    return user


def mongo_sanitize_input(user_input: Any) -> str:
    """
    Sanitize MongoDB input
    """
    # Ensure input is a string, not a dict
    if not isinstance(user_input, str):
        raise ValueError("Input must be a string")

    return user_input


# Example usage and testing
if __name__ == '__main__':
    # Create test database
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert test user
    cursor.execute(
        "INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)",
        ('admin', 'admin@example.com', 'hashed_password')
    )

    conn.commit()
    conn.close()

    # Test secure login
    user = secure_login('admin', 'hashed_password')
    print(f"Secure login result: {user}")

    # Test SQL injection attempt (should fail safely)
    user = secure_login("admin' OR '1'='1' --", 'anything')
    print(f"Injection attempt result: {user}")  # Should be None

    # Test search
    users = search_users('adm')
    print(f"Search results: {users}")

    # Test dynamic ordering
    users = dynamic_order_by('username', 'DESC')
    print(f"Ordered users: {users}")
