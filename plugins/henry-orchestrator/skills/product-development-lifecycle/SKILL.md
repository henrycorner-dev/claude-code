---
name: product-development-lifecycle
description: Guide for managing complete product development lifecycles using Henry Orchestrator commands (henry-product, henry-design, henry-feature, henry-review, henry-audit, henry-launch). Use when planning end-to-end product development from strategy through launch, coordinating product strategy, design, engineering, quality, and operations phases. Examples - <example>Context - User building new SaaS product from scratch; user - "Plan development of new SaaS analytics platform from concept to launch"; assistant - "I'll orchestrate full product lifecycle: /henry-orchestrator:henry-product for strategy and PRD → /henry-orchestrator:henry-design for UX/UI → /henry-orchestrator:henry-feature for implementation → /henry-orchestrator:henry-review for quality → /henry-orchestrator:henry-audit for pre-launch health check → /henry-orchestrator:henry-launch for production deployment"; <commentary>Complete product requires coordinated phases from strategy through launch</commentary></example> <example>Context - User planning MVP launch; user - "We need to launch MVP in 6 weeks"; assistant - "I'll create MVP lifecycle plan: Week 1-2 henry-product (scope MVP, define metrics) → Week 2-3 henry-design (core flows only) → Week 3-5 henry-feature (MVP implementation) → Week 5 henry-audit (critical issues only) → Week 6 henry-launch (beta deployment)"; <commentary>MVP requires compressed lifecycle with clear scope at each phase</commentary></example>
---

# Product Development Lifecycle

This skill guides you through complete product development lifecycles using Henry Orchestrator, from initial strategy through production launch. Learn how to coordinate product, design, engineering, quality, and operations phases for successful product delivery.

## Overview

Henry Orchestrator provides commands that map to product development lifecycle phases:

1. **Strategy & Planning** → `henry-product`
2. **Design & UX** → `henry-design`
3. **Implementation** → `henry-feature`
4. **Quality Assurance** → `henry-review`
5. **Pre-Launch Validation** → `henry-audit` + `henry-optimize`
6. **Launch** → `henry-launch`
7. **Post-Launch** → Monitoring and iteration

This skill shows you how to orchestrate these phases for different product scenarios.

## Product Development Models

### Waterfall Model (Sequential Phases)

**When to use**: Well-defined requirements, regulatory compliance needed, minimal expected changes

**Lifecycle**:
```
Strategy → Design → Build → Test → Deploy → Maintain
(Each phase complete before next begins)
```

**Henry workflow**:
```
1. henry-product (complete strategy)
   ↓ [Gate: PRD approved]
2. henry-design (complete design)
   ↓ [Gate: Designs approved]
3. henry-feature (complete implementation)
   ↓ [Gate: Implementation complete]
4. henry-review + henry-audit (comprehensive testing)
   ↓ [Gate: All tests pass]
5. henry-launch (production deployment)
```

**Pros**: Clear milestones, comprehensive documentation, predictable  
**Cons**: Slow feedback, late discovery of issues, inflexible

### Agile Model (Iterative Sprints)

**When to use**: Evolving requirements, fast feedback needed, flexibility important

**Lifecycle**:
```
Sprint cycle (1-2 weeks):
Plan → Design → Build → Review → Demo → Retrospective
(Repeat, delivering incremental value)
```

**Henry workflow**:
```
Sprint N:
1. henry-product (sprint planning, story refinement)
2. henry-design (design for sprint stories)
3. henry-feature (implement sprint scope)
4. henry-review (end-of-sprint review)
5. Deploy sprint deliverables

Every 3-4 sprints:
- henry-audit (comprehensive health check)
- henry-optimize (address technical debt)

Major releases:
- henry-launch (production launch checklist)
```

**Pros**: Fast feedback, adaptive, continuous value delivery  
**Cons**: Requires discipline, can lack long-term vision if not managed

### Lean Startup Model (Build-Measure-Learn)

**When to use**: High uncertainty, validating product-market fit, MVP testing

**Lifecycle**:
```
Build MVP → Measure usage → Learn from data → Pivot or persevere
(Rapid experimentation cycles)
```

**Henry workflow**:
```
Hypothesis phase:
1. henry-product (define hypothesis, metrics, MVP scope)

Build phase (2-4 weeks):
2. henry-design (minimal viable UX)
3. henry-feature (MVP implementation)
4. henry-review (quality check)
5. henry-launch (beta/limited launch)

Measure phase:
6. henry-team data-analytics-engineer (instrumentation, dashboards)

Learn phase:
7. Analyze metrics, validate/invalidate hypothesis
8. Decide: Pivot (go back to step 1) or Persevere (expand features)
```

**Pros**: Validates assumptions early, minimal wasted effort, data-driven  
**Cons**: Can feel chaotic, requires strong product intuition

## Lifecycle Phases in Detail

### Phase 1: Strategy & Planning (henry-product)

**Goals**:
- Define product vision and market opportunity
- Create Product Requirements Document (PRD)
- Prioritize features using frameworks (RICE, ICE, Kano)
- Define success metrics and KPIs
- Assess risks and constraints

**Agents involved**:
- **product-strategist**: Market analysis, PRD, feature prioritization
- **data-analytics-engineer**: Metrics definition, instrumentation plan
- **seo-specialist**: SEO strategy (if applicable)

**Deliverables**:
- PRD with user stories and acceptance criteria
- Feature prioritization with scoring
- Success metrics (North Star metric, supporting metrics)
- Go-to-market strategy outline
- Risk assessment

**Duration**: 1-2 weeks for new product, 2-5 days for new feature

**Success criteria**:
- Clear problem statement and solution hypothesis
- Quantified success metrics
- Prioritized feature list
- Stakeholder alignment on scope

**Example**:
```
/henry-orchestrator:henry-product SaaS analytics platform for e-commerce

Output:
- PRD: Analytics platform targeting e-commerce businesses <$10M revenue
- TAM: $5B, SAM: $500M, SOM: $50M (achievable in 3 years)
- Features prioritized by RICE: Real-time dashboards (P0), Custom reports (P1), Alerts (P2)
- North Star metric: Weekly Active Merchants
- Success metrics: 100 beta users in 3 months, $10K MRR in 6 months
- Risks: Integration complexity (High), Competitive landscape (Medium)
```

### Phase 2: Design & UX (henry-design)

**Goals**:
- Understand user needs through research
- Design user flows and information architecture
- Create wireframes and high-fidelity designs
- Ensure accessibility (WCAG 2.1 AA)
- Prepare design handoff for engineering

**Agents involved**:
- **ux-researcher**: User research, personas, journey mapping
- **ux-ui-designer**: Flows, wireframes, prototypes
- **ui-visual-designer**: Visual design, design system
- **a11y-specialist**: Accessibility review and compliance

**Deliverables**:
- User personas and journey maps
- Information architecture
- User flows for key tasks
- Wireframes (low to high fidelity)
- High-fidelity mockups with all states
- Component specifications
- Accessibility compliance report

**Duration**: 1-3 weeks depending on scope

**Success criteria**:
- Designs validate against user research
- WCAG 2.1 AA compliant
- All user flows designed
- Design system documented
- Engineering handoff package complete

**Example**:
```
/henry-orchestrator:henry-design Analytics dashboard with real-time data visualizations

Output:
- 3 user personas (Data Analyst, Store Owner, Marketing Manager)
- Journey maps showing pain points in current analytics tools
- IA: Dashboard → Reports → Alerts → Settings
- User flows for: View dashboard, Create custom report, Set up alert
- Wireframes for 15 key screens
- High-fidelity designs with design system (components, tokens)
- A11y review: All designs meet WCAG 2.1 AA (color contrast, keyboard nav)
- Handoff: Figma files, component specs, responsive breakpoints
```

### Phase 3: Implementation (henry-feature)

**Goals**:
- Build features according to designs and PRD
- Implement frontend, backend, and infrastructure
- Write comprehensive tests
- Conduct security review
- Optimize performance

**Agents involved**:
- **frontend-engineer**: UI implementation
- **backend-engineer**: API, database, business logic
- **mobile-app-engineer**: Mobile app (if applicable)
- **qa-tester**: Test strategy and automation
- **security-engineer**: Security review
- **performance-engineer**: Performance optimization
- **devops-sre-architect**: Infrastructure and deployment

**Deliverables**:
- Working implementation matching designs
- API documentation (OpenAPI/Swagger)
- Database schema and migrations
- Comprehensive test suite (unit, integration, E2E)
- Security review sign-off
- Performance benchmarks
- Deployment documentation

**Duration**: 2-12 weeks depending on complexity

**Success criteria**:
- All acceptance criteria met
- Test coverage ≥ 80%
- No critical security vulnerabilities
- Performance targets met
- Code review approved
- Documentation complete

**Example**:
```
/henry-orchestrator:henry-feature Implement real-time analytics dashboard

Output:
Frontend:
- React dashboard with Chart.js visualizations
- Real-time updates via WebSocket
- Responsive design (mobile, tablet, desktop)
- WCAG 2.1 AA compliant
- Tests: 85% coverage

Backend:
- WebSocket API with fallback to polling
- PostgreSQL schema for analytics data
- Redis caching for real-time aggregations
- Tests: 82% coverage

Quality:
- Security review: 0 critical, 2 medium issues (fixed)
- Performance: LCP 2.1s, INP 180ms (targets met)
- E2E tests for all user flows
```

### Phase 4: Quality Assurance (henry-review)

**Goals**:
- Comprehensive code review
- Security vulnerability assessment
- Performance validation
- QA testing execution
- Bug fixing and validation

**Agents involved**:
- **qa-tester**: Test execution, bug reporting
- **security-engineer**: Security testing
- **performance-engineer**: Performance benchmarking
- **frontend-engineer / backend-engineer**: Code review, bug fixes

**Deliverables**:
- Code review findings and resolutions
- Security test results
- Performance benchmarks
- Bug reports and fixes
- Regression test results
- Sign-off for next phase

**Duration**: 1-2 weeks

**Success criteria**:
- All critical bugs fixed
- Security vulnerabilities resolved
- Performance targets met
- Regression tests pass
- Code quality standards met

**Example**:
```
/henry-orchestrator:henry-review Dashboard implementation before merge

Output:
QA findings:
- Test coverage: 85% ✓
- 3 bugs found (1 high, 2 medium) → Fixed and verified
- Edge cases: Empty state, error handling → Added tests

Security findings:
- No critical vulnerabilities ✓
- 2 medium issues: Missing rate limiting, weak CSP → Fixed
- Dependency scan: 1 low-priority CVE → Updated

Performance findings:
- LCP: 2.1s ✓ (target: <2.5s)
- Bundle: 450KB ✓ (budget: 500KB)
- Recommendation: Add service worker caching → Added to backlog

Recommendation: Approved for merge
```

### Phase 5: Pre-Launch Validation (henry-audit + henry-optimize)

**Goals**:
- Comprehensive health check across all dimensions
- Fix critical and high-priority issues
- Validate production readiness
- Establish baseline metrics
- Create go/no-go decision framework

**Agents involved**:
- **security-engineer**: Security audit
- **performance-engineer**: Performance audit
- **a11y-specialist**: Accessibility audit
- **seo-specialist**: SEO audit
- **devops-sre-architect**: Infrastructure readiness
- **data-analytics-engineer**: Analytics validation

**Deliverables**:
- Comprehensive audit report
- Critical and high-priority issues resolved
- Performance baseline established
- Security sign-off
- Accessibility compliance certification
- SEO checklist complete
- Go/no-go decision

**Duration**: 1-2 weeks

**Success criteria**:
- 0 critical issues
- All high-priority issues resolved or accepted risk
- Launch checklist complete
- Monitoring and alerting configured
- Rollback plan documented

**Example**:
```
/henry-orchestrator:henry-audit Comprehensive pre-launch audit

Findings:
- Security: 2 critical (SQL injection, XSS) + 5 high
- Performance: LCP 3.2s (fails target), 6 optimization opportunities
- A11y: 15 violations (2 critical, 8 high, 5 medium)
- SEO: Missing structured data, 8 technical issues
- Ops: Deployment ready, 2 SLO gaps

/henry-orchestrator:henry-optimize Fix critical and high-priority issues

Results:
- Security: All critical issues fixed, high-priority hardening complete
- Performance: LCP optimized to 2.3s ✓
- A11y: Critical violations fixed, high-priority in progress
- SEO: Structured data added, technical issues resolved
- Ops: SLOs defined, monitoring dashboards created

Go/No-Go Decision: GO (with post-launch optimization plan for remaining items)
```

### Phase 6: Launch (henry-launch)

**Goals**:
- Deploy to production safely
- Configure monitoring and alerting
- Set up analytics and tracking
- Prepare support and documentation
- Execute go-to-market plan

**Agents involved**:
- **devops-sre-architect**: Deployment execution, monitoring
- **seo-specialist**: SEO optimization, search visibility
- **data-analytics-engineer**: Analytics instrumentation
- **qa-tester**: Smoke tests, production validation
- **security-engineer**: Production security validation
- **performance-engineer**: Production performance validation

**Deliverables**:
- Production deployment complete
- Monitoring dashboards and alerts configured
- Analytics tracking validated
- SEO optimization complete
- Rollback procedure documented and tested
- Launch announcement ready
- Support documentation complete

**Duration**: 1-2 weeks (including monitoring period)

**Success criteria**:
- Successful production deployment
- All monitoring and alerts working
- Analytics tracking validated
- SEO indexed and ranking
- No critical production issues
- User feedback mechanism active

**Example**:
```
/henry-orchestrator:henry-launch Analytics platform production deployment

Pre-Launch:
- Deployment plan: Blue/green deployment with gradual traffic shift
- Monitoring: Dashboards for errors, performance, usage
- Alerts: Critical errors, performance degradation, security events
- Analytics: All events instrumented and validated
- SEO: Sitemap submitted, structured data validated
- Rollback: Automated rollback if error rate >1%

Launch Day:
- 0% → 10% traffic (monitor 2 hours)
- 10% → 50% traffic (monitor 4 hours)
- 50% → 100% traffic (monitor 24 hours)

Post-Launch (First Week):
- Monitoring: Error rate 0.2% (target: <1%) ✓
- Performance: LCP 2.1s, INP 175ms (targets met) ✓
- Usage: 150 signups, 85 activated (57% activation rate)
- Issues: 3 minor bugs reported and fixed
- User feedback: 4.2/5 average satisfaction

Status: Successful launch, monitoring continues
```

### Phase 7: Post-Launch Optimization

**Goals**:
- Monitor production metrics
- Address post-launch issues
- Optimize based on real user data
- Plan next iteration
- Continuous improvement

**Agents involved**:
- **data-analytics-engineer**: Usage analysis, funnel optimization
- **performance-engineer**: Real user monitoring (RUM), optimization
- **product-strategist**: Feature prioritization based on data
- **qa-tester**: Regression prevention, test expansion

**Deliverables**:
- Weekly/monthly metrics reports
- User feedback analysis
- Optimization backlog
- Next iteration roadmap
- Continuous improvement plan

**Duration**: Ongoing

**Success criteria**:
- Metrics trending positive
- User satisfaction maintained/improved
- Technical debt managed
- Continuous deployment working

**Example**:
```
Week 1-4 Post-Launch:

Metrics:
- MAU: 420 (target: 500 by Month 2)
- Activation: 58% (target: 60%)
- Retention D7: 45%, D30: 28%
- NPS: 42 (Promoters: 55%, Detractors: 13%)

User Feedback:
- Top request: Mobile app (60 requests)
- Pain point: Slow report generation (35 mentions)
- Delight: Real-time updates (80 positive mentions)

Optimizations:
/henry-orchestrator:henry-optimize Report generation performance
→ Reduced from 15s to 3s via caching

Next Iteration Planning:
/henry-orchestrator:henry-product Mobile app for analytics platform
→ PRD for mobile app, targeting Q2 launch
```

## Lifecycle Templates

### Template 1: New Product Launch (3-6 Months)

```
Month 1: Strategy & Design
├─ Week 1-2: henry-product (PRD, market analysis, metrics)
└─ Week 3-4: henry-design (research, UX, visual, a11y)

Month 2-4: Development
├─ Month 2: henry-feature (MVP core features)
├─ Month 3: henry-feature (additional features)
└─ Month 4: henry-feature (polish and refinement)

Month 5: Quality & Pre-Launch
├─ Week 1-2: henry-review + henry-audit
├─ Week 3: henry-optimize (fix issues)
└─ Week 4: henry-launch prep

Month 6: Launch
├─ Week 1: henry-launch (beta launch)
├─ Week 2-4: Monitor, gather feedback, iterate

Success Metrics:
- Beta users: 100-500
- Activation rate: >50%
- Critical bugs: 0
- NPS: >40
```

### Template 2: MVP Launch (6-8 Weeks)

```
Week 1-2: Strategy & Design
├─ Week 1: henry-product (MVP scope, lean PRD)
└─ Week 2: henry-design (core flows only, wireframes)

Week 3-5: Development
├─ Week 3-4: henry-feature (MVP implementation)
└─ Week 5: henry-review (quality check)

Week 6: Pre-Launch
├─ henry-audit (critical issues only)
└─ henry-optimize (P0/P1 fixes)

Week 7-8: Launch
├─ Week 7: henry-launch (limited beta)
└─ Week 8: Monitor, gather feedback

Success Metrics:
- MVP deployed: Yes/No
- Beta users: 10-50
- Critical bugs: 0
- Key user flows working: 100%
```

### Template 3: Feature Addition (2-4 Weeks)

```
Week 1: Planning & Design
├─ Day 1-2: henry-product or product-strategist (if complex feature)
└─ Day 3-5: henry-design or ux-ui-designer (if significant UX change)

Week 2-3: Development
├─ henry-feature (implementation)
└─ Continuous henry-review (daily/sprint reviews)

Week 4: Launch
├─ Day 1-2: Final henry-review
├─ Day 3: henry-audit (if high risk) or skip
├─ Day 4: henry-launch or standard deployment
└─ Day 5: Monitor and iterate

Success Metrics:
- Feature complete: Yes/No
- Tests passing: 100%
- No regressions: Verified
- User adoption: Tracked
```

### Template 4: Quarterly Release (12 Weeks)

```
Sprint 1 (Week 1-2): Planning
└─ henry-product (quarterly roadmap, feature prioritization)

Sprint 2-5 (Week 3-10): Development
├─ Sprint 2: henry-design + henry-feature (Feature Set A)
├─ Sprint 3: henry-feature + henry-review (Feature Set A)
├─ Sprint 4: henry-design + henry-feature (Feature Set B)
└─ Sprint 5: henry-feature + henry-review (Feature Set B)

Sprint 6 (Week 11-12): Launch Prep & Release
├─ Week 11: henry-audit + henry-optimize
└─ Week 12: henry-launch (quarterly release)

Success Metrics:
- Features delivered: 80% of planned scope
- Quality: 0 critical bugs, <5 high-priority bugs
- Performance: Targets met
- User satisfaction: NPS >40
```

## Milestone Gates

### Gate 1: Strategy Approval

**Criteria**:
- [ ] PRD complete and stakeholder-approved
- [ ] Success metrics defined and measurable
- [ ] Market opportunity validated
- [ ] Technical feasibility confirmed
- [ ] Resource allocation approved

**Proceed to**: Design phase

### Gate 2: Design Approval

**Criteria**:
- [ ] User research complete (if applicable)
- [ ] Designs approved by stakeholders
- [ ] WCAG 2.1 AA compliance confirmed
- [ ] Technical implementation plan reviewed
- [ ] Engineering ready to implement

**Proceed to**: Implementation phase

### Gate 3: Implementation Complete

**Criteria**:
- [ ] All acceptance criteria met
- [ ] Test coverage ≥ 80%
- [ ] Code review approved
- [ ] Documentation complete
- [ ] Security review passed (preliminary)

**Proceed to**: Quality assurance phase

### Gate 4: Quality Assurance

**Criteria**:
- [ ] All critical bugs fixed
- [ ] Regression tests passing
- [ ] Performance targets met
- [ ] Security vulnerabilities addressed
- [ ] Ready for pre-launch audit

**Proceed to**: Pre-launch validation phase

### Gate 5: Launch Readiness

**Criteria**:
- [ ] Audit complete, 0 critical issues
- [ ] Monitoring and alerting configured
- [ ] Rollback plan tested
- [ ] Support documentation ready
- [ ] Go/no-go decision: GO

**Proceed to**: Launch

### Gate 6: Launch Success

**Criteria**:
- [ ] Deployment successful
- [ ] Error rate within acceptable range (<1%)
- [ ] Performance metrics within targets
- [ ] User feedback mechanism active
- [ ] No critical production issues

**Proceed to**: Post-launch optimization

## Risk Management

### Common Risks and Mitigations

**Risk: Scope Creep**
- **Mitigation**: Strict PRD, change control process, regular scope reviews
- **Henry approach**: Lock scope after henry-product, defer new requests to next iteration

**Risk: Technical Debt Accumulation**
- **Mitigation**: Code review standards, refactoring sprints, quality metrics
- **Henry approach**: Regular henry-audit to identify debt, henry-optimize to address

**Risk: Delayed Launch**
- **Mitigation**: Realistic timelines, MVP approach, parallel workstreams
- **Henry approach**: Use MVP template, prioritize ruthlessly with RICE scoring

**Risk: Poor User Adoption**
- **Mitigation**: User research, beta testing, gradual rollout
- **Henry approach**: henry-design validates with users, henry-launch enables gradual rollout

**Risk: Security Vulnerabilities**
- **Mitigation**: Security review throughout development, regular audits
- **Henry approach**: security-engineer involved from design, henry-audit before launch

**Risk: Performance Issues**
- **Mitigation**: Performance budgets, continuous monitoring, optimization sprints
- **Henry approach**: performance-engineer sets budgets, henry-optimize addresses issues

## Metrics and KPIs

### Product Metrics

**Acquisition**:
- Signups per week/month
- Traffic sources
- Conversion rate (visitor → signup)

**Activation**:
- Time to first value
- Activation rate (signup → activated user)
- Onboarding completion rate

**Retention**:
- D1, D7, D30 retention rates
- Churn rate
- Cohort analysis

**Revenue** (if applicable):
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

**Referral**:
- Viral coefficient
- NPS (Net Promoter Score)
- Referral rate

### Development Metrics

**Velocity**:
- Story points per sprint
- Features delivered vs. planned
- Cycle time (idea → production)

**Quality**:
- Defect escape rate
- Test coverage
- Code review turnaround time
- Deployment frequency

**Performance**:
- Core Web Vitals compliance
- API response times
- Error rates

## Best Practices

### DO:

✅ **Start with clear strategy**: henry-product establishes foundation  
✅ **Validate with users**: henry-design includes research and testing  
✅ **Build quality in**: henry-review throughout, not just at end  
✅ **Measure everything**: Instrument from day one with data-analytics-engineer  
✅ **Launch incrementally**: Beta → gradual rollout → full launch  
✅ **Monitor continuously**: Real-time dashboards, alerts, user feedback  
✅ **Iterate based on data**: Post-launch optimization driven by metrics  

### DON'T:

❌ **Skip strategy phase**: Leads to building wrong thing  
❌ **Design after coding**: Results in poor UX and expensive rework  
❌ **Defer quality**: Late-stage bugs are expensive to fix  
❌ **Big bang launches**: High risk, no fallback  
❌ **Ignore user feedback**: Data-driven decisions beat opinions  
❌ **Accumulate technical debt**: Slows future development  
❌ **Optimize prematurely**: Validate first, optimize later  

## Integration with Henry Commands

Complete product lifecycle uses all Henry commands in sequence:

1. `/henry-orchestrator:henry-product` - Strategy and planning
2. `/henry-orchestrator:henry-design` - Design and UX
3. `/henry-orchestrator:henry-feature` - Implementation
4. `/henry-orchestrator:henry-review` - Quality assurance
5. `/henry-orchestrator:henry-audit` - Pre-launch validation
6. `/henry-orchestrator:henry-optimize` - Issue remediation
7. `/henry-orchestrator:henry-launch` - Production deployment

For custom workflows, use `/henry-orchestrator:henry-team` to assemble specific agent combinations.

For detailed command documentation and agent capabilities, see `/henry-orchestrator:help`.

## Quick Reference

| Phase | Command | Duration | Key Deliverables |
|-------|---------|----------|------------------|
| Strategy | henry-product | 1-2 weeks | PRD, metrics, roadmap |
| Design | henry-design | 1-3 weeks | Designs, prototypes, a11y |
| Implementation | henry-feature | 2-12 weeks | Working code, tests, docs |
| QA | henry-review | 1-2 weeks | Quality validation, bug fixes |
| Pre-Launch | henry-audit + henry-optimize | 1-2 weeks | Health check, fixes |
| Launch | henry-launch | 1-2 weeks | Production deployment |
| Post-Launch | henry-team, henry-optimize | Ongoing | Monitoring, iteration |

For detailed lifecycle planning, templates, and risk management strategies, reference this skill or consult with product-strategist agent.