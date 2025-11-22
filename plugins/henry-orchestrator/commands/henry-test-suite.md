---
description: Generates/runs full test suite; coverage reports.
argument-hint: Optional test framework preference or specific test path
allowed-tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'TodoWrite', 'AskUserQuestion']
---

# Test Suite Generation & Coverage Analysis

Guide the user through setting up, running, and analyzing comprehensive test suites with coverage reports for their project.

## Core Principles

- **Auto-detect test framework**: Analyze existing project to determine testing setup (Jest, Vitest, Mocha, pytest, etc.)
- **Verify before running**: Confirm test configuration and targets with the user
- **Use TodoWrite**: Track all phases and steps throughout the process
- **Generate comprehensive coverage**: Ensure coverage reports include all relevant metrics
- **Follow best practices**: Use industry-standard testing tools and patterns

**Initial request:** $ARGUMENTS

---

## Phase 1: Context Analysis & Test Framework Detection

**Goal**: Understand the project context and determine which test frameworks are in use

**Actions**:

1. Create todo list with all phases:
   - Analyze project context and detect test frameworks
   - Verify/install test dependencies
   - Configure test runners and coverage tools
   - Run test suite
   - Generate coverage reports
   - Analyze coverage results and provide recommendations

2. Analyze existing project to detect test frameworks:

   **JavaScript/TypeScript Projects**:
   - Check for Jest (jest.config.js, jest in package.json)
   - Check for Vitest (vitest.config.ts, vitest in package.json)
   - Check for Mocha (mocha in package.json, .mocharc.js)
   - Check for Jasmine (jasmine.json)
   - Check for AVA (ava in package.json)
   - Check for Cypress (cypress.config.js, cypress/ directory)
   - Check for Playwright (playwright.config.ts)
   - Check for Testing Library (@testing-library packages)

   **Python Projects**:
   - Check for pytest (pytest.ini, setup.cfg with pytest section)
   - Check for unittest (test\_\*.py files)
   - Check for nose (nose in requirements)
   - Check for coverage.py (.coveragerc, coverage in requirements)

   **Java Projects**:
   - Check for JUnit (pom.xml or build.gradle with junit dependencies)
   - Check for TestNG (testng.xml)
   - Check for JaCoCo (jacoco in build configuration)

   **Go Projects**:
   - Check for built-in testing (\*\_test.go files)
   - Check for testify (go.mod with testify)
   - Check for coverage tools

   **Ruby Projects**:
   - Check for RSpec (spec/ directory, .rspec)
   - Check for Minitest (test/ directory)
   - Check for SimpleCov (simplecov in Gemfile)

   **Other Languages**:
   - Rust: cargo test, tarpaulin for coverage
   - PHP: PHPUnit
   - C#/.NET: xUnit, NUnit, MSTest
   - Swift: XCTest

3. Parse user arguments from $ARGUMENTS:
   - Test framework preference
   - Specific test paths or patterns
   - Coverage threshold requirements
   - Test type preferences (unit, integration, e2e)

4. Determine test structure:
   - Location of test files
   - Naming conventions (_.test.js, _\_test.py, etc.)
   - Test organization (by feature, by type, etc.)

5. Check for existing test configuration:
   - Look for test config files
   - Check test scripts in package.json/setup.py/build files
   - Verify coverage configuration
   - Check for CI/CD test integration

**Output**: Project analysis summary with detected test frameworks and recommended approach

---

## Phase 2: Verify/Install Test Dependencies

**Goal**: Ensure all necessary test dependencies are installed and configured

**Actions**:

1. Update TodoWrite: Mark "Verify/install test dependencies" as in_progress

2. Use AskUserQuestion to gather testing requirements:
   - Confirm detected test framework or ask for preference
   - Ask about coverage threshold targets (e.g., 80%, 90%)
   - Confirm test types to run (unit, integration, e2e, or all)
   - Ask about specific directories/files to test or exclude

3. **JavaScript/TypeScript** - Install dependencies:

   **Jest**:

   ```bash
   npm install --save-dev jest @types/jest
   # For TypeScript
   npm install --save-dev ts-jest @types/node
   # For React
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   # For coverage
   npm install --save-dev @jest/globals
   ```

   **Vitest**:

   ```bash
   npm install --save-dev vitest @vitest/ui
   # For coverage
   npm install --save-dev @vitest/coverage-v8
   # Or for c8 coverage
   npm install --save-dev @vitest/coverage-c8
   ```

   **Mocha + Chai**:

   ```bash
   npm install --save-dev mocha chai
   # For coverage
   npm install --save-dev nyc
   ```

4. **Python** - Install dependencies:

   **pytest**:

   ```bash
   pip install pytest pytest-cov pytest-html
   # For async tests
   pip install pytest-asyncio
   # For mocking
   pip install pytest-mock
   ```

5. **Java** - Verify dependencies in pom.xml or build.gradle:

   **Maven (pom.xml)**:

   ```xml
   <dependency>
       <groupId>junit</groupId>
       <artifactId>junit</artifactId>
       <version>4.13.2</version>
       <scope>test</scope>
   </dependency>
   <dependency>
       <groupId>org.jacoco</groupId>
       <artifactId>jacoco-maven-plugin</artifactId>
       <version>0.8.10</version>
   </dependency>
   ```

   **Gradle (build.gradle)**:

   ```gradle
   testImplementation 'junit:junit:4.13.2'
   testImplementation 'org.mockito:mockito-core:5.3.1'
   ```

6. **Go** - Install test dependencies:

   ```bash
   # Built-in testing requires no installation
   # For coverage visualization
   go install github.com/axw/gocov/gocov@latest
   go install github.com/AlekSi/gocov-xml@latest
   ```

7. Verify installation:
   ```bash
   # Check test runner is available
   npm test --version || jest --version || vitest --version
   # or
   pytest --version
   # or
   go test -version
   ```

**Output**: All test dependencies installed and verified

---

## Phase 3: Configure Test Runners and Coverage Tools

**Goal**: Set up test configuration files with coverage enabled

**Actions**:

1. Update TodoWrite: Mark "Configure test runners and coverage tools" as in_progress

2. **Jest Configuration** - Create/update `jest.config.js`:

   ```javascript
   module.exports = {
     // Test environment
     testEnvironment: 'node', // or 'jsdom' for browser-like tests

     // Test file patterns
     testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

     // Coverage configuration
     collectCoverage: true,
     collectCoverageFrom: [
       'src/**/*.{js,jsx,ts,tsx}',
       '!src/**/*.d.ts',
       '!src/**/*.stories.{js,jsx,ts,tsx}',
       '!src/**/__tests__/**',
     ],
     coverageDirectory: 'coverage',
     coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80,
       },
     },

     // TypeScript support
     preset: 'ts-jest',

     // Module paths
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },

     // Setup files
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
   };
   ```

3. **Vitest Configuration** - Create/update `vitest.config.ts`:

   ```typescript
   import { defineConfig } from 'vitest/config';
   import path from 'path';

   export default defineConfig({
     test: {
       globals: true,
       environment: 'node', // or 'jsdom', 'happy-dom'

       // Coverage configuration
       coverage: {
         provider: 'v8', // or 'c8'
         reporter: ['text', 'json', 'html', 'lcov'],
         include: ['src/**/*.{js,ts,jsx,tsx}'],
         exclude: [
           'node_modules/',
           'src/**/*.d.ts',
           'src/**/*.spec.{js,ts,jsx,tsx}',
           'src/**/__tests__/**',
         ],
         all: true,
         lines: 80,
         functions: 80,
         branches: 80,
         statements: 80,
       },

       // Test file patterns
       include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],

       // Setup files
       setupFiles: ['./vitest.setup.ts'],
     },

     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

4. **Pytest Configuration** - Create/update `pytest.ini`:

   ```ini
   [pytest]
   testpaths = tests
   python_files = test_*.py *_test.py
   python_classes = Test*
   python_functions = test_*

   # Coverage options
   addopts =
       --cov=src
       --cov-report=html
       --cov-report=term-missing
       --cov-report=json
       --cov-fail-under=80
       --verbose
       --strict-markers
       --tb=short

   # Markers
   markers =
       unit: Unit tests
       integration: Integration tests
       slow: Slow running tests
       skip_ci: Skip in CI environment
   ```

   Create `.coveragerc`:

   ```ini
   [run]
   source = src
   omit =
       */tests/*
       */test_*
       */__pycache__/*
       */venv/*

   [report]
   precision = 2
   show_missing = True
   skip_covered = False

   [html]
   directory = coverage_html_report
   ```

5. **Go Test Configuration** - Create test helper script `scripts/test-with-coverage.sh`:

   ```bash
   #!/bin/bash

   # Run tests with coverage
   go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

   # Generate HTML report
   go tool cover -html=coverage.out -o coverage.html

   # Print coverage summary
   go tool cover -func=coverage.out

   # Check coverage threshold (80%)
   total_coverage=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')
   threshold=80.0

   if (( $(echo "$total_coverage < $threshold" | bc -l) )); then
       echo "Coverage ${total_coverage}% is below threshold ${threshold}%"
       exit 1
   else
       echo "Coverage ${total_coverage}% meets threshold ${threshold}%"
   fi
   ```

6. **Update package.json scripts** (JavaScript/TypeScript):

   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage",
       "test:ci": "jest --coverage --ci --maxWorkers=2",
       "test:verbose": "jest --verbose",
       "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
     }
   }
   ```

   Or for Vitest:

   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:run": "vitest run",
       "test:coverage": "vitest run --coverage",
       "test:ui": "vitest --ui",
       "test:watch": "vitest watch"
     }
   }
   ```

7. Create test setup file if needed:

   **Jest Setup** (`jest.setup.js`):

   ```javascript
   // Add custom matchers
   import '@testing-library/jest-dom';

   // Set test timeout
   jest.setTimeout(10000);

   // Mock environment variables
   process.env.NODE_ENV = 'test';

   // Global test setup
   beforeAll(() => {
     console.log('Starting test suite...');
   });

   afterAll(() => {
     console.log('Test suite completed.');
   });
   ```

**Output**: Test runners configured with coverage enabled

---

## Phase 4: Run Test Suite

**Goal**: Execute all tests and collect results

**Actions**:

1. Update TodoWrite: Mark "Run test suite" as in_progress

2. Run tests based on detected framework:

   **JavaScript/TypeScript (Jest)**:

   ```bash
   # Run all tests with coverage
   npm test -- --coverage --verbose

   # Or using Jest directly
   npx jest --coverage --verbose --detectOpenHandles
   ```

   **JavaScript/TypeScript (Vitest)**:

   ```bash
   # Run tests with coverage
   npm run test:coverage

   # Or using Vitest directly
   npx vitest run --coverage
   ```

   **Python (pytest)**:

   ```bash
   # Run all tests with coverage
   pytest --cov=src --cov-report=html --cov-report=term-missing -v

   # Run specific test types
   pytest -m unit --cov=src
   pytest -m integration --cov=src
   ```

   **Java (Maven)**:

   ```bash
   # Run tests with coverage
   mvn clean test jacoco:report
   ```

   **Java (Gradle)**:

   ```bash
   # Run tests with coverage
   ./gradlew test jacocoTestReport
   ```

   **Go**:

   ```bash
   # Run tests with coverage
   go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

   # Generate HTML report
   go tool cover -html=coverage.out -o coverage.html
   ```

   **Ruby (RSpec)**:

   ```bash
   # Run tests with coverage
   bundle exec rspec --format documentation
   ```

   **Rust**:

   ```bash
   # Run tests with coverage
   cargo tarpaulin --out Html --out Lcov --output-dir coverage
   ```

3. Monitor test execution:
   - Track test progress
   - Note any failing tests
   - Capture test output and errors
   - Monitor execution time

4. Handle test failures:
   - If tests fail, analyze error messages
   - Group failures by type (assertion, timeout, error)
   - Identify patterns in failures
   - Ask user if they want to fix failures before continuing

**Output**: Test suite execution completed with results

---

## Phase 5: Generate Coverage Reports

**Goal**: Create comprehensive coverage reports in multiple formats

**Actions**:

1. Update TodoWrite: Mark "Generate coverage reports" as in_progress

2. Verify coverage reports were generated:

   **Jest/Vitest**:
   - Check `coverage/` directory exists
   - Verify `lcov.info` file present
   - Confirm HTML report in `coverage/index.html`
   - Check `coverage/coverage-summary.json` for metrics

   **pytest**:
   - Check `coverage_html_report/` directory
   - Verify `.coverage` data file
   - Confirm `htmlcov/index.html` exists

   **Java (JaCoCo)**:
   - Check `target/site/jacoco/index.html` (Maven)
   - Check `build/reports/jacoco/test/html/index.html` (Gradle)

   **Go**:
   - Verify `coverage.out` file
   - Check `coverage.html` was generated

3. Generate additional coverage formats if needed:

   **Convert coverage to different formats**:

   ```bash
   # Jest/Vitest - Already generates multiple formats

   # pytest - Generate XML for CI tools
   pytest --cov=src --cov-report=xml

   # Go - Generate coverage badge
   go tool cover -func=coverage.out | grep total

   # Convert lcov to coverage badge
   npx coverage-badge-creator --lcov-file coverage/lcov.info
   ```

4. Read and parse coverage summary:

   **JavaScript/TypeScript** - Read `coverage/coverage-summary.json`:

   ```javascript
   {
     "total": {
       "lines": { "total": 500, "covered": 425, "skipped": 0, "pct": 85 },
       "statements": { "total": 550, "covered": 467, "skipped": 0, "pct": 84.91 },
       "functions": { "total": 100, "covered": 88, "skipped": 0, "pct": 88 },
       "branches": { "total": 150, "covered": 120, "skipped": 0, "pct": 80 }
     }
   }
   ```

   **Python** - Parse pytest output or read `.coverage` file

5. Create coverage summary document:

   Create `TEST_COVERAGE_REPORT.md`:

   ```markdown
   # Test Coverage Report

   **Generated**: [Current Date]
   **Project**: [Project Name]
   **Test Framework**: [Framework Name]

   ## Overall Coverage

   | Metric     | Coverage | Target | Status |
   | ---------- | -------- | ------ | ------ |
   | Lines      | XX.XX%   | 80%    | ✅/❌  |
   | Statements | XX.XX%   | 80%    | ✅/❌  |
   | Functions  | XX.XX%   | 80%    | ✅/❌  |
   | Branches   | XX.XX%   | 80%    | ✅/❌  |

   ## Test Results

   - **Total Tests**: XXX
   - **Passed**: XXX
   - **Failed**: XXX
   - **Skipped**: XXX
   - **Execution Time**: XX.XXs

   ## Coverage by Directory

   | Directory    | Lines  | Statements | Functions | Branches |
   | ------------ | ------ | ---------- | --------- | -------- |
   | src/utils    | XX.XX% | XX.XX%     | XX.XX%    | XX.XX%   |
   | src/services | XX.XX% | XX.XX%     | XX.XX%    | XX.XX%   |
   | src/models   | XX.XX% | XX.XX%     | XX.XX%    | XX.XX%   |

   ## Uncovered Files

   Files with coverage below threshold:

   1. `src/path/to/file.ts` - XX.XX% coverage
   2. `src/another/file.ts` - XX.XX% coverage

   ## Detailed Reports

   - HTML Report: `coverage/index.html`
   - LCOV Report: `coverage/lcov.info`
   - JSON Summary: `coverage/coverage-summary.json`

   ## Recommendations

   [Generated recommendations based on coverage analysis]
   ```

**Output**: Comprehensive coverage reports generated in multiple formats

---

## Phase 6: Analyze Coverage Results and Provide Recommendations

**Goal**: Analyze coverage data and provide actionable recommendations

**Actions**:

1. Update TodoWrite: Mark "Analyze coverage results and provide recommendations" as in_progress

2. Analyze coverage metrics:
   - Identify files with low coverage (< 80%)
   - Find uncovered critical paths
   - Detect untested functions/methods
   - Identify missing branch coverage
   - Check for test gaps in core functionality

3. Generate recommendations based on analysis:

   **Low coverage areas**:

   ```
   Priority: HIGH
   - File: src/auth/authentication.ts (Coverage: 45%)
     Missing: Error handling paths, edge cases
     Recommendation: Add tests for login failures, token expiration

   - File: src/api/payments.ts (Coverage: 52%)
     Missing: Payment failure scenarios, validation errors
     Recommendation: Add integration tests for payment flows
   ```

   **Untested functions**:

   ```
   Priority: MEDIUM
   - Function: validateEmail() in src/utils/validators.ts
     Recommendation: Add unit tests for valid/invalid email formats

   - Function: formatCurrency() in src/utils/formatters.ts
     Recommendation: Add tests for different locales and edge cases
   ```

   **Missing branch coverage**:

   ```
   Priority: HIGH
   - File: src/services/userService.ts
     Branch: Error handling in createUser() (Line 45)
     Recommendation: Test error scenarios when user creation fails
   ```

4. Create test improvement plan:

   ```markdown
   ## Test Improvement Plan

   ### Immediate Actions (High Priority)

   1. **Authentication Module** (Current: 45% → Target: 85%)
      - Add tests for login/logout flows
      - Test token validation and expiration
      - Cover error handling paths
      - Estimated effort: 4-6 hours

   2. **Payment Processing** (Current: 52% → Target: 85%)
      - Add integration tests for payment flows
      - Test failure scenarios
      - Cover refund logic
      - Estimated effort: 6-8 hours

   ### Short-term Improvements (Medium Priority)

   1. **Utility Functions** (Current: 75% → Target: 90%)
      - Add edge case tests
      - Test validation functions
      - Cover formatting utilities
      - Estimated effort: 2-3 hours

   2. **API Endpoints** (Current: 70% → Target: 85%)
      - Add integration tests
      - Test error responses
      - Cover authentication middleware
      - Estimated effort: 4-5 hours

   ### Long-term Goals

   1. Achieve 90%+ coverage across all modules
   2. Implement mutation testing
   3. Add visual regression tests
   4. Set up continuous testing in CI/CD
   ```

5. Suggest test additions:

   For uncovered code sections, generate example test cases:

   ```javascript
   // Example test for uncovered authentication function
   describe('Authentication Service', () => {
     describe('validateToken', () => {
       it('should return true for valid token', async () => {
         const token = generateValidToken();
         const result = await authService.validateToken(token);
         expect(result).toBe(true);
       });

       it('should return false for expired token', async () => {
         const token = generateExpiredToken();
         const result = await authService.validateToken(token);
         expect(result).toBe(false);
       });

       it('should throw error for malformed token', async () => {
         const token = 'invalid-token';
         await expect(authService.validateToken(token)).rejects.toThrow('Invalid token format');
       });
     });
   });
   ```

6. Provide coverage improvement tips:

   ```markdown
   ## Tips for Improving Test Coverage

   ### 1. Focus on Critical Paths

   - Prioritize testing business logic and critical features
   - Ensure error handling is thoroughly tested
   - Cover edge cases and boundary conditions

   ### 2. Use Test-Driven Development (TDD)

   - Write tests before implementing features
   - Ensures all new code has corresponding tests
   - Improves code design and testability

   ### 3. Test Different Scenarios

   - Happy path (expected behavior)
   - Error cases (invalid input, failures)
   - Edge cases (boundaries, null/undefined)
   - Integration scenarios (component interactions)

   ### 4. Mock External Dependencies

   - Use mocks for APIs, databases, external services
   - Isolate unit tests from external factors
   - Speed up test execution

   ### 5. Maintain Test Quality

   - Keep tests simple and focused
   - Use descriptive test names
   - Avoid test interdependencies
   - Regular test maintenance and refactoring

   ### 6. Monitor Coverage Trends

   - Track coverage over time
   - Set coverage gates in CI/CD
   - Review coverage in code reviews
   - Prevent coverage regression
   ```

7. Set up coverage monitoring:

   **Add coverage badge to README.md**:

   ```markdown
   # Project Name

   ![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
   ```

   **Configure CI/CD coverage gates**:

   GitHub Actions example (`.github/workflows/test.yml`):

   ```yaml
   name: Tests

   on: [push, pull_request]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: '18'

         - name: Install dependencies
           run: npm ci

         - name: Run tests with coverage
           run: npm run test:coverage

         - name: Check coverage threshold
           run: |
             COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
             if (( $(echo "$COVERAGE < 80" | bc -l) )); then
               echo "Coverage $COVERAGE% is below 80%"
               exit 1
             fi

         - name: Upload coverage to Codecov
           uses: codecov/codecov-action@v3
           with:
             files: ./coverage/lcov.info
             fail_ci_if_error: true
   ```

8. Create final summary:

   ```
   Test Suite Execution Complete!

   Test Results:
   ✓ Total Tests: XXX
   ✓ Passed: XXX
   ✗ Failed: XXX
   ⊘ Skipped: XXX
   ⏱ Execution Time: XX.XXs

   Coverage Summary:
   Lines:      XX.XX% (XXX/XXX)
   Statements: XX.XX% (XXX/XXX)
   Functions:  XX.XX% (XXX/XXX)
   Branches:   XX.XX% (XXX/XXX)

   Coverage Status: [✅ Meets Threshold / ❌ Below Threshold]

   Reports Generated:
   - HTML Report: coverage/index.html
   - LCOV Report: coverage/lcov.info
   - Coverage Summary: coverage/coverage-summary.json
   - Test Report: TEST_COVERAGE_REPORT.md

   Next Steps:

   1. Review HTML coverage report:
      open coverage/index.html

   2. Address areas with low coverage (see TEST_COVERAGE_REPORT.md)

   3. Add tests for critical uncovered code paths

   4. Set up CI/CD coverage monitoring

   5. Configure coverage badges for visibility

   Key Recommendations:
   [List top 3-5 most important recommendations]
   ```

**Output**: Complete coverage analysis with actionable recommendations

---

## Important Notes

### Test Types

**Unit Tests**:

- Test individual functions/methods in isolation
- Fast execution, no external dependencies
- High code coverage focus

**Integration Tests**:

- Test component interactions
- May use real or mocked external services
- Verify system integration points

**End-to-End Tests**:

- Test complete user workflows
- Use real environment (or staging)
- Slower but provide high confidence

### Coverage Metrics

**Line Coverage**: Percentage of code lines executed
**Statement Coverage**: Percentage of statements executed
**Function Coverage**: Percentage of functions called
**Branch Coverage**: Percentage of conditional branches tested

### Best Practices

1. **Aim for 80%+ coverage** but don't sacrifice test quality for numbers
2. **Test behavior, not implementation** - focus on what code does, not how
3. **Keep tests fast** - slow tests discourage running them frequently
4. **Maintain test independence** - tests shouldn't depend on each other
5. **Use meaningful test names** - describe what's being tested and expected outcome
6. **Mock external dependencies** - keep unit tests isolated
7. **Regular test maintenance** - refactor tests along with production code

### Common Issues

**Coverage not collected**:

- Verify coverage configuration in test config
- Check file patterns include all source files
- Ensure test files are properly discovered

**Low branch coverage**:

- Add tests for all conditional paths
- Test error handling scenarios
- Cover edge cases and boundary conditions

**Slow test execution**:

- Optimize database/API mocks
- Run tests in parallel
- Use test.only during development

### CI/CD Integration

Set up automated testing:

- Run tests on every commit/PR
- Enforce coverage thresholds
- Block merges if tests fail
- Generate coverage reports
- Track coverage trends over time

---

**Begin with Phase 1: Context Analysis & Test Framework Detection**
