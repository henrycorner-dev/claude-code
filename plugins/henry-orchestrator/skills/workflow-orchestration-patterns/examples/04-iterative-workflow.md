# Iterative Workflow Example

## Pattern Overview

Iterative workflows execute repeated cycles of planning, building, reviewing, and refining. Each iteration builds on learnings from the previous cycle, enabling continuous improvement and adaptation.

## Structure

```
Plan → Build → Review → Refine → (repeat until done)
```

## Use Case: Agile Feature Development Sprint

**Scenario**: Develop a notification system over 2-week sprint with continuous feedback and refinement

### Iteration 1: Basic Notification System

#### Week 1 - Iteration 1

**Plan**

```bash
/henry-orchestrator:henry-team product-strategist - Define notification system MVP
```

**Objective**: Define first iteration scope
**Duration**: 1 hour
**Deliverables**:

- User stories for basic notifications
- Success criteria
- Technical constraints

---

**Build**

```bash
/henry-orchestrator:henry-feature implement basic email notifications
```

**Objective**: Build simplest working version
**Duration**: 2 days
**Deliverables**:

- Email notification service
- Basic templates
- Database schema
- Tests

---

**Review**

```bash
/henry-orchestrator:henry-review notification system implementation
```

**Objective**: Identify issues and improvements
**Duration**: 2 hours
**Deliverables**:

- Code review feedback
- Security assessment
- Performance metrics
- QA test results

**Findings**:

- ✓ Email delivery works
- ⚠️ No retry logic for failed sends
- ⚠️ Templates not customizable
- ⚠️ Performance: 500ms per notification (acceptable for now)

---

**Refine**

**Objective**: Address critical findings

**Activities**:

- Implement retry logic for failed sends (4 hours)
- Add basic error handling (2 hours)
- Fix security issue with template injection (2 hours)

**Duration**: 1 day

**Outcome**: Stable basic notification system ready for production

---

### Iteration 2: Add In-App Notifications

#### Week 2 - Iteration 2

**Plan**

**Objective**: Plan in-app notifications based on feedback from Iteration 1

**User Feedback**:

- "I don't check email often"
- "Need real-time notifications"
- "Want to mark notifications as read"

**Scope**:

- Real-time in-app notifications
- Notification center UI
- Mark as read/unread
- Notification preferences

**Duration**: 30 minutes (faster due to existing context)

---

**Build**

```bash
/henry-orchestrator:henry-feature add in-app notification center with WebSocket
```

**Objective**: Add in-app notifications
**Duration**: 3 days
**Deliverables**:

- WebSocket notification service
- Notification center UI component
- Read/unread state management
- User preferences API

**Learnings Applied from Iteration 1**:

- ✓ Built retry logic from start
- ✓ Included error handling throughout
- ✓ Added security review during development

---

**Review**

```bash
/henry-orchestrator:henry-review in-app notification implementation
```

**Objective**: Validate improvements and find new issues
**Duration**: 2 hours

**Findings**:

- ✓ Real-time delivery working
- ✓ No security issues (learned from Iteration 1)
- ⚠️ Performance: WebSocket connections using too much memory
- ⚠️ UI cluttered with too many notifications

---

**Refine**

**Activities**:

- Optimize WebSocket memory usage (4 hours)
- Add pagination to notification list (3 hours)
- Implement notification grouping (3 hours)

**Duration**: 1.5 days

**Outcome**: Production-ready in-app notification system

---

## Complete Workflow Timeline

**Total Duration**: 2 weeks (2 iterations)

```
Week 1 (Iteration 1):
- Monday AM: Plan (1h)
- Monday PM - Wednesday: Build (2d)
- Thursday AM: Review (2h)
- Thursday PM - Friday: Refine (1d)

Week 2 (Iteration 2):
- Monday AM: Plan (30m)
- Monday PM - Thursday PM: Build (3d)
- Friday AM: Review (2h)
- Friday PM: Refine (0.5d)
```

---

## Iteration Comparison

### Iteration 1 Metrics

- Features: Email notifications only
- Code coverage: 65%
- Performance: 500ms per notification
- Issues found in review: 3 critical
- User satisfaction: 6/10

### Iteration 2 Metrics

- Features: Email + in-app notifications
- Code coverage: 82% (improved)
- Performance: 150ms per notification (3x faster)
- Issues found in review: 1 minor (learned from Iteration 1)
- User satisfaction: 9/10

**Improvement**: Each iteration built on learnings from previous cycle

---

## Key Success Factors

1. **Short Iterations**: 1-2 weeks max for quick feedback
2. **Clear Scope**: Each iteration has defined goals
3. **Continuous Learning**: Apply learnings from previous iterations
4. **Regular Reviews**: Catch issues early and often
5. **User Feedback**: Incorporate real user input

## When to Use Iterative Workflow

✅ **Use when**:

- Requirements are evolving or uncertain
- Need continuous user feedback
- Agile or lean development approach
- Complex features benefit from incremental building
- Risk of building wrong thing is high

❌ **Avoid when**:

- Requirements are crystal clear and stable
- No opportunity for feedback between iterations
- Single deliverable with no room for refinement
- Tight deadline requires all features at once

## Variations

### Sprint-Based Iteration

**Structure**: 2-week sprints with defined ceremonies

```
Sprint Planning (Monday)
  ↓
Daily Standups (every day)
  ↓
Development + Review (continuous)
  ↓
Sprint Review (Friday Week 2)
  ↓
Sprint Retrospective (Friday Week 2)
  ↓
Next Sprint
```

**Example**:

```bash
# Sprint 1
/henry-orchestrator:henry-product sprint 1 planning
/henry-orchestrator:henry-feature implement sprint 1 features
/henry-orchestrator:henry-review sprint 1 code review
# Sprint demo and retro

# Sprint 2 (apply learnings)
/henry-orchestrator:henry-product sprint 2 planning
/henry-orchestrator:henry-feature implement sprint 2 features
/henry-orchestrator:henry-review sprint 2 code review
```

---

### Design Iteration

**Structure**: Multiple design cycles with user testing

```
Research → Design v1 → Test → Refine → Design v2 → Test → Refine → Design v3 → Implement
```

**Example**:

```bash
# Iteration 1
/henry-orchestrator:henry-team ux-researcher - User research
/henry-orchestrator:henry-team ux-ui-designer - Initial wireframes
# User testing session
# Refine based on feedback

# Iteration 2
/henry-orchestrator:henry-team ux-ui-designer - Refined wireframes with high-fidelity mockups
# User testing session
# Refine based on feedback

# Iteration 3
/henry-orchestrator:henry-team ux-ui-designer ui-visual-designer - Final designs with visual polish
# Final validation

# Implement
/henry-orchestrator:henry-feature implement validated designs
```

---

### Optimization Iteration

**Structure**: Repeated optimization cycles with benchmarking

```
Baseline → Optimize → Benchmark → Iterate → Optimize → Benchmark → (until target met)
```

**Example**:

```bash
# Iteration 1
/henry-orchestrator:henry-team performance-engineer - Baseline page performance
# Result: LCP 4.2s, CLS 0.18, INP 350ms

/henry-orchestrator:henry-optimize landing page for Core Web Vitals
# Focus: Image optimization, lazy loading

/henry-orchestrator:henry-team performance-engineer - Benchmark improvements
# Result: LCP 2.8s, CLS 0.12, INP 280ms
# Still not passing, iterate again

# Iteration 2
/henry-orchestrator:henry-optimize further performance improvements
# Focus: Code splitting, font optimization

/henry-orchestrator:henry-team performance-engineer - Benchmark improvements
# Result: LCP 2.1s ✓, CLS 0.08 ✓, INP 180ms ✓
# All passing, done!
```

---

## Iteration Planning Strategies

### Fixed Scope Iteration

Define exact scope before iteration starts:

- Clear user stories
- Acceptance criteria defined
- No scope changes during iteration

**Best for**: Predictable work, stable requirements

---

### Flexible Scope Iteration

Allow scope adjustments based on learnings:

- High-level goals defined
- Specific implementation emerges
- Adapt based on what you learn

**Best for**: Exploratory work, uncertain requirements

---

### Time-Boxed Iteration

Fixed duration regardless of completion:

- 1-2 week sprints
- Ship whatever is done
- Incomplete work moves to next iteration

**Best for**: Continuous delivery, regular releases

---

## Common Pitfalls

### ❌ Iterations Too Long

```
Wrong: 6-week iterations → slow feedback, high risk
Right: 1-2 week iterations → fast feedback, low risk
```

**Impact**: Miss opportunities to course-correct, build wrong thing for too long

---

### ❌ No Learning Transfer

```
Wrong: Make same mistakes in each iteration
Right: Apply learnings from previous iterations
```

**Example**:

```
Iteration 1: Security issue found in review
Iteration 2: Include security review during development
Iteration 3: Security review checklist built into process
```

---

### ❌ Skipping Review Phase

```
Wrong: Plan → Build → Plan → Build → (no reviews)
Right: Plan → Build → Review → Refine → (repeat)
```

**Impact**: Issues accumulate, technical debt grows, quality degrades

---

### ❌ Too Much Refactoring

```
Wrong: Spend 80% of iteration refactoring previous work
Right: Refactor only what's needed to enable next iteration
```

**Impact**: Slow progress, over-engineering, diminishing returns

---

### ❌ No Clear End Criteria

```
Wrong: Iterate indefinitely with no definition of done
Right: Define success criteria upfront, stop when met
```

**Example**:

```
Clear criteria:
- Core Web Vitals passing ✓
- WCAG 2.1 AA compliant ✓
- Security audit passing ✓
→ Done, ship it!
```

---

## Iteration Review Checklist

Use this checklist at the end of each iteration:

**Delivery**

- [ ] Features implemented as planned
- [ ] Code reviewed and merged
- [ ] Tests passing (unit + integration)
- [ ] Documentation updated

**Quality**

- [ ] Security review completed
- [ ] Performance acceptable
- [ ] Accessibility validated
- [ ] User acceptance criteria met

**Learning**

- [ ] What went well?
- [ ] What could be improved?
- [ ] What did we learn?
- [ ] What will we do differently next iteration?

**Planning**

- [ ] Next iteration scope defined
- [ ] Dependencies identified
- [ ] Resources allocated
- [ ] Timeline agreed upon

---

## Monitoring and Success Metrics

Track these metrics across iterations:

### Velocity Metrics

- **Story points per iteration**: Trending up (team improving)
- **Scope completion rate**: > 80% (good planning)
- **Cycle time**: Decreasing over time (efficiency improving)

### Quality Metrics

- **Defects found per iteration**: Trending down (quality improving)
- **Rework percentage**: < 20% (not too much refactoring)
- **Code coverage**: Trending up (better testing)

### Learning Metrics

- **Retrospective action items**: < 5 per iteration (focused improvements)
- **Action item completion**: > 80% (follow through)
- **Repeated issues**: Decreasing (applying learnings)

---

## Best Practices

### 1. Keep Iterations Short

Target 1-2 weeks maximum:

- Faster feedback
- Lower risk
- More opportunities to adapt

### 2. Define Clear Goals

Each iteration should have:

- Specific features to deliver
- Acceptance criteria
- Success metrics
- Definition of done

### 3. Embrace Change

Iterations allow you to:

- Pivot based on learnings
- Respond to user feedback
- Adapt to changing requirements

### 4. Regular Retrospectives

After each iteration:

- Celebrate successes
- Identify improvements
- Commit to actionable changes
- Track improvement over time

### 5. Maintain Momentum

Keep iterations flowing:

- Start next iteration immediately
- Don't let gaps emerge
- Maintain team rhythm
- Build continuous improvement culture

### 6. Balance New Work vs. Refinement

Good ratio: 70% new features, 30% refinement/tech debt

```
Iteration: 70% new → 30% refine
Iteration: 70% new → 30% refine
(repeat)
```

---

## Real-World Example: E-commerce Checkout

**Goal**: Build optimized checkout flow over 4 iterations

### Iteration 1: Basic Checkout (Week 1-2)

```bash
/henry-orchestrator:henry-product basic checkout flow
/henry-orchestrator:henry-feature implement cart and checkout
/henry-orchestrator:henry-review checkout implementation
```

**Delivered**: Cart, checkout form, payment integration
**Learnings**: 40% cart abandonment, users confused by multi-page flow

### Iteration 2: Single-Page Checkout (Week 3-4)

```bash
/henry-orchestrator:henry-design single-page checkout redesign
/henry-orchestrator:henry-feature implement single-page checkout
/henry-orchestrator:henry-review checkout v2
```

**Delivered**: Single-page checkout, progress indicator
**Learnings**: Cart abandonment reduced to 28%, still seeing drop-off at payment step

### Iteration 3: Guest Checkout + Trust Signals (Week 5-6)

```bash
/henry-orchestrator:henry-feature add guest checkout and trust badges
/henry-orchestrator:henry-review checkout v3
```

**Delivered**: Guest checkout, security badges, reviews
**Learnings**: Cart abandonment down to 18%, mobile UX needs work

### Iteration 4: Mobile Optimization (Week 7-8)

```bash
/henry-orchestrator:henry-optimize checkout for mobile
/henry-orchestrator:henry-review final checkout
```

**Delivered**: Mobile-optimized checkout, autofill, simplified forms
**Final Result**: Cart abandonment 12% (67% improvement from Iteration 1)

---

## Related Patterns

- **Linear Workflow**: Single pass through phases (no iteration)
- **Hybrid Workflow**: Mix sequential and parallel within each iteration
- **Continuous Review**: henry-review after each change (micro-iterations)
