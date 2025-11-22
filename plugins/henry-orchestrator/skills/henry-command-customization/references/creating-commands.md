# Creating Commands Guide

## Overview

This guide walks through creating new Henry-style commands from scratch. Follow this process when forking existing commands isn't sufficient and you need a completely new workflow.

## When to Create New Commands

### Good Reasons

✅ **Novel workflow:** Workflow doesn't resemble any existing command
✅ **Repeated need:** Will use this workflow multiple times
✅ **Team sharing:** Multiple team members will use it
✅ **Complex orchestration:** Requires careful agent sequencing
✅ **Domain-specific:** Tailored to specific technology or domain

### Alternative Approaches

Consider these before creating new command:

- **henry-team**: For ad-hoc agent combinations
- **Inline customization**: For one-off variations
- **Command forking**: When existing command is close match
- **Command composition**: Chain existing commands

## Creation Process

### Step 1: Define Command Purpose

Answer these questions:

**What problem does this solve?**

- What workflow are you automating?
- What pain point does it address?
- Why can't existing commands handle this?

**Who will use it?**

- Specific team members?
- Entire team?
- Specific project only?
- Reusable across projects?

**What are the outcomes?**

- What deliverables should it produce?
- How will success be measured?
- What should user have at the end?

**Example:**

```
Purpose: API development workflow
Problem: No command for OpenAPI-first API development
Users: Backend team developing APIs
Outcomes: OpenAPI spec, implemented API, security review, tests, docs
```

### Step 2: Choose Command Name

**Naming conventions:**

✅ **Descriptive action-object:** `api-workflow`, `mobile-feature`, `db-migration`
✅ **Lowercase with hyphens:** `security-review`, not `SecurityReview`
✅ **Clear purpose:** Name indicates what it does
✅ **Avoid conflicts:** Don't use `henry-*` unless contributing upstream

❌ **Too generic:** `build`, `test`, `deploy`
❌ **Too long:** `comprehensive-full-stack-feature-development-workflow`
❌ **Unclear:** `do-the-thing`, `workflow-1`

**Examples:**

| Good              | Bad                                   | Why                  |
| ----------------- | ------------------------------------- | -------------------- |
| `api-workflow`    | `api`                                 | Too vague            |
| `mobile-feature`  | `mobile-feature-development-workflow` | Too long             |
| `security-review` | `sec`                                 | Unclear abbreviation |
| `db-migration`    | `migrate`                             | Missing context      |

### Step 3: Identify Agents

**Review available agents:**

```bash
/agents
```

**Common Henry agents:**

- `backend-engineer`: Backend development, APIs, databases
- `frontend-engineer`: Frontend development, UI implementation
- `mobile-app-engineer`: iOS, Android, React Native
- `devops-sre-architect`: Infrastructure, deployment, ops
- `security-engineer`: Security review, threat modeling
- `performance-engineer`: Performance optimization, metrics
- `qa-tester`: Testing strategy, test implementation
- `data-engineer`: Data pipelines, ETL, data architecture
- `data-analytics-engineer`: Analytics, metrics, insights
- `ux-researcher`: User research, usability testing
- `ux-ui-designer`: UX design, wireframes, user flows
- `ui-visual-designer`: Visual design, design systems
- `a11y-specialist`: Accessibility compliance
- `seo-specialist`: SEO optimization
- `product-manager`: Product strategy, requirements

**Select agents for your workflow:**

- Which experts are needed?
- What order should they work?
- Which can work in parallel?
- Which need sequential handoffs?

**Example for API workflow:**

```
Phase 1: API Design → backend-engineer
Phase 2: Security Review → security-engineer
Phase 3: Implementation → backend-engineer
Phase 4: Testing → qa-tester
Phase 5: Documentation → backend-engineer
```

### Step 4: Define Phases

Break workflow into logical phases.

**Good phase characteristics:**

- **Clear goal:** Single, well-defined objective
- **Appropriate scope:** 3-7 actions per phase
- **Concrete deliverables:** Specific outputs
- **Logical boundaries:** Natural handoff points

**Phase template:**

```markdown
## Phase N: [Phase Name]

**Goal**: [Single sentence describing what this phase accomplishes]

**Actions**:

1. [Specific action with clear outcome]
2. [Another action]
3. [Another action]

**Agents**: [Which agents are involved]

**Deliverables**: [Concrete outputs this phase produces]

**User Interaction**: [Optional: When user input or approval needed]
```

**Example:**

```markdown
## Phase 1: API Design

**Goal**: Create OpenAPI specification for the API

**Actions**:

1. Launch backend-engineer to design REST API
2. Define endpoints, request/response schemas
3. Document authentication and authorization
4. Create OpenAPI 3.0 specification
5. Review API design for best practices

**Agents**: backend-engineer

**Deliverables**: OpenAPI 3.0 specification, endpoint documentation

**User Interaction**: Review and approve API design before implementation
```

**How many phases?**

- **3-5 phases:** Typical for focused workflows
- **6-8 phases:** Typical for comprehensive workflows
- **9+ phases:** Consider splitting into multiple commands

**Phase sequencing:**

- **Sequential:** Each phase depends on previous (most common)
- **Parallel:** Independent phases can run simultaneously
- **Conditional:** Some phases only run under certain conditions
- **Iterative:** Phases repeat until criteria met

### Step 5: Write Command File

Create file in appropriate location:

**Project-specific:**

```bash
touch .claude/commands/your-command.md
```

**Personal:**

```bash
touch ~/.claude/commands/your-command.md
```

**Use this template:**

```markdown
---
description: [Clear, concise description for /help - 60-120 characters]
argument-hint: [Optional: expected arguments format]
version: '1.0.0'
---

# [Command Title]

[1-2 paragraph overview explaining:

- What this command does
- When to use it
- What outcomes to expect]

## Phase 1: [Phase Name]

**Goal**: [What this phase accomplishes]

**Actions**:

1. [Specific action]
2. [Another action]
3. [Another action]

**Agents**: [Agent names]

**Deliverables**: [Concrete outputs]

## Phase 2: [Phase Name]

[Repeat phase structure...]

## Summary

[How to synthesize all phase deliverables and present final output]

[What user should have at completion]

[Suggested next steps]

---

## Usage Examples

**Example 1: [Scenario]**
```

/your-command [args]

```

**Example 2: [Scenario]**
```

/your-command [args]

```

```

### Step 6: Add Detailed Content

Expand each section with specifics:

**Frontmatter:**

- Write clear description (60-120 chars)
- Add argument hint if command takes arguments
- Include version for tracking

**Overview:**

- Explain command purpose
- Describe use cases
- Set expectations

**Each phase:**

- Write clear, actionable steps
- Specify exact agent names
- Define concrete deliverables
- Add user interaction points

**Summary:**

- Explain how to synthesize deliverables
- Describe final output
- Suggest next steps

**Examples:**

- Show 2-3 realistic scenarios
- Use actual arguments
- Demonstrate different use cases

### Step 7: Test Command

Verify command works correctly:

**1. Check command appears:**

```bash
/help
```

Look for your command in the list.

**2. Test invocation:**

```bash
/your-command [test-args]
```

**3. Verify execution:**

- Phases execute in correct order
- Agents are invoked properly
- Deliverables are produced
- User interactions work
- Summary is coherent

**4. Test with different arguments:**
If command takes arguments, test multiple variations

**5. Edge cases:**

- Missing arguments
- Invalid arguments
- Empty results
- Error conditions

### Step 8: Document and Share

**Add to project documentation:**

```markdown
## Custom Commands

### /api-workflow

API development workflow with OpenAPI spec generation.

**Usage:**
```

/api-workflow [api-name] "[description]"

```

**Example:**
```

/api-workflow user-management "CRUD API for user accounts"

```

**Phases:**
1. API Design with OpenAPI spec
2. Security review
3. Implementation
4. Testing
5. Documentation

**Deliverables:**
- OpenAPI 3.0 specification
- Implemented and tested API
- Security review sign-off
- API documentation
```

**Commit to version control:**

```bash
git add .claude/commands/api-workflow.md
git commit -m "Add API development workflow command

Custom command for OpenAPI-first API development with:
- API design phase with OpenAPI spec generation
- Security review phase
- Implementation with tests
- Documentation generation

Usage: /api-workflow [api-name] [description]"
```

**Share with team:**

- Announce in team chat
- Demo command usage
- Share documentation
- Gather feedback

## Complete Example

Let's create a complete command: mobile-feature workflow

### 1. Define Purpose

**Purpose:** End-to-end mobile feature development for iOS/Android
**Users:** Mobile team
**Outcomes:** Designed, implemented, tested mobile feature

### 2. Choose Name

**Name:** `mobile-feature`
**File:** `.claude/commands/mobile-feature.md`

### 3. Identify Agents

- Phase 1 (Design): `ux-ui-designer`, `mobile-app-engineer`
- Phase 2 (Implementation): `mobile-app-engineer`
- Phase 3 (Testing): `qa-tester`
- Phase 4 (Performance): `performance-engineer`, `mobile-app-engineer`

### 4. Define Phases

1. Mobile-first design
2. Implementation (native or React Native)
3. Multi-device testing
4. Performance optimization

### 5. Write Command

**`.claude/commands/mobile-feature.md`:**

```markdown
---
description: Mobile app feature development for iOS/Android
argument-hint: [feature-name] [platform]
version: "1.0.0"
---

# Mobile Feature Development

End-to-end mobile feature development with platform-specific considerations for iOS and Android.

## Phase 1: Mobile UX Design

**Goal**: Create platform-appropriate UX design

**Actions**:

1. Launch ux-ui-designer for mobile-first design
2. Apply iOS Human Interface Guidelines or Material Design principles
3. Design for platform-specific patterns (navigation, gestures, components)
4. Consider offline-first requirements
5. Create responsive layouts for different screen sizes

**Agents**: ux-ui-designer, mobile-app-engineer

**Deliverables**: Platform-specific wireframes, prototypes, design assets

**User Interaction**: Review and approve designs before implementation

## Phase 2: Mobile Implementation

**Goal**: Implement feature for target platform(s)

**Actions**:

1. Launch mobile-app-engineer for implementation
2. Implement using native (Swift/Kotlin) or React Native
3. Implement offline-first architecture if needed
4. Follow platform-specific best practices
5. Optimize for mobile performance (cold start, memory usage)
6. Handle platform-specific requirements (permissions, background tasks)

**Agents**: mobile-app-engineer

**Deliverables**: Mobile app implementation with platform-specific optimizations

## Phase 3: Mobile-Specific QA

**Goal**: Test across devices and scenarios

**Actions**:

1. Launch qa-tester for mobile test strategy
2. Test on multiple device sizes (phones, tablets)
3. Test on multiple OS versions
4. Test offline/online transitions
5. Test background/foreground transitions
6. Test interruptions (calls, notifications)
7. Validate app store compliance (if applicable)

**Agents**: qa-tester, mobile-app-engineer

**Deliverables**: Mobile test results, device compatibility matrix, test coverage report

## Phase 4: Performance Optimization

**Goal**: Meet mobile performance targets

**Actions**:

1. Launch performance-engineer for mobile metrics
2. Optimize cold start time (target: < 2 seconds)
3. Reduce memory footprint
4. Minimize ANR rate (target: < 0.5%)
5. Achieve crash-free rate (target: > 99.5%)
6. Optimize battery usage
7. Reduce app size if needed

**Agents**: performance-engineer, mobile-app-engineer

**Deliverables**: Performance benchmarks, optimization report, metrics comparison

## Summary

Complete mobile feature ready for release:

- Platform-appropriate UX following iOS/Android guidelines
- Optimized native or React Native implementation
- Comprehensive testing across devices and OS versions
- Performance validated against mobile targets (cold start, memory, stability)
- App store compliance verified (if applicable)

Next steps:

- Prepare app store listing (if new app)
- Submit for internal testing (TestFlight, Google Play Internal Testing)
- Gather user feedback and iterate

---

## Usage Examples

**iOS feature:**
```

/mobile-feature offline-notes iOS

```

**Android feature:**
```

/mobile-feature payment-flow Android

```

**Cross-platform React Native:**
```

/mobile-feature user-profile "iOS and Android"

```

**Tablet-specific:**
```

/mobile-feature dashboard-view "iPad and Android tablets"

```

```

### 6. Test

```bash
# Verify command appears
/help

# Test invocation
/mobile-feature test-feature iOS

# Verify phases execute correctly
# Verify agents invoked properly
# Check deliverables produced
```

### 7. Document

Add to project README:

```markdown
## Custom Commands

### /mobile-feature [feature-name] [platform]

Mobile feature development workflow for iOS/Android.

**Phases:**

1. Mobile UX design (platform-appropriate)
2. Implementation (native or React Native)
3. Multi-device testing
4. Performance optimization

**Example:**
```

/mobile-feature offline-sync "iOS and Android"

```

```

### 8. Share

```bash
git add .claude/commands/mobile-feature.md
git commit -m "Add mobile feature development command"
git push

# Announce to team
```

## Best Practices

### Design

✅ **Clear phase boundaries:** Each phase has distinct goal and deliverables
✅ **Appropriate granularity:** 3-7 actions per phase
✅ **Logical flow:** Phases build on each other naturally
✅ **User checkpoints:** Approval points at key milestones
✅ **Concrete deliverables:** Specific, measurable outputs

### Writing

✅ **Imperative form:** "Launch engineer" not "You should launch"
✅ **Active voice:** "Create specification" not "Specification is created"
✅ **Concrete language:** "OpenAPI 3.0 spec" not "documentation"
✅ **Consistent structure:** Use template for all phases
✅ **Clear instructions:** Assume reader is new to Henry

### Maintenance

✅ **Version tracking:** Update version field when changing
✅ **Change documentation:** Document significant changes
✅ **Regular testing:** Verify command after updates
✅ **Deprecation plan:** Remove when no longer needed
✅ **Feedback incorporation:** Improve based on usage

## Common Pitfalls

### Too Many Phases

**Problem:** 12+ phases making command overwhelming

**Solution:**

- Combine related phases
- Split into multiple commands
- Use command composition

### Vague Actions

**Problem:** Actions like "Review code" without specifics

**Solution:**

- Be specific: "Review for OWASP Top 10 vulnerabilities"
- Define criteria: "Ensure test coverage > 80%"
- Specify tools: "Run ESLint with airbnb config"

### Wrong Agents

**Problem:** Using agent for wrong task

**Solution:**

- Review agent descriptions in `/agents`
- Match agent expertise to phase needs
- Combine agents when multiple perspectives needed

### No User Interaction

**Problem:** Long workflow with no checkpoints

**Solution:**

- Add approval points at phase boundaries
- Request input for critical decisions
- Allow user to skip optional phases

### Missing Deliverables

**Problem:** Phase completes but no concrete output

**Solution:**

- Define specific artifacts: "OpenAPI spec file"
- Specify formats: "Test report in JUnit XML"
- Provide examples: "Similar to example-api.yaml"

## Troubleshooting

### Command Not Appearing

**Issue:** Command doesn't show in `/help`

**Solutions:**

- Check file location: `.claude/commands/` or `~/.claude/commands/`
- Verify `.md` extension
- Validate YAML frontmatter (no syntax errors)
- Restart Claude Code: `/clear`

### Agents Not Invoked

**Issue:** Agents aren't invoked or wrong agents run

**Solutions:**

- Check exact agent names in `/agents`
- Review phase instructions for clarity
- Make agent invocation explicit
- Test agent independently with `/henry-orchestrator:henry-team [agent]`

### Phases Out of Order

**Issue:** Phases execute in wrong sequence

**Solutions:**

- Explicitly state dependencies: "After Phase 1 completes..."
- Add user confirmation checkpoints
- Use numbered lists for sequential actions
- Test workflow end-to-end

### Arguments Not Working

**Issue:** `$1`, `$2` not substituting

**Solutions:**

- Verify syntax: `$1` not `$arg1`
- Check `argument-hint` matches invocation
- Test: `/your-command arg1 arg2`
- Escape if needed: `\$1` to show literal

## Advanced Topics

### Parameterization

Use command arguments for flexibility:

```markdown
---
argument-hint: [feature] [env] [options]
---

# Deployment: $1 to $2

Deploy $1 feature to $2 environment with options: $3

## Phase 1: Pre-Deploy Checks

Verify $1 is ready for $2:

- Run tests for $1
- Check $2 environment health
- Verify $3 configuration
```

### Conditional Logic

Implement conditional phases:

```markdown
## Phase 2: Optimization (Conditional)

**Condition:** Only if Phase 1 found critical issues

**Goal:** Address critical issues before proceeding

If critical issues found in Phase 1:
→ Execute optimization
Otherwise:
→ Skip to Phase 3
```

### Iteration

Create iterative workflows:

```markdown
## Phase 3: Optimization Cycle

**Goal:** Iterate until performance target met

**Actions**:

1. Measure current performance
2. If target met → Proceed to Phase 4
3. If target not met:
   - Implement next optimization
   - Measure again
   - Repeat until target met or 3 cycles complete
```

### External Tools

Integrate external tools:

````markdown
## Phase 2: Security Scan

**Actions**:

1. Run SAST scan
   ```bash
   snyk test --severity-threshold=high
   ```
````

2. Launch security-engineer to review results
3. Create remediation plan

```

## Related Documentation

- **Command Format:** `references/command-format.md`
- **Forking Guide:** `references/forking-guide.md`
- **Customization Patterns:** `references/customization-patterns.md`
- **Examples:** `examples/` directory
```
