import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, Product } from '@/db/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/items
 * Add item to order (requires checkout permission)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { requireAuth, requirePermission } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = requirePermission(auth.user!, 'checkout');
  if (permError) return permError;

  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: '無效的訂單 ID' },
        { status: 400 }
      );
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    // Can only modify draft or in_progress orders
    if (!['draft', 'in_progress'].includes(order.status)) {
      return NextResponse.json(
        { error: '只能修改草稿或進行中的訂單' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { productId, quantity, notes } = body;

    // Validate product
    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 400 }
      );
    }

    const qty = quantity || 1;
    const itemSubtotal = Number(product.price) * qty;

    // Create order item
    const orderItem = await OrderItem.create({
      orderId,
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity: qty,
      subtotal: itemSubtotal,
      notes: notes || null,
    });

    // Update order totals
    const newSubtotal = Number(order.subtotal) + itemSubtotal;
    const newTotal = newSubtotal + Number(order.tax) - Number(order.discount);
    await order.update({ subtotal: newSubtotal, total: newTotal });

    return NextResponse.json({ orderItem }, { status: 201 });
  } catch (error) {
    console.error('Add order item error:', error);
    return NextResponse.json(
      { error: '新增品項時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]/items
 * Remove item from order (requires checkout permission)
 * Body: { orderItemId: number }
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { requireAuth, requirePermission } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = requirePermission(auth.user!, 'checkout');
  if (permError) return permError;

  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: '無效的訂單 ID' },
        { status: 400 }
      );
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    // Can only modify draft or in_progress orders
    if (!['draft', 'in_progress'].includes(order.status)) {
      return NextResponse.json(
        { error: '只能修改草稿或進行中的訂單' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orderItemId } = body;

    const orderItem = await OrderItem.findOne({
      where: { id: orderItemId, orderId },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: '品項不存在' },
        { status: 404 }
      );
    }

    // Update order totals before deleting
    const itemSubtotal = Number(orderItem.subtotal);
    const newSubtotal = Number(order.subtotal) - itemSubtotal;
    const newTotal = newSubtotal + Number(order.tax) - Number(order.discount);

    await orderItem.destroy();
    await order.update({ subtotal: newSubtotal, total: newTotal });

    return NextResponse.json({ message: '品項已移除' });
  } catch (error) {
    console.error('Remove order item error:', error);
    return NextResponse.json(
      { error: '移除品項時發生錯誤' },
      { status: 500 }
    );
  }
}
