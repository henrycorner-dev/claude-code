---
name: henry-team-assembly
description: Guide for assembling and running custom teams of Henry Orchestrator agents using the henry-team command. Triggered when tasks require multiple specialist perspectives (e.g., "review for security and UX", "need frontend and performance experts", "assemble a design team") or when coordinating parallel agent execution is mentioned. Use for multi-dimensional tasks like security + UX reviews, frontend + performance optimization, full design workflows, comprehensive code reviews, or pre-launch audits. Supports explicit agent selection, task-based agent suggestion, and hybrid approaches for flexible team composition.
---

# Henry Team Assembly

This skill guides you in assembling and running custom teams of Henry Orchestrator agents using the `/henry-orchestrator:henry-team` command. Teams enable parallel or sequential collaboration between multiple specialist agents for complex, multi-dimensional tasks.

## Overview

The `henry-team` command allows flexible agent orchestration:

- Select specific agents for your task
- Let the system suggest appropriate agents based on task description
- Execute agents in parallel (faster) or sequentially (clearer handoffs)
- Synthesize outputs from multiple perspectives

**Basic syntax:**

```
/henry-orchestrator:henry-team [agent-1] [agent-2] ... - [task description]
/henry-orchestrator:henry-team [task description that implies needed agents]
```

## Team Composition Guidelines

### Team Size Recommendations

**Small teams (2-3 agents)**: Focused, specific reviews

- **Best for**: Targeted audits, specific feature reviews, quick assessments
- **Advantages**: Fast execution, clear outputs, easy to synthesize
- **Examples**: security + backend review, frontend + performance optimization

**Medium teams (4-5 agents)**: Comprehensive workflows

- **Best for**: Complete feature development, thorough audits, end-to-end workflows
- **Advantages**: Balanced coverage, manageable coordination, good depth
- **Examples**: Complete design workflow (UX research + UX/UI + visual + a11y), full code review

**Large teams (6+ agents)**: Rare, for major initiatives

- **Best for**: Product launches, major refactors, complete system audits
- **Advantages**: Complete coverage across all domains
- **Disadvantages**: Longer execution time, complex synthesis required
- **Examples**: Pre-launch audit (security + performance + a11y + SEO + ops + data), full feature development

**General rule**: Start with smallest effective team, add agents as needed

## Team Patterns

**Note:** For comprehensive pattern details including deliverables, duration estimates, and success indicators, see `references/team-patterns.md`.

### Pattern 1: Review Teams

**Security + Backend Review**

```
/henry-orchestrator:henry-team security-engineer backend-engineer - Review API authentication
```

**Use for**: Security-critical backend code  
**Why this combo**: Security expert identifies threats, backend expert assesses implementation quality  
**Output**: Security vulnerabilities + code quality issues + remediation plan

**QA + Performance Review**

```
/henry-orchestrator:henry-team qa-tester performance-engineer - Review checkout flow
```

**Use for**: User-facing flows with performance requirements  
**Why this combo**: QA validates functionality, performance engineer optimizes speed  
**Output**: Test coverage analysis + performance bottlenecks + optimization recommendations

**Security + QA + Performance (Comprehensive Review)**

```
/henry-orchestrator:henry-team security-engineer qa-tester performance-engineer - Review payment integration
```

**Use for**: Critical features requiring thorough validation  
**Why this combo**: Covers security, functionality, and performance simultaneously  
**Output**: Security audit + test strategy + performance baseline + prioritized fixes

### Pattern 2: Design Teams

**Research + UX Design**

```
/henry-orchestrator:henry-team ux-researcher ux-ui-designer - Design onboarding flow
```

**Use for**: New features needing user research  
**Why this combo**: Research informs design decisions  
**Output**: User personas + journey maps + wireframes + prototypes

**Complete Design Workflow**

```
/henry-orchestrator:henry-team ux-researcher ux-ui-designer ui-visual-designer a11y-specialist - Design checkout
```

**Use for**: Major user flows requiring complete design  
**Why this combo**: Full design pipeline from research to accessible implementation  
**Output**: Research insights + UX flows + visual design + accessibility compliance

**Design + Accessibility**

```
/henry-orchestrator:henry-team ux-ui-designer a11y-specialist - Review dashboard designs
```

**Use for**: Validating existing designs for accessibility  
**Why this combo**: UX designer makes changes, a11y specialist validates compliance  
**Output**: Revised designs meeting WCAG 2.1 AA standards

### Pattern 3: Implementation Teams

**Frontend + Performance**

```
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Build landing page
```

**Use for**: Performance-critical UI development  
**Why this combo**: Frontend engineer builds, performance engineer ensures speed  
**Output**: Optimized implementation meeting Core Web Vitals targets

**Frontend + Backend (Full-Stack)**

```
/henry-orchestrator:henry-team frontend-engineer backend-engineer - Build user dashboard
```

**Use for**: Features requiring both UI and API work  
**Why this combo**: Coordinated full-stack development  
**Output**: Complete feature with UI + API implementation

**Backend + Security + DevOps**

```
/henry-orchestrator:henry-team backend-engineer security-engineer devops-sre-architect - Build auth service
```

**Use for**: Critical backend services  
**Why this combo**: Backend implementation + security hardening + deployment strategy  
**Output**: Secure, production-ready service with deployment plan

### Pattern 4: Optimization Teams

**Performance + Frontend + Backend**

```
/henry-orchestrator:henry-team performance-engineer frontend-engineer backend-engineer - Optimize app performance
```

**Use for**: System-wide performance optimization  
**Why this combo**: Performance engineer identifies issues, engineers implement fixes  
**Output**: Performance baseline + optimizations + benchmark improvements

**SEO + Frontend + Performance**

```
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer - Optimize landing pages
```

**Use for**: Public-facing pages needing SEO  
**Why this combo**: SEO structure + technical implementation + Core Web Vitals  
**Output**: SEO-optimized pages with fast load times

### Pattern 5: Audit Teams

**Complete Pre-Launch Audit**

```
/henry-orchestrator:henry-team security-engineer performance-engineer a11y-specialist seo-specialist devops-sre-architect - Audit before production launch
```

**Use for**: Production readiness checks  
**Why this combo**: Comprehensive coverage across quality dimensions  
**Output**: Security report + performance audit + a11y compliance + SEO check + ops readiness

**Quality Triad (QA + Security + Performance)**

```
/henry-orchestrator:henry-team qa-tester security-engineer performance-engineer - Quality audit
```

**Use for**: Quality-focused audits  
**Why this combo**: Core quality dimensions covered  
**Output**: Test coverage + security vulnerabilities + performance issues

### Pattern 6: Product Teams

**Strategy + Design + Analytics**

```
/henry-orchestrator:henry-team product-strategist ux-ui-designer data-analytics-engineer - Plan new feature
```

**Use for**: Feature planning and design  
**Why this combo**: Business strategy + UX design + metrics planning  
**Output**: PRD + wireframes + analytics plan + success metrics

**Strategy + Analytics + SEO**

```
/henry-orchestrator:henry-team product-strategist data-analytics-engineer seo-specialist - Growth strategy
```

**Use for**: Growth and acquisition planning  
**Why this combo**: Business strategy + data analysis + organic acquisition  
**Output**: Growth plan + experiment backlog + SEO strategy + tracking implementation

## Team Invocation Methods

### Method 1: Explicit Agent Selection

Specify exact agents needed:

```
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Optimize dashboard
```

**Advantages**: Precise control, predictable team composition  
**Use when**: You know exactly which specialists you need

### Method 2: Task-Based Selection

Describe task, let system suggest agents:

```
/henry-orchestrator:henry-team Review authentication for security and user experience
```

**Advantages**: System recommends optimal team based on task requirements  
**Use when**: Unsure which agents to include, want system recommendation

### Method 3: Hybrid Approach

Specify some agents, add task description for additional suggestions:

```
/henry-orchestrator:henry-team security-engineer - Complete security audit including infrastructure
```

**Advantages**: Guide team composition while allowing system to add relevant specialists  
**Use when**: You know core agents but want comprehensive coverage

## Team Coordination

### Parallel Execution

**When to use**: Independent audits, multiple perspectives on same artifact  
**Advantages**: Faster execution, diverse viewpoints  
**Example**: Security, performance, and a11y auditing same codebase simultaneously

**Team structure:**

```
All agents receive same context → Work independently → Outputs synthesized
```

### Sequential Execution

**When to use**: Workflow phases, where later agents need earlier outputs  
**Advantages**: Clear handoffs, each agent builds on previous work  
**Example**: Research → Design → Implementation pipeline

**Team structure:**

```
Agent 1 completes → Output passed to Agent 2 → Agent 2 completes → Continue
```

### Hybrid Execution

**When to use**: Complex workflows with both parallel and sequential phases  
**Example**: Parallel research and design system audit, then sequential implementation and testing

**Team structure:**

```
(Research + Design System Audit in parallel) → Implementation → Testing
```

## Conflict Resolution

**Note:** For detailed conflict resolution strategies with real-world examples and decision frameworks, see `references/conflict-resolution.md`.

When agents provide conflicting recommendations:

### Priority Framework

1. **Security > Performance > UX**: Security issues are always highest priority
2. **Accessibility = Security**: WCAG compliance is non-negotiable
3. **Performance vs Features**: Use product-strategist to prioritize based on impact
4. **Design vs Engineering**: Design intent prevails unless technically infeasible

### Resolution Process

1. **Identify conflict**: Note where agents disagree
2. **Understand perspectives**: Each agent's rationale and constraints
3. **Assess impact**: User impact, business impact, technical impact
4. **Prioritize**: Use framework above plus project-specific priorities
5. **Document decision**: Record rationale for future reference

### Common Conflicts

**Performance engineer wants lazy loading, A11y specialist concerned about keyboard nav:**

- **Resolution**: Implement lazy loading with keyboard-accessible controls and skip links
- **Rationale**: Can achieve both performance and accessibility with proper implementation

**Security engineer recommends strict CSP, Frontend engineer concerned about third-party widgets:**

- **Resolution**: Security prevails - find compliant third-party solutions or build in-house
- **Rationale**: Security is non-negotiable, features must work within security constraints

**UX designer wants animation, Performance engineer concerned about CLS:**

- **Resolution**: Implement animations that don't cause layout shift (transform/opacity only)
- **Rationale**: User experience and performance both achievable with CSS best practices

## Output Synthesis

After team execution, synthesize agent outputs:

### Step 1: Collect Outputs

Gather all agent deliverables (reports, code, designs, recommendations)

### Step 2: Identify Themes

Find common patterns across agent outputs:

- Issues multiple agents flagged
- Consistent recommendations
- Complementary suggestions

### Step 3: Prioritize

Rank by impact and effort:

- **Critical**: Security vulnerabilities, a11y blockers, major performance issues
- **High**: Important UX problems, moderate security/performance issues
- **Medium**: Nice-to-have improvements, minor optimizations
- **Low**: Future enhancements, polish items

### Step 4: Create Action Plan

Structured implementation plan:

1. Immediate fixes (critical issues)
2. Short-term improvements (high priority)
3. Medium-term enhancements
4. Long-term roadmap items

### Step 5: Document

Comprehensive documentation including:

- Executive summary
- Agent findings by category
- Prioritized recommendations
- Implementation plan
- Success metrics

## Best Practices

**Note:** For advanced team assembly techniques including dynamic team adjustment, iterative refinement, and specialized patterns, see `references/advanced-techniques.md`.

### Before Assembly

1. **Define clear objective**: What specific outcome do you need?
2. **Identify key domains**: Which specialties are critical for this task?
3. **Consider dependencies**: Do agents need to work sequentially or can they work in parallel?
4. **Plan synthesis**: How will you combine outputs?

### During Execution

1. **Provide complete context**: Ensure all agents have necessary information
2. **Monitor progress**: Track agent completion and outputs
3. **Note conflicts early**: Identify disagreements as they emerge
4. **Ask clarifying questions**: If agent output is unclear, request elaboration

### After Execution

1. **Synthesize comprehensively**: Don't just list outputs, integrate them
2. **Resolve conflicts**: Address disagreements explicitly
3. **Prioritize actions**: Clear implementation order
4. **Document decisions**: Record why you chose specific approaches
5. **Define success metrics**: How will you measure if recommendations worked?

## Anti-Patterns to Avoid

❌ **Too many agents**: Assembling 8+ agents for simple tasks  
✅ **Right-size teams**: Use minimum effective team

❌ **Wrong agent combo**: Combining agents with no overlap (e.g., game-systems-designer + devops-sre-architect for unrelated tasks)  
✅ **Synergistic teams**: Choose agents whose expertise combines naturally

❌ **No synthesis**: Presenting separate agent outputs without integration  
✅ **Comprehensive synthesis**: Unified recommendations with clear priorities

❌ **Ignoring conflicts**: Reporting contradictory recommendations without resolution  
✅ **Resolved conflicts**: Address disagreements and document decisions

❌ **Unclear objectives**: Assembling team without specific goal  
✅ **Clear mission**: Define what success looks like before assembling team

## Integration with Henry Commands

While `henry-team` provides maximum flexibility, consider using specialized commands for common workflows:

- `/henry-orchestrator:henry-feature` - Pre-configured team for complete feature development
- `/henry-orchestrator:henry-design` - Design team (researcher + UX/UI + visual + a11y)
- `/henry-orchestrator:henry-review` - Review team (QA + security + performance + relevant engineers)
- `/henry-orchestrator:henry-audit` - Audit team (security + performance + a11y + SEO + ops)
- `/henry-orchestrator:henry-launch` - Launch team (ops + security + performance + QA + analytics)
- `/henry-orchestrator:henry-optimize` - Optimization team (performance + frontend + backend)

Use `henry-team` when you need custom combinations not covered by these commands.

## Quick Reference

| Task Type                | Recommended Team                                                                                   | Size |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ---- |
| Security review          | security-engineer + backend-engineer                                                               | 2    |
| Performance optimization | performance-engineer + frontend-engineer                                                           | 2    |
| UX design                | ux-researcher + ux-ui-designer + a11y-specialist                                                   | 3    |
| Code review              | qa-tester + security-engineer + performance-engineer                                               | 3    |
| Full-stack feature       | frontend-engineer + backend-engineer + qa-tester                                                   | 3    |
| Pre-launch audit         | security-engineer + performance-engineer + a11y-specialist + seo-specialist + devops-sre-architect | 5    |
| Product planning         | product-strategist + data-analytics-engineer                                                       | 2    |
| Design + implementation  | ux-ui-designer + frontend-engineer + a11y-specialist                                               | 3    |

## Examples

**Note:** For detailed, end-to-end examples with complete workflows, conflict resolution, and success metrics, see the `examples/` directory:

- `examples/authentication-review.md` - Comprehensive security review workflow
- `examples/landing-page-optimization.md` - SEO + performance + frontend coordination

### Example 1: Authentication Review

```
/henry-orchestrator:henry-team security-engineer backend-engineer qa-tester - Review authentication implementation

Team rationale:
- security-engineer: Threat modeling, OWASP review
- backend-engineer: Code quality, best practices
- qa-tester: Security test cases

Expected outputs:
- Threat model with STRIDE analysis
- Code review findings
- Security test strategy
```

### Example 2: Landing Page Optimization

```
/henry-orchestrator:henry-team seo-specialist frontend-engineer performance-engineer - Optimize landing page

Team rationale:
- seo-specialist: Technical SEO, structured data
- frontend-engineer: Implementation
- performance-engineer: Core Web Vitals

Expected outputs:
- SEO audit and recommendations
- Implementation plan
- Performance baseline and targets
```

### Example 3: Mobile App Feature

```
/henry-orchestrator:henry-team product-strategist ux-ui-designer mobile-app-engineer - Build offline-first notes feature

Team rationale:
- product-strategist: Requirements, success metrics
- ux-ui-designer: User flows, mobile patterns
- mobile-app-engineer: Offline-first architecture

Expected outputs:
- PRD with metrics
- Mobile UX designs
- Technical architecture
```

For more examples and detailed command documentation, see `/henry-orchestrator:help`.

## Additional Resources

This skill includes comprehensive supporting materials organized for progressive disclosure:

### Examples Directory

Complete, real-world examples with full workflows:

- **authentication-review.md** - Security + backend + QA team reviewing authentication system
  - Team composition rationale
  - Phase-by-phase workflow
  - Conflict resolution example
  - Before/after metrics
  - Success indicators

- **landing-page-optimization.md** - SEO + frontend + performance team optimizing landing page
  - Parallel audit phase
  - Synthesis and implementation
  - Performance-friendly animation conflict resolution
  - Lighthouse score improvements

### References Directory

In-depth technical references for advanced usage:

- **team-patterns.md** - Comprehensive catalog of team composition patterns
  - Review team patterns (2-4 agents)
  - Design team patterns (2-4 agents)
  - Implementation team patterns (2-3 agents)
  - Optimization team patterns (2-3 agents)
  - Audit team patterns (3-6 agents)
  - Product team patterns (2-3 agents)
  - Quick reference matrix with durations and team sizes

- **conflict-resolution.md** - Framework for resolving agent disagreements
  - Priority frameworks (security > performance > UX)
  - Resolution strategies (hierarchy, synthesis, data-driven, incremental)
  - 6 detailed real-world conflict examples with solutions
  - Decision tree for choosing resolution strategy
  - When to escalate conflicts

- **advanced-techniques.md** - Advanced team assembly and coordination
  - Dynamic team adjustment (adding/removing agents mid-execution)
  - Advanced coordination patterns (iterative refinement, cross-functional reviews)
  - Specialized patterns (expert panel, red team/blue team, parallel prototypes)
  - Measuring team effectiveness
  - Anti-patterns and how to fix them

Use these resources to deepen your understanding and handle increasingly complex team assembly scenarios.
