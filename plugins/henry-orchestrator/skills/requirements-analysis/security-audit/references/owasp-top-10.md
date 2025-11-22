# OWASP Top 10 Vulnerabilities (2021)

This reference provides comprehensive information about the OWASP Top 10 security risks, including detection methods, exploitation scenarios, and detailed remediation strategies.

## A01:2021 – Broken Access Control

### Description

Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data, or performing business functions outside user limits.

### Common Vulnerabilities

- **Insecure Direct Object References (IDOR)**: Accessing resources by manipulating IDs without authorization checks
- **Missing function-level access control**: Accessing administrative functions without proper authorization
- **Elevation of privilege**: Acting as a user without being logged in or as an admin when logged in as a user
- **Metadata manipulation**: Replaying or tampering with JWT tokens, cookies, or hidden fields
- **CORS misconfiguration**: Allowing unauthorized API access from arbitrary origins
- **Force browsing**: Accessing authenticated pages as an unauthenticated user

### Detection

```python
# Vulnerable pattern
@app.route('/api/document/<doc_id>')
def get_document(doc_id):
    doc = Document.query.get(doc_id)
    return jsonify(doc.to_dict())  # No authorization check!
```

Search for:

- Routes or endpoints that accept IDs without checking ownership
- Admin functionality without role checks
- Database queries using user-supplied IDs directly
- Missing authorization decorators or middleware

### Exploitation Example

```
GET /api/document/123  # User owns this document
GET /api/document/124  # Try accessing another user's document
GET /api/document/125  # Iterate through IDs
```

### Remediation

```python
# Secure implementation
@app.route('/api/document/<doc_id>')
@login_required
def get_document(doc_id):
    doc = Document.query.get_or_404(doc_id)

    # Authorization check
    if doc.owner_id != current_user.id and not current_user.is_admin:
        abort(403, "Not authorized to access this document")

    return jsonify(doc.to_dict())
```

**Key principles:**

- Deny by default
- Implement access control checks at every endpoint
- Verify ownership or permissions before operations
- Use attribute-based or role-based access control
- Log access control failures for monitoring

### Testing

```python
# Test unauthorized access
def test_access_control():
    # Create documents for two users
    user1_doc = create_document(owner=user1)
    user2_doc = create_document(owner=user2)

    # Try to access user2's doc as user1
    response = client.get(f'/api/document/{user2_doc.id}',
                         headers={'Authorization': f'Bearer {user1_token}'})

    assert response.status_code == 403  # Should be forbidden
```

## A02:2021 – Cryptographic Failures

### Description

Failures related to cryptography (or lack thereof) often lead to exposure of sensitive data. This includes passwords, health records, personal information, business secrets, and credit cards.

### Common Vulnerabilities

- **Weak encryption algorithms**: Using DES, RC4, MD5, SHA1
- **Insufficient key length**: Using short RSA keys (<2048 bits)
- **Hard-coded encryption keys**: Keys stored in source code
- **Transmitting sensitive data in clear text**: No HTTPS, unencrypted databases
- **Weak random number generation**: Using predictable randomness
- **Improper certificate validation**: Accepting self-signed or expired certificates

### Detection

```python
# Vulnerable patterns
password_hash = hashlib.md5(password.encode()).hexdigest()  # MD5 is broken
key = b'hardcoded_key_12'  # Hard-coded key
cipher = DES.new(key)  # Weak algorithm

# Unencrypted transmission
conn = mysql.connector.connect(host='db', ssl_disabled=True)

# Weak randomness
token = str(random.randint(1000000, 9999999))  # Predictable
```

Search for:

- Use of MD5, SHA1, DES, RC4, ECB mode
- `random.random()` for security purposes
- HTTP URLs for sensitive operations
- Database connections without TLS
- Hard-coded encryption keys or passwords

### Exploitation Example

```python
# MD5 rainbow table attack
md5_hash = "5f4dcc3b5aa765d61d8327deb882cf99"
# Reverse lookup reveals password: "password"

# Predictable token brute force
for i in range(1000000, 9999999):
    if try_reset_token(str(i)):
        print(f"Found valid token: {i}")
        break
```

### Remediation

```python
# Strong password hashing
import bcrypt

# Hash password
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12))

# Verify password
if bcrypt.checkpw(password.encode('utf-8'), hashed):
    # Authentication successful
    pass

# Strong encryption
from cryptography.fernet import Fernet

# Generate and store key securely (not in code!)
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt
encrypted = cipher.encrypt(sensitive_data.encode())

# Decrypt
decrypted = cipher.decrypt(encrypted).decode()

# Cryptographically secure random tokens
import secrets

token = secrets.token_urlsafe(32)  # 256 bits of randomness

# Force HTTPS
@app.before_request
def force_https():
    if not request.is_secure and not app.debug:
        return redirect(request.url.replace('http://', 'https://'))

# Secure database connection
conn = mysql.connector.connect(
    host='db',
    ssl_ca='/path/to/ca.pem',
    ssl_verify_cert=True
)
```

**Key principles:**

- Use strong, modern algorithms (AES-256, RSA-2048+, SHA-256+)
- Use bcrypt, scrypt, or Argon2 for password hashing
- Never hard-code secrets
- Use TLS 1.2+ for all sensitive data transmission
- Use `secrets` module (Python) for cryptographically secure randomness
- Implement proper key management

## A03:2021 – Injection

### Description

Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization.

### Types of Injection

1. **SQL Injection**: Injecting SQL commands
2. **NoSQL Injection**: Injecting NoSQL queries (MongoDB, etc.)
3. **LDAP Injection**: Injecting LDAP queries
4. **OS Command Injection**: Injecting shell commands
5. **XML Injection**: Injecting XML or XXE
6. **Expression Language Injection**: Injecting template expressions

### SQL Injection

**Vulnerable code:**

```python
# String concatenation (NEVER DO THIS)
query = "SELECT * FROM users WHERE username = '" + username + "'"
cursor.execute(query)
```

**Exploitation:**

```
Username: admin' OR '1'='1' --
Resulting query: SELECT * FROM users WHERE username = 'admin' OR '1'='1' --'
Result: Bypasses authentication, returns all users
```

**Advanced exploitation:**

```
Username: admin'; DROP TABLE users; --
Resulting query: SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --'
Result: Deletes entire users table
```

**Remediation:**

```python
# Parameterized query (ALWAYS USE THIS)
query = "SELECT * FROM users WHERE username = ?"
cursor.execute(query, (username,))

# Or use ORM
user = User.objects.filter(username=username).first()
```

### NoSQL Injection

**Vulnerable code:**

```python
# Direct insertion of user input
users.find({"username": username, "password": password})
```

**Exploitation:**

```json
{
  "username": { "$ne": null },
  "password": { "$ne": null }
}
```

Result: Returns all users (authentication bypass)

**Remediation:**

```python
# Sanitize input
username = str(username)  # Ensure string type
password = str(password)

# Use strict matching
users.find_one({"username": {"$eq": username}, "password": {"$eq": password}})
```

### Command Injection

**Vulnerable code:**

```python
# Shell command with user input (DANGEROUS)
import os
filename = request.args.get('file')
os.system(f'cat {filename}')
```

**Exploitation:**

```
filename: file.txt; rm -rf /
Resulting command: cat file.txt; rm -rf /
Result: Deletes entire filesystem
```

**Remediation:**

```python
# Avoid shell commands entirely
with open(filename, 'r') as f:
    content = f.read()

# If shell command is absolutely necessary
import subprocess
import shlex

# Validate input
if not re.match(r'^[a-zA-Z0-9_.-]+$', filename):
    raise ValueError("Invalid filename")

# Use argument list (no shell interpretation)
subprocess.run(['cat', filename], shell=False, check=True)
```

### XML External Entity (XXE) Injection

**Vulnerable code:**

```python
import xml.etree.ElementTree as ET

xml_data = request.data
tree = ET.fromstring(xml_data)  # Vulnerable to XXE
```

**Exploitation:**

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```

**Remediation:**

```python
import defusedxml.ElementTree as ET

# Use defusedxml library
tree = ET.fromstring(xml_data)  # Safe from XXE

# Or disable external entities
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import XMLParser

class SafeXMLParser(XMLParser):
    def __init__(self):
        super().__init__()
        self.entity = {}  # Disable entity expansion

parser = SafeXMLParser()
tree = ET.fromstring(xml_data, parser=parser)
```

### Detection Patterns

Search codebase for:

```python
# SQL injection risks
execute(" + variable)
execute(f"SELECT")
execute("...{variable}...")

# Command injection risks
os.system(
subprocess.call(..., shell=True)
eval(
exec(

# NoSQL injection risks
find({user_input})
$where
$regex with user input
```

### General Remediation Principles

1. **Use parameterized queries**: Always use prepared statements or ORMs
2. **Validate input**: Whitelist validation against expected format
3. **Escape special characters**: Context-specific escaping
4. **Least privilege**: Database user should have minimal permissions
5. **Avoid shell execution**: Use libraries instead of shell commands
6. **Use safe APIs**: Use ORMs, avoid string concatenation

## A04:2021 – Insecure Design

### Description

Insecure design represents missing or ineffective control design. It's different from insecure implementation - even perfect implementation cannot fix insecure design.

### Common Issues

- **Missing security controls**: No rate limiting, no account lockout
- **Weak threat modeling**: Not considering security during design
- **Unlimited resource consumption**: No quotas or throttling
- **Missing business logic validation**: Trust client-side validation only
- **Insufficient separation of tenants**: Multi-tenant data leakage

### Examples and Remediation

**Issue: Unlimited password attempts**

```python
# Insecure design (no rate limiting)
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if check_password(username, password):
        return "Success"
    return "Failed"
```

**Secure design:**

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # Rate limiting
def login():
    username = request.form['username']
    password = request.form['password']

    # Check account lockout
    if is_account_locked(username):
        return "Account locked", 403

    if check_password(username, password):
        reset_failed_attempts(username)
        return "Success"

    increment_failed_attempts(username)
    if get_failed_attempts(username) >= 5:
        lock_account(username)

    return "Failed", 401
```

**Issue: Missing business logic validation**

```python
# Client-side validation only
# Frontend: if (quantity <= 100) submitOrder()

# Insecure backend
@app.route('/order', methods=['POST'])
def place_order():
    quantity = request.json['quantity']
    # No server-side validation!
    process_order(quantity)
```

**Secure design:**

```python
@app.route('/order', methods=['POST'])
def place_order():
    quantity = request.json['quantity']

    # Server-side validation
    if quantity < 1 or quantity > 100:
        return "Invalid quantity", 400

    # Check user's available quota
    if quantity > get_user_quota(current_user):
        return "Exceeds quota", 400

    process_order(quantity)
```

### Design Security Controls

Implement these controls during design phase:

1. **Authentication**: Multi-factor, account lockout, session management
2. **Authorization**: Role-based access control, least privilege
3. **Rate limiting**: Per user, per IP, per endpoint
4. **Input validation**: Server-side, whitelist approach
5. **Monitoring**: Logging, alerting, anomaly detection
6. **Resilience**: Graceful degradation, circuit breakers

## A05:2021 – Security Misconfiguration

### Description

Security misconfiguration can happen at any level of the application stack, including network services, platform, web server, application server, database, frameworks, custom code, and cloud services.

### Common Misconfigurations

- **Default credentials**: Using default admin/admin
- **Unnecessary features**: Enabled debugging, sample applications
- **Verbose error messages**: Stack traces exposed to users
- **Missing security headers**: No CSP, HSTS, X-Frame-Options
- **Outdated software**: Unpatched vulnerabilities
- **Permissive CORS**: Allowing all origins
- **Open cloud storage**: Public S3 buckets

### Detection and Remediation

**Issue: Debug mode in production**

```python
# Insecure
app = Flask(__name__)
app.debug = True  # NEVER in production
app.run()
```

**Secure:**

```python
app = Flask(__name__)
app.debug = False
app.config['TESTING'] = False

# Use environment variable
if os.environ.get('FLASK_ENV') == 'development':
    app.debug = True
```

**Issue: Verbose error messages**

```python
# Insecure
@app.errorhandler(Exception)
def handle_error(e):
    return str(e), 500  # Exposes stack trace
```

**Secure:**

```python
import logging

@app.errorhandler(Exception)
def handle_error(e):
    # Log detailed error securely
    logging.error(f"Error occurred: {e}", exc_info=True)

    # Return generic message to user
    return "An error occurred. Please try again later.", 500
```

**Issue: Missing security headers**

```python
# Secure implementation
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response
```

**Issue: Permissive CORS**

```python
# Insecure
from flask_cors import CORS
CORS(app, origins='*')  # Allows all origins

# Secure
CORS(app, origins=[
    'https://trusted-domain.com',
    'https://app.example.com'
])
```

### Configuration Checklist

- [ ] Remove default accounts and passwords
- [ ] Disable unnecessary features and services
- [ ] Configure proper error handling (no stack traces)
- [ ] Set all security headers
- [ ] Keep all software up to date
- [ ] Use restrictive CORS policy
- [ ] Configure secure cloud storage (private by default)
- [ ] Implement strong TLS configuration
- [ ] Disable directory listing
- [ ] Remove sample/test code from production

## A06:2021 – Vulnerable and Outdated Components

### Description

Using components with known vulnerabilities. This includes libraries, frameworks, and other software modules that run with the same privileges as the application.

### Detection

```bash
# Python
pip list --outdated
pip-audit  # Check for known vulnerabilities

# Node.js
npm audit
npm outdated

# Ruby
bundle audit

# Java
mvn versions:display-dependency-updates
```

### Remediation

**Maintain inventory:**

```
# requirements.txt with pinned versions
Flask==2.3.0
cryptography==41.0.0
requests==2.31.0
```

**Regular updates:**

```bash
# Update dependencies
pip install --upgrade pip-audit
pip-audit --fix

# Or use automated tools
# - Dependabot (GitHub)
# - Renovate
# - Snyk
```

**Vulnerability scanning in CI/CD:**

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: |
          pip install pip-audit
          pip-audit
```

### Best Practices

- Only use components from official sources
- Monitor for security bulletins (CVEs)
- Remove unused dependencies
- Pin dependency versions
- Use software composition analysis (SCA) tools
- Have update process in place

## A07:2021 – Identification and Authentication Failures

### Description

Confirmation of user identity, authentication, and session management is critical. Authentication failures include weak passwords, credential stuffing, session hijacking, and broken authentication flows.

### Common Issues

- **Weak password policy**: No complexity requirements
- **Credential stuffing**: No protection against automated attacks
- **Weak session management**: Predictable session IDs
- **Session fixation**: Accepting session IDs from URLs
- **No multi-factor authentication**: Single factor only
- **Insecure password recovery**: Weak security questions

### Session Management

**Insecure:**

```python
# Predictable session ID
session_id = str(int(time.time()))

# Session never expires
session[user_id] = username
```

**Secure:**

```python
import secrets
from datetime import datetime, timedelta

# Cryptographically random session ID
session_id = secrets.token_urlsafe(32)

# Set expiration
session_data = {
    'user_id': user_id,
    'created_at': datetime.utcnow(),
    'expires_at': datetime.utcnow() + timedelta(hours=2)
}

# Regenerate session on authentication
@app.route('/login', methods=['POST'])
def login():
    if authenticate(username, password):
        # Regenerate session to prevent fixation
        session.clear()
        session.regenerate()
        session['user_id'] = user.id
        return "Success"
```

### Password Policy

```python
import re

def validate_password(password):
    """
    Enforce strong password policy:
    - Minimum 12 characters
    - At least one uppercase
    - At least one lowercase
    - At least one digit
    - At least one special character
    """
    if len(password) < 12:
        raise ValueError("Password must be at least 12 characters")

    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain uppercase letter")

    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain lowercase letter")

    if not re.search(r'[0-9]', password):
        raise ValueError("Password must contain digit")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError("Password must contain special character")

    # Check against common passwords
    if password.lower() in COMMON_PASSWORDS:
        raise ValueError("Password is too common")

    return True
```

### Multi-Factor Authentication

```python
import pyotp

def setup_2fa(user):
    # Generate secret
    secret = pyotp.random_base32()
    user.mfa_secret = secret
    user.save()

    # Generate QR code URI for authenticator app
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email,
        issuer_name="YourApp"
    )
    return totp_uri

def verify_2fa(user, token):
    totp = pyotp.TOTP(user.mfa_secret)
    return totp.verify(token, valid_window=1)

@app.route('/login', methods=['POST'])
def login():
    if check_password(username, password):
        if user.mfa_enabled:
            # Require MFA token
            session['pending_2fa'] = user.id
            return "Provide MFA token", 200

        # Full login
        session['user_id'] = user.id
        return "Success"

@app.route('/verify-2fa', methods=['POST'])
def verify_mfa():
    user_id = session.get('pending_2fa')
    token = request.json['token']

    if verify_2fa(user, token):
        session.pop('pending_2fa')
        session['user_id'] = user_id
        return "Success"

    return "Invalid token", 401
```

## A08:2021 – Software and Data Integrity Failures

### Description

Code and infrastructure that does not protect against integrity violations, such as using unverified software updates, CI/CD pipelines without integrity checks, or insecure deserialization.

### Insecure Deserialization

**Vulnerable:**

```python
import pickle

# NEVER do this with untrusted data
user_data = pickle.loads(request.data)
```

**Exploitation:**

```python
import pickle
import os

class Exploit:
    def __reduce__(self):
        return (os.system, ('rm -rf /',))

malicious_data = pickle.dumps(Exploit())
# When unpickled, executes arbitrary code
```

**Secure:**

```python
import json

# Use JSON instead of pickle
user_data = json.loads(request.data)

# If you must deserialize, validate strictly
import jsonschema

schema = {
    "type": "object",
    "properties": {
        "username": {"type": "string", "maxLength": 50},
        "age": {"type": "integer", "minimum": 0, "maximum": 150}
    },
    "required": ["username"]
}

data = json.loads(request.data)
jsonschema.validate(data, schema)
```

### Dependency Integrity

```yaml
# Use lock files to ensure integrity
# Python: requirements.txt with hashes
cryptography==41.0.0 \
--hash=sha256:7b3b3...
# Node.js: package-lock.json (committed)
# Ruby: Gemfile.lock (committed)
```

### CI/CD Pipeline Security

```yaml
# GitHub Actions example
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Verify dependencies
      - name: Verify checksums
        run: |
          sha256sum -c checksums.txt

      # Sign artifacts
      - name: Sign release
        run: |
          gpg --sign --armor --detach-sig artifact.tar.gz

      # Use environment secrets (not hardcoded)
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          ./deploy.sh
```

## A09:2021 – Security Logging and Monitoring Failures

### Description

Insufficient logging and monitoring, coupled with missing or ineffective integration with incident response, allows attackers to persist, pivot, and extract data.

### What to Log

**Security events to log:**

```python
import logging
from datetime import datetime

# Configure secure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('/var/log/app/security.log'),
        logging.StreamHandler()
    ]
)

security_logger = logging.getLogger('security')

# Authentication events
security_logger.info(f"Login success: user={username} ip={request.remote_addr}")
security_logger.warning(f"Login failed: user={username} ip={request.remote_addr}")

# Authorization failures
security_logger.warning(f"Access denied: user={user.id} resource={resource_id} action={action}")

# Input validation failures
security_logger.warning(f"Invalid input: field={field} value={value[:20]} ip={request.remote_addr}")

# Configuration changes
security_logger.info(f"Config changed: setting={setting_name} by={admin.id}")

# Elevated privilege usage
security_logger.info(f"Admin action: action={action} by={admin.id}")
```

**What NOT to log:**

```python
# NEVER log sensitive data
logging.info(f"Password: {password}")  # NO!
logging.info(f"Credit card: {card_number}")  # NO!
logging.info(f"SSN: {ssn}")  # NO!
logging.info(f"Session token: {token}")  # NO!

# Sanitize before logging
logging.info(f"User email: {email}")  # Consider privacy
logging.info(f"Card last 4: ****{card[-4:]}")  # OK
```

### Alerting

```python
def send_security_alert(event_type, details):
    """Send alert for critical security events"""
    if event_type in ['account_lockout', 'multiple_failed_logins',
                      'privilege_escalation', 'data_exfiltration']:
        # Send to SIEM, security team, etc.
        alert_security_team(event_type, details)

# Example usage
failed_attempts = get_failed_attempts(username)
if failed_attempts >= 5:
    send_security_alert('multiple_failed_logins', {
        'username': username,
        'ip': request.remote_addr,
        'attempts': failed_attempts
    })
```

### Log Protection

```python
# Ensure logs are write-only for application
import os
import stat

log_file = '/var/log/app/security.log'

# Set permissions: owner read/write only
os.chmod(log_file, stat.S_IRUSR | stat.S_IWUSR)

# Rotate logs
import logging.handlers

handler = logging.handlers.RotatingFileHandler(
    log_file,
    maxBytes=10485760,  # 10MB
    backupCount=10
)
```

## A10:2021 – Server-Side Request Forgery (SSRF)

### Description

SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL. This allows an attacker to coerce the application to send requests to an unintended destination.

### Vulnerable Code

```python
import requests

@app.route('/fetch')
def fetch_url():
    url = request.args.get('url')
    # DANGEROUS: No validation
    response = requests.get(url)
    return response.content
```

### Exploitation

```
# Access internal services
/fetch?url=http://localhost:6379/  # Redis
/fetch?url=http://169.254.169.254/latest/meta-data/  # AWS metadata

# Port scanning
/fetch?url=http://internal-host:22
/fetch?url=http://internal-host:3306

# File access (if supported)
/fetch?url=file:///etc/passwd
```

### Remediation

```python
from urllib.parse import urlparse
import ipaddress
import requests

# Allowlist of permitted domains
ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com']

# Blocklist of internal IP ranges
BLOCKED_NETWORKS = [
    ipaddress.ip_network('10.0.0.0/8'),
    ipaddress.ip_network('172.16.0.0/12'),
    ipaddress.ip_network('192.168.0.0/16'),
    ipaddress.ip_network('127.0.0.0/8'),
    ipaddress.ip_network('169.254.0.0/16'),
]

def is_safe_url(url):
    """Validate URL against SSRF"""
    try:
        parsed = urlparse(url)

        # Only allow HTTP/HTTPS
        if parsed.scheme not in ['http', 'https']:
            return False

        # Check domain allowlist
        if parsed.hostname not in ALLOWED_DOMAINS:
            return False

        # Resolve hostname to IP
        import socket
        ip = socket.gethostbyname(parsed.hostname)
        ip_obj = ipaddress.ip_address(ip)

        # Check if IP is in blocked ranges
        for network in BLOCKED_NETWORKS:
            if ip_obj in network:
                return False

        return True

    except Exception as e:
        logging.error(f"URL validation error: {e}")
        return False

@app.route('/fetch')
def fetch_url():
    url = request.args.get('url')

    if not is_safe_url(url):
        return "Invalid URL", 400

    try:
        # Use timeout to prevent DoS
        response = requests.get(url, timeout=5, allow_redirects=False)
        return response.content
    except requests.RequestException as e:
        logging.error(f"Fetch error: {e}")
        return "Error fetching URL", 500
```

### Defense in Depth

```python
# 1. Network segmentation
# Isolate application servers from internal services

# 2. Firewall rules
# Block outbound requests from app servers to internal IPs

# 3. Use dedicated service for external requests
# Proxy through controlled service with strict rules

# 4. Implement rate limiting
@limiter.limit("10 per minute")
@app.route('/fetch')
def fetch_url():
    # ... validation code ...
```

## Summary Table

| Vulnerability             | Key Prevention                                        |
| ------------------------- | ----------------------------------------------------- |
| Broken Access Control     | Implement authorization checks everywhere             |
| Cryptographic Failures    | Use strong algorithms, TLS, proper key management     |
| Injection                 | Parameterized queries, input validation               |
| Insecure Design           | Security controls in design phase                     |
| Security Misconfiguration | Secure defaults, minimal privileges, security headers |
| Vulnerable Components     | Keep dependencies updated, scan for CVEs              |
| Auth Failures             | Strong passwords, MFA, secure session management      |
| Integrity Failures        | Validate deseriali zation, verify dependencies        |
| Logging Failures          | Log security events, protect logs, alert on anomalies |
| SSRF                      | Validate URLs, blocklist internal IPs, use allowlists |

## Testing Tools

- **SAST (Static Analysis)**: Bandit (Python), ESLint (JS), SonarQube
- **DAST (Dynamic Analysis)**: OWASP ZAP, Burp Suite
- **Dependency Scanning**: pip-audit, npm audit, Snyk
- **Secret Scanning**: TruffleHog, git-secrets
- **Container Scanning**: Trivy, Clair

Always combine automated tools with manual security review for comprehensive coverage.
