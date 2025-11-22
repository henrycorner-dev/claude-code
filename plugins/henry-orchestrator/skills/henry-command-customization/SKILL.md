---
name: henry-command-customization
description: Use this skill when customizing Henry Orchestrator commands, creating command variations, or building new commands. Trigger when users ask to "customize henry-feature", "modify henry-audit to run fewer agents", "create custom command based on henry-review", "skip phases in henry-design", "add agents to workflow", "fork henry command", or want to adapt Henry commands for project-specific needs. Examples - user asks "Run only security and performance audit, skip accessibility", "Create mobile-focused version of henry-feature", "Add documentation phase to henry-design workflow", or "Build API development command like henry-feature". Also use when users want to understand command structure, phase sequencing, or agent selection patterns.
allowed-tools: read_file
version: '1.0.0'
---

# Henry Command Customization

## Overview

Henry Orchestrator provides 9 standard commands for common workflows. This skill guides customizing these commands and creating new ones for project-specific needs.

**Key capabilities:**

- Run subset workflows (specific phases or agents only)
- Extend workflows (add custom phases or agents)
- Modify workflows (change agent selection or sequencing)
- Create new commands following Henry patterns

## Understanding Command Structure

### Anatomy of Henry Commands

All Henry commands follow this structure:

```markdown
---
description: Command purpose and use case
argument-hint: Expected arguments
---

# Command Name

## Phase 1: Phase Name

Goal, agents involved, actions, deliverables

## Phase 2: Phase Name

Goal, agents involved, actions, deliverables

## Summary

Final synthesis and next steps
```

**Frontmatter components:**

- `description`: Shown in `/help` command list
- `argument-hint`: Expected arguments and format
- `allowed-tools`: Tool restrictions (optional)
- `model`: Specific model to use (optional)

**Body components:**

- Phase definitions with clear goals
- Agent invocation instructions
- User interaction points (approvals, clarifications)
- Deliverables and outputs
- Summary and next steps

For detailed command file format specification, see `references/command-format.md`

## Customization Approaches

### 1. Inline Customization

**What:** Modify command behavior during invocation without changing files

**When:** One-off customizations, experimenting with variations

**How:** Provide specific instructions when invoking command

**Examples:**

```
/henry-orchestrator:henry-review Review only for security, skip performance and QA

/henry-orchestrator:henry-audit Accessibility audit only, WCAG 2.1 AA compliance

/henry-orchestrator:henry-feature Skip design phase, we already have designs
```

**Pros:** No file modifications, quick, flexible per invocation
**Cons:** Not reusable, relies on interpretation, no permanent record

### 2. Command Forking

**What:** Copy existing command, modify for specific use case, save as new command

**When:** Reusable variations, project-specific workflows

**How:** Create new `.md` file in `.claude/commands/` based on existing Henry command

**Example:**

```bash
# Copy henry-review to create security-only review
cp plugins/henry-orchestrator/commands/henry-review.md \
   .claude/commands/security-review.md

# Edit security-review.md to only invoke security-engineer
```

**Pros:** Reusable, documented workflow, shareable via git
**Cons:** Requires maintenance, may diverge from upstream

See `references/forking-guide.md` for detailed forking instructions.

### 3. Parameterized Commands

**What:** Create generic command accepting parameters to control behavior

**When:** Multiple related variations, configurable workflows

**How:** Use `$ARGUMENTS` or `$1`, `$2` in command to parameterize behavior

**Example:**

```markdown
---
description: Customizable audit with agent selection
argument-hint: [agent-list] [scope]
---

# Flexible Audit

Run audit with specified agents: $1
Focus areas: $2

Invoke only the specified agents for targeted audit.
```

**Usage:** `/flexible-audit "security-engineer performance-engineer" "API security"`

**Pros:** Single command for multiple uses, clear parameterization
**Cons:** More complex structure, requires argument understanding

For parameterization patterns, see `references/parameterization.md`

## Common Customization Patterns

### Subset Agent Selection

**Goal:** Run command with fewer agents than standard workflow

**Example:** Run only security and performance from 5-agent henry-audit

**Inline approach:**

```
/henry-orchestrator:henry-audit Security and performance only
```

**Fork approach:** Create `.claude/commands/sec-perf-audit.md`

See `examples/subset-agents.md` for complete example.

### Extended Workflow

**Goal:** Add phases or agents not in standard workflow

**Example:** Add documentation generation phase to henry-feature

**Implementation:** Create command with additional phase after standard phases

See `examples/extended-workflow.md` for complete example.

### Modified Agent Selection

**Goal:** Use different agents than standard workflow

**Example:** Mobile-specific design with mobile-app-engineer instead of ui-visual-designer

See `examples/mobile-workflow.md` for complete example.

### Parallel to Sequential

**Goal:** Change execution pattern from parallel to sequential or vice versa

**Example:** Sequential audit with feedback loops instead of parallel execution

See `examples/sequential-workflow.md` for complete example.

For comprehensive pattern reference, see `references/customization-patterns.md`

## Creating New Commands

### Process

1. **Define purpose:** What workflow does this command orchestrate?
2. **Choose name:** Use descriptive action-object names (e.g., `api-workflow`, `mobile-feature`)
3. **Define phases:** Goal, agents, actions, deliverables for each phase
4. **Write command:** Use template structure with clear phase definitions
5. **Test:** Verify command works as expected

### Command Template

```markdown
---
description: [Clear description for /help]
argument-hint: [Expected arguments]
---

# [Command Name]

[Overview paragraph explaining purpose and use case]

## Phase 1: [Phase Name]

**Goal**: [What this phase accomplishes]

**Actions**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Agents**: [Which agents are used]

**Deliverables**: [What this phase produces]

## Summary

[How to synthesize all phases and present final deliverables]

---

## Usage Examples

[Show 2-3 concrete examples]
```

### Save Location

- **Project commands:** `.claude/commands/your-command.md`
- **Personal commands:** `~/.claude/commands/your-command.md`

For complete command creation guide, see `references/creating-commands.md`

## Command Composition

### Sequencing Commands

Create macro workflows by combining commands:

```markdown
# Product Launch Workflow

/henry-orchestrator:henry-product - Define strategy
/henry-orchestrator:henry-design - Design UX/UI
/henry-orchestrator:henry-feature - Implement
/henry-orchestrator:henry-audit - Health check
/henry-orchestrator:henry-launch - Deploy
```

### Command Chaining

Reference outputs from previous commands:

```markdown
# Iterative Optimization

1. /henry-orchestrator:henry-team performance-engineer - Baseline
2. /henry-orchestrator:henry-optimize - Optimize based on baseline
3. /henry-orchestrator:henry-team performance-engineer - Verify against baseline
```

## Best Practices

### Do

✅ Start with existing commands - modify before creating new ones
✅ Document clearly - include descriptions, examples, deliverables
✅ Test thoroughly - verify command works as expected
✅ Use consistent naming - follow Henry naming conventions
✅ Version control - commit custom commands to `.claude/commands/`

### Don't

❌ Over-customize - start simple, add complexity only when needed
❌ Duplicate existing - check if henry-team can achieve same goal
❌ Create unclear phases - each phase needs clear goal and deliverables
❌ Skip documentation - always include description and argument hints
❌ Create single-use commands - use inline customization for one-offs

## Maintenance

### Updating Custom Commands

When Henry Orchestrator updates:

1. Review upstream changes for improvements
2. Merge benefits into custom commands
3. Test after updates to verify compatibility
4. Document divergence from standard commands

### Deprecating Commands

When custom command no longer needed:

1. Notify team of deprecation
2. Provide alternative (standard command or inline approach)
3. Keep command during transition period
4. Remove file and document in CHANGELOG

## Troubleshooting

**Command not found:**

- Verify file in `.claude/commands/` or `~/.claude/commands/`
- Check file has `.md` extension
- Restart Claude Code to refresh command list

**Agents not invoked correctly:**

- Review phase instructions for clarity
- Ensure agent names match exactly (check `/agents` list)
- Test agent invocation independently

**Workflow phases out of order:**

- Verify phase dependencies are clear
- Check parallel vs sequential execution instructions
- Add explicit "wait for confirmation" checkpoints

## Integration with Henry

Custom commands complement Henry's standard commands:

- **Use standard commands** for common workflows (80% of cases)
- **Use henry-team** for custom agent combinations (15% of cases)
- **Create custom commands** only for repeated project-specific workflows (5% of cases)

## Resources

- **Henry commands:** `plugins/henry-orchestrator/commands/*.md`
- **Agent definitions:** `plugins/henry-orchestrator/agents/*.md`
- **Command help:** `/henry-orchestrator:help`
- **Agent list:** `/agents`

## See Also

- For detailed customization patterns: `references/customization-patterns.md`
- For complete examples: `examples/` directory
- For command creation guide: `references/creating-commands.md`
