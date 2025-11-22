---
name: advanced-henry-debugging
description: >
  This skill should be used for troubleshooting and debugging Henry Orchestrator agent and command issues, particularly when agents aren't triggering correctly, commands produce unexpected results, workflows fail, agent outputs conflict, or orchestration problems occur. It addresses questions like "debug henry orchestration", "why aren't agents triggering", "wrong agents selected", "henry-review not working as expected", "agents providing conflicting recommendations", and "workflow phases failing". This skill provides systematic debugging approaches for diagnosing agent selection problems, command execution issues, workflow failures, and agent conflict resolution.
allowed-tools: search_files, read_file
---

# Advanced Henry Debugging

This skill provides comprehensive troubleshooting and debugging guidance for Henry Orchestrator agent and command issues. Learn how to diagnose problems, resolve conflicts, and optimize orchestration workflows.

## Overview

Common issues when using Henry Orchestrator:

- Agents not triggering when expected
- Wrong agents selected for task
- Commands producing unexpected results
- Agent outputs conflicting
- Workflow phases skipping or failing
- Performance issues with orchestration
- Integration problems with other tools

This skill helps you identify root causes and implement solutions.

## Debugging Framework

### Step 1: Identify the Problem

**Questions to answer**:

- What did you expect to happen?
- What actually happened?
- When did it start failing?
- Can you reproduce the issue?
- What changed recently?

**Gather evidence**:

- Command invocation (exact syntax used)
- Agent responses or errors
- Expected vs. actual behavior
- Recent changes (code, config, environment)

### Step 2: Categorize the Issue

**Issue types**:

1. **Agent Selection**: Wrong agent(s) invoked or no agent invoked
2. **Command Execution**: Command fails or produces wrong results
3. **Agent Conflicts**: Agents provide contradictory recommendations
4. **Workflow Problems**: Phases skip, fail, or execute out of order
5. **Performance**: Orchestration too slow or times out
6. **Integration**: Problems with tools, MCP servers, or external systems

### Step 3: Apply Diagnostic Tools

**For each issue type, use specific debugging approaches detailed below.**

## Issue Type 1: Agent Selection Problems

### Problem: Agent Not Triggering

**Symptoms**: You expect an agent to be invoked but it isn't

**Diagnostic steps**:

1. **Verify agent exists**:

   ```
   /agents
   ```

   Check if agent appears in list. Look for exact name match.

2. **Check invocation method**:
   - Automatic: Claude decides based on context
   - Explicit: User requests specific agent
   - Command-based: henry-\* commands invoke agents

3. **Review agent description**:

   ```
   Read agent file: plugins/henry-orchestrator/agents/[agent-name].md
   ```

   Check triggering examples in frontmatter `description` field.

4. **Test explicit invocation**:
   ```
   Use the [agent-name] agent to [task description]
   ```
   If this works, issue is with automatic triggering.

**Common causes**:

**Cause: Vague request**

```
Problem: "Review my code" (too generic, any agent could apply)
Solution: "Use security-engineer to review authentication code for vulnerabilities"
```

**Cause: Missing keywords**

```
Problem: "Make it faster" (doesn't mention performance)
Solution: "Use performance-engineer to optimize Core Web Vitals"
```

**Cause: Wrong context**

```
Problem: Asking for performance optimization in strategy discussion
Solution: Complete strategy phase first, then request performance work
```

**Resolution**:

- Be specific about which agent you need
- Use explicit invocation: "Use [agent-name] to..."
- Include domain keywords that match agent description
- Reference agent capabilities in your request

### Problem: Wrong Agent Selected

**Symptoms**: Different agent than expected responds to request

**Diagnostic steps**:

1. **Analyze request ambiguity**:

   ```
   Request: "Review the API"
   Could match: backend-engineer (implementation), security-engineer (vulnerabilities),
                performance-engineer (speed), qa-tester (testing)
   ```

2. **Check agent descriptions for overlap**:

   ```
   Read descriptions of expected vs. actual agent
   Identify why actual agent matched
   ```

3. **Make request more specific**:
   ```
   Instead of: "Review the API"
   Use: "Use security-engineer to review API for OWASP Top 10 vulnerabilities"
   ```

**Resolution**:

- Specify agent explicitly when ambiguous
- Include domain-specific keywords (security, performance, UX, etc.)
- Reference specific deliverables you need
- Use henry-team for multiple agents

### Problem: Multiple Agents When One Expected

**Symptoms**: Several agents respond when you wanted single agent

**Diagnostic steps**:

1. **Check if request implies multiple domains**:

   ```
   Request: "Build accessible dashboard with good performance"
   Triggers: frontend-engineer (build), a11y-specialist (accessible),
             performance-engineer (performance)
   ```

2. **Determine if multiple agents are beneficial**:
   - Sometimes multiple perspectives are valuable
   - If not desired, be more specific

**Resolution**:

- If multiple agents beneficial: Let them collaborate, synthesize outputs
- If single agent desired: Be very specific about which aspect you need
- Use agent names explicitly to limit scope

## Issue Type 2: Command Execution Problems

### Problem: Command Not Found

**Symptoms**: `/henry-orchestrator:command-name` shows "command not found"

**Diagnostic steps**:

1. **Verify command name**:

   ```
   /henry-orchestrator:help
   ```

   Check exact command names available.

2. **Check for typos**:

   ```
   Common mistakes:
   - /henry-feature (missing :henry-orchestrator prefix)
   - /henry-orchestrator:feature (missing "henry-" prefix)
   - /henry-orchestrator:henry_feature (underscore instead of hyphen)
   ```

3. **Verify plugin installed**:
   ```
   Check plugins/henry-orchestrator/ exists
   ```

**Resolution**:

- Use exact command name from `/henry-orchestrator:help`
- Include full prefix: `/henry-orchestrator:henry-feature`
- Use tab completion to avoid typos

### Problem: Command Executes But Wrong Agents Invoked

**Symptoms**: Command runs but doesn't invoke expected agents

**Diagnostic steps**:

1. **Review command definition**:

   ```
   Read file: plugins/henry-orchestrator/commands/[command-name].md
   Check which agents command is supposed to invoke
   ```

2. **Check command arguments**:

   ```
   Some commands accept arguments that modify behavior
   Example: /henry-orchestrator:henry-review [specific focus]
   ```

3. **Verify agent availability**:
   ```
   /agents
   Ensure all agents command needs are available
   ```

**Example debugging session**:

```
Problem: /henry-orchestrator:henry-audit only ran security audit, not full audit

Investigation:
1. Read plugins/henry-orchestrator/commands/henry-audit.md
   → Should invoke: security, performance, a11y, SEO, ops agents

2. Check invocation: /henry-orchestrator:henry-audit Security only
   → Argument "Security only" modified default behavior

3. Root cause: User inadvertently restricted scope with arguments

Solution: Use /henry-orchestrator:henry-audit without arguments for full audit
```

**Resolution**:

- Check command documentation for expected behavior
- Review arguments passed to command
- Use `/henry-orchestrator:help` to see argument hints
- Test command without arguments to verify default behavior

### Problem: Command Phases Skip or Fail

**Symptoms**: Command workflow doesn't complete all phases

**Diagnostic steps**:

1. **Identify which phase failed**:
   - Track todo list updates
   - Note last successful phase
   - Check error messages

2. **Check phase dependencies**:

   ```
   Example: henry-feature implementation phase requires design phase output
   If design skipped, implementation may fail
   ```

3. **Verify inputs for failed phase**:
   - Does phase have required context?
   - Are files/resources available?
   - Are prerequisites met?

**Example**:

```
Problem: henry-feature skipped security review phase

Investigation:
1. Checked todo list: Shows security review as [-] (in progress) but never [x] (complete)
2. Reviewed phase: Requires security-engineer agent
3. Checked agents: security-engineer available
4. Root cause: Phase waiting for user approval to proceed

Solution: Provide approval when command asks "Proceed with security review?"
```

**Resolution**:

- Monitor todo list for phase progress
- Respond to approval requests promptly
- Ensure all prerequisites available before starting command
- If phase stuck, use `/agents` to manually invoke needed agent

## Issue Type 3: Agent Conflict Resolution

### Problem: Contradictory Recommendations

**Symptoms**: Different agents recommend opposite approaches

**Diagnostic framework**:

1. **Understand each agent's perspective**:
   - What is each agent optimizing for?
   - What constraints is each agent considering?
   - Is conflict fundamental or resolvable?

2. **Apply priority framework**:

   ```
   Priority order:
   1. Security (non-negotiable)
   2. Accessibility (legal/ethical requirement)
   3. Functionality (must work before optimizing)
   4. Performance (important but flexible)
   5. UX polish (last priority)
   ```

3. **Look for both/and solutions**:
   - Can both goals be achieved with proper implementation?
   - Is there a technical approach that satisfies both?

### Common Conflicts and Resolutions

**Conflict 1: Performance vs. Accessibility**

```
Scenario:
- performance-engineer: "Use lazy loading for below-fold images"
- a11y-specialist: "Lazy loading breaks keyboard navigation to images"

Analysis:
- Performance: Lazy loading reduces initial bundle, improves LCP
- A11y: Need keyboard-accessible way to load and navigate to images

Resolution:
Implement lazy loading with:
- Intersection Observer for automatic loading when near viewport
- Keyboard-accessible "Load more" button as fallback
- Skip links to jump to loaded content
- Proper focus management after loading

Rationale: Both goals achievable with proper implementation
```

**Conflict 2: Security vs. Functionality**

```
Scenario:
- security-engineer: "Implement strict CSP, block all inline scripts"
- frontend-engineer: "Need inline scripts for third-party analytics widget"

Analysis:
- Security: Inline scripts = XSS risk, CSP best practice
- Functionality: Third-party requires inline scripts

Resolution:
Security prevails:
- Find CSP-compliant analytics alternative (e.g., Google Analytics 4 with CSP)
- OR build custom analytics that works with CSP
- OR use CSP nonces for specific inline scripts (less secure but controlled)

Rationale: Security is non-negotiable, features must work within security constraints
```

**Conflict 3: UX vs. Performance**

```
Scenario:
- ux-ui-designer: "Add smooth animations to page transitions"
- performance-engineer: "Animations cause Cumulative Layout Shift (CLS)"

Analysis:
- UX: Animations improve perceived performance and delight
- Performance: Layout shift violates Core Web Vitals (CLS <0.1)

Resolution:
Both/and solution:
- Use transform and opacity for animations (no layout shift)
- Avoid animating properties that trigger reflow (width, height, top, left)
- Use CSS animations with will-change for GPU acceleration
- Measure CLS impact and stay within budget

Rationale: Animations and performance compatible with CSS best practices
```

**Conflict 4: Code Quality vs. Deadline**

```
Scenario:
- qa-tester: "Need 80% test coverage before launch"
- Product deadline: "Must launch in 2 days"

Analysis:
- Quality: Comprehensive testing reduces production bugs
- Business: Market window or commitment

Resolution:
Risk-based approach:
1. Prioritize: Test critical paths first (auth, payments, core features)
2. Accept risk: Document untested areas, plan post-launch testing
3. Monitoring: Comprehensive production monitoring to catch issues
4. Follow-up: Schedule test debt reduction in next sprint

Rationale: Calculated risk with mitigation plan
```

### Conflict Resolution Process

1. **Acknowledge the conflict**: Don't ignore or hide disagreements
2. **Understand constraints**: Why does each agent recommend their approach?
3. **Apply priority framework**: Security > A11y > Functionality > Performance > Polish
4. **Seek both/and solutions**: Can both goals be met with proper implementation?
5. **Make informed decision**: Document rationale for future reference
6. **Implement carefully**: Ensure chosen approach properly addresses both concerns
7. **Validate**: Verify solution satisfies both agents' core requirements

## Issue Type 4: Workflow Problems

### Problem: Workflow Stuck or Hanging

**Symptoms**: Workflow stops progressing, no updates to todo list

**Diagnostic steps**:

1. **Check for user input needed**:
   - Is workflow waiting for approval?
   - Did ask_followup_question get asked?
   - Are there prompts to respond to?

2. **Verify no errors occurred**:
   - Check last agent response
   - Look for error messages
   - Verify tools didn't fail

3. **Check todo list status**:
   - Which task is marked [-] (in progress)?
   - How long has it been in progress?
   - Are there dependencies blocking progress?

**Resolution**:

- Respond to any pending questions or approval requests
- If truly stuck, restart workflow from last successful phase
- Provide more context if workflow needs clarification
- Use manual agent invocation to unstick: "Use [agent-name] to continue with [phase]"

### Problem: Workflow Executing Out of Order

**Symptoms**: Phases execute in wrong sequence

**Diagnostic steps**:

1. **Review workflow definition**:

   ```
   Check command file for intended phase sequence
   Example: henry-feature should be Strategy → Design → Implementation
   ```

2. **Identify if parallel execution intended**:
   - Some workflows run phases in parallel (faster)
   - Others require sequential execution (dependencies)

3. **Check for skipped prerequisites**:
   - Did earlier phase complete successfully?
   - Does current phase have required inputs?

**Resolution**:

- If parallel execution causing confusion, request sequential: "Run phases one at a time, waiting for my approval between each"
- If dependencies missing, go back and complete prerequisite phases
- For complex workflows, use henry-team to control agent sequence manually

## Issue Type 5: Performance Problems

### Problem: Orchestration Too Slow

**Symptoms**: Commands take very long to complete, timeouts occur

**Diagnostic steps**:

1. **Identify bottleneck**:
   - Which phase is slowest?
   - How many agents involved?
   - Is codebase search taking long?

2. **Check for unnecessary work**:
   - Are agents repeating analysis?
   - Is same code being read multiple times?
   - Are all agents necessary for this task?

**Optimization strategies**:

**Strategy 1: Reduce agent count**

```
Slow: /henry-orchestrator:henry-audit (5 agents in parallel)
Faster: /henry-orchestrator:henry-team security-engineer performance-engineer
        (Only agents you need)
```

**Strategy 2: Use focused commands**

```
Slow: /henry-orchestrator:henry-feature (full workflow, 7 phases)
Faster: /henry-orchestrator:henry-team frontend-engineer - Just implement UI
        (Skip strategy and design if already done)
```

**Strategy 3: Provide context upfront**

```
Slow: Let agents search codebase repeatedly
Faster: "Review @src/auth/login.ts for security issues"
        (Direct file reference, no search needed)
```

**Strategy 4: Sequential instead of parallel**

```
Parallel: All agents work simultaneously (can be overwhelming)
Sequential: One agent at a time (slower but clearer)

Use: "Run one agent at a time, show me output before proceeding"
```

**Resolution**:

- Use smallest effective team of agents
- Provide direct file references instead of making agents search
- Use focused commands instead of comprehensive workflows when appropriate
- Consider sequential execution for complex analysis

## Issue Type 6: Integration Problems

### Problem: MCP Tool Integration Failing

**Symptoms**: Browser automation (Playwright) fails when used by agents

**Diagnostic steps**:

1. **Verify MCP server running**:

   ```
   Check that Playwright MCP server is connected
   Test basic command: use_mcp_tool(playwright, browser_navigate, {url: "https://example.com"})
   ```

2. **Check tool permissions**:

   ```
   Review agent frontmatter: Does agent have access to use_mcp_tool?
   Some agents restricted to specific tools
   ```

3. **Validate tool usage**:
   ```
   Check syntax: Tool calls must match exact schema
   Verify parameters: All required parameters provided
   ```

**Resolution**:

- Ensure MCP server connected before starting workflow
- Grant tool access if needed (modify agent frontmatter or use different agent)
- Test MCP tools independently before using in orchestration
- Provide clear instructions to agent about what to do with tool

## Debugging Checklists

### Checklist: Agent Not Working

- [ ] Agent exists in `/agents` list
- [ ] Agent name spelled correctly
- [ ] Request includes domain keywords matching agent description
- [ ] Using explicit invocation: "Use [agent-name] to..."
- [ ] Request is specific, not vague
- [ ] Context appropriate for agent (not asking for performance during strategy phase)
- [ ] Agent has necessary tool access
- [ ] No conflicting agents competing for same task

### Checklist: Command Not Working

- [ ] Command name correct (check `/henry-orchestrator:help`)
- [ ] Full command path: `/henry-orchestrator:henry-[command]`
- [ ] Arguments formatted correctly
- [ ] Plugin installed and enabled
- [ ] All required agents available
- [ ] Prerequisites met (e.g., design complete before implementation)
- [ ] Responding to approval prompts
- [ ] Not modifying command behavior with conflicting arguments

### Checklist: Workflow Not Completing

- [ ] All phases have required inputs
- [ ] No errors in previous phases
- [ ] Responding to questions and approval requests
- [ ] Not skipping critical phases
- [ ] Dependencies available (files, resources, context)
- [ ] Agents completing successfully (check todo list)
- [ ] Not timing out (simplify if too complex)
- [ ] Clear success criteria defined

## Advanced Debugging Techniques

### Technique 1: Incremental Testing

**Problem**: Complex workflow failing, unclear where

**Approach**: Test each phase independently

```
Instead of: /henry-orchestrator:henry-feature Build complete dashboard

Test incrementally:
1. /henry-orchestrator:henry-product Dashboard requirements
   → Verify PRD output looks good

2. /henry-orchestrator:henry-design Dashboard UX
   → Verify designs match requirements

3. /henry-orchestrator:henry-team frontend-engineer - Implement dashboard UI
   → Verify implementation works

4. /henry-orchestrator:henry-review Dashboard code
   → Verify quality

Identify which phase fails, debug that specific phase
```

### Technique 2: Minimal Reproduction

**Problem**: Issue occurs in complex scenario, hard to diagnose

**Approach**: Reduce to simplest case that reproduces issue

```
Original (complex): Full audit of entire codebase failing

Reduce to:
1. /henry-orchestrator:henry-team security-engineer - Review src/auth.ts
   → Works? Security agent fine

2. /henry-orchestrator:henry-team performance-engineer - Review src/auth.ts
   → Works? Performance agent fine

3. /henry-orchestrator:henry-team security-engineer performance-engineer - Review src/auth.ts
   → Fails? Issue with multi-agent synthesis

Identified: Problem is multi-agent coordination, not individual agents
```

### Technique 3: Comparison Testing

**Problem**: Workflow worked before, now fails

**Approach**: Compare working vs. broken versions

```
Working (last week): /henry-orchestrator:henry-review Staged changes
Broken (today): /henry-orchestrator:henry-review Staged changes

Differences to check:
- Code changes (what's being reviewed)
- Plugin version (was plugin updated?)
- Agent availability (are all agents still there?)
- Dependencies (were packages updated?)
- Environment (different model, settings?)

Find what changed between working and broken states
```

## Prevention Strategies

### Strategy 1: Clear Communication

**Do**:

- Be specific about which agents you need
- Provide clear context and goals
- Reference specific files and code sections
- Define success criteria upfront

**Don't**:

- Use vague requests like "make it better"
- Assume agents know context they weren't given
- Mix multiple unrelated tasks in one request
- Skip defining what success looks like

### Strategy 2: Iterative Workflows

**Do**:

- Start small, expand gradually
- Verify each phase before proceeding
- Use checkpoints and approvals
- Build in feedback loops

**Don't**:

- Run entire workflow blindly
- Skip validation steps
- Ignore intermediate outputs
- Defer all testing to the end

### Strategy 3: Documentation

**Do**:

- Document workflow decisions
- Track what worked and what didn't
- Note workarounds for recurring issues
- Share debugging findings with team

**Don't**:

- Repeat same mistakes
- Forget what worked before
- Skip documenting complex workflows
- Isolate debugging knowledge

## Quick Reference: Common Issues

| Symptom               | Likely Cause          | Quick Fix                                        |
| --------------------- | --------------------- | ------------------------------------------------ |
| Agent doesn't trigger | Vague request         | Use explicit: "Use [agent-name] to..."           |
| Wrong agent responds  | Request ambiguous     | Be more specific about domain                    |
| Command not found     | Typo in name          | Check `/henry-orchestrator:help`                 |
| Workflow stuck        | Waiting for approval  | Respond to prompts                               |
| Agents conflict       | Different priorities  | Apply priority framework, find both/and solution |
| Too slow              | Too many agents       | Use henry-team with only needed agents           |
| Phases skip           | Missing prerequisites | Complete earlier phases first                    |
| Tool fails            | MCP not connected     | Verify MCP server status                         |

## Getting Help

When debugging fails, gather this information for help request:

1. **What you tried**: Exact command/request used
2. **What happened**: Actual behavior observed
3. **What you expected**: Intended outcome
4. **Context**: Files, code, recent changes
5. **Debugging steps**: What you've already tried
6. **Error messages**: Any errors or warnings

**Example help request**:

```
Problem: henry-review only invoked qa-tester, expected security and performance too

What I tried:
/henry-orchestrator:henry-review Staged changes

What happened:
- Only qa-tester ran
- Got test coverage report
- No security or performance review

Expected:
- qa-tester, security-engineer, performance-engineer reviews
- Comprehensive review report

Context:
- Plugin: henry-orchestrator installed
- Files: Modified src/auth.ts (authentication changes)
- Recent changes: None

Debugging steps:
1. Checked /agents - all three agents available ✓
2. Read henry-review command - should invoke all three ✓
3. Tried explicit: "Use security-engineer to review auth" - worked ✓

Conclusion: Command defaulting to QA-only for some reason, explicit invocation works
```

## Integration with Henry Commands

This debugging skill complements all Henry commands:

- Use when `/henry-orchestrator:*` commands don't behave as expected
- Reference when agents conflict or produce unexpected results
- Apply when workflows fail or get stuck
- Consult for performance optimization of orchestration

For command-specific troubleshooting, also reference:

- `/henry-orchestrator:help` - Command documentation
- Individual agent files in `plugins/henry-orchestrator/agents/`
- Command files in `plugins/henry-orchestrator/commands/`

For additional debugging support, ask: "Help me debug [specific issue with Henry Orchestrator]"
