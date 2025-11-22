---
name: Requirements Analysis
description: This skill should be used when the user asks to "gather requirements", "analyze user stories", "prioritize features", "define non-functional requirements", "assess performance requirements", "evaluate scalability needs", "create acceptance criteria", or mentions requirements gathering, feature prioritization, or system requirements analysis.
version: 0.1.0
---

# Requirements Analysis

## Purpose

This skill provides structured guidance for gathering, analyzing, and prioritizing requirements for software projects. It helps systematically capture user stories, features, and non-functional requirements (such as performance, scalability, security, and maintainability) to ensure comprehensive project planning and stakeholder alignment.

## When to Use This Skill

Use this skill when:

- Starting a new project or feature that needs requirements definition
- Stakeholders request requirements gathering or user story creation
- A project needs prioritization of features and capabilities
- Non-functional requirements (performance, scalability, security) need to be defined
- Existing requirements need review, refinement, or reprioritization
- Creating acceptance criteria for features or user stories
- Analyzing trade-offs between competing requirements

## Core Requirements Analysis Process

### 1. Stakeholder Identification

Begin by identifying all stakeholders who have interest in or influence over the requirements:

**Key stakeholder categories:**

- End users and user personas
- Product owners and business stakeholders
- Technical leads and architects
- Operations and support teams
- Security and compliance teams
- External partners or integrators

**For each stakeholder group:**

- Document their primary needs and pain points
- Identify their success criteria
- Note any constraints they impose
- Capture their availability for feedback

### 2. Requirements Gathering Techniques

Apply multiple techniques to ensure comprehensive coverage:

**Direct elicitation:**

- Conduct stakeholder interviews with open-ended questions
- Run workshops or brainstorming sessions
- Observe users in their current workflow
- Review existing documentation and systems

**Indirect discovery:**

- Analyze competitor products or similar systems
- Review support tickets and user feedback
- Examine usage analytics and metrics
- Study industry standards and best practices

**Structured approaches:**

- Use user story mapping to visualize user journeys
- Create personas to represent user archetypes
- Develop use cases for key scenarios
- Build process flow diagrams for complex workflows

### 3. User Stories and Features

Structure functional requirements as user stories following the standard format:

**User story template:**

```
As a [type of user]
I want to [action or feature]
So that [benefit or value]
```

**Essential elements for each user story:**

- Clear persona or user role
- Specific, actionable functionality
- Explicit value or business benefit
- Acceptance criteria defining "done"
- Estimated effort or complexity
- Dependencies on other stories or systems

**Feature grouping:**

- Organize related user stories into features or epics
- Define feature boundaries and scope
- Identify cross-cutting features that affect multiple areas
- Document feature interactions and dependencies

### 4. Non-Functional Requirements (NFRs)

Capture quality attributes and system constraints systematically:

**Performance requirements:**

- Response time targets (e.g., API calls < 200ms at p95)
- Throughput targets (e.g., 10,000 requests/second)
- Resource utilization limits (CPU, memory, storage)
- Batch processing time windows
- Real-time processing constraints

**Scalability requirements:**

- Expected user growth over time
- Peak load scenarios and capacity planning
- Horizontal vs. vertical scaling approach
- Geographic distribution needs
- Data volume growth projections

**Security requirements:**

- Authentication and authorization mechanisms
- Data encryption (in transit and at rest)
- Compliance requirements (GDPR, HIPAA, SOC 2, etc.)
- Audit logging and monitoring needs
- Penetration testing and security scanning

**Reliability and availability:**

- Uptime targets (e.g., 99.9% availability)
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Failure handling and graceful degradation
- Disaster recovery requirements

**Maintainability and operability:**

- Code quality standards and testing coverage
- Documentation requirements
- Deployment frequency and rollback capabilities
- Monitoring, alerting, and observability
- Support and on-call requirements

**Usability and accessibility:**

- User interface standards and guidelines
- Accessibility compliance (WCAG, Section 508)
- Internationalization and localization
- Browser and device compatibility
- User onboarding and help systems

For detailed NFR frameworks and templates, see `references/nfr-framework.md`.

### 5. Requirements Prioritization

Apply systematic prioritization to focus effort on highest-value work:

**MoSCoW method:**

- **Must have:** Critical requirements for minimum viable product
- **Should have:** Important but not critical for initial launch
- **Could have:** Desirable if time and resources permit
- **Won't have (this time):** Explicitly deferred to future releases

**Value vs. Effort matrix:**

- Plot requirements on 2x2 grid: High/Low Value × High/Low Effort
- Prioritize high-value, low-effort items ("quick wins")
- Carefully evaluate high-value, high-effort items ("major projects")
- Defer or eliminate low-value items

**Weighted scoring:**

- Define criteria: business value, user impact, technical risk, compliance
- Assign weights to each criterion based on project context
- Score each requirement against criteria
- Calculate weighted total for ranking

**Kano model:**

- **Basic needs:** Must be present; absence causes dissatisfaction
- **Performance needs:** More is better; linear satisfaction
- **Excitement features:** Unexpected delights that differentiate

Consult `references/prioritization-methods.md` for detailed prioritization frameworks.

### 6. Acceptance Criteria and Definition of Done

Define clear, testable criteria for each requirement:

**Acceptance criteria characteristics:**

- Specific and unambiguous
- Testable through manual or automated means
- Independent of implementation details
- Written from user perspective
- Cover both happy paths and edge cases

**Format options:**

- **Given-When-Then (Gherkin):** Given [context], When [action], Then [outcome]
- **Checklist format:** Bulleted list of conditions that must be met
- **Scenario-based:** Narrative descriptions of user interactions

**Definition of Done checklist:**

- Code complete and peer-reviewed
- Unit tests written and passing
- Integration tests passing
- Documentation updated
- Acceptance criteria verified
- Performance requirements met
- Security review completed (if applicable)
- Deployed to staging environment

### 7. Requirements Documentation

Organize and document requirements for team accessibility:

**Documentation structure:**

- Executive summary with project goals
- Stakeholder list with contact information
- Functional requirements (user stories, features)
- Non-functional requirements organized by category
- Prioritization rationale and roadmap
- Dependencies and constraints
- Open questions and assumptions

**Living documentation:**

- Keep requirements in version control
- Update as requirements evolve
- Link requirements to implementation (code, issues, PRs)
- Review and refine regularly with stakeholders
- Archive superseded requirements with rationale

For document templates and examples, see `examples/requirements-document.md`.

## Handling Common Challenges

### Conflicting Requirements

When stakeholders have incompatible needs:

- Document all perspectives explicitly
- Facilitate discussion to understand root needs
- Identify underlying constraints or assumptions
- Explore creative solutions that satisfy multiple needs
- Escalate to decision-makers with clear trade-off analysis

### Vague or Incomplete Requirements

When requirements lack clarity:

- Ask clarifying questions: Who? What? When? Where? Why? How?
- Request concrete examples or scenarios
- Build prototypes or mockups to elicit feedback
- Use "Five Whys" to uncover underlying needs
- Document assumptions explicitly for later validation

### Scope Creep

To maintain project boundaries:

- Establish clear scope baseline early
- Implement formal change request process
- Evaluate new requirements against project goals
- Assess impact on timeline, budget, resources
- Defer non-critical additions to future phases

### Technical Uncertainty

When requirements involve unknown technical challenges:

- Identify and document technical risks
- Plan spikes or proofs-of-concept for validation
- Engage technical experts early
- Build in buffer for learning and iteration
- Consider phased approach with learning milestones

## Integration with Development Process

### Agile/Scrum Integration

- **Product backlog:** Maintain prioritized list of user stories
- **Sprint planning:** Select highest-priority stories for sprint
- **Backlog refinement:** Regularly review and update requirements
- **Sprint review:** Validate completed stories against acceptance criteria
- **Retrospectives:** Improve requirements process based on learnings

### Continuous Discovery

- Treat requirements as hypotheses to be validated
- Build-measure-learn cycles to refine understanding
- A/B testing to validate feature value
- User feedback loops for iterative improvement
- Analytics and metrics to inform prioritization

## Additional Resources

### Reference Files

For comprehensive frameworks and templates:

- **`references/nfr-framework.md`** - Detailed non-functional requirements framework with examples
- **`references/prioritization-methods.md`** - In-depth prioritization techniques and decision frameworks

### Example Files

Working examples and templates:

- **`examples/requirements-document.md`** - Complete requirements document template
- **`examples/user-story-examples.md`** - User story examples across different domains
- **`examples/nfr-examples.md`** - Non-functional requirements examples by category

## Summary

Effective requirements analysis involves:

1. Identifying all stakeholders and their needs
2. Gathering requirements through multiple techniques
3. Structuring functional requirements as user stories
4. Capturing non-functional requirements systematically
5. Prioritizing based on value and constraints
6. Defining clear acceptance criteria
7. Documenting for ongoing reference and evolution

By following this structured approach, ensure comprehensive coverage of project requirements while maintaining focus on delivering maximum value to users and stakeholders.
