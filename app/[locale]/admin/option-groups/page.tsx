'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button, Input } from '@/components/ui';
import { classNames } from '@/utils/classNames';

interface Option {
  id?: number;
  name: string;
  priceAdjustment: number;
  isActive?: boolean;
  sortOrder?: number;
}

interface OptionGroup {
  id: number;
  name: string;
  isRequired: boolean;
  multipleSelection: boolean;
  isActive: boolean;
  sortOrder: number;
  options?: Option[];
}

export default function OptionGroupsPage() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    isRequired: false,
    multipleSelection: false,
    options: [] as Option[],
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchedRef = useRef(false);

  const fetchOptionGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/option-groups');
      const data = await res.json();
      if (res.ok) {
        setOptionGroups(data.optionGroups);
      }
    } catch (error) {
      console.error('Fetch option groups error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchOptionGroups();
  }, [fetchOptionGroups]);

  const openCreateModal = useCallback(() => {
    setEditingGroup(null);
    setFormData({
      name: '',
      isRequired: false,
      multipleSelection: false,
      options: [],
    });
    setFormError('');
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((group: OptionGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      isRequired: group.isRequired,
      multipleSelection: group.multipleSelection,
      options: group.options || [],
    });
    setFormError('');
    setIsModalOpen(true);
  }, []);

  const addOption = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { name: '', priceAdjustment: 0 }],
    }));
  }, []);

  const updateOption = useCallback((index: number, field: keyof Option, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  }, []);

  const removeOption = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        isRequired: formData.isRequired,
        multipleSelection: formData.multipleSelection,
        options: formData.options.filter(opt => opt.name.trim() !== ''),
      };

      const url = editingGroup ? `/api/option-groups/${editingGroup.id}` : '/api/option-groups';
      const method = editingGroup ? 'PUT' : 'POST';

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
      fetchOptionGroups();
    } catch (error) {
      console.error('Submit error:', error);
      setFormError('操作時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (group: OptionGroup) => {
    if (!confirm(`確定要刪除選項群組 "${group.name}" 嗎？`)) return;

    try {
      const res = await fetch(`/api/option-groups/${group.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '刪除失敗');
        return;
      }

      fetchOptionGroups();
    } catch (error) {
      console.error('Delete error:', error);
      alert('刪除時發生錯誤');
    }
  };

  return (
    <AdminLayout title="選項群組管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <Button onClick={openCreateModal}>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增選項群組
          </Button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : optionGroups.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              尚無選項群組
            </div>
          ) : (
            optionGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {group.isRequired && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                          必選
                        </span>
                      )}
                      {group.multipleSelection && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                          多選
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="編輯"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(group)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="刪除"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">選項:</p>
                  {group.options && group.options.length > 0 ? (
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-0.5">
                      {group.options.map((opt, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{opt.name}</span>
                          {opt.priceAdjustment !== 0 && (
                            <span className="text-slate-500">
                              {opt.priceAdjustment > 0 ? '+' : ''}{opt.priceAdjustment}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">無選項</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {editingGroup ? '編輯選項群組' : '新增選項群組'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  群組名稱 *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">必選</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.multipleSelection}
                    onChange={(e) => setFormData(prev => ({ ...prev, multipleSelection: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">可多選</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    選項
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    + 新增選項
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="選項名稱"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="價格調整"
                        value={option.priceAdjustment}
                        onChange={(e) => updateOption(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                        className="w-28"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
                  {editingGroup ? '更新' : '建立'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
