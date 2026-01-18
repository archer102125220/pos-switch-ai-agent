import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, Store, User, Payment } from '@/db/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 * Get order details with items
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check auth
  const { requireAuth } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Check permission
  const user = auth.user!;
  const hasCheckout = user.permissions.includes('checkout');
  const hasOrderHistory = user.permissions.includes('order_history');
  
  if (!hasCheckout && !hasOrderHistory) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: '無效的訂單 ID' },
        { status: 400 }
      );
    }

    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Store, as: 'store', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Payment, as: 'payments' },
      ],
    });

    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: '取得訂單時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Update order (requires checkout permission)
 */
export async function PUT(
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

    const body = await request.json();
    const { tableNumber, status, discount, notes } = body;

    // Validate status transition
    const validStatuses = ['draft', 'in_progress', 'pending', 'completed', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '無效的訂單狀態' },
        { status: 400 }
      );
    }

    // Recalculate total if discount changed
    let newTotal = order.total;
    if (discount !== undefined) {
      newTotal = Number(order.subtotal) + Number(order.tax) - Number(discount);
    }

    await order.update({
      ...(tableNumber !== undefined && { tableNumber }),
      ...(status !== undefined && { status }),
      ...(discount !== undefined && { discount, total: newTotal }),
      ...(notes !== undefined && { notes }),
    });

    await order.reload({
      include: [{ model: OrderItem, as: 'items' }],
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: '更新訂單時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel/Delete order (requires checkout permission)
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

    // Can only cancel draft or in_progress orders
    if (!['draft', 'in_progress'].includes(order.status)) {
      return NextResponse.json(
        { error: '只能取消草稿或進行中的訂單' },
        { status: 400 }
      );
    }

    await order.update({ status: 'cancelled' });

    return NextResponse.json({ message: '訂單已取消' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: '取消訂單時發生錯誤' },
      { status: 500 }
    );
  }
}
