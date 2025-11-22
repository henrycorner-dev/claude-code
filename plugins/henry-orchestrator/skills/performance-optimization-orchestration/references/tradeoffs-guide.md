# Tradeoffs Guide - Balancing Competing Concerns

This guide explores common tradeoffs when optimizing for performance, security, and quality.

## Table of Contents

- [Performance vs. Security](#performance-vs-security)
- [Performance vs. Maintainability](#performance-vs-maintainability)
- [Performance vs. Features](#performance-vs-features)
- [Security vs. User Experience](#security-vs-user-experience)
- [Quality vs. Velocity](#quality-vs-velocity)
- [Decision Framework](#decision-framework)

## Performance vs. Security

### Common Tradeoffs

#### 1. Caching vs. Data Freshness and Security

**Tradeoff**: Aggressive caching improves performance but can serve stale data or cached sensitive information

**Examples**:

```javascript
// High performance, potential security risk
app.get('/api/user/profile', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json(userProfile);
});

// More secure, lower performance
app.get('/api/user/profile', (req, res) => {
  res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.json(userProfile);
});

// BALANCED APPROACH
app.get('/api/user/profile', (req, res) => {
  // Cache non-sensitive parts, revalidate
  res.set('Cache-Control', 'private, max-age=300, must-revalidate');
  res.json(userProfile);
});
```

**Decision criteria**:

- Public data → Aggressive caching OK
- User-specific non-sensitive → Private caching with short TTL
- Sensitive data → No caching or very short TTL with private directive

#### 2. CDN vs. Data Privacy

**Tradeoff**: CDNs improve performance but may conflict with data residency requirements

**Balanced approach**:

- Use CDN for static assets (images, CSS, JS)
- Keep user data on origin servers in compliant regions
- Use CDN with data residency controls (e.g., AWS CloudFront with regional edge caches)
- Encrypt sensitive data even in CDN cache

#### 3. Compression vs. Resource Usage

**Tradeoff**: Compression reduces bandwidth but increases CPU usage and potential security risks (BREACH, CRIME attacks)

```javascript
// High compression (slower, more vulnerable to timing attacks)
app.use(compression({ level: 9 }));

// Moderate compression (balanced)
app.use(compression({ level: 6 }));

// BALANCED APPROACH WITH SECURITY
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress files > 1KB
    filter: (req, res) => {
      // Don't compress responses with sensitive data
      if (req.path.includes('/api/sensitive')) return false;
      return compression.filter(req, res);
    },
  })
);
```

**Mitigation**:

- Use moderate compression levels (6)
- Don't compress responses with sensitive data
- Add random padding to prevent timing attacks
- Use HTTPS to prevent CRIME attacks

#### 4. Client-Side Storage vs. Security

**Tradeoff**: localStorage/sessionStorage improves performance but less secure than server-side storage

**Decision matrix**:

```javascript
// ❌ NEVER store in localStorage
- Authentication tokens (use httpOnly cookies or memory)
- Passwords or credentials
- Personal identifiable information (PII)
- Payment card data

// ⚠️ OK with encryption
- User preferences (non-sensitive)
- Draft content
- UI state

// ✅ Safe to store
- Theme preference
- Language selection
- Non-sensitive cache

// EXAMPLE: Encrypted client-side storage
const CryptoJS = require('crypto-js');

function secureStore(key, value, secretKey) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
  localStorage.setItem(key, encrypted);
}

function secureRetrieve(key, secretKey) {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey);
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}
```

### Best Practices

**When to prioritize performance**:

- Static public content
- Non-sensitive user data
- High-traffic applications where performance directly impacts revenue

**When to prioritize security**:

- Authentication and authorization
- Payment processing
- Personal health information
- Financial data
- Any regulated data (GDPR, HIPAA, PCI-DSS)

**Balanced approach**:

1. **Classify data sensitivity**: Public, Internal, Confidential, Restricted
2. **Apply appropriate caching**: Based on sensitivity classification
3. **Measure impact**: Monitor both performance and security metrics
4. **Regular review**: Reassess tradeoffs as requirements change

## Performance vs. Maintainability

### Common Tradeoffs

#### 1. Code Optimization vs. Readability

**Tradeoff**: Highly optimized code can be harder to understand and maintain

```javascript
// Highly optimized (hard to read)
function fibonacci(n) {
  let a = 0,
    b = 1,
    c;
  if (n === 0) return a;
  for (let i = 2; i <= n; i++) {
    c = a + b;
    a = b;
    b = c;
  }
  return b;
}

// Readable (less optimized)
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// BALANCED APPROACH
function fibonacci(n, memo = {}) {
  // Readable with comments AND optimized with memoization
  if (n <= 1) return n;
  if (memo[n]) return memo[n];

  // Calculate and cache result
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}
```

**Decision criteria**:

- Optimize hot paths (10% of code that runs 90% of the time)
- Keep business logic readable
- Add comments to explain optimizations
- Use profiling to find actual bottlenecks, not premature optimization

#### 2. Custom Solutions vs. Dependencies

**Tradeoff**: Custom lightweight code reduces bundle size but increases maintenance burden

```javascript
// Custom implementation (smaller bundle, more maintenance)
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Library (larger bundle, battle-tested, maintained)
import { debounce } from 'lodash';

// BALANCED APPROACH
// Use libraries for complex functionality (date manipulation, i18n, complex algorithms)
import dayjs from 'dayjs'; // Well-maintained, small footprint

// Implement simple utilities in-house
function debounce(fn, delay) {
  /* Simple implementation with comments */
}
```

**Decision matrix**:

- **Use library**: Complex logic (crypto, date/time, i18n), security-critical, frequently updated
- **Custom implementation**: Simple utilities, project-specific logic, when bundle size critical
- **Evaluate**: Bundle size impact, maintenance burden, security implications

#### 3. Micro-optimizations vs. Code Clarity

**Tradeoff**: Small performance gains vs. code clarity

```javascript
// Micro-optimized (unclear intent)
const result = arr.reduce((a, b) => a + (b > 0 ? b : 0), 0);

// Clear (slightly slower)
const positiveNumbers = arr.filter(n => n > 0);
const sum = positiveNumbers.reduce((a, b) => a + b, 0);

// BALANCED APPROACH
// Use clear code by default, optimize when profiling shows bottleneck
const result = arr
  .filter(n => n > 0) // Clear filter step
  .reduce((a, b) => a + b, 0); // Clear sum step

// If profiling shows this is a bottleneck in production:
// 1. Add comment explaining optimization
// 2. Keep test case referencing original clear version
// 3. Then optimize
```

**Rule**: Optimize only when profiling shows it matters, and always document why

### Best Practices

**When to prioritize performance**:

- Tight loops processing large datasets
- Real-time or near-real-time processing
- Mobile applications with limited CPU/memory
- Functions called thousands of times per second

**When to prioritize maintainability**:

- Business logic that changes frequently
- Code reviewed by multiple developers
- Non-performance-critical paths
- Early-stage projects where requirements are unclear

**Balanced approach**:

1. **Write clear code first**
2. **Profile to find actual bottlenecks** (measure, don't guess)
3. **Optimize hot paths only**
4. **Document why optimizations were made**
5. **Add tests to prevent regressions**

## Performance vs. Features

### Common Tradeoffs

#### 1. Rich Interactions vs. Page Load Time

**Tradeoff**: Feature-rich applications have larger bundles and longer load times

```javascript
// Feature-rich, large bundle
import React from 'react';
import { Chart } from 'react-chartjs-2';
import { Editor } from '@tinymce/tinymce-react';
import { DatePicker } from 'antd';

function Dashboard() {
  return (
    <div>
      <Chart {...chartConfig} />
      <Editor {...editorConfig} />
      <DatePicker {...dateConfig} />
    </div>
  );
}

// BALANCED APPROACH: Code splitting and lazy loading
import React, { lazy, Suspense } from 'react';

const Chart = lazy(() => import('react-chartjs-2'));
const Editor = lazy(() => import('@tinymce/tinymce-react'));
const DatePicker = lazy(() => import('antd/lib/date-picker'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <Chart {...chartConfig} />
      </Suspense>
      <Suspense fallback={<div>Loading editor...</div>}>
        <Editor {...editorConfig} />
      </Suspense>
      <Suspense fallback={<div>Loading picker...</div>}>
        <DatePicker {...dateConfig} />
      </Suspense>
    </div>
  );
}
```

**Strategies**:

- **Code splitting**: Load features on demand
- **Progressive enhancement**: Core experience loads fast, enhancements load after
- **Feature flags**: Enable/disable features based on user tier or device capability
- **Lazy loading**: Load below-fold content after initial render

#### 2. Real-time Updates vs. Server Load

**Tradeoff**: Real-time features (WebSockets, polling) increase server load and battery usage

```javascript
// Aggressive polling (high load, real-time)
setInterval(() => fetchUpdates(), 1000); // Every second

// No updates (low load, stale data)
fetchUpdates(); // Only on page load

// BALANCED APPROACH: Adaptive polling
let pollInterval = 5000; // Start with 5 seconds

function adaptivePoll() {
  fetchUpdates().then(updates => {
    if (updates.length > 0) {
      // Activity detected, poll more frequently
      pollInterval = Math.max(1000, pollInterval / 2);
    } else {
      // No activity, poll less frequently
      pollInterval = Math.min(30000, pollInterval * 1.5);
    }

    setTimeout(adaptivePoll, pollInterval);
  });
}

// OR: Use WebSocket for active users, polling for others
if (userIsActivelyInteracting()) {
  // WebSocket for real-time updates
  const ws = new WebSocket('ws://example.com');
  ws.onmessage = handleUpdate;
} else {
  // Infrequent polling for passive users
  setInterval(fetchUpdates, 30000);
}
```

**Decision criteria**:

- Critical real-time (trading, gaming) → WebSocket
- Moderate real-time (chat, notifications) → WebSocket with fallback
- Infrequent updates (news, social feeds) → Polling or push notifications
- Non-critical (analytics) → Batch updates

#### 3. Feature Completeness vs. Load Time

**Tradeoff**: All features available immediately vs. progressive loading

**Strategies**:

```javascript
// PROGRESSIVE FEATURE LOADING

// 1. Core features (< 100KB)
import { AuthForm } from './core/AuthForm';
import { Navigation } from './core/Navigation';

// 2. Common features (load on interaction)
const SearchModal = lazy(() => import('./features/SearchModal'));
const UserProfile = lazy(() => import('./features/UserProfile'));

// 3. Advanced features (load when needed)
const AdvancedAnalytics = lazy(() => import('./features/AdvancedAnalytics'));
const AdminPanel = lazy(() => import('./features/AdminPanel'));

// 4. Optional features (load based on user tier or preference)
const PremiumFeatures = lazy(() => import('./features/PremiumFeatures'));

function App({ user }) {
  return (
    <div>
      {/* Core: Always available */}
      <Navigation />

      {/* Common: Load on interaction */}
      <Suspense fallback={null}>{showSearch && <SearchModal />}</Suspense>

      {/* Advanced: Load when user navigates */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/analytics" element={<AdvancedAnalytics />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>

      {/* Premium: Load only for premium users */}
      {user.isPremium && (
        <Suspense fallback={null}>
          <PremiumFeatures />
        </Suspense>
      )}
    </div>
  );
}
```

### Best Practices

**When to add features despite performance cost**:

- Core value proposition (feature defines the product)
- High user demand / frequent usage
- Competitive differentiation
- Accessibility requirements

**When to defer features for performance**:

- Nice-to-have enhancements
- Admin/power-user features used by small percentage
- Features with heavy dependencies
- Features used infrequently

**Balanced approach**:

1. **Define performance budget** before adding features
2. **Measure impact** of each new feature on load time
3. **Progressive loading** for non-critical features
4. **A/B test** feature vs. performance tradeoff
5. **Monitor adoption** - remove unused features

## Security vs. User Experience

### Common Tradeoffs

#### 1. Strong Authentication vs. Friction

**Tradeoff**: Multi-factor authentication is secure but adds friction

```javascript
// Maximum security (high friction)
async function login(username, password) {
  // 1. Password
  await validatePassword(username, password);
  // 2. MFA token
  await validateMFAToken(req.body.mfaToken);
  // 3. Device fingerprint
  await validateDeviceFingerprint(req.body.fingerprint);
  // 4. Security questions
  await validateSecurityAnswers(req.body.answers);
  // Session expires in 15 minutes
  return createSession({ maxAge: 15 * 60 * 1000 });
}

// Minimal security (low friction)
async function login(username, password) {
  await validatePassword(username, password);
  // Session never expires
  return createSession({ maxAge: Infinity });
}

// BALANCED APPROACH: Risk-based authentication
async function login(username, password, context) {
  // 1. Always require password
  await validatePassword(username, password);

  // 2. Risk assessment
  const riskScore = await assessRisk(context);

  // 3. Adaptive MFA
  if (riskScore > 0.7) {
    // High risk: Require MFA
    await validateMFAToken(req.body.mfaToken);
  } else if (riskScore > 0.4) {
    // Medium risk: Optional MFA, or email verification
    await sendVerificationEmail(username);
  }
  // Low risk: No additional authentication

  // 4. Adaptive session duration
  const sessionDuration = riskScore > 0.5 ? 1 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return createSession({ maxAge: sessionDuration });
}

function assessRisk(context) {
  let risk = 0;
  if (!context.isKnownDevice) risk += 0.3;
  if (!context.isKnownLocation) risk += 0.3;
  if (context.recentFailedAttempts > 2) risk += 0.2;
  if (context.isUnusualTime) risk += 0.1;
  if (context.isVPN || context.isProxy) risk += 0.1;
  return risk;
}
```

**Strategies**:

- **Device trust**: Remember trusted devices, require MFA for new devices
- **Risk-based authentication**: Increase security for suspicious activity
- **Biometric authentication**: Secure and convenient (fingerprint, Face ID)
- **Persistent sessions** for low-risk actions, re-auth for sensitive operations

#### 2. Rate Limiting vs. Legitimate Use

**Tradeoff**: Rate limiting prevents abuse but can block legitimate users

```javascript
// Aggressive rate limiting (secure, may block legitimate users)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per 15 minutes
  message: 'Too many requests',
});

// No rate limiting (user-friendly, vulnerable to abuse)
// (no middleware)

// BALANCED APPROACH: Tiered rate limiting
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Generous for public endpoints
  message: 'Too many requests, please try again later',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict for authentication
  skipSuccessfulRequests: true, // Only count failed attempts
  message: 'Too many failed login attempts, please try again in 15 minutes',
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: req => {
    // Tiered based on user plan
    if (req.user.plan === 'enterprise') return 1000;
    if (req.user.plan === 'premium') return 300;
    return 60; // Free tier
  },
  keyGenerator: req => req.user.id, // Rate limit per user, not per IP
  skip: req => req.user.isWhitelisted,
});

app.use('/api/public', publicLimiter);
app.post('/login', authLimiter);
app.use('/api', apiLimiter);
```

**Strategies**:

- **Different limits** for different endpoints (stricter for auth, generous for public)
- **User-based limits** instead of IP-based (avoids penalizing shared IPs)
- **Tiered limits** based on user plan
- **Skip successful requests** for authentication endpoints
- **Whitelist** trusted users or internal services

### Best Practices

**When to prioritize security**:

- Authentication and authorization
- Payment processing
- Admin/privileged operations
- Handling sensitive data

**When to prioritize user experience**:

- Public content browsing
- First-time user onboarding
- Low-risk operations
- Internal tools with trusted users

**Balanced approach**:

1. **Risk-based decisions**: Higher security for higher-risk operations
2. **Progressive trust**: Build trust over time (device recognition)
3. **Clear communication**: Explain security measures to users
4. **Graceful degradation**: Provide alternatives when security blocks access
5. **Monitor and adjust**: Track false positives and adjust thresholds

## Quality vs. Velocity

### Common Tradeoffs

#### 1. Test Coverage vs. Development Speed

**Tradeoff**: Comprehensive testing slows down development but prevents bugs

```javascript
// Maximum coverage (slow to develop)
describe('User Registration', () => {
  // Unit tests
  it('should validate email format', () => {/*...*/});
  it('should hash password', () => {/*...*/});
  it('should check email uniqueness', () => {/*...*/});
  it('should handle database errors', () => {/*...*/});

  // Integration tests
  it('should create user and send email', () => {/*...*/});
  it('should rollback on email send failure', () => {/*...*/});

  // E2E tests
  it('should complete registration flow', () => {/*...*/});
  it('should handle duplicate registration', () => {/*...*/});
  it('should redirect after registration', () => {/*...*/});

  // Edge cases
  it('should handle special characters in name', () => {/*...*/});
  it('should handle international email addresses', () => {/*...*/});
  // ... 20 more edge case tests
});

// Minimal testing (fast to develop, risky)
describe('User Registration', () => {
  it('should register user', () => {/*...*/});
});

// BALANCED APPROACH: Risk-based testing
describe('User Registration', () => {
  // High-value unit tests (business logic)
  it('should validate email format', () => {/*...*/});
  it('should hash password with bcrypt', () => {/*...*/});
  it('should reject weak passwords', () => {/*...*/});

  // Key integration test (critical path)
  it('should create user and send welcome email', () => {/*...*/});

  // E2E test (happy path only)
  it('should complete registration flow end-to-end', () => {/*...*/});

  // Test high-risk edge cases only
  it('should handle duplicate email registration', () => {/*...*/});
  it('should prevent SQL injection in email field', () => {/*...*/});
}
```

**Risk-based testing strategy**:

- **Critical paths**: 90%+ coverage (authentication, payment, data loss scenarios)
- **Important features**: 80% coverage (core functionality)
- **Nice-to-have features**: 60% coverage
- **Experimental features**: 40% coverage, increase if adopted

#### 2. Code Review Rigor vs. Merge Speed

**Tradeoff**: Thorough code review catches issues but slows down deployment

**Balanced approach**:

```markdown
## Tiered Code Review

### Tier 1: Auto-merge (automated checks only)

- Documentation updates
- Copy/text changes
- Configuration changes (non-security)
- **Checks**: Linting, formatting, spell check

### Tier 2: Quick review (< 30 minutes, 1 reviewer)

- Bug fixes (with tests)
- Small features (< 100 LOC)
- Refactoring with full test coverage
- **Checks**: Tests pass, coverage maintained, no security issues

### Tier 3: Standard review (1-2 hours, 2 reviewers)

- New features (100-500 LOC)
- API changes
- Database migrations
- **Checks**: Design review, tests, documentation, security

### Tier 4: Thorough review (> 2 hours, 3+ reviewers + architect)

- Major features (> 500 LOC)
- Architecture changes
- Security-critical code
- Performance-sensitive code
- **Checks**: Design review, security audit, performance testing, documentation
```

### Best Practices

**When to prioritize quality**:

- User-facing production code
- Security-critical functionality
- Data integrity operations
- Refactoring with wide impact

**When to prioritize velocity**:

- Prototypes and experiments
- Internal tools with limited users
- Time-sensitive hotfixes
- Feature flags allowing quick rollback

**Balanced approach**:

1. **Automate quality checks** (linting, formatting, security scanning)
2. **Risk-based testing** (more tests for critical paths)
3. **Feature flags** (ship fast, enable gradually)
4. **Monitoring and rollback** (ship confidently, fix quickly)
5. **Retrospectives** (learn from incidents, adjust process)

## Decision Framework

### Step 1: Classify Priority

For each decision, rank concerns by priority:

```
Priority Matrix:
P0 (Critical): Cannot compromise
P1 (Important): Prefer not to compromise
P2 (Nice-to-have): Can compromise if needed
P3 (Optional): OK to sacrifice

Example - E-commerce checkout:
- Security: P0 (PCI-DSS compliance required)
- Performance: P1 (conversion depends on speed)
- Features: P2 (basic checkout sufficient)
- Velocity: P3 (correctness > speed to market)

Example - Internal dashboard:
- Velocity: P0 (need rapid iteration)
- Features: P1 (power users want advanced features)
- Performance: P2 (acceptable if < 5s load)
- Security: P1 (internal only, but still important)
```

### Step 2: Quantify Impact

Measure the impact of each decision:

```javascript
// Example: Caching decision

Option A: Aggressive caching
- Performance: LCP 1.2s → 0.8s (33% improvement)
- Security: Risk of serving stale user data (Medium risk)
- Estimated impact: 5% conversion increase = $50k/month revenue

Option B: No caching
- Performance: LCP 1.2s (baseline)
- Security: No caching risks (Low risk)
- Estimated impact: No revenue change

Option C: Conservative caching (private, 60s TTL)
- Performance: LCP 1.2s → 1.0s (17% improvement)
- Security: Minimal risk (Low risk)
- Estimated impact: 2% conversion increase = $20k/month revenue

Decision: Option C (balanced)
Rationale: 70% of performance benefit, minimal security risk
```

### Step 3: Apply Decision Criteria

Use this decision tree:

```
1. Does it violate P0 priority?
   YES → Don't do it
   NO → Continue

2. Does it significantly improve P0 or P1 priority?
   YES → Consider it
   NO → Probably skip

3. What's the cost to P1 and P2 priorities?
   Low cost → Do it
   Medium cost → Evaluate tradeoff
   High cost → Skip or find alternative

4. Can we mitigate downsides?
   YES → Do it with mitigation
   NO → Reconsider or find alternative
```

### Step 4: Document and Review

Document all significant tradeoff decisions:

```markdown
## Decision: Use aggressive image compression

**Date**: 2024-01-15
**Context**: Homepage hero image is 2MB, contributing to slow LCP

**Options considered**:

1. Keep original (2MB, high quality)
2. Moderate compression (500KB, good quality)
3. Aggressive compression (150KB, acceptable quality)

**Decision**: Option 2 (moderate compression)

**Rationale**:

- Performance priority: P1 (LCP currently 4.2s, target <2.5s)
- Visual quality priority: P1 (hero image is key branding)
- Option 2 reduces image size 75%, improves LCP by ~1.5s
- Option 3 saves additional 350KB but quality loss unacceptable to marketing

**Tradeoffs accepted**:

- Slight quality reduction (from 100 to 85 quality score)
- Acceptable to stakeholders after A/B test showed no impact on conversion

**Review date**: 2024-04-15 (review after 3 months of data)
```

### Step 5: Monitor and Iterate

After implementing a tradeoff decision:

1. **Set up monitoring** for both sides of the tradeoff
2. **Define success criteria** (e.g., "LCP <2.5s AND no increase in support tickets about image quality")
3. **Review periodically** (monthly or quarterly)
4. **Adjust if needed** based on real-world data

## Summary

### Key Principles

1. **No absolute rules**: Every tradeoff depends on context
2. **Measure, don't guess**: Use data to inform decisions
3. **Prioritize ruthlessly**: Not everything can be P0
4. **Document decisions**: Future you will thank you
5. **Iterate continuously**: Revisit tradeoffs as requirements change

### Common Patterns

- **Performance vs. Security**: Security usually wins, but cache public data aggressively
- **Performance vs. Maintainability**: Optimize hot paths only, keep everything else readable
- **Performance vs. Features**: Progressive loading enables both
- **Security vs. UX**: Risk-based authentication balances both
- **Quality vs. Velocity**: Automate quality checks, use risk-based testing

## Related Resources

- [Optimization Framework](./optimization-framework.md) - Detailed workflows
- [Metrics Guide](./metrics-guide.md) - How to measure impact
- [Integration Points](./integration-points.md) - Tools for monitoring tradeoffs
- [OWASP Security vs. Usability](https://owasp.org/www-community/Security_by_Design_Principles)
- [Web Performance Working Group](https://www.w3.org/webperf/)
