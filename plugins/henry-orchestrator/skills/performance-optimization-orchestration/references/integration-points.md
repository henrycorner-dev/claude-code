# Integration Points - Tool Integration Guide

This guide covers integration with various performance, security, and quality tools.

## Table of Contents

- [Performance Tools](#performance-tools)
- [Security Tools](#security-tools)
- [Quality Tools](#quality-tools)
- [CI/CD Integration](#cicd-integration)
- [Monitoring and Analytics](#monitoring-and-analytics)

## Performance Tools

### Lighthouse

**Purpose**: Automated performance, accessibility, SEO auditing

**Integration**:

```bash
# CLI usage
npm install -g lighthouse
lighthouse https://example.com --output json html --output-path ./reports/

# Programmatic usage
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  return {
    lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
    cls: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
    tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue,
    score: runnerResult.lhr.categories.performance.score * 100,
  };
}
```

**CI/CD Integration**:

```yaml
# GitHub Actions
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - name: Run Lighthouse
        run: |
          npm install -g @lhci/cli
          lhci autorun
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://example.com
            https://example.com/about
          uploadArtifacts: true
```

### WebPageTest

**Purpose**: Real-world performance testing from multiple locations

**Integration**:

```javascript
const WebPageTest = require('webpagetest');
const wpt = new WebPageTest('www.webpagetest.org', process.env.WPT_API_KEY);

async function runTest(url) {
  return new Promise((resolve, reject) => {
    wpt.runTest(
      url,
      {
        location: 'Dulles:Chrome',
        connectivity: '4G',
        runs: 3,
        firstViewOnly: false,
      },
      (err, result) => {
        if (err) return reject(err);

        wpt.getTestResults(result.data.testId, (err, data) => {
          if (err) return reject(err);
          resolve({
            testId: result.data.testId,
            summary: data.data.summary,
            median: data.data.median,
          });
        });
      }
    );
  });
}
```

### Webpack Bundle Analyzer

**Purpose**: Visualize bundle composition and identify optimization opportunities

**Integration**:

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
    }),
  ],
};
```

### Chrome DevTools Protocol

**Purpose**: Programmatic access to Chrome DevTools features

**Integration**:

```javascript
const puppeteer = require('puppeteer');

async function measurePerformance(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Enable performance metrics
  await page.evaluateOnNewDocument(() => {
    window.perfMetrics = {};
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        window.perfMetrics[entry.name] = entry;
      }
    }).observe({ entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] });
  });

  await page.goto(url, { waitUntil: 'networkidle0' });

  // Get metrics
  const metrics = await page.evaluate(() => window.perfMetrics);
  const performanceMetrics = await page.metrics();

  await browser.close();

  return {
    custom: metrics,
    browser: performanceMetrics,
  };
}
```

## Security Tools

### npm audit

**Purpose**: Scan dependencies for known vulnerabilities

**Integration**:

```bash
# Basic audit
npm audit

# Audit with JSON output
npm audit --json > audit-results.json

# Auto-fix vulnerabilities
npm audit fix

# Programmatic usage
const {exec} = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runAudit() {
  const {stdout} = await execPromise('npm audit --json');
  const results = JSON.parse(stdout);

  const critical = results.metadata.vulnerabilities.critical;
  const high = results.metadata.vulnerabilities.high;

  if (critical > 0 || high > 0) {
    throw new Error(`Found ${critical} critical and ${high} high vulnerabilities`);
  }

  return results;
}
```

### Snyk

**Purpose**: Comprehensive vulnerability scanning with remediation advice

**Integration**:

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor

# Programmatic usage
const snyk = require('snyk');

async function scanProject() {
  const results = await snyk.test('.', {
    org: 'my-org',
    severityThreshold: 'high',
  });

  return {
    vulnerabilities: results.vulnerabilities.length,
    critical: results.vulnerabilities.filter(v => v.severity === 'critical').length,
    high: results.vulnerabilities.filter(v => v.severity === 'high').length,
  };
}
```

### OWASP ZAP

**Purpose**: Dynamic application security testing (DAST)

**Integration**:

```javascript
const ZapClient = require('zaproxy');

async function runZapScan(targetUrl) {
  const zaproxy = new ZapClient({
    apiKey: process.env.ZAP_API_KEY,
    proxy: {
      host: 'localhost',
      port: 8080,
    },
  });

  // Start spider scan
  const spiderScan = await zaproxy.spider.scan(targetUrl);
  await zaproxy.spider.waitForComplete(spiderScan.scan);

  // Start active scan
  const activeScan = await zaproxy.ascan.scan(targetUrl);
  await zaproxy.ascan.waitForComplete(activeScan.scan);

  // Get alerts
  const alerts = await zaproxy.core.alerts(targetUrl);

  return {
    critical: alerts.filter(a => a.risk === 'High').length,
    high: alerts.filter(a => a.risk === 'Medium').length,
    medium: alerts.filter(a => a.risk === 'Low').length,
    alerts: alerts,
  };
}
```

### SonarQube

**Purpose**: Static application security testing (SAST) and code quality

**Integration**:

```bash
# Scanner CLI
sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>

# Via npm (for JavaScript/TypeScript)
npm install -D sonarqube-scanner

# sonar-project.properties
sonar.projectKey=my-project
sonar.projectName=My Project
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/dist/**
```

**Programmatic usage**:

```javascript
const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://localhost:9000',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': 'my-project',
      'sonar.projectName': 'My Project',
      'sonar.sources': 'src',
      'sonar.tests': 'tests',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  () => {
    console.log('SonarQube analysis complete');
  }
);
```

## Quality Tools

### Jest

**Purpose**: JavaScript testing framework with coverage

**Integration**:

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
```

**Programmatic usage**:

```javascript
const jest = require('jest');

async function runTests() {
  const results = await jest.runCLI(
    {
      coverage: true,
      json: true,
      outputFile: 'test-results.json',
    },
    [process.cwd()]
  );

  const { numTotalTests, numPassedTests, numFailedTests } = results.results;
  const passRate = (numPassedTests / numTotalTests) * 100;

  if (passRate < 95) {
    throw new Error(`Test pass rate ${passRate.toFixed(2)}% below threshold 95%`);
  }

  return results;
}
```

### Playwright

**Purpose**: End-to-end testing and browser automation

**Integration**:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Performance E2E', () => {
  test('should meet Core Web Vitals', async ({ page }) => {
    await page.goto('https://example.com');

    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500);

    // Take screenshot for visual regression
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  });
});
```

**MCP Playwright Integration**:

```javascript
// Using MCP Playwright tool in Henry Orchestrator
use_mcp_tool(playwright, browser_navigate, {
  url: 'https://example.com',
});

use_mcp_tool(playwright, browser_evaluate, {
  function: `() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const lcp = list.getEntries()[list.getEntries().length - 1];
        resolve({lcp: lcp.renderTime || lcp.loadTime});
      }).observe({entryTypes: ['largest-contentful-paint']});
    });
  }`,
});
```

### ESLint

**Purpose**: JavaScript linting and code quality

**Integration**:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:security/recommended'],
  plugins: ['security'],
  rules: {
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
  },
};

// Programmatic usage
const { ESLint } = require('eslint');

async function lintCode() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/**/*.js']);

  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
  const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);

  return { errorCount, warningCount, results: resultText };
}
```

## CI/CD Integration

### GitHub Actions

**Comprehensive quality workflow**:

```yaml
name: Quality Checks
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Bundle size check
        run: |
          npm install -g bundlesize
          bundlesize
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: 'https://example.com'
          budgetPath: '.lighthouserc.json'
          uploadArtifacts: true

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: npm audit
        run: npm audit --audit-level=high
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests with coverage
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
      - name: E2E tests
        run: npm run test:e2e
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% below threshold 80%"
            exit 1
          fi
```

### Performance Budgets

**Lighthouse CI config**:

```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["https://example.com"]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "interactive": ["error", { "maxNumericValue": 3800 }],
        "categories:performance": ["error", { "minScore": 0.9 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 300000 }],
        "resource-summary:image:size": ["error", { "maxNumericValue": 800000 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**bundlesize config**:

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/main.*.js",
      "maxSize": "300 kB"
    },
    {
      "path": "./dist/vendor.*.js",
      "maxSize": "200 kB"
    },
    {
      "path": "./dist/*.css",
      "maxSize": "50 kB"
    }
  ]
}
```

## Monitoring and Analytics

### Google Analytics 4

**Core Web Vitals tracking**:

```javascript
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToGA(metric) {
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

onLCP(sendToGA);
onINP(sendToGA);
onCLS(sendToGA);
```

### Datadog

**RUM and performance monitoring**:

```javascript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.DD_APP_ID,
  clientToken: process.env.DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'my-app',
  env: 'production',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});

// Custom performance marks
performance.mark('user-action-start');
// ... user action
performance.mark('user-action-end');
performance.measure('user-action', 'user-action-start', 'user-action-end');
```

### New Relic

**Browser monitoring**:

```javascript
// Browser agent snippet (add to <head>)
<script type="text/javascript">
;window.NREUM||(NREUM={});NREUM.init={...};
</script>

// Custom metrics
newrelic.addPageAction('purchaseComplete', {
  orderId: '12345',
  amount: 99.99,
  items: 3,
});

// Performance tracking
newrelic.interaction()
  .setName('searchProducts')
  .save();
```

### Sentry

**Error tracking with performance**:

```javascript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,

  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request && event.request.headers) {
      delete event.request.headers.Authorization;
    }
    return event;
  },
});

// Custom transaction
const transaction = Sentry.startTransaction({ name: 'checkout-flow' });
// ... checkout process
transaction.finish();
```

## Tool Comparison

### Performance Tools

| Tool                    | Purpose               | Strengths                                      | Limitations                   |
| ----------------------- | --------------------- | ---------------------------------------------- | ----------------------------- |
| Lighthouse              | Automated audits      | Comprehensive, easy to use, CI/CD integration  | Synthetic only, single device |
| WebPageTest             | Real-world testing    | Multiple locations, devices, connection speeds | Slower, requires API key      |
| Chrome DevTools         | Development debugging | Real-time, detailed insights                   | Manual, not automated         |
| Webpack Bundle Analyzer | Bundle optimization   | Visual breakdown, interactive                  | Build tool specific           |

### Security Tools

| Tool      | Purpose                | Strengths                                 | Limitations                          |
| --------- | ---------------------- | ----------------------------------------- | ------------------------------------ |
| npm audit | Dependency scanning    | Free, built-in, fast                      | Basic reporting, limited remediation |
| Snyk      | Comprehensive security | Detailed remediation, integrations        | Paid for advanced features           |
| OWASP ZAP | DAST                   | Free, comprehensive, active community     | Requires running application         |
| SonarQube | SAST + quality         | Code quality + security, detailed reports | Setup complexity                     |

### Quality Tools

| Tool       | Purpose                  | Strengths                              | Limitations                |
| ---------- | ------------------------ | -------------------------------------- | -------------------------- |
| Jest       | Unit/integration testing | Fast, great DX, built-in coverage      | JavaScript/TypeScript only |
| Playwright | E2E testing              | Cross-browser, reliable, modern API    | Slower than unit tests     |
| ESLint     | Linting                  | Highly configurable, extensive plugins | Syntax only, not runtime   |
| Codecov    | Coverage tracking        | Visual diffs, PR integration           | Requires external service  |

## Best Practices

### Tool Selection

✅ **DO**:

- Choose tools that integrate with your existing workflow
- Start with free/open-source tools before paid solutions
- Automate quality checks in CI/CD
- Use RUM for production, synthetic for development
- Combine multiple tools for comprehensive coverage

❌ **DON'T**:

- Rely on a single tool for quality assurance
- Ignore tool maintenance and updates
- Use too many overlapping tools
- Skip tool configuration and customization
- Ignore false positives without investigation

### Integration Strategy

1. **Start with CI/CD**: Automate quality checks in your pipeline
2. **Set thresholds**: Define clear pass/fail criteria
3. **Monitor trends**: Track metrics over time, not just point-in-time
4. **Alert on regressions**: Immediate notification for quality degradation
5. **Regular review**: Weekly/monthly review of metrics and tool effectiveness

## Related Resources

- [Optimization Framework](./optimization-framework.md) - Detailed workflows
- [Metrics Guide](./metrics-guide.md) - Comprehensive metrics catalog
- [Tradeoffs Guide](./tradeoffs-guide.md) - Performance vs. other concerns
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
