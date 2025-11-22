# Team Assembly Patterns Reference

This reference provides detailed team composition patterns for common project types and workflows. Each pattern includes team composition, coordination strategy, typical deliverables, and when to use it.

## Review Team Patterns

### Pattern: Security + Backend Review (2 agents)

**Command:**

```
/henry-orchestrator:henry-team security-engineer backend-engineer - Review [component]
```

**Team Composition:**

- `security-engineer`: Threat modeling, vulnerability assessment, OWASP compliance
- `backend-engineer`: Code quality, architecture, best practices

**Coordination**: Parallel execution, synthesized findings

**Typical Deliverables:**

- Security audit report with STRIDE/OWASP analysis
- Code review with refactoring recommendations
- Prioritized remediation plan

**When to Use:**

- Security-critical backend code
- API endpoint reviews
- Authentication/authorization systems
- Data handling and storage code

**Expected Duration:** 2-4 hours

**Success Indicators:**

- Zero high/critical security vulnerabilities
- Code maintainability > 80%
- Clear remediation priorities

---

### Pattern: QA + Performance Review (2 agents)

**Command:**

```
/henry-orchestrator:henry-team qa-tester performance-engineer - Review [flow/feature]
```

**Team Composition:**

- `qa-tester`: Test coverage, edge cases, functionality validation
- `performance-engineer`: Performance profiling, optimization, benchmarking

**Coordination**: Parallel execution with shared test environment

**Typical Deliverables:**

- Test coverage analysis
- Performance baseline and bottleneck identification
- Combined test + performance optimization plan

**When to Use:**

- User-facing flows (checkout, signup, etc.)
- Features with performance requirements
- Before performance-critical releases
- Complex user interactions

**Expected Duration:** 2-3 hours

**Success Indicators:**

- Test coverage > 80%
- Core Web Vitals in green range
- All user flows validated

---

### Pattern: Comprehensive Review (3-4 agents)

**Command:**

```
/henry-orchestrator:henry-team security-engineer qa-tester performance-engineer [+ backend-engineer/frontend-engineer] - Complete review of [feature]
```

**Team Composition:**

- `security-engineer`: Security audit
- `qa-tester`: Test strategy
- `performance-engineer`: Performance optimization
- Optional: Relevant implementation engineer for code quality

**Coordination**: Parallel review, comprehensive synthesis

**Typical Deliverables:**

- Multi-dimensional audit report
- Integrated remediation plan
- Quality scorecard across all dimensions

**When to Use:**

- Critical features (payment, auth, data processing)
- Pre-production launch checklist
- Major feature releases
- Compliance requirements

**Expected Duration:** 4-6 hours

**Success Indicators:**

- Zero security issues
- Test coverage > 90%
- Performance targets met
- Code quality standards satisfied

## Design Team Patterns

### Pattern: Research + UX Design (2 agents)

**Command:**

```
/henry-orchestrator:henry-team ux-researcher ux-ui-designer - Design [feature/flow]
```

**Team Composition:**

- `ux-researcher`: User research, personas, journey mapping
- `ux-ui-designer`: Wireframes, prototypes, user flows

**Coordination**: Sequential (research → design)

**Typical Deliverables:**

- User research insights and personas
- Journey maps
- Wireframes and prototypes
- Design specifications

**When to Use:**

- New features without existing patterns
- User-facing flows needing research validation
- When user needs are unclear
- Product discovery phase

**Expected Duration:** 4-8 hours (research intensive)

**Success Indicators:**

- Research-validated design decisions
- Clear user flows
- Testable prototypes

---

### Pattern: Complete Design Workflow (4 agents)

**Command:**

```
/henry-orchestrator:henry-team ux-researcher ux-ui-designer ui-visual-designer a11y-specialist - Full design for [feature]
```

**Team Composition:**

- `ux-researcher`: User research, validation
- `ux-ui-designer`: Information architecture, wireframes, flows
- `ui-visual-designer`: Visual design, design system, branding
- `a11y-specialist`: Accessibility compliance (WCAG 2.1 AA)

**Coordination**: Sequential with iterative feedback

```
Research → UX Design → Visual Design → A11y Validation → Iteration
```

**Typical Deliverables:**

- Research report with insights
- User flows and wireframes
- High-fidelity visual designs
- Accessibility audit and compliance report
- Design handoff documentation

**When to Use:**

- Major user-facing features
- Complete product redesigns
- Public-facing applications
- When accessibility is critical

**Expected Duration:** 8-16 hours

**Success Indicators:**

- User-validated designs
- WCAG 2.1 AA compliance
- Design system consistency
- Developer-ready handoff

---

### Pattern: Design + Accessibility (2 agents)

**Command:**

```
/henry-orchestrator:henry-team ux-ui-designer a11y-specialist - Accessible design for [feature]
```

**Team Composition:**

- `ux-ui-designer`: Design iteration and updates
- `a11y-specialist`: Accessibility validation and guidance

**Coordination**: Iterative (design → review → refine → validate)

**Typical Deliverables:**

- Accessible design specifications
- ARIA attribute requirements
- Keyboard navigation flows
- Screen reader compatibility notes

**When to Use:**

- Existing designs needing a11y improvements
- Public sector/government projects
- Inclusive design requirements
- WCAG compliance mandates

**Expected Duration:** 3-5 hours

**Success Indicators:**

- WCAG 2.1 AA or AAA compliance
- Keyboard navigable
- Screen reader compatible
- Color contrast meets standards

## Implementation Team Patterns

### Pattern: Frontend + Performance (2 agents)

**Command:**

```
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Build optimized [component/page]
```

**Team Composition:**

- `frontend-engineer`: UI implementation, component development
- `performance-engineer`: Performance guidance, optimization, benchmarking

**Coordination**: Collaborative (parallel planning, iterative implementation)

**Typical Deliverables:**

- Optimized React/Vue/Svelte components
- Performance benchmarks
- Core Web Vitals compliance
- Bundle size optimization

**When to Use:**

- Performance-critical UI (landing pages, dashboards)
- Core Web Vitals requirements
- Mobile-first applications
- Large component libraries

**Expected Duration:** 4-8 hours

**Success Indicators:**

- Lighthouse Performance > 90
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle size within budget
- Smooth 60fps interactions

---

### Pattern: Full-Stack Feature (2-3 agents)

**Command:**

```
/henry-orchestrator:henry-team frontend-engineer backend-engineer [+ qa-tester] - Build [feature]
```

**Team Composition:**

- `frontend-engineer`: UI implementation
- `backend-engineer`: API, business logic, database
- `qa-tester` (optional): Test strategy and validation

**Coordination**: Parallel with integration phase

```
(Frontend + Backend in parallel) → Integration → Testing
```

**Typical Deliverables:**

- Frontend UI components
- Backend API endpoints
- Database schema/migrations
- API documentation
- Test suite (if QA included)

**When to Use:**

- Features requiring both UI and API
- Full CRUD operations
- New product features
- End-to-end workflows

**Expected Duration:** 8-16 hours

**Success Indicators:**

- API contract defined and followed
- UI integrated with backend
- Error handling complete
- Tests passing (if QA included)

---

### Pattern: Backend + Security + DevOps (3 agents)

**Command:**

```
/henry-orchestrator:henry-team backend-engineer security-engineer devops-sre-architect - Build secure [service]
```

**Team Composition:**

- `backend-engineer`: Core implementation
- `security-engineer`: Security hardening, threat modeling
- `devops-sre-architect`: Deployment, infrastructure, monitoring

**Coordination**: Sequential with feedback loops

```
Backend Implementation → Security Review → DevOps Planning → Security Validation → Deployment
```

**Typical Deliverables:**

- Production-ready backend service
- Security audit and hardening
- Deployment pipeline (CI/CD)
- Infrastructure as code
- Monitoring and alerting setup
- Runbook and documentation

**When to Use:**

- Critical backend services (auth, payment)
- Microservices requiring deployment
- Production infrastructure setup
- Security-critical systems

**Expected Duration:** 12-24 hours

**Success Indicators:**

- Security audit passed
- Automated CI/CD pipeline
- Monitoring and alerting configured
- Zero-downtime deployment
- Disaster recovery plan

## Optimization Team Patterns

### Pattern: Performance Optimization (2-3 agents)

**Command:**

```
/henry-orchestrator:henry-team performance-engineer frontend-engineer [+ backend-engineer] - Optimize [application]
```

**Team Composition:**

- `performance-engineer`: Profiling, bottleneck identification, benchmarking
- `frontend-engineer`: Frontend optimization implementation
- `backend-engineer` (if needed): Backend/API optimization

**Coordination**: Sequential with parallel implementation

```
Profiling → Identify Bottlenecks → (Frontend + Backend optimization in parallel) → Validation
```

**Typical Deliverables:**

- Performance baseline report
- Optimization implementation
- Before/after benchmarks
- Performance budget definition
- Monitoring setup for regression detection

**When to Use:**

- Slow application performance
- Core Web Vitals failures
- High bounce rates from slow load
- Performance regression after releases

**Expected Duration:** 6-12 hours

**Success Indicators:**

- 30%+ improvement in key metrics
- Core Web Vitals in green
- Performance budget defined and met
- Monitoring in place

---

### Pattern: SEO + Frontend + Performance (3 agents)

**Command:**

```
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer - SEO optimization for [pages]
```

**Team Composition:**

- `seo-specialist`: Technical SEO, structured data, content optimization
- `frontend-engineer`: Implementation of SEO recommendations
- `performance-engineer`: Core Web Vitals (ranking factor)

**Coordination**: Parallel audit, integrated implementation

```
(SEO audit + Performance audit in parallel) → Unified optimization plan → Frontend implementation → Validation
```

**Typical Deliverables:**

- Technical SEO audit
- Structured data schema
- Optimized meta tags and content
- Core Web Vitals optimization
- Search Console setup

**When to Use:**

- Public-facing marketing pages
- Content-heavy sites
- E-commerce product pages
- Blog/article optimization

**Expected Duration:** 4-8 hours

**Success Indicators:**

- Lighthouse SEO score > 95
- All Core Web Vitals green
- Structured data validated
- Mobile-friendly
- Page 1 rankings for target keywords (over time)

## Audit Team Patterns

### Pattern: Pre-Launch Audit (5+ agents)

**Command:**

```
/henry-orchestrator:henry-team security-engineer performance-engineer a11y-specialist seo-specialist devops-sre-architect [+ qa-tester] - Pre-launch audit
```

**Team Composition:**

- `security-engineer`: Security audit
- `performance-engineer`: Performance validation
- `a11y-specialist`: Accessibility compliance
- `seo-specialist`: SEO readiness
- `devops-sre-architect`: Infrastructure and operations readiness
- `qa-tester` (optional): Final QA pass

**Coordination**: Parallel audits, comprehensive synthesis

**Typical Deliverables:**

- Multi-dimensional audit report covering:
  - Security vulnerabilities and fixes
  - Performance benchmarks
  - Accessibility compliance
  - SEO technical setup
  - Infrastructure readiness
  - Operational runbooks
- Launch checklist
- Post-launch monitoring plan

**When to Use:**

- Production launches
- Major version releases
- Public-facing application deployments
- Compliance-critical releases

**Expected Duration:** 8-16 hours

**Success Indicators:**

- Zero critical issues across all dimensions
- Launch checklist complete
- Monitoring and alerting configured
- Rollback plan tested
- Team confidence in launch

---

### Pattern: Quality Triad (3 agents)

**Command:**

```
/henry-orchestrator:henry-team qa-tester security-engineer performance-engineer - Quality audit
```

**Team Composition:**

- `qa-tester`: Functional testing, test coverage
- `security-engineer`: Security testing
- `performance-engineer`: Performance testing

**Coordination**: Parallel execution

**Typical Deliverables:**

- Test coverage report
- Security testing results
- Performance benchmarks
- Prioritized issue list

**When to Use:**

- Quality-focused audits
- Regular health checks
- Post-major-refactor validation
- Regression prevention

**Expected Duration:** 4-6 hours

**Success Indicators:**

- Test coverage > 80%
- Zero high/critical security issues
- Performance within acceptable range

## Product Team Patterns

### Pattern: Strategy + Design + Analytics (3 agents)

**Command:**

```
/henry-orchestrator:henry-team product-strategist ux-ui-designer data-analytics-engineer - Plan [feature]
```

**Team Composition:**

- `product-strategist`: Requirements, prioritization, business case
- `ux-ui-designer`: User experience and design
- `data-analytics-engineer`: Metrics definition, analytics setup

**Coordination**: Sequential with iteration

```
Strategy (PRD) → Design (mockups) → Analytics (metrics plan) → Iteration
```

**Typical Deliverables:**

- Product Requirements Document (PRD)
- Design mockups and prototypes
- Success metrics definition
- Analytics implementation plan
- A/B test strategy

**When to Use:**

- New feature planning
- Product discovery
- Data-driven feature development
- Experiment design

**Expected Duration:** 6-12 hours

**Success Indicators:**

- Clear PRD with acceptance criteria
- User-validated designs
- Measurable success metrics
- Analytics tracking plan

---

### Pattern: Strategy + Analytics + SEO (3 agents)

**Command:**

```
/henry-orchestrator:henry-team product-strategist data-analytics-engineer seo-specialist - Growth strategy
```

**Team Composition:**

- `product-strategist`: Growth strategy, acquisition channels
- `data-analytics-engineer`: Data analysis, user behavior, funnel optimization
- `seo-specialist`: Organic acquisition strategy

**Coordination**: Collaborative with data-driven iteration

**Typical Deliverables:**

- Growth strategy document
- Acquisition channel analysis
- SEO content strategy
- Funnel optimization plan
- Experiment backlog
- Analytics dashboard

**When to Use:**

- Growth initiatives
- User acquisition planning
- Conversion optimization
- Content marketing strategy

**Expected Duration:** 8-12 hours

**Success Indicators:**

- Clear growth metrics and targets
- Data-driven strategy
- SEO roadmap defined
- Tracking implemented

## Specialty Team Patterns

### Pattern: Mobile App Development (3-4 agents)

**Command:**

```
/henry-orchestrator:henry-team mobile-app-engineer ux-ui-designer backend-engineer [+ qa-tester] - Build [mobile feature]
```

**Team Composition:**

- `mobile-app-engineer`: iOS/Android/React Native implementation
- `ux-ui-designer`: Mobile-specific UX patterns
- `backend-engineer`: API and backend services
- `qa-tester` (optional): Mobile testing strategy

**Coordination**: Parallel design + backend, then mobile implementation

**Typical Deliverables:**

- Mobile app implementation
- Mobile-optimized designs
- Backend API
- App store assets (if needed)
- Mobile test suite

**When to Use:**

- Native/hybrid mobile features
- Mobile-first products
- Cross-platform development
- App store deployments

---

### Pattern: Data Pipeline (3-4 agents)

**Command:**

```
/henry-orchestrator:henry-team data-engineer data-scientist backend-engineer devops-sre-architect - Build [data pipeline]
```

**Team Composition:**

- `data-engineer`: ETL, data pipeline architecture
- `data-scientist`: ML models, data analysis
- `backend-engineer`: Integration with application
- `devops-sre-architect`: Infrastructure and orchestration

**Coordination**: Sequential phases with parallel work

**Typical Deliverables:**

- Data pipeline implementation
- ML models (if applicable)
- Data validation and monitoring
- Infrastructure setup
- Documentation

**When to Use:**

- ETL pipelines
- ML feature development
- Data warehouse setup
- Analytics infrastructure

## Quick Reference Matrix

| Use Case                  | Team Size | Agents                                    | Execution Mode         | Duration |
| ------------------------- | --------- | ----------------------------------------- | ---------------------- | -------- |
| Backend security review   | 2         | security + backend                        | Parallel               | 2-4h     |
| UX research + design      | 2         | researcher + designer                     | Sequential             | 4-8h     |
| Full-stack feature        | 2-3       | frontend + backend (+ QA)                 | Parallel → Integration | 8-16h    |
| Landing page optimization | 3         | SEO + frontend + performance              | Sequential             | 4-8h     |
| Complete design workflow  | 4         | researcher + UX + visual + a11y           | Sequential             | 8-16h    |
| Pre-launch audit          | 5-6       | security + perf + a11y + SEO + ops (+ QA) | Parallel               | 8-16h    |
| Mobile app feature        | 3-4       | mobile + designer + backend (+ QA)        | Mixed                  | 8-16h    |
| Data pipeline             | 3-4       | data eng + data sci + backend + ops       | Sequential             | 12-24h   |
