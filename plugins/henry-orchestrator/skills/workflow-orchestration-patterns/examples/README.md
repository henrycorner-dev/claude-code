# Workflow Orchestration Pattern Examples

This directory contains practical examples demonstrating how to implement each workflow orchestration pattern with Henry Orchestrator.

## Available Examples

### 1. Linear Workflow (`01-linear-workflow.md`)

**Pattern**: Sequential phases, each building on previous output

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

**Use Case**: Full feature development from strategy to production

**When to Use**:
- Clear dependencies between phases
- Later work requires earlier outputs
- Building new features from scratch

**Example Command Sequence**:
```bash
/henry-orchestrator:henry-product
/henry-orchestrator:henry-design
/henry-orchestrator:henry-feature
/henry-orchestrator:henry-review
/henry-orchestrator:henry-launch
```

---

### 2. Parallel Workflow (`02-parallel-workflow.md`)

**Pattern**: Independent tasks executed simultaneously

```
     ┌─ Task A ─┐
     ├─ Task B ─┤ → Synthesis
     └─ Task C ─┘
```

**Use Case**: Comprehensive project audit across multiple domains

**When to Use**:
- Tasks are truly independent
- No sequential dependencies
- Multiple perspectives on same artifact
- Time-sensitive deliverables

**Example Command Sequence**:
```bash
# Run all in parallel (single message with multiple commands)
/henry-orchestrator:henry-team security-engineer
/henry-orchestrator:henry-team performance-engineer
/henry-orchestrator:henry-team a11y-specialist
```

---

### 3. Hybrid Workflow (`03-hybrid-workflow.md`)

**Pattern**: Mix of sequential and parallel phases

```
Phase 1 → [Phase 2a + Phase 2b] → Phase 3 → [Phase 4a + Phase 4b + Phase 4c]
```

**Use Case**: MVP product launch with optimized timeline

**When to Use**:
- Complex projects with both dependencies and parallelizable work
- Medium to large projects (2+ weeks)
- Multiple team members or domains
- Need to optimize for speed without sacrificing quality

**Example Command Sequence**:
```bash
# Sequential strategy
/henry-orchestrator:henry-product

# Parallel design + technical spec
/henry-orchestrator:henry-design
/henry-orchestrator:henry-team backend-engineer

# Parallel implementation
/henry-orchestrator:henry-team frontend-engineer
/henry-orchestrator:henry-team backend-engineer
/henry-orchestrator:henry-team devops-sre-architect

# Sequential integration
/henry-orchestrator:henry-review

# Parallel pre-launch
/henry-orchestrator:henry-audit
/henry-orchestrator:henry-team seo-specialist

# Sequential launch
/henry-orchestrator:henry-optimize
/henry-orchestrator:henry-launch
```

---

### 4. Iterative Workflow (`04-iterative-workflow.md`)

**Pattern**: Repeated cycles with refinement

```
Plan → Build → Review → Refine → (repeat until done)
```

**Use Case**: Agile feature development with continuous feedback

**When to Use**:
- Requirements are evolving or uncertain
- Need continuous user feedback
- Agile or lean development approach
- Risk of building wrong thing is high

**Example Command Sequence**:
```bash
# Iteration 1
/henry-orchestrator:henry-team product-strategist  # Plan
/henry-orchestrator:henry-feature                  # Build
/henry-orchestrator:henry-review                   # Review
# Refine based on feedback

# Iteration 2 (apply learnings)
/henry-orchestrator:henry-feature                  # Build v2
/henry-orchestrator:henry-review                   # Review v2
# Refine based on feedback

# Continue until done
```

---

## Quick Selection Guide

### By Project Size

| Project Size | Recommended Pattern | Example |
|-------------|-------------------|---------|
| **Small** (< 1 week) | Linear | henry-feature → henry-review |
| **Medium** (1-4 weeks) | Hybrid or Iterative | henry-product → [design + spec] → implement |
| **Large** (1-3 months) | Hybrid + Iterative | Full workflow with sprint cycles |

---

### By Project Type

| Project Type | Recommended Pattern | Key Commands |
|-------------|-------------------|--------------|
| **New Feature** | Linear | henry-product → henry-design → henry-feature → henry-review |
| **Redesign** | Iterative | henry-design → test → refine → implement |
| **Performance Optimization** | Iterative | Baseline → optimize → benchmark → (repeat) |
| **Product Launch** | Hybrid | Strategy → [parallel prep] → launch |
| **Multi-Feature Release** | Parallel + Hybrid | [Feature A + Feature B + Feature C] → integration |

---

### By Team Size

| Team Size | Recommended Pattern | Parallelization |
|----------|-------------------|-----------------|
| **Solo Developer** | Linear or Iterative | Minimal parallelization |
| **Small Team (2-5)** | Hybrid | 2-3 parallel tracks |
| **Large Team (6+)** | Parallel + Hybrid | Multiple parallel workflows |

---

## Pattern Comparison

| Aspect | Linear | Parallel | Hybrid | Iterative |
|--------|--------|----------|---------|-----------|
| **Complexity** | Low | Medium | High | Medium |
| **Speed** | Slowest | Fastest | Fast | Variable |
| **Flexibility** | Low | Low | Medium | High |
| **Risk** | Low | Medium | Medium | Low |
| **Best For** | Simple projects | Time-sensitive | Complex projects | Uncertain requirements |
| **Team Size** | 1-3 | 3+ | 5+ | 1-5 |

---

## Common Workflow Combinations

### 1. Hybrid + Iterative

Run hybrid workflow for each sprint iteration:

```bash
# Sprint 1 (Iteration 1)
Strategy → [Design + Spec] → [Frontend + Backend] → Review

# Sprint 2 (Iteration 2 - apply learnings)
Plan refinements → [Frontend + Backend] → Review

# Sprint 3 (Iteration 3)
Plan refinements → [Frontend + Backend + New feature] → Review
```

---

### 2. Linear with Iterative Refinement

Main workflow is linear, with iterations within phases:

```bash
# Strategy (linear)
henry-product

# Design (iterative)
henry-design → test → refine → design v2 → test → finalize

# Implementation (linear)
henry-feature

# Review (linear)
henry-review

# Launch (linear)
henry-launch
```

---

### 3. Parallel with Sequential Integration

Parallel development with sequential quality gates:

```bash
# Parallel development
[Feature A + Feature B + Feature C]
↓
# Sequential integration
Integration Testing
↓
# Parallel pre-launch
[Audit + SEO + Analytics]
↓
# Sequential launch
Optimize → Launch
```

---

## How to Use These Examples

1. **Identify Your Project Type**: Feature development, optimization, launch, etc.

2. **Choose a Pattern**: Use the selection guide above to pick the best pattern

3. **Read the Example**: Open the corresponding markdown file for detailed walkthrough

4. **Adapt to Your Needs**: Modify the pattern based on your specific requirements

5. **Execute**: Run the Henry Orchestrator commands in the recommended sequence

6. **Monitor and Adjust**: Track metrics and refine your approach

---

## Best Practices Across All Patterns

### 1. Start with Clear Objectives
Define success criteria before starting any workflow

### 2. Document Decisions
Record why you chose specific approaches and sequences

### 3. Build in Quality Gates
Regular checkpoints prevent late-stage surprises

### 4. Communicate Progress
Keep stakeholders informed at each phase

### 5. Learn and Adapt
Review workflows after completion and identify improvements

### 6. Measure Outcomes
Track cycle time, quality, and efficiency metrics

---

## Additional Resources

### Skills
- `workflow-orchestration-patterns` - This skill (comprehensive guide)

### Commands
- `/henry-orchestrator:help` - Full command reference
- `/henry-orchestrator:henry-product` - Product strategy
- `/henry-orchestrator:henry-design` - Design workflow
- `/henry-orchestrator:henry-feature` - Feature development
- `/henry-orchestrator:henry-review` - Multi-agent review
- `/henry-orchestrator:henry-audit` - Comprehensive audit
- `/henry-orchestrator:henry-optimize` - Optimization
- `/henry-orchestrator:henry-launch` - Launch preparation
- `/henry-orchestrator:henry-team` - Custom agent teams

### Agents
16 specialist agents available for custom workflows - see `/henry-orchestrator:help` for full list

---

## Contributing Examples

Have a successful workflow pattern to share? Consider documenting:
- The pattern structure
- Real-world use case
- Command sequences
- Timelines and metrics
- Lessons learned
- Common pitfalls

---

## Questions?

Reference `/henry-orchestrator:help` for comprehensive documentation on commands, agents, and orchestration techniques.
