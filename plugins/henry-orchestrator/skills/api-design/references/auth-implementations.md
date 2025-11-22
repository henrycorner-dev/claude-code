# Authentication Implementation Guide

## JWT (JSON Web Tokens) Implementation

### Token Structure

A JWT consists of three parts separated by dots:
```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Standard Claims

- `iss` (issuer) - Who issued the token
- `sub` (subject) - User identifier
- `aud` (audience) - Intended audience
- `exp` (expiration) - Expiration timestamp
- `nbf` (not before) - Token not valid before this time
- `iat` (issued at) - When token was issued
- `jti` (JWT ID) - Unique token identifier

### Node.js Implementation (with jsonwebtoken)

**Installation:**
```bash
npm install jsonwebtoken bcrypt
```

**Generate Token:**
```javascript
const jwt = require('jsonwebtoken')

function generateAccessToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'your-app-name',
    audience: 'your-app-users'
  })
}

function generateRefreshToken(user) {
  const payload = {
    sub: user.id,
    type: 'refresh'
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })
}
```

**Verify Token:**
```javascript
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'your-app-name',
      audience: 'your-app-users'
    })
    return { valid: true, data: decoded }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' }
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' }
    }
    return { valid: false, error: 'Verification failed' }
  }
}
```

**Authentication Middleware:**
```javascript
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'No token provided'
      }
    })
  }

  const token = authHeader.substring(7)
  const result = verifyToken(token)

  if (!result.valid) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: result.error
      }
    })
  }

  req.user = result.data
  next()
}
```

**Login Endpoint:**
```javascript
const bcrypt = require('bcrypt')

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body

  // Find user
  const user = await User.findOne({ where: { email } })
  if (!user) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials'
      }
    })
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials'
      }
    })
  }

  // Generate tokens
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // Store refresh token (in database or Redis)
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
    tokenType: 'Bearer'
  })
})
```

**Refresh Token Endpoint:**
```javascript
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Refresh token required'
      }
    })
  }

  // Verify refresh token
  const result = verifyRefreshToken(refreshToken)
  if (!result.valid) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: result.error
      }
    })
  }

  // Check if refresh token exists in database
  const storedToken = await RefreshToken.findOne({
    where: {
      token: refreshToken,
      userId: result.data.sub,
      expiresAt: { [Op.gt]: new Date() }
    }
  })

  if (!storedToken) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid refresh token'
      }
    })
  }

  // Get user
  const user = await User.findByPk(result.data.sub)

  // Generate new tokens
  const newAccessToken = generateAccessToken(user)
  const newRefreshToken = generateRefreshToken(user)

  // Rotate refresh token (delete old, create new)
  await storedToken.destroy()
  await RefreshToken.create({
    userId: user.id,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 900
  })
})
```

**Logout Endpoint:**
```javascript
app.post('/auth/logout', authenticateJWT, async (req, res) => {
  const { refreshToken } = req.body

  if (refreshToken) {
    // Revoke refresh token
    await RefreshToken.destroy({
      where: {
        token: refreshToken,
        userId: req.user.sub
      }
    })
  }

  res.status(204).send()
})
```

### Python Implementation (with PyJWT)

**Installation:**
```bash
pip install PyJWT bcrypt
```

**Generate Token:**
```python
import jwt
import datetime
from typing import Dict, Any

SECRET_KEY = "your-secret-key"
REFRESH_SECRET_KEY = "your-refresh-secret-key"

def generate_access_token(user: Dict[str, Any]) -> str:
    payload = {
        'sub': user['id'],
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
        'iat': datetime.datetime.utcnow(),
        'iss': 'your-app-name',
        'aud': 'your-app-users'
    }

    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def generate_refresh_token(user: Dict[str, Any]) -> str:
    payload = {
        'sub': user['id'],
        'type': 'refresh',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }

    return jwt.encode(payload, REFRESH_SECRET_KEY, algorithm='HS256')
```

**Verify Token:**
```python
def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=['HS256'],
            issuer='your-app-name',
            audience='your-app-users'
        )
        return {'valid': True, 'data': payload}
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'valid': False, 'error': 'Invalid token'}
```

**FastAPI Middleware:**
```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

def authenticate_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    result = verify_token(token)

    if not result['valid']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                'code': 'AUTHENTICATION_FAILED',
                'message': result['error']
            }
        )

    return result['data']

@app.get('/protected')
def protected_route(user = Depends(authenticate_jwt)):
    return {'message': f'Hello {user["email"]}'}
```

## OAuth 2.0 Implementation

### Authorization Code Flow (Most Secure)

**Step 1: Redirect to Authorization Server**
```
https://auth-server.com/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://your-app.com/callback&
  scope=read_user+write_posts&
  state=random_state_string
```

**Step 2: User Authorizes**

User logs in and grants permission.

**Step 3: Authorization Server Redirects Back**
```
https://your-app.com/callback?
  code=AUTHORIZATION_CODE&
  state=random_state_string
```

**Step 4: Exchange Code for Token**
```javascript
const axios = require('axios')

app.get('/callback', async (req, res) => {
  const { code, state } = req.query

  // Verify state to prevent CSRF
  if (state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid state' })
  }

  // Exchange code for tokens
  try {
    const response = await axios.post('https://auth-server.com/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://your-app.com/callback',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    })

    const { access_token, refresh_token, expires_in } = response.data

    // Store tokens securely (encrypted in database or secure session)
    req.session.accessToken = access_token
    req.session.refreshToken = refresh_token

    res.redirect('/dashboard')
  } catch (error) {
    res.status(500).json({ error: 'Token exchange failed' })
  }
})
```

**Step 5: Use Access Token**
```javascript
const response = await axios.get('https://api-server.com/user', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
```

### PKCE (Proof Key for Code Exchange) for Mobile/SPA

**Step 1: Generate Code Verifier and Challenge**
```javascript
const crypto = require('crypto')

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

const codeVerifier = generateCodeVerifier()
const codeChallenge = generateCodeChallenge(codeVerifier)

// Store codeVerifier securely (e.g., sessionStorage)
sessionStorage.setItem('code_verifier', codeVerifier)
```

**Step 2: Authorization Request with Challenge**
```
https://auth-server.com/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://your-app.com/callback&
  scope=read_user&
  state=random_state&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

**Step 3: Token Exchange with Verifier**
```javascript
const codeVerifier = sessionStorage.getItem('code_verifier')

const response = await fetch('https://auth-server.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: 'https://your-app.com/callback',
    client_id: 'YOUR_CLIENT_ID',
    code_verifier: codeVerifier
  })
})
```

### Implementing OAuth Provider (Authorization Server)

**Authorization Endpoint:**
```javascript
app.get('/oauth/authorize', (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method
  } = req.query

  // Validate client_id and redirect_uri
  const client = await OAuthClient.findOne({
    where: { clientId: client_id, redirectUri: redirect_uri }
  })

  if (!client) {
    return res.status(400).json({ error: 'invalid_client' })
  }

  // Show authorization page to user
  res.render('authorize', {
    clientName: client.name,
    scope: scope.split(' '),
    state,
    clientId: client_id,
    redirectUri: redirect_uri,
    codeChallenge: code_challenge
  })
})

app.post('/oauth/authorize', async (req, res) => {
  const { approve, client_id, redirect_uri, scope, state, code_challenge } = req.body

  if (!approve) {
    return res.redirect(`${redirect_uri}?error=access_denied&state=${state}`)
  }

  // Generate authorization code
  const code = crypto.randomBytes(32).toString('hex')

  // Store authorization code with metadata
  await AuthorizationCode.create({
    code,
    clientId: client_id,
    userId: req.user.id,
    redirectUri: redirect_uri,
    scope,
    codeChallenge: code_challenge,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  })

  // Redirect back to client
  res.redirect(`${redirect_uri}?code=${code}&state=${state}`)
})
```

**Token Endpoint:**
```javascript
app.post('/oauth/token', async (req, res) => {
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    code_verifier,
    refresh_token
  } = req.body

  if (grant_type === 'authorization_code') {
    // Verify authorization code
    const authCode = await AuthorizationCode.findOne({
      where: {
        code,
        clientId: client_id,
        redirectUri: redirect_uri,
        expiresAt: { [Op.gt]: new Date() },
        used: false
      }
    })

    if (!authCode) {
      return res.status(400).json({ error: 'invalid_grant' })
    }

    // Verify client credentials (for confidential clients)
    if (client_secret) {
      const client = await OAuthClient.findOne({
        where: { clientId: client_id }
      })

      if (!client || client.clientSecret !== client_secret) {
        return res.status(401).json({ error: 'invalid_client' })
      }
    }

    // Verify PKCE challenge (for public clients)
    if (authCode.codeChallenge) {
      const calculatedChallenge = crypto
        .createHash('sha256')
        .update(code_verifier)
        .digest('base64url')

      if (calculatedChallenge !== authCode.codeChallenge) {
        return res.status(400).json({ error: 'invalid_grant' })
      }
    }

    // Mark code as used
    await authCode.update({ used: true })

    // Get user
    const user = await User.findByPk(authCode.userId)

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token
    await OAuthRefreshToken.create({
      token: refreshToken,
      userId: user.id,
      clientId: client_id,
      scope: authCode.scope,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scope
    })
  } else if (grant_type === 'refresh_token') {
    // Handle refresh token flow
    // ... similar logic for refresh tokens
  } else {
    res.status(400).json({ error: 'unsupported_grant_type' })
  }
})
```

## Security Best Practices

### Token Storage

**Frontend (Browser):**
- **Access Token**: Memory (React state/context) - lost on refresh
- **Refresh Token**: httpOnly, secure cookie - cannot be accessed by JavaScript
- **Never** store tokens in localStorage for sensitive data (XSS vulnerability)

**Mobile Apps:**
- Use secure storage (Keychain on iOS, Keystore on Android)
- Never store in SharedPreferences or UserDefaults unencrypted

**Backend:**
- Store refresh tokens encrypted in database
- Use Redis for token blacklists (logout, rotation)

### Token Security

1. **Use HTTPS Only** - Never send tokens over HTTP
2. **Set Short Expiration** - Access tokens: 15-60 minutes
3. **Rotate Refresh Tokens** - Issue new refresh token on each use
4. **Implement Token Revocation** - Allow users to revoke all sessions
5. **Use Strong Secrets** - At least 256 bits of entropy
6. **Validate All Claims** - Check exp, iss, aud on every request
7. **Rate Limit Token Endpoints** - Prevent brute force attacks
8. **Log Token Events** - Monitor suspicious patterns

### CORS Configuration

```javascript
const cors = require('cors')

app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### CSRF Protection

For cookie-based auth, use CSRF tokens:

```javascript
const csrf = require('csurf')

app.use(csrf({ cookie: true }))

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})
```

Client includes token in requests:
```javascript
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
})
```

## Testing Authentication

```javascript
describe('JWT Authentication', () => {
  let accessToken

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password', 10)
    })

    // Generate token
    accessToken = generateAccessToken(user)
  })

  it('allows access with valid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
  })

  it('denies access without token', async () => {
    const response = await request(app)
      .get('/protected')

    expect(response.status).toBe(401)
  })

  it('denies access with expired token', async () => {
    // Create expired token
    const expiredToken = jwt.sign(
      { sub: 123, exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET
    )

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${expiredToken}`)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTHENTICATION_FAILED')
  })
})
```
