/**
 * ProfileGate
 * - Purpose: Ensure user has selected a profile before accessing protected content
 * - Shows profile selection screen if no profiles exist or none selected
 * - Allows switching between existing profiles
 * - Integrates with AddProfileModal for creating first profile
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useProfilesStore } from '../../stores/profilesStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import AddProfileModal from './AddProfileModal';

interface ProfileGateProps {
  children: React.ReactNode;
}

export default function ProfileGate({ children }: ProfileGateProps) {
  const { user } = useAuthStore();
  const { 
    profiles, 
    currentProfileId, 
    setCurrentProfile, 
    ensureLoaded, 
    isLoading, 
    error 
  } = useProfilesStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      ensureLoaded(user.id);
    }
  }, [user?.id, ensureLoaded]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-600">Loading your profiles...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Profiles</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => user?.id && ensureLoaded(user.id)}
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No profiles exist - show create first profile screen
  if (profiles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to ClinicalRxQ</CardTitle>
            <CardDescription>
              Let's set up your first user profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="font-medium text-blue-900">Profile Types Available:</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Pharmacist-PIC</li>
                <li>• Pharmacist-Staff</li>
                <li>• Pharmacy Technician</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700">
                All roles have equal access to ClinicalRxQ resources.
              </p>
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="w-full"
              size="lg"
            >
              Create Your Profile
            </Button>
          </CardContent>
        </Card>

        <AddProfileModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onCreated={(id) => {
            setCurrentProfile(id);
            setShowAddModal(false);
          }}
        />
      </div>
    );
  }

  // Has profiles but none selected - show profile selection
  if (!currentProfileId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Select Your Profile</CardTitle>
            <CardDescription>
              Choose which profile you'd like to use for this session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50"
              >
                <div>
                  <h4 className="font-medium">
                    {profile.firstName} {profile.lastName}
                  </h4>
                  <p className="text-sm text-slate-600">{profile.role}</p>
                  {profile.email && (
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  )}
                </div>
                <Button
                  onClick={() => setCurrentProfile(profile.id)}
                  size="sm"
                >
                  Select
                </Button>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(true)}
                className="w-full"
              >
                Add New Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <AddProfileModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onCreated={(id) => {
            setCurrentProfile(id);
            setShowAddModal(false);
          }}
        />
      </div>
    );
  }

  // Profile selected - show protected content
  return <>{children}</>;
}