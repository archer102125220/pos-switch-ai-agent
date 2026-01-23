import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import { type AuthUser } from '@/types/auth';

/**
 * GET /api/categories
 * List all categories (public)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: '取得分類列表時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (requires product_management permission)
 */
export const POST = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    // Check permission
    const permError = requirePermission(user, 'product_management');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { name, description, sortOrder } = body;

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { error: '名稱為必填欄位' },
          { status: 400 }
        );
      }

      const category = await Category.create({
        name,
        description: description || null,
        sortOrder: sortOrder ?? 0,
        isActive: true,
      });

      return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
      console.error('Create category error:', error);
      return NextResponse.json(
        { error: '建立分類時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
