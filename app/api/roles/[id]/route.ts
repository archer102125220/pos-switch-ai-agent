import { NextRequest, NextResponse } from 'next/server';
import { Role, Permission, User } from '@/db/models';
import { withAuth } from '@/utils/auth/middleware';
import { isAdminRole } from '@/utils/auth/permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/roles/[id]
 * Get a single role by ID
 */
export const GET = withAuth(
  async (_request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;

      const role = await Role.findByPk(id, {
        include: [
          { model: Permission, as: 'permissions', attributes: ['id', 'code', 'name'] },
        ],
      });

      if (!role) {
        return NextResponse.json(
          { error: '角色不存在' },
          { status: 404 }
        );
      }

      // Get user count for this role
      const userCount = await User.count({ where: { roleId: role.id } });

      return NextResponse.json({
        role: {
          ...role.toJSON(),
          userCount,
        },
      });
    } catch (error) {
      console.error('Get role error:', error);
      return NextResponse.json(
        { error: '取得角色時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);

/**
 * PUT /api/roles/[id]
 * Update a role
 */
export const PUT = withAuth(
  async (request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;
      const body = await request.json();
      const { name, description, permissionIds, isActive } = body;

      const role = await Role.findByPk(id);
      if (!role) {
        return NextResponse.json(
          { error: '角色不存在' },
          { status: 404 }
        );
      }

      // Prevent modifying admin role name
      if (isAdminRole(role.name) && name && !isAdminRole(name)) {
        return NextResponse.json(
          { error: '無法修改管理員角色名稱' },
          { status: 400 }
        );
      }

      // Check if new name already exists (excluding current role)
      if (name && name !== role.name) {
        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
          return NextResponse.json(
            { error: '此角色名稱已存在' },
            { status: 409 }
          );
        }
      }

      // Update role
      await role.update({
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(isActive !== undefined && { isActive }),
      });

      // Update permissions if provided
      if (permissionIds !== undefined) {
        const permissions = await Permission.findAll({
          where: { id: permissionIds },
        });
        await (role as Role & { setPermissions: (p: Permission[]) => Promise<void> }).setPermissions(permissions);
      }

      // Fetch updated role with permissions
      const updatedRole = await Role.findByPk(id, {
        include: [
          { model: Permission, as: 'permissions', attributes: ['id', 'code', 'name'] },
        ],
      });

      return NextResponse.json({
        role: updatedRole,
        message: '角色已更新',
      });
    } catch (error) {
      console.error('Update role error:', error);
      return NextResponse.json(
        { error: '更新角色時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);

/**
 * DELETE /api/roles/[id]
 * Delete a role
 */
export const DELETE = withAuth(
  async (_request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;

      const role = await Role.findByPk(id);
      if (!role) {
        return NextResponse.json(
          { error: '角色不存在' },
          { status: 404 }
        );
      }

      // Prevent deleting admin role
      if (isAdminRole(role.name)) {
        return NextResponse.json(
          { error: '無法刪除管理員角色' },
          { status: 400 }
        );
      }

      // Check if role is being used by any users
      const userCount = await User.count({ where: { roleId: role.id } });
      if (userCount > 0) {
        return NextResponse.json(
          { error: `此角色有 ${userCount} 個使用者，無法刪除` },
          { status: 400 }
        );
      }

      await role.destroy();

      return NextResponse.json({ message: '角色已刪除' });
    } catch (error) {
      console.error('Delete role error:', error);
      return NextResponse.json(
        { error: '刪除角色時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);
