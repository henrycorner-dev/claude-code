---
name: performance-optimization-orchestration
description: Guide for orchestrating performance, security, and QA agents (performance-engineer, security-engineer, qa-tester) for optimization and quality improvement workflows. Use when optimizing application performance, conducting quality audits, or coordinating quality-focused agent teams for systematic improvements. Trigger phrases include "optimize performance", "improve Core Web Vitals", "reduce latency", "performance audit", "quality audit", "security hardening", "fix vulnerabilities", "improve test coverage", "performance baseline", "speed up app", "bundle size optimization", "security review", "pre-launch audit", or "quality improvement".
version: '1.0.0'
allowed-tools: use_mcp_tool
---

# Performance & Optimization Orchestration

This skill guides you in orchestrating Henry Orchestrator's quality and performance agents—performance-engineer, security-engineer, and qa-tester—for optimization workflows, quality audits, and systematic improvements.

## Overview

Quality-focused agents work together to ensure production-ready applications:

- **performance-engineer**: Core Web Vitals, bundle optimization, caching, profiling
- **security-engineer**: Vulnerability assessment, threat modeling, secure code review
- **qa-tester**: Test strategy, automation, quality metrics, regression prevention

These agents collaborate on performance optimization sprints, pre-launch quality audits, security hardening initiatives, and continuous quality improvement.

## When to Use This Skill

Use this skill when you need to:

- **Optimize application performance** - Improve Core Web Vitals, reduce bundle size, optimize images
- **Conduct quality audits** - Comprehensive assessment across performance, security, and testing
- **Fix security vulnerabilities** - Identify and remediate security issues systematically
- **Improve test coverage** - Develop test strategies and implement automation
- **Prepare for production launch** - Ensure application meets quality standards
- **Coordinate quality-focused teams** - Orchestrate multiple specialist agents effectively

## Agent Capabilities Quick Reference

### performance-engineer

**Focus**: Core Web Vitals (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1), bundle optimization, caching strategies, performance budgets

**Deliverables**: Performance baselines, optimization recommendations, before/after benchmarks, budget definitions

### security-engineer

**Focus**: Threat modeling, OWASP Top 10, vulnerability scanning, compliance (GDPR/CCPA), secure code review

**Deliverables**: Threat models, vulnerability reports with CVSS scores, security test cases, remediation guidance

### qa-tester

**Focus**: Test strategy (70% unit, 20% integration, 10% E2E), automation frameworks, quality metrics, CI/CD integration

**Deliverables**: Test strategies, automated test suites, bug reports, quality metrics, coverage reports

## Core Orchestration Patterns

### Pattern 1: Performance Optimization Sprint

**Goal**: Improve application performance to meet targets

**Workflow**:

```
Phase 1: Baseline (performance-engineer)
├─ Measure current Core Web Vitals
├─ Identify bottlenecks
└─ Set optimization targets

Phase 2: Implementation (frontend-engineer + backend-engineer + performance-engineer)
├─ Code splitting and lazy loading
├─ Image optimization
├─ API optimization
└─ Caching implementation

Phase 3: Verification (performance-engineer + qa-tester)
├─ Measure improvements
├─ Validate targets met
└─ Ensure no regressions
```

**Command**: `/henry-orchestrator:henry-optimize {target}`

**Success metrics**: All Core Web Vitals in "Good" range, no functionality regressions, performance budget enforced

See [references/optimization-framework.md](references/optimization-framework.md) for detailed workflow and [examples/web-app-optimization.md](examples/web-app-optimization.md) for a complete example.

### Pattern 2: Security Hardening

**Goal**: Improve security posture and fix vulnerabilities

**Workflow**:

```
Phase 1: Assessment (security-engineer)
├─ Threat modeling
├─ Vulnerability scanning
└─ Compliance assessment

Phase 2: Remediation (backend-engineer/frontend-engineer + security-engineer)
├─ Fix critical vulnerabilities
├─ Implement security hardening
└─ Update dependencies

Phase 3: Validation (qa-tester + security-engineer)
├─ Security test execution
├─ Re-scan for vulnerabilities
└─ Verify compliance
```

**Command**: `/henry-orchestrator:henry-team security-engineer backend-engineer qa-tester - {description}`

**Success metrics**: 0 critical vulnerabilities, OWASP Top 10 compliance, security tests in CI/CD

See [references/optimization-framework.md](references/optimization-framework.md) for detailed security workflow.

### Pattern 3: Quality Audit

**Goal**: Comprehensive quality assessment across dimensions

**Workflow**:

```
Phase 1: Parallel Audits
├─ performance-engineer: Performance baseline
├─ security-engineer: Vulnerability assessment
└─ qa-tester: Test coverage analysis

Phase 2: Synthesis
├─ Consolidate findings
├─ Prioritize by severity
└─ Create action plan

Phase 3: Remediation
├─ Fix critical issues
└─ Track progress
```

**Command**: `/henry-orchestrator:henry-audit {description}`

**Success metrics**: 0 critical issues, all high-priority issues resolved, launch criteria met

See [references/optimization-framework.md](references/optimization-framework.md) for detailed audit workflow.

### Pattern 4: Continuous Quality Improvement

**Goal**: Ongoing quality monitoring and improvement

**Cycle**: Weekly/sprint review of quality metrics → identify improvements → implement → validate → update baselines

**Command**: `/henry-orchestrator:henry-team performance-engineer qa-tester security-engineer - Sprint quality review`

**Success metrics**: Performance trends improving, security posture maintained, coverage targets met

See [references/optimization-framework.md](references/optimization-framework.md) for detailed continuous improvement workflow.

## Key Optimization Techniques

### Performance

- **Bundle**: Code splitting, tree shaking, lazy loading, vendor chunk separation
- **Images**: WebP/AVIF conversion, responsive images, lazy loading, proper sizing
- **Caching**: HTTP caching, Service Worker, CDN, API response caching
- **JavaScript**: Minification, async/defer, remove unused polyfills, reduce main thread blocking

See [references/optimization-framework.md](references/optimization-framework.md) for comprehensive technique details.

### Security

- **Input Validation**: Server-side validation, whitelist approach, parameterized queries, output encoding
- **Auth/AuthZ**: Strong passwords, MFA, session management, rate limiting, secure password storage
- **Defense in Depth**: CSP, HTTPS/HSTS, secure cookies, CORS, security headers
- **Dependencies**: Regular updates, vulnerability scanning, lock files, SBOM

See [references/optimization-framework.md](references/optimization-framework.md) for comprehensive security techniques.

### Quality

- **Test Strategy**: Test pyramid (70/20/10), high-value tests, fast feedback, flaky test elimination
- **Automation**: Unit tests for logic, integration for APIs, E2E for critical flows
- **Metrics**: Code coverage (≥80%), defect escape rate (<5%), MTTR, test pass rate (≥95%)

See [references/optimization-framework.md](references/optimization-framework.md) for comprehensive quality techniques.

## Critical Metrics

### Performance Metrics

- **Core Web Vitals**: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1
- **Additional**: TTFB ≤600ms, FCP ≤1.8s, Speed Index ≤3.4s, Bundle Size (set budgets), Cache Hit Rate ≥80%

### Security Metrics

- **Vulnerabilities**: Critical = 0 (always), High < 5 (trending down)
- **Remediation**: Critical <24h, High <7 days
- **Testing**: Security test coverage ≥80% of auth/sensitive flows, Pen test quarterly, Vuln scan weekly

### Quality Metrics

- **Tests**: Coverage ≥80%, Pass rate ≥95%, Flaky rate <2%, Execution time <10min
- **Defects**: Escape rate <5%, MTTR <24h for critical, Bug backlog age <30 days average

See [references/metrics-guide.md](references/metrics-guide.md) for comprehensive metrics catalog.

## Integration with Browser Testing

When performance optimization requires browser testing, use the MCP Playwright tool:

**Performance testing**:

```javascript
// Navigate and measure Core Web Vitals
use_mcp_tool(playwright, browser_navigate, { url: 'https://example.com' });
use_mcp_tool(playwright, browser_evaluate, {
  function: `() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries.find(e => e.entryType === 'largest-contentful-paint');
        resolve({lcp: lcp?.renderTime || lcp?.loadTime});
      }).observe({entryTypes: ['largest-contentful-paint']});
    });
  }`,
});
```

**Visual regression**:

```javascript
// Before/after screenshots
use_mcp_tool(playwright, browser_take_screenshot, { filename: 'baseline.png', fullPage: true });
// ... make changes ...
use_mcp_tool(playwright, browser_take_screenshot, { filename: 'optimized.png', fullPage: true });
```

## Best Practices

### DO:

✅ Set clear targets before starting (e.g., "LCP < 2.5s")
✅ Measure baselines to track improvement
✅ Prioritize by impact - fix critical issues first
✅ Automate checks in CI/CD (performance budgets, security scans, test coverage)
✅ Prevent regressions with automated tests
✅ Track trends over time, not just point-in-time snapshots
✅ Document decisions and trade-offs

### DON'T:

❌ Optimize prematurely - profile first, then optimize based on data
❌ Sacrifice security for performance - security is non-negotiable
❌ Skip validation - verify optimizations didn't break functionality
❌ Ignore user impact - focus on user-facing metrics (Core Web Vitals vs. synthetic benchmarks)
❌ Create technical debt with quick fixes
❌ Work in isolation - quality agents should collaborate

## Common Anti-Patterns

### ❌ Optimizing Without Measuring

**Problem**: Making optimizations without baseline metrics
**Fix**: Always baseline first → identify bottlenecks → optimize → measure improvement

### ❌ Security as Afterthought

**Problem**: Adding security review at the end
**Fix**: Threat model → Secure development → Continuous security testing

### ❌ Testing Only Happy Paths

**Problem**: Only testing expected behavior
**Fix**: Test edge cases, error scenarios, boundary conditions

### ❌ Ignoring Real User Metrics

**Problem**: Only using synthetic testing (Lighthouse)
**Fix**: Combine Lighthouse (development) + RUM (production) + User feedback

See [references/tradeoffs-guide.md](references/tradeoffs-guide.md) for detailed anti-pattern analysis.

## Integration with Henry Commands

Quality orchestration works with Henry commands:

- `/henry-orchestrator:henry-optimize` - Performance optimization workflow (uses performance-engineer + engineering agents)
- `/henry-orchestrator:henry-audit` - Comprehensive quality audit (uses security, performance, a11y, SEO, ops)
- `/henry-orchestrator:henry-review` - Code review (uses qa-tester, security-engineer, performance-engineer)
- `/henry-orchestrator:henry-team` - Custom quality teams (flexible agent combinations)

## Quick Reference

| Goal                     | Agents                                                    | Command                      | Focus                      |
| ------------------------ | --------------------------------------------------------- | ---------------------------- | -------------------------- |
| Performance optimization | performance-engineer, frontend-engineer, backend-engineer | henry-optimize               | Core Web Vitals            |
| Security hardening       | security-engineer, backend-engineer, qa-tester            | henry-team                   | Vulnerabilities, hardening |
| Quality audit            | performance-engineer, security-engineer, qa-tester        | henry-audit                  | Comprehensive health       |
| Test improvement         | qa-tester, frontend-engineer, backend-engineer            | henry-team                   | Coverage, automation       |
| Pre-launch check         | All quality agents                                        | henry-audit + henry-optimize | Production readiness       |

## Further Reading

- **Detailed workflows**: [references/optimization-framework.md](references/optimization-framework.md)
- **Comprehensive metrics**: [references/metrics-guide.md](references/metrics-guide.md)
- **Tool integration**: [references/integration-points.md](references/integration-points.md)
- **Performance vs. other concerns**: [references/tradeoffs-guide.md](references/tradeoffs-guide.md)
- **Web app optimization example**: [examples/web-app-optimization.md](examples/web-app-optimization.md)
- **Database optimization example**: [examples/database-optimization.md](examples/database-optimization.md)

For optimization workflows, metrics tracking, and quality improvement strategies, reference the guides above or consult the relevant agents directly.
