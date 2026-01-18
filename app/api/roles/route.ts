import { NextRequest, NextResponse } from 'next/server';
import { Role, Permission, User } from '@/db/models';
import { withAuth } from '@/utils/auth/middleware';

/**
 * GET /api/roles
 * Get all roles with their permissions
 */
export const GET = withAuth(
  async () => {
    try {
      const roles = await Role.findAll({
        include: [
          { model: Permission, as: 'permissions', attributes: ['id', 'code', 'name'] },
        ],
        order: [['name', 'ASC']],
      });

      // Get user counts for each role
      const rolesWithCounts = await Promise.all(
        roles.map(async (role) => {
          const userCount = await User.count({ where: { roleId: role.id } });
          return {
            ...role.toJSON(),
            userCount,
          };
        })
      );

      return NextResponse.json({ roles: rolesWithCounts });
    } catch (error) {
      console.error('Get roles error:', error);
      return NextResponse.json(
        { error: '取得角色列表時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);

/**
 * POST /api/roles
 * Create a new role
 */
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, description, permissionIds = [], isActive = true } = body;

      if (!name) {
        return NextResponse.json(
          { error: '請填寫角色名稱' },
          { status: 400 }
        );
      }

      // Check if role name already exists
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return NextResponse.json(
          { error: '此角色名稱已存在' },
          { status: 409 }
        );
      }

      // Create role
      const role = await Role.create({
        name,
        description: description || null,
        isActive,
      });

      // Add permissions
      if (permissionIds.length > 0) {
        const permissions = await Permission.findAll({
          where: { id: permissionIds },
        });
        await (role as Role & { setPermissions: (p: Permission[]) => Promise<void> }).setPermissions(permissions);
      }

      // Fetch role with permissions
      const createdRole = await Role.findByPk(role.id, {
        include: [
          { model: Permission, as: 'permissions', attributes: ['id', 'code', 'name'] },
        ],
      });

      return NextResponse.json(
        { role: createdRole, message: '角色已建立' },
        { status: 201 }
      );
    } catch (error) {
      console.error('Create role error:', error);
      return NextResponse.json(
        { error: '建立角色時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);
