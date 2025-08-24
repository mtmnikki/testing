/**
 * profilesStore
 * - Purpose: Manage pharmacy profiles per authenticated member account.
 * - Features:
 *   - CRUD: add, update, remove via Supabase.
 *   - Track the currently active profile (currentProfileId) in localStorage.
 *   - Loading states and error handling.
 * - Note: All roles have equal access in-app; profile selection is for personalization and record-keeping only.
 */

import { create } from 'zustand';
import { profileService } from '../services/profileService';
import type { PharmacyProfile, CreateProfileData } from '../types';

interface ProfilesState {
  // Data
  profiles: PharmacyProfile[];
  currentProfileId: string | null;
  loadedForUserId: string | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  ensureLoaded: (userId: string) => Promise<void>;
  refreshProfiles: (userId: string) => Promise<void>;
  setCurrentProfile: (profileId: string | null) => void;
  addProfile: (userId: string, data: CreateProfileData) => Promise<PharmacyProfile | null>;
  updateProfile: (userId: string, id: string, changes: Partial<CreateProfileData>) => Promise<boolean>;
  removeProfile: (userId: string, id: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

/**
 * localStorage helpers for currentProfileId only
 */
function getCurrentProfileKey(userId: string) {
  return `current_profile:${userId}`;
}

function getCurrentProfileFromStorage(userId: string): string | null {
  try {
    return localStorage.getItem(getCurrentProfileKey(userId));
  } catch {
    return null;
  }
}

function saveCurrentProfileToStorage(userId: string, profileId: string | null) {
  try {
    if (profileId) {
      localStorage.setItem(getCurrentProfileKey(userId), profileId);
    } else {
      localStorage.removeItem(getCurrentProfileKey(userId));
    }
  } catch {
    // ignore quota errors
  }
}

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  // Initial state
  profiles: [],
  currentProfileId: null,
  loadedForUserId: null,
  isLoading: false,
  isSaving: false,
  error: null,

  /**
   * Ensure profiles are loaded for the given user id (idempotent).
   */
  ensureLoaded: async (userId) => {
    const state = get();
    if (state.loadedForUserId === userId && !state.isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const { data: profiles, error } = await profileService.getProfilesForAccount(userId);
      
      if (error) {
        set({ error, isLoading: false });
        return;
      }

      // Get saved current profile from localStorage
      const savedCurrentId = getCurrentProfileFromStorage(userId);
      const validCurrentId = profiles?.find(p => p.id === savedCurrentId)?.id || null;

      set({
        profiles: profiles || [],
        currentProfileId: validCurrentId,
        loadedForUserId: userId,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load profiles',
        isLoading: false,
      });
    }
  },

  /**
   * Refresh profiles from server
   */
  refreshProfiles: async (userId) => {
    set({ loadedForUserId: null }); // Force reload
    await get().ensureLoaded(userId);
  },

  /**
   * Set the current active profile id (persisted in localStorage only).
   */
  setCurrentProfile: (profileId) => {
    const { loadedForUserId } = get();
    set({ currentProfileId: profileId });
    if (loadedForUserId) {
      saveCurrentProfileToStorage(loadedForUserId, profileId);
    }
  },

  /**
   * Add a new profile for the current user.
   */
  addProfile: async (userId, data) => {
    set({ isSaving: true, error: null });

    try {
      const { data: newProfile, error } = await profileService.createProfile(userId, data);
      
      if (error || !newProfile) {
        set({ error: error || 'Failed to create profile', isSaving: false });
        return null;
      }

      const { profiles, currentProfileId } = get();
      const updatedProfiles = [...profiles, newProfile];
      const newCurrentId = currentProfileId || newProfile.id;

      set({
        profiles: updatedProfiles,
        currentProfileId: newCurrentId,
        isSaving: false,
        error: null,
      });

      // Save current profile selection
      saveCurrentProfileToStorage(userId, newCurrentId);
      
      return newProfile;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create profile',
        isSaving: false,
      });
      return null;
    }
  },

  /**
   * Update an existing profile by id.
   */
  updateProfile: async (userId, id, changes) => {
    set({ isSaving: true, error: null });

    try {
      const { data: updatedProfile, error } = await profileService.updateProfile(id, changes);
      
      if (error || !updatedProfile) {
        set({ error: error || 'Failed to update profile', isSaving: false });
        return false;
      }

      const { profiles } = get();
      const updatedProfiles = profiles.map(p => p.id === id ? updatedProfile : p);

      set({
        profiles: updatedProfiles,
        isSaving: false,
        error: null,
      });

      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update profile',
        isSaving: false,
      });
      return false;
    }
  },

  /**
   * Remove a profile by id.
   */
  removeProfile: async (userId, id) => {
    set({ isSaving: true, error: null });

    try {
      const { error } = await profileService.deleteProfile(id);
      
      if (error) {
        set({ error, isSaving: false });
        return false;
      }

      const { profiles, currentProfileId } = get();
      const updatedProfiles = profiles.filter(p => p.id !== id);
      const newCurrentId = currentProfileId === id ? (updatedProfiles[0]?.id || null) : currentProfileId;

      set({
        profiles: updatedProfiles,
        currentProfileId: newCurrentId,
        isSaving: false,
        error: null,
      });

      // Update localStorage
      saveCurrentProfileToStorage(userId, newCurrentId);

      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to remove profile',
        isSaving: false,
      });
      return false;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store (e.g., on logout).
   */
  reset: () => {
    set({
      profiles: [],
      currentProfileId: null,
      loadedForUserId: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },
}));
