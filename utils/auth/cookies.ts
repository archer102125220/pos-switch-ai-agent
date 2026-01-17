import { cookies } from 'next/headers';
import { 
  ACCESS_TOKEN_COOKIE, 
  REFRESH_TOKEN_COOKIE 
} from '@/types/auth';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Set access token cookie
 */
export async function setAccessTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE.name, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: ACCESS_TOKEN_COOKIE.path,
    maxAge: ACCESS_TOKEN_COOKIE.maxAge,
  });
}

/**
 * Set refresh token cookie
 */
export async function setRefreshTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE.name, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: REFRESH_TOKEN_COOKIE.path,
    maxAge: REFRESH_TOKEN_COOKIE.maxAge,
  });
}

/**
 * Set both tokens at once (used in login and refresh)
 */
export async function setAuthCookies(
  accessToken: string, 
  refreshToken: string
): Promise<void> {
  await setAccessTokenCookie(accessToken);
  await setRefreshTokenCookie(refreshToken);
}

/**
 * Get access token from cookies
 */
export async function getAccessTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE.name)?.value;
}

/**
 * Get refresh token from cookies  
 */
export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE.name)?.value;
}

/**
 * Clear all auth cookies (used in logout)
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(ACCESS_TOKEN_COOKIE.name, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: ACCESS_TOKEN_COOKIE.path,
    maxAge: 0,
  });
  
  cookieStore.set(REFRESH_TOKEN_COOKIE.name, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: REFRESH_TOKEN_COOKIE.path,
    maxAge: 0,
  });
}
