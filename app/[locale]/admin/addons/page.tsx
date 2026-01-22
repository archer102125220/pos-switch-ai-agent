'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button, Input } from '@/components/ui';
import { classNames } from '@/utils/classNames';

interface Addon {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  trackStock: boolean;
  isActive: boolean;
  sortOrder: number;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: null as number | null,
    trackStock: false,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchedRef = useRef(false);

  const fetchAddons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/addons');
      const data = await res.json();
      if (res.ok) {
        setAddons(data.addons);
      }
    } catch (error) {
      console.error('Fetch addons error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAddons();
  }, [fetchAddons]);

  const openCreateModal = useCallback(() => {
    setEditingAddon(null);
    setFormData({
      name: '',
      price: 0,
      stock: null,
      trackStock: false,
    });
    setFormError('');
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((addon: Addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name,
      price: addon.price,
      stock: addon.stock,
      trackStock: addon.trackStock,
    });
    setFormError('');
    setIsModalOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        price: formData.price,
        stock: formData.stock,
        trackStock: formData.trackStock,
      };

      const url = editingAddon ? `/api/addons/${editingAddon.id}` : '/api/addons';
      const method = editingAddon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || '操作失敗');
        return;
      }

      setIsModalOpen(false);
      fetchAddons();
    } catch (error) {
      console.error('Submit error:', error);
      setFormError('操作時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addon: Addon) => {
    if (!confirm(`確定要刪除加購項目 "${addon.name}" 嗎？`)) return;

    try {
      const res = await fetch(`/api/addons/${addon.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '刪除失敗');
        return;
      }

      fetchAddons();
    } catch (error) {
      console.error('Delete error:', error);
      alert('刪除時發生錯誤');
    }
  };

  return (
    <AdminLayout title="加購項目管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <Button onClick={openCreateModal}>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增加購項目
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    價格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    庫存
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      載入中...
                    </td>
                  </tr>
                ) : addons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      無加購項目
                    </td>
                  </tr>
                ) : (
                  addons.map((addon) => (
                    <tr key={addon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {addon.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          ${addon.price}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {addon.trackStock ? (addon.stock ?? 0) : '不追蹤'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={classNames(
                          'px-2.5 py-1 text-xs font-medium rounded-lg',
                          addon.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {addon.isActive ? '啟用' : '停用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(addon)}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="編輯"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(addon)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="刪除"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {editingAddon ? '編輯加購項目' : '新增加購項目'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  名稱 *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  價格 *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackStock"
                  checked={formData.trackStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackStock: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="trackStock" className="text-sm text-slate-700 dark:text-slate-300">
                  追蹤庫存
                </label>
              </div>

              {formData.trackStock && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    庫存數量
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
              )}

              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingAddon ? '更新' : '建立'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
