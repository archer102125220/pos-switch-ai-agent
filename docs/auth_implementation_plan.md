# 雙 Token 認證機制實作計畫

## 概述

實作 **Refresh Token + Access Token** 雙 Token 機制：

| Token | 用途 | 有效期 | 儲存位置 |
|-------|------|--------|----------|
| **Refresh Token** | 刷新並獲取新的 Access Token | 7 天 | HttpOnly Cookie |
| **Access Token** | API 請求身份驗證 | 15 分鐘 | HttpOnly Cookie |

---

## 流程圖

```
┌─────────────────────────────────────────────────────────────────┐
│                         登入流程                                  │
└─────────────────────────────────────────────────────────────────┘

  User                    Frontend                   Backend
   │                         │                          │
   │  1. 輸入帳密             │                          │
   │ ─────────────────────>  │                          │
   │                         │  2. POST /api/auth/login │
   │                         │ ────────────────────────>│
   │                         │                          │ 3. 驗證帳密
   │                         │                          │ 4. 產生兩個 Token
   │                         │  5. Set-Cookie:          │
   │                         │     - refresh_token      │
   │                         │     - access_token       │
   │                         │ <────────────────────────│
   │  6. 登入成功             │                          │
   │ <─────────────────────  │                          │

┌─────────────────────────────────────────────────────────────────┐
│                      API 請求流程                                │
└─────────────────────────────────────────────────────────────────┘

  Frontend                   Backend
   │                          │
   │  GET /api/products       │
   │  (Cookie: access_token)  │
   │ ────────────────────────>│
   │                          │ 1. 驗證 access_token
   │                          │    ├─ 有效: 返回資料
   │                          │    └─ 過期: 返回 401
   │ <────────────────────────│
   │                          │

┌─────────────────────────────────────────────────────────────────┐
│                     Token 刷新流程                               │
└─────────────────────────────────────────────────────────────────┘

  Frontend                   Backend
   │                          │
   │  (收到 401 Unauthorized)  │
   │                          │
   │  POST /api/auth/refresh  │
   │  (Cookie: refresh_token) │
   │ ────────────────────────>│
   │                          │ 1. 驗證 refresh_token
   │                          │ 2. 產生新的 access_token
   │                          │ (可選) 3. 更新 refresh_token
   │  Set-Cookie:             │
   │    - access_token        │
   │ <────────────────────────│
   │                          │
   │  重試原本的 API 請求      │
   │ ────────────────────────>│
```

---

## API 端點設計

| Method | Endpoint | 說明 | 輸入 | 輸出 |
|--------|----------|------|------|------|
| POST | `/api/auth/login` | 登入 | `{ email, password }` | User + Set Cookies |
| POST | `/api/auth/logout` | 登出 | - | Clear Cookies |
| POST | `/api/auth/refresh` | 刷新 Token | Cookie: refresh_token | Set Cookie: access_token |
| GET | `/api/auth/me` | 取得當前用戶 | Cookie: access_token | User |

---

## Cookie 設定

```typescript
// Access Token Cookie
{
  name: 'access_token',
  value: jwt_access_token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 15 * 60, // 15 分鐘
}

// Refresh Token Cookie
{
  name: 'refresh_token',
  value: jwt_refresh_token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth', // 只有 auth API 可用
  maxAge: 7 * 24 * 60 * 60, // 7 天
}
```

---

## JWT Payload 設計

### Access Token Payload

```typescript
interface AccessTokenPayload {
  sub: number;        // user.id
  email: string;
  name: string;
  roleId: number;
  permissions: string[]; // ['checkout', 'order_history']
  type: 'access';
  iat: number;
  exp: number;
}
```

### Refresh Token Payload

```typescript
interface RefreshTokenPayload {
  sub: number;        // user.id
  type: 'refresh';
  jti: string;        // 唯一識別碼 (用於撤銷)
  iat: number;
  exp: number;
}
```

---

## 資料庫變更

### 新增 `refresh_tokens` 表 (可選，用於撤銷功能)

```typescript
interface RefreshTokenAttributes {
  id: number;
  userId: number;
  jti: string;           // JWT ID，用於撤銷
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;      // 撤銷時間
}
```

> **注意**：若不需要主動撤銷 refresh token 功能，可省略此表，僅靠 JWT 過期機制。

---

## 檔案結構

```
app/api/auth/
├── login/
│   └── route.ts          # POST: 登入
├── logout/
│   └── route.ts          # POST: 登出
├── refresh/
│   └── route.ts          # POST: 刷新 Token
└── me/
    └── route.ts          # GET: 取得當前用戶

lib/
├── auth/
│   ├── jwt.ts            # JWT 工具函數
│   ├── cookies.ts        # Cookie 工具函數
│   └── middleware.ts     # 驗證 middleware

types/
└── auth.ts               # 認證相關型別
```

---

## 安全考量

1. **HttpOnly Cookie**: 防止 XSS 竊取 Token
2. **Secure Flag**: 僅 HTTPS 傳輸 (生產環境)
3. **SameSite**: 防止 CSRF 攻擊
4. **Refresh Token Path**: 限制只有 `/api/auth` 路徑可存取
5. **Token Rotation** (可選): 每次 refresh 時更換 refresh_token
6. **Refresh Token 儲存於 DB** (可選): 支援主動撤銷

---

## 環境變數

```env
# JWT Secrets (應使用不同的密鑰)
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Token 有效期 (秒)
JWT_ACCESS_EXPIRES_IN=900        # 15 分鐘
JWT_REFRESH_EXPIRES_IN=604800    # 7 天
```

---

## 已確認設計決策

| 項目 | 決策 |
|------|------|
| Refresh Token 儲存於 DB | ✅ 是，支援主動撤銷 |
| Token Rotation | ✅ 啟用 |
| Access Token 有效期 | 15 分鐘 |
| 撤銷/單設備開關 | ✅ 透過 Settings 表設定 |

---

## 系統設定開關（獨立權限控制）

### 新增權限

| 權限代碼 | 名稱 | 說明 |
|----------|------|------|
| `system_settings` | 系統設定管理 | 管理認證策略、系統參數等核心設定 |

> 預設僅 **Admin** 角色擁有此權限，Admin 可將此權限授予其他角色。

### 認證相關設定

| Key | 預設值 | 說明 |
|-----|--------|------|
| `auth_single_device_login` | `false` | 啟用後，新登入會撤銷該用戶所有其他 refresh tokens |
| `auth_token_rotation` | `true` | 啟用後，每次 refresh 會更換 refresh_token |

### API 權限

| Method | Endpoint | 權限需求 | 說明 |
|--------|----------|----------|------|
| GET | `/api/settings?keys=auth_*` | `system_settings` | 取得認證設定 |
| PUT | `/api/settings` | `system_settings` | 更新設定 |

### Migration/Seeder 變更

```typescript
// 1. 新增權限 (permissions 表)
{ code: 'system_settings', name: '系統設定管理', description: '管理認證策略等核心設定' }

// 2. Admin 角色權限 (role_permissions 表)
{ role_id: adminRoleId, permission_id: systemSettingsPermissionId }

// 3. 新增預設設定 (settings 表)
{ key: 'auth_single_device_login', value: 'false' }
{ key: 'auth_token_rotation', value: 'true' }
```
