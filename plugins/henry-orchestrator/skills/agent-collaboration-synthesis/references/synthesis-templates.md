# Synthesis Templates

This document provides ready-to-use templates for creating synthesized documentation from multi-agent outputs.

## Template 1: Multi-Agent Review Report

```markdown
# [Feature/Component] Review Report

## Executive Summary

- **Reviewed by**: [List agents]
- **Overall status**: [Green/Yellow/Red]
- **Critical issues**: [Count]
- **Launch recommendation**: [Go/No-go/Conditional]

## Key Findings

### Critical Issues (P0)

1. [Issue] - [Agent] - [Impact] - [Remediation]
2. ...

### High Priority (P1)

1. [Issue] - [Agent] - [Impact] - [Remediation]
2. ...

### Cross-Cutting Themes

- **[Theme 1]**: [Agents that identified] - [Unified recommendation]
- **[Theme 2]**: [Agents that identified] - [Unified recommendation]

## Agent Findings Detail

### [Agent 1] Findings

[Summary of findings with details]

### [Agent 2] Findings

[Summary of findings with details]

## Integrated Action Plan

### Phase 1: Critical Fixes (Immediate)

- [Action item with owner and deadline]

### Phase 2: High Priority (Next Sprint)

- [Action item with owner and deadline]

### Phase 3: Medium Priority (Backlog)

- [Action item]

## Success Criteria

- [Measurable criterion 1]
- [Measurable criterion 2]

## Next Steps

1. [Immediate action]
2. [Follow-up review]
```

## Template 2: Design Handoff Package

````markdown
# [Feature] Design Handoff

## Design Overview

- **Purpose**: [What this solves]
- **Users**: [Target personas]
- **Success metrics**: [How we measure success]

## Research Insights

### User Needs

- [Key finding 1 from research]
- [Key finding 2 from research]

### Design Decisions

- [Decision]: [Rationale based on research]

## UX Specifications

### User Flows

[Links to flows or embedded diagrams]

### Wireframes

[Links to wireframes with annotations]

## Visual Design

### Components

| Component | States                                  | Specs  | A11y Notes          |
| --------- | --------------------------------------- | ------ | ------------------- |
| Button    | default, hover, active, focus, disabled | [Link] | Focus ring required |

### Design Tokens

```css
--color-primary: #007bff;
--color-text: #333333;
--spacing-md: 16px;
```
````

## Accessibility Requirements

### WCAG Checklist

- [x] Color contrast ≥ 4.5:1
- [x] Keyboard navigation
- [x] Screen reader compatibility
- [x] Focus indicators

### Implementation Notes

- [Specific a11y requirement with code example]

## Responsive Design

- **Mobile** (< 768px): [Behavior]
- **Tablet** (768px - 1024px): [Behavior]
- **Desktop** (> 1024px): [Behavior]

## Acceptance Criteria

- [ ] Matches high-fidelity designs
- [ ] All states implemented
- [ ] WCAG 2.1 AA compliant
- [ ] Responsive across breakpoints
- [ ] Animations as specified

````

## Template 3: Feature Completion Report

```markdown
# [Feature] Completion Report

## Feature Overview
- **Description**: [What was built]
- **Agents involved**: [List]
- **Duration**: [Timeline]
- **Status**: [Complete/Pending]

## Strategy Alignment
- **Business goal**: [From PRD]
- **Success metrics**: [Metrics and instrumentation status]
- **User need**: [Problem solved]

## Implementation Summary
### Frontend
- [Technologies used]
- [Key features implemented]
- [Performance metrics]

### Backend
- [Technologies used]
- [API endpoints created]
- [Database schema]

### Quality
- **Test coverage**: [Percentage]
- **Security review**: [Status]
- **Performance**: [Metrics]
- **Accessibility**: [Compliance level]

## Cross-Functional Validation
- [x] Design specs implemented
- [x] Product requirements met
- [x] Security reviewed
- [x] Performance targets met
- [x] Accessibility compliant
- [x] Tests passing

## Known Limitations
- [Limitation 1 with rationale/plan]

## Next Steps
1. [Post-launch monitoring]
2. [Planned enhancements]
````

## Template 4: Launch Readiness Report

```markdown
# [Feature/Product] Launch Readiness Report

## Executive Summary

- **Launch target**: [Date]
- **Readiness status**: [Go/No-go/Conditional]
- **Blocking issues**: [Count]
- **Risk level**: [Low/Medium/High]

## Audit Results Summary

| Dimension     | Status     | Critical | High | Medium | Notes     |
| ------------- | ---------- | -------- | ---- | ------ | --------- |
| Security      | [🔴/🟡/🟢] | [#]      | [#]  | [#]    | [Summary] |
| Performance   | [🔴/🟡/🟢] | [#]      | [#]  | [#]    | [Summary] |
| Accessibility | [🔴/🟡/🟢] | [#]      | [#]  | [#]    | [Summary] |
| SEO           | [🔴/🟡/🟢] | [#]      | [#]  | [#]    | [Summary] |
| Operations    | [🔴/🟡/🟢] | [#]      | [#]  | [#]    | [Summary] |

## Launch Blockers (Must Fix)

### Critical Issues

1. [Issue] - [Dimension] - [Impact] - [ETA for fix]
2. ...

### High Priority Issues

1. [Issue] - [Dimension] - [Impact] - [ETA for fix]
2. ...

## Launch Conditions

### Required (Go/No-Go Criteria)

- [ ] 0 critical security vulnerabilities
- [ ] 0 WCAG A violations
- [ ] Performance meets minimum thresholds
- [ ] Deployment pipeline validated
- [ ] Rollback procedure tested
- [ ] Monitoring and alerting active

### Target (Ideal State)

- [ ] All high priority issues resolved
- [ ] WCAG AA compliance
- [ ] Performance meets target metrics
- [ ] SEO optimizations complete

## Post-Launch Plan

### Week 1

- [Monitoring focus]
- [Quick fixes]

### Month 1

- [Medium priority issues]
- [Performance optimization]

### Quarter 1

- [Enhancements]
- [Technical debt]

## Risk Assessment

| Risk     | Probability    | Impact         | Mitigation |
| -------- | -------------- | -------------- | ---------- |
| [Risk 1] | [Low/Med/High] | [Low/Med/High] | [Plan]     |

## Go/No-Go Recommendation

**Recommendation**: [Go/No-go/Conditional go]

**Rationale**: [Explanation based on findings]

**Conditions** (if conditional):

- [Condition 1]
- [Condition 2]

## Sign-off

- [ ] Engineering Lead
- [ ] Security Team
- [ ] Product Manager
- [ ] QA Lead
```

## Template 5: Optimization Impact Report

```markdown
# [Component/Feature] Optimization Impact Report

## Executive Summary

- **Optimization focus**: [What was optimized]
- **Agents involved**: [List]
- **Duration**: [Timeline]
- **Overall impact**: [Summary metric]

## Baseline Metrics (Before)

| Metric        | Value | Target  |
| ------------- | ----- | ------- |
| LCP           | [X]s  | < 2.5s  |
| INP           | [X]ms | < 200ms |
| CLS           | [X]   | < 0.1   |
| Bundle size   | [X]MB | < [Y]MB |
| Test coverage | [X]%  | ≥ 80%   |

## Optimizations Implemented

### Performance Optimizations

1. **[Optimization name]**
   - **Impact**: [Metric change]
   - **Implementation**: [What was done]
   - **Effort**: [Time/complexity]

### Code Quality Improvements

1. **[Improvement name]**
   - **Impact**: [What improved]
   - **Implementation**: [What was done]

### Security Hardening

1. **[Hardening measure]**
   - **Risk mitigated**: [What threat]
   - **Implementation**: [What was done]

## Final Metrics (After)

| Metric        | Before | After | Change        | Target Met |
| ------------- | ------ | ----- | ------------- | ---------- |
| LCP           | [X]s   | [Y]s  | -[Z]s ([-%])  | ✓/✗        |
| INP           | [X]ms  | [Y]ms | -[Z]ms ([-%]) | ✓/✗        |
| CLS           | [X]    | [Y]   | -[Z] ([-%])   | ✓/✗        |
| Bundle size   | [X]MB  | [Y]MB | -[Z]MB ([-%]) | ✓/✗        |
| Test coverage | [X]%   | [Y]%  | +[Z]%         | ✓/✗        |

## Impact Analysis

### Performance Impact

- **User experience**: [How it affects users]
- **Business metrics**: [Expected business impact]

### Technical Impact

- **Maintainability**: [How it affects code quality]
- **Developer experience**: [How it affects development]

### Trade-offs

- [Trade-off 1 and rationale]
- [Trade-off 2 and rationale]

## Lessons Learned

1. [Key learning 1]
2. [Key learning 2]

## Recommendations

1. [Future optimization opportunity]
2. [Process improvement]

## Next Steps

1. [Monitor metrics in production]
2. [Follow-up optimizations]
```

## Using These Templates

### When to Use Each Template

- **Multi-Agent Review Report**: After parallel reviews (security, performance, QA)
- **Design Handoff Package**: After complete design workflow
- **Feature Completion Report**: After full-stack feature development
- **Launch Readiness Report**: Pre-launch audits across all dimensions
- **Optimization Impact Report**: After optimization sprints or refactoring

### Customization Tips

1. **Adapt sections**: Not all sections apply to every situation - remove irrelevant ones
2. **Add context**: Include project-specific metrics, tools, or processes
3. **Adjust severity levels**: Use your team's P0/P1/P2/P3 definitions
4. **Link to details**: Reference detailed agent outputs for deep dives
5. **Update stakeholders**: Tailor executive summary to your audience

### Best Practices

- **Fill in all placeholders**: Replace [bracketed items] with actual data
- **Be specific**: Use concrete numbers, dates, and action items
- **Maintain traceability**: Link recommendations back to findings
- **Include visuals**: Add charts, graphs, or diagrams where helpful
- **Version control**: Track changes to reports over time
- **Share widely**: Ensure all stakeholders have access

For more guidance on synthesis process and patterns, see [synthesis-patterns.md](synthesis-patterns.md).
