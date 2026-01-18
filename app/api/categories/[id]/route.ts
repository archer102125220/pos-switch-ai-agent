import { NextRequest, NextResponse } from 'next/server';
import { Category, Product } from '@/db/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/categories/[id]
 * Get category details with optional products
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類 ID' },
        { status: 400 }
      );
    }

    const include = includeProducts
      ? [{ model: Product, as: 'products', where: { isActive: true }, required: false }]
      : [];

    const category = await Category.findByPk(categoryId, { include });

    if (!category) {
      return NextResponse.json(
        { error: '分類不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: '取得分類時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Update category (requires product_management permission)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check auth manually for dynamic routes
  const { requireAuth, requirePermission } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = requirePermission(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類 ID' },
        { status: 400 }
      );
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: '分類不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, sortOrder, isActive } = body;

    await category.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: '更新分類時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete category (requires product_management permission)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check auth manually for dynamic routes
  const { requireAuth, requirePermission } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = requirePermission(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類 ID' },
        { status: 400 }
      );
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: '分類不存在' },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await Product.count({ where: { categoryId } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `此分類下還有 ${productCount} 個商品，無法刪除` },
        { status: 400 }
      );
    }

    await category.destroy();

    return NextResponse.json({ message: '分類已刪除' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: '刪除分類時發生錯誤' },
      { status: 500 }
    );
  }
}
