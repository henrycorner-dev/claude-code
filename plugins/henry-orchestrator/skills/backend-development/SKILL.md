---
name: backend-development
description: This skill should be used when the user asks to "implement server logic", "create API endpoints", "build a REST API", "set up Express server", "create Django views", "implement business rules", "add authentication", "integrate third-party APIs", "handle database operations", "create middleware", "implement error handling", or mentions backend frameworks like Node.js/Express, Python/Django, or Go/Gin. Provides comprehensive guidance for server-side development.
version: 0.1.0
---

# Backend Development

## Purpose

This skill provides guidance for implementing server-side logic, creating robust APIs, handling business rules, and integrating external services. It covers best practices for building scalable backend applications using popular frameworks like Node.js/Express, Python/Django, and Go/Gin.

## When to Use This Skill

Use this skill when implementing:

- RESTful or GraphQL APIs
- Authentication and authorization systems
- Business logic and data validation
- Database operations and ORM usage
- Third-party API integrations
- Middleware and request/response handling
- Error handling and logging
- Background jobs and task queues
- WebSocket or real-time features

## Core Principles

### 1. Separation of Concerns

Structure code with clear boundaries:

**Controllers/Handlers** - Handle HTTP requests and responses
**Services/Business Logic** - Implement core business rules
**Models/Data Access** - Interact with databases
**Middleware** - Process requests before handlers
**Utilities** - Shared helper functions

### 2. Error Handling

Implement consistent error handling:

- Use custom error classes for different error types
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors with context for debugging
- Never expose sensitive information in error responses
- Handle async errors properly with try-catch or error middleware

### 3. Validation

Validate all input data:

- Validate request body, query parameters, and path parameters
- Use validation libraries (Joi, Yup, Pydantic, etc.)
- Sanitize user input to prevent injection attacks
- Return clear validation error messages
- Validate at the entry point (controller/handler level)

### 4. Security

Implement security best practices:

- Use HTTPS in production
- Implement rate limiting to prevent abuse
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user input
- Use secure password hashing (bcrypt, argon2)
- Implement CORS properly
- Use environment variables for secrets
- Add security headers (helmet.js, Django security middleware)
- Implement proper authentication (JWT, OAuth, sessions)
- Apply principle of least privilege for database access

## Framework-Specific Guidance

### Node.js/Express

**Project Structure:**

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── models/         # Database models
├── middleware/     # Custom middleware
├── routes/         # Route definitions
├── utils/          # Helper functions
├── config/         # Configuration files
└── app.js         # Application entry point
```

**Key Practices:**

- Use async/await for asynchronous operations
- Implement error-handling middleware
- Use environment variables with dotenv
- Separate route definitions from business logic
- Use middleware for authentication, logging, and validation
- Consider TypeScript for type safety

**See `references/nodejs-express.md` for detailed patterns and examples.**

### Python/Django

**Project Structure:**

```
project/
├── app/
│   ├── models.py      # Database models
│   ├── views.py       # View functions/classes
│   ├── serializers.py # DRF serializers
│   ├── urls.py        # URL routing
│   └── services.py    # Business logic
├── config/
│   └── settings.py    # Django settings
└── manage.py
```

**Key Practices:**

- Use Django REST Framework for APIs
- Leverage Django ORM for database operations
- Use class-based views for complex logic
- Implement custom managers for reusable queries
- Use Django's built-in authentication
- Apply migrations for schema changes
- Use Django's caching framework
- Implement proper permission classes

**See `references/python-django.md` for detailed patterns and examples.**

### Go/Gin

**Project Structure:**

```
project/
├── handlers/      # HTTP handlers
├── services/      # Business logic
├── models/        # Data structures
├── middleware/    # Custom middleware
├── db/           # Database connection
├── utils/        # Helper functions
└── main.go       # Application entry point
```

**Key Practices:**

- Use structured logging
- Handle errors explicitly
- Use context for request-scoped values
- Implement graceful shutdown
- Use dependency injection for testability
- Leverage Go's concurrency features appropriately
- Use interfaces for abstraction
- Implement proper error types

**See `references/go-gin.md` for detailed patterns and examples.**

## Common Implementation Patterns

### RESTful API Design

Follow REST conventions:

**Resource naming:**

- Use plural nouns for collections: `/api/users`, `/api/products`
- Use path parameters for specific resources: `/api/users/:id`
- Use query parameters for filtering: `/api/users?role=admin`

**HTTP methods:**

- GET - Retrieve resources
- POST - Create new resources
- PUT/PATCH - Update existing resources
- DELETE - Remove resources

**Status codes:**

- 200 OK - Successful GET, PUT, PATCH
- 201 Created - Successful POST
- 204 No Content - Successful DELETE
- 400 Bad Request - Validation errors
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 500 Internal Server Error - Server errors

### Authentication Patterns

**JWT (JSON Web Tokens):**

- Issue tokens on successful login
- Include claims (user ID, roles, expiry)
- Verify token on protected routes
- Implement token refresh mechanism
- Store tokens securely on client

**Session-based:**

- Use secure session cookies
- Store session data server-side
- Implement session expiration
- Clear sessions on logout

**OAuth 2.0:**

- Use for third-party authentication
- Implement authorization code flow
- Securely store access and refresh tokens

### Database Operations

**ORM Best Practices:**

- Use transactions for related operations
- Implement proper indexing
- Avoid N+1 queries with eager loading
- Use connection pooling
- Handle connection errors gracefully

**Query Optimization:**

- Select only needed fields
- Use pagination for large datasets
- Implement caching for frequent queries
- Use database-specific optimizations
- Monitor slow queries

### API Integration

**Making External API Calls:**

- Use HTTP client libraries (axios, requests, http package)
- Implement retry logic with exponential backoff
- Set appropriate timeouts
- Handle rate limiting
- Validate external API responses
- Cache responses when appropriate
- Log API calls for debugging

### Middleware Implementation

**Common middleware types:**

- Authentication/Authorization
- Request logging
- Error handling
- CORS handling
- Request validation
- Rate limiting
- Request ID generation

**Middleware ordering matters** - Apply in this sequence:

1. CORS and security headers
2. Request logging
3. Authentication
4. Authorization
5. Validation
6. Business logic handlers
7. Error handling

## Testing Backend Code

### Unit Tests

Test individual functions and methods:

- Mock external dependencies (database, APIs)
- Test business logic in isolation
- Cover edge cases and error conditions
- Aim for high coverage on business logic

### Integration Tests

Test component interactions:

- Test API endpoints end-to-end
- Use test database or in-memory database
- Test authentication flows
- Verify error handling
- Test middleware behavior

### Testing Tools

**Node.js:** Jest, Mocha, Chai, Supertest
**Python:** pytest, unittest, Django TestCase
**Go:** testing package, testify, httptest

## Performance Considerations

### Optimization Strategies

**Caching:**

- Cache expensive computations
- Use Redis for distributed caching
- Implement cache invalidation strategies
- Cache API responses appropriately

**Async Operations:**

- Use background jobs for long-running tasks
- Implement message queues (RabbitMQ, Redis Queue)
- Process tasks asynchronously
- Return immediate responses for queued work

**Database Performance:**

- Add appropriate indexes
- Use connection pooling
- Optimize queries
- Implement read replicas for scaling
- Use database-specific features

**Load Balancing:**

- Design stateless services
- Use horizontal scaling
- Implement health checks
- Consider API gateways

## Logging and Monitoring

### Structured Logging

Implement consistent logging:

- Use structured log formats (JSON)
- Include context (request ID, user ID, timestamp)
- Log at appropriate levels (debug, info, warn, error)
- Avoid logging sensitive information
- Use correlation IDs for request tracing

### Monitoring

Track key metrics:

- Response times
- Error rates
- Request volume
- Database query performance
- API dependency health
- Resource usage (CPU, memory)

## Additional Resources

### Reference Files

For framework-specific implementation details:

- **`references/nodejs-express.md`** - Node.js/Express patterns, middleware, and examples
- **`references/python-django.md`** - Django/DRF patterns, views, and examples
- **`references/go-gin.md`** - Go/Gin patterns, handlers, and examples

### Example Files

Complete working examples:

- **`examples/express-api/`** - Full Express REST API with authentication
- **`examples/django-api/`** - Django REST Framework API example
- **`examples/gin-api/`** - Go/Gin API with middleware

## Implementation Workflow

When building backend features:

1. **Define requirements** - Understand endpoints, data flow, and business rules
2. **Design API structure** - Plan routes, request/response formats, and status codes
3. **Set up routing** - Create route definitions and map to handlers
4. **Implement handlers** - Write controller/handler functions
5. **Add business logic** - Implement services with core business rules
6. **Integrate database** - Add models and data access layer
7. **Add validation** - Validate all input data
8. **Implement error handling** - Handle errors consistently
9. **Add authentication** - Secure protected endpoints
10. **Write tests** - Test endpoints and business logic
11. **Add logging** - Log important events and errors
12. **Performance tuning** - Optimize queries and add caching

## Common Patterns by Use Case

### CRUD Operations

Implement standard Create, Read, Update, Delete endpoints:

- Use appropriate HTTP methods
- Validate input data
- Handle not found errors
- Return consistent response formats
- Implement proper authorization

### File Uploads

Handle file uploads securely:

- Validate file types and sizes
- Use multipart form data
- Store files appropriately (local, S3, etc.)
- Generate unique filenames
- Implement virus scanning for production

### Pagination

Implement pagination for list endpoints:

- Use cursor or offset-based pagination
- Return metadata (total count, page info)
- Set reasonable default and maximum page sizes
- Include pagination links in response

### Search and Filtering

Implement search functionality:

- Support query parameters for filtering
- Use database full-text search or search engines (Elasticsearch)
- Implement sorting options
- Handle invalid search parameters gracefully

### Background Jobs

Process long-running tasks asynchronously:

- Use job queues (Bull, Celery, custom solutions)
- Return job ID immediately
- Provide job status endpoints
- Implement retry logic for failed jobs
- Handle job timeouts

## Security Checklist

Before deploying backend code:

- [ ] All user input is validated and sanitized
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (proper output encoding)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks in place
- [ ] Passwords hashed securely
- [ ] Secrets in environment variables, not code
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Logging doesn't include sensitive data

## Quick Reference

### Status Code Selection

- Success with data → 200 OK
- Resource created → 201 Created
- Success without data → 204 No Content
- Invalid request → 400 Bad Request
- Not authenticated → 401 Unauthorized
- Authenticated but forbidden → 403 Forbidden
- Resource not found → 404 Not Found
- Server error → 500 Internal Server Error

### Common HTTP Headers

**Request:**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`
- `Accept: application/json`

**Response:**

- `Content-Type: application/json`
- `Cache-Control: no-cache`
- `X-Request-ID: <uuid>`

### Environment Variables

Common variables to configure:

- `PORT` - Server port
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for signing tokens
- `API_KEY` - Third-party API keys
- `NODE_ENV` / `ENVIRONMENT` - Environment name
- `LOG_LEVEL` - Logging verbosity
- `REDIS_URL` - Cache connection string

## Best Practices Summary

**DO:**

- Validate all input data
- Use appropriate HTTP status codes
- Implement proper error handling
- Write tests for business logic
- Use environment variables for configuration
- Log important events and errors
- Separate concerns (controllers, services, models)
- Document API endpoints
- Version APIs for stability
- Use middleware for cross-cutting concerns
- Implement authentication and authorization
- Optimize database queries

**DON'T:**

- Expose sensitive information in errors
- Store secrets in code
- Trust user input without validation
- Ignore error handling
- Return inconsistent response formats
- Skip authentication on protected routes
- Write business logic in controllers
- Commit configuration files with secrets
- Ignore security best practices
- Skip testing critical paths

Focus on security, maintainability, and performance when implementing backend systems. Use the framework-specific references for detailed implementation patterns.
