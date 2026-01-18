import { NextResponse } from 'next/server';
import { User, Role, Permission, RefreshToken, Setting } from '@/db/models';
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken as createNewRefreshToken,
  generateJti,
  getRefreshTokenExpiryDate,
  getRefreshTokenCookie,
  setAuthCookies,
  setAccessTokenCookie,
} from '@/utils/auth';
import { getPermissionsForRole } from '@/utils/auth/permissions';
import type { AuthUser } from '@/types/auth';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST() {
  try {
    // Get refresh token from cookie
    const refreshTokenCookie = await getRefreshTokenCookie();
    
    if (!refreshTokenCookie) {
      return NextResponse.json(
        { error: '未提供 refresh token' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshTokenCookie);
    
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

      // Set both cookies
      await setAuthCookies(newAccessToken, newRefreshToken);
    } else {
      // Only update access token
      await setAccessTokenCookie(newAccessToken);
    }

    return NextResponse.json({ message: 'Token 已刷新' });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: '刷新 Token 時發生錯誤' },
      { status: 500 }
    );
  }
}
