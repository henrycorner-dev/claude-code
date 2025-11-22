# Example: Extended Workflow

## Overview

This example demonstrates adding phases or agents to a standard Henry command to create an extended workflow. Useful when standard commands are close but missing key phases.

## Scenario

**Standard henry-feature workflow (7 phases):**

1. Requirements and scope
2. Design
3. Implementation
4. Testing
5. Code review
6. Performance optimization
7. Summary

**Need: Add comprehensive documentation generation after implementation**

## Why Extend?

- Standard workflow doesn't include dedicated documentation phase
- Documentation is critical for API features
- Want auto-generated API docs from code
- Need user-facing guides
- Want architecture decisions documented

## Solution: Feature with Documentation

Create extended command that adds documentation phase to standard workflow.

### File: `.claude/commands/feature-with-docs.md`

```markdown
---
description: Feature development with comprehensive documentation
argument-hint: [feature-name] [optional-scope]
version: "1.0.0"
---

<!-- Extends henry-feature with additional documentation phase -->

# Feature Development with Documentation

End-to-end feature development with comprehensive documentation generation.

## Phase 1: Requirements and Scope

**Goal**: Define feature requirements and scope

**Actions**:

1. Clarify feature requirements with user
2. Define success criteria
3. Identify dependencies
4. Scope the work

**Agents**: backend-engineer, frontend-engineer (as needed)

**Deliverables**: Clear requirements, defined scope, success criteria

## Phase 2: Design

**Goal**: Design feature architecture and UX

**Actions**:

1. Launch ux-ui-designer for UX design (if UI involved)
2. Launch backend-engineer for API design (if backend involved)
3. Launch frontend-engineer for component design (if frontend involved)
4. Design data models and state management
5. Create architecture diagram

**Agents**: ux-ui-designer, backend-engineer, frontend-engineer (as needed)

**Deliverables**: Design documents, mockups, architecture diagram

**User Interaction**: Review and approve design before implementation

## Phase 3: Implementation

**Goal**: Implement the feature

**Actions**:

1. Launch backend-engineer to implement backend (if applicable)
2. Launch frontend-engineer to implement frontend (if applicable)
3. Implement business logic
4. Integrate frontend and backend
5. Handle error cases

**Agents**: backend-engineer, frontend-engineer (as needed)

**Deliverables**: Working feature implementation

## Phase 4: Testing

**Goal**: Comprehensive testing

**Actions**:

1. Launch qa-tester for test strategy
2. Write unit tests
3. Write integration tests
4. Write end-to-end tests
5. Manual exploratory testing

**Agents**: qa-tester, backend-engineer, frontend-engineer

**Deliverables**: Test suite, test coverage report

## Phase 5: Code Review

**Goal**: Review code quality

**Actions**:

1. Launch backend-engineer to review backend code
2. Launch frontend-engineer to review frontend code
3. Check for best practices
4. Verify test coverage
5. Review error handling

**Agents**: backend-engineer, frontend-engineer (as needed)

**Deliverables**: Code review feedback, approved code

## Phase 6: Performance Optimization

**Goal**: Optimize feature performance

**Actions**:

1. Launch performance-engineer to measure baseline
2. Identify bottlenecks
3. Implement optimizations
4. Verify improvements

**Agents**: performance-engineer

**Deliverables**: Performance metrics, optimization report

## Phase 7: Documentation Generation

**Goal**: Create comprehensive feature documentation

**Actions**:

1. Generate API documentation from code
   - OpenAPI/Swagger spec for REST APIs
   - GraphQL schema documentation
   - JSDoc/TSDoc for JavaScript/TypeScript
   - Docstrings for Python
2. Create user-facing documentation
   - Usage examples
   - Integration guides
   - Configuration options
3. Document architecture decisions
   - Create ADR (Architecture Decision Record)
   - Document design rationale
   - Explain trade-offs
4. Update project documentation
   - Update README with new feature
   - Update CHANGELOG
   - Update API reference
5. Create troubleshooting guide
   - Common issues and solutions
   - Error messages and fixes

**Agents**: backend-engineer, frontend-engineer (depending on feature)

**Deliverables**:

- API documentation (auto-generated from code)
- User guides with examples
- Architecture decision records (ADRs)
- Updated README and CHANGELOG
- Troubleshooting guide

**User Interaction**: Review documentation for completeness and clarity

## Summary

Feature development complete with comprehensive documentation:

**Implementation:**

- ✅ Feature implemented and tested
- ✅ Code reviewed and approved
- ✅ Performance optimized

**Documentation:**

- ✅ API documentation generated
- ✅ User guides created
- ✅ Architecture decisions documented
- ✅ Project docs updated
- ✅ Troubleshooting guide available

**Deliverables:**

- Working feature ready for production
- Complete documentation for developers and users
- Architecture decisions recorded for future reference

**Next Steps:**

- Deploy to staging environment
- Share documentation with team
- Gather user feedback

---

## Usage Examples

**API feature with docs:**
```

/feature-with-docs user-authentication "OAuth 2.0 authentication"

```

**Frontend component with docs:**
```

/feature-with-docs data-table "Sortable, filterable data table component"

```

**Full-stack feature with docs:**
```

/feature-with-docs notification-system "Real-time notifications"

```

```

### Usage

```bash
# Run feature development with documentation
/feature-with-docs payment-processing "Stripe payment integration"
```

## Customization Options

Can adjust Phase 7 based on project needs:

### Option 1: API-Focused Documentation

```markdown
## Phase 7: API Documentation

**Actions**:

1. Generate OpenAPI 3.0 specification
2. Create API reference documentation
3. Provide usage examples with curl
4. Document authentication flows
5. Create Postman collection
```

### Option 2: Library/SDK Documentation

```markdown
## Phase 7: SDK Documentation

**Actions**:

1. Generate API documentation (JSDoc, TypeDoc, Sphinx)
2. Create getting started guide
3. Provide code examples for common use cases
4. Document configuration options
5. Create migration guide (if breaking changes)
```

### Option 3: User-Facing Feature Documentation

```markdown
## Phase 7: User Documentation

**Actions**:

1. Create feature overview
2. Write step-by-step usage guide with screenshots
3. Document common workflows
4. Create video tutorial (optional)
5. Write FAQ based on potential questions
```

## When to Use Extended Workflow

### Use When:

- ✅ Standard command is 80% of what you need
- ✅ Additional phase(s) are critical for project
- ✅ Will use extended workflow repeatedly
- ✅ Team needs consistent extended process

### Don't Use When:

- ❌ Only need extension once (use inline instead)
- ❌ Extension is optional/nice-to-have
- ❌ Upstream command will soon include this
- ❌ Can achieve same with command chaining

## Other Extension Examples

### Example 1: Feature with Deployment

Add deployment preparation phase:

```markdown
## Phase 8: Deployment Preparation

**Goal**: Prepare feature for production deployment

**Actions**:

1. Launch devops-sre-architect
2. Create deployment plan
3. Set up feature flags
4. Prepare rollback plan
5. Create monitoring and alerts
```

### Example 2: Feature with Security Review

Add dedicated security phase:

```markdown
## Phase 8: Security Review

**Goal**: Comprehensive security assessment

**Actions**:

1. Launch security-engineer
2. Threat model the feature
3. Security testing
4. Compliance check
5. Create security sign-off
```

### Example 3: Design with User Research

Add user research before design:

```markdown
## Phase 1: User Research (NEW)

**Goal**: Understand user needs

**Agents**: ux-researcher

**Actions**:

1. User interviews
2. Competitive analysis
3. Define user personas
4. Identify pain points

## Phase 2: Research Analysis (NEW)

**Goal**: Synthesize research findings

## Phase 3: UX Design

[Standard design phase, informed by research]
```

## Combining with Other Patterns

### Extended + Subset

Add phase but run fewer agents:

```markdown
# Quick Feature with Docs

[Phases 1-6 from standard workflow]
[Phase 7: Minimal documentation - API docs only]
```

### Extended + Sequential

Add phase and change execution order:

```markdown
# Feature with Security-First

## Phase 1: Security Planning (NEW)

[Plan security from start]

## Phase 2: Design (with security)

[Design with security in mind]

## Phase 3: Implementation

[Standard implementation]

## Phase 4: Security Validation (NEW)

[Verify security requirements met]
```

### Extended + Conditional

Add conditional phase:

```markdown
# Feature with Optional Optimization

## Phase 7: Performance Optimization (Conditional)

**Condition**: Only if performance targets not met

If Phase 4 testing reveals performance issues:
→ Run optimization phase
Otherwise:
→ Skip to documentation
```

## Tips

**Planning extensions:**

- Start with standard workflow
- Identify missing phases
- Assess if extension is truly needed
- Consider if can use command chaining instead

**Implementing extensions:**

- Follow same phase structure as standard commands
- Maintain consistent quality and detail
- Document why extension needed
- Keep extension focused (1-2 additional phases typically)

**Maintaining extensions:**

- Review upstream command for improvements
- Merge beneficial changes
- Consider if extension still needed
- Deprecate if upstream adds your extension

## Maintenance Considerations

**Version tracking:**

```yaml
# Track which upstream version you extended from
---
description: Feature development with documentation
version: '1.2.0' # Your version
---
<!-- Extended from henry-feature v1.0.0 -->
```

**Syncing with upstream:**

```bash
# Check for upstream changes
git diff HEAD~5 plugins/henry-orchestrator/commands/henry-feature.md

# Merge improvements while keeping your extension
```

**Documentation:**
Document extension rationale:

```markdown
<!-- Extended henry-feature with Phase 7: Documentation
   Rationale: Documentation critical for our API features
   Team requires: API docs, user guides, ADRs
   Estimated time: +30 minutes for documentation phase
-->
```

## Related Examples

- **Subset Agents**: `examples/subset-agents.md`
- **Mobile Workflow**: `examples/mobile-workflow.md`
- **Sequential Workflow**: `examples/sequential-workflow.md`
- **All Patterns**: `references/customization-patterns.md`
