import { NextResponse } from 'next/server';
import { clearAuthCookies, getRefreshTokenCookie, verifyRefreshToken } from '@/utils/auth';
import { RefreshToken } from '@/db/models';

/**
 * POST /api/auth/logout
 * Clear auth cookies and revoke refresh token
 */
export async function POST() {
  try {
    // Get refresh token to revoke it in database
    const refreshTokenCookie = await getRefreshTokenCookie();
    
    if (refreshTokenCookie) {
      const decoded = verifyRefreshToken(refreshTokenCookie);
      
      if (decoded) {
        // Revoke the token in database
        await RefreshToken.update(
          { revokedAt: new Date() },
          { where: { jti: decoded.jti, revokedAt: null } }
        );
      }
    }

    // Clear all auth cookies
    await clearAuthCookies();

    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, try to clear cookies
    await clearAuthCookies();
    return NextResponse.json({ message: '登出成功' });
  }
}
