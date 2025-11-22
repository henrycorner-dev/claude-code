---
description: Product launch preparation with DevOps, SEO, analytics, QA, security
argument-hint: Launch type (beta/prod), platform
---

# Henry Launch Preparation

You are orchestrating a comprehensive product launch preparation using the Henry Orchestrator's specialist agents. Follow a systematic approach to ensure launch readiness across all dimensions.

## Initial Context

**Launch Request:** $ARGUMENTS

## Core Principles

- **Readiness-focused**: Ensure all systems are go
- **Risk mitigation**: Identify and address blockers
- **Multi-dimensional**: Cover ops, marketing, quality, security
- **Checklist-driven**: Clear go/no-go criteria
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Launch Context & Planning

**Goal**: Understand launch scope and requirements

**Actions**:

1. Create todo list with all phases
2. Gather launch context:
   - **Launch type**: Beta, soft launch, public launch, major release?
   - **Platform**: Web, mobile (iOS/Android), desktop, API?
   - **Timeline**: Launch date and milestones
   - **Scope**: New product, major feature, or update?
   - **Audience**: Internal, limited beta, public?
   - **Scale**: Expected traffic/users
   - **Critical success factors**: What must work?
3. Review current state:
   - Code freeze status
   - Existing infrastructure
   - Current monitoring setup
   - Team readiness
4. Define launch phases:
   - Pre-launch (preparation)
   - Launch day (deployment)
   - Post-launch (monitoring)
5. Ask user to confirm:
   - Launch date and flexibility
   - Must-have vs nice-to-have features
   - Rollback criteria
   - Success metrics

**Wait for user confirmation before proceeding.**

---

## Phase 2: DevOps & Infrastructure Readiness

**Goal**: Ensure deployment and operational readiness

**Actions**:

1. Launch `devops-sre-architect` agent to:
   - **CI/CD Pipeline**:
     - Build automation verified
     - Test automation passing
     - Deployment scripts tested
     - Rollback mechanism ready
     - Quality gates configured
   - **Infrastructure**:
     - Production environment provisioned
     - Scaling configuration (horizontal/vertical)
     - Load balancer setup
     - Database migration plan
     - Secrets management verified
     - SSL/TLS certificates valid
   - **Deployment Strategy**:
     - Blue/green, canary, or rolling deployment
     - Gradual rollout plan (% of traffic)
     - Feature flags for controlled rollout
     - Rollback triggers and procedures
   - **Monitoring & Observability**:
     - Application monitoring (APM)
     - Infrastructure monitoring
     - Log aggregation configured
     - Distributed tracing setup
     - Error tracking integrated
     - Real-time dashboards
   - **Alerting**:
     - SLO-based alerts configured
     - Alert routing (PagerDuty, Slack, email)
     - Escalation policies defined
     - On-call rotation scheduled
   - **Reliability**:
     - SLOs/SLAs defined (uptime, latency, error rate)
     - Error budgets calculated
     - Incident response runbooks
     - Disaster recovery procedures
     - Backup and restore tested
   - **Capacity Planning**:
     - Load testing completed
     - Resource capacity validated
     - Auto-scaling configured
     - Database connection pooling
     - CDN configuration
   - **Security Operations**:
     - Secret rotation plan
     - Vulnerability scanning enabled
     - Security headers configured
     - DDoS protection enabled
2. Agent returns readiness report with:
   - **Go criteria**: What must be green
   - **No-go criteria**: Blocking issues
   - **Risks**: Potential issues to monitor
   - **Runbooks**: Operational procedures
3. Present DevOps readiness assessment
4. Create launch day runbook:
   - Pre-deployment checklist
   - Deployment steps
   - Verification steps
   - Rollback procedure
   - Post-deployment verification

**Wait for user confirmation before proceeding.**

---

## Phase 3: SEO & Discoverability (If Public Launch)

**Goal**: Ensure search visibility and organic discovery

**Actions**:

1. If launching public-facing pages, launch `seo-specialist` to:
   - **Technical SEO**:
     - Sitemap.xml generated and submitted
     - Robots.txt configured
     - Canonical URLs set
     - Meta robots tags correct
     - HTTPS enforced
     - Redirects mapped (301/302)
     - 404 page customized
   - **On-Page SEO**:
     - Title tags optimized (50-60 chars)
     - Meta descriptions compelling (150-160 chars)
     - H1-H6 hierarchy proper
     - Image alt text present
     - Internal linking structure
     - URL structure clean
   - **Structured Data**:
     - Schema.org markup implemented (JSON-LD)
     - Rich snippets tested
     - Appropriate schema types (Product, Article, Organization, etc.)
   - **Performance for SEO**:
     - Core Web Vitals passing (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1)
     - Mobile-friendly test passing
     - Page speed optimized
   - **Rendering**:
     - SSR/ISR for SEO-critical pages
     - JavaScript rendering verified (Google Search Console)
     - Dynamic content indexable
   - **Launch-specific**:
     - Pre-launch: robots.txt blocks crawlers
     - Launch: Remove crawl blocks
     - Submit to Google Search Console
     - Submit to Bing Webmaster Tools
     - Monitor indexing status
2. Agent returns SEO launch checklist:
   - Pre-launch setup
   - Launch day actions
   - Post-launch monitoring
   - Expected indexing timeline
3. Present SEO readiness report

---

## Phase 4: Analytics & Tracking

**Goal**: Ensure data collection from day one

**Actions**:

1. Launch `data-analytics-engineer` agent to:
   - **Event Tracking**:
     - All critical events instrumented
     - Event schema validated
     - Tracking plan documented
     - Data quality checks in place
   - **Analytics Tools**:
     - Google Analytics 4 / Mixpanel / Amplitude configured
     - Tag manager setup (GTM)
     - Conversion tracking enabled
     - Funnel tracking configured
     - Custom dimensions/metrics set
   - **Dashboards**:
     - Launch dashboard created
     - Key metrics visualized (traffic, conversions, errors)
     - Real-time monitoring enabled
     - Team access configured
   - **Privacy Compliance**:
     - Cookie consent banner (GDPR/CCPA)
     - Privacy policy updated
     - Data retention policies configured
     - PII anonymization verified
     - Opt-out mechanisms working
   - **A/B Testing** (if applicable):
     - Experimentation framework ready
     - Feature flags integrated
     - Variant tracking configured
   - **Launch Metrics**:
     - Define success metrics (DAU, conversions, revenue)
     - Set baseline and targets
     - Plan cohort analysis
2. Agent returns analytics checklist:
   - Tracking verification steps
   - Dashboard links
   - Launch day metrics to watch
   - Data quality validation
3. Present analytics readiness report
4. Test tracking in staging environment

---

## Phase 5: Quality Assurance

**Goal**: Verify functionality and catch critical bugs

**Actions**:

1. Launch `qa-tester` agent to:
   - **Test Execution**:
     - Smoke tests passing (critical paths)
     - Regression tests passing
     - Cross-browser testing (Chrome, Firefox, Safari, Edge)
     - Cross-device testing (desktop, tablet, mobile)
     - Performance tests passing
     - Load tests successful (expected traffic + 2x)
   - **Critical User Journeys**:
     - Signup/login flow
     - Core feature workflows
     - Payment flow (if applicable)
     - Checkout process (e-commerce)
     - Critical integrations
   - **Edge Cases**:
     - Error handling verified
     - Offline behavior (PWA)
     - Slow network conditions
     - Concurrent user scenarios
   - **Production Environment**:
     - Staging environment mirrors production
     - Smoke tests on production (pre-launch)
     - Synthetic monitoring configured
   - **Rollback Testing**:
     - Rollback procedure tested
     - Data migration rollback verified
   - **Pre-Launch Checklist**:
     - All critical bugs fixed
     - Known issues documented
     - Workarounds prepared
     - Support team briefed
2. Agent returns QA report:
   - Test coverage summary
   - Open bugs by severity
   - Go/no-go recommendation
   - Known issues to monitor
   - Test evidence (screenshots, videos)
3. Present QA readiness assessment
4. Get user sign-off on known issues

**Wait for user confirmation before proceeding.**

---

## Phase 6: Security Pre-Launch Review

**Goal**: Final security verification before public exposure

**Actions**:

1. Launch `security-engineer` agent to:
   - **Security Verification**:
     - No critical vulnerabilities (CVSS ≥9.0)
     - No hardcoded secrets
     - Authentication/authorization working
     - Rate limiting configured
     - HTTPS enforced
     - Security headers present (CSP, X-Frame-Options, etc.)
     - CORS configured correctly
   - **Production Security**:
     - Secrets in secret manager (not env files)
     - Production credentials rotated
     - API keys valid and scoped
     - Database access restricted
     - Admin panels secured
     - Debug mode disabled
   - **Compliance**:
     - GDPR/CCPA requirements met
     - Privacy policy published
     - Terms of service published
     - Cookie consent working
     - Data retention configured
   - **Incident Response**:
     - Security incident runbook ready
     - Security contact published (security.txt)
     - Vulnerability disclosure policy
     - Security monitoring enabled
   - **Dependency Security**:
     - No critical CVEs in dependencies
     - Dependency versions locked
     - Supply chain security verified
2. Agent returns security checklist:
   - All security gates passed
   - Any accepted risks documented
   - Security monitoring configured
   - Incident response ready
3. Present security sign-off

---

## Phase 7: Performance Validation

**Goal**: Ensure performance meets targets under load

**Actions**:

1. Launch `performance-engineer` agent to:
   - **Frontend Performance**:
     - Core Web Vitals passing:
       - LCP ≤2.5s (75th percentile)
       - INP ≤200ms (75th percentile)
       - CLS ≤0.1 (75th percentile)
     - Lighthouse score ≥90
     - Bundle size within budget
     - Critical resources optimized
   - **Backend Performance**:
     - API P95 latency <200ms
     - Database query performance acceptable
     - No N+1 queries
     - Caching effective (hit rate >70%)
   - **Load Testing**:
     - Expected load + 50% handled
     - Spike test passed
     - Soak test completed (24h under load)
     - No memory leaks
     - Auto-scaling verified
   - **Performance Monitoring**:
     - RUM (Real User Monitoring) enabled
     - Synthetic monitoring configured
     - Performance budgets enforced
     - Alerting on regressions
2. Agent returns performance report:
   - All metrics within targets
   - Bottleneck analysis
   - Capacity headroom
   - Monitoring configured
3. Present performance sign-off

---

## Phase 8: Launch Day Preparation

**Goal**: Final preparations and team readiness

**Actions**:

1. Create launch day checklist:

   - **Pre-Deployment** (T-24h):
     - [ ] Code freeze confirmed
     - [ ] All tests passing
     - [ ] Staging verified
     - [ ] Deployment plan reviewed
     - [ ] Rollback tested
     - [ ] Team briefed
     - [ ] On-call scheduled
   - **Deployment** (T-0):
     - [ ] Deployment initiated
     - [ ] Database migrations completed
     - [ ] Health checks passing
     - [ ] Smoke tests passing in production
     - [ ] Monitoring dashboards open
     - [ ] Alerts flowing
   - **Post-Deployment** (T+1h):
     - [ ] Traffic gradually increased (if canary)
     - [ ] Error rates normal
     - [ ] Performance metrics normal
     - [ ] Analytics tracking verified
     - [ ] Critical user journeys tested
     - [ ] SEO crawl unblocked (if applicable)
   - **First 24h**:
     - [ ] Monitor error rates
     - [ ] Watch performance metrics
     - [ ] Track user feedback
     - [ ] Review analytics data
     - [ ] Team postmortem scheduled

2. Team coordination:

   - Deployment owner assigned
   - Communication plan (Slack channel, status page)
   - Stakeholder notifications scheduled
   - Support team briefed
   - Escalation paths defined

3. Communication templates:
   - Launch announcement (internal)
   - Launch announcement (external/marketing)
   - Status updates during deployment
   - Rollback communication (if needed)

---

## Phase 9: Launch Readiness Review

**Goal**: Final go/no-go decision

**Actions**:

1. Consolidate all readiness assessments:

   - ✅ DevOps/Infrastructure
   - ✅ SEO (if applicable)
   - ✅ Analytics
   - ✅ QA
   - ✅ Security
   - ✅ Performance

2. Create readiness scorecard:

   ```markdown
   # Launch Readiness Scorecard

   | Dimension   | Status | Blocker | Details            |
   | ----------- | ------ | ------- | ------------------ |
   | DevOps      | 🟢     | No      | All systems ready  |
   | SEO         | 🟢     | No      | Optimized          |
   | Analytics   | 🟡     | No      | Minor tracking gap |
   | QA          | 🟢     | No      | Tests passing      |
   | Security    | 🟢     | No      | Compliant          |
   | Performance | 🟢     | No      | Metrics met        |

   **Overall Status**: 🟢 GO for launch

   **Open Issues** (non-blocking):

   - [analytics] Dashboard refresh delay (workaround: manual refresh)

   **Risk Assessment**: Low
   ```

3. Review go/no-go criteria:

   - All critical tests passing ✓
   - No critical security issues ✓
   - Performance within budget ✓
   - Monitoring configured ✓
   - Rollback tested ✓
   - Team ready ✓

4. Present final recommendation to user:
   - **GO**: Proceed with launch
   - **GO with conditions**: Launch with accepted risks
   - **NO-GO**: Critical blockers present, defer launch

---

## Phase 10: Post-Launch Monitoring Plan

**Goal**: Define success criteria and monitoring approach

**Actions**:

1. Define launch success metrics:

   - **Reliability**: Uptime >99.9%, error rate <0.1%
   - **Performance**: Core Web Vitals passing
   - **Adoption**: X signups/day, Y active users
   - **Business**: Z conversions, $W revenue
   - **User Satisfaction**: NPS, CSAT scores

2. Monitoring schedule:

   - **First hour**: Real-time monitoring (all hands)
   - **First 24h**: Hourly checks
   - **First week**: Daily reviews
   - **First month**: Weekly analytics review

3. Incident thresholds:

   - **P0** (Critical): Complete outage, data loss
   - **P1** (High): Degraded performance, high error rate
   - **P2** (Medium): Minor issues, workarounds available
   - **P3** (Low): Cosmetic, future fix

4. Post-launch rituals:
   - **T+1 day**: Launch retrospective
   - **T+1 week**: Metrics review
   - **T+1 month**: Success assessment

---

## Phase 11: Summary & Launch Handoff

**Goal**: Document launch readiness and final steps

**Actions**:

1. Mark all todos complete
2. Generate comprehensive launch summary:
   - **Readiness Status**: All systems GO/conditional GO/NO-GO
   - **DevOps**: Deployment plan, rollback procedure
   - **SEO**: Optimization status, post-launch actions
   - **Analytics**: Tracking verified, dashboard links
   - **QA**: Test results, known issues
   - **Security**: Compliance verified, monitoring enabled
   - **Performance**: Metrics met, headroom confirmed
   - **Launch Day Plan**: Timeline, checklist, team assignments
   - **Success Metrics**: How we'll measure success
   - **Risk Mitigation**: Known risks and mitigations
3. Provide launch artifacts:
   - Deployment runbook
   - Rollback procedure
   - Monitoring dashboard links
   - Launch checklist
   - Communication templates
   - Post-launch monitoring plan
4. Next steps:
   - Execute deployment (T-0)
   - Monitor metrics (T+1h to T+7d)
   - Gather feedback
   - Iterate based on data

---

## Usage Examples

**Full production launch:**

```
/henry-orchestrator:henry-launch Production launch for web app on January 15
```

**Beta launch:**

```
/henry-orchestrator:henry-launch Limited beta for mobile app, iOS and Android
```

**Feature launch:**

```
/henry-orchestrator:henry-launch Launch new payment feature to 10% of users
```

**Quick readiness check:**

```
/henry-orchestrator:henry-launch Quick go/no-go check for tomorrow's deploy
```

## Usage Tips

- **Lead time**: Run 1-2 weeks before launch for full prep
- **Iterative**: Run multiple times as launch approaches
- **Scope**: Specify platform (web/mobile/API) for relevant checks
- **Beta first**: Consider beta launch before full public launch
- **Gradual rollout**: Use canary/feature flags for risk mitigation

## Launch Types

- **Beta**: Limited audience, gather feedback
- **Soft launch**: Public but low-key, monitor before marketing
- **Public launch**: Full marketing push
- **Feature launch**: New feature in existing product
- **Major update**: Significant changes to existing product

## Critical Success Factors

- All agents give green light (or acceptable yellow)
- Rollback tested and ready
- Team confident and prepared
- Monitoring comprehensive
- Communication plan ready

---

Use TodoWrite to track progress through all launch preparation phases.
