/**
 * ProfileGate
 * - Purpose: After authentication, ensure a profile is selected.
 * - Behavior:
 *   - Loads profiles for the current user (localStorage-backed).
 *   - If no currentProfile is set:
 *     - If profiles exist: open a modal to choose one.
 *     - If none exist: prompt to create a new profile (opens Add Profile modal).
 * - Note: This gate does not change routes; it overlays as a modal and blocks interaction until set.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useProfilesStore } from '../../stores/profilesStore';
import type { PharmacyProfile } from '../../types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import AddProfileModal from '../profiles/AddProfileModal';

/**
 * Render a compact profile selection list.
 */
function ProfileList({
  profiles,
  selectedId,
  onSelect,
}: {
  profiles: PharmacyProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-3 divide-y rounded-md border bg-white">
      {profiles.map((p) => {
        const active = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            className={[
              'flex w-full items-center justify-between px-3 py-2 text-left',
              active ? 'bg-blue-50' : 'hover:bg-slate-50',
            ].join(' ')}
            onClick={() => onSelect(p.id)}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">
                {p.firstName} {p.lastName}
              </div>
              <div className="text-xs text-slate-500">{p.role}</div>
            </div>
            <div
              className={[
                'h-2.5 w-2.5 rounded-full',
                active ? 'bg-blue-600' : 'bg-slate-300',
              ].join(' ')}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * ProfileGate component
 */
export default function ProfileGate() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    ensureLoaded,
    profiles,
    currentProfileId,
    setCurrentProfile,
    reset,
  } = useProfilesStore();

  const [selectOpen, setSelectOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);

  // Sync load/reset with auth state
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      ensureLoaded(user.id);
    } else {
      // reset profiles when not authenticated
      reset();
    }
  }, [isAuthenticated, user?.id, ensureLoaded, reset]);

  // Decide when to show the selection overlay
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setSelectOpen(false);
      setAddOpen(false);
      return;
    }

    // Already selected => nothing to prompt
    if (currentProfileId) {
      setSelectOpen(false);
      setAddOpen(false);
      return;
    }

    // No selection yet
    if (profiles.length === 0) {
      // No profiles → ask to create
      setAddOpen(true);
      setSelectOpen(false);
    } else {
      // Profiles exist → ask to choose
      setPickedId(profiles[0].id);
      setSelectOpen(true);
      setAddOpen(false);
    }
  }, [isAuthenticated, user?.id, currentProfileId, profiles]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === pickedId) || null,
    [profiles, pickedId]
  );

  // Confirm selection
  function handleConfirm() {
    if (pickedId) setCurrentProfile(pickedId);
    setSelectOpen(false);
  }

  return (
    <>
      {/* Selection dialog (blocking) */}
      <Dialog open={selectOpen} onOpenChange={(open) => setSelectOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a profile</DialogTitle>
            <DialogDescription>
              Choose who is currently using the account. You can switch profiles later in Account Settings.
            </DialogDescription>
          </DialogHeader>

          <ProfileList
            profiles={profiles}
            selectedId={pickedId}
            onSelect={setPickedId}
          />

          <div className="mt-4 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              Add Profile
            </Button>
            <Button onClick={handleConfirm} disabled={!pickedId}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Profile modal (also used when there are no profiles yet) */}
      <AddProfileModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(createdId) => {
          // If we just created the first profile, close add and (auto)select
          if (!currentProfileId) {
            setPickedId(createdId);
            setSelectOpen(true);
          }
        }}
      />
    </>
  );
}
