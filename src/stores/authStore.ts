/**
 * Authentication state management store with real Supabase integration
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authService } from '../services/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: { email: string; password: string; firstName?: string; lastName?: string; pharmacyName?: string }) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: { firstName?: string; lastName?: string; pharmacyName?: string }) => Promise<boolean>;
  clearUserContext: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * User login function with Supabase
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await authService.signIn(email, password);
          
          if (error) {
            console.error('Login error:', error);
            set({ isLoading: false });
            return false;
          }

          if (data?.user) {
            // Get user profile to create User object
            const profile = await authService.getCurrentProfile();
            
            if (profile) {
              const user: User = {
                id: profile.id,
                email: profile.email,
                name: profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`.trim()
                  : profile.pharmacy_name || profile.email,
                role: 'member',
                subscription: {
                  id: 'default',
                  planName: 'Premium',
                  status: profile.subscription_status === 'Active' ? 'active' : 'inactive',
                  startDate: new Date(profile.created_at),
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  programs: ['mtm-future-today', 'timemymeds', 'test-treat'],
                },
                createdAt: new Date(profile.created_at),
              };

              set({ user, isAuthenticated: true, isLoading: false });
              return true;
            }
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * User logout function
       */
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear auth state
        set({ user: null, isAuthenticated: false, isLoading: false });
        
        // Clear profiles context (will be imported lazily to avoid circular deps)
        get().clearUserContext();
      },

      /**
       * User registration function with Supabase
       */
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const { error } = await authService.signUp(
            userData.email, 
            userData.password,
            {
              first_name: userData.firstName,
              last_name: userData.lastName,
              pharmacy_name: userData.pharmacyName,
            }
          );
          
          if (error) {
            console.error('Registration error:', error);
            set({ isLoading: false });
            return false;
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * Check if user is authenticated on app start
       */
      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const session = await authService.getSession();
          
          if (session?.user) {
            const profile = await authService.getCurrentProfile();
            
            if (profile) {
              const user: User = {
                id: profile.id,
                email: profile.email,
                name: profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`.trim()
                  : profile.pharmacy_name || profile.email,
                role: 'member',
                subscription: {
                  id: 'default',
                  planName: 'Premium',
                  status: profile.subscription_status === 'Active' ? 'active' : 'inactive',
                  startDate: new Date(profile.created_at),
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  programs: ['mtm-future-today', 'timemymeds', 'test-treat'],
                },
                createdAt: new Date(profile.created_at),
              };

              set({ user, isAuthenticated: true, isLoading: false });
              return;
            }
          }
          
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (updates) => {
        const currentState = get();
        if (!currentState.isAuthenticated || !currentState.user) {
          return false;
        }

        set({ isLoading: true });
        
        try {
          await authService.updateProfile({
            first_name: updates.firstName,
            last_name: updates.lastName,
            pharmacy_name: updates.pharmacyName,
          });

          // Update local user state
          const updatedUser: User = {
            ...currentState.user,
            name: updates.firstName && updates.lastName 
              ? `${updates.firstName} ${updates.lastName}`.trim()
              : updates.pharmacyName || currentState.user.name,
          };

          set({ user: updatedUser, isLoading: false });
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * Clear all user-related context (profiles, bookmarks, etc.)
       * This is called on logout to ensure clean state
       */
      clearUserContext: () => {
        try {
          // Dynamic import to avoid circular dependency
          import('./profilesStore').then(({ useProfilesStore }) => {
            useProfilesStore.getState().reset();
          });
        } catch (error) {
          console.warn('Failed to clear profiles context:', error);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
