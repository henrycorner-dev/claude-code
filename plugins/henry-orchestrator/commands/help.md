---
description: Henry Orchestrator help - commands, agents, examples
allowed-tools: ["Glob", "Read", "Grep", "Bash", "Task", "TodoWrite", "Edit", "Write", "WebFetch"]
---

# Henry Orchestrator Help

Welcome to the Henry Orchestrator Plugin! This help guide provides an overview of all commands, agents, and usage examples.

## Available Commands

### 🚀 henry-feature

**Orchestrate complete feature development from strategy to deployment**

End-to-end feature development workflow:

- Product strategy and requirements (product-strategist)
- UX/UI design (ux-researcher, ux-ui-designer, ui-visual-designer, a11y-specialist)
- Engineering architecture (frontend-engineer, backend-engineer, mobile-app-engineer)
- Quality and security (qa-tester, security-engineer)
- Performance optimization (performance-engineer)
- DevOps planning (devops-sre-architect)

**Usage:**

```
/henry-orchestrator:henry-feature Build user dashboard with analytics
```

---

### 🎨 henry-design

**Complete design workflow from research to accessibility**

Design-focused workflow:

- User research and personas (ux-researcher)
- UX design and flows (ux-ui-designer)
- Visual design (ui-visual-designer)
- Accessibility review (a11y-specialist)

**Usage:**

```
/henry-orchestrator:henry-design Design checkout flow for e-commerce app
```

---

### 📊 henry-product

**Product strategy session with market analysis and roadmapping**

Product planning and strategy:

- Market analysis and positioning (product-strategist)
- Feature prioritization and roadmap (product-strategist)
- Analytics and metrics (data-analytics-engineer)
- SEO and growth strategy (seo-specialist)

**Usage:**

```
/henry-orchestrator:henry-product AI-powered code review SaaS strategy
```

---

### 🔍 henry-review

**Multi-agent code review covering QA, security, performance**

Comprehensive code review:

- Quality and testing (qa-tester)
- Security vulnerabilities (security-engineer)
- Performance issues (performance-engineer)
- Code quality (frontend-engineer, backend-engineer)

**Usage:**

```
/henry-orchestrator:henry-review Review my staged changes
/henry-orchestrator:henry-review Security review only, focus on auth code
```

---

### 🛡️ henry-audit

**Comprehensive project audit for security, performance, accessibility, SEO, ops**

Full project health check:

- Security audit (security-engineer)
- Performance assessment (performance-engineer)
- Accessibility compliance (a11y-specialist)
- SEO optimization (seo-specialist)
- DevOps maturity (devops-sre-architect)
- Analytics quality (data-analytics-engineer)

**Usage:**

```
/henry-orchestrator:henry-audit Full audit before production launch
/henry-orchestrator:henry-audit WCAG 2.1 AA accessibility audit
```

---

### 🚢 henry-launch

**Product launch preparation with DevOps, SEO, analytics, QA, security**

Launch readiness checklist:

- Infrastructure and deployment (devops-sre-architect)
- SEO optimization (seo-specialist)
- Analytics setup (data-analytics-engineer)
- Quality assurance (qa-tester)
- Security verification (security-engineer)
- Performance validation (performance-engineer)

**Usage:**

```
/henry-orchestrator:henry-launch Production launch for web app on January 15
/henry-orchestrator:henry-launch Limited beta for mobile app
```

---

### ⚡ henry-optimize

**Optimization sprint focusing on performance and efficiency**

Performance and efficiency improvements:

- Performance baseline and optimization (performance-engineer)
- Frontend optimization (frontend-engineer)
- Backend optimization (backend-engineer)
- SEO optimization (seo-specialist)
- Analytics tracking (data-analytics-engineer)
- Cost optimization (devops-sre-architect)

**Usage:**

```
/henry-orchestrator:henry-optimize Optimize Core Web Vitals for landing page
/henry-orchestrator:henry-optimize Reduce bundle size, currently 1.2MB
```

---

### 👥 henry-team

**Assemble and run custom team of Henry agents**

Flexible agent orchestration:

- Select specific agents for your task
- Or let the system suggest appropriate agents
- Parallel or sequential execution
- Synthesis of multiple perspectives

**Usage:**

```
/henry-orchestrator:henry-team frontend-engineer performance-engineer - Review dashboard
/henry-orchestrator:henry-team Review authentication for security and UX
```

---

## Available Agents

### Product & Strategy

- **product-strategist**: Market analysis, PRD, feature prioritization (RICE/ICE), monetization, growth

### Design & User Experience

- **ux-ui-designer**: User flows, wireframes, prototypes, responsive design, WCAG AA
- **ux-researcher**: User research, personas, journey mapping, usability testing
- **ui-visual-designer**: Visual design, design systems, branding, style guides
- **a11y-specialist**: WCAG 2.1/2.2 compliance, screen reader testing, accessibility audits

### Engineering

- **frontend-engineer**: React/Vue/Angular, Next.js, performance, Core Web Vitals
- **backend-engineer**: APIs, databases, auth, caching, security (OWASP Top 10)
- **mobile-app-engineer**: iOS, Android, React Native, Flutter, offline-first
- **llm-agent-architect**: LLM systems, RAG pipelines, prompt engineering, tool-use

### Quality & Security

- **qa-tester**: Test strategy, automation, regression testing, quality metrics
- **security-engineer**: Threat modeling, OWASP Top 10, GDPR/CCPA, secure code review

### Performance & Operations

- **performance-engineer**: Core Web Vitals, bundle optimization, caching, profiling
- **devops-sre-architect**: CI/CD, IaC, deployment strategies, SLOs, observability

### Specialized Domains

- **data-analytics-engineer**: Event tracking, dashboards, A/B testing, metrics
- **seo-specialist**: Technical SEO, structured data, Core Web Vitals, rankings
- **game-systems-designer**: Game economy, progression, F2P monetization, live-ops

---

## Common Workflows

### Building a New Feature

```
1. /henry-orchestrator:henry-product - Define strategy and requirements
2. /henry-orchestrator:henry-design - Design UX/UI
3. /henry-orchestrator:henry-feature - Full implementation workflow
4. /henry-orchestrator:henry-review - Code review before merge
5. /henry-orchestrator:henry-launch - Launch preparation
```

### Pre-Launch Checklist

```
1. /henry-orchestrator:henry-audit - Comprehensive health check
2. /henry-orchestrator:henry-optimize - Performance optimization
3. /henry-orchestrator:henry-launch - Final launch prep
```

### Optimization Sprint

```
1. /henry-orchestrator:henry-optimize - Identify and fix bottlenecks
2. /henry-orchestrator:henry-review - Review optimizations
3. Monitor and iterate
```

### Custom Team Review

```
1. /henry-orchestrator:henry-team qa-tester security-engineer - Specific review
2. Address findings
3. Re-run review to verify fixes
```

---

## Quick Reference

### When to Use Each Command

| Command            | Use When                                          |
| ------------------ | ------------------------------------------------- |
| **henry-feature**  | Building a new feature end-to-end                 |
| **henry-design**   | Designing UX/UI from research to handoff          |
| **henry-product**  | Planning product strategy and roadmap             |
| **henry-review**   | Reviewing code for quality, security, performance |
| **henry-audit**    | Pre-launch health check or periodic assessment    |
| **henry-launch**   | Preparing for production deployment               |
| **henry-optimize** | Improving performance or reducing costs           |
| **henry-team**     | Custom agent combination for specific task        |

### Workflow Patterns

**Sequential (waterfall):**

```
product → design → feature → review → optimize → launch
```

**Iterative (agile):**

```
feature → review → optimize (repeat for each sprint)
product (quarterly planning)
audit (monthly)
```

**Specialized:**

```
design-only: henry-design
review-only: henry-review
optimization-only: henry-optimize
```

---

## Tips for Success

1. **Be specific**: "Optimize LCP for homepage" vs "make it faster"
2. **Provide context**: Share current metrics, pain points, constraints
3. **Set targets**: "Reduce to <2.5s" vs "improve performance"
4. **Start with scope**: Use henry-team for focused tasks, henry-feature for comprehensive
5. **Iterate**: Run commands multiple times as your project evolves
6. **Combine commands**: Use henry-product → henry-design → henry-feature for full cycle
7. **Monitor progress**: Each command uses TodoWrite to track phases

---

## Agent Invocation

### Automatic

Agents are automatically invoked by commands based on workflow phases.

### Manual

You can also invoke agents directly in any conversation:

```
"Use the security-engineer agent to review my auth code"
"Have the product-strategist prioritize features using RICE"
"Ask the a11y-specialist to audit our forms"
```

### View All Agents

```
/agents
```

Opens the agents interface to browse all 16 specialists.

---

## Getting Help

- **This guide**: `/henry-orchestrator:help`
- **All agents**: `/agents`
- **Plugin README**: [README.md](../README.md)
- **Command details**: Each command .md file has comprehensive documentation

---

## Examples by Use Case

### E-commerce

```
/henry-orchestrator:henry-product SaaS subscription model with tiered pricing
/henry-orchestrator:henry-design Checkout flow with saved payment methods
/henry-orchestrator:henry-feature Shopping cart with real-time inventory
/henry-orchestrator:henry-optimize Reduce cart page load time below 2s
```

### SaaS

```
/henry-orchestrator:henry-product Freemium to paid conversion strategy
/henry-orchestrator:henry-design Onboarding flow for new users
/henry-orchestrator:henry-audit Pre-launch security and compliance check
/henry-orchestrator:henry-launch Beta launch for 100 early users
```

### Mobile App

```
/henry-orchestrator:henry-design Mobile-first design for task management
/henry-orchestrator:henry-feature Offline-first sync for mobile app
/henry-orchestrator:henry-review Review push notification implementation
/henry-orchestrator:henry-optimize Reduce app cold start time
```

### AI/LLM Product

```
/henry-orchestrator:henry-team llm-agent-architect security-engineer - Review RAG pipeline
/henry-orchestrator:henry-feature AI code review assistant with Claude
/henry-orchestrator:henry-audit Security review for LLM prompt injection
```

---

## Command Frontmatter Reference

All commands support these frontmatter options:

- **description**: Command purpose (shown in help)
- **argument-hint**: What arguments the command accepts
- **allowed-tools**: Restrict which tools can be used (optional)

---

## Notes

- All agents use `model: inherit` (your current conversation model)
- Commands follow phased workflows with user confirmations
- TodoWrite tracks progress through all phases
- Agents can run in parallel (faster) or sequential (clearer)
- Each command produces comprehensive documentation and artifacts

---

## Version

Henry Orchestrator Plugin v1.0.0

For more details, see the [plugin README](../README.md) or visit specific command files in the commands/ directory.
