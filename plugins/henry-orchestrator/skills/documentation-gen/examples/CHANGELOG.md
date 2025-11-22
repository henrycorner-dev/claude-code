# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for GraphQL queries alongside REST endpoints
- Configurable request queue with priority support
- Webhook signature verification helper

### Changed
- Improved error messages with more context and suggestions

## [2.1.0] - 2025-01-20

### Added
- TypeScript generic type inference for request/response types
- Built-in support for Server-Sent Events (SSE)
- `AbortController` support for request cancellation
- New `stream()` method for streaming large responses
- Request deduplication to prevent duplicate concurrent requests
- Support for custom serializers (MessagePack, Protocol Buffers)

### Changed
- Improved retry logic with exponential backoff and jitter
- Enhanced error handling with better error types
- Updated dependencies to latest versions
- Refactored interceptor system for better performance (15% faster)
- Improved TypeScript type definitions for better IDE support

### Fixed
- Fixed memory leak in response cache when using large responses (#234)
- Corrected timeout calculation for retried requests (#245)
- Fixed race condition in OAuth2 token refresh (#256)
- Resolved issue with FormData headers in Node.js 18+ (#267)

### Security
- Updated `axios` to v1.6.0 to fix CVE-2025-1234
- Added automatic sanitization of sensitive headers in error logs

## [2.0.0] - 2025-01-01

### Added
- Complete TypeScript rewrite with full type safety
- Support for request and response interceptors
- Built-in caching with pluggable cache backends
- OAuth2 authentication provider
- Automatic retry mechanism with configurable policies
- Support for request/response transformers
- Browser and Node.js support in a single package

### Changed
- **BREAKING:** Minimum Node.js version is now 14.0.0
- **BREAKING:** Changed default timeout from 30s to 10s
- **BREAKING:** Response data is no longer automatically unwrapped
  ```javascript
  // Before (v1.x)
  const users = await client.get('/users'); // returns data directly

  // After (v2.x)
  const response = await client.get('/users');
  const users = response.data; // explicit data access
  ```
- **BREAKING:** Error response structure changed
  ```javascript
  // Before (v1.x)
  error.status
  error.data

  // After (v2.x)
  error.response.status
  error.response.data
  ```
- Improved performance for large payloads (3x faster)
- Enhanced documentation with more examples

### Deprecated
- `client.request({ method: 'GET' })` syntax - use `client.get()` shorthand instead

### Removed
- **BREAKING:** Removed support for Node.js 10 and 12
- **BREAKING:** Removed deprecated `client.ajax()` method (use `client.request()`)
- Removed legacy callback-based API (use async/await)
- Removed bundled Polyfills (use core-js if needed)

### Fixed
- Fixed incorrect Content-Type header for JSON requests (#180)
- Resolved issue with query parameter encoding (#185)
- Fixed memory leak in long-running applications (#190)

### Security
- Fixed potential XSS vulnerability in error messages (CVE-2024-5678)
- Implemented automatic credential removal from URLs in logs

## [1.5.3] - 2024-12-15

### Fixed
- Fixed critical bug in retry logic causing infinite loops (#175)
- Corrected TypeScript definitions for optional parameters (#178)

### Security
- Updated `node-fetch` to v2.6.7 to address security advisory

## [1.5.2] - 2024-12-10

### Fixed
- Fixed issue with URL encoding of special characters (#170)
- Resolved timeout not being respected for streaming requests (#172)

## [1.5.1] - 2024-12-05

### Changed
- Improved error messages for network failures
- Updated documentation with troubleshooting guide

### Fixed
- Fixed compatibility issue with webpack 5 (#165)
- Corrected type definitions for request config (#168)

## [1.5.0] - 2024-12-01

### Added
- Support for request timeout configuration per-request
- New `validateStatus` option for custom response validation
- Added `maxRedirects` option to control redirect behavior
- Support for custom HTTP agents (proxy, keep-alive)

### Changed
- Improved TypeScript type definitions
- Enhanced error messages with request/response details
- Updated all dependencies to latest versions

### Fixed
- Fixed issue with empty response bodies (#155)
- Resolved problem with query string arrays (#158)
- Corrected Content-Type detection for form data (#160)

## [1.4.0] - 2024-11-15

### Added
- Support for custom headers per request
- Added `onUploadProgress` callback for file uploads
- Added `onDownloadProgress` callback for large downloads
- New helper methods for common HTTP status checks

### Changed
- Optimized JSON parsing for better performance
- Improved error handling for malformed responses

### Fixed
- Fixed bug in query parameter serialization (#145)
- Resolved issue with request body encoding (#148)

## [1.3.0] - 2024-11-01

### Added
- Support for automatic JSON parsing and stringification
- Added request/response logging in debug mode
- New configuration option for base URL

### Changed
- Improved documentation with more examples
- Updated default user agent string

### Fixed
- Fixed issue with concurrent requests sharing state (#135)
- Corrected handling of 204 No Content responses (#138)

## [1.2.0] - 2024-10-15

### Added
- Support for query parameters in GET requests
- Added ability to set default headers
- New error types for better error handling

### Changed
- Improved test coverage to 95%
- Refactored internal request handling

### Fixed
- Fixed memory leak in error handling (#120)
- Resolved issue with binary data uploads (#125)

## [1.1.0] - 2024-10-01

### Added
- Support for PATCH and DELETE methods
- Added request timeout configuration
- New examples for common use cases

### Changed
- Improved error messages
- Updated dependencies

### Fixed
- Fixed bug in POST request body serialization (#110)

## [1.0.1] - 2024-09-20

### Fixed
- Fixed critical bug in authentication header handling (#105)
- Corrected type definitions for TypeScript users (#107)

### Security
- Updated vulnerable dependency `lodash` to v4.17.21

## [1.0.0] - 2024-09-15

Initial stable release.

### Added
- HTTP client with support for GET, POST, PUT methods
- Basic authentication support
- Request and response interceptors
- TypeScript type definitions
- Comprehensive test suite
- Documentation and examples

[unreleased]: https://github.com/company/api-client/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/company/api-client/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/company/api-client/compare/v1.5.3...v2.0.0
[1.5.3]: https://github.com/company/api-client/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/company/api-client/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/company/api-client/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/company/api-client/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/company/api-client/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/company/api-client/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/company/api-client/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/company/api-client/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/company/api-client/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/company/api-client/releases/tag/v1.0.0
