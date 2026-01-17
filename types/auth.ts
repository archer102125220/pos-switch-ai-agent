/**
 * Authentication related type definitions
 */

// JWT Payload types
export interface AccessTokenPayload {
  sub: number;           // user.id
  email: string;
  name: string;
  roleId: number;
  permissions: string[];
  type: 'access';
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: number;           // user.id
  type: 'refresh';
  jti: string;           // unique identifier for revocation
  iat: number;
  exp: number;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
  role: string;
  permissions: string[];
  storeId?: number;
}

// Cookie configuration
export interface TokenCookieConfig {
  name: string;
  maxAge: number;
  path: string;
}

export const ACCESS_TOKEN_COOKIE: TokenCookieConfig = {
  name: 'access_token',
  maxAge: 15 * 60, // 15 minutes
  path: '/',
};

export const REFRESH_TOKEN_COOKIE: TokenCookieConfig = {
  name: 'refresh_token',
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/api/auth',
};
