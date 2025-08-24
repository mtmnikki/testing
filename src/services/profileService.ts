/**
 * Profile Service - Supabase Integration
 * Handles all CRUD operations for member_profiles table
 * Maps between frontend PharmacyProfile interface and database schema
 */

import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';
import { authService } from './supabase';
import type { PharmacyProfile, CreateProfileData, ProfileRole } from '../types';

interface DatabaseProfile {
  id: string;
  member_account_id: string;
  role_type: ProfileRole;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_email?: string;
  dob_month?: string;
  dob_day?: string;
  dob_year?: string;
  license_number?: string;
  nabp_eprofile_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Internal: PostgREST API wrapper with proper JWT authentication
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const base = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  
  if (!base || !anon) {
    return { 
      data: null, 
      error: 'Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' 
    };
  }

  // Get the current user's JWT token for RLS authentication
  const session = await authService.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    return {
      data: null,
      error: 'User not authenticated. Please log in again.'
    };
  }

  const url = `${base}/rest/v1${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'apikey': anon,
        'Authorization': `Bearer ${accessToken}`, // Use JWT token instead of anon key
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: `API Error ${response.status}: ${errorText}` };
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Map database profile to frontend interface
 */
function mapFromDatabase(dbProfile: DatabaseProfile): PharmacyProfile {
  return {
    id: dbProfile.id,
    member_account_id: dbProfile.member_account_id,
    role: dbProfile.role_type,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    phone: dbProfile.phone_number || undefined,
    email: dbProfile.user_email || undefined,
    dobMonth: dbProfile.dob_month || undefined,
    dobDay: dbProfile.dob_day || undefined,
    dobYear: dbProfile.dob_year || undefined,
    licenseNumber: dbProfile.license_number || undefined,
    nabpEProfileId: dbProfile.nabp_eprofile_id || undefined,
    is_active: dbProfile.is_active,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
}

/**
 * Map frontend data to database format
 */
function mapToDatabase(
  memberAccountId: string, 
  data: CreateProfileData
): Omit<DatabaseProfile, 'id' | 'created_at' | 'updated_at' | 'is_active'> {
  return {
    member_account_id: memberAccountId,
    role_type: data.role,
    first_name: data.firstName,
    last_name: data.lastName,
    phone_number: data.phone || undefined,
    user_email: data.email || undefined,
    dob_month: data.dobMonth || undefined,
    dob_day: data.dobDay || undefined,
    dob_year: data.dobYear || undefined,
    license_number: data.licenseNumber || undefined,
    nabp_eprofile_id: data.nabpEProfileId || undefined,
  };
}

export const profileService = {
  /**
   * Get all profiles for a member account
   */
  async getProfilesForAccount(memberAccountId: string): Promise<ApiResponse<PharmacyProfile[]>> {
    const endpoint = `/member_profiles?member_account_id=eq.${memberAccountId}&is_active=eq.true&order=created_at.asc`;
    const response = await apiCall<DatabaseProfile[]>(endpoint);
    
    if (response.error) {
      return { data: null, error: response.error };
    }

    const profiles = (response.data || []).map(mapFromDatabase);
    return { data: profiles, error: null };
  },

  /**
   * Create a new profile
   */
  async createProfile(
    memberAccountId: string, 
    data: CreateProfileData
  ): Promise<ApiResponse<PharmacyProfile>> {
    const dbData = mapToDatabase(memberAccountId, data);
    
    const response = await apiCall<DatabaseProfile[]>('/member_profiles', {
      method: 'POST',
      body: JSON.stringify(dbData),
    });

    if (response.error) {
      return { data: null, error: response.error };
    }

    const created = response.data?.[0];
    if (!created) {
      return { data: null, error: 'Profile creation failed - no data returned' };
    }

    return { data: mapFromDatabase(created), error: null };
  },

  /**
   * Update an existing profile
   */
  async updateProfile(
    profileId: string, 
    updates: Partial<CreateProfileData>
  ): Promise<ApiResponse<PharmacyProfile>> {
    // Convert updates to database format
    const dbUpdates: Record<string, any> = {};
    
    if (updates.role !== undefined) dbUpdates.role_type = updates.role;
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.phone !== undefined) dbUpdates.phone_number = updates.phone || null;
    if (updates.email !== undefined) dbUpdates.user_email = updates.email || null;
    if (updates.dobMonth !== undefined) dbUpdates.dob_month = updates.dobMonth || null;
    if (updates.dobDay !== undefined) dbUpdates.dob_day = updates.dobDay || null;
    if (updates.dobYear !== undefined) dbUpdates.dob_year = updates.dobYear || null;
    if (updates.licenseNumber !== undefined) dbUpdates.license_number = updates.licenseNumber || null;
    if (updates.nabpEProfileId !== undefined) dbUpdates.nabp_eprofile_id = updates.nabpEProfileId || null;

    const response = await apiCall<DatabaseProfile[]>(`/member_profiles?id=eq.${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify(dbUpdates),
    });

    if (response.error) {
      return { data: null, error: response.error };
    }

    const updated = response.data?.[0];
    if (!updated) {
      return { data: null, error: 'Profile update failed - no data returned' };
    }

    return { data: mapFromDatabase(updated), error: null };
  },

  /**
   * Delete a profile (soft delete by setting is_active = false)
   */
  async deleteProfile(profileId: string): Promise<ApiResponse<null>> {
    const response = await apiCall<DatabaseProfile[]>(`/member_profiles?id=eq.${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    });

    if (response.error) {
      return { data: null, error: response.error };
    }

    return { data: null, error: null };
  },

  /**
   * Get a single profile by ID
   */
  async getProfile(profileId: string): Promise<ApiResponse<PharmacyProfile>> {
    const endpoint = `/member_profiles?id=eq.${profileId}&is_active=eq.true&limit=1`;
    const response = await apiCall<DatabaseProfile[]>(endpoint);
    
    if (response.error) {
      return { data: null, error: response.error };
    }

    const profile = response.data?.[0];
    if (!profile) {
      return { data: null, error: 'Profile not found' };
    }

    return { data: mapFromDatabase(profile), error: null };
  },
};