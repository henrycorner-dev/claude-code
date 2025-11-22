---
name: workflow-orchestration-patterns
description: This skill should be used when users ask about orchestrating workflows, sequencing commands, coordinating multi-phase processes, or planning end-to-end feature development. Trigger on phrases like "orchestrate workflow", "plan feature development", "sequence commands", "coordinate agents", "multi-phase workflow", "end-to-end development", "launch preparation", "optimization sprint", "parallel workflows", or when users need to combine multiple Henry commands (henry-product, henry-design, henry-feature, henry-review, henry-audit, henry-launch, henry-optimize). Examples - <example>user - "Build and launch a user dashboard with analytics"; assistant - "I'll orchestrate this workflow: /henry-orchestrator:henry-product to define strategy and metrics → /henry-orchestrator:henry-design for UX/UI → /henry-orchestrator:henry-feature for implementation → /henry-orchestrator:henry-review before merge → /henry-orchestrator:henry-launch for production prep"; <commentary>Complete feature lifecycle requires strategy, design, implementation, review, and launch phases in sequence</commentary></example> <example>user - "Get ready for production launch next week"; assistant - "I'll run a pre-launch workflow: /henry-orchestrator:henry-audit for comprehensive health check → /henry-orchestrator:henry-optimize to fix critical issues → /henry-orchestrator:henry-launch for final readiness"; <commentary>Launch preparation requires audit to identify issues, optimization to fix them, then launch checklist</commentary></example>
---

# Workflow Orchestration Patterns

Use this skill to orchestrate Henry Orchestrator commands and agents into effective multi-phase workflows. Apply these proven patterns to sequence commands, coordinate agent handoffs, and manage complex end-to-end processes.

## Overview

Henry Orchestrator provides 9 commands that can be combined into powerful workflows:

1. **henry-product** - Product strategy and planning
2. **henry-design** - Complete design workflow
3. **henry-feature** - Full feature development
4. **henry-review** - Multi-agent code review
5. **henry-audit** - Comprehensive project audit
6. **henry-launch** - Product launch preparation
7. **henry-optimize** - Performance optimization
8. **henry-team** - Custom agent teams
9. **help** - Command and agent reference

Plus 16 specialist agents that can be orchestrated independently for custom workflows.

## Core Workflow Patterns

### Pattern 1: Linear Workflow

**Structure**: Sequential phases, each building on previous output

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

**When to use**: Clear dependencies between phases, later work requires earlier outputs

**Example workflows**:
- Strategy → Design → Implementation → Launch
- Research → Design → Development → Testing → Deployment
- Audit → Optimize → Verify → Launch

### Pattern 2: Parallel Workflow

**Structure**: Independent tasks executed simultaneously

```
     ┌─ Task A ─┐
     ├─ Task B ─┤ → Synthesis
     └─ Task C ─┘
```

**When to use**: Independent audits, multiple perspectives on same artifact, no sequential dependencies

**Example workflows**:
- Security audit + Performance audit + A11y audit (simultaneous)
- Frontend development + Backend development (parallel tracks)
- Multiple feature teams working independently

### Pattern 3: Hybrid Workflow

**Structure**: Mix of sequential and parallel phases

```
Phase 1 → [Phase 2a + Phase 2b] → Phase 3 → [Phase 4a + Phase 4b + Phase 4c]
```

**When to use**: Complex projects with both dependencies and parallelizable work

**Example workflows**:
- Strategy → [Design + Technical Spec] → [Frontend + Backend] → [Testing + Docs] → Launch
- Audit → [Fix Critical + Fix High Priority] → Verify → [Performance Optimize + SEO Optimize]

### Pattern 4: Iterative Workflow

**Structure**: Repeated cycles with refinement

```
Plan → Build → Review → Refine → (repeat until done)
```

**When to use**: Agile development, continuous improvement, user feedback loops

**Example workflows**:
- Sprint cycles: Plan → Develop → Review → Retrospective → Next Sprint
- Design iterations: Research → Design → Test → Refine → Retest
- Optimization loops: Baseline → Optimize → Benchmark → Iterate

## Command Orchestration Patterns

### Full Feature Development Workflow

**Commands**: henry-product → henry-design → henry-feature → henry-review → henry-launch

**Purpose**: Complete feature from concept to production

**Phases**:

1. **Strategy Phase** (`henry-product`)
   - Product requirements and PRD
   - Feature prioritization (RICE/ICE)
   - Success metrics and KPIs
   - Market analysis if needed
   - **Agents**: product-strategist, data-analytics-engineer
   - **Duration**: 1-3 hours
   - **Deliverables**: PRD, metrics plan, competitive analysis

2. **Design Phase** (`henry-design`)
   - User research and personas
   - UX flows and wireframes
   - Visual design and style guide
   - Accessibility review
   - **Agents**: ux-researcher, ux-ui-designer, ui-visual-designer, a11y-specialist
   - **Duration**: 4-8 hours
   - **Deliverables**: Research insights, wireframes, high-fidelity designs, a11y compliance report

3. **Implementation Phase** (`henry-feature`)
   - Frontend and backend development
   - Database schema and API design
   - Testing and security review
   - Performance optimization
   - **Agents**: frontend-engineer, backend-engineer, qa-tester, security-engineer, performance-engineer
   - **Duration**: 1-5 days depending on complexity
   - **Deliverables**: Working implementation, tests, documentation

4. **Review Phase** (`henry-review`)
   - Code quality review
   - Security vulnerability scan
   - Performance benchmarking
   - QA test execution
   - **Agents**: qa-tester, security-engineer, performance-engineer, relevant engineers
   - **Duration**: 2-4 hours
   - **Deliverables**: Code review findings, security report, performance metrics, test results

5. **Launch Phase** (`henry-launch`)
   - Deployment strategy
   - Monitoring and alerting setup
   - SEO optimization
   - Analytics instrumentation
   - Final go/no-go checklist
   - **Agents**: devops-sre-architect, seo-specialist, data-analytics-engineer, qa-tester, security-engineer
   - **Duration**: 2-4 hours
   - **Deliverables**: Deployment plan, monitoring dashboards, launch checklist

**Example**:
```
User: "Build a user dashboard with real-time analytics"

Workflow:
1. /henry-orchestrator:henry-product dashboard with real-time data requirements
   → PRD defining metrics, data sources, user segments

2. /henry-orchestrator:henry-design dashboard UI with data visualizations
   → Wireframes, high-fidelity designs, component specs

3. /henry-orchestrator:henry-feature implement dashboard with WebSocket updates
   → React dashboard + real-time API + tests

4. /henry-orchestrator:henry-review staged changes
   → Security review, performance check, QA validation

5. /henry-orchestrator:henry-launch dashboard to production
   → Deployment plan, monitoring, analytics
```

### Pre-Launch Audit Workflow

**Commands**: henry-audit → henry-optimize → henry-launch

**Purpose**: Ensure production readiness before launch

**Phases**:

1. **Audit Phase** (`henry-audit`)
   - Security vulnerability assessment
   - Performance baseline measurement
   - Accessibility compliance check
   - SEO technical audit
   - DevOps maturity assessment
   - **Agents**: security-engineer, performance-engineer, a11y-specialist, seo-specialist, devops-sre-architect
   - **Deliverables**: Comprehensive audit report with severity ratings

2. **Optimization Phase** (`henry-optimize`)
   - Fix critical and high-priority issues
   - Performance optimization
   - Security hardening
   - A11y remediation
   - **Agents**: performance-engineer, frontend-engineer, backend-engineer, security-engineer
   - **Deliverables**: Fixes implemented, benchmarks improved

3. **Launch Phase** (`henry-launch`)
   - Verify all critical issues resolved
   - Final production checklist
   - Deployment and rollback plan
   - Monitoring and alerting
   - **Agents**: devops-sre-architect, qa-tester, security-engineer
   - **Deliverables**: Go/no-go decision, launch playbook

**Example**:
```
User: "We're launching to production next week, need to ensure readiness"

Workflow:
1. /henry-orchestrator:henry-audit comprehensive pre-launch audit
   → Identifies 3 critical security issues, 5 performance problems, 8 a11y violations

2. /henry-orchestrator:henry-optimize fix critical security and performance issues
   → Security patches applied, bundle size reduced 40%, LCP improved to 2.1s

3. /henry-orchestrator:henry-launch production deployment
   → Deployment plan, monitoring dashboards, rollback procedure, go decision
```

### Design-First Workflow

**Commands**: henry-design → henry-team (frontend + a11y) → henry-review

**Purpose**: Design-driven development with accessibility built in

**Phases**:

1. **Design Phase** (`henry-design`)
   - Complete design workflow
   - **Deliverables**: Research, wireframes, high-fidelity designs, a11y specs

2. **Implementation Phase** (`henry-team frontend-engineer a11y-specialist`)
   - Frontend engineer implements designs
   - A11y specialist validates during implementation
   - **Deliverables**: Accessible implementation

3. **Review Phase** (`henry-review`)
   - Final validation
   - **Deliverables**: Sign-off for merge

**Example**:
```
User: "Design and build an accessible checkout flow"

Workflow:
1. /henry-orchestrator:henry-design checkout flow with accessibility focus
2. /henry-orchestrator:henry-team frontend-engineer a11y-specialist - Implement accessible checkout
3. /henry-orchestrator:henry-review checkout implementation
```

### Optimization Sprint Workflow

**Commands**: henry-team (performance baseline) → henry-optimize → henry-team (verification)

**Purpose**: Dedicated performance improvement sprint

**Phases**:

1. **Baseline Phase** (`henry-team performance-engineer data-analytics-engineer`)
   - Establish current performance metrics
   - Identify bottlenecks
   - Prioritize optimizations
   - **Deliverables**: Performance baseline, optimization priorities

2. **Optimization Phase** (`henry-optimize`)
   - Implement performance improvements
   - Frontend and backend optimizations
   - **Deliverables**: Optimized code, benchmark improvements

3. **Verification Phase** (`henry-team performance-engineer qa-tester`)
   - Validate improvements
   - Ensure no regressions
   - **Deliverables**: Performance report, regression test results

**Example**:
```
User: "Our landing page is too slow, need to meet Core Web Vitals"

Workflow:
1. /henry-orchestrator:henry-team performance-engineer - Baseline landing page performance
   → LCP: 4.2s, CLS: 0.18, INP: 350ms (all failing)

2. /henry-orchestrator:henry-optimize landing page for Core Web Vitals
   → Image optimization, code splitting, lazy loading, font optimization

3. /henry-orchestrator:henry-team performance-engineer qa-tester - Verify optimizations
   → LCP: 2.1s ✓, CLS: 0.08 ✓, INP: 180ms ✓ (all passing)
```

### Continuous Review Workflow

**Commands**: Iterative henry-review after each change

**Purpose**: Maintain quality through development

**Pattern**:
```
Develop → Review → Fix → Develop → Review → Fix → ...
```

**Example**:
```
Sprint workflow:
- Day 1: Implement feature A → /henry-orchestrator:henry-review
- Day 2: Fix review findings → /henry-orchestrator:henry-review
- Day 3: Implement feature B → /henry-orchestrator:henry-review
- Day 4: Fix review findings → /henry-orchestrator:henry-review
- Day 5: Final polish → /henry-orchestrator:henry-review → Merge
```

## Agent Orchestration Patterns

### Sequential Agent Handoff

**Pattern**: Agent A → Agent B → Agent C (each uses previous output)

**Use cases**:
- product-strategist → ux-ui-designer → frontend-engineer (strategy informs design informs implementation)
- ux-researcher → ux-ui-designer → a11y-specialist (research informs design, design validated for a11y)
- performance-engineer (identify) → frontend-engineer (implement) → performance-engineer (verify)

**Example**:
```
1. product-strategist: Define dashboard requirements and metrics
   Output: PRD with KPIs, user segments, success criteria

2. ux-ui-designer: Design dashboard using PRD requirements
   Output: Wireframes and high-fidelity designs

3. frontend-engineer: Implement dashboard from designs
   Output: React dashboard implementation

Each agent builds on previous work.
```

### Parallel Agent Execution

**Pattern**: [Agent A + Agent B + Agent C] → Synthesis

**Use cases**:
- Independent audits: [security-engineer + performance-engineer + a11y-specialist]
- Multiple domain reviews: [qa-tester + security-engineer + performance-engineer]
- Parallel development tracks: [frontend-engineer + backend-engineer]

**Example**:
```
Parallel security audit:
├─ security-engineer: Threat modeling, vulnerability scan
├─ qa-tester: Security test cases
└─ backend-engineer: Code review for security issues

All agents work independently, outputs synthesized into comprehensive security report.
```

### Cascading Agent Workflow

**Pattern**: Agent A → [Agent B + Agent C] → Agent D

**Use cases**:
- Strategy phase, then parallel design and technical spec, then implementation
- Audit phase, then parallel fixes, then verification

**Example**:
```
1. product-strategist: Define feature requirements
   Output: PRD

2. [ux-ui-designer + backend-engineer]: Parallel design and API spec
   Output: Designs + API specification

3. frontend-engineer: Implement UI connecting to API
   Output: Complete feature
```

### Iterative Refinement Pattern

**Pattern**: Agent A → Review → Agent A (refine) → Review → ...

**Use cases**:
- Design iterations with user feedback
- Code optimization cycles
- Progressive enhancement

**Example**:
```
Design iteration:
1. ux-ui-designer: Initial wireframes
2. ux-researcher: Usability testing
3. ux-ui-designer: Refined wireframes based on feedback
4. ux-researcher: Validation testing
5. ux-ui-designer: Final designs
```

## Workflow Coordination Strategies

### Synchronization Points

Implement synchronization points between phases to ensure quality:

**Checkpoints**:
- After strategy: Review and approve PRD before design
- After design: Review and approve designs before implementation
- After implementation: Review and approve code before deployment
- Before launch: Final go/no-go decision

**Example**:
```
henry-product → [CHECKPOINT: Approve PRD] → henry-design → [CHECKPOINT: Approve designs] → henry-feature → [CHECKPOINT: Code review] → henry-launch
```

### Feedback Loops

Build feedback mechanisms for course correction:

**Types**:
- **Backward loops**: Implementation issues requiring design changes
- **Forward loops**: Design insights informing strategy updates
- **Lateral loops**: Peer reviews within same phase

**Example**:
```
henry-feature (implementation) → [Issue found: Design doesn't account for error states]
→ henry-design (add error states) → henry-feature (implement error handling)
```

### Handoff Documentation

Document clean handoffs between agents/phases:

**Required**:
- Clear outputs from each phase
- Documented decisions and rationale
- Open questions and risks
- Success criteria for next phase

**Example**:
```
product-strategist handoff to ux-ui-designer:
✓ PRD with user stories
✓ Success metrics and KPIs
✓ Technical constraints
✓ Priority features (RICE scores)
? Open question: Mobile-first or desktop-first?
→ Risk: Integration with legacy system TBD
```

## Workflow Selection Guide

### By Project Size

**Small projects** (< 1 week):
- henry-team for focused tasks
- henry-review for quality checks
- Minimal ceremony, fast iteration

**Medium projects** (1-4 weeks):
- henry-product → henry-feature → henry-review
- Or henry-design → henry-team → henry-review
- Structured phases, clear milestones

**Large projects** (1-3 months):
- Full workflow: henry-product → henry-design → henry-feature → henry-review → henry-audit → henry-optimize → henry-launch
- Multiple teams, parallel tracks
- Comprehensive planning and reviews

### By Project Type

**New feature**:
```
henry-product → henry-design → henry-feature → henry-review
```

**Redesign**:
```
henry-design → henry-team (frontend + a11y) → henry-review
```

**Performance optimization**:
```
henry-team (performance baseline) → henry-optimize → verification
```

**Security hardening**:
```
henry-team (security audit) → fixes → henry-review (security focus)
```

**Product launch**:
```
henry-audit → henry-optimize → henry-launch
```

**Technical debt**:
```
henry-team (identify issues) → iterative fixes with henry-review
```

### By Team Size

**Solo developer**:
- Use henry commands for comprehensive guidance
- Sequential workflows with clear phases
- Let agents provide expertise you lack

**Small team (2-5)**:
- Parallel tracks where possible
- Use henry-team for collaboration
- Regular henry-review checkpoints

**Large team (6+)**:
- Multiple parallel workflows
- Dedicated quality gates (henry-audit, henry-review)
- Coordination via henry-launch for releases

## Common Workflow Anti-Patterns

### ❌ Anti-Pattern 1: Skipping Strategy

**Problem**: Jumping straight to implementation without strategy

**Consequence**: Building wrong thing, wasted effort, unclear success criteria

**Fix**: Always start with henry-product or product-strategist for new features
```
Wrong: henry-feature → [builds wrong thing]
Right: henry-product → henry-design → henry-feature
```

### ❌ Anti-Pattern 2: No Quality Gates

**Problem**: No reviews until end, issues found too late

**Consequence**: Expensive rework, missed issues, delayed launches

**Fix**: Regular henry-review checkpoints throughout development
```
Wrong: Develop for 2 weeks → henry-review (finds major issues)
Right: Develop → henry-review → Fix → Develop → henry-review → ...
```

### ❌ Anti-Pattern 3: Design After Implementation

**Problem**: Implementing first, then trying to make it look good

**Consequence**: Poor UX, expensive redesigns, technical debt

**Fix**: henry-design before henry-feature
```
Wrong: henry-feature → [doesn't match user needs] → henry-design (redesign)
Right: henry-design → henry-feature (implement designs)
```

### ❌ Anti-Pattern 4: Launch Without Audit

**Problem**: Deploying to production without comprehensive checks

**Consequence**: Production incidents, security breaches, poor performance

**Fix**: henry-audit → henry-optimize → henry-launch
```
Wrong: henry-feature → Deploy → [production incident]
Right: henry-feature → henry-audit → henry-optimize → henry-launch
```

### ❌ Anti-Pattern 5: Parallel Dependencies

**Problem**: Running agents in parallel when they need sequential outputs

**Consequence**: Wasted effort, need to redo work

**Fix**: Identify dependencies, sequence appropriately
```
Wrong: [ux-researcher + ux-ui-designer] in parallel (designer needs research)
Right: ux-researcher → ux-ui-designer (research informs design)
```

## Workflow Templates

### Template 1: MVP Launch
```
Goal: Launch minimum viable product

1. henry-product: Define MVP scope and success metrics
2. henry-design: Design core user flows
3. henry-feature: Implement MVP features
4. henry-review: Security and quality check
5. henry-audit: Pre-launch health check
6. henry-optimize: Fix critical issues
7. henry-launch: Production deployment

Timeline: 4-8 weeks
Team size: 2-5 people
```

### Template 2: Feature Addition
```
Goal: Add feature to existing product

1. henry-product: PRD and requirements (if complex)
   OR henry-team product-strategist (if simple)
2. henry-design: UX/UI design
3. henry-feature: Implementation
4. henry-review: Code review
5. Deploy

Timeline: 1-2 weeks
Team size: 1-3 people
```

### Template 3: Performance Sprint
```
Goal: Improve site performance

1. henry-team performance-engineer: Baseline metrics
2. henry-optimize: Implement optimizations
3. henry-team performance-engineer qa-tester: Verify improvements
4. Deploy

Timeline: 3-5 days
Team size: 1-2 people
```

### Template 4: Security Hardening
```
Goal: Improve security posture

1. henry-team security-engineer: Threat modeling and audit
2. henry-team backend-engineer security-engineer: Implement fixes
3. henry-review: Security-focused review
4. henry-team qa-tester: Security test execution
5. Deploy

Timeline: 1-2 weeks
Team size: 2-3 people
```

### Template 5: Accessibility Remediation
```
Goal: Achieve WCAG 2.1 AA compliance

1. henry-team a11y-specialist: Comprehensive audit
2. henry-team frontend-engineer a11y-specialist: Implement fixes
3. henry-review: A11y-focused review
4. henry-team a11y-specialist: Final validation
5. Deploy

Timeline: 1-3 weeks depending on violations
Team size: 1-2 people
```

## Advanced Orchestration Techniques

### Conditional Workflows

Adjust workflow based on intermediate results:

```
henry-audit
  → If critical issues found: henry-optimize → henry-audit (verify)
  → If no critical issues: henry-launch

henry-review
  → If major issues: Fix → henry-review (re-review)
  → If minor issues: Fix and deploy
  → If no issues: Deploy
```

### Nested Workflows

Workflows within workflows:

```
Main: henry-feature (full feature development)
  Subprocess: henry-design (design phase within feature)
    Sub-subprocess: ux-researcher → ux-ui-designer → a11y-specialist
```

### Rollback Workflows

Handle failures gracefully:

```
henry-launch → Deploy → [Issue detected]
  → Rollback
  → henry-audit (find root cause)
  → henry-optimize (fix)
  → henry-launch (retry)
```

## Monitoring and Metrics

Monitor and track workflow effectiveness using these metrics:

### Cycle Time Metrics
- Time from henry-product to production
- Time in each phase
- Bottleneck identification

### Quality Metrics
- Issues found in henry-review per phase
- Critical issues found in henry-audit
- Production incidents post-launch

### Efficiency Metrics
- Rework percentage (features requiring redesign)
- Review pass rate (first-time approvals)
- Launch success rate (smooth deployments)

## Best Practices

1. **Start with clear objectives**: Define what success looks like before starting workflow
2. **Match workflow to project**: Don't use heavy workflows for small tasks
3. **Build in quality gates**: Regular checkpoints prevent late-stage surprises
4. **Document decisions**: Record why you chose specific approaches
5. **Learn and adapt**: Review workflows, identify improvements
6. **Communicate progress**: Keep stakeholders informed at each phase
7. **Plan for failures**: Have rollback and retry strategies
8. **Measure outcomes**: Track metrics to improve future workflows

## Integration with Henry Commands

Leverage Henry's 9 commands for all orchestration patterns:
- Use dedicated commands (henry-feature, henry-design, etc.) for standard workflows
- Use henry-team for custom agent combinations
- Combine commands for complex multi-phase workflows
- Reference /henry-orchestrator:help for command details

For detailed command documentation, agent capabilities, and examples, see `/henry-orchestrator:help`.

## Supporting Resources

### Examples
See the `examples/` directory for practical workflow implementations demonstrating each pattern in action.

### Pattern Deep Dives
For comprehensive pattern documentation, architectural details, and advanced techniques, see `references/pattern-details.md`.