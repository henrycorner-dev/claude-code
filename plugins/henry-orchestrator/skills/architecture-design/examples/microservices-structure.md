# Microservices Architecture Structure

This example shows a well-organized microservices architecture with multiple services, shared infrastructure, and communication patterns.

## Overall System Structure

```
microservices-system/
├── services/                       # Individual microservices
│   ├── user-service/
│   ├── auth-service/
│   ├── order-service/
│   ├── product-service/
│   ├── payment-service/
│   └── notification-service/
│
├── infrastructure/                 # Shared infrastructure code
│   ├── common/                     # Shared libraries
│   ├── kubernetes/                 # K8s manifests
│   ├── terraform/                  # Infrastructure as code
│   └── docker-compose.yml          # Local development
│
├── api-gateway/                    # API Gateway
│
└── docs/                           # Architecture documentation
    ├── architecture-decisions/
    └── api-contracts/
```

## Individual Service Structure

Each service follows clean architecture principles:

```
user-service/
├── src/
│   ├── domain/                     # Domain models and business logic
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── repositories/           # Repository interfaces
│   │   │   └── user.repository.ts
│   │   ├── services/               # Domain services
│   │   │   └── user.service.ts
│   │   └── events/                 # Domain events
│   │       ├── user-created.event.ts
│   │       └── user-updated.event.ts
│   │
│   ├── application/                # Application layer (use cases)
│   │   ├── commands/               # Command handlers
│   │   │   ├── create-user.command.ts
│   │   │   └── update-user.command.ts
│   │   ├── queries/                # Query handlers
│   │   │   ├── get-user.query.ts
│   │   │   └── list-users.query.ts
│   │   └── dto/                    # Data transfer objects
│   │       ├── create-user.dto.ts
│   │       └── user-response.dto.ts
│   │
│   ├── infrastructure/             # Infrastructure layer
│   │   ├── database/
│   │   │   ├── repositories/       # Repository implementations
│   │   │   │   └── postgres-user.repository.ts
│   │   │   ├── migrations/
│   │   │   └── connection.ts
│   │   ├── messaging/              # Event publishing/consuming
│   │   │   ├── event-publisher.ts
│   │   │   └── event-consumer.ts
│   │   ├── cache/
│   │   │   └── redis.client.ts
│   │   └── http/                   # External API clients
│   │       └── payment-client.ts
│   │
│   ├── api/                        # API/Presentation layer
│   │   ├── controllers/
│   │   │   └── user.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   └── routes/
│   │       └── user.routes.ts
│   │
│   ├── config/                     # Configuration
│   │   ├── database.config.ts
│   │   ├── messaging.config.ts
│   │   └── app.config.ts
│   │
│   ├── app.ts                      # Application setup
│   └── server.ts                   # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Service Communication Patterns

### Synchronous Communication (REST)

```typescript
// order-service/src/infrastructure/http/user-client.ts
import axios from 'axios'

export class UserClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.USER_SERVICE_URL || 'http://user-service:3000'
  }

  async getUser(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseURL}/api/users/${userId}`, {
        timeout: 5000, // 5 second timeout
        headers: {
          'X-Service-Name': 'order-service' // Service identity
        }
      })

      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new UserNotFoundError(userId)
      }
      throw new ServiceUnavailableError('user-service')
    }
  }

  async validateUser(userId: string): Promise<boolean> {
    try {
      await this.getUser(userId)
      return true
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return false
      }
      throw error
    }
  }
}
```

**Circuit Breaker Pattern:**

```typescript
// infrastructure/common/circuit-breaker.ts
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime?: number
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()

      if (this.state === 'HALF_OPEN') {
        this.reset()
      }

      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  private recordFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
    }
  }

  private reset() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }
}

// Usage in UserClient
export class UserClient {
  private circuitBreaker = new CircuitBreaker(5, 60000)

  async getUser(userId: string): Promise<User> {
    return this.circuitBreaker.execute(async () => {
      const response = await axios.get(`${this.baseURL}/api/users/${userId}`)
      return response.data
    })
  }
}
```

### Asynchronous Communication (Events)

```typescript
// user-service/src/infrastructure/messaging/event-publisher.ts
import { Kafka } from 'kafkajs'

export class EventPublisher {
  private kafka: Kafka
  private producer: any

  constructor() {
    this.kafka = new Kafka({
      clientId: 'user-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    })
    this.producer = this.kafka.producer()
  }

  async connect() {
    await this.producer.connect()
  }

  async publish(topic: string, event: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.aggregateId, // For partitioning
          value: JSON.stringify(event),
          headers: {
            'event-type': event.type,
            'event-version': '1.0',
            'correlation-id': event.correlationId,
            'timestamp': Date.now().toString()
          }
        }
      ]
    })
  }
}

// Publishing events
// user-service/src/application/commands/create-user.command.ts
export class CreateUserCommand {
  constructor(
    private userRepo: UserRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const user = await this.userRepo.create(data)

    // Publish event
    await this.eventPublisher.publish('user-events', {
      type: 'UserCreated',
      aggregateId: user.id,
      correlationId: generateCorrelationId(),
      timestamp: new Date(),
      payload: {
        userId: user.id,
        email: user.email,
        name: user.name
      }
    })

    return user
  }
}
```

```typescript
// notification-service/src/infrastructure/messaging/event-consumer.ts
import { Kafka } from 'kafkajs'

export class EventConsumer {
  private kafka: Kafka
  private consumer: any

  constructor() {
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    })
    this.consumer = this.kafka.consumer({
      groupId: 'notification-service-group'
    })
  }

  async connect() {
    await this.consumer.connect()
  }

  async subscribe(topic: string, handler: (event: any) => Promise<void>) {
    await this.consumer.subscribe({ topic, fromBeginning: false })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value.toString())

        try {
          await handler(event)
        } catch (error) {
          console.error('Error handling event:', error)
          // Send to dead letter queue or retry
        }
      }
    })
  }
}

// Consuming events
// notification-service/src/application/handlers/user-created.handler.ts
export class UserCreatedHandler {
  constructor(private emailService: EmailService) {}

  async handle(event: UserCreatedEvent) {
    const { userId, email, name } = event.payload

    await this.emailService.sendWelcomeEmail({
      to: email,
      name: name
    })

    console.log(`Welcome email sent to user ${userId}`)
  }
}

// Wire up in server.ts
const eventConsumer = new EventConsumer()
const userCreatedHandler = new UserCreatedHandler(emailService)

await eventConsumer.connect()
await eventConsumer.subscribe('user-events', async (event) => {
  if (event.type === 'UserCreated') {
    await userCreatedHandler.handle(event)
  }
})
```

## API Gateway

```typescript
// api-gateway/src/app.ts
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authMiddleware } from './middleware/auth.middleware'
import { rateLimitMiddleware } from './middleware/rate-limit.middleware'

const app = express()

// Global middleware
app.use(express.json())
app.use(rateLimitMiddleware)

// Route to user-service
app.use(
  '/api/users',
  authMiddleware,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/users'
    },
    onError: (err, req, res) => {
      res.status(503).json({ error: 'Service unavailable' })
    }
  })
)

// Route to order-service
app.use(
  '/api/orders',
  authMiddleware,
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || 'http://order-service:3001',
    changeOrigin: true
  })
)

// Route to product-service
app.use(
  '/api/products',
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    changeOrigin: true
  })
)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

export default app
```

## Saga Pattern (Orchestration)

```typescript
// order-service/src/application/sagas/order-creation.saga.ts
export class OrderCreationSaga {
  constructor(
    private paymentClient: PaymentClient,
    private inventoryClient: InventoryClient,
    private orderRepo: OrderRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(orderData: CreateOrderData): Promise<Order> {
    const order = await this.orderRepo.create({
      ...orderData,
      status: 'PENDING'
    })

    try {
      // Step 1: Reserve inventory
      await this.inventoryClient.reserveItems({
        orderId: order.id,
        items: order.items
      })

      await this.updateOrderStatus(order.id, 'INVENTORY_RESERVED')

      // Step 2: Process payment
      const payment = await this.paymentClient.processPayment({
        orderId: order.id,
        amount: order.total,
        customerId: order.customerId
      })

      await this.updateOrderStatus(order.id, 'PAYMENT_PROCESSED')

      // Step 3: Confirm order
      await this.updateOrderStatus(order.id, 'CONFIRMED')

      await this.eventPublisher.publish('order-events', {
        type: 'OrderConfirmed',
        aggregateId: order.id,
        payload: { orderId: order.id }
      })

      return order
    } catch (error) {
      // Compensating transactions
      await this.compensate(order.id, error)
      throw error
    }
  }

  private async compensate(orderId: string, error: any) {
    const order = await this.orderRepo.findById(orderId)

    // Rollback based on how far we got
    if (order.status === 'PAYMENT_PROCESSED') {
      await this.paymentClient.refund({ orderId })
    }

    if (
      order.status === 'INVENTORY_RESERVED' ||
      order.status === 'PAYMENT_PROCESSED'
    ) {
      await this.inventoryClient.releaseItems({ orderId })
    }

    await this.updateOrderStatus(orderId, 'FAILED')

    await this.eventPublisher.publish('order-events', {
      type: 'OrderFailed',
      aggregateId: orderId,
      payload: { orderId, reason: error.message }
    })
  }

  private async updateOrderStatus(orderId: string, status: string) {
    await this.orderRepo.updateStatus(orderId, status)
  }
}
```

## Database Per Service

```typescript
// user-service/src/infrastructure/database/connection.ts
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'user_service_db', // Separate database
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

export { pool }
```

## Service Discovery

```yaml
# kubernetes/user-service-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: user-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: DB_HOST
              value: user-db-service
            - name: KAFKA_BROKER
              value: kafka-service:9092
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Shared Infrastructure Code

```typescript
// infrastructure/common/src/logger.ts
import winston from 'winston'

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  })
}
```

```typescript
// infrastructure/common/src/tracing.ts
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'

export const initTracing = (serviceName: string) => {
  const provider = new NodeTracerProvider({
    resource: { attributes: { 'service.name': serviceName } }
  })

  const exporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
  })

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
  provider.register()

  return provider
}
```

## Local Development Setup

```yaml
# infrastructure/docker-compose.yml
version: '3.8'

services:
  # Databases
  user-db:
    image: postgres:15
    environment:
      POSTGRES_DB: user_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'

  order-db:
    image: postgres:15
    environment:
      POSTGRES_DB: order_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5433:5432'

  # Caching
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  # Message broker
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    ports:
      - '9092:9092'
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  # Services
  user-service:
    build: ./services/user-service
    environment:
      DB_HOST: user-db
      DB_PORT: 5432
      DB_NAME: user_service_db
      REDIS_URL: redis://redis:6379
      KAFKA_BROKER: kafka:9092
    ports:
      - '3000:3000'
    depends_on:
      - user-db
      - redis
      - kafka

  order-service:
    build: ./services/order-service
    environment:
      DB_HOST: order-db
      DB_PORT: 5432
      DB_NAME: order_service_db
      KAFKA_BROKER: kafka:9092
      USER_SERVICE_URL: http://user-service:3000
    ports:
      - '3001:3000'
    depends_on:
      - order-db
      - kafka
      - user-service

  api-gateway:
    build: ./api-gateway
    environment:
      USER_SERVICE_URL: http://user-service:3000
      ORDER_SERVICE_URL: http://order-service:3000
    ports:
      - '8080:8080'
    depends_on:
      - user-service
      - order-service
```

## Observability

```typescript
// Distributed tracing example
// order-service/src/application/commands/create-order.command.ts
import { trace } from '@opentelemetry/api'

export class CreateOrderCommand {
  private tracer = trace.getTracer('order-service')

  async execute(data: CreateOrderDTO): Promise<Order> {
    const span = this.tracer.startSpan('create-order')

    try {
      span.setAttribute('order.customerId', data.customerId)
      span.setAttribute('order.itemCount', data.items.length)

      // Validate user (trace external call)
      const userSpan = this.tracer.startSpan('validate-user', {
        parent: span
      })
      const isValid = await this.userClient.validateUser(data.customerId)
      userSpan.end()

      if (!isValid) {
        throw new Error('Invalid customer')
      }

      // Create order
      const order = await this.orderRepo.create(data)

      span.setStatus({ code: 0 }) // Success
      return order
    } catch (error) {
      span.recordException(error)
      span.setStatus({ code: 2, message: error.message }) // Error
      throw error
    } finally {
      span.end()
    }
  }
}
```

## Benefits and Trade-offs

**Benefits:**
- ✅ Independent deployment and scaling
- ✅ Technology flexibility per service
- ✅ Team autonomy
- ✅ Fault isolation
- ✅ Easier to understand individual services

**Trade-offs:**
- ❌ Distributed system complexity
- ❌ Network latency
- ❌ Data consistency challenges
- ❌ Operational overhead (multiple deployments, databases)
- ❌ Testing complexity
- ❌ Debugging across services harder

**When to Use Microservices:**
- Large system with clear bounded contexts
- Multiple teams
- Need for independent scaling
- Different technology requirements
- High availability requirements
