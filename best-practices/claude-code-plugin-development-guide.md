# Expert Guide to Building Plugins, Subagents (Agents), Skills, Commands, Hooks, and Workflows for Claude Code

This guide distills the best practices from the `plugin-dev` plugin and other expert implementations in the Claude Code project. It provides a systematic formula for creating high-quality components that integrate seamlessly.

Follow this structure to build components that are discoverable, maintainable, and production-ready.

## 1. Plugin Structure (Foundation)

Every plugin follows a **standardized directory layout** for automatic discovery.

### Directory Layout

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Required manifest
├── commands/                 # Slash commands (*.md)
├── agents/                   # Subagents (*.md)
├── skills/                   # Skills (subdirs/SKILL.md)
│   └── skill-name/
│       ├── SKILL.md
│       ├── references/
│       ├── examples/
│       └── scripts/
├── hooks/
│   ├── hooks.json           # Hook config
│   └── scripts/             # Hook executables
├── .mcp.json                # MCP servers (optional)
└── scripts/                 # Utilities
```

### plugin.json Manifest

```json
{
  "name": "plugin-name", // kebab-case, unique
  "version": "1.0.0",
  "description": "Brief purpose",
  "commands": "./commands", // Optional custom paths
  "agents": ["./agents"]
}
```

**Rules:**

- Manifest **MUST** be in `.claude-plugin/plugin.json`
- Components at **root level** (not nested)
- Use `${CLAUDE_PLUGIN_ROOT}` for all paths
- Kebab-case naming everywhere

## 2. Commands (Slash Commands)

User-initiated workflows as `commands/command-name.md`.

### Structure

```markdown
---
name: command-name  // Optional, filename used
description: Brief help text
argument-hint: [arg1] [arg2]
allowed-tools: ["Read", "Bash(git:*)"]
model: inherit
---

Review code in $1 for issues listed in @standards.md.

!`git status` // Bash inline
```

### Key Features

- **Arguments:** `$1`, `$2`, `$ARGUMENTS`
- **Files:** `@file/path`
- **Bash:** ``!`command` `` (dynamic context)
- **Plugin refs:** `${CLAUDE_PLUGIN_ROOT}/script.sh`

### Best Practices

- Write **instructions for Claude**, not user messages
- Single responsibility per command
- Validate args/files early
- Use `argument-hint` for UX

## 3. Agents (Subagents)

Autonomous specialists in `agents/agent-name.md`.

### Frontmatter

```markdown
---
name: code-reviewer  // 3-50 chars, lowercase-hyphens
description: Use when user asks "review code", "check quality". Examples:

<example>
Context: PR review
user: "Review this PR"
assistant: "Use code-reviewer agent for comprehensive analysis."
<commentary>Specialized for code review tasks.</commentary>
</example>

model: inherit
color: blue
tools: ["Read", "Grep"]
---

You are code-reviewer...

**Responsibilities:**

1. Analyze structure
2. Check security

**Process:** Step-by-step...
```

### Formula

1. **Identifier:** Descriptive kebab-case
2. **Description:** "Use when..." + 2-4 `<example>` blocks
3. **System Prompt:** 2nd person, structured (Responsibilities, Process, Output)
4. **Tools:** Least privilege

## 4. Skills (Agent Knowledge Packs)

Specialized knowledge in `skills/skill-name/SKILL.md`.

### Progressive Disclosure

```
skill-name/
├── SKILL.md          # Core (~1500 words)
├── references/       # Details (patterns.md, advanced.md)
├── examples/         # Working code
└── scripts/          # Utilities (validate.sh)
```

### SKILL.md

```markdown
---
name: Hook Development
description: Use when "create hook", "PreToolUse", "validate tool use"...
---

To create hooks:

1. Choose event (PreToolUse...)
2. Prompt or command type

## Resources

- references/patterns.md
- examples/validate-write.sh
```

### Writing Rules

- **Imperative form:** "Validate input", not "You validate"
- **3rd person description:** "This skill when..."
- **Lean SKILL.md:** Move details to references/

### Creation Process

1. Concrete examples
2. Plan resources (scripts/refs/assets)
3. Write SKILL.md (triggers + core)
4. Add resources
5. Validate/test

## 5. Hooks (Event Automation)

`hooks/hooks.json` for event-driven scripts.

### Format (Plugin)

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write",
      "hooks": [{
        "type": "prompt",
        "prompt": "Validate safety: $TOOL_INPUT"
      }]
    }],
    "Stop": [{"matcher": "*", "hooks": [...]}]
  }
}
```

### Types

- **Prompt:** LLM reasoning (`type: "prompt"`)
- **Command:** Bash (`type: "command"`, `${CLAUDE_PLUGIN_ROOT}/script.sh`)

### Events

| Event        | Use                |
| ------------ | ------------------ |
| PreToolUse   | Block/modify tools |
| PostToolUse  | React to results   |
| Stop         | Check completion   |
| SessionStart | Load context       |

**Output JSON:** `{"decision": "approve|deny", "systemMessage": "..."}`

**Security:** Validate inputs, quote vars, timeouts.

## 6. Workflows (Compositions)

Combine components:

### Example: Feature Dev Workflow

```
commands/feature-dev.md
├── Launches agents: code-architect, code-explorer
├── Uses skills: plugin-structure, command-development
└── Hooks validate writes (PreToolUse)
```

**Pattern:**

1. Command initiates
2. Agents handle sub-tasks
3. Skills provide knowledge
4. Hooks enforce quality

## 7. Best Practices & Formula

### Universal Rules

- **Naming:** Kebab-case, descriptive
- **Paths:** `${CLAUDE_PLUGIN_ROOT}`
- **Discovery:** Standard dirs, auto-load
- **Validation:** Scripts for lint/test
- **Docs:** README + examples

### Development Workflow

```
1. Analyze requirements (concrete examples)
2. Design structure (dirs/files)
3. Implement components (frontmatter + content)
4. Add resources (refs/scripts/examples)
5. Validate (lint, test)
6. Test integration
7. Document + iterate
```

### Expert Patterns from Project

- **plugin-dev:** Self-documenting via skills
- **hookify:** Advanced prompt hooks
- **feature-dev:** Multi-agent workflows
- **ralph-wiggum:** Looping agents + hooks

## Validation Tools

Use plugin-dev scripts:

- `validate-agent.sh`
- `validate-hook-schema.sh`
- `hook-linter.sh`

## Next Steps

1. Scaffold: `/create-plugin` from plugin-dev
2. Study examples in `plugins/`
3. Test locally: `claude --plugin-dir ./my-plugin`

This formula ensures components are robust, discoverable, and follow project standards.
