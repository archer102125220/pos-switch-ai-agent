'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button, Input } from '@/components/ui';
import { classNames } from '@/utils/classNames';

interface OrderItem {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  storeId: number | null;
  tableNumber: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  checkoutMode: 'pre_pay' | 'post_pay';
  notes: string | null;
  createdAt: string;
  store?: { id: number; name: string };
  user?: { id: number; name: string };
  items?: OrderItem[];
}

const statusMap = {
  draft: '草稿',
  pending: '待確認',
  confirmed: '已確認',
  preparing: '準備中',
  ready: '已完成',
  completed: '已取餐',
  cancelled: '已取消',
};

const statusColorMap = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  preparing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const fetchedRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, startDate, endDate]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const viewOrderDetails = useCallback(async (order: Order) => {
    try {
      // Fetch full order details with items
      const res = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedOrder(data.order);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Fetch order details error:', error);
    }
  }, []);

  const filteredOrders = useMemo(() => orders, [orders]);

  return (
    <AdminLayout title="訂單管理">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                訂單狀態
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">全部</option>
                {Object.entries(statusMap).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                開始日期
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                結束日期
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                搜尋
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">訂單編號</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">桌號</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">金額</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">付款方式</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">建立時間</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">載入中...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">無訂單記錄</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{order.orderNumber}</p>
                          {order.store && (
                            <p className="text-xs text-slate-500">{order.store.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {order.tableNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        ${order.total}
                      </td>
                      <td className="px-6 py-4">
                        <span className={classNames(
                          'px-2.5 py-1 text-xs font-medium rounded-lg',
                          statusColorMap[order.status]
                        )}>
                          {statusMap[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {order.checkoutMode === 'pre_pay' ? '先付款' : '後付款'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(order.createdAt).toLocaleString('zh-TW')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        >
                          查看詳情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  訂單詳情
                </h2>
                <p className="text-sm text-slate-500 mt-1">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">桌號</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.tableNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">狀態</p>
                <span className={classNames(
                  'inline-block px-2.5 py-1 text-xs font-medium rounded-lg mt-1',
                  statusColorMap[selectedOrder.status]
                )}>
                  {statusMap[selectedOrder.status]}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">付款方式</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedOrder.checkoutMode === 'pre_pay' ? '先付款' : '後付款'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">建立時間</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(selectedOrder.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">訂單品項</h3>
              <div className="space-y-2">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.productName}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-1">備註: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          ${item.unitPrice} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${item.subtotal}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">無品項資料</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">小計</span>
                  <span className="text-slate-900 dark:text-white">${selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">折扣</span>
                    <span className="text-red-600 dark:text-red-400">-${selectedOrder.discount}</span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">稅金</span>
                    <span className="text-slate-900 dark:text-white">${selectedOrder.tax}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">總計</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">訂單備註</p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
