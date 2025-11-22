---
description: Product strategy session with market analysis and roadmapping
argument-hint: Product idea, market, goals
---

# Henry Product Strategy

You are orchestrating a product strategy session using the Henry Orchestrator's product and growth specialist agents. Follow a systematic approach from market analysis through roadmap planning.

## Initial Context

**Product Strategy Request:** $ARGUMENTS

## Core Principles

- **Data-driven decisions**: Use frameworks and metrics
- **Market-first**: Understand market before building
- **Growth-focused**: Plan for acquisition, activation, retention
- **Measurable**: Define clear success metrics
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Discovery & Context

**Goal**: Understand the product vision and current state

**Actions**:

1. Create todo list with all phases
2. Gather context from user:
   - What product/feature are we strategizing?
   - Stage: Idea, MVP, Growth, Mature?
   - What problem does it solve?
   - Who is the target customer?
   - What's the business model?
   - Any existing metrics or data?
   - Key constraints (time, budget, resources)?
3. Review any existing documentation:
   - Current product specs
   - User data/analytics
   - Market research
   - Competitive landscape

---

## Phase 2: Market Analysis & Product Strategy

**Goal**: Analyze market opportunity and define product strategy

**Actions**:

1. Launch `product-strategist` agent to:
   - **Market Sizing**: TAM/SAM/SOM analysis
   - **Competitive Analysis**: Direct and indirect competitors
   - **Value Proposition**: Unique selling points
   - **Target Segments**: ICP (Ideal Customer Profile)
   - **Positioning**: Market positioning statement
   - **Business Model**: Revenue model recommendations
   - **Unit Economics**: CAC/LTV calculations (if data available)
   - **Go-to-Market**: Distribution strategy
2. Present market analysis findings:
   - Market size and opportunity
   - Competitive landscape with positioning map
   - Target customer segments prioritized
   - Value proposition canvas
   - Business model recommendation
   - Key risks and mitigations
3. Ask user:
   - Does market analysis align with assumptions?
   - Which customer segment to prioritize?
   - Business model constraints or preferences?
   - Risk tolerance level?

**Wait for user confirmation before proceeding.**

---

## Phase 3: Feature Prioritization & Roadmap

**Goal**: Prioritize features and create actionable roadmap

**Actions**:

1. Continue with `product-strategist` agent to:
   - **Feature Brainstorm**: List potential features
   - **RICE Scoring**: Reach, Impact, Confidence, Effort
   - **ICE Scoring**: Impact, Confidence, Ease (alternative)
   - **Kano Model**: Must-haves, Performance, Delighters
   - **MoSCoW**: Must have, Should have, Could have, Won't have
   - **Roadmap**: Phased rollout plan (Now, Next, Later)
   - **MVP Definition**: Minimum viable feature set
   - **Dependencies**: Feature dependencies and sequencing
2. Present prioritization results:
   - Top features with scores and rationale
   - Recommended MVP scope
   - Phased roadmap (Q1, Q2, Q3, Q4 or Now/Next/Later)
   - Feature dependencies diagram
   - Effort estimates
3. Get user input:
   - Does prioritization match strategic goals?
   - Any must-have features missing?
   - Timeline realistic?
   - Resource constraints to consider?

**Wait for user confirmation before proceeding.**

---

## Phase 4: Success Metrics & Analytics

**Goal**: Define how to measure success

**Actions**:

1. Launch `data-analytics-engineer` agent to:
   - **North Star Metric**: Primary success metric
   - **KPI Framework**: Supporting metrics (AARRR: Acquisition, Activation, Retention, Revenue, Referral)
   - **Event Tracking Plan**: Key events to instrument
   - **Dashboard Design**: Metrics dashboard specifications
   - **Funnel Analysis**: Conversion funnels to track
   - **Cohort Analysis**: Retention cohort setup
   - **A/B Testing Framework**: Experimentation infrastructure
   - **Data Quality**: Validation rules and data governance
2. Present analytics strategy:
   - North Star Metric with target
   - KPI tree with leading/lagging indicators
   - Event tracking specifications
   - Dashboard mockup
   - Experimentation roadmap
   - Data collection requirements
3. Ask user:
   - Do metrics align with business goals?
   - Any additional metrics to track?
   - Analytics tool preferences?
   - Privacy/compliance requirements (GDPR/CCPA)?

---

## Phase 5: Growth Strategy (Optional)

**Goal**: Plan for user acquisition and growth

**Actions**:

1. If growth is a focus, continue with `product-strategist` to:
   - **AARRR Framework**: Acquisition, Activation, Retention, Revenue, Referral strategies
   - **Growth Loops**: Identify and design growth loops
   - **Channel Strategy**: Prioritize acquisition channels
   - **Virality**: K-factor and viral loop design
   - **Retention**: Engagement and retention tactics
   - **Monetization**: Pricing strategy and upsell paths
   - **Experiment Backlog**: Growth experiments to run
2. Present growth strategy:
   - Primary growth loop diagram
   - Channel prioritization with expected CAC
   - Retention tactics and frequency
   - Monetization milestones
   - Top 5 growth experiments to run first
3. Get user feedback on growth priorities

---

## Phase 6: SEO & Discoverability (If Applicable)

**Goal**: Plan for organic discovery and search visibility

**Actions**:

1. If product has public-facing pages, launch `seo-specialist` to:
   - **Content Strategy**: SEO content plan
   - **Keyword Research**: Target keywords by intent
   - **Technical SEO**: Site structure and crawlability
   - **On-Page SEO**: Metadata and schema strategy
   - **Link Building**: Authority building tactics
   - **Local SEO**: If location-based
2. Present SEO strategy:
   - Keyword targets and content calendar
   - Technical SEO requirements
   - Schema markup plan
   - Link building approach
   - SEO metrics to track

---

## Phase 7: Risk Assessment & Compliance

**Goal**: Identify and mitigate product risks

**Actions**:

1. With `product-strategist`, assess risks:
   - **Market Risks**: Competition, timing, market fit
   - **Technical Risks**: Feasibility, scalability, dependencies
   - **Regulatory Risks**: GDPR, CCPA, industry regulations
   - **Business Risks**: Monetization, CAC/LTV, churn
   - **Operational Risks**: Support, reliability, performance
2. For each high risk:
   - Likelihood and impact rating
   - Mitigation strategy
   - Monitoring plan
3. If compliance is critical, note to involve `security-engineer` for:
   - Data privacy compliance
   - Security requirements
   - Audit trail needs

---

## Phase 8: PRD & Documentation

**Goal**: Create comprehensive product requirements document

**Actions**:

1. With `product-strategist`, compile PRD:
   - **Vision**: Product vision and goals
   - **Market**: Market analysis summary
   - **Users**: Target personas and use cases
   - **Features**: Prioritized feature list with specs
   - **Success Metrics**: KPIs and targets
   - **Roadmap**: Phased rollout plan
   - **Requirements**: Functional and non-functional
   - **Constraints**: Technical, business, regulatory
   - **Risks**: Risk register with mitigations
   - **Go-to-Market**: Launch strategy
2. Structure PRD sections:
   - Executive Summary
   - Market Opportunity
   - Product Vision & Strategy
   - Target Users
   - Feature Specifications
   - Success Metrics
   - Roadmap
   - Technical Requirements
   - Risks & Mitigations
   - Open Questions

---

## Phase 9: Summary & Next Steps

**Goal**: Synthesize strategy and define action items

**Actions**:

1. Mark all todos complete
2. Generate comprehensive summary:
   - **Market Opportunity**: TAM/SAM/SOM and positioning
   - **Product Strategy**: Vision, value prop, differentiation
   - **Feature Roadmap**: Prioritized features with timeline
   - **Success Metrics**: North Star and KPIs
   - **Growth Strategy**: Key growth loops and channels
   - **Analytics Plan**: Tracking and experimentation setup
   - **Key Decisions**: Strategic choices made
   - **Risks**: Top risks and mitigations
   - **Next Steps**: Immediate action items
3. Provide actionable next steps:
   - Design kickoff (use `henry-design` command)
   - Technical planning (use `henry-feature` command)
   - Analytics setup (implement tracking plan)
   - Market validation (user research, prototypes)
   - Competitive monitoring plan

---

## Usage Examples

**New product idea:**

```
/henry-orchestrator:henry-product AI-powered code review SaaS for enterprise teams
```

**Feature prioritization:**

```
/henry-orchestrator:henry-product Prioritize Q2 features for our task management app
```

**Growth strategy:**

```
/henry-orchestrator:henry-product Growth strategy for our 10K users, focusing on retention
```

**Market analysis:**

```
/henry-orchestrator:henry-product Market analysis for entering the project management space
```

## Usage Tips

- **Provide context**: Share existing data, metrics, user feedback
- **Be specific**: "Growth strategy" vs "increase signups"
- **Stage matters**: Strategy differs for MVP vs mature product
- **Combine with design**: Follow up with `/henry-design` for UX
- **Combine with engineering**: Follow up with `/henry-feature` for implementation

## Agent Handoff

After strategy completion, consider:

- `ux-researcher`: To validate assumptions with users
- `ux-ui-designer`: To design prioritized features
- `frontend-engineer` / `backend-engineer`: To build MVP
- `data-analytics-engineer`: To implement tracking
- `seo-specialist`: To execute SEO strategy

---

Use TodoWrite to track progress through all phases.
