# GraphQL Patterns

## Schema Design Best Practices

### Type Definitions

**Object Types:**
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  bio: String
  createdAt: DateTime!
  posts: [Post!]!
  followers(first: Int, after: String): FollowerConnection!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  publishedAt: DateTime
  tags: [String!]!
  comments(first: Int, after: String): CommentConnection!
}
```

**Interfaces for Shared Fields:**
```graphql
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Node & Timestamped {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  email: String!
}

type Post implements Node & Timestamped {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
  content: String!
}
```

**Unions for Polymorphic Returns:**
```graphql
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}
```

Query usage:
```graphql
query {
  search(query: "api design") {
    __typename
    ... on User {
      id
      name
    }
    ... on Post {
      id
      title
    }
    ... on Comment {
      id
      text
    }
  }
}
```

### Input Types

```graphql
input CreateUserInput {
  name: String!
  email: String!
  bio: String
}

input UpdateUserInput {
  name: String
  email: String
  bio: String
}

input UserFilterInput {
  nameContains: String
  status: UserStatus
  createdAfter: DateTime
}
```

### Enums

```graphql
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum SortOrder {
  ASC
  DESC
}
```

## Query Design

### Root Query Structure

```graphql
type Query {
  # Single resource by ID
  user(id: ID!): User
  post(id: ID!): Post

  # List with pagination
  users(
    first: Int
    after: String
    filter: UserFilterInput
    sortBy: UserSortField
    sortOrder: SortOrder
  ): UserConnection!

  posts(
    first: Int
    after: String
    filter: PostFilterInput
  ): PostConnection!

  # Search
  search(query: String!, types: [SearchType!]): [SearchResult!]!

  # Current user (from auth context)
  me: User
}
```

### Relay-Style Connection Pattern

```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

Query usage:
```graphql
query {
  users(first: 10, after: "cursor123") {
    edges {
      node {
        id
        name
        email
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

## Mutation Design

### Mutation Structure

```graphql
type Mutation {
  # User mutations
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!

  # Post mutations
  createPost(input: CreatePostInput!): CreatePostPayload!
  publishPost(id: ID!): PublishPostPayload!

  # Batch operations
  deleteUsers(ids: [ID!]!): DeleteUsersPayload!
}
```

### Mutation Payload Pattern

```graphql
type CreateUserPayload {
  user: User
  errors: [UserError!]!
  success: Boolean!
}

type UserError {
  message: String!
  field: String
  code: String!
}
```

Mutation usage:
```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
  }) {
    user {
      id
      name
      email
    }
    errors {
      message
      field
      code
    }
    success
  }
}
```

### Optimistic Updates Support

Return old and new values:
```graphql
type UpdateUserPayload {
  user: User
  previousUser: User
  errors: [UserError!]!
  success: Boolean!
}
```

## Subscription Design

```graphql
type Subscription {
  # Subscribe to new posts
  postCreated: Post!

  # Subscribe to specific post updates
  postUpdated(id: ID!): Post!

  # Subscribe to user's notifications
  notificationReceived(userId: ID!): Notification!

  # Subscribe to presence changes
  userPresenceChanged: UserPresence!
}
```

Usage:
```graphql
subscription {
  postCreated {
    id
    title
    author {
      name
    }
  }
}
```

## Error Handling

### Field-Level Errors

```graphql
type Query {
  users: [User!]!
  riskyOperation: Result!
}

union Result = Success | Error

type Success {
  data: String!
}

type Error {
  message: String!
  code: String!
}
```

### Mutation Errors in Payload

```graphql
type CreateUserPayload {
  user: User
  errors: [UserError!]!
  success: Boolean!
}

type UserError {
  message: String!
  field: String  # Which field caused the error
  code: String!  # Error code for client handling
}
```

Example response with errors:
```json
{
  "data": {
    "createUser": {
      "user": null,
      "errors": [
        {
          "message": "Email is already taken",
          "field": "email",
          "code": "DUPLICATE_EMAIL"
        }
      ],
      "success": false
    }
  }
}
```

### GraphQL Errors Array

```json
{
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "userId": "123"
      }
    }
  ],
  "data": {
    "user": null
  }
}
```

## DataLoader Pattern (N+1 Prevention)

Without DataLoader (N+1 problem):
```javascript
// Fetches 1 + N queries
posts.forEach(post => {
  fetchAuthor(post.authorId)  // N queries!
})
```

With DataLoader:
```javascript
// Batches into 1 query
const authorLoader = new DataLoader(async (authorIds) => {
  return await fetchAuthorsByIds(authorIds)  // Single query
})

posts.forEach(post => {
  authorLoader.load(post.authorId)  // Batched
})
```

Implementation:
```javascript
const DataLoader = require('dataloader')

const userLoader = new DataLoader(async (userIds) => {
  const users = await User.findAll({
    where: { id: userIds }
  })

  // Return in same order as requested
  return userIds.map(id =>
    users.find(user => user.id === id)
  )
})

const resolvers = {
  Post: {
    author: (post, args, context) => {
      return context.loaders.user.load(post.authorId)
    }
  }
}
```

## Authorization

### Field-Level Authorization

```graphql
type User {
  id: ID!
  name: String!
  email: String! @auth(requires: VIEWER_IS_OWNER)
  privateNotes: String @auth(requires: ADMIN)
}
```

Resolver implementation:
```javascript
const resolvers = {
  User: {
    email: (user, args, context) => {
      if (context.userId !== user.id && !context.isAdmin) {
        throw new ForbiddenError('Cannot view email')
      }
      return user.email
    }
  }
}
```

### Query-Level Authorization

```javascript
const resolvers = {
  Query: {
    users: (parent, args, context) => {
      if (!context.isAdmin) {
        throw new ForbiddenError('Admin access required')
      }
      return User.findAll()
    }
  }
}
```

## Pagination Strategies

### Cursor-Based (Relay)

```graphql
type Query {
  posts(first: Int, after: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Offset-Based

```graphql
type Query {
  posts(limit: Int!, offset: Int!): PostList!
}

type PostList {
  posts: [Post!]!
  total: Int!
  hasMore: Boolean!
}
```

## Filtering and Sorting

```graphql
input UserFilter {
  name: StringFilter
  email: StringFilter
  status: UserStatus
  createdAt: DateTimeFilter
}

input StringFilter {
  equals: String
  contains: String
  startsWith: String
  endsWith: String
  in: [String!]
}

input DateTimeFilter {
  equals: DateTime
  lt: DateTime
  lte: DateTime
  gt: DateTime
  gte: DateTime
  between: DateTimeRange
}

input DateTimeRange {
  start: DateTime!
  end: DateTime!
}

enum UserSortField {
  NAME
  EMAIL
  CREATED_AT
}

type Query {
  users(
    filter: UserFilter
    sortBy: UserSortField
    sortOrder: SortOrder
    first: Int
    after: String
  ): UserConnection!
}
```

Usage:
```graphql
query {
  users(
    filter: {
      name: { contains: "john" }
      status: ACTIVE
      createdAt: { gte: "2024-01-01" }
    }
    sortBy: CREATED_AT
    sortOrder: DESC
    first: 10
  ) {
    edges {
      node {
        id
        name
      }
    }
  }
}
```

## Batching and Caching

### Automatic Persisted Queries (APQ)

Client sends query hash:
```json
{
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "abc123..."
    }
  }
}
```

Server responds with cached result or requests full query.

### Query Complexity Analysis

```javascript
const complexityLimit = 1000

const complexity = {
  Query: {
    users: { complexity: 10 }
  },
  User: {
    posts: { complexity: 10, multipliers: ['first'] }
  }
}

// Query cost: 10 + (10 * 10) = 110
query {
  users {        # 10
    posts(first: 10) {  # 10 * 10
      title
    }
  }
}
```

Reject queries exceeding limit.

## Schema Documentation

```graphql
"""
Represents a user in the system.
Users can create posts and follow other users.
"""
type User implements Node {
  "Unique identifier"
  id: ID!

  "User's display name"
  name: String!

  """
  User's email address.
  Only visible to the user themselves and admins.
  """
  email: String!

  "Short biography"
  bio: String

  "Posts created by this user"
  posts(
    "Number of posts to return"
    first: Int
    "Cursor for pagination"
    after: String
  ): PostConnection!
}
```

## Performance Best Practices

1. **Use DataLoader** to batch and cache database queries
2. **Implement query complexity analysis** to prevent expensive queries
3. **Add query depth limiting** to prevent deeply nested queries
4. **Use persisted queries** in production for caching
5. **Implement field-level caching** for expensive computations
6. **Monitor resolver execution time** and optimize slow resolvers
7. **Use database indexes** on frequently queried fields
8. **Implement pagination** for all list fields
9. **Lazy load nested fields** - don't fetch unless requested
10. **Use subscription filtering** to reduce unnecessary updates

## Security Best Practices

1. **Implement authentication** for protected operations
2. **Add authorization checks** at field and query level
3. **Validate all inputs** using input types
4. **Sanitize user input** to prevent injection attacks
5. **Disable introspection** in production
6. **Rate limit by query complexity** not just request count
7. **Log and monitor** suspicious query patterns
8. **Use HTTPS only**
9. **Implement CSRF protection** for mutations
10. **Set appropriate CORS policies**

## Testing Strategies

### Unit Test Resolvers

```javascript
describe('User resolver', () => {
  it('returns user by id', async () => {
    const result = await resolvers.Query.user(
      null,
      { id: '123' },
      { userId: '123', loaders: mockLoaders }
    )
    expect(result.id).toBe('123')
  })
})
```

### Integration Test Schema

```javascript
const { createTestClient } = require('apollo-server-testing')

const { query } = createTestClient(server)

it('fetches user with posts', async () => {
  const result = await query({
    query: gql`
      query {
        user(id: "123") {
          name
          posts {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    `
  })

  expect(result.data.user.name).toBe('John Doe')
})
```

## GraphQL vs REST Decision Matrix

| Factor | GraphQL | REST |
|--------|---------|------|
| Client flexibility | Excellent | Limited |
| Multiple resources | Single request | Multiple requests |
| Over-fetching | Eliminated | Common |
| Under-fetching | Eliminated | Common |
| Caching | Complex | Simple (HTTP) |
| Learning curve | Steep | Gentle |
| Tooling | Excellent | Mature |
| Real-time | Built-in (subscriptions) | Requires additional setup |
| File uploads | Complex | Simple |

Use GraphQL when:
- Building client-driven applications
- Need flexible data fetching
- Have complex, nested data relationships
- Want real-time features

Use REST when:
- Building simple CRUD APIs
- Need HTTP caching
- Have straightforward data model
- Team unfamiliar with GraphQL
