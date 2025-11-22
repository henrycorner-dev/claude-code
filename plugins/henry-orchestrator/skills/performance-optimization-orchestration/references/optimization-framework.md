# Optimization Framework - Detailed Workflows

This guide provides detailed workflows for performance optimization, security hardening, quality audits, and continuous improvement.

## Table of Contents

- [Performance Optimization Sprint](#performance-optimization-sprint)
- [Security Hardening](#security-hardening)
- [Quality Audit](#quality-audit)
- [Continuous Quality Improvement](#continuous-quality-improvement)
- [Optimization Techniques](#optimization-techniques)

## Performance Optimization Sprint

### Phase 1: Baseline (performance-engineer)

**Step 1: Measure Current Core Web Vitals**

```bash
# Using Lighthouse CLI
lighthouse https://example.com --output json --output-path ./baseline-report.json

# Key metrics to capture:
# - LCP (Largest Contentful Paint)
# - INP (Interaction to Next Paint)
# - CLS (Cumulative Layout Shift)
# - TTFB (Time to First Byte)
# - FCP (First Contentful Paint)
```

**Step 2: Identify Bottlenecks**

- Analyze network waterfall for slow requests
- Check bundle size and composition
- Identify render-blocking resources
- Review image sizes and formats
- Check third-party script impact
- Analyze JavaScript execution time

**Step 3: Set Optimization Targets**

```
Current → Target
LCP: 4.2s → 2.5s (41% improvement needed)
INP: 350ms → 200ms (43% improvement needed)
CLS: 0.18 → 0.1 (44% improvement needed)
Bundle: 1.2MB → 500KB (58% reduction needed)
```

**Step 4: Prioritize Improvements**
Rank by impact × effort:

1. Image optimization (high impact, low effort)
2. Code splitting (high impact, medium effort)
3. Font optimization (medium impact, low effort)
4. Third-party script optimization (medium impact, medium effort)
5. API optimization (high impact, high effort)

### Phase 2: Implementation

**Code Splitting and Lazy Loading**

```javascript
// Before: Everything in one bundle
import Dashboard from './Dashboard';
import Settings from './Settings';
import Reports from './Reports';

// After: Route-based code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const Reports = lazy(() => import('./Reports'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}
```

**Image Optimization**

```html
<!-- Before: Large JPG images -->
<img src="hero-4000x3000.jpg" alt="Hero" />

<!-- After: Responsive WebP with fallback -->
<picture>
  <source
    srcset="hero-800.webp 800w, hero-1200.webp 1200w, hero-1600.webp 1600w"
    type="image/webp"
  />
  <source srcset="hero-800.jpg 800w, hero-1200.jpg 1200w, hero-1600.jpg 1600w" type="image/jpeg" />
  <img src="hero-1200.jpg" alt="Hero" loading="lazy" width="1200" height="800" />
</picture>
```

**API Optimization**

```javascript
// Before: N+1 queries
async function getUsers() {
  const users = await db.query('SELECT * FROM users');
  for (const user of users) {
    user.posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
  }
  return users;
}

// After: Single query with JOIN
async function getUsers() {
  const results = await db.query(`
    SELECT u.*, p.id as post_id, p.title, p.content
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
  `);

  return results.reduce((users, row) => {
    // Group posts by user
    const user = users.find(u => u.id === row.id);
    if (!user) {
      users.push({
        id: row.id,
        name: row.name,
        posts: row.post_id ? [{ id: row.post_id, title: row.title }] : [],
      });
    } else if (row.post_id) {
      user.posts.push({ id: row.post_id, title: row.title });
    }
    return users;
  }, []);
}
```

**Caching Implementation**

```javascript
// Service Worker caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first for static assets
  if (url.pathname.match(/\.(js|css|woff2|png|jpg|webp)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request).then(response => {
            return caches.open('static-v1').then(cache => {
              cache.put(request, response.clone());
              return response;
            });
          })
        );
      })
    );
  }

  // Network-first for API calls
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
  }
});
```

**Third-Party Script Optimization**

```html
<!-- Before: Blocking scripts -->
<script src="https://analytics.example.com/script.js"></script>
<script src="https://chat.example.com/widget.js"></script>

<!-- After: Defer non-critical scripts -->
<script src="https://analytics.example.com/script.js" defer></script>

<!-- Load chat widget on user interaction -->
<script>
  let chatLoaded = false;
  function loadChat() {
    if (chatLoaded) return;
    chatLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://chat.example.com/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }

  // Load on scroll or after 5 seconds
  window.addEventListener('scroll', loadChat, { once: true });
  setTimeout(loadChat, 5000);
</script>
```

### Phase 3: Verification (performance-engineer + qa-tester)

**Step 1: Measure Improvements**

```bash
# Run Lighthouse again
lighthouse https://example.com --output json --output-path ./optimized-report.json

# Compare results
node compare-reports.js baseline-report.json optimized-report.json
```

**Step 2: Validate Targets Met**

```
Metric     Before   After    Target   Status
LCP        4.2s     2.1s     <2.5s    ✓ Pass (50% improvement)
INP        350ms    180ms    <200ms   ✓ Pass (49% improvement)
CLS        0.18     0.08     <0.1     ✓ Pass (56% improvement)
Bundle     1.2MB    450KB    <500KB   ✓ Pass (63% reduction)
```

**Step 3: Ensure No Regressions**

```javascript
// Automated regression tests
describe('Performance Optimization', () => {
  it('should render homepage without errors', async () => {
    const page = await browser.newPage();
    await page.goto('https://example.com');
    expect(await page.title()).toBe('Example Site');
  });

  it('should maintain functionality after lazy loading', async () => {
    const page = await browser.newPage();
    await page.goto('https://example.com/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    const content = await page.$('[data-testid="dashboard-content"]');
    expect(content).toBeTruthy();
  });

  it('should load images correctly', async () => {
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const images = await page.$$('img');
    for (const img of images) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});
```

**Step 4: Update Performance Budget**

```json
// performance-budget.json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "interactive",
          "budget": 3500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        },
        {
          "resourceType": "image",
          "budget": 800
        },
        {
          "resourceType": "total",
          "budget": 1200
        }
      ]
    }
  ]
}
```

## Security Hardening

### Phase 1: Assessment (security-engineer)

**Step 1: Threat Modeling**

```
Asset: User Authentication System

Threats (STRIDE):
- Spoofing: Attacker impersonates legitimate user
- Tampering: Session tokens modified
- Repudiation: Actions performed without audit trail
- Information Disclosure: Credentials exposed in logs
- Denial of Service: Brute force login attempts
- Elevation of Privilege: Standard user gains admin access

Attack Vectors:
1. SQL injection in login form
2. XSS in user profile fields
3. Session fixation
4. Weak password policy
5. Missing rate limiting
6. No MFA option
```

**Step 2: Vulnerability Scanning**

```bash
# Dependency vulnerability scan
npm audit

# Static Application Security Testing (SAST)
semgrep --config=auto .

# Check for common vulnerabilities
# - SQL injection
# - XSS
# - CSRF
# - Insecure dependencies
# - Hardcoded secrets
```

**Step 3: Code Security Review**

```javascript
// VULNERABLE: SQL injection
function login(username, password) {
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  return db.query(query);
}

// VULNERABLE: XSS
function displayComment(comment) {
  document.getElementById('comments').innerHTML += `<p>${comment.text}</p>`;
}

// VULNERABLE: No rate limiting
app.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body.username, req.body.password);
  if (user) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
```

**Step 4: Compliance Assessment**

```
GDPR Compliance Checklist:
□ Right to access - Users can download their data
□ Right to erasure - Users can delete their account
□ Right to rectification - Users can update their data
□ Data minimization - Only collect necessary data
□ Consent management - Clear opt-in for data collection
□ Data breach notification - Process in place
□ Data Protection Officer - Designated
□ Privacy policy - Clear and accessible

OWASP Top 10 Compliance:
□ A01:2021 - Broken Access Control
□ A02:2021 - Cryptographic Failures
□ A03:2021 - Injection
□ A04:2021 - Insecure Design
□ A05:2021 - Security Misconfiguration
□ A06:2021 - Vulnerable Components
□ A07:2021 - Authentication Failures
□ A08:2021 - Software and Data Integrity Failures
□ A09:2021 - Security Logging Failures
□ A10:2021 - Server-Side Request Forgery
```

### Phase 2: Remediation

**Fix SQL Injection**

```javascript
// SECURE: Parameterized queries
function login(username, password) {
  const query = 'SELECT * FROM users WHERE username = ? AND password_hash = ?';
  const passwordHash = hashPassword(password);
  return db.query(query, [username, passwordHash]);
}
```

**Fix XSS**

```javascript
// SECURE: Proper output encoding
function displayComment(comment) {
  const p = document.createElement('p');
  p.textContent = comment.text; // Automatically escapes
  document.getElementById('comments').appendChild(p);
}

// Or with React (automatic escaping)
function Comment({ comment }) {
  return <p>{comment.text}</p>;
}
```

**Fix Session Fixation**

```javascript
// SECURE: Regenerate session ID after login
app.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body.username, req.body.password);
  if (user) {
    req.session.regenerate(err => {
      if (err) {
        return res.status(500).json({ error: 'Session error' });
      }
      req.session.userId = user.id;
      res.json({ success: true });
    });
  } else {
    res.json({ success: false });
  }
});
```

**Add Rate Limiting**

```javascript
// SECURE: Rate limiting with redis
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/login', loginLimiter, async (req, res) => {
  // Login logic
});
```

**Implement Secure Password Storage**

```javascript
const bcrypt = require('bcrypt');

// Hash password on registration
async function registerUser(username, password) {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    username,
    passwordHash,
  ]);
}

// Verify password on login
async function authenticateUser(username, password) {
  const user = await db.query('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);
  return isValid ? user : null;
}
```

**Add Multi-Factor Authentication**

```javascript
const speakeasy = require('speakeasy');

// Generate MFA secret for user
function setupMFA(userId) {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${userId})`,
  });

  // Save secret.base32 to database
  db.query('UPDATE users SET mfa_secret = ? WHERE id = ?', [secret.base32, userId]);

  // Return QR code for user to scan
  return secret.otpauth_url;
}

// Verify MFA token
function verifyMFA(userId, token) {
  const user = db.query('SELECT mfa_secret FROM users WHERE id = ?', [userId]);

  return speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: 'base32',
    token: token,
    window: 1, // Allow 1 step before/after current time
  });
}
```

### Phase 3: Validation

**Security Test Execution**

```javascript
describe('Security Tests', () => {
  describe('SQL Injection', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousUsername = "admin' OR '1'='1";
      const response = await request(app)
        .post('/login')
        .send({ username: maliciousUsername, password: 'anything' });

      expect(response.body.success).toBe(false);
    });
  });

  describe('XSS', () => {
    it('should sanitize user input in comments', async () => {
      const maliciousComment = '<script>alert("XSS")</script>';
      await request(app).post('/comments').send({ text: maliciousComment });

      const response = await request(app).get('/comments');
      expect(response.text).not.toContain('<script>');
      expect(response.text).toContain('&lt;script&gt;');
    });
  });

  describe('Rate Limiting', () => {
    it('should block after 5 failed login attempts', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({ username: 'test', password: 'wrong' });
      }

      // 6th attempt should be blocked
      const response = await request(app)
        .post('/login')
        .send({ username: 'test', password: 'wrong' });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many login attempts');
    });
  });

  describe('MFA', () => {
    it('should require valid MFA token for login', async () => {
      // Login with correct password but invalid MFA
      const response = await request(app)
        .post('/login')
        .send({ username: 'test', password: 'correct', mfaToken: '000000' });

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('MFA');
    });
  });
});
```

**Re-scan for Vulnerabilities**

```bash
# After fixes, re-run security scans
npm audit
semgrep --config=auto .

# Expected results:
# - 0 critical vulnerabilities
# - 0 high-priority issues from initial assessment
# - Only medium/low issues remaining (if any)
```

## Quality Audit

### Phase 1: Parallel Audits

**Performance Baseline (performance-engineer)**

```bash
# Run Lighthouse audit
lighthouse https://example.com --output json html

# Results:
Performance Score: 65/100
LCP: 3.2s (Needs Improvement)
INP: 180ms (Good)
CLS: 0.15 (Needs Improvement)
Bundle Size: 890KB

# Opportunities:
1. Properly size images (savings: 450KB)
2. Eliminate render-blocking resources (savings: 0.8s)
3. Reduce unused JavaScript (savings: 320KB)
4. Serve images in next-gen formats (savings: 380KB)
5. Efficiently encode images (savings: 210KB)
6. Minify JavaScript (savings: 45KB)
```

**Vulnerability Assessment (security-engineer)**

```bash
# Critical vulnerabilities
1. SQL Injection in search endpoint (CVSS: 9.8)
   Impact: Full database access

2. XSS in comment system (CVSS: 7.1)
   Impact: Session hijacking, data theft

# High-priority issues
3. Missing rate limiting on API endpoints
4. Weak password policy (min 6 chars, no complexity)
5. Session timeout not configured (sessions never expire)

# Dependency vulnerabilities
6. lodash@4.17.15 - Prototype Pollution (CVE-2020-8203)
7. axios@0.19.0 - SSRF (CVE-2021-3749)
8. express@4.16.4 - Path Traversal (CVE-2019-5413)
```

**Test Coverage Analysis (qa-tester)**

```bash
# Run coverage report
npm test -- --coverage

# Results:
Overall Coverage: 65%
Statements: 68%
Branches: 58%
Functions: 72%
Lines: 65%

# Missing coverage:
1. Error handling paths (35% covered)
2. Edge cases in auth module (40% covered)
3. API error responses (25% covered)
4. Validation logic (55% covered)

# Missing test scenarios:
1. Concurrent user actions
2. Large dataset handling (>10k items)
3. Network failure scenarios
4. Browser compatibility (only Chrome tested)
5. Mobile viewport testing
6. E2E checkout flow (no tests)
```

### Phase 2: Synthesis

**Consolidate Findings**

```markdown
## Quality Audit Summary

### Critical Issues (BLOCK LAUNCH)

1. **SQL Injection in search** - Security - CVSS 9.8
   Impact: Complete database compromise
   Effort: 4 hours

2. **XSS in comments** - Security - CVSS 7.1
   Impact: User session hijacking, data theft
   Effort: 6 hours

### High Priority (FIX BEFORE LAUNCH)

3. **LCP optimization** - Performance - 3.2s → <2.5s
   Impact: Poor user experience, SEO penalty
   Effort: 12 hours

4. **Add checkout E2E tests** - QA - 0% → 80%
   Impact: Risk of checkout bugs in production
   Effort: 8 hours

5. **Rate limiting** - Security - Missing
   Impact: Brute force attacks, DoS
   Effort: 4 hours

6. **Test coverage** - QA - 65% → 80%
   Impact: Undetected bugs
   Effort: 16 hours

### Medium Priority (POST-LAUNCH)

7. Bundle size optimization (890KB → 500KB)
8. Update vulnerable dependencies
9. Implement session timeout
10. Add error path test coverage
11. CLS improvements
12. Add mobile E2E tests
```

**Create Action Plan**

```markdown
## Sprint 1 (Critical - Week 1)

- Day 1-2: Fix SQL injection + comprehensive testing
- Day 3-4: Fix XSS + comprehensive testing
- Day 5: Security re-scan and validation

## Sprint 2 (High Priority - Week 2-3)

- Week 2: LCP optimization (images, code splitting, caching)
- Week 3 Day 1-2: Add rate limiting
- Week 3 Day 3-5: Checkout E2E tests

## Sprint 3 (Coverage - Week 4)

- Week 4: Increase test coverage to 80%

## Post-Launch Backlog

- Bundle size optimization
- Dependency updates
- Session timeout
- Mobile testing
- Additional E2E scenarios
```

## Continuous Quality Improvement

### Weekly/Sprint Cycle

**Monday: Review Quality Metrics**

```bash
# Check dashboards
# - Performance: Core Web Vitals trends (RUM data)
# - Security: New CVEs, security alerts
# - QA: Test coverage, test pass rate, defect escape rate

# Example metrics review:
Performance Trends (past 7 days):
  LCP: 2.1s → 2.4s ⚠️ (14% regression)
  INP: 180ms (stable) ✓
  CLS: 0.08 (stable) ✓

Security Alerts:
  New CVEs: 2 (lodash, react-dom)
  Severity: Medium

Quality Metrics:
  Coverage: 82% → 78% ⚠️ (regression)
  Test pass rate: 96% (stable) ✓
  Flaky tests: 3 (up from 1) ⚠️
  Defect escape rate: 4% ✓
```

**Tuesday: Identify Improvement Areas**

```markdown
## Sprint N Quality Issues

### Performance

Issue: LCP regressed from 2.1s to 2.4s
Root cause: New hero image added without optimization
Fix: Optimize hero image, add performance budget check to CI

### Security

Issue: 2 new medium-severity CVEs in dependencies
Root cause: Dependencies not updated in 3 months
Fix: Update lodash and react-dom, add automated dependency updates

### QA

Issue: Test coverage dropped from 82% to 78%
Root cause: New features added without tests
Fix: Add tests for UserProfile and Settings components

Issue: Flaky tests increased from 1 to 3
Root cause: Tests depending on external API timing
Fix: Mock external API calls in tests
```

**Wednesday-Thursday: Implement Improvements**

```bash
# Wed: Performance optimization
- Optimize hero image (WebP, responsive sizes)
- Add performance budget to CI
- Verify LCP improvement

# Thu: Security + QA improvements
- Update dependencies (npm update)
- Add tests for UserProfile and Settings
- Fix flaky tests by mocking external APIs
```

**Friday: Validate and Update Baselines**

```bash
# Run full quality check
npm run test
npm run test:e2e
npm audit
lighthouse https://example.com

# Verify improvements:
Performance:
  LCP: 2.0s ✓ (improved)
  Budget: Enforced in CI ✓

Security:
  CVEs: 0 ✓ (resolved)

Quality:
  Coverage: 85% ✓ (improved)
  Flaky tests: 0 ✓ (fixed)

# Update baselines for next sprint
```

### Monthly: Comprehensive Audit

**Month-end quality review**:

1. Full security audit (OWASP Top 10)
2. Performance audit (all pages, not just homepage)
3. Test quality review (coverage, flaky tests, execution time)
4. Dependency health check
5. Update quality targets based on trends

**Adjust processes**:

- Review what worked/didn't work
- Update quality standards if needed
- Adjust sprint allocation for quality work
- Identify tooling improvements

## Optimization Techniques

### Performance Optimization Techniques

#### Bundle Optimization

**Code Splitting by Route**

```javascript
// vite.config.js / webpack.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts', 'd3'],
          forms: ['formik', 'yup'],
        },
      },
    },
  },
};
```

**Tree Shaking**

```javascript
// package.json - enable tree shaking
{
  "sideEffects": false
}

// Import only what you need
// Bad
import _ from 'lodash';
const uniq = _.uniq;

// Good
import uniq from 'lodash/uniq';
```

**Dynamic Imports**

```javascript
// Load heavy components on demand
function UserDashboard() {
  const [showChart, setShowChart] = useState(false);
  const [ChartComponent, setChartComponent] = useState(null);

  const loadChart = async () => {
    const module = await import('./HeavyChart');
    setChartComponent(() => module.default);
    setShowChart(true);
  };

  return (
    <div>
      <button onClick={loadChart}>Show Chart</button>
      {showChart && ChartComponent && <ChartComponent />}
    </div>
  );
}
```

#### Image Optimization

**Responsive Images with srcset**

```html
<img
  srcset="image-320w.webp 320w, image-640w.webp 640w, image-1024w.webp 1024w"
  sizes="
    (max-width: 320px) 280px,
    (max-width: 640px) 600px,
    1000px
  "
  src="image-640w.webp"
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

**Next.js Image Optimization**

```javascript
import Image from 'next/image';

function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // For above-fold images
      quality={85}
    />
  );
}
```

#### Caching Strategies

**HTTP Caching Headers**

```javascript
// Express.js
app.use(
  '/static',
  express.static('public', {
    maxAge: '1y', // Cache for 1 year
    immutable: true, // File never changes
  })
);

app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.json(data);
});
```

**Service Worker Caching**

```javascript
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache static assets on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(['/', '/styles.css', '/script.js', '/logo.png']);
    })
  );
});

// Clean old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== API_CACHE).map(key => caches.delete(key))
      );
    })
  );
});
```

### Security Hardening Techniques

#### Input Validation

**Whitelist Validation**

```javascript
const validator = require('validator');

function validateUserInput(data) {
  const errors = [];

  // Email: whitelist valid email format
  if (!validator.isEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Username: whitelist alphanumeric + underscore
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
    errors.push('Username must be 3-20 alphanumeric characters or underscore');
  }

  // Age: whitelist valid integer in range
  const age = parseInt(data.age);
  if (!Number.isInteger(age) || age < 13 || age > 120) {
    errors.push('Age must be between 13 and 120');
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
```

**Output Encoding**

```javascript
// HTML encoding to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Usage in template
function renderComment(comment) {
  return `<div class="comment">${escapeHtml(comment.text)}</div>`;
}
```

#### Defense in Depth

**Content Security Policy**

```javascript
// Express middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://trusted-cdn.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://api.example.com; " +
      "frame-ancestors 'none';"
  );
  next();
});
```

**Security Headers**

```javascript
const helmet = require('helmet');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny', // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME sniffing
    xssFilter: true, // Enable XSS filter
  })
);
```

### Quality Improvement Techniques

#### Test Strategy

**Test Pyramid Implementation**

```javascript
// Unit tests (70%) - Fast, isolated, many
describe('calculateDiscount', () => {
  it('should apply 10% discount for regular members', () => {
    expect(calculateDiscount(100, 'regular')).toBe(90);
  });

  it('should apply 20% discount for premium members', () => {
    expect(calculateDiscount(100, 'premium')).toBe(80);
  });

  it('should apply 30% discount for VIP members', () => {
    expect(calculateDiscount(100, 'vip')).toBe(70);
  });
});

// Integration tests (20%) - Test component interactions
describe('UserService', () => {
  it('should create user and send welcome email', async () => {
    const user = await userService.createUser({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user.id).toBeDefined();
    expect(emailService.sent).toContainEqual(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Welcome',
      })
    );
  });
});

// E2E tests (10%) - Critical user flows
describe('Checkout Flow', () => {
  it('should complete purchase end-to-end', async () => {
    await page.goto('/products');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout"]');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.fill('[name="card"]', '4242424242424242');
    await page.click('[data-testid="submit-order"]');

    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });
});
```

#### Flaky Test Prevention

```javascript
// Bad: Timing-dependent test
test('modal should close', async () => {
  await page.click('[data-testid="open-modal"]');
  await page.click('[data-testid="close-modal"]');
  await page.waitForTimeout(500); // ❌ Flaky!
  expect(await page.isVisible('[data-testid="modal"]')).toBe(false);
});

// Good: Wait for specific condition
test('modal should close', async () => {
  await page.click('[data-testid="open-modal"]');
  await page.click('[data-testid="close-modal"]');
  await page.waitForSelector('[data-testid="modal"]', { state: 'hidden' }); // ✓
  expect(await page.isVisible('[data-testid="modal"]')).toBe(false);
});

// Bad: Test depends on external API
test('should fetch user data', async () => {
  const data = await fetchFromApi('/users/123'); // ❌ External dependency
  expect(data.name).toBe('John');
});

// Good: Mock external dependencies
test('should fetch user data', async () => {
  mockApi.get('/users/123').reply(200, { name: 'John' });
  const data = await fetchFromApi('/users/123'); // ✓ Mocked
  expect(data.name).toBe('John');
});
```

## Related Resources

- [Metrics Guide](./metrics-guide.md) - Comprehensive metrics catalog
- [Integration Points](./integration-points.md) - Tool integration details
- [Tradeoffs Guide](./tradeoffs-guide.md) - Performance vs. other concerns
- [Web Performance Working Group](https://www.w3.org/webperf/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
