# Example: Subset Agent Selection

## Overview

This example demonstrates running only specific agents from a command, rather than the full set. This is useful for time-sensitive reviews or focused audits.

## Scenario

**Standard henry-audit runs 5 agents:**

- security-engineer
- performance-engineer
- a11y-specialist
- seo-specialist
- devops-sre-architect

**Need: Quick security and performance audit only (skip accessibility, SEO, and ops)**

## Approach 1: Inline Customization

Simply specify which agents to run when invoking the command:

```bash
/henry-orchestrator:henry-audit Security and performance only, skip accessibility, SEO, and ops
```

Claude will interpret this instruction and run only:

- security-engineer
- performance-engineer

**Pros:**

- No file modifications needed
- Quick and flexible
- Different every time if needed

**Cons:**

- Not reusable
- Must remember which agents to include/exclude
- No permanent record

## Approach 2: Fork Command

Create a custom command that always runs only security and performance audits.

### File: `.claude/commands/sec-perf-audit.md`

```markdown
---
description: Security and performance audit only
version: '1.0.0'
---

# Security Performance Audit

Focused audit for security vulnerabilities and performance bottlenecks, skipping accessibility, SEO, and operational concerns.

## Phase 1: Security Audit

**Goal**: Identify security vulnerabilities

**Actions**:

1. Launch security-engineer to scan for vulnerabilities
2. Check for OWASP Top 10 issues
3. Review authentication and authorization logic
4. Validate input sanitization and output encoding
5. Check for exposed secrets or sensitive data
6. Review dependency vulnerabilities

**Agents**: security-engineer

**Deliverables**: Security vulnerability report with severity ratings (Critical, High, Medium, Low)

## Phase 2: Performance Audit

**Goal**: Baseline performance and identify bottlenecks

**Actions**:

1. Launch performance-engineer to measure Core Web Vitals
2. Measure key metrics: LCP, FID, CLS, TTFB
3. Identify performance bottlenecks
4. Analyze bundle sizes and load times
5. Check for inefficient queries or algorithms
6. Generate optimization recommendations prioritized by impact

**Agents**: performance-engineer

**Deliverables**: Performance report with current metrics, bottlenecks identified, and optimization roadmap

## Summary

Focused audit complete. Present findings:

**Security Summary:**

- [x] Critical vulnerabilities found
- [x] High-priority vulnerabilities found
- [x] Medium/Low vulnerabilities found
- Remediation recommendations prioritized by risk

**Performance Summary:**

- Current Core Web Vitals: LCP [X]s, FID [X]ms, CLS [X]
- Key bottlenecks: [list top 3-5]
- Optimization recommendations prioritized by impact

**Next Steps:**

- Address critical security vulnerabilities immediately
- Implement high-impact performance optimizations
- Re-run audit to verify improvements

---

## Usage Examples

**Quick security and performance check before release:**
```

/sec-perf-audit

```

**Focused review for API service:**
```

/sec-perf-audit "Focus on API endpoints and response times"

```

**After security or performance changes:**
```

/sec-perf-audit "Verify security fixes and performance improvements"

```

```

### Usage

```bash
# Run security and performance audit
/sec-perf-audit

# Or with specific focus
/sec-perf-audit "Focus on authentication flow"
```

**Pros:**

- Reusable across project
- Clear, documented workflow
- Team can use consistently
- Can be committed to git

**Cons:**

- Requires creating and maintaining file
- Another command to manage
- May diverge from upstream henry-audit

## When to Use Each Approach

### Use Inline Customization When:

- ✅ One-off audit
- ✅ Experimenting with different agent combinations
- ✅ Quick turnaround needed
- ✅ Don't want to create another file

### Use Fork Approach When:

- ✅ Will use this combination repeatedly
- ✅ Team needs consistent workflow
- ✅ Want to document the specific audit focus
- ✅ Want to track changes in git

## Other Subset Examples

### Example 1: Frontend-Only Review

```bash
# Inline
/henry-orchestrator:henry-review Frontend only, skip backend

# Fork: .claude/commands/frontend-review.md
```

### Example 2: Accessibility-Only Audit

```bash
# Inline
/henry-orchestrator:henry-audit Accessibility only, WCAG 2.1 AA compliance

# Fork: .claude/commands/a11y-audit.md
```

### Example 3: Security-Only Review

```bash
# Inline
/henry-orchestrator:henry-review Security review only, focus on authentication

# Fork: .claude/commands/security-review.md
```

## Combining with Other Patterns

Can combine subset agent selection with other customization patterns:

### Subset + Sequential

```markdown
# Security Then Performance Audit

## Phase 1: Security Audit

[security-engineer only]

## Phase 2: Fix Critical Issues

[address findings before proceeding]

## Phase 3: Performance Audit

[performance-engineer only, on secure baseline]
```

### Subset + Extended

```markdown
# Security Performance Audit with Compliance

## Phase 1: Security Audit

[security-engineer]

## Phase 2: Performance Audit

[performance-engineer]

## Phase 3: Compliance Check (NEW)

[verify GDPR, SOC2 compliance]
```

### Subset + Conditional

```markdown
# Smart Audit

## Phase 1: Quick Security Scan

[security-engineer only]

## Phase 2: Deep Security Analysis (Conditional)

Only if Phase 1 found critical issues

## Phase 3: Performance Audit

[performance-engineer only]
```

## Tips

**Choosing agents:**

- Review available agents: `/agents`
- Understand agent expertise and focus areas
- Select minimum agents needed for goal
- Consider agent dependencies (e.g., security before performance)

**Communicating intent:**

- Be explicit about which agents to run
- Explain why skipping others (time, cost, focus)
- Document decision for team

**Iterating:**

- Start with single agent if very focused
- Add agents as needed
- Can always run full audit later if issues found

## Related Patterns

- **Extended Workflow**: `examples/extended-workflow.md`
- **Modified Agent Selection**: `examples/mobile-workflow.md`
- **Sequential Execution**: `examples/sequential-workflow.md`
- **Comprehensive Patterns**: `references/customization-patterns.md`
