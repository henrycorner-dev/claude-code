# Requirements Prioritization Methods

This document provides detailed frameworks and techniques for prioritizing requirements effectively.

## Why Prioritization Matters

Effective prioritization ensures:
- Maximum value delivery with limited resources
- Clear focus for development teams
- Stakeholder alignment on what matters most
- Transparent decision-making process
- Ability to adapt to changing circumstances

Without prioritization, teams risk:
- Building low-value features while high-value work waits
- Stakeholder conflicts over what to build next
- Scope creep and missed deadlines
- Wasted effort on unnecessary complexity

## MoSCoW Method

### Overview

MoSCoW categorizes requirements into four priority levels:

- **Must have:** Critical for project success; non-negotiable
- **Should have:** Important but not critical; workarounds exist
- **Could have:** Desirable if time and resources permit
- **Won't have (this time):** Explicitly deferred to future releases

### Application Process

**Step 1: Define "Must have" criteria**

Requirements qualify as "Must have" when:
- Legal or regulatory compliance depends on it
- Project fails without it (cannot launch or operate)
- Safety or security is compromised without it
- No workaround exists

**Step 2: Identify "Should have" features**

Requirements are "Should have" when:
- Significant value but project can launch without them
- Workarounds exist but are painful
- Strong stakeholder demand but not urgent
- Foundation for future functionality

**Step 3: Select "Could have" items**

Requirements fit "Could have" when:
- Nice-to-have improvements or enhancements
- Limited impact if deferred
- Low effort relative to other work
- Opportunistic additions if time allows

**Step 4: Explicitly defer "Won't have"**

Requirements go to "Won't have" when:
- Out of scope for current release
- Low value relative to effort
- Dependencies not yet ready
- Strategic reasons to defer

### Best Practices

**Enforce constraints:**
- Limit "Must have" to 60% or less of capacity
- Reserve buffer for unknowns and risks
- Be ruthless about moving items from "Must" to "Should"

**Review regularly:**
- Re-prioritize each sprint or iteration
- Move items between categories as context changes
- Challenge "Must have" items: Are they truly critical?

**Communicate clearly:**
- Explain rationale for each categorization
- Set expectations with stakeholders
- Document deferred items with reasons

### Example

**E-commerce checkout feature:**

**Must have:**
- Add items to cart
- View cart contents
- Enter shipping address
- Enter payment information
- Complete purchase transaction
- Receive order confirmation email

**Should have:**
- Save cart for later
- Guest checkout option
- Coupon code redemption
- Order tracking link
- Shipping cost calculator

**Could have:**
- Wishlist functionality
- Product recommendations in cart
- Social sharing of cart
- Gift wrapping option
- Delivery time estimates

**Won't have (this time):**
- Subscription purchases
- One-click reordering
- International shipping
- Multi-currency support
- Loyalty points integration

## Value vs. Effort Matrix (2x2)

### Overview

Plot requirements on a 2x2 grid with axes:
- **X-axis:** Effort (Low to High)
- **Y-axis:** Value (Low to High)

This creates four quadrants:
1. **High Value, Low Effort** (top-left): "Quick wins" - prioritize first
2. **High Value, High Effort** (top-right): "Major projects" - plan carefully
3. **Low Value, Low Effort** (bottom-left): "Fill-ins" - do if time allows
4. **Low Value, High Effort** (bottom-right): "Money pits" - avoid or defer

### Application Process

**Step 1: Define value criteria**

Consider multiple value dimensions:
- User impact: How many users benefit? How much?
- Business value: Revenue, cost savings, strategic importance
- Risk reduction: Mitigates technical debt or security risks
- Enablement: Unlocks future capabilities

**Step 2: Estimate effort**

Effort factors include:
- Development time
- Testing and quality assurance
- Design and UX work
- Dependencies and coordination
- Technical complexity and unknowns

**Step 3: Score requirements**

Use a simple scale (1-5 or 1-10):
- Value score: 1 (minimal) to 5 (transformative)
- Effort score: 1 (trivial) to 5 (major undertaking)

**Step 4: Plot on matrix**

Place each requirement on the grid:
- High value = 4-5, Low value = 1-2
- High effort = 4-5, Low effort = 1-2
- Items with score 3 are borderline, use judgment

**Step 5: Prioritize by quadrant**

**Sequencing strategy:**
1. Start with quick wins (high value, low effort)
2. Plan major projects (high value, high effort) carefully
3. Sprinkle in fill-ins when capacity allows
4. Avoid or defer money pits (low value, high effort)

### Best Practices

**Be honest about effort:**
- Include all work: design, dev, testing, deployment
- Account for unknowns and risks
- Don't underestimate to make items seem attractive

**Consider opportunity cost:**
- High-effort items block other work
- Even high-value items may not be worth it if effort is too high

**Reassess regularly:**
- Value and effort estimates change over time
- New information may shift priorities
- Technical improvements may reduce effort

### Example

**Customer support portal features:**

| Requirement | Value | Effort | Quadrant | Priority |
|-------------|-------|--------|----------|----------|
| Live chat widget | 5 | 2 | Quick win | 1 |
| Knowledge base search | 5 | 4 | Major project | 2 |
| Ticket submission form | 4 | 2 | Quick win | 1 |
| Community forum | 3 | 5 | Borderline | 4 |
| AI chatbot | 4 | 5 | Major project | 3 |
| Video tutorials | 2 | 4 | Money pit | 5 |
| Phone support integration | 3 | 2 | Fill-in | 4 |
| Social media integration | 2 | 3 | Money pit | 5 |

**Prioritization:**
1. Live chat widget + Ticket form (quick wins)
2. Knowledge base search (major project, foundational)
3. AI chatbot (major project, innovative)
4. Phone support + Community forum (fill-ins if time)
5. Video tutorials + Social media (defer)

## Weighted Scoring Model

### Overview

Define multiple criteria, assign weights based on importance, score each requirement, and calculate weighted totals for ranking.

### Application Process

**Step 1: Select evaluation criteria**

Common criteria include:
- Business value / Revenue impact
- User satisfaction / User impact
- Strategic alignment
- Technical feasibility
- Risk reduction
- Competitive advantage
- Compliance / Legal requirement
- Cost to implement
- Time to market

**Step 2: Assign weights to criteria**

Distribute 100 points across criteria based on importance:

**Example weight distribution:**
- Business value: 30 points
- User impact: 25 points
- Strategic alignment: 15 points
- Technical feasibility: 10 points
- Risk reduction: 10 points
- Time to market: 10 points

**Step 3: Score each requirement**

Rate each requirement on each criterion (e.g., 1-5 scale):
- 1 = Very low
- 2 = Low
- 3 = Medium
- 4 = High
- 5 = Very high

**Step 4: Calculate weighted scores**

For each requirement:
1. Multiply criterion score by criterion weight
2. Sum all weighted scores
3. Total possible score = sum of (max score × weight)

**Formula:**
```
Weighted Score = Σ (Criterion Score × Criterion Weight)
```

**Step 5: Rank by weighted score**

Sort requirements by weighted score (highest to lowest) to get priority ranking.

### Best Practices

**Involve stakeholders in weighting:**
- Product, engineering, business leaders
- Reach consensus on criteria importance
- Revisit weights periodically

**Use consistent scoring:**
- Define what each score means for each criterion
- Have same people score related requirements
- Calibrate scores across requirements

**Consider score distributions:**
- If all scores are similar, add more discriminating criteria
- If scores cluster, ensure you're evaluating meaningful differences

**Validate results:**
- Does the ranking "feel right" intuitively?
- Are any surprises (high or low)? Investigate why.
- Use as input to decision, not absolute truth

### Example

**Mobile app feature prioritization:**

**Criteria and weights:**
- Business value: 30%
- User impact: 25%
- Strategic alignment: 20%
- Technical feasibility: 15%
- Time to market: 10%

**Scoring (scale 1-5):**

| Feature | Business Value (30%) | User Impact (25%) | Strategic (20%) | Feasibility (15%) | Time to Market (10%) | Weighted Score |
|---------|---------------------|-------------------|----------------|-------------------|---------------------|----------------|
| Push notifications | 5 | 5 | 4 | 4 | 3 | (5×30) + (5×25) + (4×20) + (4×15) + (3×10) = 150 + 125 + 80 + 60 + 30 = **445** |
| Offline mode | 3 | 5 | 5 | 2 | 2 | (3×30) + (5×25) + (5×20) + (2×15) + (2×10) = 90 + 125 + 100 + 30 + 20 = **365** |
| Dark mode | 2 | 4 | 2 | 5 | 5 | (2×30) + (4×25) + (2×20) + (5×15) + (5×10) = 60 + 100 + 40 + 75 + 50 = **325** |
| Social sharing | 4 | 3 | 4 | 4 | 4 | (4×30) + (3×25) + (4×20) + (4×15) + (4×10) = 120 + 75 + 80 + 60 + 40 = **375** |
| Biometric login | 3 | 3 | 3 | 3 | 3 | (3×30) + (3×25) + (3×20) + (3×15) + (3×10) = 90 + 75 + 60 + 45 + 30 = **300** |

**Priority ranking:**
1. Push notifications (445)
2. Social sharing (375)
3. Offline mode (365)
4. Dark mode (325)
5. Biometric login (300)

## Kano Model

### Overview

The Kano model categorizes features based on their relationship to customer satisfaction:

1. **Basic Needs (Must-be):** Expected features; absence causes dissatisfaction, presence doesn't increase satisfaction
2. **Performance Needs (One-dimensional):** More is better; linear relationship with satisfaction
3. **Excitement Features (Delighters):** Unexpected features that differentiate and delight; absence doesn't cause dissatisfaction

### Application Process

**Step 1: Survey users with functional and dysfunctional questions**

For each feature, ask two questions:

**Functional form:**
"How would you feel if this feature is present?"
- I like it
- I expect it
- I'm neutral
- I can tolerate it
- I dislike it

**Dysfunctional form:**
"How would you feel if this feature is absent?"
- I like it
- I expect it
- I'm neutral
- I can tolerate it
- I dislike it

**Step 2: Categorize based on response pairs**

Use the Kano evaluation table to map response pairs to categories:

| | Like | Expect | Neutral | Tolerate | Dislike |
|---|---|---|---|---|---|
| **Like** | Q | E | E | E | P |
| **Expect** | R | I | I | I | M |
| **Neutral** | R | I | I | I | M |
| **Tolerate** | R | I | I | I | M |
| **Dislike** | R | R | R | R | Q |

- **M** = Must-be (Basic need)
- **P** = Performance (Linear satisfaction)
- **E** = Excitement (Delighter)
- **I** = Indifferent
- **R** = Reverse (feature actually reduces satisfaction)
- **Q** = Questionable (contradictory response)

**Step 3: Aggregate results**

For each feature, tally categorization across all respondents and use the most common category.

**Step 4: Prioritize based on category**

**Priority order:**
1. **Must-be features:** Build first; critical to avoid dissatisfaction
2. **Performance features:** Build based on ROI; clear value proposition
3. **Excitement features:** Differentiate strategically; creates competitive advantage

### Best Practices

**Survey thoughtfully:**
- Use clear, jargon-free language
- Include representative user sample
- Test 10-20 features per survey to avoid fatigue

**Consider lifecycle:**
- Excitement features become performance needs over time
- Performance needs become basic needs as market matures
- Re-evaluate periodically (annually)

**Balance portfolio:**
- Don't skip must-be features (they're hygiene factors)
- Invest in performance features for core value
- Sprinkle excitement features for differentiation

### Example

**Email client features Kano categorization:**

**Must-be (Basic needs):**
- Send and receive email
- Attach files
- Search email
- Delete messages
- Spam filtering

**Performance (Linear satisfaction):**
- Storage capacity (more is better)
- Search speed (faster is better)
- Attachment size limit (higher is better)
- Email organization (folders, labels)

**Excitement (Delighters):**
- AI-powered email summarization
- Smart reply suggestions
- Calendar integration with automatic event creation
- Undo send feature
- Read receipts

**Priority:**
1. Ensure all must-be features work flawlessly
2. Invest in performance features based on user needs (larger mailboxes, faster search)
3. Add 1-2 excitement features for differentiation (AI summarization)

## RICE Scoring

### Overview

RICE evaluates requirements across four factors:
- **Reach:** How many users affected in a time period
- **Impact:** How much it affects each user (scale: 0.25 = minimal, 0.5 = low, 1 = medium, 2 = high, 3 = massive)
- **Confidence:** How certain are estimates (scale: 100% = high, 80% = medium, 50% = low)
- **Effort:** Work required in person-months

**RICE Score = (Reach × Impact × Confidence) / Effort**

### Application Process

**Step 1: Estimate Reach**

How many users/customers affected per time period (month or quarter)?

**Examples:**
- Feature used by 1,000 users/month: Reach = 1,000
- Email campaign to 50,000 users/quarter: Reach = 50,000
- Infrastructure improvement affecting all 100,000 users: Reach = 100,000

**Step 2: Score Impact**

Rate impact per user:
- **3 (Massive):** Transforms core user experience
- **2 (High):** Significant improvement to key workflow
- **1 (Medium):** Noticeable improvement
- **0.5 (Low):** Small improvement
- **0.25 (Minimal):** Barely noticeable

**Step 3: Rate Confidence**

How confident in Reach and Impact estimates?
- **100% (High):** Strong data or clear patterns
- **80% (Medium):** Some data or reasonable assumptions
- **50% (Low):** Speculative or uncertain

**Step 4: Estimate Effort**

Total work across all team members in person-months:
- Design, engineering, testing, deployment
- Include overhead and unknowns
- Conservative estimates recommended

**Step 5: Calculate RICE score**

```
RICE = (Reach × Impact × Confidence%) / Effort
```

**Step 6: Rank by RICE score**

Higher scores indicate better return on investment.

### Best Practices

**Use consistent time periods:**
- All Reach estimates should use same timeframe (e.g., per quarter)

**Be conservative:**
- Optimistic estimates lead to poor prioritization
- Better to underestimate Reach/Impact and overestimate Effort

**Consider confidence carefully:**
- Low confidence requires validation before investment
- Can justify research spikes to increase confidence

**Reassess regularly:**
- Effort estimates improve as you learn more
- Reach and Impact change as market evolves

### Example

**Product roadmap features:**

| Feature | Reach (users/quarter) | Impact | Confidence | Effort (person-months) | RICE Score |
|---------|----------------------|--------|------------|----------------------|------------|
| Mobile app | 10,000 | 3 | 80% | 6 | (10,000 × 3 × 0.8) / 6 = **4,000** |
| API v2 | 5,000 | 2 | 100% | 3 | (5,000 × 2 × 1.0) / 3 = **3,333** |
| Dark mode | 20,000 | 0.5 | 100% | 2 | (20,000 × 0.5 × 1.0) / 2 = **5,000** |
| AI recommendations | 15,000 | 2 | 50% | 8 | (15,000 × 2 × 0.5) / 8 = **1,875** |
| Export to PDF | 3,000 | 1 | 100% | 1 | (3,000 × 1 × 1.0) / 1 = **3,000** |

**Priority ranking:**
1. Dark mode (5,000)
2. Mobile app (4,000)
3. API v2 (3,333)
4. Export to PDF (3,000)
5. AI recommendations (1,875) - Low confidence suggests need for validation

## Cost of Delay (CD3)

### Overview

Cost of Delay prioritizes based on economic impact of delaying features. CD3 evaluates:
- **Cost of Delay (CoD):** Value lost per time period if delayed
- **Duration:** How long it takes to deliver
- **CD3 Score:** CoD divided by Duration

**CD3 = Cost of Delay / Duration**

### Application Process

**Step 1: Estimate Cost of Delay**

What's the monthly economic impact of not having this feature?

**Consider:**
- Revenue lost (missed sales, churn)
- Cost increases (inefficiency, manual work)
- Risk costs (security, compliance)
- Strategic costs (competitive disadvantage, market share)

**Example CoD calculations:**
- Feature prevents $10K churn/month: CoD = $10K/month
- Feature enables $50K new revenue/month: CoD = $50K/month
- Feature reduces support costs by $5K/month: CoD = $5K/month

**Step 2: Estimate Duration**

How long to deliver (in months)?
- Include design, development, testing, deployment
- Use median estimates, not optimistic

**Step 3: Calculate CD3**

```
CD3 = Cost of Delay / Duration
```

**Step 4: Rank by CD3**

Higher CD3 means better return: more value per unit time.

### Best Practices

**Quantify strategically:**
- Use ranges if exact values unknown (e.g., $5K-$10K/month)
- Be consistent in how you value different outcomes

**Consider urgency profiles:**
- **Standard:** Value steady over time
- **Fixed date:** Value drops to zero after deadline (e.g., compliance)
- **Intangible:** Hard to quantify but important (e.g., technical debt)

**Combine with other methods:**
- CD3 complements RICE and weighted scoring
- Use for high-level roadmap planning

### Example

**Enterprise software features:**

| Feature | Cost of Delay ($/month) | Duration (months) | CD3 Score | Priority |
|---------|------------------------|-------------------|-----------|----------|
| SSO integration | $30,000 | 2 | 30,000 / 2 = **15,000** | 1 |
| Audit logging | $20,000 | 1 | 20,000 / 1 = **20,000** | 1 |
| Bulk import | $15,000 | 3 | 15,000 / 3 = **5,000** | 3 |
| Advanced reporting | $25,000 | 4 | 25,000 / 4 = **6,250** | 2 |
| Mobile app | $10,000 | 6 | 10,000 / 6 = **1,667** | 4 |

**Priority ranking:**
1. Audit logging (20,000) - Quick win, high CoD
2. SSO integration (15,000) - High CoD, reasonable duration
3. Advanced reporting (6,250) - Good value despite longer duration
4. Bulk import (5,000)
5. Mobile app (1,667) - Long duration makes it lower priority despite value

## Choosing the Right Method

Different methods work better for different contexts:

**MoSCoW:**
- Best for: Fixed timeline/scope projects, stakeholder alignment
- Strengths: Simple, forces hard choices
- Weaknesses: Doesn't quantify value

**Value vs. Effort Matrix:**
- Best for: Visual communication, quick prioritization
- Strengths: Intuitive, easy to understand
- Weaknesses: Oversimplifies to two dimensions

**Weighted Scoring:**
- Best for: Multiple criteria, complex decisions
- Strengths: Comprehensive, customizable
- Weaknesses: Can be subjective, time-consuming

**Kano Model:**
- Best for: Understanding customer satisfaction, product positioning
- Strengths: Reveals satisfaction dynamics
- Weaknesses: Requires user research

**RICE:**
- Best for: Data-driven teams, balancing reach and effort
- Strengths: Quantitative, considers confidence
- Weaknesses: Requires good estimates

**CD3:**
- Best for: Economic value, time-sensitive decisions
- Strengths: Focuses on financial impact
- Weaknesses: Hard to quantify for all features

**Recommendation: Combine methods**
- Use MoSCoW for high-level categorization
- Use RICE or CD3 for ranking within categories
- Use Kano for understanding strategic positioning
- Use Value vs. Effort for communicating to stakeholders

## Summary

Effective prioritization requires:
1. Clear criteria aligned with business goals
2. Consistent scoring and evaluation
3. Stakeholder involvement and buy-in
4. Regular reassessment as context changes
5. Transparency in decision rationale
6. Willingness to defer or say "no"

Choose methods appropriate to your context, combine multiple approaches for robustness, and always validate results with intuition and stakeholder feedback.
