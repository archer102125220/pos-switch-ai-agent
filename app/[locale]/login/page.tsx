'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // AuthContext handles redirect based on permissions
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗，請檢查您的帳號和密碼');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">P</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">POS Switch</h1>
          <p className="text-indigo-100">管理後台登入</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                電子郵件
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pos-switch.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              登入
            </Button>
          </form>

          {/* Default Credentials Hint */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              預設帳號: admin@pos-switch.com<br />
              預設密碼: admin123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-indigo-100 text-sm mt-6">
          © 2026 POS Switch AI Agent
        </p>
      </div>
    </div>
  );
}
