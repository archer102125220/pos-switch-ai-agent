import { NextRequest, NextResponse } from 'next/server';
import { User, Role, Permission, RefreshToken, Setting } from '@/db/models';
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken as createNewRefreshToken,
  generateJti,
  getRefreshTokenExpiryDate,
  getRefreshToken,
  setAuthCookies,
  setAccessTokenCookie,
  shouldReturnTokensInJson,
  type AuthUser,
} from '@/utils/auth';
import { getPermissionsForRole } from '@/utils/auth/permissions';
import { type RefreshTokenRequest, type RefreshTokenResponse } from '@/types/auth';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * 
 * Supports two authentication modes:
 * 1. Cookie mode: Reads refresh token from HttpOnly cookie
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
    
    if (!refreshTokenValue) {
      return NextResponse.json(
        { error: '未提供 refresh token' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshTokenValue);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Refresh token 無效或已過期' },
        { status: 401 }
      );
    }

    // Check if token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({
      where: { jti: decoded.jti },
    });

    if (!storedToken || !storedToken.isValid()) {
      return NextResponse.json(
        { error: 'Refresh token 已被撤銷或已過期' },
        { status: 401 }
      );
    }

    // Find user with role and permissions
    const user = await User.findByPk(decoded.sub, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
            },
          ],
        },
      ],
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用戶不存在或已停用' },
        { status: 401 }
      );
    }

    // Extract permissions (admin role always gets ALL permissions)
    const role = user.get('role') as Role & { permissions?: Permission[] };
    const rolePermissions = role?.permissions?.map(p => p.code) || [];
    const permissions = getPermissionsForRole(role?.name || '', rolePermissions);

    // Build auth user for token payload
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: role?.name || '',
      permissions,
      storeId: user.storeId || undefined,
    };

    // Create new access token
    const newAccessToken = createAccessToken(authUser);

    // Check if token rotation is enabled
    const tokenRotationSetting = await Setting.findOne({
      where: { key: 'auth_token_rotation', storeId: null },
    });
    const tokenRotation = tokenRotationSetting?.value !== 'false'; // default true

    // Determine response mode
    const useBearerMode = shouldReturnTokensInJson(request);

    if (tokenRotation) {
      // Revoke old refresh token
      await storedToken.update({ revokedAt: new Date() });

      // Create new refresh token
      const newJti = generateJti();
      await RefreshToken.create({
        userId: user.id,
        jti: newJti,
        expiresAt: getRefreshTokenExpiryDate(),
      });

      const newRefreshToken = createNewRefreshToken(user.id, newJti);

      if (useBearerMode) {
        // Bearer Token mode: Return tokens in JSON
        const response: RefreshTokenResponse = {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
        return NextResponse.json(response);
      } else {
        // Cookie mode: Set both cookies
        await setAuthCookies(newAccessToken, newRefreshToken);
        return NextResponse.json({ message: 'Token 已刷新' });
      }
    } else {
      // Token rotation disabled
      if (useBearerMode) {
        // Bearer Token mode: Return new access token only
        const response: RefreshTokenResponse = {
          accessToken: newAccessToken,
        };
        return NextResponse.json(response);
      } else {
        // Cookie mode: Only update access token
        await setAccessTokenCookie(newAccessToken);
        return NextResponse.json({ message: 'Token 已刷新' });
      }
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: '刷新 Token 時發生錯誤' },
      { status: 500 }
    );
  }
}
