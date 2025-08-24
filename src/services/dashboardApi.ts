/**
 * Dashboard API service using Supabase
 * Provides real data from Supabase for the Dashboard
 */

import { programService, resourceLibraryService, bookmarkService, activityService } from './supabase';
import { buildPublicUrl } from './supabaseStorage';
import type { 
  Announcement, 
  ClinicalProgram, 
  QuickAccessItem, 
  RecentActivity, 
  ResourceItem 
} from '../types/dashboard';

/**
 * Map program slugs to display names and icons
 */
const PROGRAM_METADATA: Record<string, { name: string; icon: string; description: string }> = {
  'mtm-future-today': {
    name: 'MTM The Future Today',
    icon: 'ClipboardCheck',
    description: 'Team-based Medication Therapy Management with proven protocols and technician workflows.'
  },
  'timemymeds': {
    name: 'TimeMyMeds',
    icon: 'CalendarCheck',
    description: 'Appointment-based care via synchronization workflows that unlock clinical service delivery.'
  },
  'test-treat': {
    name: 'Test & Treat Services',
    icon: 'Stethoscope',
    description: 'CLIA-waived testing and treatment plans for Flu, Strep, and COVID-19.'
  },
  'hba1c': {
    name: 'HbA1c Testing',
    icon: 'Activity',
    description: 'POC A1c testing integrated with diabetes care and MTM workflows.'
  },
  'oral-contraceptives': {
    name: 'Oral Contraceptives',
    icon: 'TestTubes',
    description: 'From patient intake to billing—simplified, step-by-step service workflows.'
  }
};

/**
 * Dashboard API methods
 */
export const Api = {
  /**
   * Get Clinical Programs from Supabase
   */
  async getPrograms(): Promise<ClinicalProgram[]> {
    try {
      const programs = await programService.getAll();
      
      return programs.map(program => {
        const metadata = PROGRAM_METADATA[program.slug] || {
          name: program.name,
          icon: 'FileText',
          description: program.description || ''
        };
        
        return {
          slug: program.slug,
          name: metadata.name,
          description: metadata.description,
          icon: metadata.icon,
          lastUpdatedISO: program.updated_at || program.created_at
        };
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  },

  /**
   * Get Quick Access items based on popular resources
   */
  async getQuickAccess(): Promise<QuickAccessItem[]> {
    try {
      // For now, return a curated list of quick access items
      // In the future, this could be based on user behavior or admin configuration
      return [
        {
          id: 'qa-1',
          title: 'CMR Pharmacist Protocol',
          subtitle: 'MTM Protocols',
          cta: 'Download',
          icon: 'FileText',
          url: buildPublicUrl('programs/mtm-future-today/protocols/pharmacist-protocol.pdf'),
          external: true,
        },
        {
          id: 'qa-2',
          title: 'Training Videos',
          subtitle: 'Getting Started',
          cta: 'Watch',
          icon: 'PlayCircle',
          url: '/resources?category=training',
          external: false,
        },
        {
          id: 'qa-3',
          title: 'Patient Handouts',
          subtitle: 'Resources',
          cta: 'Download',
          icon: 'FileText',
          url: '/resources?category=handouts',
          external: false,
        },
        {
          id: 'qa-4',
          title: 'Billing Resources',
          subtitle: 'Documentation',
          cta: 'Download',
          icon: 'FileSpreadsheet',
          url: '/resources?category=billing',
          external: false,
        },
      ];
    } catch (error) {
      console.error('Error fetching quick access:', error);
      return [];
    }
  },

  /**
   * Get bookmarked resources for current user
   */
  async getBookmarkedResources(): Promise<ResourceItem[]> {
    try {
      const bookmarks = await bookmarkService.getUserBookmarks();
      
      return bookmarks.map(bookmark => ({
        id: bookmark.id,
        name: bookmark.resource_id, // This should be enhanced to fetch actual resource name
        program: bookmark.resource_type,
        url: '#' // This should be enhanced to build proper URLs
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  },

  /**
   * Get recent activity list
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const activities = await activityService.getRecentActivity(5);
      
      return activities.map(activity => ({
        id: activity.id,
        name: activity.resource_name,
        program: activity.resource_type,
        accessedAtISO: activity.accessed_at,
        url: '#' // This should be enhanced to build proper URLs
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  /**
   * Get announcements
   * TODO: This should be fetched from a Supabase announcements table
   */
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      // For now, return empty array until announcements table is created
      return [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },
};