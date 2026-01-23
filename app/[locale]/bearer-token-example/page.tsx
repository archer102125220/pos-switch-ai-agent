'use client';

import { useState } from 'react';
import { BearerTokenClient, type AuthUser } from '@/utils/auth/BearerTokenClient';

/**
 * Bearer Token Authentication Example
 * 
 * Demonstrates how to use the BearerTokenClient for authentication
 * in a cross-domain or mobile app scenario.
 */

const authClient = new BearerTokenClient();

export default function BearerTokenExample() {
  const [email, setEmail] = useState('admin@pos-switch.com');
  const [password, setPassword] = useState('admin123');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const userData = await authClient.login(email, password);
      setUser(userData);
      setMessage('✅ 登入成功！');
    } catch (error: unknown) {
      setMessage('❌ ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetUser = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const userData = await authClient.getCurrentUser();
      setUser(userData);
      setMessage('✅ 取得用戶資訊成功！');
    } catch (error: unknown) {
      setMessage('❌ ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await authClient.refreshAccessToken();
      setMessage('✅ Token 刷新成功！');
    } catch (error: unknown) {
      setMessage('❌ ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await authClient.logout();
      setUser(null);
      setMessage('✅ 登出成功！');
    } catch (error: unknown) {
      setMessage('❌ ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRequest = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Example: Make an authenticated request
      const response = await authClient.request('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
      setMessage('✅ API 請求成功！');
    } catch (error: unknown) {
      setMessage('❌ ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Bearer Token Authentication Example</h1>
      
      {/* Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="font-semibold">
          狀態: {authClient.isAuthenticated() ? '✅ 已認證' : '❌ 未認證'}
        </p>
        {user && (
          <p className="mt-2">
            用戶: {user.name} ({user.email}) - {user.role}
          </p>
        )}
      </div>

      {/* Login Form */}
      <div className="mb-6 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">1. 登入</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
          disabled={isLoading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          disabled={isLoading}
        />
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? '處理中...' : 'Login with Bearer Token'}
        </button>
      </div>

      {/* Actions */}
      <div className="mb-6 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">2. API 操作</h2>
        <div className="space-y-2">
          <button
            onClick={handleGetUser}
            disabled={isLoading || !authClient.isAuthenticated()}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Get User Info
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading || !authClient.isAuthenticated()}
            className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
          >
            Refresh Token
          </button>
          <button
            onClick={handleTestRequest}
            disabled={isLoading || !authClient.isAuthenticated()}
            className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            Test API Request (with auto-refresh)
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoading || !authClient.isAuthenticated()}
            className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded ${message.startsWith('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
          {message}
        </div>
      )}

      {/* Code Example */}
      <div className="mt-8 p-6 bg-gray-900 text-gray-100 rounded">
        <h3 className="text-lg font-bold mb-4">程式碼範例</h3>
        <pre className="text-sm overflow-x-auto">
{`import { BearerTokenClient } from '@/utils/auth/BearerTokenClient';

const authClient = new BearerTokenClient();

// Login
const user = await authClient.login(email, password);

// Get current user
const user = await authClient.getCurrentUser();

// Make authenticated request (auto-refresh if needed)
const response = await authClient.request('/api/auth/me');

// Refresh token manually
await authClient.refreshAccessToken();

// Logout
await authClient.logout();
`}
        </pre>
      </div>
    </div>
  );
}
