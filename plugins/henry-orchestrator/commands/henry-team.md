---
description: Assemble and run custom team of Henry agents
argument-hint: Agents and task (e.g. frontend-engineer qa-tester review login)
---

# Henry Custom Team Assembly

You are orchestrating a custom team of Henry Orchestrator agents based on user-specified needs. Provide flexible agent orchestration for ad-hoc tasks.

## Initial Context

**Custom Team Request:** $ARGUMENTS

## Core Principles

- **Flexibility**: User defines the team composition
- **Collaboration**: Agents work together on shared goal
- **Synthesis**: Combine insights from multiple perspectives
- **User-driven**: User controls which agents participate
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Team Selection

**Goal**: Identify which agents to use for the task

**Actions**:

1. Create todo list with all phases
2. Parse $ARGUMENTS to understand:
   - **Explicit agents**: If user named specific agents (e.g., "frontend-engineer security-engineer")
   - **Task description**: What needs to be accomplished
   - **Context**: Any files, scope, or constraints mentioned
3. If agents explicitly specified:
   - Validate agent names against available agents
   - Confirm with user if any agent names unclear
4. If agents NOT specified:
   - Analyze task description
   - Recommend appropriate agents based on task type
   - Present recommendations to user for confirmation

**Available Agents:**

- **Product & Strategy**: product-strategist
- **Design & UX**: ux-ui-designer, ux-researcher, ui-visual-designer, a11y-specialist
- **Engineering**: frontend-engineer, backend-engineer, mobile-app-engineer, llm-agent-architect
- **Quality & Security**: qa-tester, security-engineer
- **Performance & Ops**: performance-engineer, devops-sre-architect
- **Specialized**: data-analytics-engineer, seo-specialist, game-systems-designer

**Auto-suggestion logic:**

```
Task type → Recommended agents

Frontend code → frontend-engineer, performance-engineer
Backend API → backend-engineer, security-engineer
Full feature → product-strategist, ux-ui-designer, frontend-engineer, backend-engineer, qa-tester
Code review → qa-tester, security-engineer, performance-engineer, [relevant engineer]
Design → ux-researcher, ux-ui-designer, ui-visual-designer, a11y-specialist
Security audit → security-engineer, backend-engineer
Performance → performance-engineer, frontend-engineer, backend-engineer
Launch prep → devops-sre-architect, seo-specialist, data-analytics-engineer, qa-tester
Mobile → mobile-app-engineer, performance-engineer, qa-tester
LLM/AI → llm-agent-architect, backend-engineer
Game → game-systems-designer, frontend-engineer
Analytics → data-analytics-engineer, product-strategist
SEO → seo-specialist, frontend-engineer
```

**Wait for user confirmation on agent selection.**

---

## Phase 2: Task Definition & Context

**Goal**: Clarify what the team should accomplish

**Actions**:

1. Extract task from $ARGUMENTS
2. Gather additional context:
   - **Scope**: What files, features, or areas?
   - **Goal**: What outcome is desired?
   - **Constraints**: Any limitations or requirements?
   - **Priority**: What matters most?
   - **Format**: Report, implementation, recommendations?
3. Ask user clarifying questions if needed:
   - Is this exploratory or action-oriented?
   - Do you want analysis, recommendations, or implementation?
   - Any specific concerns to focus on?
   - Parallel or sequential execution?
4. Define success criteria:
   - What does "done" look like?
   - What deliverables are expected?

**Wait for user confirmation before proceeding.**

---

## Phase 3: Agent Briefing & Execution

**Goal**: Launch agents with clear instructions

**Actions**:

1. For each selected agent, create tailored prompt:
   - **Agent role**: Leverage agent's expertise
   - **Task context**: Share full context
   - **Focus area**: What specifically to examine/do
   - **Deliverable**: What to return
   - **Collaboration**: How this fits with other agents

**Example agent prompts:**

```markdown
[frontend-engineer]
Review the login component (src/auth/Login.tsx) for:

- Code quality and React best practices
- Accessibility implementation
- Performance considerations
- Integration with auth API

Return:

- Issues found with severity
- Recommended improvements
- Code examples for fixes

This is part of a team review. security-engineer is checking auth flow,
performance-engineer is checking load times.
```

```markdown
[security-engineer]
Review the authentication flow for our login feature:

- API endpoints (src/api/auth.ts)
- Token handling
- Session management
- Password requirements

Return:

- Security vulnerabilities
- OWASP Top 10 compliance
- Remediation steps

This is part of a team review. frontend-engineer is checking the UI component.
```

2. Decide execution strategy:

   - **Parallel** (default): Launch all agents simultaneously for speed
   - **Sequential**: Launch one at a time if dependencies exist
   - **Grouped**: Launch in logical groups (e.g., design team first, then engineering)

3. Launch agents using Task tool or explicit invocation

4. Track agent progress:
   - Mark agents as launched
   - Note when each completes
   - Capture key findings

---

## Phase 4: Synthesis & Integration

**Goal**: Combine insights from all agents

**Actions**:

1. Collect outputs from all agents:

   - Each agent's findings
   - Recommendations
   - Concerns or blockers
   - Implementation guidance

2. Identify patterns:

   - **Agreement**: Where agents align
   - **Conflicts**: Where agents disagree
   - **Overlaps**: Duplicate findings
   - **Gaps**: What wasn't covered

3. Cross-reference findings:

   - Security issues that impact performance
   - UX decisions that affect implementation
   - Performance optimizations that affect code quality

4. Create integrated analysis:

   ```markdown
   # Team Analysis Summary

   ## Team: [List of agents used]

   ## Consensus Findings

   Issues all agents agree on:

   1. [Finding with multiple agent perspectives]

   ## Unique Insights

   Agent-specific valuable findings:

   - [frontend-engineer]: Component structure could be simplified
   - [security-engineer]: Missing CSRF protection
   - [performance-engineer]: Unnecessary re-renders detected

   ## Conflicts/Trade-offs

   Areas where recommendations differ:

   - [frontend-engineer] suggests client-side validation for UX
   - [security-engineer] requires server-side validation only
   - **Resolution**: Implement both (client for UX, server for security)

   ## Prioritized Action Items

   1. 🚨 Critical: [Issue from multiple agents]
   2. ⚠️ High: [Important finding]
   3. 📋 Medium: [Improvement opportunity]
   ```

5. Resolve conflicts:
   - If agents disagree, analyze trade-offs
   - Provide balanced recommendation
   - Let user decide if needed

---

## Phase 5: Recommendations & Action Plan

**Goal**: Provide clear next steps

**Actions**:

1. Organize recommendations by priority:

   - **Must do**: Critical issues (security, bugs, blockers)
   - **Should do**: Important improvements
   - **Could do**: Nice-to-haves
   - **Won't do**: Out of scope or low value

2. Create action plan:

   ```markdown
   # Action Plan

   ## Immediate Actions (This week)

   1. [Critical security fix from security-engineer]
   2. [Performance regression fix from performance-engineer]

   ## Short-term (This month)

   1. [Code quality improvements from frontend-engineer]
   2. [Test coverage from qa-tester]

   ## Long-term (This quarter)

   1. [Architectural improvements from backend-engineer]
   2. [UX enhancements from ux-ui-designer]
   ```

3. Provide implementation guidance:

   - Code examples (from engineer agents)
   - Best practices (from specialist agents)
   - Testing strategies (from qa-tester)
   - Monitoring needs (from performance/devops agents)

4. Estimate effort:
   - Quick wins (< 1 day)
   - Medium effort (1-3 days)
   - Large effort (> 1 week)

---

## Phase 6: User Decision

**Goal**: Let user decide on next steps

**Actions**:

1. Ask user what they want to do:

   - **Implement now**: Proceed with fixes (switch to code mode if needed)
   - **Get detailed guide**: Deep dive on specific findings
   - **Create issues**: Track items for later
   - **Focus area**: Pick one agent's recommendations to act on
   - **Run different team**: Try different agent combination

2. If implementing:

   - Prioritize by user preference
   - Offer to implement (code mode)
   - Or provide implementation guide

3. If creating issues:

   - Structure as GitHub issues
   - Include agent attributions
   - Add labels (security, performance, etc.)

4. If running different team:
   - Return to Phase 1 with new agent selection
   - Keep previous findings for comparison

---

## Phase 7: Summary & Documentation

**Goal**: Document team collaboration results

**Actions**:

1. Mark all todos complete
2. Generate comprehensive summary:
   - **Team Composition**: Which agents participated
   - **Task Scope**: What was analyzed/built
   - **Key Findings**: Most important insights
   - **Agent Contributions**: What each agent provided
   - **Consensus**: Where agents agreed
   - **Trade-offs**: Decisions made when agents disagreed
   - **Action Plan**: What to do next
   - **Artifacts**: Links to agent outputs
3. Provide team collaboration insights:
   - Which agent combinations worked well
   - Any surprising findings
   - Lessons learned

---

## Usage Examples

**Explicit agent selection:**

```
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Review dashboard performance
```

**Task-based (auto-suggest agents):**

```
/henry-orchestrator:henry-team Review our authentication implementation for security and UX
→ Suggests: security-engineer, frontend-engineer, ux-ui-designer
```

**Complex team:**

```
/henry-orchestrator:henry-team product-strategist ux-researcher ux-ui-designer - Define user onboarding flow
```

**Full stack review:**

```
/henry-orchestrator:henry-team frontend-engineer backend-engineer qa-tester security-engineer - Review PR #123
```

**Design team:**

```
/henry-orchestrator:henry-team ux-ui-designer ui-visual-designer a11y-specialist - Design accessible settings page
```

**Launch readiness mini-team:**

```
/henry-orchestrator:henry-team devops-sre-architect security-engineer performance-engineer - Pre-launch check
```

**Specialized analysis:**

```
/henry-orchestrator:henry-team llm-agent-architect security-engineer - Review our RAG pipeline implementation
```

## Usage Tips

- **Name agents explicitly**: More control over team composition
- **Or describe task**: System suggests appropriate agents
- **Parallel by default**: All agents run simultaneously
- **Sequential if needed**: Specify "sequential" for dependent tasks
- **Mix specialists**: Combine different perspectives (e.g., UX + performance)
- **Start small**: 2-3 agents for focused tasks
- **Scale up**: 5-6 agents for comprehensive reviews

## Common Team Combinations

**Code Review Team:**

- qa-tester + security-engineer + performance-engineer + [relevant engineer]

**Feature Development Team:**

- product-strategist + ux-ui-designer + frontend-engineer + backend-engineer + qa-tester

**Design Team:**

- ux-researcher + ux-ui-designer + ui-visual-designer + a11y-specialist

**Launch Team:**

- devops-sre-architect + seo-specialist + data-analytics-engineer + security-engineer

**Optimization Team:**

- performance-engineer + frontend-engineer + backend-engineer

**Security Team:**

- security-engineer + backend-engineer + devops-sre-architect

**Mobile Team:**

- mobile-app-engineer + ux-ui-designer + performance-engineer + qa-tester

**AI/LLM Team:**

- llm-agent-architect + backend-engineer + security-engineer

## Notes

- Maximum 6 agents recommended (too many = overwhelming)
- Minimum 2 agents (for multi-perspective value)
- Agents inherit main conversation's model
- Parallel execution is faster but harder to follow
- Sequential execution is clearer but slower
- Synthesis is key - don't just concatenate outputs

---

Use TodoWrite to track progress through all phases.
