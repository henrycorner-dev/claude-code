# Command Forking Guide

## Overview

Command forking creates reusable variations of Henry commands by copying and modifying existing command files. This guide covers when to fork, how to fork effectively, and best practices for maintaining forked commands.

## When to Fork

### Good Reasons to Fork

✅ **Repeated project-specific workflow:** Need same customization multiple times
✅ **Team sharing:** Command will be used by multiple team members
✅ **Significant modification:** Changing multiple phases or agent combinations
✅ **Documentation needs:** Custom workflow needs clear documentation
✅ **Version control:** Want to track command changes in git

### When NOT to Fork

❌ **One-time use:** Use inline customization instead
❌ **Minor variation:** Use command arguments or henry-team
❌ **Already exists:** Check if similar command already available
❌ **Over-engineering:** Start simple, fork only when pattern repeats

## Forking Process

### Step 1: Choose Source Command

Identify which Henry command best matches your needs:

- **henry-feature:** Full feature development lifecycle
- **henry-review:** Code review and validation
- **henry-audit:** Comprehensive health check
- **henry-optimize:** Performance and quality optimization
- **henry-design:** UX/UI design workflow
- **henry-product:** Product strategy and planning
- **henry-launch:** Deployment and launch
- **henry-dataflow:** Data pipeline development
- **henry-team:** Custom agent orchestration

List all commands:
```bash
ls plugins/henry-orchestrator/commands/
```

Review command to understand structure:
```bash
cat plugins/henry-orchestrator/commands/henry-feature.md
```

### Step 2: Copy Command File

Copy to project commands directory:

```bash
# Copy to project-specific commands
cp plugins/henry-orchestrator/commands/henry-feature.md \
   .claude/commands/mobile-feature.md

# Or copy to personal commands
cp plugins/henry-orchestrator/commands/henry-feature.md \
   ~/.claude/commands/mobile-feature.md
```

**Location choice:**
- **`.claude/commands/`**: Project-specific, shared via git
- **`~/.claude/commands/`**: Personal, not shared

### Step 3: Rename Command

Update command name in file:

1. Change H1 title:
```markdown
# Mobile Feature Development
```

2. Update frontmatter description:
```yaml
---
description: Mobile app feature development for iOS/Android
argument-hint: [feature-name] [platform]
---
```

3. Update references throughout file:
- Change command name in text
- Update examples to use new name

### Step 4: Customize Phases

Modify phases to match your workflow:

#### Remove Unnecessary Phases

Delete phases not needed for your workflow:

```markdown
## Phase 3: Desktop UI Design
[DELETE THIS ENTIRE SECTION]
```

#### Add New Phases

Insert phases where needed:

```markdown
## Phase 3: Mobile-Specific Testing

**Goal**: Test on multiple devices and OS versions

**Actions**:
1. Launch qa-tester for mobile test strategy
2. Test on iOS devices (iPhone 12-15, iPad)
3. Test on Android devices (various manufacturers)
4. Test offline/online transitions

**Agents**: qa-tester

**Deliverables**: Mobile test results, device compatibility matrix
```

#### Modify Existing Phases

Change agent selection or actions:

**Original:**
```markdown
## Phase 2: UI Design

**Agents**: ui-visual-designer

**Actions**:
1. Create high-fidelity mockups
2. Design component library
```

**Modified for mobile:**
```markdown
## Phase 2: Mobile UI Design

**Agents**: mobile-app-engineer, ux-ui-designer

**Actions**:
1. Apply iOS Human Interface Guidelines / Material Design
2. Design for mobile-specific patterns (navigation, gestures)
3. Create responsive layouts for different screen sizes
4. Design for offline-first requirements
```

### Step 5: Update Summary

Revise summary to reflect customized workflow:

```markdown
## Summary

Complete mobile feature ready for app store release:
- Platform-appropriate UX following iOS/Android guidelines
- Native or cross-platform implementation
- Tested on multiple devices and OS versions
- Performance optimized for mobile (cold start < 2s)
- App store compliance validated

Next steps: Prepare app store listing and submit for review
```

### Step 6: Add Usage Examples

Provide concrete examples for your team:

```markdown
## Usage Examples

**iOS feature:**
```
/mobile-feature offline-notes iOS
```

**Android feature:**
```
/mobile-feature payment-flow Android
```

**Cross-platform:**
```
/mobile-feature user-profile "iOS and Android"
```
```

### Step 7: Test Command

Verify command works correctly:

```bash
# List commands to verify it appears
/help

# Test with sample arguments
/mobile-feature test-feature iOS

# Verify phases execute in correct order
# Verify agents are invoked correctly
# Verify deliverables are produced
```

## Customization Patterns

### Pattern 1: Subset of Phases

Run fewer phases than original command:

**Original:** 7-phase henry-feature
**Forked:** 3-phase rapid-prototype

```markdown
# Rapid Prototype

Quick prototype without full testing and optimization.

## Phase 1: Design
[Keep basic design phase]

## Phase 2: Implementation
[Keep core implementation]

## Phase 3: Manual Testing
[Skip automated testing, do manual only]

## Summary
Working prototype for demo purposes. Not production-ready.
```

### Pattern 2: Extended Workflow

Add phases to original command:

**Original:** 5-phase henry-design
**Forked:** 7-phase design-with-research

```markdown
# Design with User Research

## Phase 1: Competitive Analysis
[NEW PHASE]

## Phase 2: User Research
[NEW PHASE]

## Phase 3: User Research Analysis
[Keep from original]

## Phase 4: UX Design
[Keep from original]

## Phase 5: UI Design
[Keep from original]

## Phase 6: Prototype Testing
[NEW PHASE]

## Phase 7: Design System Documentation
[NEW PHASE]
```

### Pattern 3: Modified Agent Selection

Use different agents than original:

**Original:** henry-review with backend-engineer + frontend-engineer
**Forked:** security-review with security-engineer + backend-engineer

```markdown
# Security-Focused Code Review

## Phase 1: Security Review

**Agents**: security-engineer
**Actions**: Threat modeling, vulnerability scan

## Phase 2: Secure Coding Review

**Agents**: backend-engineer, security-engineer
**Actions**: Review code for security best practices

## Phase 3: Penetration Testing

**Agents**: security-engineer
**Actions**: Simulate attacks on implementation
```

### Pattern 4: Parallel to Sequential

Change execution order:

**Original:** henry-audit runs all agents in parallel
**Forked:** sequential-audit with feedback loops

```markdown
# Sequential Audit with Fixes

## Phase 1: Security Audit
[security-engineer only]

## Phase 2: Address Security Findings
[Fix critical issues]

## Phase 3: Performance Audit
[performance-engineer only - now on secure baseline]

## Phase 4: Address Performance Issues
[Optimize without compromising security]

## Phase 5: Final Validation
[Re-run both audits to verify]
```

### Pattern 5: Platform-Specific

Customize for specific platform or technology:

**Original:** henry-feature (platform-agnostic)
**Forked:** react-native-feature

```markdown
# React Native Feature Development

## Phase 1: Cross-Platform Design
[Design once for iOS and Android]

## Phase 2: React Native Implementation
**Agents**: mobile-app-engineer
**Actions**:
1. Implement using React Native components
2. Handle platform-specific code with Platform.select
3. Optimize bundle size

## Phase 3: Platform-Specific Testing
[Test on both iOS and Android]
```

## Maintenance

### Version Tracking

Add version field to track changes:

```yaml
---
description: Mobile feature development for iOS/Android
version: "1.0.0"
---
```

Update version when making changes:
- **1.0.0 → 1.0.1**: Bug fixes, minor clarifications
- **1.0.0 → 1.1.0**: New optional phase, additional actions
- **1.0.0 → 2.0.0**: Breaking changes to command structure

### Documenting Changes

Add comments explaining customizations:

```markdown
<!-- Forked from henry-feature v1.2.0 on 2024-01-15 -->
<!-- Customizations:
- Added mobile-specific testing phase
- Replaced ui-visual-designer with mobile-app-engineer
- Added offline-first architecture requirements
-->

# Mobile Feature Development
```

### Syncing with Upstream

When Henry Orchestrator updates:

1. **Check upstream changes:**
```bash
git diff HEAD~1 plugins/henry-orchestrator/commands/henry-feature.md
```

2. **Review improvements:**
- Better phase structure?
- New agent capabilities?
- Improved examples?

3. **Merge beneficial changes:**
```bash
# Review upstream command
cat plugins/henry-orchestrator/commands/henry-feature.md

# Manually merge improvements into fork
nano .claude/commands/mobile-feature.md
```

4. **Test after merge:**
```bash
/mobile-feature test-sync iOS
```

5. **Update version and document:**
```yaml
version: "1.1.0"  # Merged upstream improvements
```

### Deprecating Forks

When fork no longer needed:

1. **Assess necessity:**
- Is inline customization sufficient now?
- Does updated upstream command meet needs?
- Is henry-team more appropriate?

2. **Notify team:**
```markdown
<!-- DEPRECATED: This command is deprecated as of 2024-06-01.
Use /henry-orchestrator:henry-feature with inline customization instead:
/henry-orchestrator:henry-feature [args] "Mobile-specific: test on iOS and Android"
-->
```

3. **Grace period:**
Keep command for 2-4 weeks with deprecation notice

4. **Remove and document:**
```bash
git rm .claude/commands/mobile-feature.md
git commit -m "Remove deprecated mobile-feature command

Replaced by upstream henry-feature with inline customization.
Migration: Use /henry-orchestrator:henry-feature [args] 'mobile-specific: ...'"
```

## Best Practices

### Naming

✅ **Descriptive names:** `mobile-feature`, `api-workflow`, `security-review`
✅ **Consistent style:** Use lowercase with hyphens
✅ **Avoid conflicts:** Don't name `henry-*` unless contributing upstream
✅ **Clear purpose:** Name should indicate what command does

### Documentation

✅ **Fork provenance:** Document which command forked from
✅ **Customization rationale:** Explain why customizations made
✅ **Usage examples:** Show concrete invocation examples
✅ **Version tracking:** Use semantic versioning
✅ **Team sharing:** Document in project README

### Structure

✅ **Consistent phases:** Use same phase component structure as upstream
✅ **Clear modifications:** Make customizations obvious
✅ **Maintain quality:** Match or exceed upstream documentation quality
✅ **Regular testing:** Verify command still works after changes

### Maintenance

✅ **Review upstream:** Check for upstream improvements regularly
✅ **Version updates:** Update version when making changes
✅ **Deprecate proactively:** Remove forks when no longer needed
✅ **Git tracking:** Commit custom commands to version control

## Troubleshooting

### Fork Not Appearing in /help

**Issue:** Forked command doesn't show in command list

**Solutions:**
- Verify file location (`.claude/commands/` or `~/.claude/commands/`)
- Check file has `.md` extension
- Ensure valid YAML frontmatter (no syntax errors)
- Restart Claude Code to refresh: `/clear` then check `/help`

### Phases Not Executing Correctly

**Issue:** Phases run out of order or agents not invoked

**Solutions:**
- Review phase instructions for clarity
- Ensure agent names match exactly (check `/agents`)
- Add explicit "wait for user confirmation" checkpoints
- Test phases independently

### Arguments Not Working

**Issue:** `$1`, `$2` not substituting correctly

**Solutions:**
- Verify argument syntax: `$1` not `$arg1`
- Check `argument-hint` matches expected arguments
- Test invocation: `/your-command arg1 arg2`
- Escape special characters if needed

### Conflicts with Upstream

**Issue:** Fork and upstream have same name or conflict

**Solutions:**
- Rename fork to avoid conflicts: `my-feature` not `henry-feature`
- Use project prefix: `acme-feature` for Acme Corp
- Document relationship to upstream clearly

### Fork Becoming Stale

**Issue:** Fork hasn't been updated while upstream improved

**Solutions:**
- Set calendar reminder to review upstream monthly
- Subscribe to Henry Orchestrator changelog
- Test fork regularly to catch issues early
- Deprecate if upstream now sufficient

## Examples

### Example 1: API Development Fork

Fork henry-feature for API-specific workflow:

```bash
# Copy base command
cp plugins/henry-orchestrator/commands/henry-feature.md \
   .claude/commands/api-workflow.md
```

Customize for APIs:
```markdown
---
description: API development with OpenAPI spec, implementation, and testing
argument-hint: [api-name] [description]
version: "1.0.0"
---

<!-- Forked from henry-feature v1.0.0
Customizations: API-specific phases, added security review, OpenAPI generation
-->

# API Development Workflow

## Phase 1: API Design
[Modified: Added OpenAPI specification requirement]

## Phase 2: Security Review
[NEW: Added security-engineer review of API design]

## Phase 3: Implementation
[Keep from original]

## Phase 4: API Testing
[Modified: Added contract testing, removed UI testing]

## Phase 5: Documentation
[Modified: Auto-generate from OpenAPI spec]

## Summary
Complete API with spec, security review, tests, and documentation.
```

### Example 2: Simplified Review

Fork henry-review for quick reviews:

```bash
cp plugins/henry-orchestrator/commands/henry-review.md \
   .claude/commands/quick-review.md
```

Simplify to single-phase:
```markdown
---
description: Quick code review focusing on critical issues only
argument-hint: [pr-number or file-path]
version: "1.0.0"
---

<!-- Forked from henry-review v1.0.0
Simplified to single-phase for time-sensitive reviews
-->

# Quick Code Review

Rapid review focusing on blocking issues: security, correctness, breaking changes.

## Phase 1: Critical Issues Review

**Goal**: Identify blocking issues that must be fixed before merge

**Actions**:
1. Launch backend-engineer or frontend-engineer (depending on changes)
2. Review for security vulnerabilities
3. Check for breaking changes
4. Verify correctness of core logic
5. Skip style, optimization, documentation (non-blocking)

**Agents**: backend-engineer, frontend-engineer

**Deliverables**: List of blocking issues (or approval if none found)

## Summary

Quick review complete. Address any blocking issues before merge.
For comprehensive review, use /henry-orchestrator:henry-review instead.
```

### Example 3: Platform Migration

Fork for platform-specific migration workflow:

```markdown
---
description: React to Next.js migration workflow
argument-hint: [component-or-page]
version: "1.0.0"
---

<!-- Created from henry-feature pattern
Customized for React → Next.js migrations
-->

# Next.js Migration Workflow

## Phase 1: Migration Planning

**Goal**: Assess migration complexity and dependencies

**Actions**:
1. Launch frontend-engineer to analyze component
2. Identify dependencies and hooks
3. Plan data fetching strategy (SSR, SSG, CSR)
4. Identify Next.js-specific patterns needed

**Agents**: frontend-engineer

**Deliverables**: Migration plan, dependency map

## Phase 2: Code Migration

**Goal**: Migrate component to Next.js

**Actions**:
1. Convert to Next.js page or component structure
2. Migrate data fetching (useEffect → getServerSideProps/getStaticProps)
3. Update routing (React Router → Next.js routing)
4. Adapt styling for Next.js

**Agents**: frontend-engineer

**Deliverables**: Migrated code

## Phase 3: Testing

**Goal**: Verify migrated component works correctly

**Actions**:
1. Update tests for Next.js environment
2. Test SSR/SSG rendering
3. Verify data fetching
4. Test routing and navigation

**Agents**: qa-tester, frontend-engineer

**Deliverables**: Passing tests, verified functionality

## Summary

Component successfully migrated to Next.js with verified functionality.
```

## Related Documentation

- **Command Format:** `references/command-format.md`
- **Customization Patterns:** `references/customization-patterns.md`
- **Creating Commands:** `references/creating-commands.md`
- **Examples:** `examples/` directory
