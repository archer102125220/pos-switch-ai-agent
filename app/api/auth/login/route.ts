import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, Role, Permission, RefreshToken, Setting } from '@/db/models';
import {
  createAccessToken,
  createRefreshToken,
  generateJti,
  getRefreshTokenExpiryDate,
  setAuthCookies,
  shouldReturnTokensInJson,
} from '@/utils/auth';
import { getPermissionsForRole } from '@/utils/auth/permissions';
import type { AuthUser, LoginRequest, LoginResponse, LoginResponseWithTokens } from '@/types/auth';

/**
 * POST /api/auth/login
 * Authenticate user and issue tokens
 * 
 * Supports two authentication modes:
 * 1. Cookie mode (default): Sets HttpOnly cookies
 * 2. Bearer Token mode: Returns tokens in JSON response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: '請輸入電子郵件和密碼' },
        { status: 400 }
      );
    }

    // Find user with role and permissions
    const user = await User.findOne({
      where: { email, isActive: true },
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

    if (!user) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      );
    }

    // Extract permissions (admin role always gets ALL permissions)
    const role = user.get('role') as Role & { permissions?: Permission[] };
    const rolePermissions = role?.permissions?.map(p => p.code) || [];
    const permissions = getPermissionsForRole(role?.name || '', rolePermissions);

    // Check single device login setting
    const singleDeviceSetting = await Setting.findOne({
      where: { key: 'auth_single_device_login', storeId: null },
    });
    const singleDeviceLogin = singleDeviceSetting?.value === 'true';

    // If single device login is enabled, revoke all existing tokens
    if (singleDeviceLogin) {
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId: user.id, revokedAt: null } }
      );
    }

    // Create refresh token record in database
    const jti = generateJti();
    await RefreshToken.create({
      userId: user.id,
      jti,
      expiresAt: getRefreshTokenExpiryDate(),
    });

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

    // Generate tokens
    const accessToken = createAccessToken(authUser);
    const refreshToken = createRefreshToken(user.id, jti);

    // Update last login time
    await user.update({ lastLoginAt: new Date() });

    // Determine response mode
    const useBearerMode = shouldReturnTokensInJson(request);

    if (useBearerMode) {
      // Bearer Token mode: Return tokens in JSON
      const response: LoginResponseWithTokens = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role?.name || '',
          permissions,
        },
        accessToken,
        refreshToken,
      };
      return NextResponse.json(response);
    } else {
      // Cookie mode: Set HttpOnly cookies
      await setAuthCookies(accessToken, refreshToken);

      const response: LoginResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role?.name || '',
          permissions,
        },
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登入時發生錯誤' },
      { status: 500 }
    );
  }
}
