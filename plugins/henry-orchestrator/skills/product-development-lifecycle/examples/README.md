# Product Development Lifecycle Examples

This directory contains complete walkthrough examples and templates for executing product development lifecycles using Henry Orchestrator.

## Complete Walkthroughs

### [SaaS Analytics Platform](./saas-analytics-platform.md)

**Type:** Full product development (4 months)
**Complexity:** High
**Best for:** Learning complete end-to-end lifecycle

**What you'll learn:**

- Strategy and planning with market analysis
- UX research and design process
- Full-stack implementation (React + Node.js + PostgreSQL)
- Security and performance optimization
- Beta launch and post-launch optimization
- Real metrics and decision-making

**Key highlights:**

- RICE prioritization framework
- TimescaleDB for time-series data
- Real-time WebSocket implementation
- Comprehensive testing (85%+ coverage)
- Security review process
- Gradual rollout strategy

**When to use this example:**

- Building a new SaaS product from scratch
- Need to understand all lifecycle phases
- Want to see realistic timelines and metrics
- Planning a beta launch with gradual rollout

---

### [Payment API Service](./payment-api-service.md)

**Type:** API service development (3 months)
**Complexity:** High (due to security/compliance)
**Best for:** Backend-focused projects requiring high reliability

**What you'll learn:**

- API-first design approach
- Stripe integration patterns
- Webhook handling with queues
- Idempotency implementation
- PCI compliance basics
- High-availability architecture

**Key highlights:**

- OpenAPI/Swagger documentation
- BullMQ for webhook processing
- Security-first development
- 99.9%+ uptime requirements
- Database failover strategies
- Production monitoring setup

**When to use this example:**

- Building API services or microservices
- Need to integrate payment processing
- Require high reliability (>99.9% uptime)
- Must meet compliance requirements (PCI, SOC2)
- Learning webhook handling patterns

---

## Document Templates

The [`templates/`](./templates/) directory contains ready-to-use templates for each phase:

### [PRD Template](./templates/prd-template.md)

Comprehensive Product Requirements Document template with:

- Executive summary and problem statement
- Market analysis (TAM/SAM/SOM)
- User personas and journeys
- Feature prioritization (RICE framework)
- Success metrics and KPIs
- Technical and design requirements
- Risk assessment
- Timeline and milestones

**Use when:** Starting henry-product phase or planning any new feature/product

---

## How to Use These Examples

### For Learning

1. **Read the complete walkthrough** to understand the full lifecycle
2. **Note the phase transitions** and quality gates
3. **Study the decision-making process** (what/why/when)
4. **Review the metrics** to understand success criteria

### For Your Project

1. **Choose the example** closest to your project type
2. **Adapt the timeline** to your scope (MVP vs full product)
3. **Use the templates** as starting points
4. **Follow the phase structure** but adjust based on your needs
5. **Reference the examples** when you get stuck

### Running Henry Commands

Each example shows the actual commands used:

```bash
# Strategy phase
/henry-orchestrator:henry-product [your product description]

# Design phase
/henry-orchestrator:henry-design [your design requirements]

# Implementation phase
/henry-orchestrator:henry-feature [feature description]

# Quality assurance
/henry-orchestrator:henry-review [what to review]

# Pre-launch validation
/henry-orchestrator:henry-audit [audit scope]
/henry-orchestrator:henry-optimize [issues to fix]

# Launch
/henry-orchestrator:henry-launch [deployment plan]
```

---

## Example Comparison

| Aspect          | SaaS Analytics            | Payment API                |
| --------------- | ------------------------- | -------------------------- |
| **Type**        | Full-stack web app        | Backend API service        |
| **Timeline**    | 4 months                  | 3 months                   |
| **Complexity**  | High (UX + backend)       | High (security/compliance) |
| **Team Size**   | 5 people                  | 4 people                   |
| **Frontend**    | React dashboard           | None (API only)            |
| **Backend**     | Node.js + PostgreSQL      | Node.js + PostgreSQL       |
| **Key Focus**   | Real-time analytics, UX   | Security, reliability      |
| **Compliance**  | GDPR                      | PCI DSS, SOC2              |
| **Launch Type** | Beta with gradual rollout | Production with HA         |
| **Best For**    | B2C/B2B SaaS products     | API/microservices          |

---

## Lifecycle Models

The examples demonstrate different development models:

### Waterfall (Traditional)

- Payment API follows this more closely
- Sequential phases with strict gates
- Better for high-compliance scenarios

### Agile (Iterative)

- SaaS Analytics uses sprint-based approach
- Continuous delivery and feedback
- Better for user-facing products

### Lean Startup (Experimental)

- SaaS Analytics beta phase demonstrates this
- Build-measure-learn cycles
- Better for new/uncertain markets

---

## Metrics & Benchmarks

Use these examples to calibrate your own expectations:

### Timeline Benchmarks

- **MVP:** 6-8 weeks (see SKILL.md Template 2)
- **New feature:** 2-4 weeks (see SKILL.md Template 3)
- **Full product:** 3-6 months (see examples)

### Quality Benchmarks

- **Test coverage:** 80-90%
- **Performance:** <2.5s LCP, <100ms FID
- **Accessibility:** WCAG 2.1 AA
- **Uptime:** 99.9%+ for production APIs

### Success Metrics Benchmarks

- **Activation rate:** 50-65%
- **D7 retention:** 40-50%
- **NPS:** 40-60 (good), >60 (excellent)
- **Error rate:** <1%

---

## Tips for Adaptation

### Scaling Down (MVP)

- Focus on P0 features only
- Reduce design phase to wireframes only
- Skip advanced optimizations
- Launch to smaller beta group (10-50 users)
- 6-8 week timeline instead of 3-6 months

### Scaling Up (Enterprise)

- Add compliance phases (SOC2, ISO 27001)
- Include security pen testing
- Add load testing (10x expected load)
- Multiple environment tiers (dev/staging/prod)
- Longer timelines for approvals and reviews

### Different Tech Stacks

The examples use Node.js + React, but the **process is stack-agnostic**:

- Same phases apply to Python/Django, Ruby/Rails, Go, etc.
- Adjust technical details but keep lifecycle structure
- Henry agents can work with any tech stack

---

## Common Questions

### Q: Do I need to follow all phases?

**A:** For new products, yes. For small features, you can skip or combine phases (see SKILL.md Template 3).

### Q: Can I compress the timeline?

**A:** Yes, see MVP template in SKILL.md. Focus ruthlessly on P0 features and minimum viable quality.

### Q: What if I'm a solo developer?

**A:** Same phases apply, but you wear multiple hats. Henry agents can help by providing specialized expertise in each area.

### Q: Can I do phases in parallel?

**A:** Some overlap is fine (e.g., start design while finalizing PRD), but don't skip quality gates.

### Q: How do I know when to move to the next phase?

**A:** Check the quality gates in SKILL.md. Each phase has specific completion criteria.

---

## Contributing Examples

Have a successful project using Henry Orchestrator? Consider contributing your walkthrough!

**What makes a good example:**

- Real project (anonymized if needed)
- Complete timeline with actual metrics
- Shows decision-making process
- Includes lessons learned
- Different domain/tech stack from existing examples

---

## Related Resources

- **Main skill:** [../SKILL.md](../SKILL.md) - Full lifecycle guide
- **Templates:** [./templates/](./templates/) - Document templates
- **Henry commands:** `/henry-orchestrator:help` - Command reference

---

**Last updated:** 2025-11-21
