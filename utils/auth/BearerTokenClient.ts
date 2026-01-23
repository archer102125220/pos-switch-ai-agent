/**
 * Bearer Token Authentication Client
 * 
 * A utility class for managing Bearer Token authentication.
 * Handles token storage, refresh, and API requests.
 */

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export class BearerTokenClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private readonly storageKey = 'auth_tokens';
  private readonly useSessionStorage: boolean;

  constructor(useSessionStorage: boolean = false) {
    this.useSessionStorage = useSessionStorage;
    this.loadTokens();
  }

  /**
   * Get the storage object (localStorage or sessionStorage)
   */
  private get storage(): Storage {
    return this.useSessionStorage ? sessionStorage : localStorage;
  }

  /**
   * Load tokens from storage
   */
  private loadTokens(): void {
    try {
      const stored = this.storage.getItem(this.storageKey);
      if (stored) {
        const tokens: AuthTokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.clearTokens();
    }
  }

  /**
   * Save tokens to storage
   */
  private saveTokens(): void {
    if (this.accessToken && this.refreshToken) {
      const tokens: AuthTokens = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      };
      this.storage.setItem(this.storageKey, JSON.stringify(tokens));
    }
  }

  /**
   * Clear tokens from memory and storage
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.storage.removeItem(this.storageKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.refreshToken !== null;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy', // Trigger Bearer Token mode
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '登入失敗');
    }

    const data: LoginResponse = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.saveTokens();

    return data.user;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await this.request('/api/auth/me');
    const data = await response.json();
    return data.user;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy', // Trigger Bearer Token mode
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.accessToken = data.accessToken;
    if (data.refreshToken) {
      this.refreshToken = data.refreshToken;
    }
    this.saveTokens();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (this.accessToken && this.refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    this.clearTokens();
  }

  /**
   * Make an authenticated request
   * Automatically handles token refresh if access token is expired
   */
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    // Add Authorization header
    const headers = new Headers(options.headers);
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        
        // Retry request with new token
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        return await fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        // Refresh failed, clear tokens
        this.clearTokens();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }
}

// Export singleton instance
export const authClient = new BearerTokenClient();
