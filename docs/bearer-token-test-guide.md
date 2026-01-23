# Bearer Token Support - Quick Test Guide

## Test Preparation

The Bearer Token implementation is complete. You can test it using tools like **Postman**, **curl**, or **Thunder Client**.

## Test Accounts

Use any of these test accounts:
- **Admin**: `admin@pos-switch.com` / `admin123`
- **Manager**: `manager@pos-switch.com` / `manager123`
- **Cashier**: `cashier@pos-switch.com` / `cashier123`
- **Auditor**: `auditor@pos-switch.com` / `auditor123`

---

## Cookie Mode Tests (Default - Backward Compatible)

### 1. Login (Cookie Mode)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos-switch.com","password":"admin123"}' \
  -c cookies.txt
```

**Expected**: Returns user info, sets `access_token` and `refresh_token` cookies

### 2. Get Current User (Cookie Mode)
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected**: Returns user info using cookie

### 3. Logout (Cookie Mode)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

**Expected**: Clears cookies and revokes token

---

## Bearer Token Mode Tests (New Feature)

### 1. Login (Bearer Token Mode)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy" \
  -d '{"email":"admin@pos-switch.com","password":"admin123"}'
```

**Expected Response**:
```json
{
  "user": {
    "id": 1,
    "email": "admin@pos-switch.com",
    "name": "系統管理員",
    "role": "Admin",
    "permissions": ["product_management", "checkout", ...]
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Important**: Save the `accessToken` and `refreshToken` from the response

### 2. Get Current User (Bearer Token Mode)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Expected**: Returns user info using Bearer token

### 3. Refresh Token (Bearer Token Mode)
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy" \
  -d '{"refreshToken":"<YOUR_REFRESH_TOKEN>"}'
```

**Expected Response**:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."  // If token rotation enabled
}
```

### 4. Logout (Bearer Token Mode)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{"refreshToken":"<YOUR_REFRESH_TOKEN>"}'
```

**Expected**: Returns success message

---

## Verification Checklist

- [ ] **Cookie Mode**
  - [ ] Login sets cookies
  - [ ] `/api/auth/me` works with cookie
  - [ ] Logout clears cookies
  
- [ ] **Bearer Token Mode**
  - [ ] Login returns tokens in JSON
  - [ ] `/api/auth/me` works with Authorization header
  - [ ] Refresh token works
  - [ ] Logout revokes token

- [ ] **Backward Compatibility**
  - [ ] Existing frontend (AuthContext) still works
  - [ ] Cookie mode is default when no Authorization header

---

## Notes

1. **Mode Detection**: The system automatically detects Bearer Token mode when the `Authorization` header is present
2. **Priority**: Cookie > Authorization Header (for backward compatibility)
3. **Token Rotation**: Enabled by default (`auth_token_rotation=true`)
4. **Security**: Bearer Tokens stored in client-side storage (localStorage) have XSS risks - use with caution

---

Last Updated: 2026-01-23
