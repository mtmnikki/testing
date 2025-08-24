/**
 * Supabase data service via REST (no SDK)
 * - Provides typed helpers for Programs, Program Detail, Resource Library, etc.
 * - Keeps exports compatible with existing pages (programService, resourceLibraryService, authService stubs).
 *
 * IMPORTANT:
 * - Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be set, OR a localStorage override.
 * - RLS must allow read access with the anon key for relevant tables.
 */

import { getSupabaseAnonKey, getSupabaseUrl } from '../config/supabaseConfig';

/** Program entity */
export interface Program {
  id: string;
  slug: string;
  name: string;
  description?: string;
  overview?: string;
  experience_level?: string;
  created_at: string;
  updated_at: string;
}

/** Training module entity */
export interface TrainingModule {
  id: string;
  program_id: string;
  name: string;
  length?: string;
  link?: string;
  file_path?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Protocol manual entity */
export interface ProtocolManual {
  id: string;
  program_id: string;
  name: string;
  file_path?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

/** Documentation form entity */
export interface DocumentationForm {
  id: string;
  program_id: string;
  name: string;
  category?: string;
  file_path?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

/** Additional resource entity */
export interface AdditionalResource {
  id: string;
  program_id: string;
  name: string;
  file_path?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

/** Resource library entities */
export interface PatientHandout {
  id: string;
  name: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}
export interface ClinicalGuideline {
  id: string;
  name: string;
  file_path?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}
export interface MedicalBillingResource {
  id: string;
  name: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

/** Profile/auth-related entities (stub for now) */
export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  pharmacy_name?: string;
  subscription_status?: string;
  created_at: string;
  updated_at: string;
}
export interface Bookmark {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}
export interface RecentActivity {
  id: string;
  user_id: string;
  resource_name: string;
  resource_type: string;
  accessed_at: string;
}

/**
 * Internal fetch helper with auth headers for Supabase REST.
 * - Uses centralized config helpers with env/localStorage/fallback support.
 */
async function sbFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const base = getSupabaseUrl();
  const anon = getSupabaseAnonKey();

  if (!base) {
    throw new Error('Supabase URL is not configured. Set VITE_SUPABASE_URL or localStorage SUPABASE_URL.');
  }

  const url = `${base}/rest/v1${endpoint}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${anon}`,
    apikey: anon,
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  };

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Supabase error: ${res.status}`);
  }
  // Some Supabase endpoints return no body (204)
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

/**
 * Storage helper to construct public URLs (for public buckets only).
 */
export function getStorageUrl(bucket: string, path: string): string {
  const base = getSupabaseUrl();
  if (!base) return '';
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Program services
 */
export const programService = {
  /** Get all programs ordered by name */
  async getAll(): Promise<Program[]> {
    return sbFetch<Program[]>('/programs?select=*&order=name.asc');
  },

  /** Get program by slug */
  async getBySlug(slug: string): Promise<Program | null> {
    const rows = await sbFetch<Program[]>(`/programs?slug=eq.${encodeURIComponent(slug)}&limit=1`);
    return rows?.[0] || null;
  },

  /** Get program with all related rows */
  async getProgramDetail(slug: string): Promise<{
    program: Program;
    modules: TrainingModule[];
    manuals: ProtocolManual[];
    forms: DocumentationForm[];
    resources: AdditionalResource[];
  } | null> {
    const program = await this.getBySlug(slug);
    if (!program) return null;

    const [modules, manuals, forms, resources] = await Promise.all([
      sbFetch<TrainingModule[]>(
        `/training_modules?program_id=eq.${encodeURIComponent(program.id)}&order=sort_order.asc`
      ),
      sbFetch<ProtocolManual[]>(
        `/protocol_manuals?program_id=eq.${encodeURIComponent(program.id)}`
      ),
      sbFetch<DocumentationForm[]>(
        `/documentation_forms?program_id=eq.${encodeURIComponent(program.id)}`
      ),
      sbFetch<AdditionalResource[]>(
        `/additional_resources?program_id=eq.${encodeURIComponent(program.id)}`
      ),
    ]);

    return { program, modules, manuals, forms, resources };
  },
};

/**
 * Resource library services
 */
export const resourceLibraryService = {
  /** Get patient handouts */
  async getPatientHandouts(): Promise<PatientHandout[]> {
    return sbFetch<PatientHandout[]>('/patient_handouts?select=*&order=name.asc');
  },

  /** Get clinical guidelines */
  async getClinicalGuidelines(): Promise<ClinicalGuideline[]> {
    return sbFetch<ClinicalGuideline[]>('/clinical_guidelines?select=*&order=name.asc');
  },

  /** Get medical billing resources */
  async getMedicalBillingResources(): Promise<MedicalBillingResource[]> {
    return sbFetch<MedicalBillingResource[]>('/medical_billing_resources?select=*&order=name.asc');
  },

  /** Merge all resources with category label (optional filter) */
  async getAllResources(category?: string): Promise<
    Array<{
      id: string;
      name: string;
      file_path?: string;
      category: 'handouts' | 'clinical' | 'billing';
    }>
  > {
    const [handouts, guidelines, billing] = await Promise.all([
      !category || category === 'handouts' ? this.getPatientHandouts() : [],
      !category || category === 'clinical' ? this.getClinicalGuidelines() : [],
      !category || category === 'billing' ? this.getMedicalBillingResources() : [],
    ]);

    return [
      ...handouts.map((h) => ({ ...h, category: 'handouts' as const })),
      ...guidelines.map((g) => ({ ...g, category: 'clinical' as const })),
      ...billing.map((b) => ({ ...b, category: 'billing' as const })),
    ];
  },
};

/**
 * Real Supabase authentication service using GoTrue
 */
import { supabaseAuth } from '../lib/supabase';

export const authService = {
  /** Get current user profile from Supabase auth and profiles table */
  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const user = await supabaseAuth.getUser();
      if (!user) return null;

      // Try to get profile from profiles table
      try {
        const profiles = await sbFetch<Profile[]>(`/profiles?id=eq.${user.id}&limit=1`);
        if (profiles.length > 0) {
          return profiles[0];
        }
      } catch (error) {
        // If profiles table doesn't exist or user not in profiles, create from auth user
        console.warn('Could not fetch from profiles table, using auth user data:', error);
      }

      // Fallback: create profile from auth user data
      return {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        pharmacy_name: user.user_metadata?.pharmacy_name || '',
        subscription_status: user.user_metadata?.subscription_status || 'Active',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting current profile:', error);
      return null;
    }
  },

  /** Update user profile */
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const user = await supabaseAuth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Update user metadata in auth
    const { first_name, last_name, pharmacy_name, ...profileUpdates } = updates;
    const metadata: Record<string, unknown> = {};
    if (first_name !== undefined) metadata.first_name = first_name;
    if (last_name !== undefined) metadata.last_name = last_name;
    if (pharmacy_name !== undefined) metadata.pharmacy_name = pharmacy_name;

    if (Object.keys(metadata).length > 0) {
      await supabaseAuth.updateUser({ data: metadata });
    }

    // Try to update profiles table if it exists
    if (Object.keys(profileUpdates).length > 0) {
      try {
        await sbFetch(`/profiles?id=eq.${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify(profileUpdates),
        });
      } catch (error) {
        console.warn('Could not update profiles table:', error);
      }
    }

    // Return updated profile
    const current = await this.getCurrentProfile();
    return current!;
  },

  /** Sign up new user */
  async signUp(email: string, password: string, metadata: Record<string, unknown> = {}) {
    return supabaseAuth.signUp(email, password, metadata);
  },

  /** Sign in user */
  async signIn(email: string, password: string) {
    return supabaseAuth.signIn(email, password);
  },

  /** Sign out current user */
  async signOut() {
    return supabaseAuth.signOut();
  },

  /** Get current session */
  async getSession() {
    return supabaseAuth.getSession();
  },

  /** Send password reset email */
  async resetPassword(email: string) {
    return supabaseAuth.resetPasswordForEmail(email);
  },

  /** Update password */
  async updatePassword(accessToken: string, newPassword: string) {
    return supabaseAuth.updatePassword(accessToken, newPassword);
  },
};

/** Bookmark services (stubs) */
export const bookmarkService = {
  async getUserBookmarks(): Promise<Bookmark[]> {
    return [];
  },
  async addBookmark(resourceType: string, resourceId: string) {
    return {
      id: crypto.randomUUID(),
      user_id: 'mock-user',
      resource_type: resourceType,
      resource_id: resourceId,
      created_at: new Date().toISOString(),
    } as Bookmark;
  },
  async removeBookmark(_resourceType: string, _resourceId: string) {
    // no-op
  },
};

/** Activity services (stubs) */
export const activityService = {
  async logActivity(_resourceName: string, _resourceType: string) {
    // no-op
  },
  async getRecentActivity(_limit = 10): Promise<RecentActivity[]> {
    return [];
  },
};
