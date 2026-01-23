import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, Product, Store, User } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import { type AuthUser } from '@/types/auth';
import { Op } from 'sequelize';

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

/**
 * GET /api/orders
 * List orders (requires checkout or order_history permission)
 */
export const GET = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    // Check permission (checkout or order_history)
    const hasCheckout = user.permissions.includes('checkout');
    const hasOrderHistory = user.permissions.includes('order_history');
    
    if (!hasCheckout && !hasOrderHistory) {
      return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const storeId = searchParams.get('storeId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);

      const where: Record<string, unknown> = {};
      
      if (status) {
        where.status = status;
      }
      
      if (storeId) {
        where.storeId = parseInt(storeId, 10);
      } else if (user.storeId) {
        // Filter by user's store if no storeId specified
        where.storeId = user.storeId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          (where.createdAt as Record<string, unknown>)[Op.gte as unknown as string] = new Date(startDate);
        }
        if (endDate) {
          (where.createdAt as Record<string, unknown>)[Op.lte as unknown as string] = new Date(endDate);
        }
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        include: [
          { model: Store, as: 'store', attributes: ['id', 'name'] },
          { model: User, as: 'user', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return NextResponse.json({ 
        orders, 
        pagination: {
          total: count,
          limit,
          offset,
        }
      });
    } catch (error) {
      console.error('Get orders error:', error);
      return NextResponse.json(
        { error: '取得訂單列表時發生錯誤' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/orders
 * Create a new order (requires checkout permission)
 */
export const POST = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    // Check permission
    const permError = requirePermission(user, 'checkout');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { storeId, tableNumber, checkoutMode, items, notes } = body;

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: '訂單必須包含至少一個品項' },
          { status: 400 }
        );
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems: Array<{
        productId: number;
        productName: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
        notes?: string;
      }> = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `商品 ID ${item.productId} 不存在` },
            { status: 400 }
          );
        }

        const quantity = item.quantity || 1;
        const itemSubtotal = Number(product.price) * quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.price),
          quantity,
          subtotal: itemSubtotal,
          notes: item.notes,
        });
      }

      // Create order
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        storeId: storeId || user.storeId || null,
        userId: user.id,
        tableNumber: tableNumber || null,
        subtotal,
        tax: 0,
        discount: 0,
        total: subtotal,
        status: 'draft',
        checkoutMode: checkoutMode || 'pre_pay',
        notes: notes || null,
      });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          ...item,
        });
      }

      // Reload with items
      await order.reload({
        include: [{ model: OrderItem, as: 'items' }],
      });

      return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
      console.error('Create order error:', error);
      return NextResponse.json(
        { error: '建立訂單時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
