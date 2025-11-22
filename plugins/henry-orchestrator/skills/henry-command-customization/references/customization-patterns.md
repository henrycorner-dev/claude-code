# Customization Patterns Reference

## Overview

This document provides comprehensive patterns for customizing Henry Orchestrator commands. Each pattern includes rationale, implementation approaches, and complete examples.

## Pattern Categories

- **Scope Patterns**: Control which agents or phases run
- **Workflow Patterns**: Change execution order or dependencies
- **Integration Patterns**: Combine with external tools or processes
- **Specialization Patterns**: Adapt for specific technologies or platforms

## Scope Patterns

### Pattern: Subset Agent Selection

**Problem**: Standard command runs too many agents; only need specific subset

**Use Cases**:
- Time-sensitive reviews needing quick feedback
- Focused audits on specific concerns
- Cost optimization by running fewer agents
- Specialized expertise needed (security-only, performance-only)

**Implementation**:

**Inline approach:**
```
/henry-orchestrator:henry-audit Security and performance only, skip accessibility and SEO
```

**Fork approach - `.claude/commands/sec-perf-audit.md`:**
```markdown
---
description: Security and performance audit only
---

# Security Performance Audit

Focused audit for security vulnerabilities and performance bottlenecks.

## Phase 1: Security Audit

**Goal**: Identify security vulnerabilities

**Actions**:
1. Launch security-engineer to scan for vulnerabilities
2. Check for OWASP Top 10 issues
3. Review authentication and authorization
4. Validate input sanitization and output encoding

**Agents**: security-engineer

**Deliverables**: Security vulnerability report with severity ratings

## Phase 2: Performance Audit

**Goal**: Baseline performance and identify bottlenecks

**Actions**:
1. Launch performance-engineer to measure metrics
2. Identify performance bottlenecks
3. Generate optimization recommendations
4. Prioritize by impact

**Agents**: performance-engineer

**Deliverables**: Performance report with optimization roadmap

## Summary

Focused audit complete:
- Security vulnerabilities identified and prioritized
- Performance bottlenecks mapped with recommendations
```

**Tradeoffs**:
- ✅ Faster execution, lower cost, focused results
- ❌ May miss issues outside selected scope

---

### Pattern: Extended Workflow

**Problem**: Standard command missing phases needed for workflow

**Use Cases**:
- Adding documentation generation after implementation
- Including deployment preparation in feature development
- Adding user research before design phase
- Incorporating compliance checks

**Implementation**:

**Example: Adding documentation to henry-feature**

`.claude/commands/feature-with-docs.md`:
```markdown
---
description: Feature development with comprehensive documentation
---

# Feature Development with Documentation

## Phase 1-7: Standard Feature Development
[Include all phases from henry-feature]

## Phase 8: Documentation Generation

**Goal**: Create comprehensive feature documentation

**Actions**:
1. Generate API documentation from code
2. Create user-facing usage guides
3. Document architecture decisions (ADRs)
4. Update README and CHANGELOG
5. Create troubleshooting guide

**Agents**: backend-engineer, frontend-engineer

**Deliverables**:
- API documentation (auto-generated)
- User guides with examples
- Architecture decision records
- Updated project documentation

## Summary

Complete feature with implementation and documentation:
- Fully implemented and tested feature
- API documentation for developers
- User guides for end users
- Architecture decisions documented
```

**Tradeoffs**:
- ✅ More complete deliverables, better handoff
- ❌ Longer execution time

---

### Pattern: Phase Splitting

**Problem**: Phase too complex or doing too many things

**Use Cases**:
- Phase with 10+ actions becoming unwieldy
- Phase mixing concerns (design + implementation)
- Need checkpoint between related activities
- Different agents needed for sub-phases

**Implementation**:

**Before - Monolithic phase:**
```markdown
## Phase 2: Implementation

**Actions**:
1. Design database schema
2. Implement data models
3. Create API endpoints
4. Build frontend components
5. Connect frontend to API
6. Write unit tests
7. Write integration tests
8. Manual testing
```

**After - Split into focused phases:**
```markdown
## Phase 2: Backend Implementation

**Actions**:
1. Design database schema
2. Implement data models
3. Create API endpoints
4. Write backend unit tests

**Agents**: backend-engineer

**Deliverables**: Backend API with tests

## Phase 3: Frontend Implementation

**Actions**:
1. Build frontend components
2. Connect frontend to API
3. Write component tests

**Agents**: frontend-engineer

**Deliverables**: Frontend implementation with tests

## Phase 4: Integration Testing

**Actions**:
1. Write integration tests
2. Test end-to-end workflows
3. Manual exploratory testing

**Agents**: qa-tester

**Deliverables**: Integration test suite, test report
```

**Benefits**:
- Clear separation of concerns
- Better progress tracking
- Easier to parallelize or reorder

---

## Workflow Patterns

### Pattern: Parallel to Sequential

**Problem**: Standard command runs agents in parallel; need sequential with feedback loops

**Use Cases**:
- Each phase depends on previous completion
- Need to address issues before proceeding
- Iterative refinement workflows
- Educational contexts (show step-by-step)

**Implementation**:

**Original henry-audit (parallel):**
```markdown
## Phase 1: Comprehensive Audit

Launch all agents in parallel:
- security-engineer
- performance-engineer
- a11y-specialist
- seo-specialist
- devops-sre-architect
```

**Sequential version - `.claude/commands/sequential-audit.md`:**
```markdown
# Sequential Audit with Remediation

## Phase 1: Security Audit

**Goal**: Identify and fix critical security issues first

**Agents**: security-engineer

## Phase 2: Address Critical Security Issues

**Goal**: Fix blocking security vulnerabilities

**Actions**:
1. Review security findings
2. Fix critical (CVSS >= 9.0) issues
3. Re-scan to verify fixes

## Phase 3: Performance Audit

**Goal**: Baseline performance on secure code

**Agents**: performance-engineer

**Note**: Performance measured on security-hardened baseline

## Phase 4: Address Performance Issues

**Goal**: Optimize without compromising security

**Actions**:
1. Implement optimizations
2. Re-run security scan to ensure no regressions
3. Verify performance improvements

## Phase 5: Accessibility Audit

**Goal**: Ensure accessible experience

**Agents**: a11y-specialist

## Summary

Sequential audit with fixes:
- Security issues addressed before proceeding
- Performance optimized on secure baseline
- Accessibility validated on final implementation
```

**Tradeoffs**:
- ✅ Issues addressed immediately, no rework
- ❌ Longer total execution time

---

### Pattern: Conditional Phases

**Problem**: Need to skip phases based on conditions

**Use Cases**:
- Skip phases if no issues found
- Optional phases based on user choice
- Different paths for different project types
- Feature flags or environment differences

**Implementation**:

**Example: Conditional optimization**

`.claude/commands/audit-optimize.md`:
```markdown
# Audit with Conditional Optimization

## Phase 1: Health Check Audit

**Goal**: Assess overall application health

**Agents**: All audit agents (security, performance, a11y, SEO, ops)

**Deliverables**: Comprehensive health report

## Phase 2: Severity Assessment

**Goal**: Determine if optimization needed

**Actions**:
1. Review audit findings
2. Categorize by severity (critical, major, minor)
3. Decision point:
   - If critical issues found → Proceed to Phase 3
   - If only minor issues → Skip to Phase 5

## Phase 3: Critical Issue Optimization (Conditional)

**Goal**: Address critical issues immediately

**Condition**: Only if critical issues found in Phase 1

**Agents**: Relevant engineers based on issue type

**Deliverables**: Fixes for critical issues

## Phase 4: Verification Audit (Conditional)

**Goal**: Verify critical issues resolved

**Condition**: Only if Phase 3 executed

**Actions**:
1. Re-run affected audits
2. Verify critical issues resolved
3. Ensure no regressions

## Phase 5: Prioritized Backlog

**Goal**: Create prioritized improvement backlog

**Actions**:
1. Document remaining issues
2. Prioritize by impact and effort
3. Create tickets for future work

## Summary

Audit complete with conditional optimization:
- Critical issues addressed immediately (if any)
- Prioritized backlog for remaining improvements
```

**Benefits**:
- Efficient execution path
- User control over workflow
- Handles variability gracefully

---

### Pattern: Iterative Refinement

**Problem**: Need multiple rounds of work with feedback

**Use Cases**:
- Design iterations with user feedback
- Performance optimization cycles
- Bug fixing with verification
- A/B testing and refinement

**Implementation**:

**Example: Iterative performance optimization**

`.claude/commands/perf-optimization-cycles.md`:
```markdown
# Iterative Performance Optimization

## Phase 1: Baseline Measurement

**Goal**: Establish current performance metrics

**Agents**: performance-engineer

**Deliverables**: Baseline metrics (LCP, FID, CLS, TTFB)

## Phase 2: Identify Top 3 Bottlenecks

**Goal**: Focus on highest-impact optimizations

**Actions**:
1. Analyze baseline data
2. Identify top 3 bottlenecks by impact
3. Estimate improvement potential

## Phase 3: Optimization Cycle 1

**Goal**: Address #1 bottleneck

**Actions**:
1. Implement optimization
2. Measure impact
3. If target met → Proceed
4. If target not met → Iterate

## Phase 4: Optimization Cycle 2

**Goal**: Address #2 bottleneck

[Repeat Cycle 1 pattern]

## Phase 5: Optimization Cycle 3

**Goal**: Address #3 bottleneck

[Repeat Cycle 1 pattern]

## Phase 6: Final Validation

**Goal**: Verify overall performance targets met

**Actions**:
1. Measure final metrics
2. Compare to baseline
3. Compare to targets
4. Document improvements

## Summary

Iterative optimization results:
- Baseline: [metrics]
- After optimization: [metrics]
- Improvement: [percentage]
- Bottlenecks addressed: [list]
```

---

## Integration Patterns

### Pattern: External Tool Integration

**Problem**: Need to integrate with external tools or services

**Use Cases**:
- Running specialized analysis tools
- Integrating with CI/CD pipelines
- Triggering deployments
- Updating external systems

**Implementation**:

**Example: Integration with external security scanner**

`.claude/commands/security-with-scanner.md`:
```markdown
# Security Review with External Scanner

## Phase 1: Static Analysis

**Goal**: Run internal code review

**Agents**: security-engineer

**Deliverables**: Code review findings

## Phase 2: External Security Scan

**Goal**: Run specialized security tools

**Actions**:
1. Run SAST tool (e.g., Snyk, Checkmarx)
   ```bash
   snyk test --severity-threshold=high
   ```
2. Run dependency vulnerability scan
   ```bash
   npm audit --audit-level=high
   ```
3. Run secrets detection
   ```bash
   gitleaks detect
   ```

**Deliverables**: Tool reports

## Phase 3: Findings Synthesis

**Goal**: Combine internal and external findings

**Actions**:
1. Launch security-engineer to review tool outputs
2. Deduplicate findings
3. Prioritize by risk
4. Create remediation plan

**Deliverables**: Unified security report with prioritized remediation plan

## Summary

Comprehensive security review:
- Internal code review findings
- External tool scan results
- Unified, prioritized remediation plan
```

---

### Pattern: Multi-Repository Workflow

**Problem**: Need to coordinate work across multiple repositories

**Use Cases**:
- Microservices architecture changes
- Shared library updates with consumers
- Coordinated frontend/backend changes
- Monorepo with multiple projects

**Implementation**:

**Example: Coordinated microservices change**

`.claude/commands/microservices-feature.md`:
```markdown
# Multi-Service Feature Implementation

## Phase 1: Impact Analysis

**Goal**: Identify which services need changes

**Actions**:
1. Analyze feature requirements
2. Map to service boundaries
3. Identify service dependencies
4. Define API contracts between services

**Agents**: backend-engineer, devops-sre-architect

**Deliverables**: Service impact map, API contracts

## Phase 2: Service A Implementation

**Goal**: Implement changes in first service

**Actions**:
1. Switch to service A repository
   ```bash
   cd ../service-a
   ```
2. Implement feature in Service A
3. Write tests
4. Create PR

**Agents**: backend-engineer

## Phase 3: Service B Implementation

**Goal**: Implement changes in second service

[Similar to Phase 2, for Service B]

## Phase 4: Integration Testing

**Goal**: Test services together

**Actions**:
1. Deploy both services to integration environment
2. Run end-to-end tests
3. Verify API contracts
4. Test failure scenarios

**Agents**: qa-tester, devops-sre-architect

## Phase 5: Coordinated Deployment

**Goal**: Deploy changes to production

**Actions**:
1. Deploy in correct order (dependencies first)
2. Verify each deployment
3. Monitor for issues

## Summary

Multi-service feature deployed:
- Service A changes: [PR link]
- Service B changes: [PR link]
- Integration tests passing
- Production deployment successful
```

---

## Specialization Patterns

### Pattern: Technology-Specific Workflow

**Problem**: Need workflow optimized for specific technology stack

**Use Cases**:
- React Native vs web React
- Python vs Node.js backend
- SQL vs NoSQL data modeling
- Mobile vs web vs desktop

**Implementation**:

**Example: React Native specific workflow**

`.claude/commands/react-native-feature.md`:
```markdown
# React Native Feature Development

## Phase 1: Cross-Platform Design

**Goal**: Design for iOS and Android simultaneously

**Actions**:
1. Launch ux-ui-designer for mobile design
2. Follow iOS Human Interface Guidelines
3. Follow Material Design principles
4. Design platform-specific variations where needed

**Agents**: ux-ui-designer, mobile-app-engineer

## Phase 2: React Native Implementation

**Goal**: Implement using React Native

**Actions**:
1. Launch mobile-app-engineer for implementation
2. Use React Native components
3. Handle platform differences with Platform.select
4. Implement native modules if needed
5. Optimize bundle size

**Agents**: mobile-app-engineer

## Phase 3: Platform-Specific Testing

**Goal**: Test on both platforms

**Actions**:
1. Test on iOS simulators (iPhone, iPad)
2. Test on Android emulators (various screen sizes)
3. Test on physical devices
4. Test platform-specific features

**Agents**: qa-tester

## Phase 4: Performance Optimization

**Goal**: Meet mobile performance targets

**Actions**:
1. Optimize cold start time (< 2s)
2. Reduce JavaScript bundle size
3. Optimize memory usage
4. Minimize ANR rate

**Agents**: performance-engineer, mobile-app-engineer

## Summary

React Native feature ready:
- Cross-platform implementation
- Tested on iOS and Android
- Performance targets met
- Platform-specific variations handled
```

---

### Pattern: Domain-Specific Workflow

**Problem**: Need workflow tailored to specific domain

**Use Cases**:
- Healthcare (HIPAA compliance)
- Finance (PCI DSS, SOX)
- E-commerce (payment processing)
- Education (FERPA, accessibility)

**Implementation**:

**Example: Healthcare feature with HIPAA**

`.claude/commands/healthcare-feature.md`:
```markdown
# HIPAA-Compliant Feature Development

## Phase 1: Privacy Impact Assessment

**Goal**: Assess HIPAA compliance requirements

**Actions**:
1. Identify PHI (Protected Health Information) involved
2. Determine safeguards needed
3. Plan encryption strategy (at-rest, in-transit)
4. Define access controls

**Agents**: security-engineer, backend-engineer

**Deliverables**: Privacy impact assessment, compliance checklist

## Phase 2: Secure Implementation

**Goal**: Implement with HIPAA safeguards

**Actions**:
1. Launch backend-engineer for implementation
2. Implement encryption for PHI
3. Add audit logging for all PHI access
4. Implement role-based access control
5. Add minimum necessary access controls

**Agents**: backend-engineer, security-engineer

## Phase 3: HIPAA Compliance Review

**Goal**: Verify HIPAA compliance

**Actions**:
1. Verify encryption implementation
2. Review access controls
3. Validate audit logging
4. Check data retention policies
5. Review Business Associate Agreements

**Agents**: security-engineer

## Phase 4: Security Testing

**Goal**: Validate security controls

**Actions**:
1. Penetration testing
2. Encryption validation
3. Access control testing
4. Audit log verification

**Agents**: security-engineer, qa-tester

## Summary

HIPAA-compliant feature:
- PHI encrypted at rest and in transit
- Audit logging for all PHI access
- Access controls verified
- Security testing passed
- Compliance checklist complete
```

---

## Advanced Patterns

### Pattern: Command Composition

**Problem**: Need to orchestrate multiple commands as macro workflow

**Use Cases**:
- Product launch (multiple commands in sequence)
- Major refactoring (design → implement → test → optimize)
- Release preparation workflow

**Implementation**:

**Example: Full product launch**

`.claude/commands/product-launch.md`:
```markdown
# Complete Product Launch Workflow

## Pre-Development Phase

### Step 1: Product Strategy
```
/henry-orchestrator:henry-product [product-name]
```
**Deliverable**: Product strategy document

### Step 2: Design
```
/henry-orchestrator:henry-design [feature-name]
```
**Deliverable**: UX/UI designs

## Development Phase

### Step 3: Feature Development
```
/henry-orchestrator:henry-feature [feature-name]
```
**Deliverable**: Implemented feature

### Step 4: Code Review
```
/henry-orchestrator:henry-review [pr-number]
```
**Deliverable**: Reviewed and merged code

## Pre-Launch Phase

### Step 5: Comprehensive Audit
```
/henry-orchestrator:henry-audit
```
**Deliverable**: Health check report

### Step 6: Optimization
```
/henry-orchestrator:henry-optimize
```
**Deliverable**: Optimized application

### Step 7: Launch Preparation
```
/henry-orchestrator:henry-launch
```
**Deliverable**: Production deployment

## Post-Launch Phase

### Step 8: Monitor and Iterate
```
/henry-orchestrator:henry-team data-analytics-engineer
```
**Deliverable**: Launch metrics and insights

## Summary

Complete product launch from strategy to production monitoring.
Each phase builds on previous deliverables.
```

---

### Pattern: Parameterized Workflow

**Problem**: Need configurable workflow based on arguments

**Use Cases**:
- Different workflows for different project types
- Configurable agent selection
- Variable scope based on inputs

**Implementation**:

**Example: Flexible audit command**

`.claude/commands/flex-audit.md`:
```markdown
---
description: Customizable audit - specify agents and focus areas
argument-hint: [agent-list] [focus-areas]
---

# Flexible Audit: $2

Custom audit with specified agents focusing on: $2

## Phase 1: Custom Audit Execution

**Goal**: Run audit with specified configuration

**Agents**: $1
(Expected format: "security-engineer performance-engineer")

**Focus Areas**: $2
(e.g., "API security and response times")

**Actions**:
1. Launch specified agents: $1
2. Focus analysis on: $2
3. Generate targeted report

**Deliverables**: Custom audit report for specified scope

## Summary

Flexible audit complete:
- Agents used: $1
- Focus areas: $2
- Findings and recommendations

---

## Usage Examples

**Security and performance:**
```
/flex-audit "security-engineer performance-engineer" "API security and response times"
```

**Accessibility only:**
```
/flex-audit "a11y-specialist" "WCAG 2.1 AA compliance"
```

**Full stack review:**
```
/flex-audit "backend-engineer frontend-engineer devops-sre-architect" "Architecture and deployment"
```
```

**Benefits**:
- Single command, many configurations
- User has full control
- Reduces command proliferation

**Tradeoffs**:
- More complex to use
- Requires understanding arguments
- Less guided than dedicated commands

---

## Pattern Selection Guide

Choose customization pattern based on:

| Pattern | Use When | Complexity | Reusability |
|---------|----------|------------|-------------|
| Subset Agent Selection | Need fewer agents | Low | Medium |
| Extended Workflow | Need additional phases | Medium | High |
| Phase Splitting | Phase too complex | Medium | High |
| Parallel → Sequential | Need feedback loops | Medium | Medium |
| Conditional Phases | Variable workflow | High | Medium |
| Iterative Refinement | Multiple rounds needed | High | High |
| External Tool Integration | Need specific tools | Medium | Medium |
| Multi-Repository | Cross-repo changes | High | Low |
| Technology-Specific | Platform-specialized | Medium | High |
| Domain-Specific | Compliance needs | High | High |
| Command Composition | Macro workflow | Low | Medium |
| Parameterized | Configurable workflow | High | High |

## Related Documentation

- **Command Format:** `references/command-format.md`
- **Forking Guide:** `references/forking-guide.md`
- **Creating Commands:** `references/creating-commands.md`
- **Examples:** `examples/` directory
