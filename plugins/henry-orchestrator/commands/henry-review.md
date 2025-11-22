---
description: Multi-agent code review covering QA, security, performance
argument-hint: Files/PR/description to review
allowed-tools: ['Glob', 'Read', 'Grep', 'Bash', 'Task', 'TodoWrite']
---

# Henry Code Review

You are orchestrating a comprehensive code review using the Henry Orchestrator's quality specialist agents. Follow a systematic approach across multiple review dimensions.

## Initial Context

**Review Request:** $ARGUMENTS

## Core Principles

- **Multi-perspective**: Review from QA, security, performance, and engineering angles
- **Severity-based**: Prioritize critical issues first
- **Actionable**: Provide specific fixes, not just problems
- **Context-aware**: Consider project stage and constraints
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Scope Definition

**Goal**: Understand what to review and how

**Actions**:

1. Create todo list with all phases
2. Determine review scope:
   - **Specific files**: If files mentioned in $ARGUMENTS
   - **Git changes**: Check `git diff` or `git diff --staged`
   - **PR context**: Use `gh pr view` if PR number provided
   - **Full codebase**: If "audit" or "full review" requested
3. Identify file types and applicable reviews:
   - Frontend code → frontend-engineer
   - Backend code → backend-engineer
   - Mobile code → mobile-app-engineer
   - LLM/Agent code → llm-agent-architect
   - Tests → qa-tester
   - Infrastructure → devops-sre-architect
4. Ask user to confirm scope:
   - Files/directories to review
   - Review depth (quick/standard/deep)
   - Specific concerns (security, performance, bugs)
   - Parallel or sequential reviews

**Wait for user confirmation before proceeding.**

---

## Phase 2: QA Review

**Goal**: Review test coverage, quality, and potential bugs

**Actions**:

1. Launch `qa-tester` agent to:
   - **Test Coverage Analysis**:
     - Identify untested code paths
     - Check test pyramid balance (70% unit, 20% integration, 10% E2E)
     - Review critical flows coverage
   - **Bug Detection**:
     - Shallow scan for obvious bugs
     - Edge case handling review
     - Error handling completeness
     - Null/undefined checks
   - **Test Quality**:
     - Test readability and maintainability
     - Flaky test indicators
     - Test data quality (avoid PII)
     - Assertion quality
   - **Integration**:
     - CI/CD integration check
     - Quality gates present
2. Agent returns findings with:
   - **Critical Issues**: Blocking bugs or missing critical tests
   - **Important Issues**: Significant gaps in coverage
   - **Suggestions**: Test improvements and best practices
   - Specific file:line references
3. Present QA findings summary

---

## Phase 3: Security Review

**Goal**: Identify security vulnerabilities and compliance issues

**Actions**:

1. Launch `security-engineer` agent to:
   - **OWASP Top 10 Audit**:
     - Injection vulnerabilities (SQL, XSS, command)
     - Authentication/authorization flaws
     - Sensitive data exposure
     - XML external entities
     - Broken access control
     - Security misconfiguration
     - Cross-site scripting (XSS)
     - Insecure deserialization
     - Using components with known vulnerabilities
     - Insufficient logging/monitoring
   - **Code Security**:
     - Hardcoded secrets detection
     - Crypto implementation review
     - Input validation
     - Output encoding
     - CSRF protection
   - **Dependencies**:
     - Vulnerable dependency scan
     - License compliance
   - **Privacy**:
     - GDPR/CCPA compliance check
     - PII handling review
     - Consent mechanisms
   - **Threat Modeling**: For new features
2. Agent returns findings with:
   - **Critical**: Exploitable vulnerabilities
   - **High**: Serious security gaps
   - **Medium**: Security improvements
   - **Low**: Best practice violations
   - CVE references where applicable
   - Remediation code examples
3. Present security findings summary

---

## Phase 4: Performance Review

**Goal**: Identify performance bottlenecks and optimization opportunities

**Actions**:

1. Launch `performance-engineer` agent to:
   - **Frontend Performance** (if applicable):
     - Bundle size analysis
     - Core Web Vitals impact (LCP, INP, CLS)
     - Lazy loading opportunities
     - Image optimization
     - Code splitting
     - Render-blocking resources
     - JavaScript execution time
   - **Backend Performance** (if applicable):
     - Database query efficiency (N+1 queries)
     - API response times
     - Caching opportunities
     - Connection pooling
     - Async/parallel processing
   - **General**:
     - Algorithm complexity (O(n²) → O(n log n))
     - Memory leaks
     - Unnecessary re-renders/computations
     - Resource cleanup
   - **Performance Budgets**:
     - Check against defined budgets
     - Regression detection
2. Agent returns findings with:
   - **Critical**: Performance regressions or severe bottlenecks
   - **Important**: Optimization opportunities with high impact
   - **Suggestions**: Nice-to-have improvements
   - Before/after metrics estimates
   - Implementation examples
3. Present performance findings summary

---

## Phase 5: Engineering Review

**Goal**: Review code quality, architecture, and best practices

**Actions**:

1. Launch relevant engineer agent(s) based on code type:
   - `frontend-engineer`: For React/Vue/Svelte/Angular code
   - `backend-engineer`: For API/database/server code
   - `mobile-app-engineer`: For iOS/Android/React Native/Flutter
   - `llm-agent-architect`: For LLM/agent implementations
2. Each agent reviews for:
   - **Code Quality**:
     - Readability and maintainability
     - DRY violations
     - Code smells
     - Naming conventions
     - Comments quality
   - **Architecture**:
     - Design patterns appropriateness
     - Separation of concerns
     - Dependency management
     - Modularity
   - **Best Practices**:
     - Framework/language idioms
     - Error handling patterns
     - Logging appropriateness
     - State management
   - **Project Standards**:
     - Coding style consistency
     - Project conventions
     - File organization
3. Agent returns findings prioritized by impact
4. Present engineering findings summary

---

## Phase 6: Synthesis & Prioritization

**Goal**: Consolidate findings and prioritize fixes

**Actions**:

1. Aggregate all findings from agents:
   - QA issues
   - Security vulnerabilities
   - Performance problems
   - Code quality issues
2. Deduplicate overlapping findings
3. Categorize by severity:
   - **🚨 Critical** (must fix before merge/deploy):
     - Exploitable security vulnerabilities
     - Data loss/corruption bugs
     - Severe performance regressions
     - Breaking changes without migration
   - **⚠️ High** (should fix soon):
     - Security hardening needs
     - Significant performance issues
     - Important missing tests
     - Major code quality issues
   - **📋 Medium** (fix when feasible):
     - Test coverage gaps
     - Moderate performance improvements
     - Code maintainability issues
     - Minor security improvements
   - **💡 Low** (nice to have):
     - Style inconsistencies
     - Documentation improvements
     - Refactoring opportunities
4. Create consolidated report:

   ```markdown
   # Code Review Summary

   ## 🚨 Critical Issues (X found)

   1. [security] SQL injection vulnerability in user query [file.ts:42]
      - **Fix**: Use parameterized queries

   ## ⚠️ High Priority (X found)

   1. [performance] N+1 query in user list endpoint [api.ts:105]
      - **Fix**: Add eager loading

   ## 📋 Medium Priority (X found)

   1. [qa] Missing tests for error handling [handler.ts:88]
      - **Fix**: Add unit tests for failure cases

   ## 💡 Suggestions (X found)

   1. [code-quality] Extract duplicate logic into utility [utils.ts:22, 67]
      - **Improvement**: Create shared function

   ## ✅ Strengths

   - Well-structured error handling
   - Good test coverage overall
   - Clear component separation
   ```

5. Present consolidated report to user

---

## Phase 7: Recommendations & Action Plan

**Goal**: Provide clear next steps

**Actions**:

1. Ask user what they want to do:
   - **Fix critical now**: Address blocking issues immediately
   - **Create issues**: Log findings for later
   - **Get detailed guidance**: Deep dive on specific issues
   - **Approve as-is**: Accept current state with known issues
2. If user wants fixes:
   - Prioritize critical → high → medium
   - Provide implementation guidance
   - Offer to implement (switch to code mode)
3. If creating issues:
   - Structure as GitHub/JIRA issues
   - Include reproduction steps
   - Add severity labels
   - Link to code locations
4. Track action items in todo list

---

## Phase 8: Summary

**Goal**: Document review outcomes

**Actions**:

1. Mark all todos complete
2. Generate final summary:
   - **Review Scope**: What was reviewed
   - **Findings**: Total issues by severity
   - **Critical Actions**: What must be fixed
   - **Recommendations**: Improvement priorities
   - **Positive Notes**: What's well-done
   - **Next Steps**: Immediate actions
3. Provide links to detailed findings from each agent

---

## Usage Examples

**Review git changes:**

```
/henry-orchestrator:henry-review Review my staged changes
```

**Review specific files:**

```
/henry-orchestrator:henry-review Review src/auth/login.ts and src/api/users.ts
```

**Quick security scan:**

```
/henry-orchestrator:henry-review Security review only, focus on auth code
```

**PR review:**

```
/henry-orchestrator:henry-review Review PR #123
```

**Full audit:**

```
/henry-orchestrator:henry-review Full codebase audit, deep review
```

## Usage Tips

- **Specify focus**: "security only" or "performance only" to skip other reviews
- **Parallel for speed**: Default is parallel execution
- **Provide context**: Mention if this is pre-merge, pre-deploy, or audit
- **Stage changes**: `git add` files you want reviewed
- **Combine with fix**: Ask to fix critical issues after review

## Review Depth Levels

- **Quick** (5-10 min): Surface-level scan, obvious issues only
- **Standard** (15-30 min): Thorough review, most issues found
- **Deep** (30+ min): Comprehensive audit, architectural analysis

## Agent Notes

- All agents focus on **changed code** unless "full audit" requested
- Agents avoid **false positives** (pre-existing issues, linter catches)
- Agents provide **specific fixes** with code examples
- Agents use **severity ratings** consistently

---

Use TodoWrite to track progress through all review phases.
