# Synthesis Patterns

This document provides detailed patterns for synthesizing outputs from multiple agents in common scenarios.

## Pattern 1: Review Synthesis

**Scenario**: Parallel security, performance, QA reviews completed

**Agent outputs**:
- Security: 8 vulnerabilities (2 critical, 3 high, 3 medium)
- Performance: 12 issues (3 critical, 5 high, 4 medium)
- QA: Test coverage 65%, 6 missing scenarios

**Synthesis approach**:

1. **Consolidate by severity**:
   - Critical (5 total): 2 security + 3 performance
   - High (8 total): 3 security + 5 performance
   - Medium (7 total): 3 security + 4 performance
   - Test coverage gap (high priority)

2. **Identify cross-cutting themes**:
   - Authentication: Security found vulnerabilities, QA missing test coverage
   - Performance: Slow API calls affecting UX
   - Error handling: Both security and QA flagged gaps

3. **Create integrated action plan**:
   ```
   Phase 1 - Critical Fixes (This week):
   1. Fix SQL injection vulnerability in auth endpoint [Security P0]
   2. Fix XSS in user profile [Security P0]
   3. Optimize slow queries causing 5s+ load times [Performance P0]

   Phase 2 - High Priority (Next sprint):
   4. Implement authentication test suite [QA + Security]
   5. Add rate limiting [Security P1]
   6. Optimize bundle size (currently 1.2MB) [Performance P1]
   7. Improve error handling [Security + QA]

   Phase 3 - Medium Priority (Backlog):
   8. Defense-in-depth security improvements
   9. Performance optimizations beyond targets
   10. Additional test coverage
   ```

4. **Define success metrics**:
   - 0 critical security vulnerabilities
   - LCP < 2.5s, INP < 200ms, CLS < 0.1
   - Test coverage ≥ 80%
   - All auth flows have security tests

**Synthesized deliverable**:
- Executive summary: "5 critical issues require immediate attention. Authentication is highest priority (security + test gaps). Performance improvements will reduce load time from 4.2s to <2.5s."
- Detailed findings by category (Security, Performance, Quality)
- Integrated action plan with phases
- Success criteria and verification plan

## Pattern 2: Design Synthesis

**Scenario**: Complete design workflow (research → UX → visual → a11y)

**Agent outputs**:
- UX Researcher: 3 user personas, 2 journey maps, 8 pain points
- UX/UI Designer: 15 wireframes, 5 user flows, interactive prototype
- UI Visual Designer: High-fidelity designs, component library, style guide
- A11y Specialist: 12 a11y violations (4 critical), remediation plan

**Synthesis approach**:

1. **Connect research to design**:
   - Persona "Busy Manager" pain point: "Too many clicks" → Addressed in streamlined flow design
   - Persona "New User" pain point: "Confusing navigation" → Addressed with progressive disclosure
   - Journey map insight: "Abandonment at Step 3" → Redesigned Step 3 with clearer CTA

2. **Integrate visual design and a11y**:
   - Color contrast violations fixed in visual designs
   - Focus indicators added to all interactive elements
   - Keyboard navigation flow validated
   - Screen reader testing complete

3. **Create comprehensive handoff package**:
   ```
   Design Handoff Package:

   1. Research Insights
      - User Personas (with goals, frustrations, behaviors)
      - Journey Maps (current vs. proposed)
      - Key findings that informed design

   2. UX Specifications
      - User flows for all major tasks
      - Wireframes with annotations
      - Interaction specifications
      - Responsive behavior notes

   3. Visual Design
      - High-fidelity mockups (all states: default, hover, active, focus, disabled, error)
      - Component library with specs
      - Design tokens (colors, typography, spacing, shadows)
      - Icon library

   4. Accessibility Requirements
      - WCAG 2.1 AA compliance checklist
      - Keyboard navigation requirements
      - Screen reader announcements
      - Focus management specifications
      - Color contrast requirements (all met)

   5. Implementation Guide
      - Component structure recommendations
      - Responsive breakpoints
      - Animation specifications
      - Browser support requirements
   ```

4. **Define acceptance criteria**:
   - Designs match research insights (validated)
   - All components meet WCAG 2.1 AA
   - Responsive across breakpoints
   - All interactive states designed
   - Design system documented

**Synthesized deliverable**:
- Complete design package ready for engineering handoff
- Research insights integrated into design rationale
- Accessibility requirements built into all components
- Clear implementation specifications

## Pattern 3: Feature Development Synthesis

**Scenario**: Full-stack feature (product strategy → design → frontend + backend → QA)

**Agent outputs**:
- Product Strategist: PRD, success metrics (MAU +15%, conversion +8%)
- UX/UI Designer: User flows, high-fidelity designs
- Frontend Engineer: React dashboard with charts, real-time updates
- Backend Engineer: WebSocket API, database schema
- QA Tester: Test strategy, 85% coverage achieved

**Synthesis approach**:

1. **Verify alignment with strategy**:
   - PRD metric: "MAU +15%" → Implementation includes engagement hooks
   - PRD metric: "Conversion +8%" → CTA placement matches designs
   - Success metrics instrumented in analytics

2. **Validate design implementation**:
   - Frontend implementation matches design specs
   - Responsive behavior as designed
   - All states implemented (loading, error, empty, success)
   - Accessibility requirements met

3. **Ensure technical coherence**:
   - Frontend and backend API contract aligned
   - Database schema supports all features
   - Real-time updates working end-to-end
   - Error handling consistent across stack

4. **Confirm quality standards**:
   - Test coverage meets target (85% ≥ 80% ✓)
   - All user flows have E2E tests
   - Performance targets met
   - Security review passed

**Synthesized deliverable**:
```
Feature: Real-Time Analytics Dashboard

Strategy Alignment:
✓ Addresses user need: "See analytics in real-time"
✓ Success metrics instrumented
✓ Target: MAU +15%, Conversion +8%

Implementation:
✓ Design specs implemented with 98% fidelity
✓ Real-time updates via WebSocket
✓ Responsive design (mobile, tablet, desktop)
✓ WCAG 2.1 AA compliant

Technical:
✓ React dashboard with Chart.js visualizations
✓ WebSocket API with fallback to polling
✓ PostgreSQL schema optimized for analytics queries
✓ Redis caching for frequently accessed data

Quality:
✓ 85% test coverage (target: 80%)
✓ E2E tests for all user flows
✓ Performance: LCP 2.1s, INP 180ms
✓ Security review: No critical issues

Ready for production deployment.
```

## Pattern 4: Audit Synthesis

**Scenario**: Pre-launch audit (security + performance + a11y + SEO + ops)

**Agent outputs**:
- Security: 3 critical, 5 high, 8 medium vulnerabilities
- Performance: LCP 3.2s (target: <2.5s), 6 optimization opportunities
- A11y: 15 WCAG violations (2 critical, 8 high, 5 medium)
- SEO: 8 technical issues, missing structured data
- DevOps: Deployment ready, monitoring configured, 2 SLO gaps

**Synthesis approach**:

1. **Create severity matrix**:
   ```
   Critical (5): 3 security + 2 a11y → BLOCK LAUNCH
   High (19): 5 security + 8 a11y + 6 performance → FIX BEFORE LAUNCH
   Medium (13): 8 security + 5 a11y → NEAR-TERM BACKLOG
   Low/Info: SEO enhancements, ops improvements → POST-LAUNCH
   ```

2. **Identify launch blockers**:
   - SQL injection in auth (Security P0)
   - Stored XSS in comments (Security P0)
   - DOM-based XSS (Security P0)
   - Form lacks labels (A11y P0 - WCAG A violation)
   - Missing keyboard navigation (A11y P0 - WCAG A violation)

3. **Create launch readiness plan**:
   ```
   Launch Readiness Plan:

   BLOCKERS (Must fix before launch):
   [Critical + High Priority items that prevent launch]

   LAUNCH CONDITIONS:
   - 0 critical security vulnerabilities
   - 0 WCAG A violations
   - LCP < 3.0s (relaxed from 2.5s for v1)
   - Deployment pipeline tested

   POST-LAUNCH PRIORITIES:
   - Performance optimization to meet 2.5s target
   - Remaining WCAG AA violations
   - SEO enhancements
   - Ops monitoring improvements
   ```

4. **Create go/no-go checklist**:
   - [ ] All critical security issues resolved
   - [ ] WCAG A compliance achieved
   - [ ] Basic performance targets met
   - [ ] Deployment tested in staging
   - [ ] Rollback procedure documented
   - [ ] Monitoring and alerting active

**Synthesized deliverable**:
- Launch readiness report with go/no-go decision
- Prioritized remediation plan
- Post-launch optimization roadmap
- Risk assessment and mitigation plan

## Integration with Henry Commands

Synthesis happens naturally after command execution:

- **After henry-review**: Synthesize QA, security, performance findings
- **After henry-audit**: Consolidate all audit dimensions
- **After henry-design**: Create design handoff package
- **After henry-feature**: Validate end-to-end implementation
- **After henry-team**: Integrate custom team outputs

The henry commands already include synthesis phases, but this skill provides detailed guidance for complex cases.

## Quick Reference

| Scenario | Synthesis Focus | Key Output |
|----------|----------------|------------|
| Multi-agent review | Prioritization, conflict resolution | Action plan by priority |
| Design workflow | Integration, handoff clarity | Design handoff package |
| Feature development | Validation, coherence | Feature completion report |
| Pre-launch audit | Risk assessment, go/no-go | Launch readiness report |
| Optimization sprint | Before/after, impact | Optimization impact report |

For additional guidance on specific synthesis scenarios, reference the relevant Henry command or ask for help.
