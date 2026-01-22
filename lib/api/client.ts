/**
 * API Client with automatic token refresh
 * 
 * Handles 401 errors by attempting to refresh the access token
 * and retrying the original request.
 */

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      onTokenRefreshed('refreshed');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Enhanced fetch with automatic token refresh on 401
 */
export async function apiClient(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Make the initial request
  let response = await fetch(url, finalOptions);

  // If 401 and not already refreshing, try to refresh token
  if (response.status === 401 && !url.includes('/api/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        // Retry the original request
        response = await fetch(url, finalOptions);
      } else {
        // Refresh failed, redirect to login
        const locale = window.location.pathname.split('/')[1] || 'zh-tw';
        window.location.href = `/${locale}/login`;
        throw new Error('Authentication failed');
      }
    } else {
      // Already refreshing, wait for it to complete
      await new Promise<void>((resolve) => {
        subscribeTokenRefresh(() => resolve());
      });

      // Retry the original request
      response = await fetch(url, finalOptions);
    }
  }

  return response;
}

/**
 * Convenience wrapper for GET requests
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const response = await apiClient(url, { method: 'GET' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Convenience wrapper for POST requests
 */
export async function apiPost<T = unknown>(
  url: string,
  data?: unknown
): Promise<T> {
  const response = await apiClient(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Convenience wrapper for PUT requests
 */
export async function apiPut<T = unknown>(
  url: string,
  data?: unknown
): Promise<T> {
  const response = await apiClient(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Convenience wrapper for DELETE requests
 */
export async function apiDelete<T = unknown>(url: string): Promise<T> {
  const response = await apiClient(url, { method: 'DELETE' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}
