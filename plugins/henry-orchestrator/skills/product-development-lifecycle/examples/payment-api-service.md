# Example: Payment Processing API Service

This example demonstrates building a payment processing API service using the henry-orchestrator lifecycle, focusing on security, compliance, and reliability.

## Project Overview

**Product:** RESTful API for payment processing (subscriptions and one-time payments)
**Target Market:** SaaS companies needing subscription billing
**Timeline:** 3 months to production launch
**Team:** 2 backend engineers + 1 DevOps + 1 security specialist

---

## Phase 1: Strategy & Planning (Week 1)

### User Prompt
```
Build a payment API service for subscription billing with Stripe integration.
Need PCI compliance and high reliability.
```

### Command Used
```bash
/henry-orchestrator:henry-product Payment processing API for SaaS subscriptions
```

### PRD Summary

**Core Features (RICE Prioritized):**
1. Create/cancel subscriptions (P0)
2. Webhook handling for payment events (P0)
3. Usage-based billing (P1)
4. Invoice generation (P1)
5. Payment method management (P0)
6. Subscription analytics (P2)

**Success Metrics:**
- API uptime: >99.9%
- Response time: <200ms (95th percentile)
- Webhook processing: <5s end-to-end
- Zero payment data breaches

**Compliance Requirements:**
- PCI DSS Level 1 (using Stripe - SAQ A)
- SOC 2 Type II (planned for year 2)
- GDPR compliant

---

## Phase 2: Design & Architecture (Week 2)

### Command Used
```bash
/henry-orchestrator:henry-design Payment API architecture with Stripe integration
```

### API Design

**Endpoints:**

```
POST   /v1/customers                    # Create customer
GET    /v1/customers/:id                # Get customer
PATCH  /v1/customers/:id                # Update customer

POST   /v1/subscriptions                # Create subscription
GET    /v1/subscriptions/:id            # Get subscription
PATCH  /v1/subscriptions/:id            # Update subscription
DELETE /v1/subscriptions/:id            # Cancel subscription
GET    /v1/subscriptions                # List subscriptions

POST   /v1/payment-methods              # Add payment method
GET    /v1/payment-methods/:id          # Get payment method
DELETE /v1/payment-methods/:id          # Remove payment method

GET    /v1/invoices                     # List invoices
GET    /v1/invoices/:id                 # Get invoice
POST   /v1/invoices/:id/pay             # Pay invoice

POST   /webhooks/stripe                 # Stripe webhook receiver
GET    /health                          # Health check
```

### System Architecture

```
┌─────────────┐
│   Clients   │
└──────┬──────┘
       │
┌──────▼──────────┐
│   API Gateway   │  ← Rate limiting, auth
│   (Kong/NGINX)  │
└──────┬──────────┘
       │
┌──────▼──────────────────┐
│   API Service           │
│   (Node.js/Express)     │
│   - REST endpoints      │
│   - Webhook handlers    │
│   - Business logic      │
└───┬────────────────┬────┘
    │                │
    │                │
┌───▼────┐      ┌────▼─────┐      ┌──────────┐
│ Stripe │      │PostgreSQL│      │  Redis   │
│  API   │      │          │      │  Cache   │
└────────┘      └──────────┘      └──────────┘
                     │
                ┌────▼────┐
                │ Backups │
                └─────────┘
```

### Database Schema

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, etc.
  plan_id VARCHAR(255) NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);
```

---

## Phase 3: Implementation (Weeks 3-8)

### Command Used
```bash
/henry-orchestrator:henry-feature Implement payment API with Stripe
```

### Sprint Breakdown

**Sprint 1 (Weeks 3-4): Foundation**
- Project setup (TypeScript, Express, PostgreSQL)
- Authentication (API key management)
- Database migrations
- Stripe SDK integration
- Error handling framework

**Sprint 2 (Weeks 5-6): Core Features**
- Customer management endpoints
- Subscription CRUD operations
- Payment method management
- Idempotency handling

**Sprint 3 (Weeks 7-8): Webhooks & Reliability**
- Webhook signature verification
- Event processing queue
- Retry logic for failed webhooks
- Monitoring and alerting

### Key Implementation Details

**Authentication Middleware:**
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/ApiKey';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ error: 'Missing API key' });
  }

  // Hash and lookup (never store plaintext keys)
  const hashedKey = hashApiKey(apiKey);
  const key = await ApiKey.findByHash(hashedKey);

  if (!key || !key.isActive) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Rate limiting per API key
  const rateLimitOk = await checkRateLimit(key.id);
  if (!rateLimitOk) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  req.apiKey = key;
  next();
}
```

**Subscription Creation with Idempotency:**
```typescript
// controllers/subscriptions.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createSubscription(req: Request, res: Response) {
  const { customerId, planId, paymentMethodId } = req.body;

  // Idempotency key from client or generate
  const idempotencyKey = req.headers['idempotency-key'] as string ||
                         generateIdempotencyKey();

  try {
    // Check for existing subscription with this idempotency key
    const existing = await db.subscriptions.findByIdempotencyKey(
      idempotencyKey
    );
    if (existing) {
      return res.status(200).json(existing); // Return cached result
    }

    // Get customer from DB
    const customer = await db.customers.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Attach payment method to customer in Stripe
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(customer.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.stripeCustomerId,
      items: [{ price: planId }],
      expand: ['latest_invoice.payment_intent'],
    }, {
      idempotencyKey, // Stripe-level idempotency
    });

    // Save to our database
    const subscription = await db.subscriptions.create({
      customerId: customer.id,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      planId,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      idempotencyKey,
    });

    res.status(201).json(subscription);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: error.message,
        type: error.type,
      });
    }
    throw error; // Let error handler middleware catch
  }
}
```

**Webhook Handler with Queue:**
```typescript
// controllers/webhooks.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { webhookQueue } from '../queues/webhookQueue';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature (critical for security)
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Check for duplicate events
  const existing = await db.webhookEvents.findByStripeEventId(event.id);
  if (existing) {
    return res.status(200).json({ received: true }); // Already processed
  }

  // Save event to database
  await db.webhookEvents.create({
    stripeEventId: event.id,
    eventType: event.type,
    payload: event,
    processed: false,
  });

  // Add to processing queue (asynchronous)
  await webhookQueue.add('process-webhook', {
    eventId: event.id,
    eventType: event.type,
  }, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  // Respond immediately (Stripe expects 200 within 5s)
  res.status(200).json({ received: true });
}
```

**Webhook Queue Processor:**
```typescript
// queues/webhookQueue.ts
import { Queue, Worker } from 'bullmq';
import { db } from '../db';
import { processSubscriptionUpdated } from '../services/subscriptionService';

export const webhookQueue = new Queue('webhooks', {
  connection: redisConnection,
});

const worker = new Worker('webhooks', async (job) => {
  const { eventId, eventType } = job.data;

  const webhookEvent = await db.webhookEvents.findByStripeEventId(eventId);
  if (!webhookEvent) {
    throw new Error(`Webhook event ${eventId} not found`);
  }

  if (webhookEvent.processed) {
    return; // Already processed
  }

  // Process based on event type
  switch (eventType) {
    case 'customer.subscription.updated':
      await processSubscriptionUpdated(webhookEvent.payload);
      break;
    case 'customer.subscription.deleted':
      await processSubscriptionDeleted(webhookEvent.payload);
      break;
    case 'invoice.payment_succeeded':
      await processPaymentSucceeded(webhookEvent.payload);
      break;
    case 'invoice.payment_failed':
      await processPaymentFailed(webhookEvent.payload);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  // Mark as processed
  await db.webhookEvents.markProcessed(eventId);
}, {
  connection: redisConnection,
});

worker.on('failed', (job, err) => {
  console.error(`Webhook processing failed for job ${job.id}:`, err);
  // Alert on-call engineer
  alerting.sendAlert({
    severity: 'high',
    message: `Webhook processing failed: ${err.message}`,
    jobId: job.id,
  });
});
```

### Security Implementation

**PCI Compliance Measures:**
- ✅ Never store card numbers (use Stripe tokens)
- ✅ TLS 1.2+ only
- ✅ Webhook signature verification
- ✅ API key rotation policy
- ✅ Audit logging of all payment operations
- ✅ Regular security scans

**Input Validation:**
```typescript
// validation/subscriptionSchema.ts
import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().startsWith('price_'), // Stripe price ID format
  paymentMethodId: z.string().startsWith('pm_').optional(),
  metadata: z.record(z.string()).optional(),
});

// In controller
const validated = createSubscriptionSchema.parse(req.body);
```

### Testing

**Test Coverage: 88%**

**Unit Tests:**
```typescript
// tests/subscriptions.test.ts
describe('Subscription Creation', () => {
  it('creates subscription with valid data', async () => {
    const mockCustomer = await createMockCustomer();
    const mockPlan = 'price_123';

    const response = await request(app)
      .post('/v1/subscriptions')
      .set('x-api-key', testApiKey)
      .send({
        customerId: mockCustomer.id,
        planId: mockPlan,
        paymentMethodId: 'pm_test_123',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('active');
  });

  it('handles idempotency correctly', async () => {
    const idempotencyKey = 'test-key-123';

    // First request
    const response1 = await request(app)
      .post('/v1/subscriptions')
      .set('x-api-key', testApiKey)
      .set('idempotency-key', idempotencyKey)
      .send(validPayload);

    // Second request with same key
    const response2 = await request(app)
      .post('/v1/subscriptions')
      .set('x-api-key', testApiKey)
      .set('idempotency-key', idempotencyKey)
      .send(validPayload);

    expect(response1.body.id).toBe(response2.body.id);
    expect(response2.status).toBe(200); // Not 201
  });
});
```

**Integration Tests:**
```typescript
// tests/integration/webhook.test.ts
describe('Webhook Processing', () => {
  it('processes subscription update webhook', async () => {
    const event = createStripeEvent('customer.subscription.updated', {
      id: 'sub_123',
      status: 'active',
    });

    const signature = generateWebhookSignature(event);

    await request(app)
      .post('/webhooks/stripe')
      .set('stripe-signature', signature)
      .send(event);

    // Wait for queue processing
    await wait(1000);

    const subscription = await db.subscriptions.findByStripeId('sub_123');
    expect(subscription.status).toBe('active');
  });
});
```

---

## Phase 4: Quality Assurance (Week 9)

### Command Used
```bash
/henry-orchestrator:henry-review Payment API before production
```

### QA Results

**Functional Testing:**
- ✅ All endpoints working correctly
- ✅ Idempotency tested (duplicate requests)
- ✅ Error handling validated
- ✅ Edge cases covered (expired cards, insufficient funds)

**Security Testing:**
- ✅ No SQL injection vulnerabilities
- ✅ Webhook signature verification working
- ✅ API key authentication secure
- ✅ Rate limiting effective
- ✅ No sensitive data in logs

**Performance Testing:**
- ✅ API response time: 150ms avg (target: <200ms)
- ✅ Webhook processing: 2.5s avg (target: <5s)
- ✅ Load test: 1000 req/s sustained (no degradation)

**Bugs Found:**
1. ✅ Webhook retry exhaustion not alerting → Fixed
2. ✅ Subscription cancellation not handling grace period → Fixed
3. ✅ Rate limit counter not expiring → Fixed

---

## Phase 5: Pre-Launch Audit (Week 10)

### Command Used
```bash
/henry-orchestrator:henry-audit Payment API production readiness
```

### Audit Results

**Security:**
- ✅ PCI DSS SAQ A compliant
- ✅ Penetration test passed (external firm)
- ✅ Secrets management secure (AWS Secrets Manager)
- ✅ API key rotation implemented

**Reliability:**
- ✅ Database replication configured (failover <30s)
- ✅ Redis sentinel for high availability
- ✅ Automated backups (hourly, 30-day retention)
- ✅ Disaster recovery plan documented

**Monitoring:**
- ✅ APM (Datadog) configured
- ✅ Error tracking (Sentry)
- ✅ Custom metrics (subscription churn, webhook latency)
- ✅ Alerts for critical events

**Documentation:**
- ✅ API reference (OpenAPI/Swagger)
- ✅ Integration guide
- ✅ Webhook documentation
- ✅ Runbook for on-call

**Decision: GO for production**

---

## Phase 6: Launch (Week 11)

### Command Used
```bash
/henry-orchestrator:henry-launch Payment API production deployment
```

### Launch Execution

**Deployment:**
- Blue-green deployment to AWS ECS
- Database migrations applied (zero downtime)
- DNS cutover with 5-minute TTL

**Launch Results:**
- ✅ Deployment successful
- ✅ All health checks passing
- ✅ First production subscription created (internal test)
- ✅ Webhooks processing correctly

**Week 1 Metrics:**
- Uptime: 100%
- Avg response time: 145ms
- Webhook processing: 1.8s avg
- API calls: 15,000
- Subscriptions created: 42

---

## Phase 7: Post-Launch (Week 12+)

### Metrics Tracking

| Metric | Week 1 | Week 4 | Target |
|--------|--------|--------|--------|
| Uptime | 100% | 99.95% | >99.9% |
| Response time (p95) | 180ms | 165ms | <200ms |
| Webhook latency | 1.8s | 1.5s | <5s |
| Error rate | 0.1% | 0.08% | <1% |

### Optimizations

**Performance:**
- Added database connection pooling tuning
- Implemented Redis caching for customer lookups
- Optimized webhook queue concurrency

**Features Added:**
- Usage-based billing (metered subscriptions)
- Proration support for plan changes
- Subscription pause/resume

---

## Summary

**Timeline:** 11 weeks from concept to production launch

**Final Metrics:**
- ✅ 99.95% uptime (exceeded 99.9% target)
- ✅ 165ms response time (exceeded <200ms target)
- ✅ PCI compliant
- ✅ 0 security incidents
- ✅ 42 customers onboarded in week 1

**Status:** ✅ Successful launch, ready for scale
