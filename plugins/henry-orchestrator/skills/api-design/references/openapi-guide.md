# OpenAPI/Swagger Complete Guide

## OpenAPI Specification Overview

OpenAPI (formerly Swagger) is a standard for defining REST APIs. The specification allows you to describe your entire API including endpoints, operations, parameters, authentication, and more.

### OpenAPI Versions

- **OpenAPI 3.1** (Latest) - Aligned with JSON Schema 2020-12
- **OpenAPI 3.0** (Widely used) - Most tooling supports this
- **Swagger 2.0** (Legacy) - Deprecated, use OpenAPI 3.x

## Basic Structure

### Complete OpenAPI 3.0 Template

```yaml
openapi: 3.0.3
info:
  title: Your API Name
  description: |
    Detailed description of your API.
    Supports **markdown** formatting.
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com
    url: https://example.com/support
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  termsOfService: https://example.com/terms

servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server
  - url: http://localhost:3000/v1
    description: Local development

tags:
  - name: users
    description: User management operations
  - name: posts
    description: Blog post operations
  - name: auth
    description: Authentication endpoints

paths:
  /users:
    get:
      summary: List users
      description: Retrieve a paginated list of users
      tags:
        - users
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: status
          in: query
          description: Filter by user status
          schema:
            type: string
            enum: [active, inactive, suspended]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
      security:
        - bearerAuth: []

    post:
      summary: Create user
      description: Create a new user account
      tags:
        - users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
            examples:
              example1:
                summary: Create admin user
                value:
                  name: John Doe
                  email: john@example.com
                  role: admin
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
      security:
        - bearerAuth: []

  /users/{userId}:
    parameters:
      - name: userId
        in: path
        required: true
        description: User ID
        schema:
          type: integer
          format: int64
          minimum: 1

    get:
      summary: Get user
      description: Retrieve a single user by ID
      tags:
        - users
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - bearerAuth: []

    put:
      summary: Update user
      description: Update an existing user
      tags:
        - users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: User updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - bearerAuth: []

    delete:
      summary: Delete user
      description: Delete a user account
      tags:
        - users
      responses:
        '204':
          description: User deleted successfully
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - bearerAuth: []

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
        - status
        - createdAt
      properties:
        id:
          type: integer
          format: int64
          example: 123
          readOnly: true
        name:
          type: string
          minLength: 1
          maxLength: 100
          example: John Doe
        email:
          type: string
          format: email
          example: john@example.com
        bio:
          type: string
          nullable: true
          maxLength: 500
          example: Software engineer passionate about APIs
        role:
          type: string
          enum: [user, admin, moderator]
          default: user
        status:
          type: string
          enum: [active, inactive, suspended]
          readOnly: true
        createdAt:
          type: string
          format: date-time
          readOnly: true
          example: '2024-01-15T10:30:00Z'
        updatedAt:
          type: string
          format: date-time
          readOnly: true
          example: '2024-01-15T10:30:00Z'

    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
        bio:
          type: string
          maxLength: 500
        role:
          type: string
          enum: [user, admin, moderator]
          default: user

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
        bio:
          type: string
          maxLength: 500
          nullable: true

    UserList:
      type: object
      required:
        - data
        - pagination
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      required:
        - page
        - limit
        - total
        - totalPages
      properties:
        page:
          type: integer
          minimum: 1
          example: 1
        limit:
          type: integer
          minimum: 1
          maximum: 100
          example: 20
        total:
          type: integer
          minimum: 0
          example: 150
        totalPages:
          type: integer
          minimum: 0
          example: 8

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          example: VALIDATION_ERROR
        message:
          type: string
          example: Validation failed
        details:
          type: array
          items:
            $ref: '#/components/schemas/ErrorDetail'
        requestId:
          type: string
          example: req-123-456

    ErrorDetail:
      type: object
      required:
        - field
        - message
      properties:
        field:
          type: string
          example: email
        message:
          type: string
          example: Email is required

  parameters:
    PageParam:
      name: page
      in: query
      description: Page number for pagination
      schema:
        type: integer
        minimum: 1
        default: 1

    LimitParam:
      name: limit
      in: query
      description: Number of items per page
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: VALIDATION_ERROR
            message: Validation failed
            details:
              - field: email
                message: Email is required

    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: AUTHENTICATION_REQUIRED
            message: Authentication required

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: RESOURCE_NOT_FOUND
            message: User not found

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT authentication using Bearer token

    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key authentication

    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/oauth/authorize
          tokenUrl: https://auth.example.com/oauth/token
          scopes:
            read:users: Read user information
            write:users: Modify user information
            admin: Administrative access

security:
  - bearerAuth: []
```

## Advanced Schema Patterns

### Inheritance with allOf

```yaml
components:
  schemas:
    BaseEntity:
      type: object
      required:
        - id
        - createdAt
      properties:
        id:
          type: integer
          format: int64
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    User:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required:
            - name
            - email
          properties:
            name:
              type: string
            email:
              type: string
              format: email

    Post:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required:
            - title
            - authorId
          properties:
            title:
              type: string
            content:
              type: string
            authorId:
              type: integer
```

### Polymorphism with oneOf

```yaml
components:
  schemas:
    Pet:
      type: object
      required:
        - type
      properties:
        type:
          type: string
      discriminator:
        propertyName: type
        mapping:
          dog: '#/components/schemas/Dog'
          cat: '#/components/schemas/Cat'

    Dog:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            breed:
              type: string
            barkVolume:
              type: integer

    Cat:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            color:
              type: string
            indoor:
              type: boolean

    SearchResult:
      oneOf:
        - $ref: '#/components/schemas/User'
        - $ref: '#/components/schemas/Post'
      discriminator:
        propertyName: resultType
```

### Complex Nested Objects

```yaml
components:
  schemas:
    Organization:
      type: object
      required:
        - id
        - name
        - address
      properties:
        id:
          type: integer
        name:
          type: string
        address:
          type: object
          required:
            - street
            - city
            - country
          properties:
            street:
              type: string
            city:
              type: string
            state:
              type: string
            postalCode:
              type: string
            country:
              type: string
              minLength: 2
              maxLength: 2
              pattern: '^[A-Z]{2}$'
        contacts:
          type: array
          items:
            type: object
            required:
              - type
              - value
            properties:
              type:
                type: string
                enum: [email, phone, fax]
              value:
                type: string
```

## Request Body Patterns

### Multiple Content Types

```yaml
paths:
  /upload:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                url:
                  type: string
                  format: uri
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                description:
                  type: string
          application/octet-stream:
            schema:
              type: string
              format: binary
```

### File Upload

```yaml
paths:
  /upload:
    post:
      summary: Upload file
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                metadata:
                  type: object
                  properties:
                    title:
                      type: string
                    tags:
                      type: array
                      items:
                        type: string
            encoding:
              file:
                contentType: image/png, image/jpeg
```

## Response Patterns

### Multiple Response Types

```yaml
paths:
  /users/{userId}:
    get:
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
            application/xml:
              schema:
                $ref: '#/components/schemas/User'
            text/csv:
              schema:
                type: string
```

### Response Headers

```yaml
paths:
  /users:
    get:
      responses:
        '200':
          description: List of users
          headers:
            X-RateLimit-Limit:
              description: Request limit per hour
              schema:
                type: integer
            X-RateLimit-Remaining:
              description: Remaining requests
              schema:
                type: integer
            X-RateLimit-Reset:
              description: Reset time (Unix timestamp)
              schema:
                type: integer
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

## Authentication Patterns

### Multiple Auth Methods

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

    apiKey:
      type: apiKey
      in: header
      name: X-API-Key

    basicAuth:
      type: http
      scheme: basic

    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/authorize
          tokenUrl: https://auth.example.com/token
          scopes:
            read: Read access
            write: Write access

# Global security (applies to all endpoints)
security:
  - bearerAuth: []

paths:
  /public:
    get:
      summary: Public endpoint
      security: [] # Override global, no auth required

  /admin:
    get:
      summary: Admin endpoint
      security:
        - bearerAuth: []
        - apiKey: []
      # Either bearerAuth OR apiKey required

  /oauth-protected:
    get:
      summary: OAuth protected
      security:
        - oauth2: [read, write]
      # Requires OAuth with read and write scopes
```

## Callbacks (Webhooks)

```yaml
paths:
  /subscribe:
    post:
      summary: Subscribe to webhook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                callbackUrl:
                  type: string
                  format: uri
                events:
                  type: array
                  items:
                    type: string
      responses:
        '201':
          description: Subscription created
      callbacks:
        onEvent:
          '{$request.body#/callbackUrl}':
            post:
              summary: Event notification
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        event:
                          type: string
                        data:
                          type: object
                        timestamp:
                          type: string
                          format: date-time
              responses:
                '200':
                  description: Webhook received
```

## Links (HATEOAS)

```yaml
paths:
  /users/{userId}:
    get:
      responses:
        '200':
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
          links:
            GetUserPosts:
              operationId: getUserPosts
              parameters:
                userId: '$response.body#/id'
            UpdateUser:
              operationId: updateUser
              parameters:
                userId: '$response.body#/id'

  /users/{userId}/posts:
    get:
      operationId: getUserPosts
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User posts
```

## Documentation Best Practices

### 1. Add Descriptions Everywhere

````yaml
paths:
  /users:
    get:
      summary: List all users
      description: |
        Retrieves a paginated list of users with optional filtering.

        ## Filtering
        Filter users by status using the `status` query parameter.

        ## Pagination
        Use `page` and `limit` parameters to paginate results.

        ## Example
        ```
        GET /users?status=active&page=2&limit=50
        ```
      parameters:
        - name: status
          in: query
          description: |
            Filter by user status.
            - `active`: Active users only
            - `inactive`: Inactive users only
            - `suspended`: Suspended users only
          schema:
            type: string
            enum: [active, inactive, suspended]
````

### 2. Provide Examples

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 123
        name:
          type: string
          example: John Doe
        email:
          type: string
          example: john@example.com

  responses:
    UserResponse:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/User'
          examples:
            activeUser:
              summary: Active user
              value:
                id: 123
                name: John Doe
                email: john@example.com
                status: active
            suspendedUser:
              summary: Suspended user
              value:
                id: 456
                name: Jane Smith
                email: jane@example.com
                status: suspended
```

### 3. Document Error Responses

```yaml
paths:
  /users/{userId}:
    get:
      responses:
        '200':
          description: Success
        '400':
          description: Bad request
          content:
            application/json:
              examples:
                invalidId:
                  summary: Invalid user ID format
                  value:
                    code: VALIDATION_ERROR
                    message: User ID must be a positive integer
        '404':
          description: Not found
          content:
            application/json:
              example:
                code: RESOURCE_NOT_FOUND
                message: User not found
        '500':
          description: Server error
          content:
            application/json:
              example:
                code: INTERNAL_SERVER_ERROR
                message: An unexpected error occurred
```

## Validation and Linting

### Using Spectral

```bash
npm install -g @stoplight/spectral-cli

# Lint OpenAPI file
spectral lint openapi.yaml
```

### Spectral Rules (.spectral.yaml)

```yaml
extends: spectral:oas

rules:
  operation-description: error
  operation-tags: error
  operation-operationId: error
  info-contact: error
  info-description: error
  tag-description: error
```

## Code Generation

### Generate Server (Node.js)

```bash
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli generate \
  -i openapi.yaml \
  -g nodejs-express-server \
  -o ./server
```

### Generate Client (JavaScript)

```bash
openapi-generator-cli generate \
  -i openapi.yaml \
  -g javascript \
  -o ./client
```

### Generate Types (TypeScript)

```bash
npm install -g openapi-typescript

openapi-typescript openapi.yaml --output types.ts
```

## Testing with OpenAPI

### Dredd (API Testing)

```bash
npm install -g dredd

dredd openapi.yaml http://localhost:3000
```

### Prism (Mock Server)

```bash
npm install -g @stoplight/prism-cli

# Start mock server
prism mock openapi.yaml
```

## Best Practices Summary

1. **Use OpenAPI 3.0 or later** for new projects
2. **Add descriptions** to all operations, parameters, and schemas
3. **Provide examples** for requests and responses
4. **Document all error responses** with examples
5. **Use $ref** to avoid duplication
6. **Tag operations** for organization
7. **Define reusable components** (schemas, parameters, responses)
8. **Include security schemes** and apply them correctly
9. **Version your API** in the URL or headers
10. **Validate your spec** using tools like Spectral
11. **Generate types/clients** from spec to ensure consistency
12. **Keep spec in sync** with implementation
13. **Use meaningful operation IDs** for code generation
14. **Document rate limits** in headers and descriptions
15. **Include contact information** for API support
