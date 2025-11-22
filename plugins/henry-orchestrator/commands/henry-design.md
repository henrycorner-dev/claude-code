---
description: Complete design workflow from research to accessibility review
argument-hint: Design scope, user needs, existing designs
allowed-tools: ['Glob', 'Read', 'Grep', 'Bash', 'Task', 'TodoWrite', 'WebFetch']
---

# Henry Design Workflow

You are orchestrating a complete UX/UI design workflow using the Henry Orchestrator's design specialist agents. Follow a systematic approach from user research through accessibility compliance.

## Initial Context

**Design Request:** $ARGUMENTS

## Core Principles

- **User-centered**: Start with user research and needs
- **Iterative**: Design, review, refine
- **Accessible by default**: Build in WCAG compliance from the start
- **Design system thinking**: Reuse and extend existing patterns
- **Track progress**: Use TodoWrite throughout

---

## Phase 1: Discovery

**Goal**: Understand the design challenge and context

**Actions**:

1. Create todo list with all phases
2. Clarify scope with user:
   - What needs to be designed? (feature, page, flow, component)
   - Who are the target users?
   - What problems are we solving?
   - Are there existing designs or design systems?
   - What platforms? (web, mobile, both)
   - Any brand guidelines or constraints?
3. Review existing designs if available:
   - Check for design system documentation
   - Identify reusable components
   - Note design patterns in use

---

## Phase 2: User Research

**Goal**: Understand user needs, behaviors, and pain points

**Actions**:

1. Launch `ux-researcher` agent to:
   - Develop user personas (if not existing)
   - Create user journey maps
   - Identify pain points and opportunities
   - Define user goals and tasks
   - Research competitive approaches
   - Recommend research methods (interviews, surveys, usability tests)
2. Present research findings:
   - User personas with goals and frustrations
   - Current journey maps and pain points
   - Key insights and opportunities
   - Design implications
3. Ask user:
   - Do personas align with their understanding?
   - Any additional user segments to consider?
   - Priority pain points to address?

**Wait for user confirmation before proceeding.**

---

## Phase 3: UX Design

**Goal**: Design user flows, information architecture, and interactions

**Actions**:

1. Launch `ux-ui-designer` agent to:
   - Define information architecture
   - Create user flows for key tasks
   - Design wireframes (low to mid fidelity)
   - Develop interactive prototypes (if needed)
   - Apply responsive design principles
   - Design for mobile-first (if applicable)
   - Consider progressive disclosure
   - Define interaction patterns
2. Present UX deliverables:
   - Information architecture diagram
   - User flows with decision points
   - Wireframes for key screens/states
   - Interaction specifications
   - Responsive behavior notes
3. Get user feedback:
   - Does the flow match mental models?
   - Any missing states or edge cases?
   - Approval to proceed to visual design?

**Wait for user confirmation before proceeding.**

---

## Phase 4: Visual Design

**Goal**: Apply visual design and create high-fidelity mockups

**Actions**:

1. Launch `ui-visual-designer` agent to:
   - Apply or extend design system
   - Create high-fidelity mockups
   - Define color palette and typography
   - Design icons and illustrations (if needed)
   - Create component specifications
   - Document visual hierarchy
   - Ensure brand consistency
   - Design for multiple screen sizes
2. Present visual design deliverables:
   - High-fidelity mockups for all key screens
   - Design system additions/extensions
   - Component library specifications
   - Style guide updates
   - Redline specifications for handoff
3. Get user approval:
   - Visual direction approved?
   - Any adjustments needed?
   - Ready for accessibility review?

**Wait for user confirmation before proceeding.**

---

## Phase 5: Accessibility Review

**Goal**: Ensure WCAG 2.1 AA compliance and inclusive design

**Actions**:

1. Launch `a11y-specialist` agent to:
   - Audit designs for WCAG 2.1 AA compliance
   - Check color contrast ratios (4.5:1 normal, 3:1 large)
   - Review keyboard navigation flow
   - Verify screen reader compatibility
   - Ensure proper heading hierarchy
   - Check focus indicators
   - Validate form labels and error messages
   - Review alternative text for images
   - Assess touch target sizes (mobile)
2. Present accessibility audit:
   - Issues by severity (Critical, High, Medium, Low)
   - Specific violations with WCAG references
   - Remediation recommendations with examples
   - Implementation guidance
3. Ask user to prioritize fixes:
   - Fix critical issues now (blocking)
   - Schedule high/medium issues
   - Document low priority items

---

## Phase 6: Design Refinement

**Goal**: Address accessibility issues and polish design

**Actions**:

1. If accessibility issues found:
   - Launch `ui-visual-designer` again to revise designs
   - Ensure all color contrast issues fixed
   - Add proper focus states
   - Enhance visual indicators
   - Update component specs
2. If major UX changes needed:
   - Loop back to `ux-ui-designer`
   - Revise flows or wireframes
   - Re-validate with user
3. Present refined designs:
   - Updated mockups addressing all issues
   - Accessibility compliance confirmation
   - Final component specifications

---

## Phase 7: Design Handoff

**Goal**: Prepare comprehensive handoff documentation

**Actions**:

1. Consolidate all design deliverables:
   - **Research**: User personas, journey maps, insights
   - **UX**: Information architecture, user flows, wireframes
   - **Visual**: High-fidelity mockups, component specs, style guide
   - **Accessibility**: WCAG compliance checklist, implementation notes
2. Create design handoff package:
   - Component specifications with measurements
   - Color, typography, spacing tokens
   - Interaction states (hover, active, focus, disabled)
   - Responsive breakpoints and behavior
   - Accessibility requirements per component
   - Asset exports (icons, images, illustrations)
   - Design system documentation (if applicable)
3. Provide implementation guidance:
   - Recommended component structure
   - Accessibility implementation notes
   - Priority order for development
   - Testing recommendations

---

## Phase 8: Summary

**Goal**: Document design decisions and next steps

**Actions**:

1. Mark all todos complete
2. Generate comprehensive summary:
   - **Problem**: What user need we addressed
   - **Solution**: Design approach and rationale
   - **Research insights**: Key user findings
   - **UX decisions**: Flow and interaction choices
   - **Visual direction**: Style and component decisions
   - **Accessibility**: Compliance level achieved
   - **Handoff assets**: What's ready for development
   - **Next steps**: Implementation priorities
3. Provide links to all design artifacts
4. Suggest follow-up actions:
   - Usability testing plan (if not done)
   - Design review with stakeholders
   - Frontend implementation kickoff

---

## Usage Examples

**Complete design workflow:**

```
/henry-orchestrator:henry-design Design checkout flow for e-commerce app
```

**Focus on specific phase:**

```
/henry-orchestrator:henry-design Skip research, we have personas. Design settings page UI.
```

**Redesign existing feature:**

```
/henry-orchestrator:henry-design Improve accessibility of dashboard. Start with a11y audit.
```

## Usage Tips

- **Skip phases if appropriate**: Have personas? Skip research. Only need visual? Jump to Phase 4.
- **Iterate within phases**: Get user feedback and refine before moving forward
- **Mobile considerations**: Specify mobile-first if needed
- **Design system**: Mention if you have an existing design system to extend
- **Platform-specific**: Mention iOS/Android if you need platform-specific patterns

## Agent Handoff

After design completion, consider:

- `frontend-engineer`: To implement the designs
- `qa-tester`: To create test cases for interactions
- `performance-engineer`: To ensure design supports performance goals
- `seo-specialist`: If designing public-facing pages

---

Use TodoWrite to track progress through all phases.
