import { NextRequest, NextResponse } from 'next/server';
import { Addon } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import { type AuthUser } from '@/types/auth';

/**
 * GET /api/addons
 * List all addons
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const addons = await Addon.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return NextResponse.json({ addons });
  } catch (error) {
    console.error('Get addons error:', error);
    return NextResponse.json(
      { error: '取得加購項目列表時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addons
 * Create a new addon (requires product_management permission)
 */
export const POST = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    const permError = requirePermission(user, 'product_management');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { name, price, stock, trackStock, sortOrder } = body;

      // Validate required fields
      if (!name || price === undefined) {
        return NextResponse.json(
          { error: '名稱和價格為必填欄位' },
          { status: 400 }
        );
      }

      const addon = await Addon.create({
        name,
        price,
        stock: stock ?? null,
        trackStock: trackStock ?? false,
        isActive: true,
        sortOrder: sortOrder ?? 0,
      });

      return NextResponse.json({ addon }, { status: 201 });
    } catch (error) {
      console.error('Create addon error:', error);
      return NextResponse.json(
        { error: '建立加購項目時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
