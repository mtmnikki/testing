/**
 * AddProfileModal
 * - Purpose: Create or edit a Pharmacy Profile via a modal form.
 * - Required fields: Role, First Name, Last Name.
 * - Optional fields include phone, email, DOB (MM/DD/YYYY), License Number, and NABP e-Profile ID.
 * - Validation: Only enforce required fields; optional fields validated lightly if provided.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../stores/authStore';
import { useProfilesStore } from '../../stores/profilesStore';
import type { PharmacyProfile, ProfileRole } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/**
 * Roles displayed in the dropdown (label = value).
 */
const ROLE_OPTIONS: ProfileRole[] = [
  'Pharmacist-PIC',
  'Pharmacist-Staff',
  'Pharmacy Technician',
];

/**
 * Zod schema with only the required fields strictly validated.
 * Optional fields accept empty string; if present, they must match a reasonable pattern.
 */
const schema = z.object({
  role: z.enum(['Pharmacist-PIC', 'Pharmacist-Staff', 'Pharmacy Technician'], {
    required_error: 'Role is required',
  }),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+()\-\s]{7,}$/.test(v), { message: 'Invalid phone number' }),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), { message: 'Invalid email' }),
  dobMonth: z
    .string()
    .optional()
    .refine((v) => !v || /^(0[1-9]|1[0-2])$/.test(v), { message: 'Use two digits (01-12)' }),
  dobDay: z
    .string()
    .optional()
    .refine((v) => !v || /^(0[1-9]|[12][0-9]|3[01])$/.test(v), { message: 'Use two digits (01-31)' }),
  dobYear: z
    .string()
    .optional()
    .refine((v) => !v || /^(19|20)\d{2}$/.test(v), { message: 'Use four digits (YYYY)' }),
  licenseNumber: z.string().optional(),
  nabpEProfileId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddProfileModalProps {
  /** Control whether the dialog is open */
  open: boolean;
  /** Handler to update the open state */
  onOpenChange: (open: boolean) => void;
  /** When provided, the modal operates in edit mode */
  profileId?: string;
  /** Default values for editing (or prefill) */
  defaultValues?: Partial<PharmacyProfile>;
  /** Callback after profile creation (used by ProfileGate) */
  onCreated?: (id: string) => void;
}

/**
 * AddProfileModal component
 */
export default function AddProfileModal({
  open,
  onOpenChange,
  profileId,
  defaultValues,
  onCreated,
}: AddProfileModalProps) {
  const { user } = useAuthStore();
  const { ensureLoaded, addProfile, updateProfile, isSaving, error, clearError } = useProfilesStore();

  useEffect(() => {
    if (user?.id) ensureLoaded(user.id);
  }, [user?.id, ensureLoaded]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: (defaultValues?.role as ProfileRole) || undefined,
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      dobMonth: defaultValues?.dobMonth || '',
      dobDay: defaultValues?.dobDay || '',
      dobYear: defaultValues?.dobYear || '',
      licenseNumber: defaultValues?.licenseNumber || '',
      nabpEProfileId: defaultValues?.nabpEProfileId || '',
    },
  });

  const watchedRole = watch('role');

  useEffect(() => {
    // When switching open/edit target, refresh the form defaults
    if (open) {
      clearError(); // Clear any previous errors
      reset({
        role: (defaultValues?.role as ProfileRole) || undefined,
        firstName: defaultValues?.firstName || '',
        lastName: defaultValues?.lastName || '',
        phone: defaultValues?.phone || '',
        email: defaultValues?.email || '',
        dobMonth: defaultValues?.dobMonth || '',
        dobDay: defaultValues?.dobDay || '',
        dobYear: defaultValues?.dobYear || '',
        licenseNumber: defaultValues?.licenseNumber || '',
        nabpEProfileId: defaultValues?.nabpEProfileId || '',
      });
    }
  }, [open, defaultValues, reset, clearError]);

  async function onSubmit(values: FormValues) {
    if (!user?.id) return;

    try {
      if (profileId) {
        // Edit existing profile
        const success = await updateProfile(user.id, profileId, values);
        if (!success) return; // Error handled by store
      } else {
        // Create new profile
        const created = await addProfile(user.id, {
          role: values.role,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || undefined,
          email: values.email || undefined,
          dobMonth: values.dobMonth || undefined,
          dobDay: values.dobDay || undefined,
          dobYear: values.dobYear || undefined,
          licenseNumber: values.licenseNumber || undefined,
          nabpEProfileId: values.nabpEProfileId || undefined,
        });
        
        if (created) {
          onCreated?.(created.id);
        } else {
          return; // Error handled by store
        }
      }

      onOpenChange(false);
    } catch (error) {
      // Additional error handling if needed
      console.error('Profile operation failed:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{profileId ? 'Edit Profile' : 'Add Profile'}</DialogTitle>
          <DialogDescription>
            Only Role, First Name, and Last Name are required. You can add other details now or later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-600">*</span>
            </Label>
            <Select 
              value={watchedRole || ''} 
              onValueChange={(value) => setValue('role', value as ProfileRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-600">*</span>
              </Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-600">*</span>
              </Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input id="email" type="email" placeholder="user@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Input
                  placeholder="MM"
                  maxLength={2}
                  {...register('dobMonth')}
                />
                <p className="text-xs text-gray-500">Month</p>
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="DD"
                  maxLength={2}
                  {...register('dobDay')}
                />
                <p className="text-xs text-gray-500">Day</p>
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="YYYY"
                  maxLength={4}
                  {...register('dobYear')}
                />
                <p className="text-xs text-gray-500">Year</p>
              </div>
            </div>
            {(errors.dobMonth || errors.dobDay || errors.dobYear) && (
              <p className="text-sm text-red-600">
                {errors.dobMonth?.message || errors.dobDay?.message || errors.dobYear?.message}
              </p>
            )}
          </div>

          {/* License + NABP */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" placeholder="RPH12345" {...register('licenseNumber')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nabpEProfileId">NABP e-Profile ID</Label>
              <Input id="nabpEProfileId" placeholder="12345678" {...register('nabpEProfileId')} />
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isSaving}
            >
              {(isSubmitting || isSaving) && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {profileId ? 'Save Changes' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
