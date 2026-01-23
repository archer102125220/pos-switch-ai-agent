/**
 * CORS Utilities for API Routes
 *
 * Provides CORS header management based on environment configuration.
 * Enable CORS by setting ENABLE_CORS=true in .env
 */

import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

/**
 * Check if CORS is enabled via environment variable
 */
export function isCorsEnabled(): boolean {
  return process.env.ENABLE_CORS === 'true';
}

/**
 * Get list of allowed origins from environment
 */
export function getAllowedOrigins(): string[] {
  const originsStr = process.env.CORS_ALLOWED_ORIGINS || '';
  if (!originsStr.trim()) {
    return [];
  }
  return originsStr.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  
  // If no specific origins set, allow all when CORS is enabled
  if (allowedOrigins.length === 0 && isCorsEnabled()) {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  if (!isCorsEnabled()) {
    return {};
  }

  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {};

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    headers['Access-Control-Max-Age'] = '86400'; // 24 hours
  } else if (isCorsEnabled() && getAllowedOrigins().length === 0) {
    // Allow all origins when CORS enabled but no specific origins set
    headers['Access-Control-Allow-Origin'] = origin || '*';
    headers['Access-Control-Allow-Credentials'] = origin ? 'true' : 'false';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    headers['Access-Control-Max-Age'] = '86400';
  }

  return headers;
}

/**
 * Add CORS headers to a NextResponse
 */
export function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  if (!isCorsEnabled()) {
    return new NextResponse(null, { status: 405 });
  }

  const corsHeaders = getCorsHeaders(request);
  
  if (Object.keys(corsHeaders).length === 0) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Create a JSON response with CORS headers
 */
export function corsJsonResponse<T>(
  data: T,
  request: NextRequest,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, init);
  return withCors(response, request);
}
