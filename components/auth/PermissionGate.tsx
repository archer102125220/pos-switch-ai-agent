"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

interface PermissionGateProps {
  /**
   * Permissions required to render children
   */
  permissions?: string[];

  /**
   * If true, user must have ALL specified permissions.
   * If false, user must have ANY of the specified permissions.
   * Default: false (requires any)
   */
  requireAll?: boolean;

  /**
   * Content to render when permission check fails
   */
  fallback?: ReactNode;

  /**
   * Content to render when permission check passes
   */
  children: ReactNode;
}

/**
 * Permission Gate Component
 *
 * Conditionally renders children based on user permissions.
 *
 * @example
 * // Render only if user has 'products' permission
 * <PermissionGate permissions={['products']}>
 *   <Link href="/admin/products">商品管理</Link>
 * </PermissionGate>
 *
 * @example
 * // Render only if user has BOTH 'users' AND 'roles' permissions
 * <PermissionGate permissions={['users', 'roles']} requireAll>
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // With fallback content
 * <PermissionGate
 *   permissions={['system_settings']}
 *   fallback={<p>權限不足</p>}
 * >
 *   <SettingsPage />
 * </PermissionGate>
 */
export function PermissionGate({
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { user, hasAllPermissions, hasAnyPermission } = useAuth();

  // If no permissions specified, always render
  if (!permissions || permissions.length === 0) {
    return <>{children}</>;
  }

  // If no user, don't render
  if (!user) {
    return <>{fallback}</>;
  }

  // Check permissions
  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
