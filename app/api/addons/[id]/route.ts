import { NextRequest, NextResponse } from 'next/server';
import { Addon } from '@/db/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/addons/[id]
 * Get addon details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const addonId = parseInt(id, 10);

    if (isNaN(addonId)) {
      return NextResponse.json(
        { error: '無效的加購項目 ID' },
        { status: 400 }
      );
    }

    const addon = await Addon.findByPk(addonId);

    if (!addon) {
      return NextResponse.json(
        { error: '加購項目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ addon });
  } catch (error) {
    console.error('Get addon error:', error);
    return NextResponse.json(
      { error: '取得加購項目時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/addons/[id]
 * Update addon (requires product_management permission)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { requireAuth, requirePermission: reqPerm } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = reqPerm(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const addonId = parseInt(id, 10);

    if (isNaN(addonId)) {
      return NextResponse.json(
        { error: '無效的加購項目 ID' },
        { status: 400 }
      );
    }

    const addon = await Addon.findByPk(addonId);
    if (!addon) {
      return NextResponse.json(
        { error: '加購項目不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, price, stock, trackStock, isActive, sortOrder } = body;

    await addon.update({
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(trackStock !== undefined && { trackStock }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    return NextResponse.json({ addon });
  } catch (error) {
    console.error('Update addon error:', error);
    return NextResponse.json(
      { error: '更新加購項目時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addons/[id]
 * Delete addon (requires product_management permission)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { requireAuth, requirePermission: reqPerm } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = reqPerm(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const addonId = parseInt(id, 10);

    if (isNaN(addonId)) {
      return NextResponse.json(
        { error: '無效的加購項目 ID' },
        { status: 400 }
      );
    }

    const addon = await Addon.findByPk(addonId);
    if (!addon) {
      return NextResponse.json(
        { error: '加購項目不存在' },
        { status: 404 }
      );
    }

    await addon.destroy();

    return NextResponse.json({ message: '加購項目已刪除' });
  } catch (error) {
    console.error('Delete addon error:', error);
    return NextResponse.json(
      { error: '刪除加購項目時發生錯誤' },
      { status: 500 }
    );
  }
}
