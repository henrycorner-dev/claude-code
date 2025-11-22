# Architectural Patterns - Detailed Guide

This reference provides comprehensive coverage of architectural patterns, their use cases, implementation considerations, and trade-offs.

## Layered Architecture

### Overview

Organizes code into horizontal layers, each with specific responsibilities. Common layers include presentation, business logic, data access, and database.

### Structure

```
┌─────────────────────────┐
│   Presentation Layer    │  (UI, API endpoints)
├─────────────────────────┤
│   Business Logic Layer  │  (Domain logic, workflows)
├─────────────────────────┤
│   Data Access Layer     │  (Repositories, ORMs)
├─────────────────────────┤
│   Database Layer        │  (Persistent storage)
└─────────────────────────┘
```

### When to Use

- Traditional enterprise applications
- CRUD-heavy applications
- Teams familiar with MVC patterns
- Clear separation between UI and business logic needed

### Implementation Considerations

**Strict Layering:**
- Each layer only communicates with layer directly below
- Better encapsulation but can be rigid
- May require pass-through methods

**Relaxed Layering:**
- Layers can skip levels (e.g., presentation to data access)
- More flexible but can lead to coupling

### Trade-offs

**Advantages:**
- Clear separation of concerns
- Easy to understand and learn
- Good for teams with varied skill levels
- Testable business logic

**Disadvantages:**
- Can lead to "anemic domain models"
- Performance overhead from layer transitions
- Tendency toward monolithic deployments
- May not fit complex domain logic well

## Microservices Architecture

### Core Principles

1. **Single Responsibility:** Each service owns one business capability
2. **Autonomous:** Services can be deployed independently
3. **Decentralized:** Data, governance, and technology choices
4. **Failure Isolation:** One service failure doesn't cascade

### Service Boundaries

Define services around:
- **Business Capabilities:** User management, order processing, inventory
- **Domain-Driven Design:** Bounded contexts from domain model
- **Team Structure:** Conway's Law - align with team boundaries
- **Change Frequency:** High-change areas isolated from stable areas

### Communication Patterns

#### Synchronous (REST/gRPC)

**Use for:**
- User-facing operations requiring immediate response
- Simple request/response workflows
- When strong consistency needed

**Implementation:**
```
Client → API Gateway → Service A (REST) → Service B
```

**Considerations:**
- Service A depends on Service B availability
- Implement timeouts and circuit breakers
- Handle partial failures gracefully

#### Asynchronous (Message Queues)

**Use for:**
- Background processing
- Event notifications
- Decoupling services
- Eventual consistency acceptable

**Implementation:**
```
Service A → Message Queue → Service B
                         → Service C
                         → Service D
```

**Considerations:**
- At-least-once vs. exactly-once delivery
- Message ordering requirements
- Dead letter queues for failed messages
- Idempotent message handlers

#### Event-Driven

**Use for:**
- Complex workflows with multiple handlers
- Real-time updates across services
- Audit trails and event sourcing

**Implementation:**
```
Service A publishes: OrderCreated event
    ↓
Event Bus (Kafka/EventBridge)
    ↓
├─→ Inventory Service (reserves items)
├─→ Payment Service (processes payment)
├─→ Notification Service (sends confirmation)
└─→ Analytics Service (tracks metrics)
```

**Considerations:**
- Event schema versioning
- Event replay capabilities
- Handling out-of-order events
- Event storage and retention

### Data Management Patterns

#### Database per Service

**Principle:** Each service owns its data and schema.

**Advantages:**
- Services can choose optimal database type
- Schema changes don't affect other services
- Clear ownership and boundaries
- Independent scaling

**Challenges:**
- No foreign key constraints across services
- Distributed transactions needed
- Data duplication may be necessary
- Reporting across services complex

#### Shared Database (Anti-pattern)

**Why to avoid:**
- Tight coupling between services
- Schema changes affect multiple services
- Can't independently scale data layer
- Breaks service autonomy

**Exceptions:**
- Legacy migration phase
- Read-only shared reference data
- Temporary during refactoring

#### Saga Pattern

Manage distributed transactions across services using choreography or orchestration.

**Choreography (Event-based):**
```
Order Service → OrderCreated event
    ↓
Payment Service → PaymentProcessed event
    ↓
Inventory Service → ItemsReserved event
```

**Compensation on failure:**
```
Inventory Service → ReservationFailed event
    ↓
Payment Service → RefundIssued event
    ↓
Order Service → OrderCancelled event
```

**Orchestration (Coordinator):**
```
Saga Coordinator
├─→ Call Payment Service
├─→ Call Inventory Service
├─→ Call Shipping Service
└─→ Handle compensations on failure
```

**Choose choreography when:**
- Simple workflows
- Services highly autonomous
- No complex decision logic

**Choose orchestration when:**
- Complex workflows with conditional logic
- Need centralized monitoring
- Clear workflow visualization needed

### Service Mesh

Infrastructure layer for service-to-service communication.

**Capabilities:**
- Service discovery
- Load balancing
- Encryption (mTLS)
- Observability (metrics, traces)
- Circuit breaking
- Retry logic

**Popular implementations:**
- Istio
- Linkerd
- Consul

**When to adopt:**
- Many microservices (10+)
- Complex networking requirements
- Need for zero-trust security
- Observability challenges

### Microservices Anti-Patterns

**Distributed Monolith:**
- Services tightly coupled
- Must deploy together
- Shared database
- Solution: Identify true boundaries, separate data

**Chatty Services:**
- Excessive inter-service calls
- High latency
- Solution: Batch requests, use caching, reconsider boundaries

**Shared Libraries with Business Logic:**
- Updates require redeploying all services
- Hidden coupling
- Solution: Duplicate code or extract to service

**Megaservice:**
- Service too large, multiple responsibilities
- Solution: Split based on business capabilities

## Event Sourcing

### Concept

Store all changes as sequence of events rather than current state.

### Structure

```
Event Store
├─ UserCreated { userId: 1, name: "Alice", email: "alice@example.com" }
├─ EmailUpdated { userId: 1, email: "alice@newdomain.com" }
└─ UserDeactivated { userId: 1, reason: "Account closed" }

Current State = Replay all events
```

### When to Use

- Audit trail required
- Complex business logic with state transitions
- Temporal queries needed ("state at specific time")
- Debugging and root cause analysis important
- Event-driven architecture already in place

### Implementation Considerations

**Event Store:**
- Append-only log
- Events immutable
- Indexed by aggregate ID
- Examples: EventStoreDB, custom solution on PostgreSQL/DynamoDB

**Projections:**
- Build read models from events
- Can have multiple projections for different views
- Rebuild projections by replaying events

**Snapshots:**
- Periodic state snapshots to avoid replaying all events
- Trade-off: storage vs. replay performance

### Trade-offs

**Advantages:**
- Complete audit trail
- Temporal queries
- Easy debugging
- Event replay for testing
- Enables event-driven architecture

**Disadvantages:**
- Complexity in querying current state
- Event schema evolution challenges
- Storage growth over time
- Learning curve for team

## CQRS (Command Query Responsibility Segregation)

### Concept

Separate read and write models for same data.

### Structure

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     ├─────→ Write Model (Commands)
     │         ├─ Domain logic
     │         ├─ Validation
     │         └─ Write to DB
     │
     └─────→ Read Model (Queries)
               ├─ Optimized for reads
               ├─ Denormalized views
               └─ Read from DB
```

### When to Use

- Complex domain with different read/write patterns
- High read/write ratio (10:1 or more)
- Different scaling needs for reads vs. writes
- Multiple optimized views of same data needed

### Implementation Patterns

**Simple CQRS:**
- Same database
- Different models in application layer
- Queries use views/denormalized tables

**CQRS with Separate Databases:**
- Write to normalized database
- Sync to read-optimized database (e.g., Elasticsearch)
- Eventual consistency between models

**CQRS with Event Sourcing:**
- Commands generate events
- Events stored in event store
- Read models built from events

### Trade-offs

**Advantages:**
- Optimized read and write models
- Independent scaling
- Simplified queries
- Better performance

**Disadvantages:**
- Eventual consistency between models
- Increased complexity
- Data synchronization needed
- Potential code duplication

## Hexagonal Architecture (Ports and Adapters)

### Concept

Isolate core business logic from external concerns (databases, UI, APIs).

### Structure

```
              ┌─────────────────────────┐
              │    Adapters (External)  │
              │  ┌─────┐      ┌─────┐  │
              │  │ UI  │      │ API │  │
              │  └──┬──┘      └──┬──┘  │
              └─────┼────────────┼─────┘
                    │            │
              ┌─────┼────────────┼─────┐
              │     ▼            ▼     │
              │   ┌──────────────┐     │
              │   │  Ports       │     │
              │   └──────────────┘     │
              │   ┌──────────────┐     │
              │   │Core Business │     │
              │   │    Logic     │     │
              │   └──────────────┘     │
              │   ┌──────────────┐     │
              │   │  Ports       │     │
              │   └──────┬───────┘     │
              └──────────┼─────────────┘
                         │
              ┌──────────┼─────────────┐
              │          ▼             │
              │  ┌────────────────┐   │
              │  │   Database     │   │
              │  │   Adapter      │   │
              │  └────────────────┘   │
              └────────────────────────┘
```

### When to Use

- Need to swap infrastructure components
- Multiple interfaces to same core logic (web, mobile, CLI)
- High testability requirements
- DDD-focused architecture

### Implementation

**Ports (Interfaces):**
```typescript
// Input port (use case)
interface CreateUserUseCase {
  execute(data: CreateUserData): Promise<User>
}

// Output port (repository)
interface UserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
}
```

**Adapters (Implementations):**
```typescript
// Input adapter (HTTP controller)
class UserController {
  constructor(private createUser: CreateUserUseCase) {}

  async handleRequest(req: Request): Promise<Response> {
    const user = await this.createUser.execute(req.body)
    return { status: 201, body: user }
  }
}

// Output adapter (PostgreSQL repository)
class PostgresUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // PostgreSQL implementation
  }
}
```

### Trade-offs

**Advantages:**
- Core logic independent of frameworks
- Easy to test (mock adapters)
- Swap implementations easily
- Clear dependencies

**Disadvantages:**
- More abstraction layers
- Can be over-engineered for simple apps
- Requires discipline to maintain boundaries

## Serverless Architecture

### Concept

Event-driven functions without managing servers.

### Patterns

**Function per Endpoint:**
```
API Gateway
├─ GET /users → getUsersFunction
├─ POST /users → createUserFunction
└─ GET /users/:id → getUserFunction
```

**Function per Domain:**
```
Events
├─ OrderCreated → orderProcessingFunction
├─ S3 Upload → imageProcessingFunction
└─ Schedule → reportGenerationFunction
```

### When to Use

- Variable/unpredictable traffic
- Event-driven workloads
- Infrequent tasks (reports, cleanup)
- Want minimal operational overhead
- Cost optimization for low usage

### Implementation Considerations

**Cold Starts:**
- First invocation takes longer
- Mitigation: provisioned concurrency, keep functions warm
- Choose lightweight runtimes (Node.js, Go vs. Java)

**State Management:**
- Functions are stateless
- Use external storage (S3, DynamoDB, Redis)
- Design for idempotency

**Timeouts:**
- AWS Lambda: 15-minute max
- Use Step Functions for long workflows
- Break tasks into smaller functions

**Local Development:**
- Use frameworks: Serverless Framework, SAM, SST
- Emulators: LocalStack, SAM Local
- Mock cloud services in tests

### Trade-offs

**Advantages:**
- No server management
- Automatic scaling
- Pay per execution
- High availability built-in

**Disadvantages:**
- Cold start latency
- Vendor lock-in
- Debugging complexity
- Limited execution time
- Cost can increase with high usage

## Pattern Selection Matrix

| Pattern | Complexity | Scalability | Team Size | Best For |
|---------|-----------|-------------|-----------|----------|
| Layered | Low | Medium | Any | CRUD apps, traditional enterprise |
| Microservices | High | High | Large (10+) | Large systems, multiple teams |
| Event Sourcing | High | Medium | Medium | Audit requirements, temporal queries |
| CQRS | Medium | High | Medium | Complex reads, different read/write patterns |
| Hexagonal | Medium | Medium | Small-Medium | High testability, DDD |
| Serverless | Medium | Very High | Small | Variable traffic, event-driven |

## Combining Patterns

Patterns can be combined:

**Microservices + Event Sourcing + CQRS:**
- Each service uses event sourcing for writes
- CQRS for optimized read models
- Services communicate via events

**Modular Monolith + Hexagonal:**
- Single deployment
- Clear module boundaries with ports/adapters
- Easy migration to microservices later

**Serverless + CQRS:**
- Separate Lambda functions for commands and queries
- Event-driven projections
- DynamoDB streams for synchronization

## Migration Paths

**Monolith → Modular Monolith:**
1. Identify domain boundaries
2. Create modules with clear interfaces
3. Enforce dependency rules
4. Extract shared code to libraries

**Modular Monolith → Microservices:**
1. Start with one module
2. Extract database schema
3. Set up separate deployment
4. Implement API boundary
5. Repeat for other modules

**Traditional → Event Sourcing:**
1. Start with new features
2. Use event store for specific aggregates
3. Maintain dual writes temporarily
4. Migrate historical data as events
5. Retire old state-based storage
