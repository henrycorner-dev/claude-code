# Henry Orchestrator Agent Capabilities Reference

This document provides detailed specifications for all 16 Henry Orchestrator agents, including their use cases, expertise areas, and when to select them.

## Product & Strategy

### product-strategist

- **Use for**: Market analysis, PRD development, feature prioritization (RICE/ICE/Kano), monetization strategy, growth planning, North Star metrics
- **Expertise**: TAM/SAM/SOM sizing, competitive analysis, unit economics (CAC/LTV), AARRR growth framework
- **When to select**: Product planning, roadmapping, business strategy, pricing decisions
- **Output deliverables**: PRDs, market analysis reports, feature prioritization matrices, business cases
- **Typical engagement**: 2-5 days for strategy docs, 1-2 days for prioritization exercises

## Design & User Experience

### ux-ui-designer

- **Use for**: User flows, wireframes, prototypes, responsive design, WCAG 2.1 AA accessibility
- **Expertise**: Information architecture, interaction design, mobile-first design, design systems
- **When to select**: Complete UX/UI design from IA to high-fidelity implementation
- **Output deliverables**: User flows, wireframes, interactive prototypes, design specifications
- **Typical engagement**: 3-7 days for complete feature design

### ux-researcher

- **Use for**: User research, personas, journey mapping, usability testing, heuristic evaluation
- **Expertise**: Research planning, user interviews, pain point analysis
- **When to select**: Understanding user needs before design, validating designs with users
- **Output deliverables**: Research plans, user personas, journey maps, usability reports
- **Typical engagement**: 2-5 days for research studies

### ui-visual-designer

- **Use for**: Visual design, branding, design system creation, style guides, icon design
- **Expertise**: Visual hierarchy, color theory, typography, brand implementation
- **When to select**: Polishing visual design, creating/extending design systems
- **Output deliverables**: Style guides, design tokens, component libraries, brand guidelines
- **Typical engagement**: 2-4 days for design systems, 1-2 days for visual polish

### a11y-specialist

- **Use for**: WCAG 2.1/2.2 compliance audits, screen reader testing, keyboard navigation
- **Expertise**: ARIA implementation, color contrast validation, focus management
- **When to select**: Accessibility reviews, remediation planning, compliance verification
- **Output deliverables**: Accessibility audit reports, remediation plans, compliance documentation
- **Typical engagement**: 1-3 days for audits, ongoing for remediation support

## Engineering

### frontend-engineer

- **Use for**: React, Vue, Angular, Next.js development, Core Web Vitals optimization, state management
- **Expertise**: SPA/SSR/ISR architecture, performance optimization, modern CSS, TypeScript
- **When to select**: Building web UIs, frontend performance optimization, component libraries
- **Key technologies**: React, Next.js, TypeScript, Tailwind, Vite, Webpack
- **Typical engagement**: Varies by feature complexity (1-10 days)

### backend-engineer

- **Use for**: REST/GraphQL APIs, database design, authentication (JWT, OAuth), caching, security
- **Expertise**: OWASP Top 10, performance tuning, observability, distributed systems
- **When to select**: API development, backend architecture, database schema design
- **Key technologies**: Node.js, Python, Go, PostgreSQL, Redis, Docker
- **Typical engagement**: Varies by feature complexity (1-10 days)

### mobile-app-engineer

- **Use for**: iOS, Android, React Native, Flutter development, offline-first architecture
- **Expertise**: Platform-specific optimization, app store compliance, mobile security
- **When to select**: Mobile app development, cross-platform architecture, app store releases
- **Key technologies**: React Native, Flutter, Swift, Kotlin, native APIs
- **Typical engagement**: Varies by feature complexity (2-10 days)

### llm-agent-architect

- **Use for**: LLM systems, prompt engineering, RAG pipelines, tool-use architectures
- **Expertise**: System prompt design, evaluation frameworks, safety mechanisms, cost optimization
- **When to select**: Building LLM-powered features, agent architectures, prompt optimization
- **Key technologies**: Claude, OpenAI APIs, LangChain, vector databases, prompt libraries
- **Typical engagement**: 2-7 days for agent systems, 1-2 days for prompt optimization

## Quality & Security

### qa-tester

- **Use for**: Test strategy, test automation (70% unit, 20% integration, 10% E2E), quality metrics
- **Expertise**: Risk-based testing, CI/CD integration, bug analysis, flaky test prevention
- **When to select**: Test planning, test automation, quality assurance workflows
- **Key technologies**: Jest, Vitest, Playwright, Cypress, Testing Library
- **Typical engagement**: 1-3 days for test strategy, ongoing for implementation

### security-engineer

- **Use for**: Threat modeling (STRIDE, PASTA), OWASP Top 10 review, vulnerability assessment, compliance
- **Expertise**: Secure code review, GDPR/CCPA compliance, CVE scanning, penetration testing
- **When to select**: Security reviews, threat modeling, compliance assessment
- **Key technologies**: OWASP tools, security scanners, penetration testing tools
- **Typical engagement**: 1-3 days for security audits, ongoing for remediation

## Performance & Operations

### performance-engineer

- **Use for**: Core Web Vitals optimization, bundle analysis, caching strategies, profiling
- **Expertise**: LCP/INP/CLS optimization, image optimization, performance budgets
- **When to select**: Performance audits, optimization sprints, meeting performance targets
- **Key technologies**: Lighthouse, WebPageTest, Chrome DevTools, performance profilers
- **Typical engagement**: 1-3 days for audits, 2-5 days for optimization

### devops-sre-architect

- **Use for**: CI/CD pipelines, Infrastructure as Code, deployment strategies, SLO/SLA definition
- **Expertise**: Terraform, GitOps, observability, DORA metrics, chaos engineering
- **When to select**: DevOps setup, deployment planning, reliability engineering
- **Key technologies**: Terraform, Kubernetes, GitHub Actions, DataDog, Prometheus
- **Typical engagement**: 2-5 days for infrastructure setup, ongoing for optimization

## Specialized Domains

### data-analytics-engineer

- **Use for**: Event tracking, dashboards, A/B testing, metrics governance
- **Expertise**: Privacy-compliant analytics, statistical analysis, experiment design
- **When to select**: Analytics instrumentation, A/B test setup, metrics definition
- **Key technologies**: Segment, Amplitude, Mixpanel, dbt, SQL
- **Typical engagement**: 1-3 days for analytics setup, ongoing for experimentation

### seo-specialist

- **Use for**: Technical SEO, structured data (JSON-LD), Core Web Vitals for SEO, crawlability
- **Expertise**: Metadata optimization, sitemap/robots.txt, SSR/ISR for SEO
- **When to select**: SEO audits, search visibility optimization, content strategy
- **Key technologies**: Google Search Console, Screaming Frog, schema.org, SEO tools
- **Typical engagement**: 1-2 days for audits, 2-4 days for implementation

### game-systems-designer

- **Use for**: Game economy, progression systems, F2P monetization, live-ops
- **Expertise**: Currency systems, battle pass design, ethical monetization
- **When to select**: Game design, economy balancing, monetization planning
- **Key technologies**: Game economy modeling tools, analytics platforms
- **Typical engagement**: 3-7 days for economy design, ongoing for balancing

## Agent Capability Matrix

| Agent                   | Primary Domain | Secondary Domains        | Tool Access         | Autonomy Level |
| ----------------------- | -------------- | ------------------------ | ------------------- | -------------- |
| product-strategist      | Strategy       | Business, Analytics      | Research, analysis  | High           |
| ux-ui-designer          | Design         | Accessibility, Frontend  | Design, prototyping | High           |
| ux-researcher           | Research       | Design, Strategy         | Research, analysis  | Medium         |
| ui-visual-designer      | Visual Design  | Branding, Systems        | Design tools        | Medium         |
| a11y-specialist         | Accessibility  | Design, Frontend         | Testing, audit      | Medium         |
| frontend-engineer       | Frontend Dev   | Performance, UX          | Code, build tools   | Very High      |
| backend-engineer        | Backend Dev    | Security, Data           | Code, databases     | Very High      |
| mobile-app-engineer     | Mobile Dev     | Performance, UX          | Code, native tools  | Very High      |
| llm-agent-architect     | AI/LLM         | Backend, Architecture    | LLM APIs, tools     | Very High      |
| qa-tester               | Testing        | Quality, Security        | Test frameworks     | High           |
| security-engineer       | Security       | Compliance, Backend      | Security tools      | High           |
| performance-engineer    | Performance    | Frontend, Backend        | Profiling tools     | High           |
| devops-sre-architect    | DevOps/SRE     | Infrastructure, Security | IaC, monitoring     | Very High      |
| data-analytics-engineer | Analytics      | Product, Strategy        | Analytics platforms | High           |
| seo-specialist          | SEO            | Frontend, Content        | SEO tools           | Medium         |
| game-systems-designer   | Game Design    | Analytics, Mobile        | Modeling tools      | Medium         |

## Skill Combinations

### Common Pairing Patterns

**Frontend + Performance**

- Best for: Performance-critical UIs, Core Web Vitals optimization
- Sequence: Performance engineer identifies bottlenecks → Frontend engineer implements fixes

**Backend + Security**

- Best for: API development, data handling, authentication
- Sequence: Backend engineer designs architecture → Security engineer reviews → Backend engineer implements

**UX Research + UX/UI Design**

- Best for: User-centered design workflows
- Sequence: UX researcher gathers insights → UX/UI designer creates solutions

**Product + Design + Engineering**

- Best for: Complete feature development
- Sequence: Product strategist defines requirements → Designer creates UX → Engineers implement

**QA + Security + Performance**

- Best for: Pre-launch audits
- Sequence: Parallel audits across all three domains

### Anti-Patterns to Avoid

1. **Skipping research**: Don't go straight to design without understanding user needs
2. **Missing security review**: Always include security engineer for auth, payments, or sensitive data
3. **Ignoring accessibility**: Include a11y-specialist for all user-facing interfaces
4. **Solo implementation**: Complex features benefit from multiple specialist perspectives
5. **Missing QA**: Production code changes should always include qa-tester review

## Selection Decision Tree

```
Is this a strategy/planning task?
├─ Yes → product-strategist (+ data-analytics-engineer if metrics-focused)
└─ No ↓

Is this primarily user-facing design?
├─ Yes → ux-ui-designer (+ ux-researcher for research, + a11y-specialist for accessibility)
└─ No ↓

Is this frontend development?
├─ Yes → frontend-engineer (+ performance-engineer if performance-critical, + seo-specialist if SEO-focused)
└─ No ↓

Is this backend development?
├─ Yes → backend-engineer (+ security-engineer if security-sensitive, + devops-sre-architect for infrastructure)
└─ No ↓

Is this mobile development?
├─ Yes → mobile-app-engineer (+ ux-ui-designer for design, + performance-engineer for optimization)
└─ No ↓

Is this testing/quality focused?
├─ Yes → qa-tester (+ security-engineer for security, + a11y-specialist for accessibility)
└─ No ↓

Is this security/compliance focused?
├─ Yes → security-engineer (+ qa-tester for testing, + backend-engineer for implementation)
└─ No ↓

Is this performance optimization?
├─ Yes → performance-engineer (+ frontend-engineer or backend-engineer for implementation)
└─ No ↓

Is this DevOps/infrastructure?
├─ Yes → devops-sre-architect (+ security-engineer for security, + performance-engineer for SLOs)
└─ No ↓

Is this analytics/experimentation?
├─ Yes → data-analytics-engineer (+ product-strategist for metrics strategy)
└─ No ↓

Is this SEO-related?
├─ Yes → seo-specialist (+ frontend-engineer for implementation, + performance-engineer for Core Web Vitals)
└─ No ↓

Is this AI/LLM work?
├─ Yes → llm-agent-architect (+ security-engineer for safety, + backend-engineer for infrastructure)
└─ No ↓

Is this game design?
└─ Yes → game-systems-designer (+ data-analytics-engineer for balancing, + mobile-app-engineer if mobile)
```
