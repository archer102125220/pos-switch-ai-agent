'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button, Input } from '@/components/ui';
import { classNames } from '@/utils/classNames';

interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  userCount: number;
  permissions?: Permission[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    permissionIds: [] as number[],
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Fetch roles error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch('/api/permissions');
      const data = await res.json();
      if (res.ok) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Fetch permissions error:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
      permissionIds: [],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive,
      permissionIds: role.permissions?.map(p => p.id) || [],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const togglePermission = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        isActive: formData.isActive,
        permissionIds: formData.permissionIds,
      };

      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

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
      fetchRoles();
    } catch (error) {
      console.error('Submit error:', error);
      setFormError('操作時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.userCount > 0) {
      alert(`此角色有 ${role.userCount} 個使用者，無法刪除。請先將使用者移至其他角色。`);
      return;
    }
    
    if (!confirm(`確定要刪除角色 "${role.name}" 嗎？`)) return;

    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '刪除失敗');
        return;
      }

      fetchRoles();
    } catch (error) {
      console.error('Delete error:', error);
      alert('刪除時發生錯誤');
    }
  };

  const isAdminRole = (roleName: string) => roleName.toLowerCase() === 'admin';

  return (
    <AdminLayout title="角色權限管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600 dark:text-slate-400">
            管理系統角色與其對應的權限設定
          </p>
          <Button onClick={openCreateModal}>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增角色
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              載入中...
            </div>
          ) : roles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              無角色資料
            </div>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {role.name}
                      </h3>
                      {isAdminRole(role.name) && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          系統角色
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {role.description || '無描述'}
                    </p>
                  </div>
                  <span className={classNames(
                    'px-2 py-1 text-xs font-medium rounded-lg',
                    role.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {role.isActive ? '啟用' : '停用'}
                  </span>
                </div>

                {/* User Count */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span>{role.userCount} 位使用者</span>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">
                    權限
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {isAdminRole(role.name) ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        所有權限
                      </span>
                    ) : role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((perm) => (
                        <span
                          key={perm.id}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {perm.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">無權限</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="編輯"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  {!isAdminRole(role.name) && (
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="刪除"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
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
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {editingRole ? '編輯角色' : '新增角色'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  角色名稱 *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={Boolean(editingRole && isAdminRole(editingRole.name))}
                  required
                />
                {editingRole && isAdminRole(editingRole.name) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    系統角色名稱無法修改
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  描述
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                  啟用角色
                </label>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  權限設定
                </label>
                {editingRole && isAdminRole(editingRole.name) ? (
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      🔒 管理員角色自動擁有所有權限，無需設定
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                    {permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {perm.name}
                          </p>
                          {perm.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
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
                  {editingRole ? '更新' : '建立'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
