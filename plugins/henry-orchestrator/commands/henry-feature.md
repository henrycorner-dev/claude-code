---
description: Orchestrate complete feature development using specialist agents from strategy to optimization
argument-hint: Feature description, goals, constraints
---

# Henry Feature Development Orchestration

You are orchestrating a complete feature development workflow using the Henry Orchestrator's 16 specialized agents. Follow a systematic, phased approach from strategy through deployment.

## Initial Context

**Feature Request:** $ARGUMENTS

## Core Principles

- **Phased progression**: Move through stages systematically
- **User confirmation**: Get approval at key decision points
- **Agent expertise**: Leverage specialized agents for each domain
- **Track progress**: Use TodoWrite throughout
- **Quality gates**: Don't skip quality/security reviews

---

## Phase 1: Discovery & Strategy

**Goal**: Understand what needs to be built and why

**Actions**:

1. Create todo list with all phases
2. Launch `product-strategist` agent to:
   - Define requirements and PRD
   - Perform RICE/ICE prioritization
   - Identify success metrics and KPIs
   - Assess market fit and user value
   - Define monetization strategy (if applicable)
3. Present strategy findings to user
4. Ask clarifying questions about:
   - Feature scope boundaries
   - Timeline and resource constraints
   - Target users and use cases
   - Integration requirements
   - Success criteria

**Wait for user confirmation before proceeding.**

---

## Phase 2: Design & User Experience

**Goal**: Design user flows, interfaces, and interactions

**Actions**:

1. Launch agents in parallel (or sequence based on complexity):
   - `ux-researcher`: User personas, journey mapping, pain points
   - `ux-ui-designer`: User flows, wireframes, prototypes
   - `ui-visual-designer`: Visual design, design system components
2. After design completion, launch `a11y-specialist` to:
   - Review designs for WCAG 2.1 AA compliance
   - Identify accessibility issues early
   - Recommend ARIA patterns and keyboard navigation
3. Present design deliverables:
   - Information architecture
   - User flows and wireframes
   - High-fidelity mockups
   - Accessibility requirements
4. Get user approval on design direction

**Wait for user confirmation before proceeding.**

---

## Phase 3: Engineering Architecture

**Goal**: Design technical implementation approach

**Actions**:

1. Based on feature scope, launch relevant engineer agents:
   - `frontend-engineer`: For UI/UX implementation
   - `backend-engineer`: For APIs, data models, business logic
   - `mobile-app-engineer`: If mobile components needed
   - `llm-agent-architect`: If AI/LLM features involved
2. Each agent should provide:
   - Architecture design and patterns
   - Technology stack recommendations
   - API contracts and data schemas
   - Integration points
   - Implementation complexity estimate
3. Present engineering approaches:
   - Recommended architecture
   - Technology choices with rationale
   - Key implementation decisions
   - Development timeline estimate
4. Ask user to confirm technical approach

**Wait for user confirmation before proceeding.**

---

## Phase 4: Quality & Security Planning

**Goal**: Ensure quality and security are built in from the start

**Actions**:

1. Launch `qa-tester` agent to:
   - Define test strategy (unit, integration, E2E)
   - Create test plan with coverage requirements
   - Identify critical test scenarios
   - Plan test automation approach
2. Launch `security-engineer` agent to:
   - Perform threat modeling (STRIDE)
   - Identify security requirements
   - Review for OWASP Top 10 vulnerabilities
   - Define security test cases
   - Check GDPR/CCPA compliance needs
3. Present quality & security requirements:
   - Test coverage goals
   - Security controls needed
   - Compliance requirements
   - Risk mitigation strategies

---

## Phase 5: Implementation Readiness

**Goal**: Final preparation before implementation

**Actions**:

1. Consolidate all planning outputs:
   - Product requirements (from product-strategist)
   - Design specifications (from design agents)
   - Technical architecture (from engineer agents)
   - Quality requirements (from qa-tester)
   - Security requirements (from security-engineer)
2. Create implementation checklist:
   - Files to create/modify
   - Dependencies to install
   - Configuration changes needed
   - Testing milestones
   - Security controls to implement
3. Ask user if they want to:
   - **Proceed with implementation now** (you continue in code mode)
   - **Get implementation guide only** (summary for later)
   - **Refine any phase** (go back to adjust)

---

## Phase 6: Performance & Optimization (Post-Implementation)

**Goal**: Ensure performance meets requirements

**Actions** (after implementation):

1. Launch `performance-engineer` agent to:
   - Audit Core Web Vitals (LCP, INP, CLS)
   - Identify performance bottlenecks
   - Review bundle size and optimization
   - Recommend caching strategies
   - Define performance budgets
2. If analytics needed, launch `data-analytics-engineer` to:
   - Design event tracking plan
   - Define metrics and dashboards
   - Set up A/B test framework (if needed)
3. Present optimization recommendations

---

## Phase 7: DevOps & Deployment

**Goal**: Plan deployment and operations

**Actions**:

1. Launch `devops-sre-architect` agent to:
   - Design CI/CD pipeline
   - Define deployment strategy (blue/green, canary)
   - Set up monitoring and observability
   - Create runbooks
   - Define SLOs/SLAs
2. If SEO considerations exist, launch `seo-specialist` to:
   - Implement structured data
   - Optimize metadata
   - Plan sitemap/robots.txt
   - Review rendering strategy
3. Present deployment plan

---

## Phase 8: Summary & Handoff

**Goal**: Document what was accomplished

**Actions**:

1. Mark all todos complete
2. Generate comprehensive summary:
   - **What was planned**: Feature scope and requirements
   - **Design decisions**: UX/UI approach and rationale
   - **Technical architecture**: Implementation approach
   - **Quality gates**: Testing and security requirements
   - **Performance targets**: Metrics and budgets
   - **Deployment plan**: How to release
   - **Key risks**: What to watch out for
   - **Next steps**: Implementation roadmap
3. Provide links to all agent outputs and artifacts
4. Suggest follow-up actions

---

## Usage Tips

- **Small features**: Can skip some phases (e.g., skip strategy for minor UI tweaks)
- **Large features**: Take time in each phase, don't rush
- **Mobile-first**: Include mobile-app-engineer early if mobile support needed
- **AI features**: Include llm-agent-architect for LLM/agent functionality
- **Game features**: Include game-systems-designer for game mechanics

## Notes

- All agents use `model: inherit` (your current model)
- Agents can be invoked explicitly: "Use product-strategist to analyze market fit"
- Some phases can run in parallel for speed
- Always wait for user approval at key decision points
- Quality and security are not optional phases

---

Use TodoWrite to track progress through all phases.
