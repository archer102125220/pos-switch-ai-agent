'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button, Input } from '@/components/ui';
import { classNames } from '@/utils/classNames';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ComboGroupItem {
  id?: number;
  productId: number;
  product?: Product;
  priceAdjustment: number;
  isDefault: boolean;
  sortOrder: number;
}

interface ComboGroup {
  id?: number;
  name: string;
  description?: string;
  selectionType: 'single' | 'multiple';
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  sortOrder: number;
  items: ComboGroupItem[];
}

interface Category {
  id: number;
  name: string;
}

interface Combo {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  category?: Category;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  groups?: ComboGroup[];
}

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    isActive: true,
    groups: [] as ComboGroup[],
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchedRef = useRef(false);

  const fetchCombos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/combos?includeInactive=true');
      const data = await res.json();
      if (res.ok) {
        setCombos(data.combos);
      }
    } catch (error) {
      console.error('Fetch combos error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCombos();
    fetchCategories();
    fetchProducts();
  }, [fetchCombos, fetchCategories, fetchProducts]);

  const openCreateModal = useCallback(() => {
    setEditingCombo(null);
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      price: '',
      originalPrice: '',
      isActive: true,
      groups: [],
    });
    setFormError('');
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description || '',
      categoryId: combo.categoryId?.toString() || '',
      price: combo.price.toString(),
      originalPrice: combo.originalPrice?.toString() || '',
      isActive: combo.isActive,
      groups: combo.groups?.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        selectionType: g.selectionType,
        minSelections: g.minSelections,
        maxSelections: g.maxSelections,
        isRequired: g.isRequired,
        sortOrder: g.sortOrder,
        items: g.items?.map(item => ({
          id: item.id,
          productId: item.productId || (item.product?.id ?? 0),
          product: item.product,
          priceAdjustment: item.priceAdjustment,
          isDefault: item.isDefault,
          sortOrder: item.sortOrder,
        })) || [],
      })) || [],
    });
    setFormError('');
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCombo(null);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('請輸入套餐名稱');
      return;
    }

    if (!formData.price || isNaN(Number(formData.price))) {
      setFormError('請輸入有效的價格');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        isActive: formData.isActive,
        groups: formData.groups.map((g, i) => ({
          id: g.id,
          name: g.name,
          description: g.description || null,
          selectionType: g.selectionType,
          minSelections: g.minSelections,
          maxSelections: g.maxSelections,
          isRequired: g.isRequired,
          sortOrder: i,
          items: g.items.map((item, j) => ({
            productId: item.productId,
            priceAdjustment: item.priceAdjustment,
            isDefault: item.isDefault,
            sortOrder: j,
          })),
        })),
      };

      const url = editingCombo ? `/api/combos/${editingCombo.id}` : '/api/combos';
      const method = editingCombo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeModal();
        fetchCombos();
      } else {
        const data = await res.json();
        setFormError(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setFormError('操作失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (combo: Combo) => {
    if (!confirm(`確定要刪除套餐「${combo.name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/combos/${combo.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCombos();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const addGroup = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          name: '',
          description: '',
          selectionType: 'single' as const,
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          sortOrder: prev.groups.length,
          items: [],
        },
      ],
    }));
  }, []);

  const removeGroup = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  }, []);

  const updateGroup = useCallback((index: number, updates: Partial<ComboGroup>) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((g, i) => (i === index ? { ...g, ...updates } : g)),
    }));
  }, []);

  const addItemToGroup = useCallback((groupIndex: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((g, i) => {
        if (i !== groupIndex) return g;
        // Check if product already exists
        if (g.items.some(item => item.productId === productId)) return g;
        return {
          ...g,
          items: [
            ...g.items,
            {
              productId,
              product,
              priceAdjustment: 0,
              isDefault: g.items.length === 0,
              sortOrder: g.items.length,
            },
          ],
        };
      }),
    }));
  }, [products]);

  const removeItemFromGroup = useCallback((groupIndex: number, itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((g, i) => {
        if (i !== groupIndex) return g;
        return {
          ...g,
          items: g.items.filter((_, j) => j !== itemIndex),
        };
      }),
    }));
  }, []);

  const updateItemInGroup = useCallback((groupIndex: number, itemIndex: number, updates: Partial<ComboGroupItem>) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((g, i) => {
        if (i !== groupIndex) return g;
        return {
          ...g,
          items: g.items.map((item, j) => (j === itemIndex ? { ...item, ...updates } : item)),
        };
      }),
    }));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">套餐管理</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              管理套餐組合，設定選擇群組與可選商品
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增套餐
          </Button>
        </div>

        {/* Combos List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">載入中...</div>
          ) : combos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              尚無套餐，點擊「新增套餐」開始建立
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {combos.map(combo => (
                <div
                  key={combo.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {combo.name}
                        </h3>
                        {!combo.isActive && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300 rounded">
                            已停用
                          </span>
                        )}
                        {combo.category && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded">
                            {combo.category.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${combo.price}
                        </span>
                        {combo.originalPrice && (
                          <span className="line-through text-slate-400">
                            ${combo.originalPrice}
                          </span>
                        )}
                        <span>
                          {combo.groups?.length || 0} 個選擇群組
                        </span>
                      </div>
                      {combo.description && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {combo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditModal(combo)}>
                        編輯
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(combo)}>
                        刪除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCombo ? '編輯套餐' : '新增套餐'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    套餐名稱 *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：經典早餐套餐"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    分類
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">無分類</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    售價 *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    原價（選填，用於顯示優惠）
                  </label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={e => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                    啟用此套餐
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    說明
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="套餐說明..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Groups */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    選擇群組
                  </h3>
                  <Button type="button" variant="secondary" size="sm" onClick={addGroup}>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    新增群組
                  </Button>
                </div>

                {formData.groups.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center text-slate-500 dark:text-slate-400">
                    尚無選擇群組，點擊「新增群組」開始建立
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.groups.map((group, groupIndex) => (
                      <div
                        key={groupIndex}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              value={group.name}
                              onChange={e => updateGroup(groupIndex, { name: e.target.value })}
                              placeholder="群組名稱（如：選擇主餐）"
                            />
                            <select
                              value={group.selectionType}
                              onChange={e => updateGroup(groupIndex, { selectionType: e.target.value as 'single' | 'multiple' })}
                              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            >
                              <option value="single">單選</option>
                              <option value="multiple">多選</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGroup(groupIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>

                        {/* Group Items */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              可選商品
                            </span>
                            <select
                              value=""
                              onChange={e => {
                                if (e.target.value) {
                                  addItemToGroup(groupIndex, parseInt(e.target.value));
                                  e.target.value = '';
                                }
                              }}
                              className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            >
                              <option value="">+ 新增商品...</option>
                              {products
                                .filter(p => !group.items.some(item => item.productId === p.id))
                                .map(p => (
                                  <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                ))
                              }
                            </select>
                          </div>

                          {group.items.length === 0 ? (
                            <div className="p-2 text-center text-xs text-slate-400">
                              尚無可選商品
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {group.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                                >
                                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                                    {item.product?.name || products.find(p => p.id === item.productId)?.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500">價差:</label>
                                    <Input
                                      type="number"
                                      value={item.priceAdjustment}
                                      onChange={e => updateItemInGroup(groupIndex, itemIndex, { priceAdjustment: Number(e.target.value) })}
                                      className="w-20 text-sm"
                                    />
                                  </div>
                                  <label className="flex items-center gap-1 text-xs text-slate-500">
                                    <input
                                      type="checkbox"
                                      checked={item.isDefault}
                                      onChange={e => updateItemInGroup(groupIndex, itemIndex, { isDefault: e.target.checked })}
                                      className="h-3 w-3"
                                    />
                                    預設
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => removeItemFromGroup(groupIndex, itemIndex)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeModal}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? '儲存中...' : editingCombo ? '更新' : '建立'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
