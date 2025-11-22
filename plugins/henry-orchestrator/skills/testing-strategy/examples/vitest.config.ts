import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Use global test APIs (describe, it, expect) without imports
    globals: true,

    // Test environment
    environment: 'jsdom', // Use 'node' for backend, 'jsdom' for frontend

    // Setup files run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Include/exclude patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.cache'],

    // Coverage configuration
    coverage: {
      provider: 'c8', // Use 'istanbul' for more features
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.test.{js,jsx,ts,tsx}',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      // Per-directory thresholds
      thresholdAutoUpdate: false,
      watermarks: {
        statements: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        lines: [80, 95],
      },
    },

    // Watch mode settings
    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**'],

    // Reporters
    reporters: ['verbose'],

    // Test timeout (in ms)
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Automatically clear mock calls and instances before every test
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Isolate environment for each test file
    isolate: true,

    // Run tests in parallel
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // UI mode (run with --ui flag)
    ui: true,

    // Browser mode (experimental)
    // browser: {
    //   enabled: true,
    //   name: 'chrome',
    //   headless: true,
    // },
  },

  // Vite configuration (shared with build)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // Define global variables
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000'),
  },
});
