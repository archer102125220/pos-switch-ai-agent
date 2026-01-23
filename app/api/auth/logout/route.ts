import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, getRefreshToken, verifyRefreshToken } from '@/utils/auth';
import { RefreshToken } from '@/db/models';
import type { RefreshTokenRequest } from '@/types/auth';

/**
 * POST /api/auth/logout
 * Clear auth cookies and revoke refresh token
 * 
 * Supports two authentication modes:
 * 1. Cookie mode: Reads refresh token from HttpOnly cookie and clears cookies
 * 2. Bearer Token mode: Reads refresh token from request body
 */
export async function POST(request: NextRequest) {
  try {
    // Try to read refresh token from body (for Bearer Token mode)
    let bodyRefreshToken: string | undefined;
    try {
      const body = await request.json() as RefreshTokenRequest;
      bodyRefreshToken = body.refreshToken;
    } catch {
      // Ignore JSON parse error - might be Cookie mode
    }

    // Get refresh token from cookie or body
    const refreshTokenValue = await getRefreshToken(request, bodyRefreshToken);
    
    if (refreshTokenValue) {
      const decoded = verifyRefreshToken(refreshTokenValue);
      
      if (decoded) {
        // Revoke the token in database
        await RefreshToken.update(
          { revokedAt: new Date() },
          { where: { jti: decoded.jti, revokedAt: null } }
        );
      }
    }

    // Clear all auth cookies (safe to call in both modes)
    await clearAuthCookies();

    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, try to clear cookies
    await clearAuthCookies();
    return NextResponse.json({ message: '登出成功' });
  }
}
