import { NextRequest, NextResponse } from 'next/server';
import { Order, Payment } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import { type AuthUser } from '@/types/auth';

/**
 * POST /api/payments
 * Create a payment for an order (requires checkout permission)
 */
export const POST = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    // Check permission
    const permError = requirePermission(user, 'checkout');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { orderId, method, amount, receivedAmount } = body;

      // Validate required fields
      if (!orderId || !method || amount === undefined) {
        return NextResponse.json(
          { error: '訂單 ID、付款方式和金額為必填欄位' },
          { status: 400 }
        );
      }

      // Check if order exists
      const order = await Order.findByPk(orderId);
      if (!order) {
        return NextResponse.json(
          { error: '訂單不存在' },
          { status: 400 }
        );
      }

      // Validate payment method
      const validMethods = ['cash', 'credit_card', 'mobile_pay', 'other'];
      if (!validMethods.includes(method)) {
        return NextResponse.json(
          { error: '無效的付款方式' },
          { status: 400 }
        );
      }

      // Calculate change for cash payment
      let change = null;
      if (method === 'cash' && receivedAmount !== undefined) {
        change = receivedAmount - amount;
        if (change < 0) {
          return NextResponse.json(
            { error: '收取金額不足' },
            { status: 400 }
          );
        }
      }

      // Create payment
      const payment = await Payment.create({
        orderId,
        method,
        amount,
        receivedAmount: receivedAmount ?? null,
        change,
        status: 'completed',
      });

      // Check if order is fully paid
      const payments = await Payment.findAll({
        where: { orderId, status: 'completed' },
      });
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      if (totalPaid >= Number(order.total)) {
        await order.update({ status: 'completed' });
      } else {
        await order.update({ status: 'pending' });
      }

      return NextResponse.json({ payment }, { status: 201 });
    } catch (error) {
      console.error('Create payment error:', error);
      return NextResponse.json(
        { error: '建立付款時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
