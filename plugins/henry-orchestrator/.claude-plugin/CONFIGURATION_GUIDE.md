# Henry Orchestrator - Plugin Configuration Guide

## Overview

This document explains how plugin subagents are configured based on expert examples from the Claude Code ecosystem.

## Key Finding: No `config.json` Required

**Important**: Plugins do NOT need a separate `config.json` file for subagents. The configuration is embedded in the YAML frontmatter of each agent's markdown file.

## How Expert Plugins Configure Subagents

### Plugin Structure

```
henry-orchestrator/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata only
├── agents/                   # Subagents available to users
│   ├── frontend-engineer.md
│   ├── backend-engineer.md
│   └── ... (other agents)
└── README.md
```

### Agent Configuration Format

Each agent is a markdown file with YAML frontmatter containing all configuration:

```yaml
---
name: agent-name
description: When this agent should be used (visible to Claude)
model: inherit|sonnet|opus|haiku # Optional
tools: Tool1, Tool2, Tool3 # Optional
color: red|blue|green|... # Optional (UI hint)
---
# Agent system prompt goes here
Your detailed instructions for the agent...
```

## Configuration Fields Reference

### Required Fields

| Field         | Description                          | Example                                                                |
| ------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| `name`        | Unique identifier (kebab-case)       | `frontend-engineer`                                                    |
| `description` | When Claude should invoke this agent | `Expert frontend engineer for React, Vue, performance optimization...` |

### Optional Fields

| Field            | Default                | Description                                        | Example                |
| ---------------- | ---------------------- | -------------------------------------------------- | ---------------------- |
| `model`          | Default subagent model | Model to use: `inherit`, `sonnet`, `opus`, `haiku` | `inherit`              |
| `tools`          | All tools              | Comma-separated tool list                          | `Read,Write,Grep,Bash` |
| `color`          | None                   | UI color hint                                      | `purple`               |
| `permissionMode` | `default`              | Permission handling                                | `acceptEdits`          |
| `skills`         | None                   | Auto-loaded skills                                 | `skill1,skill2`        |

## Expert Examples Analysis

### 1. agent-sdk-dev Plugin

**agent-sdk-verifier-py.md:**

```yaml
---
name: agent-sdk-verifier-py
description: Use this agent to verify that a Python Agent SDK application is properly configured...
model: sonnet
---
```

**Key Takeaways:**

- ✅ Explicit `model: sonnet` for specialized model
- ✅ No `tools` field = inherits all tools
- ✅ Detailed description guiding when to use

### 2. feature-dev Plugin

**code-architect.md:**

```yaml
---
name: code-architect
description: Designs feature architectures by analyzing existing codebase patterns...
tools: Glob, Grep, LS, Read, NotebookRead, WebFetch, TodoWrite, WebSearch, KillShell, BashOutput
model: sonnet
color: green
---
```

**Key Takeaways:**

- ✅ Explicit `tools` list for focused capabilities
- ✅ `color` for UI distinction
- ✅ Research-focused tools only (no Write/Edit)

## Your Henry Orchestrator Status

### Current Configuration Summary

| Agent                   | name ✓ | description ✓ | model   | tools                         | color  |
| ----------------------- | ------ | ------------- | ------- | ----------------------------- | ------ |
| a11y-specialist         | ✓      | ✓             | inherit | ❌                            | purple |
| backend-engineer        | ✓      | ✓             | inherit | ❌                            | ❌     |
| data-analytics-engineer | ✓      | ✓             | inherit | ❌                            | purple |
| devops-sre-architect    | ✓      | ✓             | inherit | ❌                            | red    |
| frontend-engineer       | ✓      | ✓             | inherit | ❌                            | purple |
| game-systems-designer   | ✓      | ✓             | inherit | ❌                            | pink   |
| llm-agent-architect     | ✓      | ✓             | inherit | **Read,Write,Grep,Glob,Bash** | orange |
| mobile-app-engineer     | ✓      | ✓             | inherit | ❌                            | ❌     |
| performance-engineer    | ✓      | ✓             | inherit | ❌                            | green  |
| product-strategist      | ✓      | ✓             | inherit | ❌                            | purple |
| qa-tester               | ✓      | ✓             | inherit | ❌                            | cyan   |
| security-engineer       | ✓      | ✓             | inherit | ❌                            | blue   |
| seo-specialist          | ✓      | ✓             | inherit | ❌                            | yellow |
| ui-visual-designer      | ✓      | ✓             | inherit | ❌                            | ❌     |
| ux-researcher           | ✓      | ✓             | inherit | ❌                            | ❌     |
| ux-ui-designer          | ✓      | ✓             | inherit | ❌                            | green  |

**Legend:**

- ✓ = Configured
- ❌ = Not configured (uses default)
- inherit = Uses main conversation's model

## Recommendations

### Option 1: Keep Current Configuration (Simplest)

**Status**: ✅ Your agents are properly configured and will work when users install the plugin!

**What happens:**

- All agents inherit all available tools (maximum flexibility)
- Users can invoke any agent for their specialized tasks
- Agents have full toolset access

**When to use:** If you want maximum flexibility and trust agents to use tools appropriately.

### Option 2: Add Explicit Tool Restrictions (More Control)

Consider adding `tools` field to agents that should have limited tool access:

**Example - Research-only agents:**

```yaml
---
name: product-strategist
description: Expert in product strategy, market analysis...
model: inherit
color: purple
tools: Read, Grep, Glob, Bash, WebFetch, WebSearch # No Write/Edit
---
```

**Example - Implementation agents:**

```yaml
---
name: frontend-engineer
description: Architects and implements modern web applications...
model: inherit
color: purple
tools: Read, Write, Edit, Grep, Glob, Bash, Execute # Full implementation toolkit
---
```

**When to use:** If you want to enforce separation between research/analysis vs implementation.

### Option 3: Add Missing Color Fields (Better UX)

Add `color` to agents missing it for better visual distinction:

```yaml
backend-engineer: color: blue
mobile-app-engineer: color: teal
ui-visual-designer: color: pink
ux-researcher: color: indigo
```

## How Users Will Install & Use Your Plugin

### Installation

Users will install your plugin via marketplace:

```bash
# Add marketplace
/plugin marketplace add your-org/plugins

# Install henry-orchestrator
/plugin install henry-orchestrator@your-org
```

### Usage

After installation, all 16 agents are automatically available:

**Automatic invocation:**

```
User: "I need to optimize the frontend performance of my React app"
Claude: [Automatically delegates to frontend-engineer or performance-engineer]
```

**Explicit invocation:**

```
User: "Use the security-engineer agent to review my authentication code"
Claude: [Invokes security-engineer agent]
```

**View available agents:**

```
/agents
```

## Testing Your Plugin Locally

Create a test marketplace:

```bash
# 1. Create test marketplace structure
mkdir -p ~/test-marketplace/.claude-plugin
cd ~/test-marketplace

# 2. Create marketplace.json
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "test-marketplace",
  "owner": {"name": "Test"},
  "plugins": [
    {
      "name": "henry-orchestrator",
      "source": "./henry-orchestrator",
      "description": "Multi-agent orchestration plugin"
    }
  ]
}
EOF

# 3. Copy your plugin
cp -r /path/to/plugins/henry-orchestrator ./

# 4. Install in Claude Code
claude
/plugin marketplace add ~/test-marketplace
/plugin install henry-orchestrator@test-marketplace
```

## Validation Checklist

- [x] All agents have `name` field
- [x] All agents have `description` field
- [x] All agents have system prompts in markdown body
- [x] Plugin has `.claude-plugin/plugin.json`
- [x] Agents are in `agents/` directory at plugin root
- [ ] Optional: Add `tools` field for restricted agents
- [ ] Optional: Add `color` to remaining agents
- [ ] Optional: Test locally before distribution

## Conclusion

**Your henry-orchestrator plugin is already properly configured!**

No `config.json` is needed. When users install your plugin:

1. All 16 specialized agents become available in Claude Code
2. Claude can automatically invoke them based on task context
3. Users can explicitly request specific agents
4. Each agent operates with its defined model and tools (or defaults)

The only enhancements you might consider are:

- Adding explicit `tools` restrictions for research vs implementation agents
- Adding `color` fields for better UI visualization
- Testing locally to validate behavior

## Reference Documentation

- [Subagents Documentation](../../Claude-Code-Docs/Subagents.md)
- [Plugins Reference](../../Claude-Code-Docs/PluginsReference.md)
- [Plugins Guide](../../Claude-Code-Docs/Plugins.md)
