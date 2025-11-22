---
description: Comprehensive project audit for security, performance, accessibility, SEO, ops
argument-hint: Audit scope (full/project/files)
allowed-tools: ["Glob", "Read", "Grep", "Bash", "Task", "TodoWrite"]
---

# Henry Project Audit

You are orchestrating a comprehensive project audit using the Henry Orchestrator's specialist agents. Follow a systematic approach across all quality dimensions.

## Initial Context

**Audit Request:** $ARGUMENTS

## Core Principles

- **Comprehensive**: Cover all quality dimensions
- **Risk-based**: Prioritize by business impact
- **Actionable**: Provide remediation roadmap
- **Measurable**: Quantify compliance and gaps
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Audit Scope Definition

**Goal**: Define what to audit and depth level

**Actions**:

1. Create todo list with all phases
2. Determine audit scope from $ARGUMENTS:
   - **Full audit**: Entire project across all dimensions
   - **Partial audit**: Specific areas (e.g., "security and performance")
   - **File-based**: Specific files or directories
   - **Pre-launch**: Readiness checklist
3. Identify applicable audit dimensions:
   - ✅ **Security**: Always applicable
   - ✅ **Performance**: Always applicable
   - 📱 **Accessibility**: If has UI/frontend
   - 🔍 **SEO**: If has public-facing pages
   - 🚀 **DevOps/SRE**: If deployed or deploying
   - 📊 **Analytics**: If tracking users/events
4. Ask user to confirm:
   - Audit dimensions to include
   - Depth (quick scan / standard / deep audit)
   - Output format (summary / detailed report / compliance checklist)
   - Priority areas of concern

**Wait for user confirmation before proceeding.**

---

## Phase 2: Security Audit

**Goal**: Identify security vulnerabilities and compliance gaps

**Actions**:

1. Launch `security-engineer` agent to:
   - **Threat Modeling**:
     - STRIDE analysis (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation)
     - Attack surface mapping
     - Threat actor profiling
   - **OWASP Top 10 Assessment**:
     - A01: Broken Access Control
     - A02: Cryptographic Failures
     - A03: Injection
     - A04: Insecure Design
     - A05: Security Misconfiguration
     - A06: Vulnerable and Outdated Components
     - A07: Identification and Authentication Failures
     - A08: Software and Data Integrity Failures
     - A09: Security Logging and Monitoring Failures
     - A10: Server-Side Request Forgery (SSRF)
   - **Code Security**:
     - Secrets scanning (API keys, tokens, passwords)
     - Cryptography review (algorithms, key management)
     - Input validation and sanitization
     - Output encoding
     - SQL injection vectors
     - XSS vulnerabilities
     - CSRF protection
   - **Dependencies**:
     - Vulnerable package scan (npm audit, pip-audit, etc.)
     - CVE tracking
     - License compliance
     - Supply chain security
   - **Privacy & Compliance**:
     - GDPR compliance (consent, right to erasure, data portability)
     - CCPA compliance
     - PII handling and encryption
     - Data retention policies
     - Cookie consent
   - **Infrastructure Security**:
     - Secrets management
     - Network security
     - Access controls (RBAC/ABAC)
     - Least privilege principle
2. Agent returns audit report with:
   - **Critical** (CVSS 9.0-10.0): Immediate action required
   - **High** (CVSS 7.0-8.9): Fix within days
   - **Medium** (CVSS 4.0-6.9): Fix within weeks
   - **Low** (CVSS 0.1-3.9): Fix when feasible
   - CVE/CWE references
   - Remediation steps with code examples
   - Compliance gaps
3. Present security audit summary with risk matrix

---

## Phase 3: Performance Audit

**Goal**: Identify performance bottlenecks and optimization opportunities

**Actions**:

1. Launch `performance-engineer` agent to:
   - **Frontend Performance** (if applicable):
     - Core Web Vitals assessment:
       - LCP (Largest Contentful Paint): Target ≤2.5s
       - INP (Interaction to Next Paint): Target ≤200ms
       - CLS (Cumulative Layout Shift): Target ≤0.1
     - Bundle analysis:
       - Total bundle size
       - Vendor vs application code ratio
       - Unused code (tree shaking opportunities)
       - Code splitting effectiveness
     - Resource optimization:
       - Image formats (WebP/AVIF adoption)
       - Lazy loading implementation
       - Critical CSS extraction
       - Font loading strategy
     - Render performance:
       - JavaScript execution time
       - Render-blocking resources
       - Long tasks (>50ms)
       - Layout thrashing
   - **Backend Performance** (if applicable):
     - API response times (P50, P95, P99)
     - Database query performance:
       - N+1 query detection
       - Missing indexes
       - Slow queries
       - Connection pooling
     - Caching:
       - Cache hit rates
       - Cache strategy appropriateness
       - CDN utilization
     - Scalability:
       - Bottleneck identification
       - Horizontal scaling readiness
       - Resource utilization
   - **Performance Budgets**:
     - Define or validate budgets
     - Budget compliance status
     - Regression tracking
   - **Monitoring**:
     - RUM (Real User Monitoring) setup
     - Performance metrics collection
     - Alerting thresholds
2. Agent returns performance report with:
   - Current metrics vs targets
   - Optimization priorities by impact
   - Performance budget recommendations
   - Implementation effort estimates
   - Expected improvements
3. Present performance audit summary with metrics dashboard

---

## Phase 4: Accessibility Audit (If UI Present)

**Goal**: Ensure WCAG 2.1/2.2 AA compliance and inclusive design

**Actions**:

1. Launch `a11y-specialist` agent to:
   - **WCAG 2.1 Level AA Audit**:
     - Perceivable:
       - Text alternatives for images (1.1.1)
       - Captions for audio/video (1.2)
       - Adaptable content (1.3)
       - Color contrast (1.4.3: 4.5:1 normal, 3:1 large)
       - Resize text up to 200% (1.4.4)
     - Operable:
       - Keyboard accessibility (2.1)
       - No keyboard traps (2.1.2)
       - Skip links (2.4.1)
       - Descriptive page titles (2.4.2)
       - Focus visible (2.4.7)
       - Focus order (2.4.3)
     - Understandable:
       - Language of page (3.1.1)
       - Consistent navigation (3.2.3)
       - Input labels (3.3.2)
       - Error identification (3.3.1)
     - Robust:
       - Valid HTML (4.1.1)
       - Name, role, value (4.1.2)
   - **Screen Reader Testing**:
     - NVDA (Windows)
     - JAWS (Windows)
     - VoiceOver (macOS/iOS)
     - TalkBack (Android)
   - **ARIA Implementation**:
     - Appropriate ARIA roles
     - ARIA labels and descriptions
     - Live regions
     - ARIA states and properties
   - **Keyboard Navigation**:
     - Tab order
     - Focus management
     - Skip links
     - Keyboard shortcuts
   - **Forms & Interactive Elements**:
     - Label associations
     - Error messages
     - Required field indicators
     - Autocomplete attributes
   - **Mobile Accessibility**:
     - Touch target size (44x44px minimum)
     - Orientation support
     - Motion and animation
2. Agent returns accessibility report with:
   - Conformance level (A, AA, AAA)
   - Issues by severity and WCAG criterion
   - Screen reader experience summary
   - Remediation guide with code examples
   - Testing approach recommendations
3. Present accessibility audit summary with compliance status

---

## Phase 5: SEO Audit (If Public Pages Present)

**Goal**: Ensure search visibility and discoverability

**Actions**:

1. Launch `seo-specialist` agent to:
   - **Technical SEO**:
     - Crawlability (robots.txt, sitemap.xml)
     - Indexability (meta robots, canonical tags)
     - Site structure and URL architecture
     - Page speed (Core Web Vitals)
     - Mobile-friendliness
     - HTTPS implementation
     - Structured data (Schema.org JSON-LD)
   - **On-Page SEO**:
     - Title tags (50-60 characters, unique)
     - Meta descriptions (150-160 characters)
     - Heading hierarchy (H1-H6)
     - Image alt text
     - Internal linking
     - Content quality and length
   - **Rendering**:
     - SSR/ISR vs CSR for SEO
     - JavaScript rendering issues
     - Dynamic content indexability
   - **International SEO** (if applicable):
     - Hreflang implementation
     - Language targeting
     - Geographic targeting
   - **Content Strategy**:
     - Keyword targeting
     - Search intent alignment
     - E-E-A-T signals (Experience, Expertise, Authoritativeness, Trust)
   - **Competitive Analysis**:
     - Ranking opportunities
     - Content gaps
     - Backlink profile
2. Agent returns SEO report with:
   - Technical issues prioritized
   - On-page optimization opportunities
   - Content recommendations
   - Implementation roadmap
3. Present SEO audit summary with visibility score

---

## Phase 6: DevOps & Reliability Audit

**Goal**: Assess deployment, monitoring, and operational readiness

**Actions**:

1. Launch `devops-sre-architect` agent to:
   - **CI/CD Pipeline**:
     - Build automation
     - Test automation integration
     - Deployment automation
     - Rollback mechanisms
     - Quality gates
   - **Infrastructure**:
     - Infrastructure as Code (IaC) maturity
     - Configuration management
     - Secrets management
     - Scalability architecture
     - Cost optimization
   - **Observability**:
     - Logging (structured, centralized)
     - Metrics (RED/USE method)
     - Tracing (distributed tracing)
     - Dashboards
     - Alerting (SLO-based)
   - **Reliability**:
     - SLOs/SLAs definition
     - Error budgets
     - Incident response procedures
     - Disaster recovery
     - Backup and restore
   - **Security Operations**:
     - Secrets rotation
     - Certificate management
     - Vulnerability patching process
     - Security scanning in CI/CD
   - **DORA Metrics**:
     - Deployment frequency
     - Lead time for changes
     - Time to restore service
     - Change failure rate
2. Agent returns DevOps report with:
   - Maturity assessment (Initial, Managed, Defined, Measured, Optimized)
   - Critical gaps
   - Reliability risks
   - Automation opportunities
   - Runbook completeness
3. Present DevOps audit summary with maturity score

---

## Phase 7: Analytics & Data Quality Audit (Optional)

**Goal**: Assess data collection, quality, and usage

**Actions**:

1. If analytics are implemented, launch `data-analytics-engineer` to:
   - **Tracking Implementation**:
     - Event tracking completeness
     - Data quality (validation, consistency)
     - Schema adherence
     - Privacy compliance (consent, anonymization)
   - **Metrics & KPIs**:
     - Metric definitions clarity
     - North Star metric alignment
     - Dashboard availability
     - Data freshness
   - **Data Governance**:
     - PII handling
     - Data retention policies
     - Access controls
     - Audit trails
   - **Analytics Infrastructure**:
     - Data pipeline reliability
     - Data warehouse/lake architecture
     - Query performance
     - Cost efficiency
2. Agent returns analytics report with:
   - Data quality score
   - Tracking gaps
   - Compliance issues
   - Optimization opportunities
3. Present analytics audit summary

---

## Phase 8: Synthesis & Risk Prioritization

**Goal**: Consolidate findings and create remediation roadmap

**Actions**:

1. Aggregate all audit findings:
   - Security vulnerabilities
   - Performance issues
   - Accessibility violations
   - SEO gaps
   - DevOps/reliability risks
   - Analytics issues
2. Create risk matrix:

   ```
   Impact/Likelihood Matrix:

   High Impact │ 🔴 Critical     │ 🟠 High Priority
   Medium Impact│ 🟡 Medium      │ 🟢 Low Priority
   Low Impact   │ 🟢 Low         │ ⚪ Nice to Have
                └────────────────┴─────────────────
                  High Likelihood   Low Likelihood
   ```

3. Prioritize issues by:
   - Business impact (revenue, reputation, compliance)
   - Technical risk (security, data loss, downtime)
   - User impact (accessibility, performance, UX)
   - Effort to fix (quick wins vs major projects)
4. Create remediation roadmap:
   - **Immediate** (0-2 weeks): Critical security, compliance blockers
   - **Short-term** (1-3 months): High priority, quick wins
   - **Medium-term** (3-6 months): Important improvements
   - **Long-term** (6-12 months): Strategic enhancements
5. Calculate compliance scores:
   - Security: X% compliant with OWASP
   - Performance: X% meeting Core Web Vitals
   - Accessibility: WCAG X.X Level XX (% conformance)
   - SEO: X/100 technical score
   - DevOps: Level X maturity

---

## Phase 9: Audit Report & Recommendations

**Goal**: Deliver comprehensive audit report

**Actions**:

1. Generate executive summary:

   ```markdown
   # Project Audit Executive Summary

   ## Overall Health Score: X/100

   | Dimension     | Score | Status |
   | ------------- | ----- | ------ |
   | Security      | X/100 | 🔴🟡🟢 |
   | Performance   | X/100 | 🔴🟡🟢 |
   | Accessibility | X/100 | 🔴🟡🟢 |
   | SEO           | X/100 | 🔴🟡🟢 |
   | DevOps        | X/100 | 🔴🟡🟢 |

   ## Critical Findings (X)

   - [security] Critical vulnerability description
   - [performance] Major bottleneck description

   ## Recommendations

   1. Immediate: Fix critical security issues
   2. Short-term: Address performance bottlenecks
   3. Medium-term: Achieve WCAG AA compliance
   ```

2. Detailed findings report:

   - Each dimension with full agent output
   - Issues categorized by severity
   - Remediation steps
   - Code examples
   - Timeline estimates
   - Cost/effort estimates

3. Compliance checklist:

   - OWASP Top 10 checklist
   - WCAG 2.1 AA checklist
   - Performance budget checklist
   - SEO best practices checklist
   - DevOps maturity checklist

4. Remediation roadmap:
   - Phased action plan
   - Dependencies and sequencing
   - Resource requirements
   - Success metrics

---

## Phase 10: Next Steps & Follow-up

**Goal**: Define action plan and ongoing monitoring

**Actions**:

1. Ask user for priorities:
   - Which dimension to tackle first?
   - Fix critical issues now?
   - Create tracking issues?
   - Schedule follow-up audit?
2. Provide recommendations:
   - Suggested fix order
   - Quick wins to start with
   - Long-term improvement plan
   - Ongoing monitoring setup
3. Offer follow-up support:
   - Implement fixes (switch to code mode)
   - Deep dive on specific findings
   - Create issue tickets
   - Schedule re-audit after fixes

---

## Usage Examples

**Full project audit:**

```
/henry-orchestrator:henry-audit Full audit before production launch
```

**Security and performance only:**

```
/henry-orchestrator:henry-audit Security and performance audit
```

**Accessibility compliance check:**

```
/henry-orchestrator:henry-audit WCAG 2.1 AA accessibility audit
```

**Pre-deployment readiness:**

```
/henry-orchestrator:henry-audit Pre-launch readiness check
```

**Specific directories:**

```
/henry-orchestrator:henry-audit Audit src/auth and src/api directories
```

## Usage Tips

- **Pre-launch**: Run full audit before major releases
- **Regular cadence**: Quarterly or bi-annual audits
- **Focus areas**: Specify dimensions if time-constrained
- **Depth level**: "Quick scan" for fast feedback, "Deep audit" for comprehensive
- **Follow-up**: Re-run after fixes to verify remediation

## Audit Depth Levels

- **Quick Scan** (30-60 min): Automated tools + surface-level review
- **Standard Audit** (2-4 hours): Thorough review across all dimensions
- **Deep Audit** (1-2 days): Comprehensive analysis with manual testing

## Notes

- All agents run in parallel by default for speed
- Findings include specific file:line references
- Remediation includes code examples and effort estimates
- Compliance scores are quantitative and trackable
- Follow-up audits measure improvement

---

Use TodoWrite to track progress through all audit phases.
