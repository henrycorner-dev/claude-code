# Security Implementation Patterns

This reference provides detailed implementation patterns for authentication, authorization, encryption, input validation, and other security controls across multiple programming languages.

## Table of Contents

1. [Authentication Patterns](#authentication-patterns)
2. [Authorization Patterns](#authorization-patterns)
3. [Input Validation Patterns](#input-validation-patterns)
4. [Encryption Patterns](#encryption-patterns)
5. [Session Management](#session-management)
6. [API Security](#api-security)
7. [Password Management](#password-management)
8. [Secure Data Storage](#secure-data-storage)
9. [Security Headers](#security-headers)
10. [Rate Limiting](#rate-limiting)

## Authentication Patterns

### Password-Based Authentication

#### Python (Flask)

```python
from flask import Flask, request, session, jsonify
import bcrypt
from functools import wraps

app = Flask(__name__)
app.secret_key = 'use-environment-variable-here'

# Password hashing
def hash_password(password):
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12))

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Registration endpoint
@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    # Validate input
    if not username or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    if len(password) < 12:
        return jsonify({'error': 'Password too short'}), 400

    # Check if user exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'User already exists'}), 409

    # Create user
    hashed_password = hash_password(password)
    user = User(username=username, password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created'}), 201

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    # Rate limiting should be applied here

    user = User.query.filter_by(username=username).first()

    if not user or not verify_password(password, user.password_hash):
        # Don't reveal whether username or password was wrong
        return jsonify({'error': 'Invalid credentials'}), 401

    # Check if account is locked
    if user.is_locked:
        return jsonify({'error': 'Account locked'}), 403

    # Regenerate session to prevent fixation
    session.clear()
    session.regenerate()
    session['user_id'] = user.id

    return jsonify({'message': 'Login successful'}), 200

# Logout endpoint
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200

# Protected resource
@app.route('/profile')
@login_required
def profile():
    user = User.query.get(session['user_id'])
    return jsonify({
        'username': user.username,
        'email': user.email
    })
```

#### Node.js (Express)

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,  // HTTPS only
        httpOnly: true,  // No JS access
        maxAge: 3600000,  // 1 hour
        sameSite: 'strict'
    }
}));

// Middleware for authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    if (password.length < 12) {
        return res.status(400).json({ error: 'Password too short' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({ username, passwordHash });
    await user.save();

    res.status(201).json({ message: 'User created' });
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isLocked) {
        return res.status(403).json({ error: 'Account locked' });
    }

    // Regenerate session
    req.session.regenerate((err) => {
        if (err) {
            return res.status(500).json({ error: 'Session error' });
        }

        req.session.userId = user._id;
        res.json({ message: 'Login successful' });
    });
});

// Logout
app.post('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out' });
    });
});

// Protected route
app.get('/profile', requireAuth, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.json({
        username: user.username,
        email: user.email
    });
});
```

### JWT-Based Authentication

#### Python (Flask)

```python
import jwt
from datetime import datetime, timedelta
from functools import wraps

SECRET_KEY = 'use-environment-variable-here'
ALGORITHM = 'HS256'

def create_access_token(user_id):
    """Create JWT access token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id):
    """Create JWT refresh token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30),
        'iat': datetime.utcnow(),
        'type': 'refresh'
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None

        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # "Bearer <token>"
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401

        if not token:
            return jsonify({'error': 'Token missing'}), 401

        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        # Add user_id to request context
        request.user_id = payload['user_id']

        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Create tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }), 200

@app.route('/refresh', methods=['POST'])
def refresh():
    refresh_token = request.json.get('refresh_token')

    if not refresh_token:
        return jsonify({'error': 'Refresh token missing'}), 401

    payload = verify_token(refresh_token)

    if not payload or payload.get('type') != 'refresh':
        return jsonify({'error': 'Invalid refresh token'}), 401

    # Issue new access token
    access_token = create_access_token(payload['user_id'])

    return jsonify({
        'access_token': access_token,
        'token_type': 'Bearer'
    }), 200

@app.route('/protected')
@jwt_required
def protected():
    user = User.query.get(request.user_id)
    return jsonify({'message': f'Hello, {user.username}!'})
```

### Multi-Factor Authentication (MFA)

```python
import pyotp
import qrcode
from io import BytesIO
import base64

def setup_totp(user):
    """Set up TOTP-based 2FA for user"""
    # Generate secret
    secret = pyotp.random_base32()

    # Save to user (encrypted)
    user.mfa_secret = secret
    user.save()

    # Generate provisioning URI
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email,
        issuer_name="YourApp"
    )

    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64 for display
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return {
        'secret': secret,
        'qr_code': f'data:image/png;base64,{img_str}',
        'uri': totp_uri
    }

def verify_totp(user, token):
    """Verify TOTP token"""
    totp = pyotp.TOTP(user.mfa_secret)
    # valid_window=1 allows for time drift
    return totp.verify(token, valid_window=1)

@app.route('/setup-2fa', methods=['POST'])
@login_required
def setup_2fa():
    user = User.query.get(session['user_id'])

    if user.mfa_enabled:
        return jsonify({'error': '2FA already enabled'}), 400

    setup_data = setup_totp(user)

    return jsonify({
        'secret': setup_data['secret'],
        'qr_code': setup_data['qr_code']
    })

@app.route('/enable-2fa', methods=['POST'])
@login_required
def enable_2fa():
    user = User.query.get(session['user_id'])
    token = request.json.get('token')

    # Verify token before enabling
    if not verify_totp(user, token):
        return jsonify({'error': 'Invalid token'}), 401

    user.mfa_enabled = True
    user.save()

    # Generate backup codes
    backup_codes = [secrets.token_hex(4) for _ in range(10)]
    user.backup_codes = [hash_password(code) for code in backup_codes]
    user.save()

    return jsonify({
        'message': '2FA enabled',
        'backup_codes': backup_codes  # Show once, user must save
    })

@app.route('/login-2fa', methods=['POST'])
def login_2fa():
    # After successful password authentication
    pending_user_id = session.get('pending_2fa')
    token = request.json.get('token')

    if not pending_user_id:
        return jsonify({'error': 'No pending 2FA'}), 400

    user = User.query.get(pending_user_id)

    # Try TOTP token
    if verify_totp(user, token):
        session.pop('pending_2fa')
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'})

    # Try backup code
    for backup_hash in user.backup_codes:
        if verify_password(token, backup_hash):
            # Remove used backup code
            user.backup_codes.remove(backup_hash)
            user.save()

            session.pop('pending_2fa')
            session['user_id'] = user.id
            return jsonify({'message': 'Login successful (backup code used)'})

    return jsonify({'error': 'Invalid token'}), 401
```

## Authorization Patterns

### Role-Based Access Control (RBAC)

```python
from enum import Enum
from functools import wraps

class Role(Enum):
    USER = 'user'
    MODERATOR = 'moderator'
    ADMIN = 'admin'

class Permission(Enum):
    READ = 'read'
    WRITE = 'write'
    DELETE = 'delete'
    ADMIN = 'admin'

# Role permissions mapping
ROLE_PERMISSIONS = {
    Role.USER: [Permission.READ, Permission.WRITE],
    Role.MODERATOR: [Permission.READ, Permission.WRITE, Permission.DELETE],
    Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN]
}

def has_permission(user, permission):
    """Check if user has permission"""
    if not user or not user.role:
        return False

    role_perms = ROLE_PERMISSIONS.get(user.role, [])
    return permission in role_perms

def require_permission(permission):
    """Decorator to require specific permission"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Authentication required'}), 401

            user = User.query.get(session['user_id'])

            if not has_permission(user, permission):
                return jsonify({'error': 'Insufficient permissions'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_role(role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Authentication required'}), 401

            user = User.query.get(session['user_id'])

            if user.role != role:
                return jsonify({'error': 'Insufficient permissions'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Usage examples
@app.route('/posts/<post_id>', methods=['DELETE'])
@require_permission(Permission.DELETE)
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)

    # Additional authorization: check ownership
    user = User.query.get(session['user_id'])
    if post.author_id != user.id and user.role != Role.ADMIN:
        return jsonify({'error': 'Not authorized'}), 403

    post.delete()
    return jsonify({'message': 'Post deleted'}), 200

@app.route('/admin/users')
@require_role(Role.ADMIN)
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])
```

### Attribute-Based Access Control (ABAC)

```python
from dataclasses import dataclass
from typing import Any, Dict

@dataclass
class AccessContext:
    """Context for access control decision"""
    user: Any
    resource: Any
    action: str
    environment: Dict[str, Any]

class Policy:
    """Access control policy"""

    def evaluate(self, context: AccessContext) -> bool:
        """Evaluate if access should be granted"""
        raise NotImplementedError

class OwnershipPolicy(Policy):
    """Allow access to own resources"""

    def evaluate(self, context: AccessContext) -> bool:
        return context.resource.owner_id == context.user.id

class AdminPolicy(Policy):
    """Allow access for admins"""

    def evaluate(self, context: AccessContext) -> bool:
        return context.user.role == Role.ADMIN

class TimeBasedPolicy(Policy):
    """Allow access during business hours"""

    def evaluate(self, context: AccessContext) -> bool:
        from datetime import datetime
        hour = datetime.now().hour
        return 9 <= hour <= 17  # 9 AM to 5 PM

class DepartmentPolicy(Policy):
    """Allow access within same department"""

    def evaluate(self, context: AccessContext) -> bool:
        return context.user.department == context.resource.department

class PolicyEngine:
    """Evaluate multiple policies"""

    def __init__(self, policies: list[Policy]):
        self.policies = policies

    def authorize(self, context: AccessContext) -> bool:
        """Return True if any policy grants access"""
        return any(policy.evaluate(context) for policy in self.policies)

# Usage
def authorize_action(user, resource, action):
    """Check if user can perform action on resource"""
    context = AccessContext(
        user=user,
        resource=resource,
        action=action,
        environment={'ip': request.remote_addr}
    )

    # Define policies for this action
    policies = [
        OwnershipPolicy(),
        AdminPolicy()
    ]

    engine = PolicyEngine(policies)
    return engine.authorize(context)

@app.route('/documents/<doc_id>', methods=['PUT'])
@login_required
def update_document(doc_id):
    document = Document.query.get_or_404(doc_id)
    user = User.query.get(session['user_id'])

    if not authorize_action(user, document, 'update'):
        return jsonify({'error': 'Not authorized'}), 403

    # Perform update
    document.content = request.json.get('content')
    document.save()

    return jsonify({'message': 'Document updated'})
```

## Input Validation Patterns

### Whitelist Validation

```python
import re
from typing import Any, Optional

class ValidationError(Exception):
    """Custom validation exception"""
    pass

def validate_username(username: str) -> str:
    """Validate username format"""
    if not isinstance(username, str):
        raise ValidationError("Username must be a string")

    # Whitelist: only alphanumeric and underscore
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValidationError("Username must be 3-20 alphanumeric characters or underscore")

    return username

def validate_email(email: str) -> str:
    """Validate email format"""
    if not isinstance(email, str):
        raise ValidationError("Email must be a string")

    # Basic email pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")

    if len(email) > 254:  # RFC 5321
        raise ValidationError("Email too long")

    return email.lower()

def validate_integer(value: Any, min_val: Optional[int] = None,
                     max_val: Optional[int] = None) -> int:
    """Validate integer with optional range"""
    try:
        int_val = int(value)
    except (TypeError, ValueError):
        raise ValidationError("Must be an integer")

    if min_val is not None and int_val < min_val:
        raise ValidationError(f"Must be at least {min_val}")

    if max_val is not None and int_val > max_val:
        raise ValidationError(f"Must be at most {max_val}")

    return int_val

def validate_enum(value: str, allowed_values: set) -> str:
    """Validate value against whitelist"""
    if value not in allowed_values:
        raise ValidationError(f"Must be one of: {', '.join(allowed_values)}")

    return value

# Schema-based validation
from typing import Dict, Callable

class Validator:
    """Schema-based input validator"""

    def __init__(self, schema: Dict[str, Callable]):
        self.schema = schema

    def validate(self, data: dict) -> dict:
        """Validate data against schema"""
        validated = {}
        errors = {}

        for field, validator_func in self.schema.items():
            if field not in data:
                errors[field] = "Field required"
                continue

            try:
                validated[field] = validator_func(data[field])
            except ValidationError as e:
                errors[field] = str(e)

        if errors:
            raise ValidationError(f"Validation failed: {errors}")

        return validated

# Usage
user_schema = Validator({
    'username': validate_username,
    'email': validate_email,
    'age': lambda x: validate_integer(x, min_val=0, max_val=150),
    'role': lambda x: validate_enum(x, {'user', 'admin', 'moderator'})
})

@app.route('/users', methods=['POST'])
def create_user():
    try:
        validated_data = user_schema.validate(request.json)
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400

    # Create user with validated data
    user = User(**validated_data)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201
```

### File Upload Validation

```python
import os
import magic  # python-magic library
from werkzeug.utils import secure_filename

# Allowed file extensions and MIME types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
ALLOWED_MIME_TYPES = {
    'image/png',
    'image/jpeg',
    'image/gif',
    'application/pdf'
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def validate_file_extension(filename: str) -> bool:
    """Check file extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_mime_type(file_path: str) -> bool:
    """Verify actual file type (not just extension)"""
    mime = magic.Magic(mime=True)
    file_mime = mime.from_file(file_path)
    return file_mime in ALLOWED_MIME_TYPES

def validate_file_size(file) -> bool:
    """Check file size"""
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset pointer
    return file_size <= MAX_FILE_SIZE

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Validate extension
    if not validate_file_extension(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    # Validate size
    if not validate_file_size(file):
        return jsonify({'error': 'File too large'}), 400

    # Secure filename
    filename = secure_filename(file.filename)

    # Generate unique filename
    import uuid
    unique_filename = f"{uuid.uuid4()}_{filename}"

    # Save temporarily to validate MIME type
    temp_path = os.path.join('/tmp', unique_filename)
    file.save(temp_path)

    # Validate actual MIME type
    if not validate_mime_type(temp_path):
        os.remove(temp_path)
        return jsonify({'error': 'Invalid file type'}), 400

    # Move to final location
    final_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    os.rename(temp_path, final_path)

    # Store file metadata
    file_record = File(
        user_id=session['user_id'],
        filename=filename,
        stored_filename=unique_filename,
        mime_type=magic.Magic(mime=True).from_file(final_path),
        size=os.path.getsize(final_path)
    )
    db.session.add(file_record)
    db.session.commit()

    return jsonify({
        'message': 'File uploaded',
        'file_id': file_record.id
    }), 201
```

## Encryption Patterns

### Symmetric Encryption (AES)

```python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import base64
import os

class EncryptionService:
    """Handle encryption/decryption operations"""

    def __init__(self, key: bytes = None):
        """Initialize with encryption key"""
        if key:
            self.key = key
        else:
            # Generate new key (store securely!)
            self.key = Fernet.generate_key()

        self.cipher = Fernet(self.key)

    @staticmethod
    def derive_key_from_password(password: str, salt: bytes = None) -> tuple:
        """Derive encryption key from password"""
        if salt is None:
            salt = os.urandom(16)

        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key, salt

    def encrypt(self, plaintext: str) -> bytes:
        """Encrypt plaintext"""
        return self.cipher.encrypt(plaintext.encode())

    def decrypt(self, ciphertext: bytes) -> str:
        """Decrypt ciphertext"""
        return self.cipher.decrypt(ciphertext).decode()

    def encrypt_file(self, input_path: str, output_path: str):
        """Encrypt a file"""
        with open(input_path, 'rb') as f:
            plaintext = f.read()

        ciphertext = self.cipher.encrypt(plaintext)

        with open(output_path, 'wb') as f:
            f.write(ciphertext)

    def decrypt_file(self, input_path: str, output_path: str):
        """Decrypt a file"""
        with open(input_path, 'rb') as f:
            ciphertext = f.read()

        plaintext = self.cipher.decrypt(ciphertext)

        with open(output_path, 'wb') as f:
            f.write(plaintext)

# Usage
# Get key from environment or key management service
encryption_key = os.environ.get('ENCRYPTION_KEY').encode()
encryptor = EncryptionService(key=encryption_key)

# Encrypt sensitive data before storing
sensitive_data = "SSN: 123-45-6789"
encrypted = encryptor.encrypt(sensitive_data)

# Store encrypted data
user.encrypted_ssn = encrypted
user.save()

# Decrypt when needed
decrypted = encryptor.decrypt(user.encrypted_ssn)
```

### Asymmetric Encryption (RSA)

```python
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization

class RSAEncryption:
    """RSA encryption for key exchange and digital signatures"""

    @staticmethod
    def generate_key_pair():
        """Generate RSA key pair"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        return private_key, public_key

    @staticmethod
    def save_private_key(private_key, filename: str, password: bytes = None):
        """Save private key to file"""
        encryption = serialization.NoEncryption()
        if password:
            encryption = serialization.BestAvailableEncryption(password)

        pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=encryption
        )

        with open(filename, 'wb') as f:
            f.write(pem)

    @staticmethod
    def load_private_key(filename: str, password: bytes = None):
        """Load private key from file"""
        with open(filename, 'rb') as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=password
            )
        return private_key

    @staticmethod
    def encrypt(public_key, plaintext: bytes) -> bytes:
        """Encrypt with public key"""
        ciphertext = public_key.encrypt(
            plaintext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return ciphertext

    @staticmethod
    def decrypt(private_key, ciphertext: bytes) -> bytes:
        """Decrypt with private key"""
        plaintext = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return plaintext

    @staticmethod
    def sign(private_key, message: bytes) -> bytes:
        """Create digital signature"""
        signature = private_key.sign(
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return signature

    @staticmethod
    def verify(public_key, message: bytes, signature: bytes) -> bool:
        """Verify digital signature"""
        try:
            public_key.verify(
                signature,
                message,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception:
            return False
```

## Rate Limiting

### Token Bucket Algorithm

```python
import time
from collections import defaultdict
from threading import Lock

class RateLimiter:
    """Token bucket rate limiter"""

    def __init__(self, rate: int, capacity: int):
        """
        Args:
            rate: Tokens per second
            capacity: Maximum tokens in bucket
        """
        self.rate = rate
        self.capacity = capacity
        self.buckets = defaultdict(lambda: {
            'tokens': capacity,
            'last_update': time.time()
        })
        self.lock = Lock()

    def _refill(self, bucket):
        """Refill tokens based on elapsed time"""
        now = time.time()
        elapsed = now - bucket['last_update']
        bucket['tokens'] = min(
            self.capacity,
            bucket['tokens'] + elapsed * self.rate
        )
        bucket['last_update'] = now

    def is_allowed(self, key: str, tokens: int = 1) -> bool:
        """Check if request is allowed"""
        with self.lock:
            bucket = self.buckets[key]
            self._refill(bucket)

            if bucket['tokens'] >= tokens:
                bucket['tokens'] -= tokens
                return True

            return False

# Usage with Flask
from functools import wraps

# 10 requests per minute per IP
limiter = RateLimiter(rate=10/60, capacity=10)

def rate_limit(tokens=1):
    """Decorator for rate limiting"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            key = request.remote_addr

            if not limiter.is_allowed(key, tokens):
                return jsonify({'error': 'Rate limit exceeded'}), 429

            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/api/expensive-operation')
@rate_limit(tokens=5)  # Costs 5 tokens
def expensive_operation():
    return jsonify({'result': 'success'})
```

This reference provides production-ready patterns for implementing security controls. Choose patterns based on your specific requirements and threat model.
