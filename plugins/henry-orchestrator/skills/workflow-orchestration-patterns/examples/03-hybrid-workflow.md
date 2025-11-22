# Hybrid Workflow Example

## Pattern Overview

Hybrid workflows combine sequential and parallel phases, leveraging the benefits of both patterns. Sequential phases handle dependencies, while parallel phases maximize efficiency for independent work.

## Structure

```
Phase 1 → [Phase 2a + Phase 2b] → Phase 3 → [Phase 4a + Phase 4b + Phase 4c]
```

## Use Case: MVP Product Launch

**Scenario**: Launch a minimum viable product with complete strategy, design, implementation, review, and deployment

### Workflow Steps

#### Phase 1: Product Strategy (Sequential)

```bash
/henry-orchestrator:henry-product MVP feature set and launch strategy
```

**Why Sequential**: All subsequent work depends on strategic direction

**Objective**: Define MVP scope, features, and success metrics

**Agent**: product-strategist

**Deliverables**:

- Product Requirements Document (PRD)
- MVP feature prioritization (RICE/ICE scores)
- Success metrics and KPIs
- Market positioning
- Launch timeline

**Duration**: 2-4 hours

**Dependencies**: None (starting point)

---

#### Phase 2: Design + Technical Specification (Parallel)

Run these in parallel since design and backend architecture are independent:

**Design Track**

```bash
/henry-orchestrator:henry-design MVP user interface and flows
```

**Agents**: ux-researcher, ux-ui-designer, a11y-specialist
**Focus**: User experience and visual design
**Deliverables**:

- User research insights
- Wireframes and user flows
- High-fidelity mockups
- Design system components
  **Duration**: 4-8 hours

---

**Technical Specification Track**

```bash
/henry-orchestrator:henry-team backend-engineer devops-sre-architect - Define MVP architecture and API design
```

**Agents**: backend-engineer, devops-sre-architect
**Focus**: Backend architecture and infrastructure
**Deliverables**:

- System architecture diagram
- API specification (OpenAPI)
- Database schema
- Infrastructure requirements
  **Duration**: 4-6 hours

---

**Why Parallel**: Design and backend architecture can proceed independently using the PRD

---

#### Phase 3: Integration and Agreement (Sequential)

```bash
# Manual review of designs + technical spec
# Ensure frontend designs can be implemented with backend API
```

**Objective**: Align design with technical capabilities

**Activities**:

- Review API endpoints support UI requirements
- Verify data models match UI needs
- Resolve any conflicts
- Create integration contract

**Duration**: 1-2 hours

**Dependencies**: Requires both Phase 2 outputs

---

#### Phase 4: Implementation (Parallel)

With aligned specifications, implement in parallel:

**Frontend Track**

```bash
/henry-orchestrator:henry-team frontend-engineer a11y-specialist - Implement MVP UI
```

**Agents**: frontend-engineer, a11y-specialist
**Focus**: Build UI components with accessibility
**Deliverables**: React application, accessible components
**Duration**: 3-5 days

---

**Backend Track**

```bash
/henry-orchestrator:henry-team backend-engineer - Implement MVP API and database
```

**Agents**: backend-engineer, security-engineer
**Focus**: Build API and data layer
**Deliverables**: REST API, database implementation, auth
**Duration**: 3-5 days

---

**DevOps Track**

```bash
/henry-orchestrator:henry-team devops-sre-architect - Set up CI/CD and infrastructure
```

**Agents**: devops-sre-architect
**Focus**: Infrastructure and deployment automation
**Deliverables**: CI/CD pipelines, staging/production environments
**Duration**: 2-4 days

---

**Why Parallel**: Frontend, backend, and infrastructure are independent

---

#### Phase 5: Integration Testing (Sequential)

```bash
/henry-orchestrator:henry-team qa-tester frontend-engineer backend-engineer - Integration testing
```

**Objective**: Verify all pieces work together

**Agents**: qa-tester, frontend-engineer, backend-engineer

**Activities**:

- End-to-end testing
- API integration validation
- Bug fixing
- Performance testing

**Duration**: 1-2 days

**Dependencies**: Requires all Phase 4 implementations

---

#### Phase 6: Pre-Launch Activities (Parallel)

Final preparations can happen simultaneously:

**Audit Track**

```bash
/henry-orchestrator:henry-audit comprehensive pre-launch audit
```

**Focus**: Security, performance, accessibility
**Duration**: 2-3 hours

---

**SEO Track**

```bash
/henry-orchestrator:henry-team seo-specialist - SEO optimization and sitemap
```

**Focus**: Search engine optimization
**Duration**: 2-3 hours

---

**Analytics Track**

```bash
/henry-orchestrator:henry-team data-analytics-engineer - Set up analytics and monitoring
```

**Focus**: Analytics instrumentation, dashboards
**Duration**: 2-3 hours

---

**Why Parallel**: These are independent final checks

---

#### Phase 7: Issue Resolution (Sequential)

```bash
/henry-orchestrator:henry-optimize fix critical and high-priority issues
```

**Objective**: Address issues found in Phase 6

**Duration**: 4-8 hours (depends on findings)

**Dependencies**: Requires Phase 6 audit results

---

#### Phase 8: Launch (Sequential)

```bash
/henry-orchestrator:henry-launch MVP to production
```

**Objective**: Production deployment with monitoring

**Agents**: devops-sre-architect, qa-tester, security-engineer

**Deliverables**:

- Deployment runbook
- Monitoring dashboards
- Rollback procedure
- Launch checklist sign-off

**Duration**: 2-4 hours

**Dependencies**: Requires fixes from Phase 7

---

## Complete Workflow Timeline

**Total Duration**: 2-3 weeks

```
Week 1:
- Day 1: Strategy (Phase 1)
- Day 1-2: Design + Technical Spec in parallel (Phase 2)
- Day 2: Integration Review (Phase 3)
- Day 3-5: Implementation in parallel (Phase 4)

Week 2:
- Day 1-2: Integration Testing (Phase 5)
- Day 3: Pre-launch activities in parallel (Phase 6)
- Day 4: Issue Resolution (Phase 7)
- Day 5: Launch (Phase 8)
```

**Efficiency**: 40% faster than fully sequential approach

---

## Workflow Diagram

```
Strategy (4h)
    ↓
[Design (8h) + Backend Spec (6h)]  ← Parallel
    ↓
Integration Review (2h)
    ↓
[Frontend (5d) + Backend (5d) + DevOps (4d)]  ← Parallel
    ↓
Integration Testing (2d)
    ↓
[Audit (3h) + SEO (3h) + Analytics (3h)]  ← Parallel
    ↓
Issue Resolution (8h)
    ↓
Launch (4h)
```

## Key Success Factors

1. **Clear Dependencies**: Know when work can be parallelized vs. must be sequential
2. **Integration Points**: Plan synchronization between parallel tracks
3. **Communication**: Regular syncs between parallel teams
4. **Flexible Resources**: Ability to shift focus as needed

## When to Use Hybrid Workflow

✅ **Use when**:

- Complex projects with both dependencies and parallelizable work
- Medium to large projects (2+ weeks)
- Multiple team members or domains
- Need to optimize for speed without sacrificing quality

❌ **Avoid when**:

- Simple projects (use linear instead)
- Solo developer with no time savings from parallelization
- Unclear dependencies (too risky to parallelize)
- Tight coupling between all components

## Variations

### Design-Heavy Hybrid

More design iterations with parallel implementation:

```
Strategy → Design v1 → Review → Design v2 → [Frontend + Backend] → Testing → Launch
```

### Continuous Integration Hybrid

Integrate continuously during parallel development:

```
Strategy → [Design + Spec] → [Frontend + Backend] (with daily integration) → Testing → Launch
```

### Multi-Team Hybrid

Multiple feature teams with parallel tracks:

```
Strategy → [Feature A team + Feature B team + Feature C team] → Integration → Testing → Launch
```

## Common Pitfalls

### ❌ Premature Parallelization

```
Wrong: [Strategy + Design + Implementation] all in parallel
```

**Problem**: Design needs strategy, implementation needs design

**Fix**: Identify true dependencies

```
Right: Strategy → [Design + Backend Spec] → [Frontend + Backend]
```

---

### ❌ No Integration Points

```
Wrong: [Frontend + Backend] parallel with no check-ins → Merge at end
```

**Problem**: Major integration issues discovered too late

**Fix**: Add integration checkpoints

```
Right: [Frontend + Backend] with daily integration tests
```

---

### ❌ Unbalanced Parallel Work

```
Wrong: [2-day task + 10-day task] in parallel
```

**Problem**: Workflow blocked by longest task; shorter task resources idle

**Fix**: Balance parallel workloads

```
Right: Split 10-day task or add more work to 2-day track
```

---

### ❌ Too Many Parallel Tracks

```
Wrong: [5 parallel tracks with 2 developers]
```

**Problem**: Context switching overhead, resource contention

**Fix**: Match parallelization to capacity

```
Right: 2 parallel tracks for 2 developers
```

## Coordination Strategies

### Daily Standups

During parallel phases, hold daily syncs:

- What did you complete?
- What are you working on?
- Any blockers or conflicts?

### Integration Checkpoints

Schedule regular integration points:

- Daily: Smoke tests of integration
- Mid-phase: Comprehensive integration test
- End-phase: Full integration validation

### Shared Artifacts

Maintain shared documentation:

- API contracts (OpenAPI spec)
- Data models (database schema)
- Design tokens (for consistency)
- Architecture decisions (ADRs)

### Clear Ownership

Define clear ownership boundaries:

- Frontend: UI components, state management
- Backend: API endpoints, business logic
- DevOps: Infrastructure, CI/CD
- QA: Test strategy, test execution

## Monitoring and Success Metrics

Track these metrics to evaluate hybrid workflow effectiveness:

- **Parallel efficiency**: Time saved vs. fully sequential (target 30-50% reduction)
- **Integration issues**: Bugs found during integration (target < 5 per sprint)
- **Idle time**: Resources waiting for dependencies (target < 10%)
- **Coordination overhead**: Time spent in syncs and handoffs (target < 15%)

## Optimization Tips

### 1. Front-Load Dependencies

Get dependencies done early:

```
Better: Quick strategy (2h) → Parallel work (5d)
Worse: Detailed strategy (2d) → Parallel work (3d)
```

### 2. Maximize Parallel Duration

Design phases to maximize parallel time:

```
Better: [5d + 5d + 5d] parallel → 2d sequential
Worse: 2d sequential → [2d + 2d + 2d] parallel → 2d sequential
```

### 3. Pipeline Stages

Overlap phases with pipeline approach:

```
Phase 1 complete → Phase 2 starts
Phase 2 50% done → Phase 3 starts (if possible)
```

### 4. Buffer for Integration

Always budget time for integration:

```
[Parallel implementation: 5d] + [Integration buffer: 1d] = 6d total
```

## Related Patterns

- **Linear Workflow**: Fully sequential (simpler but slower)
- **Parallel Workflow**: Fully parallel (faster but needs independence)
- **Cascading Workflow**: Specific hybrid pattern (1 → [N] → 1)
- **Iterative Workflow**: Repeated hybrid cycles
