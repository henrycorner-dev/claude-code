# Command File Format Specification

## Overview

Henry Orchestrator commands are markdown files with YAML frontmatter that define multi-phase workflows with agent orchestration. This document specifies the complete command file format.

## File Structure

```markdown
---
[YAML frontmatter]
---

# [Command Title]

[Command body in markdown]
```

## Frontmatter Fields

### Required Fields

#### description
- **Type:** String
- **Purpose:** Brief description shown in `/help` command list
- **Format:** Single line, 60-120 characters
- **Example:** `description: End-to-end feature development from design to deployment`

### Optional Fields

#### argument-hint
- **Type:** String
- **Purpose:** Shows expected arguments in command list
- **Format:** `[arg1] [arg2]` or descriptive text
- **Example:** `argument-hint: [feature-name] [optional-scope]`

#### allowed-tools
- **Type:** String or Array
- **Purpose:** Restrict which tools can be used in command execution
- **Format:** Comma-separated string or YAML array
- **Example:** `allowed-tools: read_file, write_file, bash`
- **Note:** Use sparingly, as tool restrictions limit agent flexibility

#### model
- **Type:** String
- **Purpose:** Specify which Claude model to use
- **Format:** Model identifier (e.g., `sonnet`, `opus`, `haiku`)
- **Example:** `model: sonnet`
- **Note:** Usually unnecessary; defaults are typically optimal

#### version
- **Type:** String
- **Purpose:** Track command version for maintenance
- **Format:** Semantic versioning (e.g., `1.0.0`)
- **Example:** `version: "1.2.0"`

### Example Frontmatter

```yaml
---
description: API development with OpenAPI spec, implementation, and testing
argument-hint: [api-name] [description]
allowed-tools: read_file, write_file, bash
version: "1.0.0"
---
```

## Body Structure

### Title

First heading should be command title (H1):

```markdown
# API Development Workflow
```

### Introduction Section

Brief overview paragraph explaining:
- Command purpose
- Use cases
- Expected outcomes
- Prerequisites (if any)

```markdown
Complete API development from specification to production-ready implementation.

This command orchestrates backend-engineer, security-engineer, and qa-tester
to create fully tested, documented APIs with security review.
```

### Phase Sections

Each phase should be H2 heading with consistent structure:

```markdown
## Phase 1: API Design

**Goal**: Create OpenAPI specification

**Actions**:
1. Launch backend-engineer to design REST API
2. Define endpoints, request/response schemas
3. Document authentication and authorization
4. Create OpenAPI 3.0 specification

**Agents**: backend-engineer

**Deliverables**: OpenAPI spec, endpoint documentation

**User Interaction**: Review and approve API design before implementation
```

#### Phase Components

**Goal** (required):
- Single sentence describing phase objective
- Should be measurable/verifiable

**Actions** (required):
- Numbered list of steps
- 3-7 actions per phase (more indicates phase should be split)
- Action verbs: "Launch", "Create", "Review", "Implement", "Validate"

**Agents** (required):
- Which agents are invoked
- Format: Agent names from `/agents` list
- Multiple agents: `backend-engineer, security-engineer`

**Deliverables** (required):
- Concrete outputs produced by phase
- Should be specific: "API implementation" not "code"

**User Interaction** (optional):
- When user approval or input needed
- Format: Clear instruction for what user should do

### Summary Section

Final H2 section synthesizing all phases:

```markdown
## Summary

Present complete API package:
- OpenAPI specification with endpoint documentation
- Implemented and tested API meeting security requirements
- Security review sign-off with threat model
- Production-ready documentation with usage examples

Next steps: Deploy to staging environment and run integration tests
```

Should include:
- Comprehensive list of all deliverables
- How to verify completion
- Suggested next steps

### Usage Examples Section (optional)

Show concrete command invocation examples:

```markdown
## Usage Examples

**E-commerce API:**
```
/api-workflow user-management "CRUD API for user accounts"
```

**Payment processing:**
```
/api-workflow payment-processing "Stripe integration API"
```
```

## Agent Invocation Patterns

### Single Agent

```markdown
Launch backend-engineer to implement API endpoints
```

### Multiple Agents in Parallel

```markdown
Launch security-engineer and performance-engineer in parallel to audit the implementation
```

### Multiple Agents Sequentially

```markdown
1. Launch security-engineer to identify vulnerabilities
2. Address critical findings
3. Launch performance-engineer to measure optimized baseline
```

### Conditional Agent Invocation

```markdown
If critical security issues found:
  → Launch security-engineer to provide remediation guidance
Otherwise:
  → Proceed to performance optimization phase
```

### Agent Team Pattern

```markdown
Launch a team of backend-engineer and devops-sre-architect to design
deployment architecture
```

## User Interaction Patterns

### Approval Checkpoint

```markdown
**User Interaction**: Review security findings and approve remediation plan before proceeding
```

### Input Request

```markdown
**User Interaction**: Specify target performance metrics (e.g., "LCP < 2.5s, FID < 100ms")
```

### Clarification Point

```markdown
**User Interaction**: Confirm authentication method (OAuth 2.0, JWT, API keys)
```

### Optional Branch

```markdown
**User Interaction**: Skip accessibility audit? (Y/N)
```

## Argument Handling

### Accessing Arguments

Commands can reference arguments using:
- `$ARGUMENTS` - All arguments as single string
- `$1`, `$2`, `$3` - Individual positional arguments

### Example

```markdown
---
argument-hint: [feature-name] [platform]
---

# Mobile Feature Development: $1

Implementing $1 for $2 platform.

## Phase 1: Design

Design $1 feature following $2 platform guidelines...
```

Invocation:
```
/mobile-feature payment-flow iOS
```

Expands to:
```
# Mobile Feature Development: payment-flow

Implementing payment-flow for iOS platform.
```

## Formatting Conventions

### Code Blocks

Use fenced code blocks with language specifiers:

````markdown
```bash
npm run build
```

```typescript
interface User {
  id: string;
  email: string;
}
```
````

### Lists

Use numbered lists for sequential actions:
```markdown
1. First action
2. Second action
3. Third action
```

Use bulleted lists for non-sequential items:
```markdown
- Security audit report
- Performance baseline metrics
- Test coverage report
```

### Emphasis

- **Bold** for labels and important terms: `**Goal:**`, `**Actions:**`
- *Italic* for emphasis or technical terms: `*security-engineer*`
- `Code formatting` for code, commands, file paths: `` `npm install` ``

### Links

Reference other documentation:
```markdown
For detailed patterns, see `references/customization-patterns.md`

See `examples/api-workflow.md` for complete example
```

## Best Practices

### Command Design

✅ **Clear phase boundaries:** Each phase should have distinct goal and deliverables
✅ **Appropriate granularity:** 3-7 phases typical; more suggests splitting into multiple commands
✅ **Explicit agent names:** Use exact agent names from `/agents` list
✅ **Actionable deliverables:** Specify concrete outputs, not vague results
✅ **User interaction points:** Identify where user approval or input needed

### Writing Style

✅ **Imperative form:** "Launch engineer" not "You should launch engineer"
✅ **Active voice:** "Create specification" not "Specification is created"
✅ **Concrete language:** "OpenAPI 3.0 spec" not "API documentation"
✅ **Consistent structure:** Use same phase component structure throughout
✅ **Clear instructions:** Assume reader is new to Henry

### Maintenance

✅ **Version tracking:** Update version field when changing command
✅ **Documentation:** Document rationale for customizations
✅ **Testing:** Verify command works after changes
✅ **Changelog:** Track significant changes in command comments

## Validation Checklist

Before finalizing command file:

- [ ] Frontmatter includes `description` field
- [ ] Description is 60-120 characters
- [ ] Command title is H1 heading
- [ ] Each phase has Goal, Actions, Agents, Deliverables
- [ ] Actions are numbered and concrete
- [ ] Agent names match exactly from `/agents` list
- [ ] Summary section synthesizes all deliverables
- [ ] Code blocks have language specifiers
- [ ] User interaction points are clearly marked
- [ ] File saved in `.claude/commands/` or `~/.claude/commands/`
- [ ] File has `.md` extension

## Common Issues

**Command not appearing in /help:**
- Check file location (must be in `.claude/commands/` or `~/.claude/commands/`)
- Verify `.md` extension
- Ensure valid YAML frontmatter (no syntax errors)
- Restart Claude Code to refresh command list

**Agents not invoked:**
- Verify exact agent name spelling (check `/agents` list)
- Ensure phase instructions are clear and explicit
- Check for typos in agent names

**Phases executing out of order:**
- Explicitly state sequential dependencies
- Use numbered lists for sequential actions
- Add "wait for user confirmation" checkpoints

**Arguments not substituting:**
- Verify argument syntax: `$1`, `$2`, not `$arg1`
- Check argument-hint matches expected arguments
- Test command invocation with sample arguments

## Examples

### Minimal Command

```markdown
---
description: Quick security review for pull requests
---

# PR Security Review

## Phase 1: Security Scan

**Goal**: Identify security vulnerabilities in PR changes

**Actions**:
1. Launch security-engineer to review PR diff
2. Check for OWASP Top 10 vulnerabilities
3. Validate input sanitization

**Agents**: security-engineer

**Deliverables**: Security review report with findings

## Summary

Security review complete. Address any critical findings before merging.
```

### Complex Command with Arguments

```markdown
---
description: Full-stack feature with backend, frontend, and deployment
argument-hint: [feature-name] [deployment-environment]
version: "1.0.0"
---

# Full-Stack Feature: $1

End-to-end implementation of $1 for $2 environment.

## Phase 1: Backend Development

**Goal**: Implement backend API for $1

**Actions**:
1. Launch backend-engineer to design API
2. Implement endpoints and business logic
3. Write unit and integration tests
4. Document API with OpenAPI spec

**Agents**: backend-engineer

**Deliverables**: Backend API implementation, tests, documentation

## Phase 2: Frontend Development

**Goal**: Build UI for $1

**Actions**:
1. Launch frontend-engineer to implement UI
2. Integrate with backend API
3. Add client-side validation and error handling
4. Write component tests

**Agents**: frontend-engineer

**Deliverables**: Frontend implementation, component tests

**User Interaction**: Review UI implementation and provide feedback

## Phase 3: Deployment

**Goal**: Deploy $1 to $2 environment

**Actions**:
1. Launch devops-sre-architect to prepare deployment
2. Set up CI/CD pipeline
3. Deploy to $2 environment
4. Verify deployment health

**Agents**: devops-sre-architect

**Deliverables**: Deployed feature in $2, CI/CD configuration

## Summary

$1 successfully implemented and deployed to $2:
- Backend API with tests and documentation
- Frontend UI integrated with backend
- Automated deployment pipeline
- Health checks passing in $2

Next steps: Monitor production metrics and gather user feedback
```

## Related Documentation

- **Creating Commands Guide:** `references/creating-commands.md`
- **Customization Patterns:** `references/customization-patterns.md`
- **Henry Agent Reference:** `plugins/henry-orchestrator/agents/`
- **Command Examples:** `examples/` directory
