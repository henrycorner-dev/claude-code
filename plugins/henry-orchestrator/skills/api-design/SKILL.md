---
name: API Design
description: This skill should be used when the user asks to "design an API", "create REST API", "build GraphQL API", "add authentication", "implement JWT", "configure OAuth", "add rate limiting", "create OpenAPI spec", "generate Swagger docs", or mentions API design, endpoint structure, authentication strategies, or API documentation.
version: 0.1.0
---

# API Design Skill

## Purpose

This skill provides guidance for designing robust, secure, and well-documented APIs. It covers REST and GraphQL API patterns, authentication strategies (JWT, OAuth), rate limiting implementations, and API documentation using OpenAPI/Swagger specifications.

## When to Use This Skill

Use this skill when designing new APIs, refactoring existing endpoints, implementing authentication and authorization, adding rate limiting, or creating API documentation. This skill helps create production-ready APIs that follow industry best practices.

## Core API Design Principles

### RESTful API Design

**Resource-Based URLs:**

- Use nouns for resources: `/users`, `/posts`, `/orders`
- Avoid verbs in URLs: Use HTTP methods instead
- Use hierarchical structure: `/users/{id}/posts` for nested resources
- Use plural nouns for consistency: `/users` not `/user`

**HTTP Methods:**

- `GET` - Retrieve resources (idempotent, safe)
- `POST` - Create new resources
- `PUT` - Replace entire resource (idempotent)
- `PATCH` - Partial update of resource
- `DELETE` - Remove resource (idempotent)

**Status Codes:**

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST with resource creation
- `204 No Content` - Successful DELETE with no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server-side error

**Request/Response Patterns:**

- Use JSON for request and response bodies
- Include `Content-Type: application/json` header
- Return consistent error response structure
- Use pagination for list endpoints: `?page=1&limit=20`
- Support filtering: `?status=active&category=tech`
- Support sorting: `?sort=createdAt&order=desc`

### GraphQL API Design

**Schema Design:**

- Define clear types with meaningful names
- Use interfaces for shared fields
- Implement unions for polymorphic returns
- Add descriptions to all types and fields
- Design mutations with clear input/output types

**Query Structure:**

- Organize queries by domain entities
- Support flexible field selection
- Implement cursor-based pagination for large datasets
- Use DataLoader pattern to prevent N+1 queries

**Error Handling:**

- Return errors in standardized `errors` array
- Include error codes and messages
- Use extensions for additional error context
- Implement partial success for batch operations

## Authentication Strategies

### JWT (JSON Web Tokens)

**Token Structure:**

- Header: Algorithm and token type
- Payload: Claims (user ID, roles, expiration)
- Signature: Verification signature

**Implementation Pattern:**

1. User provides credentials (username/password)
2. Server validates credentials
3. Server generates JWT with claims and expiration
4. Client stores JWT (secure storage)
5. Client includes JWT in `Authorization: Bearer <token>` header
6. Server validates JWT signature and expiration on each request

**Security Considerations:**

- Use strong signing algorithm (RS256 for public/private key)
- Set reasonable expiration times (15-60 minutes for access tokens)
- Implement refresh tokens for long-lived sessions
- Store refresh tokens securely (httpOnly cookies)
- Include token revocation mechanism
- Validate all claims (expiration, issuer, audience)

### OAuth 2.0

**Grant Types:**

- **Authorization Code**: For web apps with backend (most secure)
- **PKCE**: For mobile/SPA apps without client secret
- **Client Credentials**: For machine-to-machine authentication
- **Refresh Token**: For obtaining new access tokens

**Implementation Flow (Authorization Code):**

1. Client redirects user to authorization server
2. User authenticates and grants permission
3. Authorization server redirects back with authorization code
4. Client exchanges code for access token (backend)
5. Client uses access token to access protected resources

**Security Best Practices:**

- Always use HTTPS for all OAuth flows
- Validate redirect URIs strictly
- Use state parameter to prevent CSRF
- Implement PKCE for public clients
- Store tokens securely (never in localStorage for sensitive data)
- Rotate refresh tokens after use

## Rate Limiting

**Common Strategies:**

**Fixed Window:**

- Allow N requests per time window (e.g., 100 requests per minute)
- Simple to implement but allows bursts at window boundaries

**Sliding Window:**

- Track requests with timestamps
- More accurate but requires more storage

**Token Bucket:**

- Bucket fills with tokens at constant rate
- Each request consumes a token
- Allows controlled bursts

**Leaky Bucket:**

- Requests queue in bucket
- Process at constant rate
- Smooths traffic but may increase latency

**Implementation Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

**Rate Limit Tiers:**

- Anonymous users: 10 requests/minute
- Authenticated users: 100 requests/minute
- Premium users: 1000 requests/minute
- Different limits for different endpoints (expensive operations)

## API Documentation

### OpenAPI/Swagger Specification

**Key Components:**

- **Info**: API metadata (title, version, description)
- **Servers**: Base URLs for different environments
- **Paths**: Endpoint definitions with operations
- **Components**: Reusable schemas, responses, parameters
- **Security**: Authentication scheme definitions

**Best Practices:**

- Document all endpoints with descriptions
- Define request/response schemas
- Include example requests and responses
- Document all status codes and error responses
- Specify required vs optional fields
- Use schema references to avoid duplication
- Add security requirements to protected endpoints
- Include deprecation notices for old endpoints

**Documentation Structure:**

```yaml
openapi: 3.0.0
info:
  title: API Name
  version: 1.0.0
  description: API description
servers:
  - url: https://api.example.com/v1
paths:
  /resource:
    get:
      summary: List resources
      parameters: [...]
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResourceList'
components:
  schemas:
    Resource: { ... }
  securitySchemes:
    bearerAuth: { ... }
```

## API Versioning

**Versioning Strategies:**

- URL versioning: `/v1/users`, `/v2/users` (most common)
- Header versioning: `Accept: application/vnd.api+json;version=1`
- Query parameter: `/users?version=1` (not recommended)

**Breaking Changes:**

- Require new version when removing/renaming fields
- Non-breaking: Adding optional fields, new endpoints
- Maintain at least 2 versions simultaneously
- Document deprecation timeline clearly

## Additional Resources

### Reference Files

For detailed implementation patterns and advanced techniques:

- **`references/rest-patterns.md`** - REST API patterns, pagination, filtering, HATEOAS
- **`references/graphql-patterns.md`** - GraphQL schema design, resolvers, subscriptions
- **`references/auth-implementations.md`** - JWT and OAuth implementation details with code examples
- **`references/rate-limiting.md`** - Rate limiting algorithms and implementations
- **`references/openapi-guide.md`** - Complete OpenAPI specification guide with examples

### Example Files

Working examples in `examples/`:

- **`examples/openapi-rest.yaml`** - Complete REST API OpenAPI specification
- **`examples/openapi-auth.yaml`** - OpenAPI with JWT/OAuth security schemes
- **`examples/graphql-schema.graphql`** - GraphQL schema example with best practices

## Quick Reference Tables

### REST Endpoint Naming

| Pattern    | Good                     | Bad                     |
| ---------- | ------------------------ | ----------------------- |
| Collection | `GET /users`             | `GET /getUsers`         |
| Single     | `GET /users/123`         | `GET /user/123`         |
| Nested     | `GET /users/123/posts`   | `GET /posts?userId=123` |
| Action     | `POST /users/123/verify` | `GET /verifyUser/123`   |

### HTTP Status Codes Summary

| Code | Meaning           | Use Case                           |
| ---- | ----------------- | ---------------------------------- |
| 200  | OK                | Successful GET, PUT, PATCH, DELETE |
| 201  | Created           | Successful POST                    |
| 204  | No Content        | Successful DELETE                  |
| 400  | Bad Request       | Invalid input                      |
| 401  | Unauthorized      | Not authenticated                  |
| 403  | Forbidden         | Not authorized                     |
| 404  | Not Found         | Resource missing                   |
| 429  | Too Many Requests | Rate limit                         |
| 500  | Server Error      | Server fault                       |

### Authentication Comparison

| Method  | Use Case           | Token Storage                     | Security                      |
| ------- | ------------------ | --------------------------------- | ----------------------------- |
| JWT     | Modern APIs        | httpOnly cookie or secure storage | High (with proper validation) |
| OAuth   | Third-party access | Backend only                      | Very High                     |
| API Key | Simple auth        | Header/query                      | Medium (use with HTTPS)       |
| Session | Traditional web    | Server-side                       | High (server-controlled)      |

## Implementation Checklist

When designing an API:

**Planning:**

- [ ] Define resource models and relationships
- [ ] Choose REST or GraphQL based on use case
- [ ] Design URL structure or GraphQL schema
- [ ] Plan authentication strategy
- [ ] Determine rate limiting requirements

**Implementation:**

- [ ] Implement consistent error handling
- [ ] Add input validation
- [ ] Implement authentication middleware
- [ ] Add rate limiting
- [ ] Include pagination for list endpoints
- [ ] Add request/response logging
- [ ] Implement CORS for browser clients

**Security:**

- [ ] Use HTTPS only
- [ ] Validate all inputs
- [ ] Implement authentication
- [ ] Add authorization checks
- [ ] Include rate limiting
- [ ] Sanitize error messages (no stack traces in production)
- [ ] Use security headers (CORS, CSP, etc.)

**Documentation:**

- [ ] Create OpenAPI/Swagger specification
- [ ] Document all endpoints
- [ ] Include request/response examples
- [ ] Document authentication requirements
- [ ] Specify rate limits
- [ ] Include error response formats
- [ ] Add getting started guide

**Testing:**

- [ ] Test all endpoints
- [ ] Test authentication flows
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Load test critical endpoints
- [ ] Security test (OWASP top 10)

Consult the reference files for detailed implementation guidance on specific topics.
