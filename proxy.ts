import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Admin permissions that indicate user should go to /admin
const ADMIN_PERMISSIONS = [
  'users', 'roles', 'permissions', 'products', 
  'categories', 'addons', 'system_settings'
];

// POS permissions
const POS_PERMISSIONS = ['checkout', 'order_history'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Execute i18n middleware first
  const intlResponse = intlMiddleware(request);
  
  // Extract locale from pathname (e.g., /zh-tw/admin -> zh-tw)
  const localeMatch = pathname.match(/^\/(zh-tw|en)/);
  const locale = localeMatch ? localeMatch[1] : 'zh-tw';
  
  // Check if this is a protected route
  const isAdminRoute = pathname.match(/^\/(zh-tw|en)\/admin/);
  const isPosRoute = pathname.match(/^\/(zh-tw|en)\/pos/);
  const isLoginPage = pathname.match(/^\/(zh-tw|en)\/login/);
  const isProtectedRoute = isAdminRoute || isPosRoute;
  
  // Get access token from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  let userPermissions: string[] = [];
  
  if (accessToken) {
    try {
      // Decode JWT to get permissions (basic decode, not verification)
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString()
      );
      userPermissions = payload.permissions || [];
    } catch (error) {
      // Invalid token format, treat as unauthenticated
      console.error('Invalid token format:', error);
    }
  }
  
  // Route Protection Logic
  
  // 1. Unauthenticated user trying to access protected route -> redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 2. Authenticated user trying to access login page -> redirect based on permissions
  if (isLoginPage && accessToken) {
    const hasAdminPerms = userPermissions.some(p => ADMIN_PERMISSIONS.includes(p));
    const redirectPath = hasAdminPerms ? `/${locale}/admin` : `/${locale}/pos`;
    const redirectUrl = new URL(redirectPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // 3. Root path (/) -> redirect to login if not authenticated, or to appropriate dashboard
  if (pathname === `/${locale}` || pathname === `/${locale}/`) {
    if (!accessToken) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    } else {
      const hasAdminPerms = userPermissions.some(p => ADMIN_PERMISSIONS.includes(p));
      const redirectPath = hasAdminPerms ? `/${locale}/admin` : `/${locale}/pos`;
      const redirectUrl = new URL(redirectPath, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return intlResponse;
}

export const config = {
  // Match only internationalized pathnames and root
  matcher: ['/', '/(zh-tw|en)/:path*'],
};

