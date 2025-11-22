# Monolith Project Structure

This example shows a well-organized monolithic application structure with clear separation of concerns and modular design.

## Modular Monolith Structure (Recommended)

```
project-root/
├── src/
│   ├── modules/                    # Domain modules
│   │   ├── users/                  # User management module
│   │   │   ├── domain/             # Domain models and business logic
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── user.repository.ts (interface)
│   │   │   │   └── user.service.ts
│   │   │   ├── infrastructure/     # Infrastructure concerns
│   │   │   │   ├── user.repository.impl.ts
│   │   │   │   └── user.schema.ts  # Database schema
│   │   │   ├── application/        # Use cases/application services
│   │   │   │   ├── create-user.use-case.ts
│   │   │   │   ├── get-user.use-case.ts
│   │   │   │   └── update-user.use-case.ts
│   │   │   ├── api/                # HTTP controllers
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.dto.ts
│   │   │   └── index.ts            # Module exports
│   │   │
│   │   ├── auth/                   # Authentication module
│   │   │   ├── domain/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── token.service.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── jwt.service.impl.ts
│   │   │   ├── application/
│   │   │   │   ├── login.use-case.ts
│   │   │   │   └── refresh-token.use-case.ts
│   │   │   ├── api/
│   │   │   │   └── auth.controller.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── orders/                 # Orders module
│   │   │   ├── domain/
│   │   │   │   ├── order.entity.ts
│   │   │   │   ├── order.repository.ts
│   │   │   │   └── order.service.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── order.repository.impl.ts
│   │   │   │   └── order.schema.ts
│   │   │   ├── application/
│   │   │   │   ├── create-order.use-case.ts
│   │   │   │   ├── process-order.use-case.ts
│   │   │   │   └── cancel-order.use-case.ts
│   │   │   ├── api/
│   │   │   │   └── orders.controller.ts
│   │   │   └── index.ts
│   │   │
│   │   └── products/               # Products module
│   │       ├── domain/
│   │       ├── infrastructure/
│   │       ├── application/
│   │       ├── api/
│   │       └── index.ts
│   │
│   ├── shared/                     # Shared utilities
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── logging.middleware.ts
│   │   ├── types/
│   │   │   └── common.types.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── date.ts
│   │   └── config/
│   │       ├── database.config.ts
│   │       └── app.config.ts
│   │
│   ├── infrastructure/             # Cross-cutting infrastructure
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── migrations/
│   │   ├── cache/
│   │   │   └── redis.client.ts
│   │   ├── queue/
│   │   │   └── job.queue.ts
│   │   └── email/
│   │       └── email.service.ts
│   │
│   ├── app.ts                      # Application setup
│   └── server.ts                   # Server entry point
│
├── tests/
│   ├── unit/                       # Unit tests
│   │   └── modules/
│   │       └── users/
│   │           └── user.service.test.ts
│   ├── integration/                # Integration tests
│   │   └── api/
│   │       └── users.test.ts
│   └── e2e/                        # End-to-end tests
│       └── user-flow.test.ts
│
├── migrations/                     # Database migrations
│   ├── 001_create_users.sql
│   └── 002_create_orders.sql
│
├── scripts/                        # Utility scripts
│   ├── seed.ts
│   └── migrate.ts
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Module Dependency Rules

**Critical principle:** Modules should only depend on their own code and shared utilities, not on other modules.

### Allowed Dependencies

```typescript
// ✅ GOOD: Module depends on shared utilities
// src/modules/users/domain/user.service.ts
import { ValidationError } from '@/shared/types/common.types';

export class UserService {
  validateEmail(email: string) {
    // ...
  }
}
```

```typescript
// ✅ GOOD: Module uses infrastructure interface
// src/modules/users/application/create-user.use-case.ts
import { UserRepository } from '../domain/user.repository';
import { EmailService } from '@/infrastructure/email/email.service';

export class CreateUserUseCase {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService
  ) {}
}
```

### Disallowed Dependencies

```typescript
// ❌ BAD: Direct dependency between modules
// src/modules/orders/domain/order.service.ts
import { UserService } from '@/modules/users/domain/user.service'; // NO!

export class OrderService {
  // Orders module should not directly import from Users module
}
```

**Solution: Use events or shared interfaces**

```typescript
// ✅ GOOD: Use events for cross-module communication
// src/modules/orders/domain/order.service.ts
import { EventBus } from '@/infrastructure/events/event-bus';

export class OrderService {
  async createOrder(userId: string, items: Item[]) {
    const order = await this.orderRepo.create({ userId, items });

    // Emit event instead of calling UserService directly
    await this.eventBus.publish('order.created', {
      orderId: order.id,
      userId: order.userId,
    });

    return order;
  }
}

// src/modules/users/application/order-created.handler.ts
import { EventHandler } from '@/infrastructure/events/event-handler';

export class OrderCreatedHandler implements EventHandler {
  async handle(event: OrderCreatedEvent) {
    // Update user's order count, send email, etc.
  }
}
```

## Layered Architecture Alternative

```
project-root/
├── src/
│   ├── controllers/               # HTTP layer
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   └── orders.controller.ts
│   │
│   ├── services/                  # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── order.service.ts
│   │
│   ├── repositories/              # Data access layer
│   │   ├── user.repository.ts
│   │   └── order.repository.ts
│   │
│   ├── models/                    # Domain models
│   │   ├── user.model.ts
│   │   └── order.model.ts
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── routes/                    # Route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   └── orders.routes.ts
│   │
│   ├── config/                    # Configuration
│   │   ├── database.ts
│   │   └── env.ts
│   │
│   ├── utils/                     # Utilities
│   │   └── validation.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── migrations/
├── package.json
└── tsconfig.json
```

**When to use Layered:**

- Simpler CRUD applications
- Smaller teams
- Rapid prototyping
- Less complex domain logic

**When to use Modular Monolith:**

- Medium to large applications
- Clear domain boundaries
- Plan to potentially extract to microservices
- Multiple teams

## Example Module Implementation

### User Module - Domain Layer

```typescript
// src/modules/users/domain/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    private passwordHash: string,
    public createdAt: Date
  ) {}

  updateEmail(newEmail: string): void {
    // Business rule: Email must be valid
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }
    this.email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  verifyPassword(password: string, bcrypt: any): boolean {
    return bcrypt.compareSync(password, this.passwordHash);
  }
}
```

```typescript
// src/modules/users/domain/user.repository.ts (interface)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### User Module - Infrastructure Layer

```typescript
// src/modules/users/infrastructure/user.repository.impl.ts
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { db } from '@/infrastructure/database/connection';

export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await db.query('SELECT * FROM users WHERE id = $1', [id]);

    if (!row) return null;

    return new User(row.id, row.email, row.name, row.password_hash, row.created_at);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!row) return null;

    return new User(row.id, row.email, row.name, row.password_hash, row.created_at);
  }

  async save(user: User): Promise<void> {
    await db.query(
      `INSERT INTO users (id, email, name, password_hash, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
       SET email = $2, name = $3`,
      [user.id, user.email, user.name, user['passwordHash'], user.createdAt]
    );
  }

  async delete(id: string): Promise<void> {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
```

### User Module - Application Layer

```typescript
// src/modules/users/application/create-user.use-case.ts
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { EventBus } from '@/infrastructure/events/event-bus';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export class CreateUserUseCase {
  constructor(
    private userRepo: UserRepository,
    private eventBus: EventBus
  ) {}

  async execute(data: { email: string; name: string; password: string }): Promise<User> {
    // Check if user exists
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user entity
    const user = new User(uuid(), data.email, data.name, passwordHash, new Date());

    // Save to repository
    await this.userRepo.save(user);

    // Emit event (for sending welcome email, etc.)
    await this.eventBus.publish('user.created', {
      userId: user.id,
      email: user.email,
    });

    return user;
  }
}
```

### User Module - API Layer

```typescript
// src/modules/users/api/users.controller.ts
import { Request, Response } from 'express';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { GetUserUseCase } from '../application/get-user.use-case';

export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const user = await this.createUserUseCase.execute(req.body);

      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await this.getUserUseCase.execute(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### Module Index (Dependency Injection Setup)

```typescript
// src/modules/users/index.ts
import { PostgresUserRepository } from './infrastructure/user.repository.impl';
import { CreateUserUseCase } from './application/create-user.use-case';
import { GetUserUseCase } from './application/get-user.use-case';
import { UsersController } from './api/users.controller';
import { eventBus } from '@/infrastructure/events/event-bus';

// Create repository
const userRepository = new PostgresUserRepository();

// Create use cases
const createUserUseCase = new CreateUserUseCase(userRepository, eventBus);
const getUserUseCase = new GetUserUseCase(userRepository);

// Create controller
const usersController = new UsersController(createUserUseCase, getUserUseCase);

export { usersController };
```

## Application Setup

```typescript
// src/app.ts
import express from 'express';
import { usersController } from './modules/users';
import { authController } from './modules/auth';
import { ordersController } from './modules/orders';
import { errorMiddleware } from './shared/middleware/error.middleware';
import { authMiddleware } from './shared/middleware/auth.middleware';

const app = express();

app.use(express.json());

// Routes
app.post('/api/users', (req, res) => usersController.create(req, res));
app.get('/api/users/:id', authMiddleware, (req, res) => usersController.getById(req, res));

app.post('/api/auth/login', (req, res) => authController.login(req, res));

app.post('/api/orders', authMiddleware, (req, res) => ordersController.create(req, res));

// Error handling
app.use(errorMiddleware);

export default app;
```

## Testing

```typescript
// tests/unit/modules/users/user.service.test.ts
import { CreateUserUseCase } from '@/modules/users/application/create-user.use-case';
import { UserRepository } from '@/modules/users/domain/user.repository';
import { EventBus } from '@/infrastructure/events/event-bus';

// Mock repository
class MockUserRepository implements UserRepository {
  private users = new Map();

  async findById(id: string) {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  async save(user: any) {
    this.users.set(user.id, user);
  }

  async delete(id: string) {
    this.users.delete(id);
  }
}

// Mock event bus
class MockEventBus implements EventBus {
  events: any[] = [];

  async publish(event: string, data: any) {
    this.events.push({ event, data });
  }
}

describe('CreateUserUseCase', () => {
  it('should create a new user', async () => {
    const mockRepo = new MockUserRepository();
    const mockEventBus = new MockEventBus();
    const useCase = new CreateUserUseCase(mockRepo, mockEventBus);

    const user = await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(mockEventBus.events).toHaveLength(1);
    expect(mockEventBus.events[0].event).toBe('user.created');
  });

  it('should throw error if user exists', async () => {
    const mockRepo = new MockUserRepository();
    const mockEventBus = new MockEventBus();
    const useCase = new CreateUserUseCase(mockRepo, mockEventBus);

    // Create first user
    await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    // Try to create duplicate
    await expect(
      useCase.execute({
        email: 'test@example.com',
        name: 'Another User',
        password: 'password456',
      })
    ).rejects.toThrow('User already exists');
  });
});
```

## Benefits of This Structure

**Modular Monolith:**

- ✅ Clear module boundaries
- ✅ Can extract modules to microservices later
- ✅ Team can own specific modules
- ✅ Easier to reason about dependencies
- ✅ Testable in isolation

**Layered Structure:**

- ✅ Separation of concerns (domain, infrastructure, API)
- ✅ Business logic independent of frameworks
- ✅ Easy to swap infrastructure (database, queue, etc.)
- ✅ Testable without infrastructure dependencies

## Migration Path to Microservices

When a module becomes too large or needs independent scaling:

1. **Extract module code** to separate repository
2. **Set up separate database** for the module
3. **Create API boundary** (REST/gRPC)
4. **Deploy independently**
5. **Update consumers** to use API instead of direct calls
6. **Use events** for cross-service communication

The modular monolith structure makes this extraction straightforward since modules are already loosely coupled.
