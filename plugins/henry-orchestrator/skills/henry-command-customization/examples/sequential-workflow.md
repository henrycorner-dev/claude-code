# Example: Sequential Workflow

## Overview

This example demonstrates changing execution from parallel to sequential. Useful when phases must complete in specific order with feedback loops.

## Scenario

**Standard henry-audit runs agents in parallel:**

- All 5 agents launch simultaneously:
  - security-engineer
  - performance-engineer
  - a11y-specialist
  - seo-specialist
  - devops-sre-architect
- Results returned independently
- No dependencies between audits

**Problem with parallel execution:**

- Security issues may affect performance baseline
- Want to fix critical issues before proceeding
- Need iterative improvement with validation

**Need: Sequential audit with fixes between phases**

## Solution: Sequential Audit with Remediation

Create command where each audit phase completes before next begins, with opportunity to fix issues.

### File: `.claude/commands/sequential-audit.md`

```markdown
---
description: Sequential audit with remediation between phases
version: '1.0.0'
---

# Sequential Audit with Remediation

Step-by-step audit process with opportunity to address critical issues before proceeding to next phase.

## Phase 1: Security Audit

**Goal**: Identify security vulnerabilities

**Actions**:

1. Launch security-engineer to scan for vulnerabilities
2. Check for OWASP Top 10 issues
3. Review authentication and authorization
4. Validate input sanitization
5. Check for exposed secrets
6. Scan dependencies for known vulnerabilities

**Agents**: security-engineer

**Deliverables**: Security vulnerability report with severity ratings

**Output Format**:

- Critical (CVSS >= 9.0): [list]
- High (CVSS 7.0-8.9): [list]
- Medium (CVSS 4.0-6.9): [list]
- Low (CVSS < 4.0): [list]

## Phase 2: Address Critical Security Issues

**Goal**: Fix blocking security vulnerabilities before proceeding

**Condition**: Only if critical (CVSS >= 9.0) issues found

**Actions**:

1. Review critical security findings with user
2. Prioritize by exploitability and impact
3. Implement fixes for critical issues
4. Re-run security scan to verify fixes
5. Ensure no new vulnerabilities introduced

**Agents**: security-engineer, backend-engineer

**Deliverables**: Security fixes, verification scan results

**User Interaction**:

- Review critical findings
- Confirm fixes before proceeding
- Approve to move to performance phase

**Decision Point**:

- If critical issues remain → Stop and address
- If critical issues fixed → Proceed to Phase 3

## Phase 3: Performance Audit

**Goal**: Baseline performance on secure codebase

**Actions**:

1. Launch performance-engineer to measure metrics
2. Measure Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
   - TTFB (Time to First Byte)
3. Identify top performance bottlenecks
4. Generate optimization recommendations
5. Prioritize by impact

**Agents**: performance-engineer

**Deliverables**: Performance baseline metrics, bottleneck analysis, optimization roadmap

**Note**: Performance measured on security-hardened baseline ensures optimizations don't compromise security

## Phase 4: Address Performance Issues

**Goal**: Optimize performance without compromising security

**Condition**: Only if performance targets not met

**Performance Targets**:

- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- TTFB: < 600ms

**Actions**:

1. Review performance findings with user
2. Implement high-impact optimizations first
3. Measure after each optimization
4. Re-run security scan after changes (verify no regressions)
5. Iterate until targets met or diminishing returns

**Agents**: performance-engineer, backend-engineer, frontend-engineer

**Deliverables**: Performance optimizations, updated metrics, security re-validation

**User Interaction**:

- Review performance targets
- Approve optimizations
- Decide when to stop iterating

**Decision Point**:

- If targets met → Proceed to Phase 5
- If targets not met but close → User decision to proceed or iterate
- If major issues remain → Continue optimization

## Phase 5: Accessibility Audit

**Goal**: Ensure accessible experience

**Actions**:

1. Launch a11y-specialist to audit accessibility
2. Check WCAG 2.1 compliance (Level AA minimum)
3. Test with assistive technologies:
   - Screen readers (NVDA, JAWS, VoiceOver)
   - Keyboard navigation
   - Voice control
4. Validate color contrast
5. Check semantic HTML
6. Verify ARIA labels

**Agents**: a11y-specialist

**Deliverables**: Accessibility audit report, WCAG compliance status

**Note**: Accessibility audit on optimized version ensures optimizations didn't break accessibility

## Phase 6: Address Accessibility Issues

**Goal**: Fix accessibility violations

**Condition**: Only if WCAG Level AA violations found

**Actions**:

1. Review accessibility findings
2. Categorize by severity:
   - Critical: Blocks access for users
   - Major: Significant barrier
   - Minor: Usability issue
3. Fix critical and major issues
4. Re-validate with assistive technologies
5. Verify fixes don't impact performance (quick check)

**Agents**: a11y-specialist, frontend-engineer

**Deliverables**: Accessibility fixes, re-validation results

## Phase 7: SEO and Operations Audit

**Goal**: Final checks for SEO and operational readiness

**Actions**:

1. Launch seo-specialist for SEO audit
2. Check meta tags, structured data, robots.txt
3. Validate sitemap, canonical URLs
4. Launch devops-sre-architect for ops readiness
5. Review monitoring, logging, alerting
6. Check scalability and reliability
7. Validate deployment process

**Agents**: seo-specialist, devops-sre-architect

**Deliverables**: SEO optimization recommendations, operational readiness report

## Summary

Sequential audit complete with iterative remediation:

**Security:**

- ✅ Critical vulnerabilities addressed
- ✅ Security scan passed
- Remaining issues: [list with priorities]

**Performance:**

- Baseline: LCP [X]s, FID [X]ms, CLS [X], TTFB [X]ms
- After optimization: LCP [X]s, FID [X]ms, CLS [X], TTFB [X]ms
- Improvement: [percentages]
- Meets targets: [Yes/No with details]

**Accessibility:**

- ✅ WCAG 2.1 Level AA compliance
- Critical issues: Fixed
- Remaining minor issues: [list]

**SEO & Operations:**

- SEO score: [X]/100
- Operational readiness: [Ready/Needs work]
- Recommendations: [list]

**Overall Health:** [Excellent/Good/Needs Improvement]

**Next Steps:**

- Address remaining medium-priority issues
- Monitor performance in production
- Schedule follow-up audit in [timeframe]

---

## Usage Examples

**Full sequential audit:**
```

/sequential-audit

```

**Start from specific phase (if previous phases complete):**
```

/sequential-audit "Start from performance audit"

```

**Focus on specific areas:**
```

/sequential-audit "Focus on security and performance only"

```

```

### Usage

```bash
# Run complete sequential audit with remediation
/sequential-audit

# Resume from specific phase
/sequential-audit "Continue from accessibility audit"
```

## Key Differences from Parallel henry-audit

### Execution Model

| Parallel (henry-audit) | Sequential (this example)          |
| ---------------------- | ---------------------------------- |
| All agents at once     | One phase at a time                |
| 5-10 minute total      | 30-60 minutes total                |
| No dependencies        | Each builds on previous            |
| No intermediate fixes  | Fix critical issues between phases |
| Independent reports    | Cumulative improvements            |

### Benefits of Sequential

✅ **Issues fixed immediately**: Critical problems addressed before proceeding
✅ **Clean baseline**: Each phase works on improved codebase
✅ **No rework**: Don't waste time on code that will change
✅ **Verification**: Each fix validated before moving forward
✅ **Learning**: Understand impact of changes on different aspects

### Tradeoffs

❌ **Longer execution**: Sequential takes 3-6x longer than parallel
❌ **More involved**: Requires user decisions between phases
❌ **Context switching**: Team needs to stay engaged throughout

## When to Use Each Approach

### Use Sequential When:

- ✅ Critical issues likely (new codebase, major changes)
- ✅ Want to fix issues immediately
- ✅ Team available to address findings
- ✅ Prefer iterative improvement over comprehensive report
- ✅ Changes in one area affect others (security → performance)

### Use Parallel When:

- ✅ Mature codebase with few critical issues expected
- ✅ Want comprehensive overview quickly
- ✅ Will address all issues after full audit
- ✅ Different teams handle different concerns independently
- ✅ Time-sensitive need for audit results

## Workflow Variations

### Variation 1: Parallel with Sequential Fixes

Combine both approaches:

```markdown
# Hybrid Audit Workflow

## Phase 1: Parallel Audit

**Actions**:

- Launch all agents in parallel
- Gather all findings quickly

## Phase 2: Prioritize Findings

**Actions**:

- Review all findings together
- Prioritize cross-cutting issues
- Create remediation plan

## Phase 3: Sequential Fixes

**Actions**:

1. Fix security issues
2. Re-validate security
3. Fix performance issues
4. Re-validate performance
5. Continue for each area
```

### Variation 2: Conditional Sequential

Sequential only when needed:

```markdown
# Smart Audit

## Phase 1: Quick Parallel Scan

**Actions**:

- Run lightweight scans in parallel
- Identify if critical issues exist

## Phase 2: Decision Point

If critical issues found:
→ Switch to sequential remediation
Otherwise:
→ Complete parallel audit and batch fixes
```

### Variation 3: Grouped Sequential

Group related phases:

```markdown
# Grouped Sequential Audit

## Phase 1: Security & Performance (Parallel)

**Actions**:

- Run security-engineer and performance-engineer together
- Both work on same baseline

## Phase 2: Fix Technical Issues

**Actions**:

- Address security and performance together

## Phase 3: UX Audit (Parallel)

**Actions**:

- Run a11y-specialist and ux-ui-designer together
- Work on technically-sound codebase

## Phase 4: Fix UX Issues
```

## Implementation Tips

### Clear Decision Points

Make decision criteria explicit:

```markdown
**Decision Point:**

- If critical (CVSS >= 9.0) issues found → Must fix before proceeding
- If high (CVSS 7.0-8.9) issues found → User decision
- If only medium/low issues → Proceed with note
```

### User Interaction Points

Specify when user input needed:

```markdown
**User Interaction:**

1. Review security findings
2. Decide: Fix now or accept risk and proceed?
3. If fixing: Implement fixes
4. Confirm ready to proceed to next phase
```

### Progress Tracking

Track cumulative improvements:

```markdown
## Summary (Updated After Each Phase)

**Phase 1 Complete:** Security audit done, 3 critical issues found
**Phase 2 Complete:** Critical issues fixed, security re-validated ✅
**Phase 3 Complete:** Performance baseline established
**Phase 4 In Progress:** Optimizing LCP...
```

### Validation Steps

Always re-validate after fixes:

```markdown
## Phase 2: Security Fixes

**Actions**:

1. Implement fixes
2. **Re-run security scan** ← Critical
3. Verify no new issues introduced
4. Confirm critical issues resolved
```

## Combining with Other Patterns

### Sequential + Extended

Add phases sequentially:

```markdown
# Sequential Audit with Deployment

[Standard sequential phases 1-7]

## Phase 8: Deployment Readiness

**Condition**: Only if all previous phases passed

**Actions**:

- Prepare deployment
- Works on fully audited and optimized codebase
```

### Sequential + Subset

Run fewer phases sequentially:

```markdown
# Sequential Security and Performance

## Phase 1: Security Audit

## Phase 2: Fix Security

## Phase 3: Performance Audit

## Phase 4: Optimize Performance

[Skip accessibility, SEO, ops]
```

### Sequential + Iterative

Add explicit iteration:

```markdown
# Iterative Performance Optimization

## Phase 1: Baseline Measurement

## Phase 2: Optimization Cycle

**Actions**:

1. Implement optimization
2. Measure impact
3. If target not met → Repeat (max 3 cycles)
4. If target met → Proceed

## Phase 3: Final Validation
```

## Related Examples

- **Subset Agents**: `examples/subset-agents.md`
- **Extended Workflow**: `examples/extended-workflow.md`
- **Mobile Workflow**: `examples/mobile-workflow.md`
- **All Patterns**: `references/customization-patterns.md`
