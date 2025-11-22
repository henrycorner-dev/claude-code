# REST API Patterns

## Advanced REST Patterns

### HATEOAS (Hypermedia as the Engine of Application State)

Include links in responses to guide API navigation:

```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "_links": {
    "self": { "href": "/users/123" },
    "posts": { "href": "/users/123/posts" },
    "followers": { "href": "/users/123/followers" }
  }
}
```

### Pagination Patterns

**Offset-Based Pagination:**

```
GET /users?page=2&limit=20
```

Response:

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  },
  "_links": {
    "first": "/users?page=1&limit=20",
    "prev": "/users?page=1&limit=20",
    "next": "/users?page=3&limit=20",
    "last": "/users?page=25&limit=20"
  }
}
```

**Cursor-Based Pagination (Better for Real-Time Data):**

```
GET /posts?cursor=eyJpZCI6MTIzfQ==&limit=20
```

Response:

```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQzfQ==",
    "hasMore": true
  }
}
```

### Filtering Patterns

**Simple Filters:**

```
GET /users?status=active&role=admin
```

**Range Filters:**

```
GET /orders?createdAt[gte]=2024-01-01&createdAt[lt]=2024-02-01
GET /products?price[gte]=10&price[lte]=100
```

**Search:**

```
GET /users?q=john
GET /posts?search=api+design
```

**Nested Filters:**

```
GET /users?address.city=Seattle&address.state=WA
```

### Sorting Patterns

**Single Field:**

```
GET /users?sort=createdAt&order=desc
```

**Multiple Fields:**

```
GET /users?sort=lastName,firstName&order=asc,asc
```

**Combined Notation:**

```
GET /users?sort=-createdAt,+lastName
```

(- for descending, + for ascending)

### Field Selection (Sparse Fieldsets)

```
GET /users?fields=id,name,email
GET /posts?fields=title,author(name,email)
```

Response includes only requested fields:

```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Resource Expansion

```
GET /posts/123?expand=author,comments
```

Response includes expanded nested resources:

```json
{
  "id": 123,
  "title": "API Design",
  "author": {
    "id": 456,
    "name": "Jane Smith"
  },
  "comments": [{ "id": 1, "text": "Great post!" }]
}
```

## Bulk Operations

### Batch Creates:

```http
POST /users/batch
Content-Type: application/json

{
  "users": [
    { "name": "User 1", "email": "user1@example.com" },
    { "name": "User 2", "email": "user2@example.com" }
  ]
}
```

Response:

```json
{
  "created": [
    { "id": 123, "name": "User 1" },
    { "id": 124, "name": "User 2" }
  ],
  "errors": []
}
```

### Batch Updates:

```http
PATCH /users/batch
Content-Type: application/json

{
  "updates": [
    { "id": 123, "status": "active" },
    { "id": 124, "status": "inactive" }
  ]
}
```

### Batch Deletes:

```http
DELETE /users/batch
Content-Type: application/json

{
  "ids": [123, 124, 125]
}
```

## Asynchronous Operations

For long-running operations, return 202 Accepted with status endpoint:

```http
POST /reports/generate
Content-Type: application/json

{
  "type": "annual",
  "year": 2024
}
```

Response:

```http
HTTP/1.1 202 Accepted
Location: /reports/status/abc-123

{
  "id": "abc-123",
  "status": "processing",
  "_links": {
    "status": "/reports/status/abc-123"
  }
}
```

Check status:

```http
GET /reports/status/abc-123
```

Response (in progress):

```json
{
  "id": "abc-123",
  "status": "processing",
  "progress": 45
}
```

Response (complete):

```json
{
  "id": "abc-123",
  "status": "completed",
  "_links": {
    "download": "/reports/abc-123/download"
  }
}
```

## Error Response Patterns

### Standard Error Format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "age",
        "message": "Age must be at least 18"
      }
    ],
    "requestId": "req-123-456"
  }
}
```

### Error Codes Taxonomy:

- `AUTHENTICATION_REQUIRED` - 401
- `AUTHENTICATION_FAILED` - 401
- `PERMISSION_DENIED` - 403
- `RESOURCE_NOT_FOUND` - 404
- `VALIDATION_ERROR` - 400
- `DUPLICATE_RESOURCE` - 409
- `RATE_LIMIT_EXCEEDED` - 429
- `INTERNAL_SERVER_ERROR` - 500
- `SERVICE_UNAVAILABLE` - 503

## Conditional Requests

### ETags for Caching:

Response includes ETag:

```http
GET /users/123

HTTP/1.1 200 OK
ETag: "abc123"

{ "id": 123, "name": "John" }
```

Subsequent request with If-None-Match:

```http
GET /users/123
If-None-Match: "abc123"

HTTP/1.1 304 Not Modified
```

### Optimistic Locking:

Update with If-Match to prevent conflicts:

```http
PATCH /users/123
If-Match: "abc123"

{ "name": "John Doe" }
```

If resource changed (ETag mismatch):

```http
HTTP/1.1 412 Precondition Failed
```

## Content Negotiation

Request specific format:

```http
GET /users/123
Accept: application/json
```

```http
GET /users/123
Accept: application/xml
```

```http
GET /users/123
Accept: text/csv
```

## Versioning Strategies Detailed

### URL Versioning (Recommended):

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

Pros: Clear, easy to route, visible
Cons: URL changes for new versions

### Header Versioning:

```http
GET /users
Accept: application/vnd.api.v2+json
```

Pros: Clean URLs
Cons: Harder to test, less discoverable

### Query Parameter:

```
GET /users?version=2
```

Pros: Simple
Cons: Pollutes query string, easy to miss

## Rate Limiting Implementation

### Response Headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

When limit exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995260

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 60 seconds."
  }
}
```

## Webhook Patterns

### Webhook Registration:

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://client.example.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "webhook_secret_key"
}
```

### Webhook Delivery:

```http
POST https://client.example.com/webhook
X-Webhook-Signature: sha256=abc123...
Content-Type: application/json

{
  "event": "user.created",
  "data": {
    "id": 123,
    "name": "John Doe"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Verify signature using HMAC with secret.

### Webhook Retry Logic:

- Retry failed deliveries with exponential backoff
- Maximum 3-5 retry attempts
- Mark webhook as failed after max retries
- Provide webhook delivery logs endpoint

## Health Check Endpoints

```http
GET /health

HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "version": "1.2.3",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  }
}
```

Degraded state:

```http
HTTP/1.1 503 Service Unavailable

{
  "status": "degraded",
  "checks": {
    "database": "healthy",
    "redis": "unhealthy",
    "storage": "healthy"
  }
}
```

## Best Practices Summary

1. **Use nouns for resources, not verbs**
2. **Use HTTP methods correctly** (GET for reads, POST for creates, etc.)
3. **Return appropriate status codes**
4. **Implement pagination for list endpoints**
5. **Support filtering and sorting**
6. **Use consistent error response format**
7. **Include rate limiting headers**
8. **Version your API** (prefer URL versioning)
9. **Use ETags for caching**
10. **Document everything with OpenAPI**
11. **Implement health check endpoints**
12. **Use HTTPS only**
13. **Validate all inputs**
14. **Log requests and responses** (sanitize sensitive data)
15. **Monitor API performance and errors**
