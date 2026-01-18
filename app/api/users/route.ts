import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, Role, Store } from '@/db/models';
import { withAuth } from '@/utils/auth/middleware';
import { Op } from 'sequelize';

/**
 * GET /api/users
 * Get all users with pagination and filtering
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const search = searchParams.get('search') || '';
      const roleId = searchParams.get('roleId');
      const storeId = searchParams.get('storeId');
      const isActive = searchParams.get('isActive');

      const offset = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {};
      
      if (search) {
        where[Op.or as unknown as string] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }
      
      if (roleId) {
        where.roleId = parseInt(roleId, 10);
      }
      
      if (storeId) {
        where.storeId = parseInt(storeId, 10);
      }
      
      if (isActive !== null && isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name'] },
          { model: Store, as: 'store', attributes: ['id', 'name'] },
        ],
        attributes: { exclude: ['passwordHash'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return NextResponse.json({
        users: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      return NextResponse.json(
        { error: '取得使用者列表時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);

/**
 * POST /api/users
 * Create a new user
 */
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { email, password, name, roleId, storeId, isActive = true } = body;

      // Validate required fields
      if (!email || !password || !name || !roleId) {
        return NextResponse.json(
          { error: '請填寫所有必填欄位' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return NextResponse.json(
          { error: '此電子郵件已被使用' },
          { status: 409 }
        );
      }

      // Check if role exists
      const role = await Role.findByPk(roleId);
      if (!role) {
        return NextResponse.json(
          { error: '指定的角色不存在' },
          { status: 400 }
        );
      }

      // Check if store exists (if provided)
      if (storeId) {
        const store = await Store.findByPk(storeId);
        if (!store) {
          return NextResponse.json(
            { error: '指定的店家不存在' },
            { status: 400 }
          );
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        name,
        roleId,
        storeId: storeId || null,
        isActive,
      });

      // Fetch user with relations
      const createdUser = await User.findByPk(user.id, {
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name'] },
          { model: Store, as: 'store', attributes: ['id', 'name'] },
        ],
        attributes: { exclude: ['passwordHash'] },
      });

      return NextResponse.json(
        { user: createdUser, message: '使用者已建立' },
        { status: 201 }
      );
    } catch (error) {
      console.error('Create user error:', error);
      return NextResponse.json(
        { error: '建立使用者時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);
