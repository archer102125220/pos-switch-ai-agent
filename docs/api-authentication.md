# Authentication API Documentation

## Overview

The POS Switch AI Agent authentication system supports **dual-mode authentication**:
1. **Cookie Mode** (default): HttpOnly cookies for same-domain deployments
2. **Bearer Token Mode**: Authorization header for cross-domain/mobile apps

The API automatically detects which mode to use based on the presence of the `Authorization` header in the request.

---

## Authentication Modes

### Cookie Mode (Default)

**When to use**: Next.js frontend, same-domain deployment

**Characteristics**:
- Tokens stored in HttpOnly cookies
- Automatic token management
- Highest security (XSS protection)
- No manual token handling required

### Bearer Token Mode

**When to use**: Cross-domain deployment, mobile apps, third-party integrations

**Characteristics**:
- Tokens in JSON response/request
- Manual token storage required
- Flexible deployment options
- Requires XSS protection on client side

---

## API Endpoints

### POST /api/auth/login

Authenticate user and issue tokens.

#### Request

```http
POST /api/auth/login
Content-Type: application/json
```

**Headers** (Bearer Token mode only):
```
Authorization: Bearer dummy
```
> Adding any `Authorization` header triggers Bearer Token mode

**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response

**Cookie Mode** (200 OK):
```json
{
  "user": {
    "id": number,
    "email": "string",
    "name": "string",
    "role": "string",
    "permissions": ["string"]
  }
}
```
*Note: `access_token` and `refresh_token` cookies are set*

**Bearer Token Mode** (200 OK):
```json
{
  "user": {
    "id": number,
    "email": "string",
    "name": "string",
    "role": "string",
    "permissions": ["string"]
  },
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "電子郵件或密碼錯誤"
}
```

#### Example

**Cookie Mode**:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include', // Include cookies
});
```

**Bearer Token Mode**:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy', // Trigger Bearer mode
  },
  body: JSON.stringify({ email, password }),
});

const { accessToken, refreshToken } = await response.json();
// Store tokens (localStorage/sessionStorage)
```

---

### GET /api/auth/me

Get current authenticated user information.

#### Request

```http
GET /api/auth/me
```

**Headers** (Bearer Token mode):
```
Authorization: Bearer {accessToken}
```

#### Response

**Success** (200 OK):
```json
{
  "user": {
    "id": number,
    "email": "string",
    "name": "string",
    "storeId": number | null,
    "role": "string",
    "permissions": ["string"],
    "lastLoginAt": "ISO 8601 datetime"
  }
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "未登入"
}
```

#### Example

**Cookie Mode**:
```javascript
const response = await fetch('/api/auth/me', {
  credentials: 'include',
});
```

**Bearer Token Mode**:
```javascript
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

---

### POST /api/auth/refresh

Refresh access token using refresh token.

#### Request

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Headers** (Bearer Token mode):
```
Authorization: Bearer dummy
```

**Body** (Bearer Token mode only):
```json
{
  "refreshToken": "string (JWT)"
}
```

#### Response

**Cookie Mode** (200 OK):
```json
{
  "message": "Token 已刷新"
}
```
*Note: Cookies are updated automatically*

**Bearer Token Mode** (200 OK):
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"  // Only if token rotation is enabled
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "Refresh token 無效或已過期"
}
```

#### Example

**Cookie Mode**:
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
```

**Bearer Token Mode**:
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy',
  },
  body: JSON.stringify({ refreshToken }),
});

const { accessToken, refreshToken: newRefreshToken } = await response.json();
```

---

### POST /api/auth/logout

Logout user and revoke refresh token.

#### Request

```http
POST /api/auth/logout
Content-Type: application/json
```

**Headers** (Bearer Token mode):
```
Authorization: Bearer {accessToken}
```

**Body** (Bearer Token mode only):
```json
{
  "refreshToken": "string (JWT)"
}
```

#### Response

**Success** (200 OK):
```json
{
  "message": "登出成功"
}
```

#### Example

**Cookie Mode**:
```javascript
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

**Bearer Token Mode**:
```javascript
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ refreshToken }),
});
```

---

## Token Information

### Access Token

- **Type**: JWT
- **Lifetime**: 15 minutes
- **Purpose**: Authenticate API requests
- **Payload**:
  ```json
  {
    "sub": number,           // user ID
    "email": "string",
    "name": "string",
    "roleId": number,
    "permissions": ["string"],
    "type": "access",
    "iat": number,           // issued at
    "exp": number            // expires at
  }
  ```

### Refresh Token

- **Type**: JWT
- **Lifetime**: 7 days
- **Purpose**: Refresh access token
- **Payload**:
  ```json
  {
    "sub": number,           // user ID
    "type": "refresh",
    "jti": "string",         // unique ID for revocation
    "iat": number,
    "exp": number
  }
  ```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing email/password |
| 401 | Unauthorized | Invalid credentials, expired token, or revoked token |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "error": "string (error message in Chinese)"
}
```

---

## Security Best Practices

### Cookie Mode
- ✅ HttpOnly cookies prevent XSS attacks
- ✅ SameSite=Lax prevents CSRF attacks
- ✅ Secure flag in production (HTTPS only)
- ✅ Automatic token rotation
- ⚠️ Requires same-domain deployment

### Bearer Token Mode
- ✅ Works across domains
- ✅ Mobile app friendly
- ⚠️ Store tokens securely (avoid localStorage for sensitive apps)
- ⚠️ Implement XSS protection (CSP, sanitization)
- ⚠️ Use HTTPS in production
- ⚠️ Implement token refresh before expiry

---

## Configuration

### Token Rotation

Enabled by default. Can be disabled via settings:

```sql
UPDATE settings SET value = 'false' WHERE key = 'auth_token_rotation';
```

### Single Device Login

Disabled by default. Can be enabled via settings:

```sql
UPDATE settings SET value = 'true' WHERE key = 'auth_single_device_login';
```

---

**Last Updated**: 2026-01-23
