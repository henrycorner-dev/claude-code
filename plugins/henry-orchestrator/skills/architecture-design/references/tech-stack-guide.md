# Technology Stack Selection Guide

This reference provides detailed guidance for selecting technologies across the stack, including decision trees, comparison matrices, and real-world considerations.

## Frontend Framework Selection

### Decision Tree

```
Need SEO and fast initial load?
├─ Yes → Consider SSR/SSG frameworks
│   ├─ React ecosystem → Next.js
│   ├─ Vue ecosystem → Nuxt
│   ├─ Svelte ecosystem → SvelteKit
│   └─ Full-stack → Remix
│
└─ No → SPA frameworks
    ├─ Large ecosystem, flexible → React
    ├─ Gentle learning curve → Vue
    ├─ Full-featured, enterprise → Angular
    └─ Minimal bundle size → Svelte
```

### Framework Comparison

| Framework | Bundle Size | Learning Curve | Ecosystem       | Performance | Best For                          |
| --------- | ----------- | -------------- | --------------- | ----------- | --------------------------------- |
| React     | Medium      | Medium         | Huge            | Good        | Flexibility, large teams          |
| Vue       | Small       | Easy           | Large           | Good        | Progressive adoption, small teams |
| Angular   | Large       | Steep          | Large           | Good        | Enterprise, full-featured needs   |
| Svelte    | Tiny        | Easy           | Growing         | Excellent   | Performance-critical, simple apps |
| Next.js   | Medium      | Medium         | Large (React)   | Excellent   | SEO, hybrid rendering             |
| Remix     | Medium      | Medium         | Growing (React) | Excellent   | Web fundamentals, forms           |

### React Ecosystem

**State Management:**

- **Local state:** useState, useReducer
- **Global state (simple):** Context API, Zustand
- **Global state (complex):** Redux Toolkit, Jotai, Recoil
- **Server state:** React Query, SWR, Apollo Client

**Styling:**

- **CSS-in-JS:** styled-components, Emotion
- **Utility-first:** Tailwind CSS
- **Zero-runtime:** vanilla-extract, Linaria
- **Component libraries:** Material-UI, Chakra UI, Ant Design

**Routing:**

- **SPA:** React Router
- **Full-stack:** Next.js, Remix
- **File-based:** Next.js, TanStack Router

### When to Choose What

**React:**

- Large ecosystem needed
- Team familiar with React
- Need flexibility in architecture
- Mobile app with React Native planned

**Vue:**

- Small to medium project
- Team prefers template syntax
- Progressive enhancement
- Gentle learning curve important

**Angular:**

- Large enterprise application
- Want opinionated framework
- TypeScript-first development
- Need RxJS for reactive programming

**Svelte:**

- Performance critical (small bundle size)
- Simple application
- Want less boilerplate
- Compile-time optimization desired

**Next.js:**

- SEO requirements
- Mix of static and dynamic pages
- Want React with batteries included
- Vercel deployment

**Remix:**

- Progressive enhancement important
- Form-heavy applications
- Want web fundamentals approach
- Edge deployment

## Backend Framework Selection

### Decision Tree

```
What's your priority?
│
├─ Performance/Concurrency
│   ├─ Maximum performance → Rust (Actix, Axum)
│   ├─ High concurrency → Go (Gin, Echo, Fiber)
│   └─ Balance → Node.js (Fastify)
│
├─ Developer Productivity
│   ├─ Rapid prototyping → Python (FastAPI, Django)
│   ├─ Full-stack JS → Node.js (Express, Nest.js)
│   └─ Convention over config → Ruby (Rails)
│
└─ Enterprise/Maturity
    ├─ JVM ecosystem → Java (Spring Boot), Kotlin (Ktor)
    ├─ .NET ecosystem → C# (ASP.NET Core)
    └─ Scalability proven → Go, Java
```

### Language/Framework Comparison

| Language | Framework    | Perf      | Dev Speed | Maturity    | Best For                    |
| -------- | ------------ | --------- | --------- | ----------- | --------------------------- |
| Node.js  | Express      | Good      | Fast      | Mature      | Full-stack JS, real-time    |
| Node.js  | Nest.js      | Good      | Medium    | Mature      | Enterprise, TypeScript      |
| Python   | FastAPI      | Good      | Fast      | Growing     | APIs, ML integration        |
| Python   | Django       | Medium    | Fast      | Very Mature | Admin panels, monoliths     |
| Go       | Gin/Fiber    | Excellent | Medium    | Mature      | Microservices, CLIs         |
| Rust     | Actix/Axum   | Excellent | Slow      | Growing     | Performance-critical        |
| Java     | Spring Boot  | Good      | Medium    | Very Mature | Enterprise, complex systems |
| Kotlin   | Ktor         | Good      | Fast      | Mature      | Modern JVM, coroutines      |
| Ruby     | Rails        | Medium    | Very Fast | Very Mature | MVPs, startups              |
| C#       | ASP.NET Core | Excellent | Fast      | Mature      | Windows, enterprise         |

### Node.js Ecosystem

**Frameworks:**

- **Express:** Minimal, flexible, large ecosystem
- **Fastify:** High performance, plugin-based
- **Nest.js:** Angular-inspired, enterprise features
- **Koa:** Modern, lightweight by Express creators
- **Hono:** Edge-first, ultra-fast

**ORMs/Query Builders:**

- **Prisma:** Type-safe, modern, migrations
- **TypeORM:** Decorator-based, feature-rich
- **Drizzle:** Lightweight, SQL-like
- **Sequelize:** Mature, multi-database
- **Kysely:** Type-safe SQL query builder

**Validation:**

- **Zod:** Type inference, composable
- **Joi:** Mature, expressive API
- **Yup:** Schema validation, async support

### Python Ecosystem

**Frameworks:**

- **FastAPI:** Modern, async, auto docs, type hints
- **Django:** Batteries-included, ORM, admin
- **Flask:** Minimal, flexible
- **Sanic:** Async, fast

**ORMs:**

- **SQLAlchemy:** Most powerful, complex
- **Django ORM:** Integrated, simple
- **Tortoise ORM:** Async, Django-like
- **Peewee:** Lightweight

### Go Ecosystem

**Frameworks:**

- **Gin:** Fast, martini-like API
- **Fiber:** Express-inspired, fast
- **Echo:** Minimalist, high performance
- **Chi:** Lightweight, composable

**ORMs:**

- **GORM:** Feature-rich
- **sqlx:** Lightweight extensions to database/sql
- **ent:** Graph-based, type-safe

### When to Choose What

**Node.js:**

- Full-stack JavaScript
- Real-time features (WebSockets)
- Rapid development
- Large npm ecosystem needed

**Python:**

- ML/AI integration
- Data processing
- Rapid prototyping
- Scientific computing

**Go:**

- Microservices
- CLI tools
- High concurrency
- Cloud-native apps

**Rust:**

- Performance critical
- System programming
- Memory safety important
- WebAssembly targets

**Java/Kotlin:**

- Large enterprise systems
- Legacy integration
- Strong typing required
- JVM ecosystem needed

**C#:**

- Windows environment
- .NET ecosystem
- Game development (Unity)
- Enterprise applications

## Database Selection

### Decision Tree

```
What's your data model?
│
├─ Structured with relationships
│   ├─ ACID transactions critical → PostgreSQL
│   ├─ Read-heavy, scalability → PostgreSQL (read replicas)
│   ├─ High write throughput → PostgreSQL (partitioning) or Cassandra
│   └─ MySQL compatibility needed → MySQL, Aurora
│
├─ Document/Flexible schema
│   ├─ Rich queries needed → MongoDB
│   ├─ Serverless/managed → Firestore, DynamoDB
│   └─ Real-time sync → Firebase, Firestore
│
├─ Key-Value
│   ├─ In-memory cache → Redis, Memcached
│   ├─ Persistent KV store → DynamoDB, Redis (persisted)
│   └─ Distributed cache → Redis Cluster
│
├─ Time-series
│   ├─ Metrics/monitoring → InfluxDB, TimescaleDB
│   └─ IoT data → TimescaleDB, QuestDB
│
└─ Graph
    ├─ Complex relationships → Neo4j
    └─ Social networks → Neo4j, Neptune
```

### Database Comparison

| Database      | Type        | Consistency      | Scalability              | Use Case                           |
| ------------- | ----------- | ---------------- | ------------------------ | ---------------------------------- |
| PostgreSQL    | Relational  | Strong           | Vertical + Read replicas | General purpose, complex queries   |
| MySQL         | Relational  | Strong           | Vertical + Read replicas | Web apps, WordPress                |
| MongoDB       | Document    | Eventual/Tunable | Horizontal               | Flexible schema, rapid iteration   |
| DynamoDB      | Key-Value   | Eventual/Strong  | Horizontal               | Serverless, high throughput        |
| Redis         | Key-Value   | Strong           | Horizontal (cluster)     | Cache, sessions, real-time         |
| Cassandra     | Wide-Column | Eventual/Tunable | Horizontal               | High write throughput, time-series |
| Neo4j         | Graph       | Strong           | Vertical + Clustering    | Complex relationships, social      |
| InfluxDB      | Time-Series | Strong           | Horizontal               | Metrics, IoT, monitoring           |
| Elasticsearch | Search      | Eventual         | Horizontal               | Full-text search, analytics        |

### PostgreSQL

**Strengths:**

- ACID transactions
- Rich data types (JSON, arrays, hstore)
- Complex queries (CTEs, window functions)
- Full-text search
- GIS support (PostGIS)
- Extensible (custom functions, types)

**Weaknesses:**

- Vertical scaling limits
- Write-heavy workloads challenging
- Sharding requires extensions (Citus)

**When to use:**

- Default choice for most applications
- Need ACID guarantees
- Complex queries and joins
- JSONB for semi-structured data

**Scaling strategies:**

- Read replicas for read-heavy workloads
- Partitioning for large tables
- Connection pooling (PgBouncer)
- Citus for horizontal sharding

### MongoDB

**Strengths:**

- Flexible schema
- Horizontal scaling (sharding)
- Rich query language
- Aggregation pipeline
- Change streams for real-time

**Weaknesses:**

- Eventual consistency by default
- No joins (use $lookup, expensive)
- Schema flexibility can lead to inconsistency

**When to use:**

- Rapid iteration, changing schema
- Document-oriented data
- Horizontal scaling needed
- Real-time features

**Scaling strategies:**

- Sharding on shard key
- Read preference (secondary reads)
- Indexes for query performance

### DynamoDB

**Strengths:**

- Fully managed, serverless
- Predictable performance at scale
- Pay per request
- Strong or eventual consistency

**Weaknesses:**

- Limited query patterns (partition + sort key)
- No complex queries
- Indexes costly
- Vendor lock-in

**When to use:**

- Serverless architectures
- Key-value or simple queries
- High and unpredictable traffic
- Want zero ops

**Design patterns:**

- Single-table design
- GSIs for additional access patterns
- DynamoDB Streams for change data capture

### Redis

**Strengths:**

- In-memory, extremely fast
- Rich data structures (strings, lists, sets, hashes, sorted sets)
- Pub/sub for messaging
- Lua scripting
- Persistence options

**Weaknesses:**

- Data must fit in memory
- Single-threaded (use Redis Cluster for scale)
- Cost at large scale

**When to use:**

- Caching
- Session storage
- Real-time features (leaderboards, counters)
- Rate limiting
- Message queues

**Scaling strategies:**

- Redis Cluster for horizontal scaling
- Read replicas
- Redis Sentinel for high availability

### Elasticsearch

**Strengths:**

- Full-text search
- Real-time indexing
- Aggregations and analytics
- Scalable

**Weaknesses:**

- Not a primary database
- Eventual consistency
- Resource intensive
- Complex to operate

**When to use:**

- Full-text search requirements
- Log aggregation and analysis
- Real-time analytics
- Autocomplete and suggestions

## Cache Strategy

### Cache Types

**In-Memory (Application-level):**

- **Tools:** Node-cache, lru-cache
- **Use:** Single-instance apps, temporary data
- **TTL:** Seconds to minutes

**Distributed Cache:**

- **Tools:** Redis, Memcached
- **Use:** Multi-instance apps, shared state
- **TTL:** Minutes to hours

**CDN (Edge Cache):**

- **Tools:** CloudFront, Cloudflare
- **Use:** Static assets, public APIs
- **TTL:** Hours to days

**Database Query Cache:**

- **Tools:** Built-in (MySQL query cache), application-level
- **Use:** Repeated queries
- **TTL:** Seconds to minutes

### Cache Invalidation Strategies

**Time-based (TTL):**

- Set expiration time
- Simple but may serve stale data

**Event-based:**

- Invalidate on data changes
- Complex but always fresh

**Write-through:**

- Update cache on write
- Consistent but higher write latency

**Write-behind:**

- Async update to cache
- Fast writes but risk of data loss

**Cache-aside (Lazy loading):**

- Load on cache miss
- Simple, widely used

## Message Queue/Event Streaming

### Options Comparison

| Tool            | Type          | Use Case               | Ordering            | Delivery              | Scaling               |
| --------------- | ------------- | ---------------------- | ------------------- | --------------------- | --------------------- |
| RabbitMQ        | Message Queue | Task queues, RPC       | Queue-level         | At-most/at-least-once | Vertical + Clustering |
| AWS SQS         | Message Queue | Decoupling, serverless | Best-effort FIFO    | At-least-once         | Managed, unlimited    |
| Kafka           | Event Stream  | Event sourcing, logs   | Partition-level     | At-least-once         | Horizontal            |
| Redis Streams   | Event Stream  | Real-time, simple      | Stream-level        | At-least-once         | Vertical + Cluster    |
| AWS EventBridge | Event Bus     | Event-driven arch      | None                | At-least-once         | Managed, unlimited    |
| Google Pub/Sub  | Message Queue | Global, serverless     | Best-effort ordered | At-least-once         | Managed, unlimited    |

### When to Use What

**RabbitMQ:**

- Task queues with complex routing
- RPC patterns
- Need message prioritization
- Fine-grained control

**Kafka:**

- Event sourcing
- Log aggregation
- High throughput event streaming
- Event replay needed
- Multiple consumers of same events

**AWS SQS:**

- Serverless architecture
- Simple queue needs
- Decoupling services
- Want managed service

**Redis Streams:**

- Simple event streaming
- Already using Redis
- Lower operational complexity than Kafka
- Real-time features

**AWS EventBridge:**

- Event-driven architecture
- Schema registry needed
- SaaS integration (Stripe, Shopify)
- Rule-based routing

## API Design

### REST vs GraphQL vs gRPC vs tRPC

| Aspect          | REST              | GraphQL                  | gRPC                    | tRPC                  |
| --------------- | ----------------- | ------------------------ | ----------------------- | --------------------- |
| Use Case        | Public APIs, CRUD | Flexible queries, mobile | Microservices, internal | Full-stack TypeScript |
| Client Control  | Low               | High                     | Low                     | Medium                |
| Performance     | Good              | Good                     | Excellent               | Good                  |
| Tooling         | Mature            | Good                     | Good                    | Growing               |
| Learning Curve  | Easy              | Medium                   | Medium                  | Easy (TS devs)        |
| Browser Support | Native            | Native                   | Requires proxy          | Native                |
| Type Safety     | Manual            | Codegen                  | Codegen                 | Native (TS)           |

**Choose REST when:**

- Public API
- Simple CRUD
- Caching important
- Wide client support needed

**Choose GraphQL when:**

- Mobile apps (reduce over-fetching)
- Complex frontend requirements
- Rapid frontend iteration
- Multiple client types

**Choose gRPC when:**

- Internal microservices
- High performance needed
- Streaming required
- Strong typing important

**Choose tRPC when:**

- Full-stack TypeScript
- Monorepo structure
- End-to-end type safety
- Rapid development

## Infrastructure and Deployment

### Deployment Options Decision Tree

```
What's your operational capacity?
│
├─ Want minimal ops
│   ├─ Serverless → Vercel, Netlify, AWS Lambda
│   ├─ PaaS → Heroku, Railway, Render
│   └─ Managed containers → Cloud Run, Fargate
│
├─ Need more control
│   ├─ Container orchestration → Kubernetes (EKS, GKE, AKS)
│   ├─ Simple containers → ECS, Cloud Run
│   └─ VMs → EC2, Compute Engine
│
└─ On-premises/Hybrid
    ├─ Containers → Kubernetes, Docker Swarm
    └─ VMs → VMware, Proxmox
```

### Platform Comparison

| Platform           | Type               | Ops Burden | Flexibility | Cost        | Best For                       |
| ------------------ | ------------------ | ---------- | ----------- | ----------- | ------------------------------ |
| Vercel             | Serverless         | Minimal    | Low         | Low-Medium  | Next.js, frontend              |
| Netlify            | Serverless         | Minimal    | Low         | Low-Medium  | Static sites, JAMstack         |
| Heroku             | PaaS               | Low        | Medium      | Medium-High | Prototypes, startups           |
| Railway            | PaaS               | Low        | Medium      | Low-Medium  | Side projects, startups        |
| Render             | PaaS               | Low        | Medium      | Low-Medium  | Modern apps                    |
| AWS Lambda         | Serverless         | Low-Medium | Medium      | Low-High    | Event-driven, variable traffic |
| Cloud Run          | Managed Containers | Low        | High        | Low-Medium  | Containers, any language       |
| Fargate            | Managed Containers | Medium     | High        | Medium      | ECS without managing servers   |
| Kubernetes         | Orchestration      | High       | Very High   | Medium-High | Large-scale, multi-cloud       |
| EC2/Compute Engine | VMs                | High       | Very High   | Low-High    | Full control needed            |

### When to Use What

**Vercel/Netlify:**

- Frontend applications
- Static sites
- JAMstack
- Want git-based deployment

**Heroku/Railway/Render:**

- MVPs and prototypes
- Small to medium apps
- Want simple deployment
- Limited ops team

**AWS Lambda/Cloud Functions:**

- Event-driven workloads
- Variable traffic
- Want pay-per-execution
- Microservices

**Cloud Run:**

- Container-based apps
- Any language/framework
- Want serverless benefits with flexibility
- Pay per request

**Kubernetes:**

- Large-scale applications
- Multi-cloud or hybrid
- Complex orchestration needs
- Have ops expertise

**VMs (EC2):**

- Legacy applications
- Full control needed
- Cost optimization through reserved instances
- Custom networking

## Monitoring and Observability

### Logging

**Options:**

- **Cloud-native:** CloudWatch Logs, Google Cloud Logging, Azure Monitor
- **Centralized:** Elasticsearch + Kibana (ELK), Loki + Grafana
- **SaaS:** Datadog, New Relic, Loggly

**Best practices:**

- Structured logging (JSON)
- Correlation IDs for distributed tracing
- Log levels (error, warn, info, debug)
- Avoid logging sensitive data

### Metrics

**Options:**

- **Open-source:** Prometheus + Grafana
- **Cloud-native:** CloudWatch, Google Cloud Monitoring
- **SaaS:** Datadog, New Relic, Grafana Cloud

**Key metrics:**

- Request rate
- Error rate
- Duration (latency percentiles: p50, p95, p99)
- Saturation (CPU, memory, disk)

### Tracing

**Options:**

- **Open-source:** Jaeger, Zipkin
- **Cloud-native:** X-Ray, Cloud Trace
- **SaaS:** Datadog APM, New Relic APM
- **Standard:** OpenTelemetry

**When needed:**

- Microservices architecture
- Complex request flows
- Performance debugging
- Dependency mapping

### Error Tracking

**Options:**

- **Sentry:** Best-in-class error tracking
- **Rollbar:** Error monitoring and debugging
- **Bugsnag:** Error monitoring with stability scores
- **Raygun:** Crash reporting and APM

## Security Tools and Practices

### Authentication/Authorization

**Tools:**

- **Auth0:** Managed identity platform
- **Firebase Auth:** Mobile-first, easy integration
- **AWS Cognito:** AWS-native, scalable
- **Clerk:** Modern, developer-friendly
- **Supabase Auth:** Open-source, simple
- **NextAuth.js:** Next.js authentication
- **Passport.js:** Node.js authentication middleware

### Secrets Management

**Tools:**

- **HashiCorp Vault:** Enterprise-grade
- **AWS Secrets Manager:** AWS-native
- **Google Secret Manager:** GCP-native
- **Azure Key Vault:** Azure-native
- **Doppler:** Modern secrets platform
- **1Password Secrets Automation:** Team-friendly

### Security Scanning

**SAST (Static Analysis):**

- **SonarQube:** Code quality and security
- **Snyk:** Dependency vulnerabilities
- **GitHub Advanced Security:** Built into GitHub
- **Semgrep:** Custom rule-based scanning

**DAST (Dynamic Analysis):**

- **OWASP ZAP:** Web app scanner
- **Burp Suite:** Security testing platform

**Dependency Scanning:**

- **Snyk:** Comprehensive, great UX
- **Dependabot:** GitHub-native
- **WhiteSource:** Enterprise compliance

## Tech Stack Templates

### Startup MVP

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Next.js API routes or Supabase
- **Database:** PostgreSQL (Supabase or Railway)
- **Auth:** Clerk or NextAuth.js
- **Deployment:** Vercel
- **Monitoring:** Sentry for errors

**Rationale:** Fast development, low ops, can scale

### Enterprise SaaS

- **Frontend:** React + TypeScript + Material-UI
- **Backend:** Node.js (Nest.js) or Java (Spring Boot)
- **Database:** PostgreSQL (RDS or Cloud SQL)
- **Cache:** Redis (ElastiCache or Memorystore)
- **API:** REST or GraphQL
- **Auth:** Auth0 or Okta
- **Deployment:** Kubernetes (EKS/GKE) or ECS
- **Monitoring:** Datadog or New Relic

**Rationale:** Mature, scalable, enterprise features

### Real-time Application

- **Frontend:** React + React Query
- **Backend:** Node.js (Fastify or Hono)
- **Database:** PostgreSQL
- **Real-time:** WebSockets (Socket.io) or Server-Sent Events
- **Cache:** Redis
- **Message Queue:** Redis Streams or Kafka
- **Deployment:** Cloud Run or Fargate
- **Monitoring:** Prometheus + Grafana

**Rationale:** WebSocket support, real-time capabilities

### Data-Intensive Application

- **Frontend:** React or Vue
- **Backend:** Python (FastAPI) + Celery
- **Database:** PostgreSQL + TimescaleDB
- **Cache:** Redis
- **Message Queue:** RabbitMQ or Kafka
- **Data Processing:** Apache Spark or Pandas
- **Storage:** S3 or Cloud Storage
- **Deployment:** Kubernetes
- **Monitoring:** Prometheus + Grafana

**Rationale:** Python ecosystem for data, scalable processing

### Microservices Architecture

- **Frontend:** React (Next.js) or Vue (Nuxt)
- **Backend:** Go or Node.js
- **Databases:** PostgreSQL (per service)
- **API Gateway:** Kong or AWS API Gateway
- **Service Mesh:** Istio or Linkerd
- **Message Queue:** Kafka or RabbitMQ
- **Deployment:** Kubernetes
- **Observability:** OpenTelemetry + Jaeger + Prometheus + Grafana

**Rationale:** Service independence, polyglot, scalable
