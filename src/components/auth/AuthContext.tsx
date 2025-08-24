/**
 * AuthContext with Supabase integration
 * - Purpose: Provide auth context API and initialize authentication on app start.
 * - Implementation: Bridges to the Supabase-enabled zustand store and handles auth initialization.
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

/**
 * Member information shape expected by the dashboard UI.
 */
export interface MemberInfo {
  pharmacyName?: string;
  lastLoginISO?: string;
  subscriptionStatus?: 'Active' | 'Expired' | 'Expiring';
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Context value shape for auth.
 */
interface AuthContextValue {
  member: MemberInfo | null;
  isLoading: boolean;
}

/**
 * Internal React context.
 */
const AuthContext = createContext<AuthContextValue>({ member: null, isLoading: true });

/**
 * AuthProvider
 * - Wraps children and supplies member info derived from the zustand auth store.
 * - Initializes authentication check on mount.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Initialize authentication check on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Map existing User to MemberInfo fields used by the dashboard.
   */
  const member = useMemo<MemberInfo | null>(() => {
    if (!isAuthenticated || !user) return null;

    // Derive subscription status
    let subscriptionStatus: MemberInfo['subscriptionStatus'] = 'Active';
    const s = user.subscription?.status;
    if (s === 'cancelled' || s === 'inactive') subscriptionStatus = 'Expired';
    if (s === 'active') subscriptionStatus = 'Active';

    // Extract first and last name from the user.name or user metadata
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      pharmacyName: user.name,
      lastLoginISO: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
      subscriptionStatus,
      email: user.email,
      firstName,
      lastName,
    };
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider value={{ member, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook: useAuth
 * - Return current auth context value.
 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
