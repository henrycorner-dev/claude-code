# Parallel Workflow Example

## Pattern Overview

Parallel workflows execute independent tasks simultaneously to maximize efficiency and reduce total cycle time. Tasks have no dependencies on each other and can be synthesized at the end.

## Structure

```
     ┌─ Task A ─┐
     ├─ Task B ─┤ → Synthesis
     └─ Task C ─┘
```

## Use Case: Comprehensive Project Audit

**Scenario**: Pre-launch audit across security, performance, and accessibility domains

### Workflow Steps

#### Phase 1: Parallel Audits (Run Simultaneously)

Execute all three audits in parallel since they're independent:

**Security Audit**

```bash
/henry-orchestrator:henry-team security-engineer - Comprehensive security audit
```

**Agents**: security-engineer
**Focus**:

- Threat modeling
- Vulnerability scanning
- Authentication/authorization review
- Data encryption validation
- OWASP Top 10 compliance

**Deliverables**:

- Security vulnerabilities (Critical/High/Medium/Low)
- Threat model documentation
- Security test results

**Duration**: 2-3 hours

---

**Performance Audit**

```bash
/henry-orchestrator:henry-team performance-engineer - Performance baseline and audit
```

**Agents**: performance-engineer
**Focus**:

- Core Web Vitals (LCP, CLS, INP)
- Load time analysis
- Bundle size optimization
- Database query performance
- API response times

**Deliverables**:

- Performance metrics report
- Bottleneck identification
- Optimization recommendations

**Duration**: 2-3 hours

---

**Accessibility Audit**

```bash
/henry-orchestrator:henry-team a11y-specialist - WCAG 2.1 AA compliance audit
```

**Agents**: a11y-specialist
**Focus**:

- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation
- Color contrast
- ARIA implementation

**Deliverables**:

- A11y violation report
- WCAG compliance status
- Remediation priorities

**Duration**: 2-3 hours

---

#### Phase 2: Synthesis and Prioritization

After all audits complete, synthesize findings:

**Critical Issues** (must fix before launch):

- Security: 3 critical vulnerabilities
- Performance: LCP 4.2s (failing Core Web Vitals)
- A11y: 12 WCAG AA violations

**High Priority** (fix ASAP):

- Security: 5 high-risk issues
- Performance: 8 optimization opportunities
- A11y: 15 warnings

**Action Plan**:

```bash
/henry-orchestrator:henry-optimize fix critical security and performance issues
# Then address high-priority items
```

---

## Complete Workflow Timeline

**Total Duration**: 2-3 hours (vs. 6-9 hours if sequential)

```
Hour 1-3: All three audits run in parallel
Hour 3-3.5: Synthesize findings and prioritize
```

**Efficiency Gain**: 67% reduction in cycle time

## Key Success Factors

1. **True Independence**: Tasks must not depend on each other's outputs
2. **Resource Availability**: Sufficient agent capacity to run simultaneously
3. **Clear Synthesis Plan**: Know how to combine results before starting
4. **Consistent Format**: Ensure all outputs use compatible formats

## When to Use Parallel Workflow

✅ **Use when**:

- Tasks are truly independent
- No sequential dependencies
- Multiple perspectives on same artifact
- Time-sensitive deliverables
- Sufficient resources available

❌ **Avoid when**:

- Tasks have dependencies
- Later tasks need earlier outputs
- Limited resources (better to sequence)
- Tasks require shared state

## Variations

### Parallel Development Tracks

**Scenario**: Frontend and backend can develop simultaneously

```bash
# Both run in parallel
/henry-orchestrator:henry-team frontend-engineer - Build dashboard UI
/henry-orchestrator:henry-team backend-engineer - Build analytics API
```

**Duration**: 2-3 days each (vs. 4-6 days sequential)

**Prerequisites**:

- API contract agreed upon (OpenAPI spec)
- Mock data available for frontend
- Clear interface boundaries

---

### Parallel Review Domains

**Scenario**: Multiple reviewers provide domain-specific feedback

```bash
# All review same codebase in parallel
/henry-orchestrator:henry-team qa-tester - QA testing
/henry-orchestrator:henry-team security-engineer - Security review
/henry-orchestrator:henry-team performance-engineer - Performance review
```

**Duration**: 1-2 hours each

**Output**: Comprehensive review from multiple perspectives

---

### Parallel Feature Teams

**Scenario**: Multiple teams building independent features

```bash
# Team A
/henry-orchestrator:henry-feature user authentication system

# Team B
/henry-orchestrator:henry-feature analytics dashboard

# Team C
/henry-orchestrator:henry-feature notification service
```

**Duration**: 1 week each (all parallel)

**Prerequisites**:

- Clear feature boundaries
- No shared state or dependencies
- Separate database schemas

---

## Example: Multi-Domain Audit Script

Use this approach to run comprehensive audits efficiently:

```bash
# Step 1: Launch all audits in parallel (send single message with multiple commands)
/henry-orchestrator:henry-team security-engineer - Security audit
/henry-orchestrator:henry-team performance-engineer - Performance audit
/henry-orchestrator:henry-team a11y-specialist - Accessibility audit
/henry-orchestrator:henry-team seo-specialist - SEO audit

# Wait for all to complete (2-3 hours)

# Step 2: Synthesize findings
# Review all audit reports and create prioritized issue list

# Step 3: Fix issues in parallel (where possible)
/henry-orchestrator:henry-team security-engineer backend-engineer - Fix security issues
/henry-orchestrator:henry-team performance-engineer frontend-engineer - Fix performance issues
```

## Common Pitfalls

### ❌ Hidden Dependencies

```
Wrong: [ux-researcher + ux-ui-designer] in parallel
```

**Problem**: Designer needs research insights to design effectively

**Fix**: Run sequentially

```
Right: ux-researcher → ux-ui-designer
```

---

### ❌ Resource Contention

```
Wrong: Launch 10 parallel henry-feature commands for one developer
```

**Problem**: Single developer can't implement 10 features simultaneously

**Fix**: Sequence based on capacity

```
Right: 2-3 parallel tracks matching team size
```

---

### ❌ Incompatible Outputs

```
Wrong: Parallel implementations without agreed interfaces
```

**Problem**: Frontend and backend APIs don't align

**Fix**: Agree on contracts first

```
Right:
1. Define API contract (OpenAPI spec)
2. Then run parallel: frontend + backend
```

---

### ❌ No Synthesis Plan

```
Wrong: Run parallel audits with no plan to combine results
```

**Problem**: Duplicate issues, inconsistent priorities, no action plan

**Fix**: Pre-define synthesis approach

```
Right:
1. Run parallel audits with standard severity levels
2. Deduplicate issues
3. Prioritize by severity and domain
4. Create unified action plan
```

## Monitoring and Success Metrics

Track these metrics to evaluate parallel workflow effectiveness:

- **Cycle time reduction**: Compare to sequential execution (target 50-70% reduction)
- **Resource utilization**: Ensure agents are fully utilized (target > 80%)
- **Rework due to conflicts**: Issues requiring rework after parallel execution (target < 5%)
- **Synthesis overhead**: Time spent combining parallel outputs (target < 10% of total time)

## Coordination Tips

### Clear Boundaries

Define clear boundaries before starting parallel work:

- Separate files/directories
- Distinct API endpoints
- Independent database tables
- Non-overlapping features

### Communication Protocol

Establish communication channels:

- Shared issue tracker
- Regular sync meetings (daily standup)
- Documented decisions (ADRs)
- Clear escalation path

### Integration Strategy

Plan integration before starting:

- Merge order and strategy
- Conflict resolution approach
- Integration testing plan
- Rollback procedures

## Related Patterns

- **Hybrid Workflow**: Combine sequential and parallel phases
- **Cascading Workflow**: One phase → parallel phases → synthesis phase
- **Linear Workflow**: All sequential (no parallelization)
