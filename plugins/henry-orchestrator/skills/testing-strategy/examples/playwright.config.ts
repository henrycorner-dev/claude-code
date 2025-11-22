import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 4 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Maximum time each action can take
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Emulate browser locale
    locale: 'en-US',

    // Emulate timezone
    timezoneId: 'America/New_York',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // User agent
    // userAgent: 'custom-user-agent',

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Extra HTTP headers
    // extraHTTPHeaders: {
    //   'Authorization': 'Bearer token',
    // },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13 Pro'] },
    },

    // Test against branded browsers
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  // Global setup/teardown
  // globalSetup: require.resolve('./global-setup'),
  // globalTeardown: require.resolve('./global-teardown'),

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Timeout for each test
  timeout: 30000,

  // Timeout for expect() assertions
  expect: {
    timeout: 5000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Preserve output between runs
  preserveOutput: 'always',

  // Folder for test artifacts such as screenshots, videos, traces, etc.
  snapshotDir: './e2e/__snapshots__',

  // Maximum number of failures before stopping
  maxFailures: process.env.CI ? 10 : undefined,

  // Update snapshots
  updateSnapshots: 'missing',

  // Grep pattern to filter tests
  // grep: /smoke/,
  // grepInvert: /skip/,
});
