---
name: agent-collaboration-synthesis
description: Guide for synthesizing and integrating outputs from multiple Henry Orchestrator agents into cohesive deliverables. Use when you need to "combine findings from multiple agents", "synthesize review results", "integrate outputs from different agents", "consolidate parallel agent work", "create unified report from agent outputs", or "merge recommendations from security, performance, and QA". Covers synthesis patterns for reviews (security + performance + QA), design workflows (research + UX + visual + a11y), feature development (frontend + backend + testing), and audits. Examples - <example>user - "Combine findings from security, performance, and QA reviews"; assistant - "I'll synthesize the three reviews into a unified report with: consolidated findings by severity, cross-cutting themes (e.g., authentication issues flagged by both security and QA), prioritized remediation plan, and integrated recommendations"; <commentary>Multiple agent outputs need consolidation to avoid duplication and create actionable plan</commentary></example> <example>user - "Create design handoff package from all design outputs"; assistant - "I'll integrate research insights, UX flows, visual designs, and a11y specs into comprehensive handoff documentation with component specifications, implementation notes, and acceptance criteria"; <commentary>Design workflow outputs need consolidation for clean handoff to engineering</commentary></example>
---

# Agent Collaboration Synthesis

Synthesize outputs from multiple Henry Orchestrator agents into cohesive, actionable deliverables. Transform fragmented findings into unified plans with clear priorities and actionable next steps.

## Overview

When multiple agents work on the same task (parallel execution) or sequential phases (workflow execution), synthesis is essential:

- **Review synthesis**: Combine QA, security, and performance findings into prioritized action plan
- **Design synthesis**: Integrate research, UX, visual, and a11y into handoff package
- **Implementation synthesis**: Merge frontend, backend, and ops recommendations into architecture
- **Audit synthesis**: Consolidate security, performance, a11y, SEO, and ops findings into health report

Without synthesis, outputs remain fragmented and hard to act on. Synthesis creates clarity, priority, and actionable next steps.

## Synthesis Process

### Step 1: Collect All Outputs

Gather deliverables from each agent:

- Reports and findings
- Code and designs
- Recommendations and action items
- Metrics and benchmarks
- Questions and risks

Organize by agent to see the full picture before consolidating.

### Step 2: Identify Themes

**Cross-agent patterns**: Look for issues multiple agents identified

- Security and QA both flagged authentication edge cases
- Performance and frontend both noted bundle size issues
- A11y and UX both identified navigation problems

**Complementary findings**: Identify where agents complement each other

- Security identified auth vulnerabilities → QA can create security test cases
- Performance found slow queries → Backend can optimize database
- UX designed new flow → Frontend implements, A11y validates

**Conflicting recommendations**: Note disagreements to resolve

- Performance wants lazy loading vs. A11y concerned about keyboard nav
- Security wants strict CSP vs. Frontend needs third-party widgets
- UX wants animations vs. Performance concerned about CLS

### Step 3: Prioritize Findings

Apply severity framework:

**Critical (P0)**: Fix immediately

- Security vulnerabilities exploitable in production
- WCAG A violations (accessibility blockers)
- Performance issues causing >5s load times
- Complete feature failures

**High (P1)**: Fix before launch

- Important security hardening
- WCAG AA violations
- Performance issues preventing targets
- Major UX problems

**Medium (P2)**: Fix in near term

- Defense-in-depth security improvements
- Performance optimizations beyond targets
- UX enhancements, code quality improvements

**Low (P3)**: Backlog

- Future enhancements, nice-to-have optimizations, polish

Use **Impact × Effort matrix**:

- High Impact, Low Effort → Do first (Quick wins)
- High Impact, High Effort → Schedule next (Major improvements)
- Low Impact, Low Effort → Do if time (Easy polish)
- Low Impact, High Effort → Avoid (Not worth it)

### Step 4: Resolve Conflicts

**Priority order** when conflicts arise:

1. **Security** > Everything (non-negotiable)
2. **Accessibility** = Security (legal/ethical requirement)
3. **Functionality** > Performance (must work, then optimize)
4. **Performance** > Polish (fast and simple > slow and fancy)
5. **UX** guided by data and research

**Resolution strategies**:

- **Find Both/And**: Lazy loading + keyboard nav = Lazy loading with accessible indicators
- **Security/A11y Prevails**: When security or a11y conflicts with features, security/a11y wins
- **Data-Driven**: Use product-strategist for business trade-offs, A/B test if needed
- **Phased Approach**: Incremental rollout reduces risk while delivering value

See [references/best-practices.md](references/best-practices.md) for detailed conflict resolution strategies.

### Step 5: Create Unified Documentation

**Executive summary**: Overview, key findings, overall status, top 3-5 priorities

**Detailed findings**: Organized by category (Security, Performance, Quality, etc.)

**Integrated recommendations**: Not separate agent recommendations, but unified plan

- Group related recommendations (e.g., "Authentication Hardening" combining security + QA)
- Sequence logically (foundational fixes first)

**Action plan**: Phases with owners and deadlines

- Immediate actions (P0 critical)
- Short-term plan (P1 high priority)
- Medium-term backlog (P2)
- Long-term enhancements (P3)

**Success metrics**: Measurable targets (e.g., "LCP < 2.5s", "WCAG AA compliance", "0 critical security issues")

## Common Synthesis Scenarios

### Multi-Agent Review

**Agents**: Security + Performance + QA
**Focus**: Prioritization, conflict resolution
**Output**: Action plan by priority with phases

**Example**: E-commerce checkout review finds 5 critical issues (2 security, 3 performance), 8 high priority. Synthesis identifies authentication as cross-cutting theme (security vulnerability + QA test gap), creates integrated auth fix + test plan.

### Design Workflow

**Agents**: UX Research → UX/UI Design → Visual Design → A11y
**Focus**: Integration, handoff clarity
**Output**: Design handoff package

**Example**: Research insights inform UX flows, visual designs incorporate a11y requirements, complete package includes personas, flows, mockups, component specs, and implementation notes.

### Feature Development

**Agents**: Product → Design → Frontend + Backend → QA
**Focus**: Validation, coherence
**Output**: Feature completion report

**Example**: Validate frontend matches designs, backend API aligns with frontend, all features tested, success metrics instrumented.

### Pre-Launch Audit

**Agents**: Security + Performance + A11y + SEO + Ops
**Focus**: Risk assessment, go/no-go
**Output**: Launch readiness report

**Example**: 5 critical blockers identified (3 security, 2 a11y), launch conditions defined, post-launch optimization roadmap created.

See [references/synthesis-patterns.md](references/synthesis-patterns.md) for detailed pattern walkthroughs.

## Best Practices

### DO:

✅ Consolidate, don't just list (unified view, not separate reports)
✅ Prioritize ruthlessly (clear P0/P1/P2/P3 with rationale)
✅ Resolve conflicts explicitly (document decisions and trade-offs)
✅ Create actionable plans (specific tasks with owners and deadlines)
✅ Define success metrics (measurable criteria for completion)
✅ Highlight cross-cutting themes (where agents agree or complement)

### DON'T:

❌ Copy-paste agent outputs (synthesis means integration, not concatenation)
❌ Ignore conflicts (address disagreements, don't hide them)
❌ Create vague action items ("Improve performance" → "Reduce bundle size to <500KB")
❌ Skip prioritization (not all issues are equally important)
❌ Forget stakeholders (tailor to audience: exec summary for leadership, tech details for engineers)

See [references/best-practices.md](references/best-practices.md) for common challenges and solutions.

## Synthesis Templates

Ready-to-use templates available:

1. **Multi-Agent Review Report** - For parallel reviews (security, performance, QA)
2. **Design Handoff Package** - For complete design workflows
3. **Feature Completion Report** - For full-stack feature development
4. **Launch Readiness Report** - For pre-launch audits
5. **Optimization Impact Report** - For optimization sprints

See [references/synthesis-templates.md](references/synthesis-templates.md) for complete templates.

## Quick Reference

| Scenario            | Synthesis Focus                     | Key Output                 |
| ------------------- | ----------------------------------- | -------------------------- |
| Multi-agent review  | Prioritization, conflict resolution | Action plan by priority    |
| Design workflow     | Integration, handoff clarity        | Design handoff package     |
| Feature development | Validation, coherence               | Feature completion report  |
| Pre-launch audit    | Risk assessment, go/no-go           | Launch readiness report    |
| Optimization sprint | Before/after, impact                | Optimization impact report |

## Integration with Henry Commands

Synthesis happens naturally after command execution:

- **After henry-review**: Synthesize QA, security, performance findings
- **After henry-audit**: Consolidate all audit dimensions
- **After henry-design**: Create design handoff package
- **After henry-feature**: Validate end-to-end implementation
- **After henry-team**: Integrate custom team outputs

The henry commands already include synthesis phases, but this skill provides detailed guidance for complex cases.

## Working Example

See [examples/multi-agent-review/](examples/multi-agent-review/) for a complete example:

- Individual agent findings (security, performance, QA)
- Synthesis process walkthrough
- Final synthesized report
- Scripts for collecting and analyzing findings

## Additional Resources

- **[references/synthesis-patterns.md](references/synthesis-patterns.md)** - Detailed pattern catalog with step-by-step walkthroughs
- **[references/synthesis-templates.md](references/synthesis-templates.md)** - Ready-to-use templates for common scenarios
- **[references/best-practices.md](references/best-practices.md)** - Best practices, common challenges, quality checklist
- **[examples/multi-agent-review/](examples/multi-agent-review/)** - Complete working example with sample findings

For questions or guidance on complex synthesis scenarios, reference the detailed patterns or ask for help.
