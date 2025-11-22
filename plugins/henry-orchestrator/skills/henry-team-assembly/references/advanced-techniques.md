# Advanced Team Assembly Techniques

This reference covers advanced techniques for assembling and coordinating teams of Henry Orchestrator agents. Use these techniques when standard patterns don't fully address your needs.

## Dynamic Team Adjustment

### Adding Specialists Mid-Execution

Sometimes you discover additional needs during execution. You can dynamically add agents:

**Scenario:** Started with frontend + backend team, but discovered performance issues

```bash
# Initial team
/henry-orchestrator:henry-team frontend-engineer backend-engineer - Build dashboard

# During implementation, discover performance issues
# Add performance engineer to existing context
/henry-orchestrator:henry-team performance-engineer - Review current dashboard implementation for performance issues

# Or restart with expanded team
/henry-orchestrator:henry-team frontend-engineer backend-engineer performance-engineer - Build optimized dashboard (incorporating previous work)
```

**When to add agents:**

- Unexpected complexity discovered
- Quality issues in specific dimension (security, performance, a11y)
- Stakeholder requests additional perspective
- Technical blockers requiring specialist expertise

**Best practices:**

- Provide new agent with full context from previous agents
- Synthesize previous work before bringing in new perspective
- Consider if restart with full team is better than incremental addition

### Removing or Swapping Agents

**Scenario:** Agent expertise doesn't match actual needs

```bash
# Initially thought we needed mobile engineer
/henry-orchestrator:henry-team mobile-app-engineer ux-ui-designer - Build mobile feature

# Discover it's actually a responsive web app
# Swap mobile engineer for frontend engineer
/henry-orchestrator:henry-team frontend-engineer ux-ui-designer - Build responsive web app
```

**When to swap agents:**

- Requirements clarification reveals different needs
- Technology choice changes
- Agent deliverables don't match expectations
- Scope shifts to different domain

## Advanced Coordination Patterns

### Iterative Refinement with Role Rotation

Use multiple passes where agents review each other's work:

**Pattern: Design → Implement → Review → Refine**

```bash
# Pass 1: Initial design and implementation
/henry-orchestrator:henry-team ux-ui-designer frontend-engineer - Initial dashboard implementation

# Pass 2: Security review of implementation
/henry-orchestrator:henry-team security-engineer - Review dashboard for security issues

# Pass 3: Frontend engineer addresses security findings
/henry-orchestrator:henry-team frontend-engineer - Implement security fixes from audit

# Pass 4: Final validation
/henry-orchestrator:henry-team security-engineer qa-tester - Validate security fixes and test coverage
```

**Benefits:**

- Iterative improvement
- Specialist focus in each pass
- Clear handoffs between phases
- Quality improves with each iteration

**Use when:**

- Complex features requiring multiple refinement cycles
- Learning from each phase informs next phase
- Quality requirements are high
- Time permits iterative approach

### Cross-Functional Reviews

Have agents review each other's domains:

**Example: Backend Engineer Reviews Frontend API Integration**

```bash
# Phase 1: Parallel implementation
/henry-orchestrator:henry-team frontend-engineer backend-engineer - Build user profile feature

# Phase 2: Cross-review
# Backend engineer reviews frontend's API usage
/henry-orchestrator:henry-team backend-engineer - Review frontend code for API integration best practices

# Frontend engineer reviews backend's API design
/henry-orchestrator:henry-team frontend-engineer - Review backend API from frontend consumer perspective
```

**Benefits:**

- Catches integration issues early
- Ensures APIs are developer-friendly
- Identifies assumptions and mismatches
- Improves cross-team understanding

**Best for:**

- API-heavy applications
- Microservices architectures
- Teams with integration points
- Contract-first development

### Parallel Exploration with Synthesis

Explore multiple approaches simultaneously, then synthesize:

**Scenario: Unsure of best architecture approach**

```bash
# Explore multiple solutions in parallel
/henry-orchestrator:henry-team backend-engineer - Propose architecture using microservices

# Separately
/henry-orchestrator:henry-team backend-engineer - Propose architecture using monolith

# Then synthesize and decide
# Compare both proposals, identify trade-offs, make decision with product strategist
/henry-orchestrator:henry-team product-strategist - Compare microservices vs monolith proposals and recommend
```

**Benefits:**

- Evaluates multiple options objectively
- Uncovers trade-offs
- Prevents premature optimization
- Makes informed architectural decisions

**Use when:**

- Unclear best approach
- High-stakes decisions
- Multiple viable options
- Want to evaluate trade-offs

## Advanced Synthesis Techniques

### Weighted Prioritization

Not all agent perspectives have equal weight in all contexts:

**Priority Framework by Context:**

**Production Launch Context:**

```
Security: 100% weight (absolute veto on critical issues)
Performance: 90% weight (major ranking factor)
Accessibility: 90% weight (legal compliance)
UX: 70% weight (important but can iterate post-launch)
SEO: 60% weight (long-term, can improve post-launch)
```

**Internal Tool Context:**

```
UX: 90% weight (user productivity critical)
Security: 85% weight (internal data protection)
Performance: 60% weight (less critical for small user base)
Accessibility: 50% weight (nice-to-have unless legally required)
SEO: 0% weight (not applicable for internal tools)
```

**Example Application:**

```
Team: security-engineer, performance-engineer, ux-ui-designer
Context: Public-facing e-commerce checkout

Issue 1: Security engineer flags missing CSRF protection
Priority: CRITICAL (security veto applies)
Action: Must fix before launch

Issue 2: Performance engineer wants to lazy load images
Priority: HIGH (performance is critical for conversion)
Action: Implement before launch

Issue 3: UX designer wants checkout redesign
Priority: MEDIUM (UX important but can iterate)
Action: Launch with current UX, add to backlog for v2
```

### Conflict Resolution via Additional Specialist

When two agents disagree, bring in third perspective:

**Example: Frontend vs Performance Disagreement**

```bash
# Initial team identifies conflict
Team: frontend-engineer, performance-engineer
Conflict: Frontend wants rich animations, performance concerned about frame rate

# Bring in UX designer to mediate with user impact data
/henry-orchestrator:henry-team ux-ui-designer - Evaluate importance of animations for user experience

# Or bring in product strategist for business decision
/henry-orchestrator:henry-team product-strategist - Prioritize between rich animations vs performance based on business goals
```

**Resolution Strategies:**

1. **Data-driven**: Use analytics to measure impact
2. **User-driven**: User testing to validate assumptions
3. **Business-driven**: Product strategy determines priority
4. **Technical-driven**: Find solution satisfying both constraints

### Dependency Mapping for Complex Teams

For large teams (5+ agents), map dependencies explicitly:

```
Team: product-strategist, ux-researcher, ux-ui-designer, frontend-engineer, backend-engineer, qa-tester

Dependency Graph:
1. product-strategist (no dependencies) → outputs: PRD
2. ux-researcher (needs: PRD) → outputs: research insights
3. ux-ui-designer (needs: research insights, PRD) → outputs: designs
4. backend-engineer (needs: PRD) → outputs: API (parallel with design)
5. frontend-engineer (needs: designs, API) → outputs: UI implementation
6. qa-tester (needs: UI implementation) → outputs: test results

Execution Plan:
Phase 1: product-strategist (solo)
Phase 2: ux-researcher (uses PRD)
Phase 3: ux-ui-designer + backend-engineer (parallel)
Phase 4: frontend-engineer (waits for both phase 3 outputs)
Phase 5: qa-tester (validates everything)
```

**Benefits:**

- Clear execution order
- Identifies parallel opportunities
- Prevents blocking
- Manages large team complexity

## Specialized Advanced Patterns

### The "Expert Panel" Pattern

Assemble experts to evaluate a complex decision:

**Use case: Choosing between technical approaches**

```bash
/henry-orchestrator:henry-team backend-engineer data-engineer devops-sre-architect - Evaluate approaches for real-time data processing: streaming (Kafka) vs polling vs webhooks

Context provided to all:
- Current architecture
- Scale requirements
- Team expertise
- Operational constraints

Each agent evaluates from their perspective:
- Backend: Implementation complexity, maintainability
- Data: Data consistency, processing guarantees
- DevOps: Operational overhead, scaling, monitoring

Synthesis: Compare trade-offs, recommend approach based on weighted criteria
```

**When to use:**

- Architectural decisions
- Technology selection
- Build vs buy decisions
- Major refactoring planning

### The "Red Team / Blue Team" Pattern

Adversarial review where teams have opposing goals:

**Use case: Security hardening**

```bash
# Blue team: Implement security
/henry-orchestrator:henry-team security-engineer backend-engineer - Implement secure authentication

# Red team: Try to break it
/henry-orchestrator:henry-team security-engineer - Attempt to find vulnerabilities in authentication implementation (penetration testing mindset)

# Iterate until red team cannot find issues
```

**Benefits:**

- Finds vulnerabilities proactively
- Stress-tests implementations
- Improves security posture
- Validates assumptions

**Use for:**

- Security-critical systems
- Penetration testing
- Compliance validation
- Breaking assumptions

### The "Parallel Prototypes" Pattern

Build multiple prototypes, compare, choose best:

**Use case: Evaluating UI frameworks**

```bash
# Team 1: React implementation
/henry-orchestrator:henry-team frontend-engineer - Build prototype in React

# Team 2: Vue implementation
/henry-orchestrator:henry-team frontend-engineer - Build same prototype in Vue

# Team 3: Svelte implementation
/henry-orchestrator:henry-team frontend-engineer - Build same prototype in Svelte

# Evaluation team
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Compare prototypes: DX, performance, bundle size, ecosystem
```

**Metrics for comparison:**

- Developer experience
- Performance benchmarks
- Bundle size
- Learning curve
- Ecosystem maturity
- Team expertise

### The "Spike and Decide" Pattern

Quick exploration before committing to full implementation:

```bash
# Spike: Quick exploration (time-boxed to 2 hours)
/henry-orchestrator:henry-team backend-engineer - 2-hour spike: Can we integrate with third-party auth provider?

# Decision point based on spike findings
If feasible:
  /henry-orchestrator:henry-team backend-engineer security-engineer - Implement third-party auth integration
Else:
  /henry-orchestrator:henry-team backend-engineer security-engineer - Build custom auth solution
```

**Benefits:**

- Reduces risk of wrong approach
- Time-boxed exploration
- Informed decision making
- Prevents over-investment in wrong direction

## Advanced Execution Strategies

### Waterfall-Agile Hybrid

Combine sequential phases with iterative sprints:

```
Phase 1 (Waterfall): Architecture and Planning
- product-strategist → PRD
- backend-engineer → Architecture design
- devops-sre-architect → Infrastructure plan

Phase 2-N (Agile Sprints): Iterative implementation
Sprint 1:
  - frontend + backend: Core feature
  - qa: Test plan
Sprint 2:
  - security: Security review
  - frontend + backend: Address findings + next feature
Sprint 3:
  - performance: Performance optimization
  - frontend + backend: Address findings + polish
```

**Benefits:**

- Solid foundation from planning phase
- Flexibility in implementation
- Regular quality checkpoints
- Iterative improvement

### Continuous Validation Pattern

Quality agents review continuously throughout implementation:

```bash
# Setup continuous review
Implementation team: frontend-engineer, backend-engineer
Review team: security-engineer, performance-engineer, qa-tester

Schedule:
- Daily: Performance engineer checks Core Web Vitals
- Every PR: Security engineer reviews changes
- Every 2 days: QA tester validates new features

Instead of one big review at end:
/henry-orchestrator:henry-team security-engineer - Quick security review of today's changes (15 min)
```

**Benefits:**

- Catches issues early (cheaper to fix)
- Prevents technical debt accumulation
- Maintains quality throughout
- Reduces big-bang integration issues

### The "Ensemble" Pattern

All agents collaborate simultaneously in real-time:

**Use case: Critical incident response**

```bash
# All hands on deck for production incident
/henry-orchestrator:henry-team backend-engineer devops-sre-architect security-engineer - Debug production authentication outage

Real-time collaboration:
- DevOps: Check infrastructure, logs, monitoring
- Backend: Review recent code changes, database
- Security: Verify if it's a security incident

Simultaneous work with constant communication:
- Shared context updates
- Real-time findings sharing
- Collaborative root cause analysis
```

**Use when:**

- Critical production incidents
- Time-sensitive emergencies
- Requires multiple perspectives simultaneously
- Collaboration benefits outweigh coordination cost

## Measuring Team Effectiveness

### Metrics to Track

**Team Efficiency:**

- Time to completion vs estimate
- Number of iterations needed
- Blockers encountered
- Rework percentage

**Output Quality:**

- Issues found in review
- Post-launch bugs
- Performance benchmarks met
- Test coverage achieved

**Collaboration Quality:**

- Conflicts identified and resolved
- Cross-team reviews conducted
- Communication effectiveness
- Knowledge sharing

### Continuous Improvement

After each team assembly, conduct retrospective:

**Questions to ask:**

1. Was the team right-sized? (Too many/few agents?)
2. Was execution mode optimal? (Parallel vs sequential?)
3. Were there unexpected needs? (Should we have included other agents?)
4. Did agents have sufficient context?
5. Were conflicts resolved effectively?
6. What would we do differently next time?

**Action items:**

- Update team patterns based on learnings
- Refine coordination strategies
- Improve context-sharing processes
- Adjust team size recommendations

## Anti-Patterns and How to Fix Them

### Anti-Pattern: The "Kitchen Sink" Team

**Problem:** Including every possible agent "just in case"

```bash
# DON'T: 10 agents for simple feature
/henry-orchestrator:henry-team frontend backend mobile qa security performance a11y seo devops data-engineer - Build simple contact form
```

**Fix:** Start minimal, add as needed

```bash
# DO: Right-sized team
/henry-orchestrator:henry-team frontend-engineer backend-engineer - Build contact form

# Add security only if handling sensitive data
# Add a11y if it's public-facing and accessibility is required
```

### Anti-Pattern: The "Serial Blocker" Chain

**Problem:** Fully sequential execution with long wait times

```bash
# DON'T: Each agent waits for previous to completely finish
researcher (8h) → designer (8h) → backend (8h) → frontend (8h) → qa (8h) = 40 hours
```

**Fix:** Identify parallel opportunities

```bash
# DO: Parallel where possible
Phase 1: researcher (8h)
Phase 2: designer + backend in parallel (8h)
Phase 3: frontend uses both outputs (8h)
Phase 4: qa validates (8h)
Total: 32 hours (20% faster)
```

### Anti-Pattern: The "No Synthesis" Dump

**Problem:** Presenting agent outputs without integration

```
Security engineer says: [long report]
Performance engineer says: [long report]
QA tester says: [long report]

Figure it out yourself!
```

**Fix:** Synthesize into actionable plan

```
Synthesis:
Critical Issues (Fix before launch):
1. [Security] CSRF vulnerability - MUST FIX
2. [Performance] LCP 4.2s - MUST OPTIMIZE

High Priority (Fix this sprint):
3. [Security + QA] Rate limiting missing + needs tests
4. [Performance] Bundle size 800KB - reduce to <300KB

Medium Priority (Next sprint):
5. [QA] Edge case: token expiration - add tests
```

### Anti-Pattern: The "Ignored Conflicts" Ostrich

**Problem:** Reporting contradictory recommendations without resolution

```
Security: Use bcrypt with 12 rounds
Performance: bcrypt is too slow, use scrypt with 8 rounds

[No resolution provided]
```

**Fix:** Actively resolve conflicts

```
Conflict: Password hashing strength vs performance

Analysis:
- Security: 12 rounds needed for strong protection
- Performance: Login taking 800ms (target <200ms)

Resolution:
- Use bcrypt with 10 rounds (compromise)
- Implement caching for repeated auth checks
- Add rate limiting (security benefit)
- Monitor auth endpoint performance

Result: Acceptable security (10 rounds still strong) + performance (200ms with caching)
```

## Conclusion

Advanced team assembly techniques enable handling complex, multi-dimensional projects effectively. Key principles:

1. **Right-size teams** - Start small, grow as needed
2. **Choose coordination mode** - Parallel, sequential, or hybrid based on dependencies
3. **Synthesize comprehensively** - Integrate perspectives, don't just list them
4. **Resolve conflicts** - Address disagreements with clear rationale
5. **Measure and improve** - Track effectiveness, iterate on process
6. **Stay flexible** - Adjust team composition and approach as you learn

Master these techniques to handle increasingly complex projects with confidence.
