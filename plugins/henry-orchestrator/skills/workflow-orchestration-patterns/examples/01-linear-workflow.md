# Linear Workflow Example

## Pattern Overview

Linear workflows execute phases sequentially, with each phase building on the output of the previous phase. This is the most common orchestration pattern for feature development.

## Structure

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

## Use Case: Full Feature Development

**Scenario**: Build a user analytics dashboard with real-time metrics

### Workflow Steps

#### 1. Strategy Phase

```bash
/henry-orchestrator:henry-product dashboard with real-time analytics
```

**Objective**: Define product requirements and success metrics

**Agent**: product-strategist

**Deliverables**:

- Product Requirements Document (PRD)
- User stories and acceptance criteria
- Success metrics (DAU, engagement rate, feature adoption)
- Technical constraints and dependencies

**Duration**: 1-3 hours

---

#### 2. Design Phase

```bash
/henry-orchestrator:henry-design analytics dashboard with data visualizations
```

**Objective**: Create complete UX/UI design for the dashboard

**Agents**: ux-researcher, ux-ui-designer, ui-visual-designer, a11y-specialist

**Deliverables**:

- User research insights
- Wireframes and user flows
- High-fidelity designs
- Component specifications
- Accessibility compliance documentation

**Duration**: 4-8 hours

**Dependencies**: Requires PRD from Phase 1

---

#### 3. Implementation Phase

```bash
/henry-orchestrator:henry-feature implement analytics dashboard with WebSocket updates
```

**Objective**: Build the dashboard with real-time data

**Agents**: frontend-engineer, backend-engineer, qa-tester, security-engineer, performance-engineer

**Deliverables**:

- React dashboard components
- WebSocket API for real-time updates
- Database schema for analytics data
- Unit and integration tests
- Security review

**Duration**: 1-5 days

**Dependencies**: Requires designs from Phase 2

---

#### 4. Review Phase

```bash
/henry-orchestrator:henry-review staged changes
```

**Objective**: Comprehensive quality assurance before merge

**Agents**: qa-tester, security-engineer, performance-engineer, frontend-engineer, backend-engineer

**Deliverables**:

- Code review feedback
- Security vulnerability assessment
- Performance benchmark results
- QA test results
- Bug reports and fixes

**Duration**: 2-4 hours

**Dependencies**: Requires implementation from Phase 3

---

#### 5. Launch Phase

```bash
/henry-orchestrator:henry-launch analytics dashboard to production
```

**Objective**: Deploy to production with monitoring

**Agents**: devops-sre-architect, seo-specialist, data-analytics-engineer, qa-tester, security-engineer

**Deliverables**:

- Deployment plan
- Monitoring dashboards
- Alert configurations
- Analytics instrumentation
- Rollback procedure
- Launch checklist sign-off

**Duration**: 2-4 hours

**Dependencies**: Requires approved review from Phase 4

---

## Complete Workflow Timeline

**Total Duration**: 2-7 days (depending on complexity)

```
Day 1: Strategy + Design
Day 2-5: Implementation
Day 6: Review + Fixes
Day 7: Launch
```

## Key Success Factors

1. **Sequential Dependencies**: Each phase requires outputs from previous phase
2. **Clear Handoffs**: Documented deliverables passed between phases
3. **Quality Gates**: Review checkpoints prevent issues from propagating
4. **Complete Documentation**: PRD, designs, tests, and deployment docs

## When to Use Linear Workflow

✅ **Use when**:

- Clear dependencies between phases
- Later work requires earlier outputs
- Building new features from scratch
- Need comprehensive documentation at each stage

❌ **Avoid when**:

- Phases can run independently
- Need faster iteration
- Working on small, isolated changes
- Uncertain requirements (use iterative instead)

## Variations

### Fast-Track Linear Workflow

For simpler features, skip certain phases:

```bash
/henry-orchestrator:henry-team product-strategist  # Quick strategy (30 min)
/henry-orchestrator:henry-design                    # Design (2-4 hours)
/henry-orchestrator:henry-feature                   # Implementation (1-2 days)
/henry-orchestrator:henry-review                    # Review (1 hour)
# Deploy without full launch workflow
```

### Extended Linear Workflow

For complex features, add additional phases:

```bash
/henry-orchestrator:henry-product                   # Strategy
/henry-orchestrator:henry-team ux-researcher        # User research (separate phase)
/henry-orchestrator:henry-design                    # Design
/henry-orchestrator:henry-team backend-engineer     # API design (separate phase)
/henry-orchestrator:henry-feature                   # Implementation
/henry-orchestrator:henry-review                    # Code review
/henry-orchestrator:henry-audit                     # Pre-launch audit
/henry-orchestrator:henry-optimize                  # Fix critical issues
/henry-orchestrator:henry-launch                    # Production launch
```

## Common Pitfalls

### ❌ Skipping Strategy

```
Wrong: henry-design → henry-feature → [builds wrong thing]
Right: henry-product → henry-design → henry-feature
```

**Impact**: Building features users don't need, unclear success criteria

### ❌ Design After Implementation

```
Wrong: henry-feature → [poor UX] → henry-design (redesign)
Right: henry-design → henry-feature (implement designs)
```

**Impact**: Expensive redesigns, technical debt, poor user experience

### ❌ No Review Phase

```
Wrong: henry-feature → Deploy → [production incidents]
Right: henry-feature → henry-review → Fix → Deploy
```

**Impact**: Security vulnerabilities, performance issues, bugs in production

## Monitoring and Success Metrics

Track these metrics to evaluate workflow effectiveness:

- **Cycle time**: Time from henry-product to production deployment
- **Phase duration**: Time spent in each phase (identify bottlenecks)
- **Rework rate**: Features requiring redesign or re-implementation (should be < 10%)
- **Review pass rate**: Features passing review without major issues (target > 80%)
- **Production incidents**: Bugs found post-launch (target < 2 per feature)

## Related Patterns

- **Hybrid Workflow**: Mix sequential and parallel phases for complex projects
- **Iterative Workflow**: Repeated cycles for continuous improvement
- **Design-First Workflow**: Skip strategy for UI-focused projects
