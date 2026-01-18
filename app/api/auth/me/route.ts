import { NextResponse } from 'next/server';
import { User, Role, Permission } from '@/db/models';
import { getAccessTokenCookie, verifyAccessToken } from '@/utils/auth';
import { getPermissionsForRole } from '@/utils/auth/permissions';

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
export async function GET() {
  try {
    // Get access token from cookie
    const accessToken = await getAccessTokenCookie();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: '未登入' },
        { status: 401 }
      );
    }

    // Verify access token
    const decoded = verifyAccessToken(accessToken);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token 無效或已過期' },
        { status: 401 }
      );
    }

    // Find user with fresh data
    const user = await User.findByPk(decoded.sub, {
      attributes: ['id', 'email', 'name', 'storeId', 'roleId', 'isActive', 'lastLoginAt'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['code', 'name'],
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

    // Extract role and permissions (admin role always gets ALL permissions)
    const role = user.get('role') as Role & { permissions?: Permission[] };
    const rolePermissions = role?.permissions?.map(p => p.code) || [];
    const permissions = getPermissionsForRole(role?.name || '', rolePermissions);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        storeId: user.storeId,
        role: role?.name || '',
        permissions,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: '取得用戶資訊時發生錯誤' },
      { status: 500 }
    );
  }
}
