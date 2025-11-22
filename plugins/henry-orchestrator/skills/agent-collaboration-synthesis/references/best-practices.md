# Synthesis Best Practices

This document provides best practices, common challenges, and solutions for synthesizing multi-agent outputs effectively.

## Best Practices

### DO:

✅ **Consolidate, don't just list**: Create unified view, not separate agent reports
✅ **Prioritize ruthlessly**: Clear P0/P1/P2/P3 with rationale
✅ **Resolve conflicts explicitly**: Document decisions and trade-offs
✅ **Create actionable plans**: Specific tasks with owners and deadlines
✅ **Define success metrics**: Measurable criteria for completion
✅ **Maintain traceability**: Link recommendations back to agent findings
✅ **Highlight cross-cutting themes**: Show where agents agree or complement

### DON'T:

❌ **Copy-paste agent outputs**: Synthesis means integration, not concatenation
❌ **Ignore conflicts**: Address disagreements, don't hide them
❌ **Lose important details**: Summary doesn't mean omitting critical info
❌ **Create vague action items**: "Improve performance" → "Reduce bundle size to <500KB"
❌ **Skip prioritization**: All issues are not equally important
❌ **Forget stakeholders**: Tailor synthesis to audience (exec summary for leadership, detailed tech for engineers)

## Prioritization Framework

### Severity Levels

**Critical** (P0 - Fix immediately):
- Security vulnerabilities exploitable in production
- WCAG A violations (accessibility blockers)
- Performance issues causing >5s load times
- Complete feature failures

**High** (P1 - Fix before launch):
- Important security hardening
- WCAG AA violations
- Performance issues preventing targets
- Major UX problems

**Medium** (P2 - Fix in near term):
- Defense-in-depth security improvements
- Performance optimizations beyond targets
- UX enhancements
- Code quality improvements

**Low** (P3 - Backlog):
- Future enhancements
- Nice-to-have optimizations
- Polish items

### Impact × Effort Matrix

```
High Impact, Low Effort: Do first (Quick wins)
High Impact, High Effort: Schedule next (Major improvements)
Low Impact, Low Effort: Do if time (Easy polish)
Low Impact, High Effort: Avoid (Not worth it)
```

### Priority Order (When Conflicts Arise)

1. **Security** > Everything (non-negotiable)
2. **Accessibility** = Security (legal/ethical requirement)
3. **Functionality** > Performance (must work, then optimize)
4. **Performance** > Polish (fast and simple > slow and fancy)
5. **UX** guided by data and research

## Conflict Resolution Strategies

### Strategy 1 - Find Both/And Solution

**Example**:
- Performance wants lazy loading + A11y wants keyboard nav
- **Resolution**: Lazy loading with keyboard-accessible loading indicators and skip links
- **Rationale**: Both goals achievable with proper implementation

### Strategy 2 - Security/A11y Prevails

**Example**:
- Security wants strict CSP + Frontend wants third-party widgets
- **Resolution**: Find CSP-compliant alternatives or build in-house
- **Rationale**: Security is non-negotiable, features must work within constraints

### Strategy 3 - Data-Driven Decision

**Example**:
- UX wants feature A + Performance concerned about cost
- **Resolution**: Use product-strategist to assess business value, A/B test if needed
- **Rationale**: Let impact data guide trade-off

### Strategy 4 - Phased Approach

**Example**:
- Frontend wants comprehensive redesign + Performance wants minimal changes
- **Resolution**: Phase 1 (critical changes), Phase 2 (enhancements), measure impact
- **Rationale**: Incremental approach reduces risk while delivering value

## Common Challenges

### Challenge 1: Overwhelming Volume

**Problem**: Too many findings to process effectively

**Symptoms**:
- 50+ issues across multiple agents
- Stakeholders overwhelmed by report length
- Unable to identify clear priorities

**Solution**:
1. Start with critical/high severity only
2. Group related findings into themes
3. Focus on blockers first
4. Create executive summary with details in appendix
5. Use visual aids (charts, severity matrix)

**Example**:
```
Instead of listing all 50 issues:
- Executive Summary: "5 critical blockers, 12 high priority issues"
- Visual: Pie chart showing severity distribution
- Appendix: Complete finding list with details
```

### Challenge 2: Contradictory Recommendations

**Problem**: Agents recommend opposite approaches

**Symptoms**:
- Performance vs. functionality trade-offs
- Security vs. user experience conflicts
- A11y vs. visual design disagreements

**Solution**:
1. Understand each agent's constraints and priorities
2. Look for both/and solutions first
3. Apply priority framework (security > a11y > performance > polish)
4. Document decision rationale clearly
5. Escalate if needed (use product-strategist for business trade-offs)

**Example**:
```
Conflict: UX wants rich animations vs. Performance concerned about CLS

Resolution:
1. Research both/and: Animations that don't affect CLS
2. Priority check: Performance (CLS) is measurable user impact
3. Decision: Simplified animations that meet CLS < 0.1 target
4. Document: "Reduced animation complexity to meet Core Web Vitals"
```

### Challenge 3: No Clear Owner

**Problem**: Synthesis complete but no one assigned to act

**Symptoms**:
- Report created but no follow-up
- Issues remain unfixed
- No accountability for resolution

**Solution**:
1. Explicitly assign owners to each action item
2. Set realistic deadlines based on priority
3. Create tracking mechanism (GitHub issues, project board)
4. Schedule follow-up review meeting
5. Get sign-off from owners before finalizing

**Example**:
```
Action Plan:
1. Fix SQL injection in auth [Owner: @security-lead, Due: 2024-01-15]
2. Optimize bundle size [Owner: @frontend-lead, Due: 2024-01-22]
3. Add auth test coverage [Owner: @qa-lead, Due: 2024-01-29]

Follow-up: Weekly sync every Monday 10am until all P0/P1 resolved
```

### Challenge 4: Lost Context

**Problem**: Synthesis loses important context from agent outputs

**Symptoms**:
- Engineers can't understand recommendations
- Stakeholders question findings
- Unable to verify or reproduce issues

**Solution**:
1. Link back to detailed agent findings
2. Include key quotes or data points
3. Maintain appendix with full details
4. Reference specific line numbers, WCAG criteria, etc.
5. Preserve agent reasoning and evidence

**Example**:
```
Instead of: "Fix performance issues"

Better: "Optimize image loading (reduces LCP from 4.2s to 2.1s)
- Finding: Performance Agent identified 15 unoptimized images
- Evidence: Lighthouse report showing LCP 4.2s
- Solution: Implement next/image with WebP format
- Reference: See performance-report.md:45-78"
```

### Challenge 5: Stakeholder Misalignment

**Problem**: Different stakeholders need different levels of detail

**Symptoms**:
- Executives want high-level summary
- Engineers need technical specifics
- Product managers need business impact
- Single report doesn't serve any audience well

**Solution**:
1. Create layered documentation:
   - Executive summary (1 page)
   - Management overview (2-3 pages)
   - Technical details (full report)
2. Use progressive disclosure in documents
3. Tailor metrics to audience
4. Provide multiple formats (slides, report, dashboard)

**Example**:
```
For Executives:
"5 security issues block launch. Fix requires 3 days. Risk: data breach."

For Engineering:
"Critical: SQL injection in auth endpoint (line 234)
- Vulnerability: Unsanitized user input in query
- Fix: Use parameterized queries
- Test: See test-plan.md:12-45
- Timeline: 1 day development + 2 days security review"
```

### Challenge 6: Duplicate Work Across Agents

**Problem**: Multiple agents identify the same issue

**Symptoms**:
- Same bug reported by security, QA, and performance
- Confusion about which recommendation to follow
- Inflated issue counts

**Solution**:
1. Deduplicate during synthesis
2. Show which agents identified each issue
3. Combine insights from multiple perspectives
4. Use cross-agent validation as confidence signal

**Example**:
```
Instead of:
- Security: Auth vulnerability
- QA: Auth edge case failure
- Performance: Auth endpoint slow

Synthesize to:
"Authentication endpoint issues (identified by Security, QA, Performance):
- Security: SQL injection vulnerability (P0)
- QA: Missing test coverage for edge cases (P1)
- Performance: Slow query causing 2s delay (P1)

Integrated fix:
1. Patch vulnerability with parameterized queries
2. Add test coverage for security + edge cases
3. Optimize query (reduces from 2s to 200ms)"
```

## Quality Checklist

Before finalizing synthesis, verify:

### Completeness
- [ ] All agent outputs reviewed
- [ ] All critical findings included
- [ ] Cross-cutting themes identified
- [ ] Conflicts resolved or escalated

### Clarity
- [ ] Executive summary clear and concise
- [ ] Technical details accurate and specific
- [ ] Action items unambiguous
- [ ] Success criteria measurable

### Actionability
- [ ] Each action has owner
- [ ] Deadlines are realistic
- [ ] Dependencies identified
- [ ] Resources available

### Traceability
- [ ] Links to detailed agent outputs
- [ ] References to evidence
- [ ] Decision rationale documented
- [ ] Version controlled

### Stakeholder Alignment
- [ ] Appropriate level of detail for audience
- [ ] Key stakeholders reviewed
- [ ] Sign-offs obtained
- [ ] Distribution plan in place

## Synthesis Workflow

### Step-by-Step Process

1. **Collect** (15-30 min)
   - Gather all agent outputs
   - Organize by agent and category
   - Note completion status

2. **Analyze** (30-60 min)
   - Identify themes and patterns
   - Find duplicates
   - Note conflicts
   - Assess severity

3. **Prioritize** (30 min)
   - Apply severity framework
   - Consider impact × effort
   - Identify blockers
   - Sequence recommendations

4. **Resolve** (30-45 min)
   - Address conflicts
   - Make trade-off decisions
   - Document rationale
   - Escalate if needed

5. **Document** (45-90 min)
   - Write executive summary
   - Detail findings by category
   - Create action plan
   - Define success metrics

6. **Review** (30 min)
   - Run quality checklist
   - Get stakeholder feedback
   - Iterate as needed
   - Obtain sign-offs

7. **Publish** (15 min)
   - Distribute to stakeholders
   - Create tracking items
   - Schedule follow-up
   - Archive for reference

### Time Estimates by Complexity

| Complexity | Agents | Issues | Time |
|------------|--------|--------|------|
| Simple | 2-3 | <20 | 2-3 hours |
| Moderate | 3-5 | 20-50 | 4-6 hours |
| Complex | 5+ | 50+ | 1-2 days |

## Continuous Improvement

### Metrics to Track

- **Synthesis quality**: Stakeholder satisfaction score
- **Actionability**: % of recommendations implemented
- **Efficiency**: Time from agent completion to synthesis
- **Accuracy**: % of findings that were valid
- **Impact**: Business/technical outcomes achieved

### Retrospective Questions

After each synthesis:
1. What worked well in this synthesis?
2. What could be improved?
3. Were there any conflicts we struggled to resolve?
4. Did we miss any important findings?
5. How can we make the next synthesis more efficient?

### Learning Opportunities

- **Pattern library**: Document recurring patterns and solutions
- **Conflict catalog**: Build repository of conflict resolutions
- **Template refinement**: Update templates based on what works
- **Automation**: Identify synthesis steps that could be automated
- **Training**: Share learnings with team

## Tools and Resources

### Recommended Tools

- **Issue tracking**: GitHub Issues, Jira, Linear
- **Documentation**: Markdown, Notion, Confluence
- **Visualization**: Mermaid diagrams, charts, matrices
- **Collaboration**: Shared docs, comments, reviews
- **Automation**: Scripts for collecting agent outputs

### Additional Resources

- [Synthesis Patterns](synthesis-patterns.md) - Detailed pattern catalog
- [Synthesis Templates](synthesis-templates.md) - Ready-to-use templates
- Henry Commands documentation - Command-specific synthesis guidance

For questions or guidance on complex synthesis scenarios, ask for help or reference the relevant Henry command documentation.
