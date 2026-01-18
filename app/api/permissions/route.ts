import { NextResponse } from 'next/server';
import { Permission } from '@/db/models';
import { withAuth } from '@/utils/auth/middleware';

/**
 * GET /api/permissions
 * Get all available permissions
 */
export const GET = withAuth(
  async () => {
    try {
      const permissions = await Permission.findAll({
        order: [['id', 'ASC']],
      });

      return NextResponse.json({ permissions });
    } catch (error) {
      console.error('Get permissions error:', error);
      return NextResponse.json(
        { error: '取得權限列表時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);
