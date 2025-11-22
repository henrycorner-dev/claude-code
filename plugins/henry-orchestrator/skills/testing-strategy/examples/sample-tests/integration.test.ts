/**
 * Example integration tests demonstrating API testing with database
 * Tests interaction between multiple layers (API, service, database)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Express app and database
// In real tests, you would import actual app and use test database
type Request = { body: any; params: any; query: any };
type Response = {
  status: (code: number) => Response;
  json: (data: any) => void;
  send: (data: any) => void;
};

// Mock database
class Database {
  private data: Map<string, any> = new Map();

  async insert(table: string, record: any): Promise<any> {
    const id = Math.random().toString(36).substring(7);
    const newRecord = { id, ...record, createdAt: new Date() };
    this.data.set(`${table}:${id}`, newRecord);
    return newRecord;
  }

  async find(table: string, id: string): Promise<any | null> {
    return this.data.get(`${table}:${id}`) || null;
  }

  async findAll(table: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, value] of this.data.entries()) {
      if (key.startsWith(`${table}:`)) {
        results.push(value);
      }
    }
    return results;
  }

  async update(table: string, id: string, updates: any): Promise<any | null> {
    const record = await this.find(table, id);
    if (!record) return null;
    const updated = { ...record, ...updates, updatedAt: new Date() };
    this.data.set(`${table}:${id}`, updated);
    return updated;
  }

  async delete(table: string, id: string): Promise<boolean> {
    return this.data.delete(`${table}:${id}`);
  }

  async clear() {
    this.data.clear();
  }
}

// Mock API handlers
class UserService {
  constructor(private db: Database) {}

  async createUser(userData: { email: string; name: string }) {
    // Validate
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    // Check duplicate email
    const users = await this.db.findAll('users');
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    // Create user
    return await this.db.insert('users', {
      email: userData.email.toLowerCase(),
      name: userData.name,
    });
  }

  async getUser(id: string) {
    return await this.db.find('users', id);
  }

  async updateUser(id: string, updates: any) {
    const user = await this.db.find('users', id);
    if (!user) {
      throw new Error('User not found');
    }
    return await this.db.update('users', id, updates);
  }

  async deleteUser(id: string) {
    const deleted = await this.db.delete('users', id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return true;
  }
}

// Integration Tests
describe('User API Integration Tests', () => {
  let db: Database;
  let userService: UserService;

  beforeEach(async () => {
    // Setup: Create fresh database for each test
    db = new Database();
    userService = new UserService(db);
  });

  afterEach(async () => {
    // Teardown: Clean up database
    await db.clear();
  });

  describe('POST /api/users', () => {
    it('should create user and persist to database', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };

      // Act
      const user = await userService.createUser(userData);

      // Assert - verify response
      expect(user).toMatchObject({
        id: expect.any(String),
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(Date),
      });

      // Assert - verify database persistence
      const savedUser = await db.find('users', user.id);
      expect(savedUser).toEqual(user);
    });

    it('should normalize email to lowercase', async () => {
      const userData = { email: 'TEST@EXAMPLE.COM', name: 'Test User' };
      const user = await userService.createUser(userData);
      expect(user.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await userService.createUser({
        email: 'test@example.com',
        name: 'User 1',
      });

      // Attempt to create duplicate
      await expect(
        userService.createUser({
          email: 'test@example.com',
          name: 'User 2',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should validate required fields', async () => {
      await expect(userService.createUser({ email: '', name: 'Test' } as any)).rejects.toThrow(
        'Email and name are required'
      );

      await expect(
        userService.createUser({ email: 'test@example.com', name: '' } as any)
      ).rejects.toThrow('Email and name are required');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should retrieve existing user', async () => {
      // Arrange - create user
      const created = await userService.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      // Act - retrieve user
      const user = await userService.getUser(created.id);

      // Assert
      expect(user).toEqual(created);
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUser('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user fields', async () => {
      // Arrange - create user
      const user = await userService.createUser({
        email: 'test@example.com',
        name: 'Original Name',
      });

      // Act - update user
      const updated = await userService.updateUser(user.id, {
        name: 'Updated Name',
      });

      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe('test@example.com'); // Unchanged
      expect(updated.updatedAt).toBeDefined();

      // Verify persistence
      const savedUser = await db.find('users', user.id);
      expect(savedUser.name).toBe('Updated Name');
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.updateUser('non-existent-id', { name: 'New Name' })).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user from database', async () => {
      // Arrange - create user
      const user = await userService.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      // Act - delete user
      await userService.deleteUser(user.id);

      // Assert - verify deletion
      const deletedUser = await db.find('users', user.id);
      expect(deletedUser).toBeNull();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(userService.deleteUser('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('Complex workflows', () => {
    it('should handle multiple users', async () => {
      // Create multiple users
      const user1 = await userService.createUser({
        email: 'user1@example.com',
        name: 'User 1',
      });
      const user2 = await userService.createUser({
        email: 'user2@example.com',
        name: 'User 2',
      });

      // Verify all users exist
      const users = await db.findAll('users');
      expect(users).toHaveLength(2);
      expect(users.map(u => u.email)).toEqual(['user1@example.com', 'user2@example.com']);
    });

    it('should handle create-update-delete workflow', async () => {
      // Create
      const user = await userService.createUser({
        email: 'test@example.com',
        name: 'Original',
      });
      expect(user.name).toBe('Original');

      // Update
      await userService.updateUser(user.id, { name: 'Updated' });
      const updated = await userService.getUser(user.id);
      expect(updated?.name).toBe('Updated');

      // Delete
      await userService.deleteUser(user.id);
      const deleted = await userService.getUser(user.id);
      expect(deleted).toBeNull();
    });
  });
});
