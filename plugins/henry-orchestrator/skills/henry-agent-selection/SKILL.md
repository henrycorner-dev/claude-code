---
name: henry-agent-selection
version: '1.0.0'
description: Guide for selecting optimal Henry Orchestrator agent(s) based on task phase, domain, and requirements. Use when the user needs specialist input (design, security, performance, product strategy) but hasn't specified which agent to use, or when multiple agents might be needed for a complex task. Examples - <example>Context - User wants to optimize a React dashboard for performance; user - "Optimize my React dashboard performance"; assistant - "I'll invoke the performance-engineer to analyze Core Web Vitals and bundle size, then work with the frontend-engineer to implement optimizations"; <commentary>Performance optimization requires both performance expertise to identify issues and frontend expertise to implement fixes</commentary></example> <example>Context - User needs to design a new checkout flow; user - "Design a checkout flow for our e-commerce app"; assistant - "I'll use the ux-researcher to understand user needs and pain points, then have the ux-ui-designer create flows and wireframes, followed by the a11y-specialist to ensure WCAG compliance"; <commentary>Complete design workflow requires research, UX design, and accessibility review</commentary></example>
allowed-tools: codebase_search, list_code_definition_names
---

# Henry Agent Selection

This skill helps you select the optimal Henry Orchestrator agent(s) for any software development task. The Henry Orchestrator provides 16 specialized agents across product strategy, design, engineering, quality, and operations domains.

## Quick Decision Guide

### By Primary Task Type

**Strategy & Planning** → product-strategist
**User Research** → ux-researcher
**UX/UI Design** → ux-ui-designer
**Visual Design** → ui-visual-designer
**Accessibility** → a11y-specialist
**Frontend Development** → frontend-engineer
**Backend Development** → backend-engineer
**Mobile Development** → mobile-app-engineer
**AI/LLM Features** → llm-agent-architect
**Testing & QA** → qa-tester
**Security** → security-engineer
**Performance** → performance-engineer
**DevOps/Infrastructure** → devops-sre-architect
**Analytics** → data-analytics-engineer
**SEO** → seo-specialist
**Game Design** → game-systems-designer

> For detailed agent capabilities, expertise areas, and selection criteria, see [references/agent-capabilities.md](references/agent-capabilities.md)

## Agent Overview by Domain

**Product & Strategy**: product-strategist
**Design & UX**: ux-ui-designer, ux-researcher, ui-visual-designer, a11y-specialist
**Engineering**: frontend-engineer, backend-engineer, mobile-app-engineer, llm-agent-architect
**Quality & Security**: qa-tester, security-engineer
**Performance & Operations**: performance-engineer, devops-sre-architect
**Specialized**: data-analytics-engineer, seo-specialist, game-systems-designer

## Selection Process

### Step 1: Identify Task Phase

| Phase              | Primary Agents                                                                | Supporting Agents                                                                           |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Strategy**       | product-strategist                                                            | data-analytics-engineer, seo-specialist                                                     |
| **Research**       | ux-researcher                                                                 | product-strategist                                                                          |
| **Design**         | ux-ui-designer                                                                | ux-researcher, ui-visual-designer, a11y-specialist                                          |
| **Architecture**   | backend-engineer, frontend-engineer, mobile-app-engineer, llm-agent-architect | devops-sre-architect                                                                        |
| **Implementation** | frontend-engineer, backend-engineer, mobile-app-engineer                      | performance-engineer                                                                        |
| **Quality**        | qa-tester, security-engineer                                                  | a11y-specialist                                                                             |
| **Optimization**   | performance-engineer                                                          | frontend-engineer, backend-engineer, seo-specialist                                         |
| **Launch**         | devops-sre-architect                                                          | qa-tester, security-engineer, performance-engineer, seo-specialist, data-analytics-engineer |

### Step 2: Determine Domain Focus

**Product/Business**: product-strategist, data-analytics-engineer, seo-specialist  
**User Experience**: ux-researcher, ux-ui-designer, ui-visual-designer, a11y-specialist  
**Frontend**: frontend-engineer, performance-engineer, seo-specialist  
**Backend**: backend-engineer, security-engineer, devops-sre-architect  
**Mobile**: mobile-app-engineer, performance-engineer  
**AI/LLM**: llm-agent-architect, security-engineer  
**Quality**: qa-tester, security-engineer, performance-engineer, a11y-specialist  
**Gaming**: game-systems-designer, data-analytics-engineer

### Step 3: Assess Complexity

**Simple tasks** (1 agent):

- Code review → qa-tester
- API design → backend-engineer
- SEO audit → seo-specialist

**Medium tasks** (2-3 agents):

- Performance optimization → performance-engineer + frontend-engineer
- Security review → security-engineer + qa-tester
- UX design → ux-researcher + ux-ui-designer

**Complex tasks** (4+ agents):

- Full feature development → product-strategist + ux-ui-designer + frontend-engineer + backend-engineer + qa-tester + security-engineer
- Pre-launch audit → security-engineer + performance-engineer + a11y-specialist + seo-specialist + devops-sre-architect

## Common Selection Patterns

### Pattern: Performance Optimization

**Agents**: performance-engineer (lead), frontend-engineer, backend-engineer  
**Sequence**: Performance engineer identifies bottlenecks → Frontend/backend engineers implement fixes  
**Use for**: Meeting Core Web Vitals, reducing load times, bundle optimization

### Pattern: Complete Feature Development

**Agents**: product-strategist → ux-ui-designer → frontend-engineer + backend-engineer → qa-tester → security-engineer → performance-engineer  
**Sequence**: Strategy → Design → Implementation → Testing → Security → Optimization  
**Use for**: New features from concept to production

### Pattern: Security Review

**Agents**: security-engineer (lead), qa-tester, backend-engineer  
**Sequence**: Security engineer performs threat modeling → QA creates security test cases → Backend engineer implements fixes  
**Use for**: Security audits, vulnerability assessment, compliance

### Pattern: Design Workflow

**Agents**: ux-researcher → ux-ui-designer → ui-visual-designer → a11y-specialist  
**Sequence**: Research → UX → Visual → Accessibility  
**Use for**: Complete design from user research to accessible implementation

### Pattern: Launch Preparation

**Agents**: devops-sre-architect + seo-specialist + data-analytics-engineer + qa-tester + security-engineer + performance-engineer  
**Sequence**: Parallel audits across all domains  
**Use for**: Pre-launch readiness checks, go/no-go decisions

## Selection Examples

For detailed real-world scenarios with step-by-step reasoning, agent sequencing, and expected deliverables, see [examples/selection-scenarios.md](examples/selection-scenarios.md)

**Quick Examples:**

- **Performance issues** → performance-engineer + frontend-engineer
- **Security review** → security-engineer + backend-engineer + qa-tester
- **New feature design** → ux-researcher + ux-ui-designer + a11y-specialist
- **Full feature development** → product-strategist + ux-ui-designer + frontend-engineer + backend-engineer
- **Pre-launch audit** → security-engineer + performance-engineer + qa-tester + a11y-specialist + devops-sre-architect (parallel)

## Quick Selection Reference

| User Need         | Primary Agent           | Add if...                                                              |
| ----------------- | ----------------------- | ---------------------------------------------------------------------- |
| Strategy/planning | product-strategist      | + data-analytics-engineer (metrics), seo-specialist (growth)           |
| UX design         | ux-ui-designer          | + ux-researcher (research), a11y-specialist (accessibility)            |
| Frontend dev      | frontend-engineer       | + performance-engineer (optimization), seo-specialist (SEO)            |
| Backend dev       | backend-engineer        | + security-engineer (security), devops-sre-architect (ops)             |
| Mobile dev        | mobile-app-engineer     | + ux-ui-designer (design), performance-engineer (performance)          |
| Testing           | qa-tester               | + security-engineer (security tests), a11y-specialist (a11y tests)     |
| Security          | security-engineer       | + qa-tester (test cases), backend-engineer (implementation)            |
| Performance       | performance-engineer    | + frontend-engineer (frontend), backend-engineer (backend)             |
| DevOps            | devops-sre-architect    | + security-engineer (security), performance-engineer (SLOs)            |
| Analytics         | data-analytics-engineer | + product-strategist (metrics), seo-specialist (tracking)              |
| SEO               | seo-specialist          | + frontend-engineer (implementation), performance-engineer (CWV)       |
| Accessibility     | a11y-specialist         | + ux-ui-designer (design), frontend-engineer (implementation)          |
| AI/LLM            | llm-agent-architect     | + security-engineer (safety), backend-engineer (infrastructure)        |
| Game design       | game-systems-designer   | + data-analytics-engineer (balancing), mobile-app-engineer (if mobile) |

## Best Practices

1. **Start with one agent** for simple, focused tasks
2. **Add agents sequentially** for complex workflows (strategy → design → implementation)
3. **Use parallel agents** for comprehensive reviews (security + performance + QA simultaneously)
4. **Always include qa-tester** for production code changes
5. **Always include security-engineer** for authentication, payments, or sensitive data
6. **Always include a11y-specialist** for user-facing interfaces
7. **Combine frontend-engineer + performance-engineer** for performance-critical UIs
8. **Combine backend-engineer + security-engineer** for APIs and data handling

## Integration with Henry Commands

The `/henry-orchestrator:henry-team` command uses this selection logic. You can also manually invoke agents or use the other orchestration commands:

- `/henry-orchestrator:henry-feature` - Full feature workflow (auto-selects appropriate agents)
- `/henry-orchestrator:henry-design` - Design workflow (design team agents)
- `/henry-orchestrator:henry-review` - Code review (QA, security, performance agents)
- `/henry-orchestrator:henry-audit` - Comprehensive audit (quality agents)
- `/henry-orchestrator:henry-launch` - Launch prep (ops, security, performance agents)
- `/henry-orchestrator:henry-optimize` - Optimization (performance, engineering agents)

Refer to `/henry-orchestrator:help` for complete command documentation.

## Further Reading

For comprehensive information on agent selection:

- **[references/agent-capabilities.md](references/agent-capabilities.md)** - Detailed agent specifications, expertise areas, capability matrix, and skill combinations
- **[examples/selection-scenarios.md](examples/selection-scenarios.md)** - 10 real-world scenarios with analysis, agent selection reasoning, sequencing, and expected deliverables
