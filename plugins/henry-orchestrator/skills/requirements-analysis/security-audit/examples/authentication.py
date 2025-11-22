"""
Authentication Implementation Examples
Demonstrates secure authentication patterns
"""

import bcrypt
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict
import pyotp
import hashlib


# Password Hashing
class PasswordHasher:
    """Secure password hashing using bcrypt"""

    @staticmethod
    def hash_password(password: str, rounds: int = 12) -> bytes:
        """
        Hash password with bcrypt
        rounds: cost factor (12 is good balance of security/performance)
        """
        if len(password) < 8:
            raise ValueError("Password too short (minimum 8 characters)")

        salt = bcrypt.gensalt(rounds=rounds)
        return bcrypt.hashpw(password.encode('utf-8'), salt)

    @staticmethod
    def verify_password(password: str, hashed: bytes) -> bool:
        """
        Verify password against hash
        Time-constant comparison prevents timing attacks
        """
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed)
        except Exception:
            return False


# Session Management
class SessionManager:
    """Secure session management"""

    def __init__(self):
        self.sessions = {}  # In production, use Redis/database

    def create_session(self, user_id: int) -> str:
        """
        Create new session with cryptographically random ID
        """
        session_id = secrets.token_urlsafe(32)  # 256 bits

        self.sessions[session_id] = {
            'user_id': user_id,
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(hours=2),
            'ip_address': None,  # Set from request
            'user_agent': None,  # Set from request
        }

        return session_id

    def get_session(self, session_id: str) -> Optional[Dict]:
        """
        Retrieve session if valid
        """
        session = self.sessions.get(session_id)

        if not session:
            return None

        # Check expiration
        if datetime.utcnow() > session['expires_at']:
            del self.sessions[session_id]
            return None

        return session

    def destroy_session(self, session_id: str):
        """
        Destroy session (logout)
        """
        if session_id in self.sessions:
            del self.sessions[session_id]

    def extend_session(self, session_id: str):
        """
        Extend session expiration (sliding window)
        """
        session = self.get_session(session_id)
        if session:
            session['expires_at'] = datetime.utcnow() + timedelta(hours=2)

    def regenerate_session_id(self, old_session_id: str) -> Optional[str]:
        """
        Regenerate session ID to prevent fixation
        Call after login or privilege elevation
        """
        session = self.get_session(old_session_id)
        if not session:
            return None

        # Create new session with same data
        new_session_id = secrets.token_urlsafe(32)
        self.sessions[new_session_id] = session

        # Delete old session
        del self.sessions[old_session_id]

        return new_session_id


# JWT Authentication
class JWTAuthenticator:
    """JWT-based authentication"""

    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.algorithm = 'HS256'

    def create_access_token(self, user_id: int, expires_in: int = 3600) -> str:
        """
        Create JWT access token
        expires_in: seconds until expiration (default 1 hour)
        """
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow(),
            'type': 'access'
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: int) -> str:
        """
        Create JWT refresh token (longer lived)
        """
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=30),
            'iat': datetime.utcnow(),
            'type': 'refresh'
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify and decode JWT token
        """
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """
        Issue new access token using refresh token
        """
        payload = self.verify_token(refresh_token)

        if not payload or payload.get('type') != 'refresh':
            return None

        return self.create_access_token(payload['user_id'])


# Multi-Factor Authentication (TOTP)
class TOTPAuthenticator:
    """Time-based One-Time Password authentication"""

    @staticmethod
    def setup_totp(user_email: str, issuer: str = 'MyApp') -> Dict:
        """
        Set up TOTP for a user
        Returns secret and provisioning URI for QR code
        """
        secret = pyotp.random_base32()

        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user_email,
            issuer_name=issuer
        )

        return {
            'secret': secret,
            'provisioning_uri': provisioning_uri
        }

    @staticmethod
    def verify_totp(secret: str, token: str) -> bool:
        """
        Verify TOTP token
        valid_window=1 allows for time drift (±30 seconds)
        """
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)

    @staticmethod
    def generate_backup_codes(count: int = 10) -> list:
        """
        Generate backup codes for account recovery
        """
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4)  # 8 character hex code
            codes.append(code)
        return codes

    @staticmethod
    def hash_backup_code(code: str) -> str:
        """
        Hash backup code before storing
        """
        return hashlib.sha256(code.encode()).hexdigest()

    @staticmethod
    def verify_backup_code(code: str, hashed_codes: list) -> bool:
        """
        Verify backup code against hashed list
        """
        code_hash = TOTPAuthenticator.hash_backup_code(code)
        return code_hash in hashed_codes


# Account Lockout
class AccountLockout:
    """Prevent brute force attacks with account lockout"""

    def __init__(self, max_attempts: int = 5, lockout_duration: int = 900):
        """
        max_attempts: Maximum failed attempts before lockout
        lockout_duration: Lockout duration in seconds (default 15 minutes)
        """
        self.max_attempts = max_attempts
        self.lockout_duration = lockout_duration
        self.attempts = {}  # In production, use Redis/database

    def record_failed_attempt(self, username: str):
        """
        Record failed login attempt
        """
        if username not in self.attempts:
            self.attempts[username] = {
                'count': 0,
                'locked_until': None
            }

        self.attempts[username]['count'] += 1

        if self.attempts[username]['count'] >= self.max_attempts:
            self.attempts[username]['locked_until'] = (
                datetime.utcnow() + timedelta(seconds=self.lockout_duration)
            )

    def is_locked(self, username: str) -> bool:
        """
        Check if account is locked
        """
        if username not in self.attempts:
            return False

        locked_until = self.attempts[username].get('locked_until')

        if not locked_until:
            return False

        if datetime.utcnow() < locked_until:
            return True

        # Lockout expired, reset
        self.reset_attempts(username)
        return False

    def reset_attempts(self, username: str):
        """
        Reset failed attempts (after successful login)
        """
        if username in self.attempts:
            del self.attempts[username]

    def get_remaining_attempts(self, username: str) -> int:
        """
        Get remaining attempts before lockout
        """
        if username not in self.attempts:
            return self.max_attempts

        return max(0, self.max_attempts - self.attempts[username]['count'])


# Complete Authentication System Example
class AuthenticationSystem:
    """Complete authentication system"""

    def __init__(self):
        self.hasher = PasswordHasher()
        self.session_manager = SessionManager()
        self.lockout = AccountLockout()
        # In production, get from environment variable
        self.jwt_auth = JWTAuthenticator('your-secret-key-here')

    def register(self, username: str, password: str, email: str) -> Dict:
        """
        Register new user
        """
        # Validate password strength
        if len(password) < 12:
            raise ValueError("Password must be at least 12 characters")

        # Hash password
        password_hash = self.hasher.hash_password(password)

        # In production, save to database
        user = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'mfa_enabled': False,
            'mfa_secret': None
        }

        return user

    def login(self, username: str, password: str) -> Optional[Dict]:
        """
        Login user
        Returns session ID or JWT tokens
        """
        # Check account lockout
        if self.lockout.is_locked(username):
            raise PermissionError("Account locked due to too many failed attempts")

        # Get user from database (mocked here)
        # user = db.get_user(username)
        user = None  # Replace with actual database lookup

        if not user:
            self.lockout.record_failed_attempt(username)
            return None

        # Verify password
        if not self.hasher.verify_password(password, user['password_hash']):
            self.lockout.record_failed_attempt(username)
            return None

        # Reset lockout on successful authentication
        self.lockout.reset_attempts(username)

        # Check if MFA is enabled
        if user.get('mfa_enabled'):
            # Return temporary session for MFA verification
            return {
                'status': 'mfa_required',
                'user_id': user['id']
            }

        # Create session
        session_id = self.session_manager.create_session(user['id'])

        return {
            'status': 'success',
            'session_id': session_id
        }

    def verify_mfa_and_login(self, user_id: int, token: str) -> Optional[str]:
        """
        Verify MFA token and complete login
        """
        # Get user from database
        # user = db.get_user_by_id(user_id)
        user = None  # Replace with actual database lookup

        if not user or not user.get('mfa_enabled'):
            return None

        # Verify TOTP token
        if not TOTPAuthenticator.verify_totp(user['mfa_secret'], token):
            # Try backup codes
            if not TOTPAuthenticator.verify_backup_code(token, user['backup_codes']):
                return None

        # Create session
        return self.session_manager.create_session(user_id)

    def logout(self, session_id: str):
        """
        Logout user
        """
        self.session_manager.destroy_session(session_id)


# Example usage
if __name__ == '__main__':
    # Initialize authentication system
    auth = AuthenticationSystem()

    # Register user
    print("Registering user...")
    user = auth.register('john_doe', 'MySecureP@ssw0rd123', 'john@example.com')
    print(f"User registered: {user['username']}")

    # Login
    print("\nLogging in...")
    result = auth.login('john_doe', 'MySecureP@ssw0rd123')
    print(f"Login result: {result}")

    # Test failed login attempts
    print("\nTesting account lockout...")
    for i in range(6):
        try:
            auth.login('john_doe', 'wrong_password')
        except PermissionError as e:
            print(f"Attempt {i+1}: {e}")

    # Test TOTP setup
    print("\nSetting up TOTP...")
    totp_data = TOTPAuthenticator.setup_totp('john@example.com')
    print(f"TOTP secret: {totp_data['secret']}")
    print(f"Provisioning URI: {totp_data['provisioning_uri']}")

    # Generate and verify backup codes
    print("\nGenerating backup codes...")
    backup_codes = TOTPAuthenticator.generate_backup_codes()
    print(f"Backup codes: {backup_codes}")
