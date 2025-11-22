---
name: architecture-design
description: This skill should be used when the user asks to "design system architecture", "choose between monolith and microservices", "design data flows", "select tech stack", "architect a system", "design application structure", "plan system components", or needs guidance on high-level architectural decisions, scalability patterns, or technology selection.
version: 0.1.0
---

# Architecture Design

This skill provides guidance for designing high-level system architecture, including architectural patterns (monolith vs. microservices), data flow design, tech stack selection, and scalability considerations.

## Purpose

Architecture design establishes the foundational structure of software systems. This skill helps make informed decisions about:

- Architectural patterns and system topology
- Technology stack selection based on requirements
- Data flow and integration patterns
- Scalability and performance considerations
- Trade-offs between different architectural approaches

## When to Use This Skill

Use this skill when:

- Starting a new project and need to design the overall system architecture
- Evaluating whether to use monolith, microservices, or hybrid approaches
- Selecting technologies for frontend, backend, database, and infrastructure
- Designing data flows between components and external systems
- Planning for scale, performance, and reliability requirements
- Refactoring existing systems to new architectural patterns

## Core Architectural Decision Framework

### Step 1: Understand Requirements

Before designing architecture, gather and clarify:

**Functional Requirements:**

- Core features and capabilities needed
- User workflows and interactions
- Integration requirements with external systems
- Data models and relationships

**Non-Functional Requirements:**

- Expected scale (users, requests, data volume)
- Performance requirements (latency, throughput)
- Availability and reliability targets
- Security and compliance needs
- Development team size and expertise
- Budget and timeline constraints

### Step 2: Choose Architectural Pattern

Select the appropriate pattern based on requirements:

#### Monolith

**When to choose:**

- Small to medium applications with clear bounded scope
- Small development teams (1-5 developers)
- Simple deployment requirements
- Need for rapid initial development
- Limited microservices expertise

**Trade-offs:**

- ✅ Simpler development and debugging
- ✅ Easier deployment and operations
- ✅ Better performance (no network overhead)
- ✅ Easier transactions and consistency
- ❌ Limited independent scaling
- ❌ Longer deployment cycles as system grows
- ❌ Technology lock-in

#### Microservices

**When to choose:**

- Large, complex applications with distinct domains
- Multiple teams working independently
- Need for independent scaling of components
- Polyglot technology requirements
- High availability and fault isolation needs

**Trade-offs:**

- ✅ Independent deployment and scaling
- ✅ Technology flexibility per service
- ✅ Team autonomy and parallel development
- ✅ Fault isolation
- ❌ Higher operational complexity
- ❌ Network latency and reliability challenges
- ❌ Distributed system complexity (consistency, transactions)
- ❌ Higher infrastructure costs

#### Modular Monolith (Hybrid)

**When to choose:**

- Starting small but anticipating growth
- Want architectural flexibility without microservices complexity
- Clear domain boundaries within single deployment
- Potential future migration to microservices

**Trade-offs:**

- ✅ Clean separation of concerns
- ✅ Easier migration path to microservices
- ✅ Simpler operations than microservices
- ✅ Strong module boundaries
- ❌ Still shares deployment lifecycle
- ❌ Requires discipline to maintain boundaries

### Step 3: Design Data Architecture

#### Database Selection

**Relational (PostgreSQL, MySQL):**

- Structured data with clear relationships
- ACID transaction requirements
- Complex queries and joins
- Strong consistency needs

**Document (MongoDB, Firestore):**

- Flexible schema requirements
- Hierarchical or nested data
- Rapid iteration on data models
- Horizontal scaling needs

**Key-Value (Redis, DynamoDB):**

- Simple data access patterns (get/set)
- High-performance caching
- Session storage
- Real-time features

**Graph (Neo4j, Neptune):**

- Complex relationship queries
- Social networks
- Recommendation engines
- Knowledge graphs

#### Data Flow Patterns

**Synchronous (Request/Response):**

- User-facing operations requiring immediate response
- Simple workflows
- Strong consistency requirements

**Asynchronous (Message Queues):**

- Background processing
- Decoupling services
- Handling traffic spikes
- Reliable delivery guarantees

**Event-Driven:**

- Real-time updates
- Complex workflows with multiple handlers
- Audit trails and event sourcing
- Loose coupling between components

### Step 4: Select Technology Stack

#### Frontend

**Considerations:**

- User experience requirements (responsiveness, interactivity)
- Team expertise
- SEO requirements
- Mobile vs. web vs. both

**Common choices:**

- React: Large ecosystem, flexible, component-based
- Vue: Gentle learning curve, progressive framework
- Angular: Full-featured, enterprise-focused
- Svelte: Minimal bundle size, compiled approach
- Next.js/Remix: Server-side rendering, full-stack

#### Backend

**Considerations:**

- Performance requirements
- Development speed
- Team expertise
- Ecosystem and libraries

**Common choices:**

- Node.js: JavaScript everywhere, async I/O, large ecosystem
- Python: Rapid development, ML/data science integration
- Go: High performance, built for concurrency
- Java/Kotlin: Enterprise features, mature ecosystem
- Rust: Maximum performance and safety

#### Infrastructure

**Considerations:**

- Operational expertise
- Cost constraints
- Scaling requirements
- Deployment frequency

**Common choices:**

- Cloud providers: AWS, GCP, Azure
- Container orchestration: Kubernetes, ECS, Cloud Run
- Serverless: Lambda, Cloud Functions, Vercel
- Platform-as-a-Service: Heroku, Railway, Render

### Step 5: Plan for Cross-Cutting Concerns

Design approaches for:

**Authentication & Authorization:**

- OAuth2/OIDC for federated identity
- JWT for stateless authentication
- RBAC or ABAC for authorization
- Session management strategy

**Observability:**

- Structured logging (JSON format)
- Metrics collection (Prometheus, CloudWatch)
- Distributed tracing (OpenTelemetry)
- Error tracking (Sentry, Rollbar)

**Reliability:**

- Retry mechanisms with exponential backoff
- Circuit breakers for external dependencies
- Graceful degradation strategies
- Health checks and readiness probes

**Security:**

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- HTTPS/TLS everywhere
- Secrets management (Vault, Secret Manager)

## Architecture Documentation

Document architectural decisions using:

**Architecture Decision Records (ADRs):**

```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status

Accepted

## Context

Need to select primary database for user data, transactions, and reporting.

## Decision

Use PostgreSQL as primary relational database.

## Consequences

✅ Strong ACID guarantees
✅ Rich query capabilities
✅ JSON support for flexible data
❌ Requires careful indexing for scale
❌ Vertical scaling limitations
```

**Component Diagrams:**

- System context diagram (external interactions)
- Container diagram (high-level components)
- Component diagram (internal structure)

**Data Flow Diagrams:**

- Request/response flows
- Background job flows
- Event propagation paths

## Common Patterns and Anti-Patterns

### Patterns

✅ **API Gateway:** Single entry point for microservices
✅ **Database per Service:** Data ownership and isolation
✅ **CQRS:** Separate read and write models for complex domains
✅ **Event Sourcing:** Audit trail and temporal queries
✅ **Saga Pattern:** Distributed transactions across services

### Anti-Patterns

❌ **Distributed Monolith:** Microservices with tight coupling
❌ **Shared Database:** Multiple services accessing same tables
❌ **Chatty APIs:** Excessive network calls between services
❌ **God Service:** Service with too many responsibilities
❌ **Premature Optimization:** Complex architecture before proven need

## Migration Strategies

When evolving architecture:

**Monolith to Microservices:**

1. Identify bounded contexts
2. Extract one service at a time
3. Use strangler fig pattern
4. Start with least coupled components

**Technology Stack Changes:**

1. Implement new tech alongside old
2. Route percentage of traffic to new stack
3. Monitor and compare performance
4. Gradually increase traffic percentage
5. Deprecate old stack once validated

## Additional Resources

### Reference Files

For detailed patterns and guidance:

- **`references/patterns.md`** - Detailed architectural patterns with trade-offs
- **`references/tech-stack-guide.md`** - Technology selection decision trees
- **`references/scalability.md`** - Scaling strategies and performance optimization

### Example Files

Working examples in `examples/`:

- **`examples/adr-template.md`** - Architecture Decision Record template
- **`examples/monolith-structure.md`** - Example monolith project structure
- **`examples/microservices-structure.md`** - Example microservices organization

## Decision Checklist

Before finalizing architecture:

- [ ] Requirements clearly documented and validated
- [ ] Architectural pattern chosen with documented rationale
- [ ] Technology stack selected based on team and requirements
- [ ] Data architecture designed (databases, flows, consistency)
- [ ] Cross-cutting concerns addressed (auth, logging, monitoring)
- [ ] Scalability path identified
- [ ] Security considerations documented
- [ ] Team capabilities align with chosen architecture
- [ ] Architecture documented with diagrams and ADRs
- [ ] Migration/deployment strategy defined

## Getting Started

To design architecture for a new system:

1. **Gather requirements:** Understand functional, non-functional, and constraints
2. **Assess options:** Evaluate architectural patterns against requirements
3. **Make decisions:** Choose pattern, tech stack, and data architecture
4. **Document rationale:** Create ADRs for key decisions
5. **Create diagrams:** Visualize system structure and data flows
6. **Validate with stakeholders:** Review with team and stakeholders
7. **Iterate:** Refine based on feedback and new information

Start simple and evolve architecture as requirements become clear. Avoid premature complexity while maintaining flexibility for future growth.
