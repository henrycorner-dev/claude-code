---
name: testing-strategy
description: This skill should be used when the user asks to "plan tests", "create testing strategy", "set up unit tests", "add integration tests", "implement E2E tests", "choose testing framework", "select Jest vs Vitest", "improve test coverage", "design test architecture", or mentions testing tools like Jest, Cypress, Vitest, Playwright, or testing pyramid concepts.
version: 0.1.0
---

# Testing Strategy

This skill provides guidance for planning and implementing comprehensive testing strategies, selecting appropriate testing tools, and achieving high test coverage across unit, integration, and end-to-end (E2E) tests.

## Purpose

Develop systematic, maintainable testing strategies that balance coverage, execution speed, and maintenance cost. Guide selection of appropriate testing tools (Jest, Vitest, Cypress, Playwright, Testing Library) based on project requirements, and structure tests following the testing pyramid principle.

## When to Use This Skill

Apply this skill when:

- Starting a new project and need to establish testing infrastructure
- Evaluating or migrating testing frameworks
- Improving test coverage or test quality
- Designing test architecture for specific application layers
- Addressing slow or flaky tests
- Integrating testing into CI/CD pipelines

## Testing Pyramid Principle

Structure tests following the testing pyramid to optimize for speed, cost, and reliability:

```
        /\
       /  \     E2E Tests (Few)
      /----\    - Slow, expensive, brittle
     /      \   - Full user workflows
    /--------\  - Critical paths only
   /          \
  /------------\ Integration Tests (Some)
 /              \ - API contracts, database
/----------------\ - Component integration
\----------------/ - Service boundaries
 \              /
  \------------/ Unit Tests (Many)
   \          /  - Fast, cheap, stable
    \--------/   - Pure functions
     \------/    - Business logic
      \----/     - 70-80% of tests
       \  /
        \/
```

### Distribution Guidelines

**Target ratios:**

- Unit tests: 70-80%
- Integration tests: 15-25%
- E2E tests: 5-10%

**Rationale:**

- Unit tests execute in milliseconds, provide fast feedback
- Integration tests catch interface issues, run in seconds
- E2E tests validate user workflows but are slow and fragile

## Core Testing Strategies

### 1. Unit Testing

**Focus:** Test individual functions, classes, or modules in isolation.

**Characteristics:**

- No external dependencies (databases, APIs, file system)
- Use mocks, stubs, or fakes for dependencies
- Fast execution (milliseconds per test)
- High coverage of edge cases and error paths

**What to test:**

- Pure functions and business logic
- Utility functions and helpers
- Data transformations
- Validation logic
- Error handling

**Example structure:**

```
describe('calculateTotal', () => {
  it('should sum item prices', () => {
    expect(calculateTotal([{price: 10}, {price: 20}])).toBe(30);
  });

  it('should handle empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should apply discount when provided', () => {
    expect(calculateTotal([{price: 100}], 0.1)).toBe(90);
  });
});
```

### 2. Integration Testing

**Focus:** Test interactions between multiple components, modules, or services.

**Characteristics:**

- Test real integrations (databases, APIs, file systems)
- May use test databases or containers
- Slower than unit tests (seconds per test)
- Validate contracts and data flow

**What to test:**

- API endpoints with real request/response
- Database queries and transactions
- External service integrations
- Component composition and data flow
- Authentication and authorization flows

**Example structure:**

```
describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.migrate.latest();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    const user = await db('users').where({ id: response.body.id }).first();
    expect(user.email).toBe('test@example.com');
  });
});
```

### 3. End-to-End (E2E) Testing

**Focus:** Test complete user workflows through the entire application stack.

**Characteristics:**

- Simulate real user interactions in browser
- Test against running application
- Slowest tests (seconds to minutes)
- Focus on critical user paths

**What to test:**

- Critical business workflows (checkout, signup, payment)
- Cross-browser compatibility
- User authentication flows
- Complex multi-step processes
- Visual regression (optional)

**Example structure:**

```
test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.click('button:has-text("Add to Cart")');
  await page.click('a:has-text("Cart")');
  await page.click('button:has-text("Checkout")');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="cardNumber"]', '4242424242424242');
  await page.click('button:has-text("Place Order")');

  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Test Coverage Strategy

### Coverage Metrics

**Line coverage:** Percentage of code lines executed during tests
**Branch coverage:** Percentage of conditional branches tested
**Function coverage:** Percentage of functions called
**Statement coverage:** Percentage of statements executed

### Coverage Targets

**Recommended thresholds:**

- Overall: 80-90%
- Critical paths: 95-100%
- Utility functions: 90-100%
- UI components: 70-80%
- Configuration files: Not required

**Configure in package.json:**

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "src/core/**/*.ts": {
        "branches": 95,
        "functions": 95,
        "lines": 95,
        "statements": 95
      }
    }
  }
}
```

### What NOT to Test

Avoid testing:

- Third-party library internals
- Framework code (React, Vue internals)
- Simple getters/setters without logic
- Auto-generated code
- Trivial constants or configuration

**Focus coverage on business logic and critical paths, not achieving 100% mechanically.**

## Tool Selection Guide

### Decision Framework

Choose testing tools based on:

1. **Project type:** Frontend, backend, full-stack, monorepo
2. **Framework:** React, Vue, Angular, Node.js, etc.
3. **Build tool:** Vite, Webpack, esbuild, etc.
4. **Performance needs:** Speed of test execution
5. **Team familiarity:** Learning curve and adoption

### Quick Selection Matrix

| Need                   | Recommended Tool             | Alternative        |
| ---------------------- | ---------------------------- | ------------------ |
| React/Vue unit tests   | Vitest + Testing Library     | Jest               |
| Node.js/backend tests  | Vitest or Jest               | -                  |
| E2E browser tests      | Playwright                   | Cypress            |
| Component visual tests | Storybook + Chromatic        | Percy              |
| API integration tests  | Supertest (with Jest/Vitest) | -                  |
| Vite-based projects    | Vitest                       | Jest (slower)      |
| Legacy/large projects  | Jest                         | Vitest (migration) |

### When to Choose Vitest

**Choose Vitest when:**

- Using Vite as build tool (instant compatibility)
- Starting new project (modern, fast)
- Need fast test execution (native ESM, instant HMR)
- Want Jest-compatible API with better performance
- Working with TypeScript (better type support)

**Advantages:**

- 10-20x faster than Jest on large codebases
- Native ESM support
- Vite config reuse
- Built-in TypeScript support
- Jest-compatible API (easy migration)

### When to Choose Jest

**Choose Jest when:**

- Existing project already uses Jest
- Large ecosystem dependency (many plugins)
- Need maximum stability (mature, battle-tested)
- Not using Vite
- Team has deep Jest expertise

**Advantages:**

- Largest ecosystem and community
- Most mature and stable
- Extensive documentation
- Wide industry adoption

### When to Choose Cypress

**Choose Cypress when:**

- Need excellent developer experience
- Want visual test runner
- Time-travel debugging is valuable
- Testing complex SPAs
- Team prefers Cypress API

**Advantages:**

- Superior DX and debugging
- Real-time test execution view
- Automatic waiting and retries
- Great documentation

### When to Choose Playwright

**Choose Playwright when:**

- Need true multi-browser testing (Chromium, Firefox, WebKit)
- Require better performance than Cypress
- Need API testing capabilities
- Want parallel execution out-of-box
- Testing involves multiple tabs/contexts

**Advantages:**

- True cross-browser support
- Faster execution (especially parallel)
- Better mobile emulation
- Built-in API testing
- Auto-wait and retry built-in

**See `references/tools-comparison.md` for detailed tool comparisons and migration guides.**

## Test Organization

### File Structure

**Co-located tests (recommended for components):**

```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
      Button.stories.tsx
```

**Separate test directory (recommended for integration/E2E):**

```
src/
  utils/
    validation.ts
tests/
  unit/
    utils/
      validation.test.ts
  integration/
    api/
      users.test.ts
  e2e/
    checkout.spec.ts
```

### Naming Conventions

- Unit tests: `*.test.ts` or `*.spec.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.ts` or `*.spec.ts` (in e2e folder)
- Test utilities: `test-utils.ts`, `setup.ts`

## Test Writing Best Practices

### Follow AAA Pattern

**Arrange-Act-Assert:**

```typescript
test('user registration sends welcome email', async () => {
  // Arrange
  const userData = { email: 'user@test.com', name: 'Test User' };
  const mockEmailService = jest.fn();

  // Act
  await registerUser(userData, mockEmailService);

  // Assert
  expect(mockEmailService).toHaveBeenCalledWith({
    to: 'user@test.com',
    subject: 'Welcome!',
    body: expect.stringContaining('Test User'),
  });
});
```

### Write Descriptive Test Names

**Good:**

```typescript
test('throws ValidationError when email is missing');
test('returns 401 when token is expired');
test('calculates discount correctly for premium members');
```

**Bad:**

```typescript
test('test email');
test('error case');
test('calculation');
```

### One Assertion Concept per Test

**Prefer:**

```typescript
test('creates user with hashed password', () => {
  const user = createUser({ password: 'secret123' });
  expect(user.password).not.toBe('secret123');
});

test('creates user with email in lowercase', () => {
  const user = createUser({ email: 'USER@TEST.COM' });
  expect(user.email).toBe('user@test.com');
});
```

**Over:**

```typescript
test('creates user correctly', () => {
  const user = createUser({ email: 'USER@TEST.COM', password: 'secret123' });
  expect(user.password).not.toBe('secret123');
  expect(user.email).toBe('user@test.com');
  expect(user.createdAt).toBeInstanceOf(Date);
  // ... many more assertions
});
```

### Avoid Test Interdependence

Each test should run independently. Never rely on execution order or shared state between tests.

**Use setup/teardown:**

```typescript
describe('UserService', () => {
  let userService: UserService;
  let testDb: Database;

  beforeEach(async () => {
    testDb = await createTestDatabase();
    userService = new UserService(testDb);
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  // Each test starts with clean state
});
```

## CI/CD Integration

### Parallel Execution

Configure tests to run in parallel for faster CI:

**Jest/Vitest:**

```json
{
  "scripts": {
    "test": "vitest run --reporter=verbose",
    "test:ci": "vitest run --reporter=junit --coverage"
  }
}
```

**Playwright:**

```typescript
// playwright.config.ts
export default {
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 0,
};
```

### Coverage Reporting

Integrate coverage reporting in CI:

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### Performance Optimization

**Strategies for faster CI:**

- Cache node_modules and test artifacts
- Run unit tests before slower integration/E2E tests
- Parallelize test execution
- Split E2E tests across multiple CI jobs
- Use test sharding for large suites

## Common Pitfalls

### 1. Testing Implementation Details

**Avoid:**

```typescript
// Testing internal state
expect(component.state.isLoading).toBe(false);
expect(component.internalMethod).toHaveBeenCalled();
```

**Prefer:**

```typescript
// Testing behavior
expect(screen.getByText('Data loaded')).toBeInTheDocument();
expect(mockApi.fetchData).toHaveBeenCalled();
```

### 2. Flaky Tests

**Causes:**

- Race conditions and timing issues
- Shared state between tests
- External dependencies (network, time)
- Non-deterministic behavior

**Solutions:**

- Use proper wait utilities (waitFor, findBy)
- Mock time and random values
- Isolate test state
- Add retry logic for E2E tests only

### 3. Over-Mocking

**Avoid:**

```typescript
// Mocking everything defeats the purpose
jest.mock('./database');
jest.mock('./validation');
jest.mock('./emailService');
jest.mock('./logger');
// What are you actually testing?
```

**Prefer:**

- Mock only external boundaries (APIs, databases)
- Use real implementations for internal modules
- Consider using fakes over mocks when possible

## Additional Resources

### Reference Files

For detailed tool comparisons, migration guides, and advanced patterns:

- **`references/tools-comparison.md`** - Comprehensive comparison of Jest, Vitest, Cypress, Playwright with migration guides and performance benchmarks

### Examples

Working test configurations and examples in `examples/`:

- **`jest.config.js`** - Complete Jest configuration
- **`vitest.config.ts`** - Vitest configuration with TypeScript
- **`playwright.config.ts`** - Playwright E2E configuration
- **`sample-tests/`** - Example tests for unit, integration, and E2E

## Implementation Workflow

When implementing a testing strategy:

1. **Assess project needs:** Framework, project type, existing tests
2. **Select tools:** Use Quick Selection Matrix above
3. **Set up testing infrastructure:** Install tools, configure runners
4. **Establish test structure:** Organize files, naming conventions
5. **Configure coverage thresholds:** Set appropriate targets
6. **Implement tests by layer:**
   - Start with unit tests for business logic
   - Add integration tests for APIs/database
   - Implement E2E for critical paths
7. **Integrate with CI/CD:** Automate test execution, coverage reporting
8. **Monitor and improve:** Track coverage, fix flaky tests, optimize performance

Focus on maintainable tests that provide confidence without slowing development velocity.
