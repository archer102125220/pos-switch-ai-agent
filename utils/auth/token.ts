import { NextRequest } from 'next/server';
import { getAccessTokenCookie, getRefreshTokenCookie } from './cookies';

/**
 * Extract Access Token from request
 * Priority: Cookie > Authorization Header
 * 
 * @param request - NextRequest object (optional for server components)
 * @returns Access token string or undefined
 */
export async function getAccessToken(request?: NextRequest): Promise<string | undefined> {
  // 1. Try to get from Cookie (highest priority for backward compatibility)
  const cookieToken = await getAccessTokenCookie();
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Try to get from Authorization Header (Bearer Token mode)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  return undefined;
}

/**
 * Extract Refresh Token from request
 * Priority: Cookie > Request Body
 * 
 * @param request - NextRequest object (optional)
 * @param bodyRefreshToken - Refresh token from request body (optional)
 * @returns Refresh token string or undefined
 */
export async function getRefreshToken(
  request?: NextRequest,
  bodyRefreshToken?: string
): Promise<string | undefined> {
  // 1. Try to get from Cookie (highest priority)
  const cookieToken = await getRefreshTokenCookie();
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Use token from request body (Bearer Token mode)
  if (bodyRefreshToken) {
    return bodyRefreshToken;
  }

  return undefined;
}

/**
 * Determine if request is using Bearer Token mode
 * Based on presence of Authorization header
 * 
 * @param request - NextRequest object
 * @returns true if using Bearer Token mode
 */
export function isBearerTokenMode(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader !== null && authHeader.startsWith('Bearer ');
}

/**
 * Check if tokens should be returned in JSON response
 * Returns true for Bearer Token mode
 * 
 * @param request - NextRequest object
 * @returns true if tokens should be in JSON response
 */
export function shouldReturnTokensInJson(request: NextRequest): boolean {
  return isBearerTokenMode(request);
}
