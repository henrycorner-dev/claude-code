---
name: security-audit
description: This skill should be used when the user asks to "identify vulnerabilities", "security audit", "check for OWASP", "implement authentication", "add encryption", "validate input", "fix security issues", "SQL injection", "XSS vulnerability", "CSRF protection", "secure the application", or mentions security concerns like "is this secure", "security review", or specific vulnerability types (command injection, path traversal, etc.).
version: 0.1.0
---

# Security Audit Skill

## Purpose

This skill provides comprehensive guidance for identifying security vulnerabilities, implementing authentication and authorization, adding encryption, and validating input. It focuses on the OWASP Top 10 vulnerabilities and common security patterns to help build secure applications.

## When to Use This Skill

Use this skill when:

- Conducting security audits of existing code
- Identifying potential vulnerabilities (OWASP Top 10)
- Implementing authentication and authorization systems
- Adding encryption for data protection
- Implementing input validation and sanitization
- Reviewing code for security issues
- Fixing identified security vulnerabilities
- Adding security headers and protections
- Implementing secure session management

## Core Security Principles

### Defense in Depth

Implement multiple layers of security controls:

- Never rely on a single security mechanism
- Validate at every trust boundary
- Assume external inputs are malicious
- Fail securely when errors occur

### Least Privilege

Grant minimum necessary permissions:

- Use minimal database permissions
- Restrict file system access
- Limit API access scopes
- Implement role-based access control (RBAC)

### Secure by Default

Build security into the foundation:

- Use secure defaults in configuration
- Require explicit opt-out of security features
- Enable security features automatically
- Make insecure options difficult to enable

## Security Audit Process

### Step 1: Identify Entry Points

Locate all points where external data enters the application:

- HTTP request parameters (query, body, headers, cookies)
- File uploads
- Database queries
- External API responses
- User input fields
- Environment variables
- Command-line arguments

### Step 2: Trace Data Flow

Follow data from entry points through the application:

- Track how input is processed
- Identify where input is used in sensitive operations
- Find where data is stored or transmitted
- Map trust boundaries

### Step 3: Check for Vulnerabilities

Systematically check for common vulnerability patterns:

- SQL/NoSQL injection points
- XSS (reflected, stored, DOM-based)
- Authentication and session issues
- Authorization bypasses
- Insecure deserialization
- Server-side request forgery (SSRF)
- Command injection
- Path traversal
- Cryptographic failures

### Step 4: Verify Security Controls

Confirm security mechanisms are properly implemented:

- Input validation exists and is effective
- Output encoding is applied correctly
- Authentication is required where needed
- Authorization checks are enforced
- Encryption is used for sensitive data
- Security headers are configured
- Error handling doesn't leak information

### Step 5: Test Edge Cases

Validate security under unusual conditions:

- Empty or null inputs
- Extremely long inputs
- Special characters and encoding
- Concurrent requests
- Race conditions
- Timeout scenarios

## Quick Vulnerability Checklist

Check code for these common issues:

**Injection Vulnerabilities:**

- [ ] SQL queries use parameterized statements or ORM
- [ ] NoSQL queries sanitize user input
- [ ] Command execution is avoided or properly sanitized
- [ ] LDAP queries are parameterized
- [ ] XML parsers disable external entities

**Authentication Issues:**

- [ ] Passwords are hashed with strong algorithms (bcrypt, Argon2)
- [ ] Multi-factor authentication is available
- [ ] Account lockout prevents brute force
- [ ] Session tokens are cryptographically random
- [ ] Logout invalidates sessions completely

**Authorization Issues:**

- [ ] Authorization checks on every sensitive operation
- [ ] Direct object references are protected
- [ ] Privilege escalation is prevented
- [ ] Horizontal access controls are enforced

**Data Protection:**

- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS for data in transit
- [ ] Secrets not hardcoded in code
- [ ] PII handling follows regulations

**Input Validation:**

- [ ] Whitelist validation for known formats
- [ ] Length limits enforced
- [ ] Type checking performed
- [ ] Special characters handled safely

## Critical Security Patterns

### Input Validation

Always validate input against expected format:

```python
# Whitelist approach (preferred)
import re

def validate_username(username):
    # Only allow alphanumeric and underscore
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValueError("Invalid username format")
    return username
```

### SQL Injection Prevention

Use parameterized queries or ORMs:

```python
# Parameterized query (safe)
cursor.execute(
    "SELECT * FROM users WHERE username = ? AND active = ?",
    (username, True)
)

# ORM (safe)
user = User.objects.filter(username=username, active=True).first()
```

### XSS Prevention

Escape output based on context:

```python
import html

# HTML context
safe_output = html.escape(user_input)

# JavaScript context - use JSON encoding
safe_js = json.dumps(user_input)
```

### Authentication

Hash passwords with strong algorithms:

```python
import bcrypt

# Hashing
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Verification
if bcrypt.checkpw(password.encode('utf-8'), hashed):
    # Authentication successful
    pass
```

### Authorization

Check permissions before sensitive operations:

```python
def delete_document(user, document_id):
    document = Document.get(document_id)

    # Authorization check
    if document.owner_id != user.id and not user.is_admin:
        raise PermissionError("Not authorized to delete this document")

    document.delete()
```

### Encryption

Use proven encryption libraries:

```python
from cryptography.fernet import Fernet

# Generate key (store securely)
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt
encrypted = cipher.encrypt(sensitive_data.encode())

# Decrypt
decrypted = cipher.decrypt(encrypted).decode()
```

## Security Headers

Configure these HTTP security headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Common Pitfalls to Avoid

**Don't:**

- Trust user input without validation
- Use string concatenation for SQL queries
- Store passwords in plain text or with weak hashing (MD5, SHA1)
- Roll your own cryptography
- Expose detailed error messages to users
- Use predictable session identifiers
- Disable security features during development
- Hardcode secrets in source code

**Do:**

- Validate all input at trust boundaries
- Use parameterized queries or ORMs
- Hash passwords with bcrypt, scrypt, or Argon2
- Use established crypto libraries
- Log errors securely, show generic messages to users
- Generate cryptographically random tokens
- Keep security enabled in all environments
- Use environment variables or secret management for credentials

## Additional Resources

### Reference Files

For detailed vulnerability information and implementation patterns:

- **`references/owasp-top-10.md`** - Comprehensive OWASP Top 10 vulnerability descriptions, detection methods, and remediation strategies
- **`references/security-patterns.md`** - Detailed implementation guides for authentication, authorization, encryption, and secure coding patterns across multiple languages

### Example Files

Working security implementation examples in `examples/`:

- **`examples/input-validation.py`** - Comprehensive input validation patterns
- **`examples/sql-injection-prevention.py`** - Safe database query patterns
- **`examples/xss-prevention.py`** - Output encoding for different contexts
- **`examples/authentication.py`** - Secure authentication implementation
- **`examples/authorization.py`** - Authorization check patterns

### Scripts

Security audit utilities in `scripts/`:

- **`scripts/security-scan.sh`** - Automated security scanning script using common tools
- **`scripts/check-secrets.sh`** - Scan for hardcoded secrets and credentials

## Language-Specific Guidance

When auditing or implementing security:

**Python:**

- Use parameterized queries with `?` placeholders
- Use `html.escape()` for HTML output
- Use `secrets` module for tokens
- Use `bcrypt` or `argon2` for password hashing

**JavaScript/Node.js:**

- Use parameterized queries or ORMs (Sequelize, TypeORM)
- Use template engines with auto-escaping (Handlebars, EJS)
- Use `crypto.randomBytes()` for tokens
- Use `bcrypt` package for password hashing

**Java:**

- Use `PreparedStatement` for SQL queries
- Use OWASP Java Encoder for output encoding
- Use `SecureRandom` for tokens
- Use `BCrypt` or `Argon2` for password hashing

**PHP:**

- Use PDO with prepared statements
- Use `htmlspecialchars()` with `ENT_QUOTES`
- Use `random_bytes()` for tokens
- Use `password_hash()` with `PASSWORD_BCRYPT` or `PASSWORD_ARGON2ID`

## Workflow for Security Fixes

When fixing identified vulnerabilities:

1. **Understand the vulnerability**: Read `references/owasp-top-10.md` for detailed information
2. **Locate all instances**: Search codebase for similar patterns
3. **Implement fix**: Apply secure pattern from `references/security-patterns.md`
4. **Verify fix**: Test that vulnerability is eliminated
5. **Check for regressions**: Ensure functionality still works
6. **Document changes**: Note security improvements made

## Testing Security Implementations

After implementing security controls:

- Test with malicious input patterns
- Verify error handling doesn't leak information
- Confirm authorization checks can't be bypassed
- Test authentication with invalid credentials
- Verify encryption is applied correctly
- Check security headers are present

## Reporting Security Issues

When documenting security findings:

- Describe the vulnerability type
- Show the vulnerable code location
- Explain the potential impact
- Provide proof of concept if applicable
- Suggest remediation approach
- Reference OWASP or CWE identifier

## Progressive Learning Path

**Start with:**

- Input validation patterns
- SQL injection prevention
- Basic XSS prevention

**Then move to:**

- Authentication implementation
- Authorization patterns
- Encryption usage

**Finally cover:**

- Advanced OWASP Top 10 items
- Security architecture
- Threat modeling

Consult reference files for detailed information on specific topics as needed.
