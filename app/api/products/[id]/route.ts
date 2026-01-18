import { NextRequest, NextResponse } from 'next/server';
import { Product, Category } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import type { AuthUser } from '@/types/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]
 * Get product details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: '無效的商品 ID' },
        { status: 400 }
      );
    }

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: '取得商品時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update product (requires product_management permission)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check auth manually for dynamic routes
  const { requireAuth, requirePermission: reqPerm } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = reqPerm(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: '無效的商品 ID' },
        { status: 400 }
      );
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { categoryId, name, description, price, sku, barcode, imageUrl, stock, trackStock, sortOrder, isActive } = body;

    // Validate category if provided
    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return NextResponse.json(
          { error: '指定的分類不存在' },
          { status: 400 }
        );
      }
    }

    await product.update({
      ...(categoryId !== undefined && { categoryId }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(sku !== undefined && { sku }),
      ...(barcode !== undefined && { barcode }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(stock !== undefined && { stock }),
      ...(trackStock !== undefined && { trackStock }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: '更新商品時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product (requires product_management permission)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check auth manually for dynamic routes
  const { requireAuth, requirePermission: reqPerm } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = reqPerm(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: '無效的商品 ID' },
        { status: 400 }
      );
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false, or hard delete
    await product.destroy();

    return NextResponse.json({ message: '商品已刪除' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: '刪除商品時發生錯誤' },
      { status: 500 }
    );
  }
}
