import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, Role, Store } from '@/db/models';
import { withAuth } from '@/utils/auth/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * Get a single user by ID
 */
export const GET = withAuth(
  async (_request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;

      const user = await User.findByPk(id, {
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name'] },
          { model: Store, as: 'store', attributes: ['id', 'name'] },
        ],
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        return NextResponse.json(
          { error: '使用者不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: '取得使用者時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);

/**
 * PUT /api/users/[id]
 * Update a user
 */
export const PUT = withAuth(
  async (request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;
      const body = await request.json();
      const { email, name, roleId, storeId, isActive } = body;

      const user = await User.findByPk(id);
      if (!user) {
        return NextResponse.json(
          { error: '使用者不存在' },
          { status: 404 }
        );
      }

      // Check if email is being changed and if it's already in use
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return NextResponse.json(
            { error: '此電子郵件已被使用' },
            { status: 409 }
          );
        }
      }

      // Check if role exists (if being updated)
      if (roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) {
          return NextResponse.json(
            { error: '指定的角色不存在' },
            { status: 400 }
          );
        }
      }

      // Check if store exists (if being updated)
      if (storeId) {
        const store = await Store.findByPk(storeId);
        if (!store) {
          return NextResponse.json(
            { error: '指定的店家不存在' },
            { status: 400 }
          );
        }
      }

      // Update user
      await user.update({
        ...(email && { email }),
        ...(name && { name }),
        ...(roleId && { roleId }),
        ...(storeId !== undefined && { storeId: storeId || null }),
        ...(isActive !== undefined && { isActive }),
      });

      // Fetch updated user with relations
      const updatedUser = await User.findByPk(id, {
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name'] },
          { model: Store, as: 'store', attributes: ['id', 'name'] },
        ],
        attributes: { exclude: ['passwordHash'] },
      });

      return NextResponse.json({
        user: updatedUser,
        message: '使用者已更新',
      });
    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: '更新使用者時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export const DELETE = withAuth(
  async (_request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;

      const user = await User.findByPk(id);
      if (!user) {
        return NextResponse.json(
          { error: '使用者不存在' },
          { status: 404 }
        );
      }

      // Prevent deleting the last admin
      const adminRole = await Role.findOne({ where: { name: 'Admin' } });
      if (adminRole && user.roleId === adminRole.id) {
        const adminCount = await User.count({ where: { roleId: adminRole.id } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: '無法刪除最後一個管理員帳號' },
            { status: 400 }
          );
        }
      }

      await user.destroy();

      return NextResponse.json({ message: '使用者已刪除' });
    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json(
        { error: '刪除使用者時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);
