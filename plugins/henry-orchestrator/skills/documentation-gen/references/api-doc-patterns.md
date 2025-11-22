# API Documentation Patterns

Detailed patterns and conventions for generating API documentation.

## General Structure

````markdown
# Module/Package Name

Brief description of the module.

## Table of Contents

- [Classes](#classes)
- [Functions](#functions)
- [Constants](#constants)
- [Types](#types)

## Classes

### ClassName

Description of the class and its purpose.

#### Constructor

##### `new ClassName(param1, param2)`

**Parameters:**

- `param1` (Type): Description
- `param2` (Type): Description

**Example:**

```language
const instance = new ClassName('value', 42);
```
````

#### Methods

##### `methodName(param1)`

Description of what the method does.

**Parameters:**

- `param1` (Type): Description

**Returns:** `ReturnType` - Description

**Throws:**

- `ErrorType` - When this error occurs

**Example:**

```language
instance.methodName('input');
```

#### Properties

##### `propertyName`

**Type:** `PropertyType`

**Description:** What this property represents

## Functions

### functionName(param1, param2)

Description of the function.

**Parameters:**

- `param1` (Type): Description
- `param2` (Type, optional): Description. Default: `defaultValue`

**Returns:** `ReturnType` - Description

**Example:**

```language
const result = functionName('value', 42);
```

````

## Language-Specific Patterns

### JavaScript/TypeScript

```markdown
## Functions

### fetchData(url, options?)

Fetches data from a URL with optional configuration.

**Parameters:**
- `url` (string): The URL to fetch from
- `options` (RequestOptions, optional): Configuration options
  - `method` (string): HTTP method. Default: 'GET'
  - `headers` (Object): Request headers
  - `timeout` (number): Request timeout in ms. Default: 5000

**Returns:** `Promise<Response>` - The fetch response

**Throws:**
- `NetworkError` - When network request fails
- `TimeoutError` - When request exceeds timeout

**Example:**
```javascript
const response = await fetchData('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});
````

**Since:** v1.2.0

**See also:**

- [Response](#response)
- [RequestOptions](#requestoptions)

````

### Python

```markdown
## Functions

### fetch_data(url, method='GET', timeout=5.0)

Fetch data from a URL.

**Parameters:**
- `url` (str): The URL to fetch from
- `method` (str, optional): HTTP method. Default: 'GET'
- `timeout` (float, optional): Request timeout in seconds. Default: 5.0

**Returns:**
- `dict`: Parsed JSON response

**Raises:**
- `NetworkError`: When network request fails
- `TimeoutError`: When request exceeds timeout
- `ValueError`: When URL is invalid

**Example:**
```python
response = fetch_data('https://api.example.com/data', method='POST', timeout=10.0)
print(response['data'])
````

**Note:** This function requires the `requests` library.

**Since:** v1.2.0

**See Also:**

- [Response](#response)
- [RequestOptions](#requestoptions)

````

### Go

```markdown
## Functions

### FetchData

```go
func FetchData(url string, options *RequestOptions) (*Response, error)
````

FetchData fetches data from a URL with optional configuration.

**Parameters:**

- `url` (string): The URL to fetch from
- `options` (\*RequestOptions): Configuration options (can be nil)

**Returns:**

- `*Response`: The fetch response
- `error`: Error if request fails

**Example:**

```go
response, err := FetchData("https://api.example.com/data", &RequestOptions{
    Method: "POST",
    Timeout: 10 * time.Second,
})
if err != nil {
    log.Fatal(err)
}
```

**Since:** v1.2.0

````

### Rust

```markdown
## Functions

### fetch_data

```rust
pub fn fetch_data(url: &str, options: Option<RequestOptions>) -> Result<Response, Error>
````

Fetches data from a URL with optional configuration.

**Parameters:**

- `url`: The URL to fetch from
- `options`: Optional configuration

**Returns:**

- `Ok(Response)`: The fetch response on success
- `Err(Error)`: Error if request fails

**Errors:**

Returns `Error` in the following cases:

- `Error::Network`: When network request fails
- `Error::Timeout`: When request exceeds timeout
- `Error::InvalidUrl`: When URL is malformed

**Example:**

```rust
let response = fetch_data("https://api.example.com/data", Some(RequestOptions {
    method: Method::POST,
    timeout: Duration::from_secs(10),
}))?;
```

**Since:** v1.2.0

````

## Documentation Sections

### Required Sections

1. **Description**: Clear explanation of what the function/class does
2. **Parameters**: All parameters with types and descriptions
3. **Returns**: Return type and description
4. **Example**: At least one working code example

### Optional Sections

1. **Throws/Raises/Errors**: Exceptions or error conditions
2. **Since**: Version when added
3. **Deprecated**: If deprecated, explain and provide alternative
4. **See Also**: Related functions/classes
5. **Note/Warning**: Important caveats or gotchas
6. **Performance**: Performance characteristics if relevant
7. **Security**: Security considerations if applicable

## Parameter Documentation

### Simple Parameters

```markdown
**Parameters:**
- `name` (string): User's full name
- `age` (number): User's age in years
- `active` (boolean): Whether user is active
````

### Optional Parameters

```markdown
**Parameters:**

- `name` (string): User's full name
- `age` (number, optional): User's age. Default: 0
- `options` (Object, optional): Configuration options
```

### Complex Parameters (Objects)

```markdown
**Parameters:**

- `options` (Object): Configuration options
  - `name` (string): User's name
  - `age` (number, optional): User's age. Default: 0
  - `address` (Object): User's address
    - `street` (string): Street address
    - `city` (string): City name
    - `zip` (string): ZIP code
```

### Array Parameters

```markdown
**Parameters:**

- `items` (Array<string>): List of item names
- `users` (Array<User>): List of user objects
  - Each `User` has:
    - `id` (number): User ID
    - `name` (string): User name
```

### Function Parameters

```markdown
**Parameters:**

- `callback` (Function): Callback function
  - Parameters:
    - `error` (Error|null): Error object or null
    - `result` (any): Result value
  - Returns: void
```

### Union Types (TypeScript)

```markdown
**Parameters:**

- `value` (string | number): Input value
- `mode` ('read' | 'write' | 'append'): File mode
```

## Return Value Documentation

### Simple Returns

```markdown
**Returns:** `string` - The formatted name
```

### Complex Returns

```markdown
**Returns:** `Object` - User data object

- `id` (number): User ID
- `name` (string): User name
- `email` (string): User email
```

### Multiple Return Types

```markdown
**Returns:** `User | null` - User object if found, null otherwise
```

### Promise Returns

```markdown
**Returns:** `Promise<User>` - Resolves with user object
```

## Example Documentation

### Minimal Example

```javascript
// Simplest usage
const result = functionName('input');
```

### Complete Example

```javascript
// Complete example with error handling
try {
  const result = await fetchData('https://api.example.com/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    },
    timeout: 10000,
  });

  console.log('Success:', result);
} catch (error) {
  console.error('Failed:', error.message);
}
```

### Multiple Examples

```javascript
// Basic usage
const user = new User('John Doe');

// With options
const user = new User('John Doe', {
  age: 30,
  email: 'john@example.com',
});

// Advanced usage
const user = new User('John Doe', {
  age: 30,
  email: 'john@example.com',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    zip: '12345',
  },
});
```

## Class Documentation

### Full Class Example

````markdown
## User

Represents a user in the system.

### Constructor

#### new User(name, options?)

Creates a new User instance.

**Parameters:**

- `name` (string): User's full name
- `options` (Object, optional): Additional options
  - `age` (number): User's age
  - `email` (string): User's email

**Example:**

```javascript
const user = new User('John Doe', { age: 30, email: 'john@example.com' });
```
````

### Properties

#### id

**Type:** `number` (read-only)

The unique identifier for this user.

#### name

**Type:** `string`

The user's full name.

### Methods

#### save()

Saves the user to the database.

**Returns:** `Promise<void>` - Resolves when save is complete

**Throws:**

- `ValidationError` - When user data is invalid
- `DatabaseError` - When database operation fails

**Example:**

```javascript
await user.save();
```

#### toJSON()

Converts the user to a JSON-serializable object.

**Returns:** `Object` - Plain object representation

**Example:**

```javascript
const json = user.toJSON();
console.log(JSON.stringify(json));
```

### Static Methods

#### User.findById(id)

Finds a user by ID.

**Parameters:**

- `id` (number): User ID to search for

**Returns:** `Promise<User | null>` - User if found, null otherwise

**Example:**

```javascript
const user = await User.findById(123);
```

````

## Type/Interface Documentation

### TypeScript Interfaces

```markdown
## Interfaces

### RequestOptions

Configuration options for HTTP requests.

```typescript
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  body?: any;
}
````

**Properties:**

- `method` (string, optional): HTTP method. Default: 'GET'
- `headers` (Object, optional): Request headers
- `timeout` (number, optional): Timeout in milliseconds. Default: 5000
- `body` (any, optional): Request body

**Example:**

```typescript
const options: RequestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  body: { name: 'John' },
};
```

````

## Constants and Enums

```markdown
## Constants

### MAX_RETRY_ATTEMPTS

**Type:** `number`

**Value:** `3`

Maximum number of retry attempts for failed requests.

### DEFAULT_TIMEOUT

**Type:** `number`

**Value:** `5000`

Default request timeout in milliseconds.

## Enums

### HttpMethod

Available HTTP methods.

**Values:**
- `GET`: Retrieve resource
- `POST`: Create resource
- `PUT`: Update resource
- `DELETE`: Delete resource

**Example:**
```javascript
import { HttpMethod } from 'package';

const method = HttpMethod.POST;
````

````

## Deprecation Documentation

```markdown
### oldFunction(param) **[DEPRECATED]**

**Deprecated:** Since v2.0.0. Use [newFunction](#newfunction) instead.

This function is deprecated and will be removed in v3.0.0.

**Migration:**
```javascript
// Old way
oldFunction('input');

// New way
newFunction('input');
````

```

## Organization Strategies

### By Module

```

# Package Name

## Module: auth

### Functions

### Classes

## Module: database

### Functions

### Classes

```

### By Type

```

# Package Name

## Classes

### ClassName1

### ClassName2

## Functions

### functionName1

### functionName2

```

### Alphabetical

Useful for large APIs:
```

# Package Name

## A

- authenticate()
- authorize()

## B

- buildQuery()

```

## Best Practices

1. **Be consistent**: Use the same format throughout
2. **Show types**: Always include parameter and return types
3. **Provide examples**: Every public API should have an example
4. **Document errors**: List all possible errors/exceptions
5. **Link related items**: Cross-reference related functions/classes
6. **Keep it updated**: Update docs when code changes
7. **Test examples**: Ensure all code examples actually work
8. **Use tables**: For many similar parameters or options
9. **Explain why**: Not just what, but why use this API
10. **Consider audience**: Match detail level to users' expertise

## Documentation Quality Checklist

- [ ] All public APIs documented
- [ ] All parameters have types and descriptions
- [ ] Return values documented with types
- [ ] At least one working example per API
- [ ] Errors/exceptions documented
- [ ] Links to related APIs included
- [ ] Deprecated APIs marked with alternatives
- [ ] Code examples tested and working
- [ ] Version information included (Since:)
- [ ] Consistent formatting throughout
```
