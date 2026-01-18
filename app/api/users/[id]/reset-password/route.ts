import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/db/models';
import { withAuth } from '@/utils/auth/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/users/[id]/reset-password
 * Reset a user's password
 */
export const POST = withAuth(
  async (request: NextRequest, routeContext: unknown) => {
    try {
      const { params } = routeContext as RouteParams;
      const { id } = await params;
      const body = await request.json();
      const { newPassword } = body;

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: '密碼至少需要 6 個字元' },
          { status: 400 }
        );
      }

      const user = await User.findByPk(id);
      if (!user) {
        return NextResponse.json(
          { error: '使用者不存在' },
          { status: 404 }
        );
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await user.update({ passwordHash });

      return NextResponse.json({ message: '密碼已重設' });
    } catch (error) {
      console.error('Reset password error:', error);
      return NextResponse.json(
        { error: '重設密碼時發生錯誤' },
        { status: 500 }
      );
    }
  },
  { permissions: ['system_settings'] }
);
