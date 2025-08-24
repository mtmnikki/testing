/**
 * My Account page
 * - Updated to use AppShell with a fixed MemberSidebar (static frame on gated pages).
 * - Preserves previous content and breadcrumbs inside the AppShell content area.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User as UserIcon, Settings, CreditCard, Users } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProfilesStore } from '../stores/profilesStore';
import SafeText from '../components/common/SafeText';
import Breadcrumbs from '../components/common/Breadcrumbs';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import ProfilesTable from '../components/profiles/ProfilesTable';
import AddProfileModal from '../components/profiles/AddProfileModal';

export default function Account() {
  const { user } = useAuthStore();
  const { profiles, currentProfileId } = useProfilesStore();
  const [showAddProfile, setShowAddProfile] = React.useState(false);

  /** Header renderer for AppShell */
  const header = (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-4">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Account' },
        ]}
        className="mb-2"
      />
      <div className="mb-1 text-2xl font-bold">My Account</div>
      <div className="text-sm text-gray-600">Manage your profile and billing</div>
    </div>
  );

  const currentProfile = profiles.find(p => p.id === currentProfileId);

  return (
    <AppShell sidebar={<MemberSidebar />} header={header}>
      <div className="space-y-6">
        {/* Current Profile Info */}
        {currentProfile && (
          <Card className="bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Current Active Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {currentProfile.firstName} {currentProfile.lastName}
                  </p>
                  <p className="text-blue-700 font-medium">{currentProfile.role}</p>
                  {currentProfile.email && (
                    <p className="text-sm text-gray-600">{currentProfile.email}</p>
                  )}
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profiles Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Profiles
              </div>
              <Button onClick={() => setShowAddProfile(true)} size="sm">
                Add Profile
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage user profiles for your pharmacy account. All roles have equal access to ClinicalRxQ resources.
              </p>
              <ProfilesTable />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={String((user?.email ?? '') as any)}
                    className="w-full rounded-md border p-2"
                    readOnly
                  />
                </div>
                <p className="text-sm text-gray-600">
                  This is your account login email. Contact support to change it.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing &amp; Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 font-semibold">Active Subscriptions</h3>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Clinical Pharmacy Fundamentals</p>
                        <p className="text-sm text-gray-600">Next billing: January 15, 2024</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-semibold">Payment Method</h3>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">•••• •••• •••• 1234</p>
                        <p className="text-sm text-gray-600">Expires 12/26</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddProfileModal
        open={showAddProfile}
        onOpenChange={setShowAddProfile}
      />
    </AppShell>
  );
}
