# api-client

[![npm version](https://img.shields.io/npm/v/@company/api-client)](https://www.npmjs.com/package/@company/api-client)
[![Build Status](https://img.shields.io/github/workflow/status/company/api-client/CI)](https://github.com/company/api-client/actions)
[![Coverage](https://img.shields.io/codecov/c/github/company/api-client)](https://codecov.io/gh/company/api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, type-safe HTTP client for Node.js and browsers with automatic retries, request/response interceptors, and built-in TypeScript support.

## Features

- 🚀 Modern async/await API
- 📘 Full TypeScript support with type inference
- 🔄 Automatic retries with exponential backoff
- 🎯 Request and response interceptors
- 💾 Built-in caching support
- 🔐 Authentication helpers (OAuth2, JWT, API keys)
- 🌐 Works in Node.js and browsers
- 🧪 Comprehensive test coverage

## Installation

```bash
npm install @company/api-client
```

Or with yarn:

```bash
yarn add @company/api-client
```

## Quick Start

```javascript
import { ApiClient } from '@company/api-client';

// Create client
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

// Make requests
const user = await client.get('/users/123');
const newPost = await client.post('/posts', {
  title: 'Hello World',
  body: 'This is my first post'
});
```

## Usage

### Creating a Client

```javascript
import { ApiClient } from '@company/api-client';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-API-Key': 'your-api-key'
  }
});
```

### Making Requests

```javascript
// GET request
const users = await client.get('/users');
const user = await client.get('/users/123');

// POST request
const newUser = await client.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await client.put('/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await client.delete('/users/123');

// PATCH request
const patched = await client.patch('/users/123', {
  email: 'newemail@example.com'
});
```

### TypeScript Support

```typescript
import { ApiClient } from '@company/api-client';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

const client = new ApiClient({ baseURL: 'https://api.example.com' });

// Type-safe requests
const user = await client.get<User>('/users/123');
const newUser = await client.post<User, CreateUserRequest>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Request Configuration

```javascript
const response = await client.get('/users', {
  params: { page: 1, limit: 10 },
  headers: { 'X-Custom-Header': 'value' },
  timeout: 5000,
  retry: { attempts: 3, delay: 1000 }
});
```

### Interceptors

Add request interceptors:

```javascript
client.interceptors.request.use((config) => {
  // Add authentication token
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});
```

Add response interceptors:

```javascript
client.interceptors.response.use(
  (response) => {
    // Transform response
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response?.status === 401) {
      // Refresh token or redirect to login
    }
    throw error;
  }
);
```

### Automatic Retries

```javascript
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  retry: {
    attempts: 3,
    delay: 1000,
    statusCodes: [408, 429, 500, 502, 503, 504]
  }
});

// This request will retry up to 3 times on failure
const data = await client.get('/data');
```

### Caching

```javascript
import { ApiClient, MemoryCache } from '@company/api-client';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  cache: new MemoryCache({ ttl: 60000 }) // 60 seconds
});

// First request hits the API
const data1 = await client.get('/users');

// Second request returns cached result
const data2 = await client.get('/users');
```

### Authentication

#### API Key Authentication

```javascript
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  auth: {
    type: 'apiKey',
    key: 'your-api-key',
    header: 'X-API-Key'
  }
});
```

#### Bearer Token Authentication

```javascript
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  auth: {
    type: 'bearer',
    token: 'your-jwt-token'
  }
});
```

#### OAuth2

```javascript
import { ApiClient, OAuth2Provider } from '@company/api-client';

const oauth = new OAuth2Provider({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  tokenUrl: 'https://auth.example.com/token'
});

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  auth: oauth
});
```

### Error Handling

```javascript
import { ApiClient, ApiError } from '@company/api-client';

try {
  const data = await client.get('/users/123');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  } else {
    console.error('Network error:', error);
  }
}
```

### File Uploads

```javascript
import FormData from 'form-data';

const formData = new FormData();
formData.append('file', fileBuffer, 'document.pdf');
formData.append('title', 'My Document');

const result = await client.post('/uploads', formData, {
  headers: formData.getHeaders()
});
```

### Streaming Responses

```javascript
const stream = await client.stream('/large-file');

stream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length);
});

stream.on('end', () => {
  console.log('Download complete');
});
```

## API Reference

### ApiClient

Main client class for making HTTP requests.

#### Constructor

```typescript
new ApiClient(config?: ClientConfig)
```

#### Methods

- `get<T>(url, config?)` - Make GET request
- `post<T, D>(url, data?, config?)` - Make POST request
- `put<T, D>(url, data?, config?)` - Make PUT request
- `patch<T, D>(url, data?, config?)` - Make PATCH request
- `delete<T>(url, config?)` - Make DELETE request
- `request<T>(config)` - Make custom request

See [full API documentation](https://api-client.docs.example.com) for details.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseURL` | string | `''` | Base URL for all requests |
| `timeout` | number | `30000` | Request timeout in ms |
| `headers` | object | `{}` | Default headers |
| `retry` | object | - | Retry configuration |
| `cache` | Cache | - | Cache implementation |
| `auth` | Auth | - | Authentication config |

## Examples

See the [examples/](examples/) directory for more:

- [Basic usage](examples/basic.js)
- [TypeScript usage](examples/typescript.ts)
- [Authentication](examples/auth.js)
- [File uploads](examples/uploads.js)
- [Custom interceptors](examples/interceptors.js)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Node.js Support

- Node.js 14.x or higher

## Development

### Setup

```bash
git clone https://github.com/company/api-client.git
cd api-client
npm install
```

### Run tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT © [Company Name](https://example.com)

See [LICENSE](LICENSE) for details.

## Related Projects

- [axios](https://github.com/axios/axios) - Promise based HTTP client
- [got](https://github.com/sindresorhus/got) - Human-friendly HTTP client
- [node-fetch](https://github.com/node-fetch/node-fetch) - Fetch API for Node.js

## Support

- 📖 [Documentation](https://api-client.docs.example.com)
- 🐛 [Issue Tracker](https://github.com/company/api-client/issues)
- 💬 [Discussions](https://github.com/company/api-client/discussions)
- 📧 [Email Support](mailto:support@example.com)
