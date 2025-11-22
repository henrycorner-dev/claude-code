# Agent Selection Scenarios

This document provides real-world examples of agent selection with detailed reasoning and decision-making processes.

## Scenario 1: E-commerce Checkout Performance Issues

**User Request:** "Our checkout page is slow and users are dropping off. Fix the performance issues."

### Analysis

- **Domain**: Frontend performance
- **Task type**: Performance optimization, user experience
- **Complexity**: Medium (requires both diagnosis and implementation)
- **User impact**: High (affects conversion rate)

### Selected Agents

1. **performance-engineer** (Lead)
2. **frontend-engineer** (Implementation)
3. **data-analytics-engineer** (Metrics tracking)

### Reasoning

- **performance-engineer leads** because the primary issue is performance optimization. They'll audit Core Web Vitals (LCP, INP, CLS), analyze bundle size, identify render-blocking resources, and profile JavaScript execution.
- **frontend-engineer implements** the fixes identified by the performance engineer, such as code splitting, lazy loading, optimizing images, and reducing JavaScript bundle size.
- **data-analytics-engineer tracks** checkout funnel metrics before and after optimization to measure impact on conversion rate.

### Sequence

1. Performance engineer performs audit (1-2 days)
2. Frontend engineer implements optimizations (2-3 days)
3. Data analytics engineer validates impact with A/B test (ongoing)

### Expected Deliverables

- Performance audit report with specific bottlenecks
- Optimized checkout implementation
- Conversion rate metrics and analysis

---

## Scenario 2: Authentication System Security Review

**User Request:** "Review our JWT authentication implementation for security vulnerabilities before launch."

### Analysis

- **Domain**: Security, backend
- **Task type**: Security audit, code review
- **Complexity**: Medium-high (security-critical component)
- **Risk level**: High (authentication vulnerability = critical incident)

### Selected Agents

1. **security-engineer** (Lead)
2. **backend-engineer** (Code review & remediation)
3. **qa-tester** (Security test cases)

### Reasoning

- **security-engineer leads** because this is a security-critical component. They'll perform threat modeling (STRIDE), review for OWASP Top 10 vulnerabilities, check token handling, session management, password storage, and rate limiting.
- **backend-engineer reviews** the implementation against best practices and implements security fixes identified by the security engineer.
- **qa-tester creates** security-specific test cases including penetration testing scenarios, edge cases, and automated security tests for CI/CD.

### Sequence

1. Security engineer performs threat modeling and code review (1-2 days)
2. Backend engineer implements security fixes (1-2 days)
3. QA tester creates and executes security test suite (1-2 days)
4. Security engineer verifies fixes (0.5 days)

### Expected Deliverables

- Threat model documentation (STRIDE analysis)
- Security vulnerability report with remediation steps
- Secure authentication implementation
- Automated security test suite

---

## Scenario 3: New Mobile Onboarding Flow

**User Request:** "Users are confused during mobile app onboarding. Design a better experience."

### Analysis

- **Domain**: UX design, mobile development, analytics
- **Task type**: User research → Design → Implementation → Measurement
- **Complexity**: High (requires full design workflow)
- **User impact**: High (affects user activation and retention)

### Selected Agents

1. **ux-researcher** (Research phase)
2. **ux-ui-designer** (Design phase)
3. **mobile-app-engineer** (Implementation phase)
4. **data-analytics-engineer** (Measurement phase)

### Reasoning

- **ux-researcher starts** by understanding why users are confused: conducting user interviews, analyzing drop-off points, creating journey maps, and identifying pain points in the current onboarding.
- **ux-ui-designer creates** the new onboarding flow based on research insights: user flows, wireframes, prototypes, ensuring mobile-first design patterns and platform-specific conventions.
- **mobile-app-engineer implements** the design using platform-specific best practices (iOS/Android patterns), including animations, gestures, and offline-first considerations.
- **data-analytics-engineer instruments** the onboarding funnel to track completion rate, time-to-complete, and drop-off points for ongoing optimization.

### Sequence

1. UX researcher conducts research (2-3 days)
2. UX/UI designer creates flows and prototypes (3-4 days)
3. Mobile app engineer implements (4-5 days)
4. Data analytics engineer sets up tracking (1 day)
5. Iterative optimization based on metrics (ongoing)

### Expected Deliverables

- User research report with pain points
- Journey maps and personas
- Interactive prototype
- Implemented onboarding flow (iOS & Android)
- Analytics dashboard tracking key metrics

---

## Scenario 4: Dashboard with Real-time Data Visualization

**User Request:** "Build an admin dashboard that shows real-time metrics for our platform."

### Analysis

- **Domain**: Full-stack development, product strategy
- **Task type**: Feature development (strategy → design → implementation)
- **Complexity**: High (requires product planning, design, full-stack work)
- **Technical challenges**: Real-time data, visualization, performance

### Selected Agents

1. **product-strategist** (Requirements phase)
2. **ux-ui-designer** (Design phase)
3. **frontend-engineer** (Frontend implementation)
4. **backend-engineer** (Backend/real-time implementation)
5. **performance-engineer** (Optimization phase)

### Reasoning

- **product-strategist defines** requirements: which metrics to show, user personas (admins, managers), prioritization of features, success criteria (North Star metrics).
- **ux-ui-designer creates** the dashboard layout: information hierarchy, data visualization patterns, responsive design, interactive filters and drill-downs.
- **frontend-engineer builds** the UI: React components, real-time data updates (WebSocket/SSE), charting libraries, state management.
- **backend-engineer implements** the data pipeline: real-time data streaming, aggregation logic, WebSocket/SSE API, caching strategy.
- **performance-engineer optimizes** real-time data handling, chart rendering performance, bundle size, and ensures the dashboard remains responsive with large datasets.

### Sequence

1. Product strategist defines requirements and metrics (2 days)
2. UX/UI designer creates dashboard layout (3-4 days)
3. Backend engineer implements data pipeline and API (4-5 days, parallel)
4. Frontend engineer builds UI components (4-5 days, parallel)
5. Performance engineer optimizes (2 days)

### Expected Deliverables

- PRD with dashboard requirements and metrics
- Dashboard design with data visualization specs
- Real-time data API (WebSocket/SSE)
- Interactive dashboard UI
- Performance-optimized implementation

---

## Scenario 5: SEO Optimization for SaaS Marketing Site

**User Request:** "Our marketing site isn't ranking well in search. Improve our SEO."

### Analysis

- **Domain**: SEO, frontend, performance
- **Task type**: Technical SEO audit → Implementation
- **Complexity**: Medium (requires SEO expertise and technical implementation)
- **Business impact**: High (affects organic traffic and customer acquisition)

### Selected Agents

1. **seo-specialist** (Lead)
2. **frontend-engineer** (Implementation)
3. **performance-engineer** (Core Web Vitals)

### Reasoning

- **seo-specialist leads** the SEO audit: technical SEO analysis, structured data implementation (JSON-LD), metadata optimization, sitemap/robots.txt, crawlability, internal linking.
- **frontend-engineer implements** SEO improvements: SSR/ISR for better indexing, semantic HTML, meta tags, OpenGraph tags, canonical URLs, sitemap generation.
- **performance-engineer optimizes** Core Web Vitals (LCP, INP, CLS) because they're SEO ranking factors, focusing on image optimization, lazy loading, code splitting.

### Sequence

1. SEO specialist performs comprehensive audit (1-2 days)
2. Frontend engineer implements technical SEO improvements (2-3 days, parallel)
3. Performance engineer optimizes Core Web Vitals (1-2 days, parallel)
4. SEO specialist verifies implementation and monitors rankings (ongoing)

### Expected Deliverables

- SEO audit report with actionable recommendations
- Technical SEO implementation (structured data, meta tags, SSR)
- Core Web Vitals optimization
- Improved search rankings and organic traffic (measured over time)

---

## Scenario 6: Feature Prioritization for Product Roadmap

**User Request:** "We have 20 feature ideas. Help us prioritize what to build next quarter."

### Analysis

- **Domain**: Product strategy
- **Task type**: Strategic planning, prioritization
- **Complexity**: Medium (requires business analysis)
- **Stakeholders**: Product team, engineering, executives

### Selected Agents

1. **product-strategist** (Lead)
2. **data-analytics-engineer** (Data support)

### Reasoning

- **product-strategist leads** prioritization: applies frameworks (RICE, ICE, Kano), conducts competitive analysis, evaluates business impact (CAC/LTV), considers strategic alignment with North Star metrics.
- **data-analytics-engineer provides** data-driven insights: user behavior analysis, feature usage data, conversion funnels, A/B test results to inform prioritization decisions.

### Sequence

1. Product strategist facilitates prioritization workshop (1 day)
2. Data analytics engineer provides usage data and insights (0.5 days)
3. Product strategist creates prioritized roadmap with rationale (1 day)

### Expected Deliverables

- Feature prioritization matrix (RICE/ICE scores)
- Quarterly roadmap with rationale
- Business case for top-priority features

### Why NOT to include other agents

- **No designers yet**: Prioritization happens before design
- **No engineers yet**: Technical feasibility assessment can come later
- **Focus on strategy**: Keep this phase lightweight and strategic

---

## Scenario 7: Accessibility Compliance for Government Contract

**User Request:** "We need WCAG 2.1 AA compliance for a government contract. Audit our app and fix issues."

### Analysis

- **Domain**: Accessibility, compliance
- **Task type**: Audit → Remediation → Verification
- **Complexity**: Medium-high (requires specialized accessibility knowledge)
- **Risk level**: High (contract compliance requirement)

### Selected Agents

1. **a11y-specialist** (Lead)
2. **ux-ui-designer** (Design remediation)
3. **frontend-engineer** (Implementation)
4. **qa-tester** (Automated testing)

### Reasoning

- **a11y-specialist leads** the accessibility audit: WCAG 2.1 AA compliance review, screen reader testing (NVDA, JAWS, VoiceOver), keyboard navigation, color contrast, ARIA implementation.
- **ux-ui-designer addresses** design-level accessibility issues: color contrast fixes, visual focus indicators, alternative design patterns for inaccessible components.
- **frontend-engineer implements** accessibility fixes: semantic HTML, ARIA labels, keyboard navigation, focus management, skip links.
- **qa-tester creates** automated accessibility tests: integrate axe-core, implement CI/CD accessibility checks, create regression test suite.

### Sequence

1. A11y specialist performs comprehensive audit (2-3 days)
2. UX/UI designer creates accessible design solutions (1-2 days)
3. Frontend engineer implements fixes (3-5 days)
4. QA tester sets up automated testing (1 day)
5. A11y specialist verifies compliance (1 day)

### Expected Deliverables

- WCAG 2.1 AA compliance audit report
- Accessibility remediation plan
- Compliant implementation
- Automated accessibility test suite
- Compliance documentation for government contract

---

## Scenario 8: Game Economy Balancing for F2P Mobile Game

**User Request:** "Our game economy is broken. Players are progressing too fast and not spending money."

### Analysis

- **Domain**: Game design, analytics, monetization
- **Task type**: Economy analysis → Rebalancing → Measurement
- **Complexity**: High (requires game design expertise and data analysis)
- **Business impact**: Critical (affects revenue)

### Selected Agents

1. **game-systems-designer** (Lead)
2. **data-analytics-engineer** (Player behavior analysis)
3. **mobile-app-engineer** (Implementation)

### Reasoning

- **game-systems-designer leads** economy rebalancing: analyzes currency systems, progression curves, monetization touchpoints, designs ethical monetization, creates economy models.
- **data-analytics-engineer analyzes** player behavior: progression rates, spending patterns, churn analysis, identifies whales vs. non-payers, creates player segments.
- **mobile-app-engineer implements** economy changes: adjusts reward rates, implements new monetization features, ensures changes work across iOS/Android.

### Sequence

1. Data analytics engineer provides player behavior analysis (1-2 days)
2. Game systems designer creates rebalancing proposal (2-3 days)
3. Mobile app engineer implements changes (2-3 days)
4. A/B test new economy with subset of players (2-3 weeks)
5. Iterate based on results (ongoing)

### Expected Deliverables

- Player behavior analysis report
- Economy rebalancing proposal with progression curves
- Implemented economy changes
- A/B test results and revenue impact analysis

---

## Scenario 9: Pre-launch Production Readiness Review

**User Request:** "We're launching our MVP next week. Do a comprehensive review to make sure we're ready."

### Analysis

- **Domain**: Multi-domain (security, performance, quality, operations)
- **Task type**: Comprehensive audit across all domains
- **Complexity**: High (requires multiple specialist perspectives)
- **Risk level**: Critical (pre-launch)

### Selected Agents (Parallel Execution)

1. **security-engineer** (Security audit)
2. **performance-engineer** (Performance audit)
3. **qa-tester** (Quality audit)
4. **a11y-specialist** (Accessibility audit)
5. **devops-sre-architect** (Infrastructure readiness)
6. **seo-specialist** (SEO readiness)

### Reasoning

- **All agents work in parallel** to conduct domain-specific audits
- **security-engineer**: Threat modeling, vulnerability assessment, OWASP review
- **performance-engineer**: Core Web Vitals, load testing, performance budgets
- **qa-tester**: Test coverage analysis, bug triage, release testing
- **a11y-specialist**: WCAG compliance check, accessibility testing
- **devops-sre-architect**: Infrastructure review, monitoring, rollback plan, SLO/SLA definition
- **seo-specialist**: Technical SEO, structured data, crawlability

### Sequence

1. All agents conduct parallel audits (2-3 days)
2. Compile findings into launch readiness report (0.5 days)
3. Prioritize critical issues (0.5 days)
4. Implement high-priority fixes (2-3 days)
5. Final verification (1 day)
6. Go/no-go decision

### Expected Deliverables

- Comprehensive launch readiness report
- Security audit findings
- Performance benchmark results
- Test coverage report
- Accessibility compliance status
- Infrastructure runbook
- SEO implementation checklist
- Prioritized remediation backlog
- Go/no-go recommendation

### Why this pattern works

- **Parallel execution** ensures comprehensive coverage without timeline extension
- **Multiple perspectives** catch issues that single-domain reviews miss
- **Risk mitigation** before launch prevents costly post-launch incidents

---

## Scenario 10: LLM-Powered Chat Feature

**User Request:** "Add an AI chat assistant to our app using Claude API."

### Analysis

- **Domain**: AI/LLM, backend, frontend, security
- **Task type**: Feature development with LLM integration
- **Complexity**: High (requires LLM expertise, safety mechanisms)
- **Risk considerations**: Safety, cost, latency, user experience

### Selected Agents

1. **llm-agent-architect** (Lead)
2. **backend-engineer** (API integration)
3. **frontend-engineer** (Chat UI)
4. **security-engineer** (Safety & security review)

### Reasoning

- **llm-agent-architect leads** the LLM implementation: system prompt design, tool-use architecture, evaluation framework, safety mechanisms (content filtering, rate limiting), cost optimization.
- **backend-engineer implements** the API layer: Claude API integration, streaming responses, conversation history management, caching strategy, error handling.
- **frontend-engineer builds** the chat UI: message threading, streaming UI updates, markdown rendering, loading states, error handling.
- **security-engineer reviews** for safety: prompt injection prevention, PII handling, content filtering, rate limiting, abuse prevention.

### Sequence

1. LLM agent architect designs chat architecture (2 days)
2. Backend engineer implements API integration (2-3 days, parallel)
3. Frontend engineer builds chat UI (2-3 days, parallel)
4. Security engineer conducts safety review (1 day)
5. LLM agent architect optimizes prompts and evaluates (1-2 days)

### Expected Deliverables

- LLM chat architecture document
- System prompt and evaluation framework
- Chat API with streaming support
- Chat UI component
- Safety and security review
- Cost analysis and optimization plan

---

## Decision Patterns Summary

### Single Agent Scenarios

Use when task is clearly within one domain:

- Code review → qa-tester
- SEO audit → seo-specialist
- Threat modeling → security-engineer

### Two-Agent Scenarios

Use for implementation workflows:

- Performance optimization → performance-engineer + frontend-engineer
- Security review → security-engineer + backend-engineer
- Visual design → ux-ui-designer + ui-visual-designer

### Multi-Agent Scenarios (3-4)

Use for complete feature workflows:

- New feature → product-strategist + ux-ui-designer + frontend-engineer + backend-engineer
- Design workflow → ux-researcher + ux-ui-designer + a11y-specialist
- Mobile feature → ux-ui-designer + mobile-app-engineer + data-analytics-engineer

### Comprehensive Audits (5+)

Use for pre-launch or major reviews:

- Launch readiness → security + performance + QA + a11y + devops + SEO (parallel)
- Complete feature audit → All relevant domain specialists

### Key Selection Principles

1. **Start with the primary domain** (the core expertise needed)
2. **Add implementation support** (engineers to implement recommendations)
3. **Include quality gates** (QA, security, accessibility where applicable)
4. **Consider measurement** (analytics to track impact)
5. **Think in workflows** (research → design → implement → measure)
6. **Use parallel execution** for comprehensive reviews
7. **Don't over-engineer** simple tasks
