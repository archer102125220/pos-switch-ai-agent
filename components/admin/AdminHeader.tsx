'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { classNames } from '@/utils/classNames';

export interface AdminHeaderProps {
  title?: string;
}

interface User {
  name: string;
  email: string;
  role: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  // Use null as initial state to match server render
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted first to enable client-only rendering
    setIsMounted(true);
    
    // Fetch current user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Consistent display values - use placeholder on both server and initial client render
  const displayName = user?.name || '使用者';
  const displayInitial = user?.name?.charAt(0) || 'U';
  const displayRole = user?.role || '';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left: Title */}
        <div className="flex items-center gap-4 lg:pl-0 pl-12">
          {title && (
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Avatar */}
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {displayInitial}
                </span>
              </div>
              {/* User Info - only show after mounted to avoid hydration issues */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {isMounted && !user ? '載入中...' : displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {displayRole}
                </p>
              </div>
              {/* Chevron */}
              <svg 
                className={classNames(
                  'h-4 w-4 text-slate-500 transition-transform',
                  isDropdownOpen && 'rotate-180'
                )} 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-1.5">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1.5">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {displayEmail}
                    </p>
                  </div>
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    個人資料
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    登出
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

