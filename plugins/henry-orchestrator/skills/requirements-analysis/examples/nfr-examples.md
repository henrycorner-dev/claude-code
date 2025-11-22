# Non-Functional Requirements Examples

This document provides concrete examples of non-functional requirements across different categories and project types.

---

## Performance Requirements

### Example 1: E-Commerce API Performance

**Requirement ID:** PERF-ECOM-001

**Category:** API Response Time

**Description:**
All product catalog API endpoints must respond within defined latency targets to ensure smooth browsing experience.

**Specific Requirements:**

- Product search endpoint: < 150ms at p95 under normal load (1000 RPS)
- Product detail endpoint: < 100ms at p95
- Category listing endpoint: < 200ms at p95
- Cart operations (add/remove): < 150ms at p95
- Checkout initiation: < 300ms at p95

**Measurement Method:**

- Application Performance Monitoring (APM) with percentile tracking
- Load testing with realistic user scenarios
- Real User Monitoring (RUM) in production

**Acceptance Criteria:**

- [ ] Load test with 1000 concurrent users shows all endpoints meet targets
- [ ] Production monitoring shows p95 latencies within targets for 99% of 5-minute windows
- [ ] No endpoint regression beyond 10% of target under normal conditions

**Priority:** Must have

---

### Example 2: Video Streaming Platform Throughput

**Requirement ID:** PERF-VIDEO-002

**Category:** Throughput and Bandwidth

**Description:**
Video delivery infrastructure must support high concurrent viewership during peak hours without buffering.

**Specific Requirements:**

- Support 100,000 concurrent video streams during peak hours (8-11 PM)
- Video start time (initial buffering): < 2 seconds at p95
- Rebuffering ratio: < 0.5% of playback time
- Adaptive bitrate switching: < 500ms to respond to bandwidth changes
- CDN bandwidth capacity: 500 Gbps peak, 200 Gbps average

**Measurement Method:**

- CDN analytics and bandwidth monitoring
- Video quality of experience (QoE) metrics
- Synthetic monitoring from multiple geographic locations

**Acceptance Criteria:**

- [ ] Stress test with 100,000 simulated concurrent streams shows < 2s start time
- [ ] Production metrics show rebuffering ratio < 0.5% during peak hours
- [ ] 99% of users experience smooth playback (QoE score > 4.0/5.0)

**Priority:** Must have

---

### Example 3: Financial Trading System Latency

**Requirement ID:** PERF-TRADE-003

**Category:** Ultra-Low Latency

**Description:**
Order execution system must minimize latency to remain competitive in high-frequency trading environment.

**Specific Requirements:**

- Order placement to exchange: < 1ms at p99 (measured at application boundary)
- Market data processing: < 100 microseconds per message
- Risk check execution: < 500 microseconds
- Order matching engine: process 1 million orders/second
- System jitter: < 50 microseconds variance

**Measurement Method:**

- High-precision timestamping at each processing stage
- Latency histograms with microsecond granularity
- Hardware-assisted timing measurements

**Acceptance Criteria:**

- [ ] Benchmark tests show consistent sub-1ms order placement at p99
- [ ] Production latency measurements meet targets under market stress conditions
- [ ] Jitter analysis shows < 50μs variance over 24-hour periods

**Priority:** Must have

---

## Scalability Requirements

### Example 4: SaaS Application User Growth

**Requirement ID:** SCALE-SAAS-001

**Category:** Horizontal Scaling

**Description:**
Multi-tenant SaaS platform must scale to support projected customer and user growth over 3-year horizon.

**Specific Requirements:**

- **Year 1:** 1,000 customers, 50,000 total users, 10GB data per customer average
- **Year 2:** 5,000 customers, 250,000 total users, 25GB data per customer average
- **Year 3:** 20,000 customers, 1,000,000 total users, 50GB data per customer average
- Auto-scaling triggers:
  - Scale up: CPU > 70% for 3 minutes OR request queue depth > 100
  - Scale down: CPU < 30% for 10 minutes AND queue depth < 10
- Instance range: Min 5 instances, Max 100 instances per region

**Measurement Method:**

- Capacity planning based on growth projections
- Regular load testing at 150% of current scale
- Auto-scaling behavior validation in staging environment

**Acceptance Criteria:**

- [ ] Architecture review confirms design supports 3-year projections
- [ ] Load test at Year 3 scale (1M users, 50GB/customer) meets performance targets
- [ ] Auto-scaling responds within 5 minutes to load changes
- [ ] Database partitioning strategy handles data volume growth

**Priority:** Should have

---

### Example 5: IoT Platform Device Connectivity

**Requirement ID:** SCALE-IOT-002

**Category:** Massive Concurrency

**Description:**
IoT device management platform must handle millions of connected devices sending telemetry data.

**Specific Requirements:**

- Support 10 million concurrent device connections
- Ingest 500,000 messages per second sustained, 2 million MPS peak
- Device registration: 10,000 new devices per minute
- Command delivery to devices: < 5 seconds at p95
- Connection recovery: Handle 100,000 reconnections per minute during outage recovery

**Measurement Method:**

- Simulated device farm with realistic connection patterns
- Message ingestion rate monitoring
- Connection state tracking and analytics

**Acceptance Criteria:**

- [ ] Load test with 10M simulated devices maintains stable connections
- [ ] Ingestion pipeline handles 2M MPS peak without message loss
- [ ] Commands reach devices within 5 seconds under normal and peak load
- [ ] System recovers gracefully from simulated regional outage

**Priority:** Must have

---

### Example 6: Global CDN Geographic Distribution

**Requirement ID:** SCALE-CDN-003

**Category:** Geographic Scalability

**Description:**
Content delivery network must provide low-latency access to users worldwide through strategic PoP placement.

**Specific Requirements:**

- **Coverage:** 150+ Points of Presence (PoPs) across 6 continents
- **Latency targets:**
  - North America users: < 30ms to nearest PoP
  - Europe users: < 40ms to nearest PoP
  - Asia-Pacific users: < 50ms to nearest PoP
  - Other regions: < 100ms to nearest PoP
- **Cache hit ratio:** > 95% for static assets
- **Origin shield:** Reduce origin requests by 90%

**Measurement Method:**

- Synthetic monitoring from each region
- Real User Monitoring (RUM) with geographic breakdown
- CDN analytics for cache performance

**Acceptance Criteria:**

- [ ] 95% of global users experience latency within regional targets
- [ ] Cache hit ratio consistently exceeds 95%
- [ ] Origin request volume < 10% of total requests
- [ ] No single PoP serves > 20% of traffic (balanced distribution)

**Priority:** Must have

---

## Security Requirements

### Example 7: Healthcare Application HIPAA Compliance

**Requirement ID:** SEC-HEALTH-001

**Category:** Data Protection and Compliance

**Description:**
Healthcare portal handling Protected Health Information (PHI) must comply with HIPAA Security Rule requirements.

**Specific Requirements:**

**Access Controls:**

- Unique user IDs for all accounts accessing PHI
- Multi-factor authentication (MFA) required for all users
- Automatic session timeout after 15 minutes of inactivity
- Role-based access control (RBAC) with least-privilege principle
- Emergency access procedures with audit logging

**Audit Controls:**

- Log all access to PHI (who, what, when, where)
- Log all modifications to PHI with before/after values
- Log all authentication events (success and failure)
- Audit logs retained for 7 years, immutable storage
- Audit log review process: Weekly automated, Monthly manual

**Data Encryption:**

- TLS 1.3 for all data in transit
- AES-256 encryption for PHI at rest
- Field-level encryption for highly sensitive data (SSN, medical record number)
- Encryption key rotation every 90 days via AWS KMS

**Integrity Controls:**

- Digital signatures for medical records
- Checksums to detect unauthorized modifications
- Version control for all PHI documents

**Measurement Method:**

- HIPAA Security Risk Assessment (annual)
- Third-party security audit and penetration testing
- Compliance monitoring dashboards

**Acceptance Criteria:**

- [ ] Pass HIPAA Security Rule compliance assessment with zero critical findings
- [ ] Penetration testing shows no unauthorized PHI access
- [ ] Audit log analysis confirms 100% coverage of PHI access
- [ ] Encryption verified for all PHI storage and transmission

**Priority:** Must have (regulatory requirement)

---

### Example 8: Financial Services Authentication

**Requirement ID:** SEC-FIN-002

**Category:** Authentication and Authorization

**Description:**
Online banking application must implement strong authentication and fraud prevention measures.

**Specific Requirements:**

**Authentication:**

- Username/password with complexity requirements:
  - Minimum 12 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - No dictionary words or common patterns
  - Password rotation every 90 days
- Multi-factor authentication (MFA) options:
  - SMS one-time password (OTP)
  - Authenticator app (TOTP)
  - Hardware token (U2F/WebAuthn)
  - Biometric (Touch ID, Face ID on mobile)
- Adaptive authentication:
  - Step-up authentication for high-risk transactions (> $1000 transfers)
  - Device fingerprinting and recognition
  - Geolocation verification for unusual locations

**Session Management:**

- Session timeout: 10 minutes of inactivity
- Concurrent session limit: 3 sessions per user
- Secure session tokens (256-bit entropy, HTTP-only, SameSite cookies)

**Account Lockout:**

- Lock account after 5 failed login attempts within 15 minutes
- Automatic unlock after 30 minutes OR manual unlock via customer service
- CAPTCHA after 3 failed attempts

**Fraud Detection:**

- Real-time transaction monitoring for anomalies
- Velocity checks: Max 10 transactions per hour
- Alert on large transfers (> $5000) for manual review

**Measurement Method:**

- Security audit and penetration testing
- Authentication success/failure rate monitoring
- Fraud detection efficacy metrics (false positive/negative rates)

**Acceptance Criteria:**

- [ ] Penetration testing shows no authentication bypass vulnerabilities
- [ ] MFA adoption rate > 90% of active users
- [ ] Account takeover incidents: 0 per quarter
- [ ] Fraud detection system blocks > 95% of fraudulent transactions with < 1% false positive rate

**Priority:** Must have

---

### Example 9: SaaS Platform Multi-Tenancy Security

**Requirement ID:** SEC-SAAS-003

**Category:** Data Isolation and Tenant Security

**Description:**
Multi-tenant SaaS application must ensure complete data isolation between customers.

**Specific Requirements:**

**Data Isolation:**

- Database-level tenant isolation using schemas or separate databases
- All queries include tenant_id filter enforced at ORM level
- Cross-tenant data access: 0 incidents
- Automated testing of data isolation on every deployment

**API Security:**

- OAuth 2.0 for API authentication
- API rate limiting: 1000 requests/minute per tenant
- API keys rotatable by customers
- Tenant-scoped API tokens (cannot access other tenants)

**Network Isolation:**

- Virtual Private Cloud (VPC) per environment
- Network segmentation between application tiers
- Web Application Firewall (WAF) for inbound traffic filtering
- DDoS protection with automatic mitigation

**Vulnerability Management:**

- Weekly automated vulnerability scanning
- Critical vulnerabilities patched within 7 days
- High vulnerabilities patched within 30 days
- Dependency scanning in CI/CD pipeline

**Measurement Method:**

- Penetration testing focused on tenant isolation
- Automated data isolation testing in CI/CD
- Security scanning reports and remediation tracking

**Acceptance Criteria:**

- [ ] Penetration testing confirms zero cross-tenant data access
- [ ] Automated data isolation tests pass on every deployment
- [ ] All critical vulnerabilities remediated within SLA
- [ ] Rate limiting blocks abusive API usage without affecting legitimate users

**Priority:** Must have

---

## Reliability and Availability Requirements

### Example 10: E-Commerce Platform Uptime

**Requirement ID:** REL-ECOM-001

**Category:** Service Level Objective (SLO)

**Description:**
E-commerce platform must maintain high availability to minimize revenue loss from downtime.

**Specific Requirements:**

**Availability Targets:**

- Overall platform: 99.95% uptime (21.6 minutes downtime per month)
- Checkout flow: 99.99% uptime (4.3 minutes downtime per month)
- Product browsing: 99.9% uptime (43.2 minutes downtime per month)
- Admin dashboard: 99.5% uptime (3.6 hours downtime per month)

**Maintenance Windows:**

- Scheduled maintenance: Sunday 2-4 AM local time
- Zero-downtime deployments preferred
- Emergency maintenance limited to critical security or data integrity issues

**Error Budget:**

- Overall error rate: < 0.1% of all requests
- 5xx errors: < 0.05% of requests
- Timeout rate: < 0.5% of requests

**Incident Response:**

- Incident detection: < 5 minutes (automated monitoring)
- Initial response: < 15 minutes (on-call engineer engaged)
- Customer communication: < 30 minutes for user-facing outages
- Resolution target: < 2 hours for critical incidents (P0)

**Measurement Method:**

- Uptime monitoring from multiple global locations
- Synthetic transaction monitoring for checkout flow
- Real User Monitoring (RUM) for actual user experience
- Error rate tracking via APM and logs

**Acceptance Criteria:**

- [ ] Monthly uptime reports show SLO compliance
- [ ] Incident postmortems completed within 5 business days
- [ ] No critical incidents exceed 2-hour resolution target
- [ ] Customer-facing downtime < 22 minutes per month

**Priority:** Must have

---

### Example 11: Disaster Recovery for SaaS Platform

**Requirement ID:** REL-SAAS-002

**Category:** Business Continuity and Disaster Recovery

**Description:**
SaaS application must recover quickly from catastrophic failures to minimize data loss and service disruption.

**Specific Requirements:**

**Recovery Objectives:**

- Recovery Time Objective (RTO): 2 hours (maximum downtime)
- Recovery Point Objective (RPO): 15 minutes (maximum data loss)
- Mean Time to Recovery (MTTR): < 1 hour for common failure scenarios

**Backup Strategy:**

- Database backups: Every 6 hours, retained for 30 days
- Point-in-time recovery: Available for last 7 days
- File storage backups: Daily incremental, weekly full
- Configuration backups: On every change
- Backup verification: Weekly automated restore tests

**High Availability Architecture:**

- Multi-AZ deployment: All critical services in 3+ availability zones
- Database: Primary with synchronous replica in different AZ
- Load balancing: Health checks every 10 seconds, automatic failover
- Stateless application servers: Enable fast replacement

**Disaster Recovery:**

- DR environment: Warm standby in separate AWS region
- Data replication: Asynchronous replication to DR region (< 5 minute lag)
- Failover procedure: Documented runbook, quarterly DR drills
- Failover time: < 2 hours to fully operational in DR region
- Failback procedure: Documented and tested

**Measurement Method:**

- Quarterly DR drill with actual failover and failback
- Monthly backup restore verification
- RTO/RPO compliance tracking for all incidents

**Acceptance Criteria:**

- [ ] DR drill completes successfully within RTO target
- [ ] Backup restore tests successful every week
- [ ] All incidents in past 6 months met RTO/RPO targets
- [ ] Runbooks updated and validated within last quarter

**Priority:** Should have

---

### Example 12: Mobile App Offline Resilience

**Requirement ID:** REL-MOBILE-003

**Category:** Fault Tolerance and Offline Support

**Description:**
Mobile application must function gracefully when network connectivity is unreliable or absent.

**Specific Requirements:**

**Offline Functionality:**

- Core features available offline: View content, create drafts, read messages
- Local data storage: Cache last 30 days of user data
- Background sync: Automatically sync changes when connectivity restored
- Conflict resolution: Last-write-wins with user notification of conflicts

**Network Resilience:**

- Request retry logic: 3 retries with exponential backoff (1s, 2s, 4s)
- Request timeout: 10 seconds for API calls, 30 seconds for uploads
- Fallback to cached data when API unavailable
- Queue operations for later sync when offline

**User Experience:**

- Network status indicator: Clear visual indication of online/offline status
- Optimistic UI updates: Immediate feedback, background persistence
- Error messages: Clear explanation when operation requires connectivity
- Sync progress: Show user what's syncing and what failed

**Data Consistency:**

- Eventual consistency acceptable for non-critical data
- Strong consistency for financial transactions (require online)
- Conflict detection and resolution for collaborative editing

**Measurement Method:**

- Network simulation testing (slow 3G, offline, intermittent)
- User experience testing in poor connectivity scenarios
- Sync success rate monitoring

**Acceptance Criteria:**

- [ ] All core features functional offline (tested on flight mode)
- [ ] Background sync succeeds within 5 minutes of connectivity restoration
- [ ] Conflict resolution correctly handles 100% of simulated conflict scenarios
- [ ] User testing shows satisfactory experience on slow 3G (< 500 kbps)

**Priority:** Should have

---

## Usability and Accessibility Requirements

### Example 13: Web Application Accessibility

**Requirement ID:** USABILITY-WEB-001

**Category:** WCAG 2.1 Level AA Compliance

**Description:**
Public-facing web application must be accessible to users with disabilities in compliance with WCAG 2.1 Level AA.

**Specific Requirements:**

**Perceivable:**

- Text alternatives: Alt text for all images, captions for videos, text equivalents for non-text content
- Color contrast: 4.5:1 minimum for normal text, 3:1 for large text and UI components
- Resizable text: Support up to 200% zoom without loss of functionality
- Audio control: User controls to pause, stop, or adjust volume

**Operable:**

- Keyboard navigation: All functionality accessible via keyboard (no mouse required)
- Focus indicators: Visible focus indicator for all interactive elements (3:1 contrast ratio)
- No keyboard traps: Users can navigate away from any component using keyboard
- Timing adjustable: Users can extend, disable, or adjust time limits
- Seizure prevention: No content flashes more than 3 times per second

**Understandable:**

- Language identification: Page language declared, language changes marked
- Predictable navigation: Consistent navigation across pages
- Input assistance: Labels for all form fields, error identification and suggestions
- Error prevention: Confirmation for legal/financial transactions

**Robust:**

- Valid markup: HTML validated against standards
- Name, role, value: All UI components have accessible names and roles
- Status messages: Accessible status messages for screen readers

**Assistive Technology Support:**

- Screen readers: JAWS, NVDA, VoiceOver compatibility
- Voice control: Dragon NaturallySpeaking, Voice Control (macOS/iOS)
- Magnification: ZoomText, built-in OS magnifiers

**Measurement Method:**

- Automated accessibility scanning (axe, WAVE)
- Manual testing with screen readers
- Keyboard-only navigation testing
- Third-party accessibility audit

**Acceptance Criteria:**

- [ ] Automated scans show zero critical accessibility violations
- [ ] Manual screen reader testing confirms all content accessible
- [ ] All functionality achievable via keyboard alone
- [ ] Third-party audit confirms WCAG 2.1 Level AA compliance

**Priority:** Should have (Must have for government/education sectors)

---

### Example 14: Mobile App Responsive Design

**Requirement ID:** USABILITY-MOBILE-002

**Category:** Cross-Device Compatibility

**Description:**
Mobile application must provide optimal user experience across range of device sizes and orientations.

**Specific Requirements:**

**Device Support:**

- **iOS:** iPhone SE (4.7"), iPhone 13/14 (6.1"), iPhone Pro Max (6.7"), iPad (10.2"), iPad Pro (12.9")
- **Android:** Small phones (5"), Standard phones (6-6.5"), Large phones (6.7"+), Tablets (7-10")
- **Orientations:** Portrait and landscape for all devices

**Adaptive Layouts:**

- Touch targets: Minimum 44×44 points (iOS), 48×48 dp (Android)
- Font sizes: Minimum 16px for body text, respect user text size preferences
- Spacing: Adequate padding (12px minimum) between interactive elements
- Navigation: Optimized for one-handed use on phones, split-view on tablets
- Images: Responsive images with appropriate resolution for device pixel density

**Platform-Specific Design:**

- iOS: Follow Human Interface Guidelines (HIG)
- Android: Follow Material Design guidelines
- Native controls: Use platform-native UI components where appropriate

**Performance:**

- Smooth scrolling: 60 FPS minimum
- Animations: Respect reduced motion preference
- Touch responsiveness: < 100ms feedback for touch interactions

**Measurement Method:**

- Manual testing on physical devices across size range
- Automated UI testing on simulator/emulator
- User testing with diverse device ownership

**Acceptance Criteria:**

- [ ] App tested and functional on all specified device sizes
- [ ] Touch targets meet minimum size requirements (0 violations in UI review)
- [ ] Text remains readable at all user text size settings
- [ ] All interactive elements reachable in one-handed use on phones < 6"
- [ ] User testing shows 90%+ satisfaction with layout across devices

**Priority:** Must have

---

## Maintainability Requirements

### Example 15: Codebase Quality Standards

**Requirement ID:** MAINT-CODE-001

**Category:** Code Quality and Technical Debt

**Description:**
Engineering team must maintain high code quality standards to ensure long-term maintainability and velocity.

**Specific Requirements:**

**Code Coverage:**

- Unit test coverage: ≥ 80% line coverage
- Integration test coverage: All API endpoints
- Critical paths: 100% coverage (authentication, payment, data integrity)

**Code Quality Metrics:**

- Cyclomatic complexity: < 10 per function (fail build at > 15)
- Function length: < 50 lines (warning at 100)
- File length: < 500 lines (warning at 1000)
- Code duplication: < 5% duplicated code blocks

**Static Analysis:**

- Linting: Zero errors, < 10 warnings per 1000 lines
- Security scanning: Zero critical vulnerabilities
- Dependency vulnerabilities: Zero critical, < 5 high severity
- Type safety: 100% TypeScript strict mode (no `any` types in new code)

**Code Review:**

- All code reviewed by ≥ 1 other engineer before merge
- Review turnaround time: < 24 hours for normal PRs
- Automated checks must pass before review request
- Approval required from code owner for their domain

**Technical Debt:**

- Technical debt items tracked in backlog with priority
- Dedicate 20% of sprint capacity to tech debt reduction
- No "critical" technical debt issues > 30 days old
- Quarterly architecture review and debt assessment

**Measurement Method:**

- Automated code quality checks in CI/CD pipeline
- Code coverage reports on every PR
- SonarQube/CodeClimate quality gate
- Monthly code quality dashboard review

**Acceptance Criteria:**

- [ ] All builds pass quality gates (coverage, complexity, security)
- [ ] Code review compliance: 100% of merged code reviewed
- [ ] Technical debt backlog size decreasing or stable
- [ ] New code meets all quality metrics (no exceptions)

**Priority:** Should have

---

### Example 16: Deployment and Release Process

**Requirement ID:** MAINT-DEPLOY-002

**Category:** DevOps and Operational Excellence

**Description:**
Deployment pipeline must enable safe, frequent releases with fast rollback capability.

**Specific Requirements:**

**Deployment Frequency:**

- Production deployments: ≥ 5 per week (continuous deployment preferred)
- Staging deployments: Multiple per day
- Hotfix deployment: < 2 hours from code merge to production

**Deployment Strategy:**

- Zero-downtime deployments: Blue-green or rolling deployment
- Canary releases: 5% → 50% → 100% traffic with automated rollback
- Feature flags: High-risk features behind toggles
- Database migrations: Backward-compatible changes only

**Automated Testing:**

- Unit tests: Run on every commit, < 5 minutes
- Integration tests: Run on every PR, < 15 minutes
- E2E tests: Run before production deployment, < 30 minutes
- Smoke tests: Run after deployment, < 5 minutes
- Load tests: Run weekly, plus before major releases

**Rollback:**

- Automated rollback: Triggered by error rate > 1%, latency > 2x baseline
- Manual rollback: < 5 minutes to previous version
- Database rollback: Point-in-time recovery available
- Rollback testing: Practiced monthly

**Observability:**

- Deployment tracking: All deployments logged with version, commit SHA, author
- Deployment metrics: Success rate, duration, rollback rate
- Post-deployment monitoring: 30-minute enhanced monitoring after each deploy
- Deployment notifications: Slack/email to team on each deployment

**Measurement Method:**

- Deployment frequency metrics from CI/CD system
- Mean time to production from commit to deploy
- Change failure rate (% of deployments requiring hotfix/rollback)
- Mean time to recovery from failed deployment

**Acceptance Criteria:**

- [ ] Deployment frequency ≥ 5 per week sustained over quarter
- [ ] Zero-downtime verified for all production deployments
- [ ] Automated rollback triggers successfully in load testing
- [ ] Change failure rate < 15%
- [ ] Mean time to recovery < 1 hour

**Priority:** Should have

---

## Summary

These examples demonstrate how to write specific, measurable, testable non-functional requirements across key quality attributes. Effective NFRs:

1. **Include specific numeric targets** - Not "fast" but "< 200ms at p95"
2. **Define measurement methods** - How you'll verify compliance
3. **Specify acceptance criteria** - Testable conditions for success
4. **Consider multiple dimensions** - Performance, security, usability, etc.
5. **Align with business needs** - Prioritize based on user impact
6. **Are achievable but ambitious** - Stretch goals that drive excellence
7. **Account for trade-offs** - Balance competing requirements

Use these examples as templates when defining NFRs for your projects, adapting the specific metrics and targets to your context and constraints.
