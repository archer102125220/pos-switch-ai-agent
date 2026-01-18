import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { 
  AccessTokenPayload, 
  RefreshTokenPayload, 
  AuthUser 
} from '@/types/auth';

// Environment variables with defaults for development
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-min-32-characters!!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-min-32-characters!!';
const ACCESS_EXPIRES_IN = parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10); // 15 min
const REFRESH_EXPIRES_IN = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10); // 7 days

/**
 * Generate a unique JWT ID for refresh token
 */
export function generateJti(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create an access token for the user
 */
export function createAccessToken(user: AuthUser): string {
  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    permissions: user.permissions,
    type: 'access',
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

/**
 * Create a refresh token for the user
 */
export function createRefreshToken(userId: number, jti: string): string {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    type: 'refresh',
    jti,
  };

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as unknown as AccessTokenPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as unknown as RefreshTokenPayload;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get refresh token expiry date
 */
export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_EXPIRES_IN * 1000);
}

/**
 * Get access token expiry in seconds
 */
export function getAccessTokenExpiresIn(): number {
  return ACCESS_EXPIRES_IN;
}

/**
 * Get refresh token expiry in seconds
 */
export function getRefreshTokenExpiresIn(): number {
  return REFRESH_EXPIRES_IN;
}
