/**
 * Permission constants and admin role configuration
 */

// Admin role name - users with this role always have ALL permissions
export const ADMIN_ROLE_NAME = 'admin';

// All available permissions in the system
export const ALL_PERMISSIONS = [
  'product_management',
  'checkout',
  'order_history',
  'statistics',
  'system_settings',
] as const;

export type PermissionCode = typeof ALL_PERMISSIONS[number];

/**
 * Check if a role name is the admin role
 */
export function isAdminRole(roleName: string): boolean {
  return roleName.toLowerCase() === ADMIN_ROLE_NAME;
}

/**
 * Get permissions for a role
 * Admin role always gets ALL permissions
 */
export function getPermissionsForRole(
  roleName: string,
  rolePermissions: string[]
): string[] {
  if (isAdminRole(roleName)) {
    return [...ALL_PERMISSIONS];
  }
  return rolePermissions;
}
