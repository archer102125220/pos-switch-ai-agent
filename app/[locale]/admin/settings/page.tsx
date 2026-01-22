'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button, Input } from '@/components/ui';

interface Settings {
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  tax_rate?: string;
  tax_included?: string;
  receipt_message?: string;
  currency?: string;
  timezone?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const fetchedRef = useRef(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = useCallback((key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveMessage(`錯誤: ${data.error || '儲存失敗'}`);
        return;
      }

      setSaveMessage('設定已成功儲存');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Save settings error:', error);
      setSaveMessage('儲存時發生錯誤');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="系統設定">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="系統設定">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Save Message */}
        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.includes('成功') 
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Store Information */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            店家資訊
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                店家名稱
              </label>
              <Input
                type="text"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                placeholder="POS Switch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                店家地址
              </label>
              <Input
                type="text"
                value={settings.store_address || ''}
                onChange={(e) => handleChange('store_address', e.target.value)}
                placeholder="台北市..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                聯絡電話
              </label>
              <Input
                type="tel"
                value={settings.store_phone || ''}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                placeholder="02-1234-5678"
              />
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            稅金設定
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                稅率 (%)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.tax_rate || '0'}
                onChange={(e) => handleChange('tax_rate', e.target.value)}
                placeholder="5"
              />
              <p className="text-xs text-slate-500 mt-1">例如: 5 代表 5%</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tax_included"
                checked={settings.tax_included === 'true'}
                onChange={(e) => handleChange('tax_included', e.target.checked ? 'true' : 'false')}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="tax_included" className="text-sm text-slate-700 dark:text-slate-300">
                價格已含稅
              </label>
            </div>
          </div>
        </div>

        {/* Receipt Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            收據設定
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                收據頁尾訊息
              </label>
              <textarea
                value={settings.receipt_message || ''}
                onChange={(e) => handleChange('receipt_message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="感謝光臨，歡迎再次光臨！"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            系統設定
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                貨幣
              </label>
              <select
                value={settings.currency || 'TWD'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="TWD">新台幣 (TWD)</option>
                <option value="USD">美元 (USD)</option>
                <option value="CNY">人民幣 (CNY)</option>
                <option value="HKD">港幣 (HKD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                時區
              </label>
              <select
                value={settings.timezone || 'Asia/Taipei'}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Asia/Taipei">台北 (GMT+8)</option>
                <option value="Asia/Hong_Kong">香港 (GMT+8)</option>
                <option value="Asia/Shanghai">上海 (GMT+8)</option>
                <option value="America/New_York">紐約 (GMT-5)</option>
                <option value="Europe/London">倫敦 (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving} size="lg">
            儲存所有設定
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
