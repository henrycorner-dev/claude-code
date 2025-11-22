# Testing Tools Detailed Comparison

This reference provides comprehensive comparisons of popular testing tools, including performance benchmarks, feature matrices, migration guides, and decision trees.

## Unit Testing Frameworks

### Jest vs Vitest

#### Feature Comparison

| Feature                | Jest                           | Vitest                              |
| ---------------------- | ------------------------------ | ----------------------------------- |
| **Speed**              | Moderate (transforms all code) | Fast (native ESM, Vite integration) |
| **Configuration**      | Separate config required       | Reuses Vite config                  |
| **ESM Support**        | Partial (experimental)         | Native                              |
| **TypeScript**         | Requires ts-jest               | Built-in                            |
| **Watch Mode**         | Good                           | Excellent (HMR-based)               |
| **Snapshot Testing**   | Yes                            | Yes (compatible format)             |
| **Coverage**           | Istanbul                       | c8 (V8 coverage)                    |
| **Mocking**            | Full API                       | Jest-compatible API                 |
| **Parallel Execution** | Yes (worker threads)           | Yes (worker threads)                |
| **Browser Mode**       | No                             | Yes (experimental)                  |
| **Maturity**           | Very mature (2014)             | Newer (2021)                        |
| **Ecosystem**          | Largest                        | Growing rapidly                     |
| **API Compatibility**  | Jest API                       | Jest-compatible                     |

#### Performance Benchmarks

**Test execution time comparison (1000 test files):**

```
Jest (with babel-jest):       ~45 seconds
Jest (with swc):              ~28 seconds
Vitest (cold start):          ~12 seconds
Vitest (watch mode):          ~0.3 seconds (HMR)
```

**Key performance factors:**

**Jest:**

- Transforms code through Babel/SWC before execution
- Spawns worker processes for parallelization
- Slower watch mode (re-runs affected tests)
- Heavier memory footprint

**Vitest:**

- Native ESM execution (no transformation needed with Vite)
- Instant Hot Module Replacement in watch mode
- Lighter memory usage
- Faster cold starts

#### When to Choose Jest

**Choose Jest if:**

- Existing large codebase with extensive Jest tests
- Need maximum ecosystem compatibility (plugins, matchers)
- Team has deep Jest expertise
- Using Create React App (default)
- Not using Vite as build tool
- Require battle-tested stability for critical projects

**Migration from Jasmine/Mocha to Jest:**

```javascript
// Before (Mocha + Chai)
const { expect } = require('chai');
describe('math', () => {
  it('should add', () => {
    expect(add(1, 2)).to.equal(3);
  });
});

// After (Jest)
describe('math', () => {
  it('should add', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

#### When to Choose Vitest

**Choose Vitest if:**

- Using Vite as build tool (seamless integration)
- Starting new project
- Need fast test execution and watch mode
- Want modern ESM-first approach
- Working with TypeScript (better DX)
- Value developer experience and speed

**Migration from Jest to Vitest:**

**1. Install Vitest:**

```bash
npm install -D vitest @vitest/ui
```

**2. Update package.json:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**3. Create vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Use global test APIs (describe, it, expect)
    environment: 'jsdom', // For DOM testing
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**4. Update imports (if not using globals):**

```typescript
// Before (Jest globals)
describe('test', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});

// After (explicit imports, if globals: false)
import { describe, it, expect } from 'vitest';

describe('test', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
```

**5. Common API changes:**

Most Jest APIs work in Vitest, but some differences:

```typescript
// Timer mocks
// Jest
jest.useFakeTimers();
jest.advanceTimersByTime(1000);

// Vitest
vi.useFakeTimers();
vi.advanceTimersByTime(1000);

// Module mocks
// Jest
jest.mock('./module');

// Vitest
vi.mock('./module');

// Spy
// Jest
jest.spyOn(obj, 'method');

// Vitest
vi.spyOn(obj, 'method');
```

**6. Coverage configuration:**

```bash
# Install c8 for coverage
npm install -D @vitest/coverage-c8
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```

#### Vitest Advantages in Detail

**1. Instant watch mode:**

```bash
# Start watch mode
vitest

# Only changed files re-run instantly via HMR
# No need to restart or transform entire codebase
```

**2. Vite config reuse:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // ... other Vite config
});

// Tests automatically use the same config
// No need to duplicate alias, plugins, etc. in test config
```

**3. Native TypeScript:**

```typescript
// No ts-jest needed, works out of the box
import type { User } from './types';

describe('user validation', () => {
  it('validates user type', () => {
    const user: User = { id: 1, name: 'Test' };
    expect(validateUser(user)).toBe(true);
  });
});
```

**4. UI mode:**

```bash
vitest --ui
# Opens browser with interactive test UI
# View test results, coverage, file relationships graphically
```

## E2E Testing Frameworks

### Cypress vs Playwright

#### Feature Comparison

| Feature                    | Cypress                                   | Playwright                       |
| -------------------------- | ----------------------------------------- | -------------------------------- |
| **Browser Support**        | Chromium, Firefox, Edge, WebKit (limited) | Chromium, Firefox, WebKit (full) |
| **Mobile Testing**         | Viewport emulation only                   | Full device emulation            |
| **Multi-tab Support**      | Limited                                   | Full support                     |
| **Network Interception**   | Excellent                                 | Excellent                        |
| **Auto-waiting**           | Yes                                       | Yes                              |
| **Parallel Execution**     | Paid (Dashboard)                          | Built-in free                    |
| **API Testing**            | Limited                                   | First-class                      |
| **Video Recording**        | Yes                                       | Yes                              |
| **Time Travel Debugging**  | Yes                                       | No (but has trace viewer)        |
| **Developer Experience**   | Excellent                                 | Very good                        |
| **Learning Curve**         | Gentle                                    | Moderate                         |
| **Speed**                  | Good                                      | Faster                           |
| **Mobile Browser Testing** | No                                        | Yes (real Safari)                |
| **Multiple Contexts**      | No                                        | Yes                              |
| **CDP Support**            | Limited                                   | Full                             |

#### Performance Benchmarks

**Test suite execution time (100 E2E tests):**

```
Cypress (serial):              ~15 minutes
Cypress (parallel, 4 workers): ~4 minutes (Dashboard required)
Playwright (serial):           ~8 minutes
Playwright (parallel, 4 workers): ~2 minutes (free)
```

**Key factors:**

- Playwright has faster test execution per test
- Playwright's built-in parallelization is significant advantage
- Cypress has overhead from proxy architecture
- Playwright supports true multi-browser testing

#### When to Choose Cypress

**Choose Cypress if:**

- Prioritize developer experience and debugging
- Team prefers Cypress API style
- Need visual test runner for development
- Time-travel debugging is highly valuable
- Testing primarily Chromium-based browsers
- Want simpler async handling (commands auto-queue)

**Cypress strengths:**

**1. Superior DX:**

```javascript
// Automatic waiting, retry, chaining
cy.visit('/login');
cy.get('[data-testid="email"]').type('user@test.com');
cy.get('[data-testid="password"]').type('password123');
cy.get('button[type="submit"]').click();

// Automatically waits for elements, retries on failure
cy.contains('Welcome back').should('be.visible');
```

**2. Time-travel debugging:**

- Hover over commands to see DOM snapshots
- See exactly what happened at each step
- Inspect network requests inline
- Visual command log

**3. Real-time reloads:**

- Tests auto-reload on file changes
- See tests run in real browser
- Inspect with DevTools mid-test

#### When to Choose Playwright

**Choose Playwright if:**

- Need true cross-browser testing (including Safari)
- Require better performance and speed
- Want built-in parallel execution
- Need to test multiple tabs/contexts/domains
- API testing is important
- Testing complex PWAs or mobile apps
- Need better mobile emulation

**Playwright strengths:**

**1. True multi-browser:**

```typescript
import { chromium, firefox, webkit } from '@playwright/test';

test.describe('cross-browser', () => {
  test('works in all browsers', async () => {
    for (const browserType of [chromium, firefox, webkit]) {
      const browser = await browserType.launch();
      const page = await browser.newPage();
      // Test runs in Chromium, Firefox, AND Safari WebKit
      await browser.close();
    }
  });
});
```

**2. Built-in parallelization:**

```typescript
// playwright.config.ts
export default {
  workers: 4, // Run 4 tests in parallel (free)
  retries: 2, // Retry flaky tests
};

// Automatic sharding across CI machines
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

**3. Multiple contexts/tabs:**

```typescript
test('handles multiple tabs', async ({ browser }) => {
  const context = await browser.newContext();
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  await page1.goto('/page1');
  await page2.goto('/page2');

  // Interact with both tabs simultaneously
  await page1.click('button');
  await page2.fill('input', 'data');
});
```

**4. API testing:**

```typescript
import { test, expect } from '@playwright/test';

test('API test', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Test User', email: 'test@example.com' },
  });

  expect(response.ok()).toBeTruthy();
  const user = await response.json();
  expect(user.id).toBeDefined();
});
```

**5. Mobile emulation:**

```typescript
import { devices } from '@playwright/test';

test.use({
  ...devices['iPhone 13 Pro'],
});

test('mobile test', async ({ page }) => {
  // Runs with exact iPhone 13 Pro viewport, user agent, touch events
  await page.goto('/');
});
```

#### Migration from Cypress to Playwright

**1. Install Playwright:**

```bash
npm install -D @playwright/test
npx playwright install
```

**2. Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**3. API mapping:**

| Cypress                   | Playwright                            |
| ------------------------- | ------------------------------------- |
| `cy.visit(url)`           | `await page.goto(url)`                |
| `cy.get(selector)`        | `page.locator(selector)`              |
| `cy.contains(text)`       | `page.getByText(text)`                |
| `cy.click()`              | `await locator.click()`               |
| `cy.type(text)`           | `await locator.fill(text)`            |
| `cy.should('be.visible')` | `await expect(locator).toBeVisible()` |
| `cy.wait(alias)`          | `await page.waitForResponse(url)`     |
| `cy.intercept()`          | `await page.route(url, handler)`      |
| `cy.fixture()`            | `JSON.parse(await fs.readFile())`     |

**4. Example conversion:**

```javascript
// Cypress
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid="email"]').type('user@test.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.intercept('POST', '/api/login', { statusCode: 401 }).as('loginRequest');
    cy.get('[data-testid="email"]').type('user@test.com');
    cy.get('[data-testid="password"]').type('wrong');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

```typescript
// Playwright
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully', async ({ page }) => {
    await page.getByTestId('email').fill('user@test.com');
    await page.getByTestId('password').fill('password123');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.route('**/api/login', route => route.fulfill({ status: 401 }));
    await page.getByTestId('email').fill('user@test.com');
    await page.getByTestId('password').fill('wrong');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
```

## React Component Testing

### React Testing Library vs Enzyme

**Recommendation: Use React Testing Library**

Enzyme is in maintenance mode and doesn't support React 18+. React Testing Library is the standard.

#### React Testing Library Philosophy

**Test behavior, not implementation:**

```typescript
// Bad: Testing implementation details
const wrapper = shallow(<Counter />);
expect(wrapper.state('count')).toBe(0);
wrapper.instance().increment();

// Good: Testing behavior
render(<Counter />);
expect(screen.getByText('Count: 0')).toBeInTheDocument();
userEvent.click(screen.getByRole('button', { name: 'Increment' }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

#### Best Practices

**1. Query by accessibility:**

```typescript
// Prefer
screen.getByRole('button', { name: 'Submit' });
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter email');

// Avoid
screen.getByTestId('submit-btn');
screen.getByClassName('email-input');
```

**2. User-centric assertions:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('user can submit form', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<Form onSubmit={onSubmit} />);

  // Interact like a real user
  await user.type(screen.getByLabelText('Email'), 'user@test.com');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  // Assert on user-visible outcomes
  expect(onSubmit).toHaveBeenCalledWith({ email: 'user@test.com' });
});
```

**3. Async utilities:**

```typescript
// Wait for element to appear
await screen.findByText('Data loaded');

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

// Wait for custom condition
await waitFor(() => {
  expect(mockApi.fetchData).toHaveBeenCalled();
});
```

## API Testing Tools

### Supertest (Integration Testing)

For testing REST APIs in Node.js applications:

```typescript
import request from 'supertest';
import app from '../app';

describe('POST /api/users', () => {
  it('should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: 'Test',
      email: 'test@example.com',
    });
  });

  it('should validate email format', async () => {
    await request(app).post('/api/users').send({ name: 'Test', email: 'invalid' }).expect(400);
  });
});
```

### MSW (Mock Service Worker)

For mocking HTTP requests in tests:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'Test User' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches users', async () => {
  const users = await fetchUsers();
  expect(users).toHaveLength(1);
  expect(users[0].name).toBe('Test User');
});

test('handles error', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  await expect(fetchUsers()).rejects.toThrow('Failed to fetch');
});
```

## Decision Tree

### Choosing Your Testing Stack

```
Start Here: What are you testing?
│
├─ Node.js backend / API
│  └─ Unit + Integration: Vitest or Jest
│     └─ API requests: Supertest
│     └─ HTTP mocking: MSW
│
├─ React / Vue / Frontend components
│  ├─ Unit: Vitest + Testing Library
│  ├─ Component visual: Storybook
│  └─ E2E: Playwright or Cypress
│
├─ Full-stack web app
│  ├─ Unit: Vitest (fast, modern)
│  ├─ Integration: Vitest + Supertest
│  ├─ Component: Testing Library
│  └─ E2E: Playwright (cross-browser, fast)
│
└─ Mobile app / PWA
   ├─ Unit: Vitest
   └─ E2E: Playwright (mobile emulation)
```

### Migration Priority Matrix

| Current Stack        | Recommended Next Step  | Effort | Benefit      |
| -------------------- | ---------------------- | ------ | ------------ |
| Jest → Vitest        | Migrate if using Vite  | Low    | High (speed) |
| Mocha → Vitest       | Migrate new projects   | Medium | High         |
| Enzyme → RTL         | Migrate immediately    | Medium | Critical     |
| Cypress → Playwright | Consider for new tests | High   | Medium       |
| No E2E → Add E2E     | Start with Playwright  | Medium | High         |

## Summary Recommendations

**For new projects starting in 2024+:**

- **Unit/Integration:** Vitest + Testing Library
- **E2E:** Playwright
- **API Mocking:** MSW
- **Visual Regression:** Chromatic or Percy

**For existing large codebases:**

- **If using Jest:** Continue with Jest unless using Vite (then migrate)
- **If using Enzyme:** Migrate to React Testing Library immediately
- **If using Cypress:** Continue with Cypress, consider Playwright for new tests
- **If no E2E tests:** Add Playwright

**Performance-critical considerations:**

- Large test suites (>1000 tests): Vitest will save significant time
- Many E2E tests: Playwright's parallelization provides faster CI
- Vite projects: Vitest is the obvious choice

**Team considerations:**

- Existing expertise: Weigh against learning curve
- Ecosystem needs: Jest has largest ecosystem
- Developer experience: Vitest and Playwright excel here
