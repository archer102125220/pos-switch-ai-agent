import { NextRequest, NextResponse } from 'next/server';
import { 
  getAccessTokenCookie, 
  verifyAccessToken,
  getRefreshTokenCookie,
  verifyRefreshToken,
} from '@/utils/auth';
import type { AccessTokenPayload, AuthUser } from '@/types/auth';

/**
 * Authentication Middleware for API Routes
 * 
 * NOTE: This file (`utils/auth/middleware.ts`) is an AUTH middleware for API route protection.
 * It is NOT the Next.js routing middleware.
 * 
 * In Next.js 16, the routing middleware file is `proxy.ts` (not `middleware.ts`).
 * See: https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

/**
 * Auth middleware options
 */
export interface AuthMiddlewareOptions {
  /** Required permissions (user must have ALL of them) */
  permissions?: string[];
  /** Required roles (user must have ONE of them) */
  roles?: string[];
  /** If true, allows access without authentication */
  optional?: boolean;
}

/**
 * Result of authentication check
 */
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  statusCode?: number;
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<AuthResult> {
  const accessToken = await getAccessTokenCookie();
  
  if (!accessToken) {
    return {
      success: false,
      error: '未登入',
      statusCode: 401,
    };
  }

  const decoded = verifyAccessToken(accessToken);
  
  if (!decoded) {
    return {
      success: false,
      error: 'Token 無效或已過期',
      statusCode: 401,
    };
  }

  const user: AuthUser = {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    roleId: decoded.roleId,
    role: '', // Role name not in token, fetch from DB if needed
    permissions: decoded.permissions,
  };

  return {
    success: true,
    user,
  };
}

/**
 * Check if user has required permissions
 */
export function hasPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every(p => userPermissions.includes(p));
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 401
): NextResponse {
  return NextResponse.json({ error }, { status: statusCode });
}

/**
 * Middleware factory for protected API routes
 * 
 * Usage:
 * ```ts
 * import { withAuth } from '@/utils/auth/middleware';
 * 
 * export const GET = withAuth(async (request, { user }) => {
 *   return NextResponse.json({ message: `Hello ${user.name}` });
 * }, { permissions: ['checkout'] });
 * ```
 */
export function withAuth<T extends NextRequest>(
  handler: (
    request: T,
    context: { user: AuthUser }
  ) => Promise<NextResponse> | NextResponse,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: T): Promise<NextResponse> => {
    const authResult = await checkAuth();

    // If auth is optional and user not logged in, continue without user
    if (options.optional && !authResult.success) {
      return handler(request, { user: null as unknown as AuthUser });
    }

    // Check authentication
    if (!authResult.success) {
      return createErrorResponse(
        authResult.error || '未登入',
        authResult.statusCode || 401
      );
    }

    const user = authResult.user!;

    // Check required permissions
    if (options.permissions && options.permissions.length > 0) {
      if (!hasPermissions(user.permissions, options.permissions)) {
        return createErrorResponse('權限不足', 403);
      }
    }

    // Check required roles (roleId based check would need DB lookup)
    // For now, skip role check since role name is not in token

    // Call the handler with authenticated user
    return handler(request, { user });
  };
}

/**
 * Simple auth check for route handlers (without permission check)
 * 
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuth();
 *   if (authResult.error) return authResult.error;
 *   const user = authResult.user;
 *   // ... rest of handler
 * }
 * ```
 */
export async function requireAuth(): Promise<{
  user?: AuthUser;
  error?: NextResponse;
}> {
  const result = await checkAuth();
  
  if (!result.success) {
    return {
      error: createErrorResponse(result.error || '未登入', result.statusCode || 401),
    };
  }

  return { user: result.user };
}

/**
 * Check if user has specific permission
 * Use this for fine-grained permission checks within handlers
 */
export function requirePermission(
  user: AuthUser,
  permission: string
): NextResponse | null {
  if (!user.permissions.includes(permission)) {
    return createErrorResponse('權限不足', 403);
  }
  return null;
}

/**
 * Check if user has ALL specified permissions
 */
export function requirePermissions(
  user: AuthUser,
  permissions: string[]
): NextResponse | null {
  if (!hasPermissions(user.permissions, permissions)) {
    return createErrorResponse('權限不足', 403);
  }
  return null;
}
