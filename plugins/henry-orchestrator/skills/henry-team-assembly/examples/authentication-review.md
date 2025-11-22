# Example: Authentication System Review

This example demonstrates how to assemble and coordinate a team to comprehensively review an authentication implementation.

## Scenario

**Project**: Review authentication system for a web application
**Codebase**: Node.js/Express backend, React frontend
**Authentication**: JWT tokens with bcrypt password hashing
**Goal**: Ensure security, code quality, and thorough test coverage

## Team Assembly

### Selected Agents

```
/henry-orchestrator:henry-team security-engineer backend-engineer qa-tester - Review authentication implementation
```

**Team Composition Rationale:**

1. **security-engineer**
   - **Expertise**: OWASP Top 10, threat modeling, cryptography
   - **Responsibilities**: Identify security vulnerabilities, threat modeling, security best practices
   - **Deliverables**: Security audit report, threat model, remediation recommendations

2. **backend-engineer**
   - **Expertise**: Node.js, Express, API design, code quality
   - **Responsibilities**: Review code quality, architecture, best practices
   - **Deliverables**: Code review report, refactoring recommendations

3. **qa-tester**
   - **Expertise**: Security testing, test automation, edge cases
   - **Responsibilities**: Create security test strategy, identify test gaps
   - **Deliverables**: Test plan, security test cases, coverage analysis

**Team Size**: 3 agents (small team)
**Execution Mode**: Parallel (all agents review same codebase simultaneously)

## Expected Workflow

### Phase 1: Parallel Review (2-3 hours)

All three agents independently review the authentication codebase:

**Security Engineer focuses on:**
- Authentication flow security
- Token generation and validation
- Password hashing implementation
- Session management
- CSRF/XSS protection
- Rate limiting and brute force protection
- Secure password reset flow

**Backend Engineer focuses on:**
- Code organization and structure
- Error handling and logging
- API endpoint design
- Middleware implementation
- Database query security
- Code maintainability
- Performance considerations

**QA Tester focuses on:**
- Existing test coverage
- Missing test scenarios
- Edge cases (expired tokens, invalid inputs, etc.)
- Security test cases
- Integration test strategy
- Test automation opportunities

### Phase 2: Output Synthesis (1 hour)

Collect and integrate findings from all three agents:

**Expected Outputs:**

1. **Security Audit Report**
   - Identified vulnerabilities (e.g., missing rate limiting, weak token expiration)
   - Threat model using STRIDE framework
   - Security recommendations prioritized by severity

2. **Code Quality Report**
   - Architectural improvements
   - Code refactoring suggestions
   - Best practice recommendations
   - Performance optimization opportunities

3. **Test Strategy**
   - Current test coverage analysis
   - Missing test scenarios
   - Security-specific test cases
   - Recommended test automation

### Phase 3: Prioritization and Action Plan (30 min)

Synthesize findings into prioritized action items:

**Critical (Immediate):**
- Fix: Missing rate limiting on login endpoint (security)
- Fix: Weak token expiration (1 year vs 1 hour) (security)
- Add: CSRF protection on state-changing endpoints (security)

**High (This Sprint):**
- Improve: Error messages leaking user existence (security)
- Refactor: Duplicate validation logic across routes (code quality)
- Add: Security test cases for token expiration (testing)

**Medium (Next Sprint):**
- Enhance: Logging for security events (security/ops)
- Optimize: Database queries for user lookups (performance)
- Add: Integration tests for complete auth flows (testing)

**Low (Backlog):**
- Consider: Implementing refresh tokens (feature)
- Improve: Password strength requirements (UX/security)
- Add: Account lockout after failed attempts (security)

## Conflict Resolution Example

### Scenario: Error Message Design

**Security Engineer Recommendation:**
"All authentication failures should return generic 'Invalid credentials' message to prevent user enumeration."

**Backend Engineer Concern:**
"Generic error messages make debugging difficult. We should log detailed errors server-side but show generic messages to users."

**QA Tester Input:**
"Need to test that error messages don't leak information, but also need specific test scenarios for different failure types."

**Resolution:**
Implement generic user-facing errors with detailed server-side logging:
- User sees: "Invalid credentials"
- Server logs: Specific reason (wrong password, user not found, account locked)
- Tests verify: No information leakage in responses, proper logging occurs

**Rationale**: Security requirement (prevent enumeration) + operational requirement (debugging) both satisfied.

## Success Metrics

**Security:**
- Zero critical or high-severity vulnerabilities
- All OWASP authentication best practices implemented
- Successful penetration testing

**Code Quality:**
- Code maintainability score > 80%
- No duplicate authentication logic
- Consistent error handling

**Testing:**
- Test coverage for auth code > 90%
- All security test cases passing
- Edge cases covered

## Actual Command Usage

```bash
# Step 1: Assemble the team
/henry-orchestrator:henry-team security-engineer backend-engineer qa-tester - Review authentication implementation in src/auth/

# Step 2: Provide context to all agents
# (All agents receive): "Please review the authentication implementation in src/auth/.
# Focus on: login (src/auth/login.js), signup (src/auth/signup.js), password reset
# (src/auth/reset.js), and JWT middleware (src/middleware/auth.js)"

# Step 3: Agents work in parallel
# - security-engineer produces security audit
# - backend-engineer produces code review
# - qa-tester produces test strategy

# Step 4: Synthesize outputs
# Review all three reports, identify overlaps, resolve conflicts, prioritize

# Step 5: Create action plan
# Categorize by priority, assign to sprints, track in project management tool
```

## Key Takeaways

1. **Right-sized team**: 3 agents provided comprehensive coverage without coordination overhead
2. **Parallel execution**: Faster than sequential, appropriate since all reviewing same artifact
3. **Diverse perspectives**: Security, code quality, and testing viewpoints created thorough assessment
4. **Clear synthesis**: Integrated findings prevent duplicate work and ensure nothing is missed
5. **Conflict resolution**: Multiple perspectives sometimes conflict; resolution process addresses this
6. **Actionable output**: Prioritized recommendations enable immediate action

## Variations

### Smaller Team (2 agents)
```
/henry-orchestrator:henry-team security-engineer backend-engineer - Quick security and code review
```
Use when: Time-constrained, less critical system

### Larger Team (4-5 agents)
```
/henry-orchestrator:henry-team security-engineer backend-engineer qa-tester devops-sre-architect performance-engineer - Complete auth system audit
```
Use when: Production launch, critical system, need deployment and performance review too

## Related Examples

- See `examples/landing-page-optimization.md` for SEO + frontend + performance team
- See `examples/mobile-app-feature.md` for product + design + mobile engineering team
- See `references/team-patterns.md` for more team composition patterns
