/**
 * Realm Sync Configuration Example
 *
 * This example demonstrates how to configure Realm with MongoDB Realm Sync
 * for offline-first mobile and web applications.
 */

import Realm from 'realm';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

const TaskSchema = {
  name: 'Task',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    title: 'string',
    description: 'string?',
    completed: { type: 'bool', default: false },
    priority: { type: 'int', default: 0 },
    owner_id: 'string',
    project_id: 'string?',
    created_at: 'date',
    updated_at: 'date',
    due_date: 'date?',
  },
};

const ProjectSchema = {
  name: 'Project',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    name: 'string',
    description: 'string?',
    owner_id: 'string',
    members: 'string[]',
    created_at: 'date',
    updated_at: 'date',
  },
};

const UserProfileSchema = {
  name: 'UserProfile',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    user_id: 'string',
    display_name: 'string',
    email: 'string',
    avatar_url: 'string?',
    preferences: 'string?', // JSON string
    created_at: 'date',
    updated_at: 'date',
  },
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

class RealmAuthManager {
  constructor(appId) {
    this.app = new Realm.App({ id: appId });
  }

  /**
   * Login with email/password
   */
  async loginEmailPassword(email, password) {
    try {
      const credentials = Realm.Credentials.emailPassword(email, password);
      const user = await this.app.logIn(credentials);
      console.log('Logged in successfully:', user.id);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async registerUser(email, password) {
    try {
      await this.app.emailPasswordAuth.registerUser({ email, password });
      console.log('User registered successfully');
      return await this.loginEmailPassword(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login anonymously
   */
  async loginAnonymous() {
    try {
      const credentials = Realm.Credentials.anonymous();
      const user = await this.app.logIn(credentials);
      console.log('Logged in anonymously:', user.id);
      return user;
    } catch (error) {
      console.error('Anonymous login failed:', error);
      throw error;
    }
  }

  /**
   * Login with API key
   */
  async loginApiKey(apiKey) {
    try {
      const credentials = Realm.Credentials.apiKey(apiKey);
      const user = await this.app.logIn(credentials);
      console.log('Logged in with API key:', user.id);
      return user;
    } catch (error) {
      console.error('API key login failed:', error);
      throw error;
    }
  }

  /**
   * Login with custom JWT
   */
  async loginJWT(jwtToken) {
    try {
      const credentials = Realm.Credentials.jwt(jwtToken);
      const user = await this.app.logIn(credentials);
      console.log('Logged in with JWT:', user.id);
      return user;
    } catch (error) {
      console.error('JWT login failed:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    if (this.app.currentUser) {
      await this.app.currentUser.logOut();
      console.log('Logged out successfully');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.app.currentUser;
  }
}

// ============================================================================
// PARTITION-BASED SYNC
// ============================================================================

class PartitionBasedSync {
  constructor(appId) {
    this.app = new Realm.App({ id: appId });
    this.realm = null;
  }

  async openRealm(user, partitionValue) {
    try {
      const config = {
        schema: [TaskSchema, ProjectSchema, UserProfileSchema],
        sync: {
          user: user,
          partitionValue: partitionValue,
          newRealmFileBehavior: {
            type: 'downloadBeforeOpen',
            timeOut: 5000,
          },
          existingRealmFileBehavior: {
            type: 'openImmediately',
          },
          clientReset: {
            mode: 'recoverOrDiscard',
          },
        },
      };

      this.realm = await Realm.open(config);
      console.log('Realm opened successfully');

      this.setupSyncListeners();

      return this.realm;
    } catch (error) {
      console.error('Failed to open Realm:', error);
      throw error;
    }
  }

  setupSyncListeners() {
    const syncSession = this.realm.syncSession;

    // Connection state notifications
    syncSession.addConnectionNotification((newState, oldState) => {
      console.log(`Connection state changed: ${oldState} -> ${newState}`);
    });

    // Upload progress
    syncSession.addProgressNotification(
      'upload',
      'reportIndefinitely',
      (transferred, transferable) => {
        console.log(`Upload progress: ${transferred}/${transferable} bytes`);
      }
    );

    // Download progress
    syncSession.addProgressNotification(
      'download',
      'reportIndefinitely',
      (transferred, transferable) => {
        console.log(`Download progress: ${transferred}/${transferable} bytes`);
      }
    );

    // Sync errors
    syncSession.addErrorNotification((session, error) => {
      console.error('Sync error:', error);
    });
  }

  // CRUD operations
  createTask(title, description, ownerId) {
    return this.realm.write(() => {
      return this.realm.create('Task', {
        _id: new Realm.BSON.ObjectId(),
        title,
        description,
        completed: false,
        priority: 0,
        owner_id: ownerId,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
  }

  getTasks() {
    return this.realm.objects('Task').filtered('owner_id != null');
  }

  updateTask(taskId, updates) {
    const task = this.realm.objectForPrimaryKey('Task', taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    this.realm.write(() => {
      Object.assign(task, updates);
      task.updated_at = new Date();
    });

    return task;
  }

  deleteTask(taskId) {
    const task = this.realm.objectForPrimaryKey('Task', taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    this.realm.write(() => {
      this.realm.delete(task);
    });
  }

  close() {
    if (this.realm) {
      this.realm.close();
    }
  }
}

// ============================================================================
// FLEXIBLE SYNC
// ============================================================================

class FlexibleSync {
  constructor(appId) {
    this.app = new Realm.App({ id: appId });
    this.realm = null;
  }

  async openRealm(user) {
    try {
      const config = {
        schema: [TaskSchema, ProjectSchema, UserProfileSchema],
        sync: {
          user: user,
          flexible: true,
          newRealmFileBehavior: {
            type: 'downloadBeforeOpen',
          },
          clientReset: {
            mode: 'recoverOrDiscard',
            onBefore: realm => {
              console.log('Client reset about to happen');
            },
            onAfter: (beforeRealm, afterRealm) => {
              console.log('Client reset completed');
            },
          },
        },
      };

      this.realm = await Realm.open(config);
      console.log('Realm with flexible sync opened successfully');

      return this.realm;
    } catch (error) {
      console.error('Failed to open Realm:', error);
      throw error;
    }
  }

  async setupSubscriptions(userId) {
    await this.realm.subscriptions.update(mutableSubs => {
      // Subscribe to user's own tasks
      mutableSubs.add(this.realm.objects('Task').filtered('owner_id == $0', userId), {
        name: 'myTasks',
      });

      // Subscribe to user's projects
      mutableSubs.add(
        this.realm.objects('Project').filtered('owner_id == $0 OR members IN $0', userId),
        { name: 'myProjects' }
      );

      // Subscribe to user profile
      mutableSubs.add(this.realm.objects('UserProfile').filtered('user_id == $0', userId), {
        name: 'myProfile',
      });
    });

    // Wait for initial sync to complete
    await this.realm.subscriptions.waitForSynchronization();

    console.log('Subscriptions set up and synchronized');
  }

  async updateSubscriptions(userId, projectIds) {
    await this.realm.subscriptions.update(mutableSubs => {
      // Remove old project tasks subscription
      mutableSubs.removeByName('projectTasks');

      // Add new project tasks subscription
      mutableSubs.add(this.realm.objects('Task').filtered('project_id IN $0', projectIds), {
        name: 'projectTasks',
      });
    });

    await this.realm.subscriptions.waitForSynchronization();

    console.log('Subscriptions updated');
  }

  getSubscriptions() {
    return Array.from(this.realm.subscriptions);
  }

  // CRUD operations (same as partition-based)
  createTask(title, description, ownerId) {
    return this.realm.write(() => {
      return this.realm.create('Task', {
        _id: new Realm.BSON.ObjectId(),
        title,
        description,
        completed: false,
        priority: 0,
        owner_id: ownerId,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
  }

  getTasks() {
    return this.realm.objects('Task');
  }

  updateTask(taskId, updates) {
    const task = this.realm.objectForPrimaryKey('Task', taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    this.realm.write(() => {
      Object.assign(task, updates);
      task.updated_at = new Date();
    });

    return task;
  }

  deleteTask(taskId) {
    const task = this.realm.objectForPrimaryKey('Task', taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    this.realm.write(() => {
      this.realm.delete(task);
    });
  }

  close() {
    if (this.realm) {
      this.realm.close();
    }
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Partition-based sync
async function partitionSyncExample() {
  console.log('=== Partition-Based Sync Example ===');

  const APP_ID = 'your-realm-app-id';

  // Authenticate
  const authManager = new RealmAuthManager(APP_ID);
  const user = await authManager.loginEmailPassword('user@example.com', 'password');

  // Open Realm with partition (user-specific data)
  const sync = new PartitionBasedSync(APP_ID);
  await sync.openRealm(user, user.id);

  // Create task
  const task = sync.createTask('My Task', 'Task description', user.id);
  console.log('Created task:', task);

  // Get tasks
  const tasks = sync.getTasks();
  console.log('All tasks:', tasks);

  // Update task
  sync.updateTask(task._id, { completed: true });
  console.log('Updated task');

  // Close Realm
  sync.close();
}

// Example 2: Flexible sync
async function flexibleSyncExample() {
  console.log('=== Flexible Sync Example ===');

  const APP_ID = 'your-realm-app-id';

  // Authenticate
  const authManager = new RealmAuthManager(APP_ID);
  const user = await authManager.loginAnonymous();

  // Open Realm with flexible sync
  const sync = new FlexibleSync(APP_ID);
  await sync.openRealm(user);

  // Setup subscriptions
  await sync.setupSubscriptions(user.id);

  // Create task
  const task = sync.createTask('Flexible Task', 'Description', user.id);
  console.log('Created task:', task);

  // Get subscriptions
  const subscriptions = sync.getSubscriptions();
  console.log('Active subscriptions:', subscriptions);

  // Close Realm
  sync.close();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RealmAuthManager,
    PartitionBasedSync,
    FlexibleSync,
    TaskSchema,
    ProjectSchema,
    UserProfileSchema,
  };
}
