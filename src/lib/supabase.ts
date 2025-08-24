import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';

/**
 * Supabase Auth API client
 * Provides authentication functionality using Supabase GoTrue
 */

interface AuthError {
  message: string;
  status?: number;
}

interface AuthResponse<T> {
  data: T | null;
  error: AuthError | null;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: User;
}

/**
 * Make authenticated requests to Supabase Auth API
 */
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<AuthResponse<T>> {
  const url = `${getSupabaseUrl()}/auth/v1${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    apikey: getSupabaseAnonKey(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data.msg || data.error_description || 'Authentication failed',
          status: response.status,
        },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Get session from storage
 */
function getStoredSession(): Session | null {
  try {
    const stored = localStorage.getItem('supabase.auth.token');
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    // Check if session is expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      localStorage.removeItem('supabase.auth.token');
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Store session in localStorage
 */
function storeSession(session: Session | null) {
  if (session) {
    // Calculate expires_at if not provided
    if (!session.expires_at && session.expires_in) {
      session.expires_at = Math.floor(Date.now() / 1000) + session.expires_in;
    }
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  } else {
    localStorage.removeItem('supabase.auth.token');
  }
}

export const supabaseAuth = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const response = await authFetch<{ user: User; session: Session | null }>('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        data: metadata,
      }),
    });

    if (response.data?.session) {
      storeSession(response.data.session);
    }

    return response;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const response = await authFetch<Session>('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.data) {
      storeSession(response.data);
    }

    return response;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const session = getStoredSession();
    if (!session) return { error: null };

    const response = await authFetch<{}>('/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    storeSession(null);
    return response;
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<Session | null> {
    const stored = getStoredSession();
    if (!stored) return null;

    // If session is about to expire (within 60 seconds), try to refresh
    if (stored.expires_at && stored.expires_at * 1000 - Date.now() < 60000) {
      const refreshed = await this.refreshSession(stored.refresh_token);
      if (refreshed.data) {
        return refreshed.data;
      }
    }

    return stored;
  },

  /**
   * Get the current user
   */
  async getUser(): Promise<User | null> {
    const session = await this.getSession();
    if (!session) return null;

    const response = await authFetch<User>('/user', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    return response.data;
  },

  /**
   * Refresh the session using refresh token
   */
  async refreshSession(refreshToken: string) {
    const response = await authFetch<Session>('/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (response.data) {
      storeSession(response.data);
    }

    return response;
  },

  /**
   * Update user metadata
   */
  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, unknown> }) {
    const session = await this.getSession();
    if (!session) {
      return {
        data: null,
        error: { message: 'No active session' },
      };
    }

    const response = await authFetch<User>('/user', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(attributes),
    });

    return response;
  },

  /**
   * Send password reset email
   */
  async resetPasswordForEmail(email: string) {
    return authFetch<{}>('/recover', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Update password with recovery token
   */
  async updatePassword(accessToken: string, newPassword: string) {
    const response = await authFetch<User>('/user', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    return response;
  },
};