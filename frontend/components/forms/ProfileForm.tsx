'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/zustand';
import * as actions from '@/lib/actions';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { User, UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircleIcon, Trash2Icon, PencilIcon, XCircleIcon, AlertCircleIcon, TriangleAlertIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useUpload } from '@/hooks/useUpload';
import Image from 'next/image';
import { Skeleton, AvatarTextSkeleton } from '@/components/common/SkeletonLoaders';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '../ui/separator';

// Schemas for profile update from lib/actions.ts
const updateProfileSchema = actions.updateProfileSchema;
const changePasswordSchema = actions.changePasswordSchema;

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export function ProfileForm() {
  const router = useRouter();
  const { user: authUser, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { uploadFiles, isUploading } = useUpload(); // For avatar upload


  // Fetch current user profile data
  const { data: userProfile, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile } = useQuery<User, Error>({
    queryKey: ['userProfile', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) throw new Error('User not authenticated.');
      const response = await api.get('/users/me');
      return response.data.data;
    },
    enabled: !!authUser?.id,
    staleTime: 1000 * 60 * 5,
  });

  const updateProfileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: userProfile?.profile?.firstName || '',
      lastName: userProfile?.profile?.lastName || '',
      avatarUrl: userProfile?.profile?.avatarUrl || undefined,
      bio: userProfile?.profile?.bio || undefined,
      skills: userProfile?.profile?.skills || [],
      portfolioLinks: userProfile?.profile?.portfolioLinks || [],
    },
    // Using `values` in useForm to ensure form is always synced with fetched data
    // This makes it easy to reset to fetched data or update when data changes.
    values: {
      firstName: userProfile?.profile?.firstName || '',
      lastName: userProfile?.profile?.lastName || '',
      avatarUrl: userProfile?.profile?.avatarUrl || undefined,
      bio: userProfile?.profile?.bio || undefined,
      skills: userProfile?.profile?.skills || [],
      portfolioLinks: userProfile?.profile?.portfolioLinks || [],
    },
    // Reset form after data loads or changes, or you can use `useEffect`
    // to reset with fetched `userProfile`.
    resetOptions: {
      keepDirtyValues: true, // Keep user's changes until explicitly saved
      keepErrors: true,
    }
  });


  // This useEffect ensures the form is reset with default values ONCE when data is first loaded
  // or if the userProfile object itself changes (e.g., after a successful update that refetches)
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    if (userProfile && !isLoadingProfile && !isMounted.current) {
      updateProfileForm.reset({
        firstName: userProfile?.profile?.firstName || '',
        lastName: userProfile?.profile?.lastName || '',
        avatarUrl: userProfile?.profile?.avatarUrl || undefined,
        bio: userProfile?.profile?.bio || undefined,
        skills: userProfile?.profile?.skills || [],
        portfolioLinks: userProfile?.profile?.portfolioLinks || [],
      });
      isMounted.current = true;
    }
  }, [userProfile, isLoadingProfile, updateProfileForm]);


  const changePasswordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { mutate: submitProfileUpdate, isPending: isUpdatingProfile } = useMutation({
    mutationFn: (values: UpdateProfileInput) => {
      if (!authUser?.id) throw new Error('User not authenticated.');
      // Ensure avatarUrl is set to null if it's an empty string or undefined to clear it
      const dataToSend = { ...values, avatarUrl: values.avatarUrl === '' ? null : values.avatarUrl };
      return actions.updateProfileInfoAction(authUser.id, dataToSend);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        // Update Zustand store with the latest profile data if applicable
        if (response.data) {
            setUser({ ...authUser, profile: response.data.profile } as User); // Update profile part of user object
        }
        queryClient.invalidateQueries({ queryKey: ['userProfile', authUser?.id] });
      } else {
        toast.error(response.message || 'Failed to update profile.');
        response.errors?.forEach(err => toast.error(`${err.path}: ${err.message}`));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile.');
    },
  });

  const { mutate: submitPasswordChange, isPending: isChangingPassword } = useMutation({
    mutationFn: (values: ChangePasswordInput) => {
      if (!authUser?.id) throw new Error('User not authenticated.');
      return actions.changePasswordAction(authUser.id, values);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        changePasswordForm.reset();
      } else {
        toast.error(response.message || 'Failed to change password.');
        response.errors?.forEach(err => toast.error(`${err.path}: ${err.message}`));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password.');
    },
  });

  const onProfileSubmit = (values: UpdateProfileInput) => {
    submitProfileUpdate(values);
  };

  const onPasswordSubmit = (values: ChangePasswordInput) => {
    submitPasswordChange(values);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed for avatars.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Avatar image must be less than 2MB.');
        return;
      }

      try {
        const results = await uploadFiles([file], 'avatars');
        if (results.length > 0) {
          updateProfileForm.setValue('avatarUrl', results[0].url);
          toast.success('Avatar uploaded. Click "Save Changes" to apply.');
        }
      } catch (uploadError) {
        toast.error('Failed to upload avatar.');
        console.error('Avatar upload error:', uploadError);
      }
    }
  };

  const handleRemoveAvatar = () => {
    updateProfileForm.setValue('avatarUrl', null);
    toast.info('Avatar removed. Click "Save Changes" to apply.');
  }

  const handleAddSkill = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newSkill = event.currentTarget.value.trim();
      if (newSkill && !(updateProfileForm.getValues('skills') || []).includes(newSkill)) {
        updateProfileForm.setValue('skills', [...(updateProfileForm.getValues('skills') || []), newSkill], { shouldValidate: true });
        event.currentTarget.value = '';
      } else if (newSkill && (updateProfileForm.getValues('skills') || []).includes(newSkill)) {
        toast.warning('Skill already added.');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateProfileForm.setValue(
      'skills',
      (updateProfileForm.getValues('skills') || []).filter((skill) => skill !== skillToRemove),
      { shouldValidate: true }
    );
  };

  const handleAddPortfolioLink = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newLink = event.currentTarget.value.trim();
      // Basic URL validation
      if (!newLink.startsWith('http://') && !newLink.startsWith('https://')) {
        toast.error('Portfolio link must start with http:// or https://');
        return;
      }
      if (newLink && !(updateProfileForm.getValues('portfolioLinks') || []).includes(newLink)) {
        updateProfileForm.setValue('portfolioLinks', [...(updateProfileForm.getValues('portfolioLinks') || []), newLink], { shouldValidate: true });
        event.currentTarget.value = '';
      } else if (newLink && (updateProfileForm.getValues('portfolioLinks') || []).includes(newLink)) {
        toast.warning('Portfolio link already added.');
      }
    }
  };

  const handleRemovePortfolioLink = (linkToRemove: string) => {
    updateProfileForm.setValue(
      'portfolioLinks',
      (updateProfileForm.getValues('portfolioLinks') || []).filter((link) => link !== linkToRemove),
      { shouldValidate: true }
    );
  };


  if (isLoadingProfile) {
    return (
      <div className="space-y-12">
        <section>
          <Skeleton className="h-8 w-1/4 mb-4" /> {/* Section Title */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-28 w-full mt-4" /> {/* Bio */}
          <Skeleton className="h-8 w-1/5 mt-8" /> {/* Skills Title */}
          <Skeleton className="h-10 w-full mt-4" /> {/* Skills Input */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-12 w-full mt-8" /> {/* Save button */}
        </section>
        <Skeleton className="h-px w-full my-12" /> {/* Separator */}
        <section>
          <Skeleton className="h-8 w-1/4 mb-4" /> {/* Section Title */}
          <Skeleton className="h-10 w-full" /> {/* Current Password */}
          <Skeleton className="h-10 w-full" /> {/* New Password */}
          <Skeleton className="h-10 w-full" /> {/* Confirm New Password */}
          <Skeleton className="h-12 w-full mt-8" /> {/* Change Password button */}
        </section>
      </div>
    );
  }

  if (isErrorProfile || !authUser) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error loading profile</AlertTitle>
        <AlertDescription>
          Failed to load user profile: {errorProfile?.message || 'An unexpected error occurred. Please ensure you are logged in.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-12">
      {/* Profile Information Form */}
      <section>
        <h3 className="text-h3 font-bold text-neutral-800 mb-4">Personal Information</h3>
        <Form {...updateProfileForm}>
          <form onSubmit={updateProfileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative">
                <Avatar className="h-24 w-24 border border-neutral-200 shadow-soft">
                  <AvatarImage src={updateProfileForm.watch('avatarUrl') || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.email || 'User'}`} alt="Avatar" />
                  <AvatarFallback className="text-h3">{userProfile?.profile?.firstName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 p-1 rounded-full bg-primary-500 text-primary-foreground shadow-medium cursor-pointer transition-colors hover:bg-primary-600">
                  <Input
                    type="file"
                    id="avatar-upload"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading || isUpdatingProfile}
                  />
                  <label htmlFor="avatar-upload" className="block cursor-pointer">
                    {isUploading ? <LoadingSpinner size="sm" color="text-primary-foreground" /> : <PencilIcon className="h-4 w-4" />}
                    <span className="sr-only">Change Avatar</span>
                  </label>
                </div>
                {updateProfileForm.watch('avatarUrl') && (
                  <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 p-0 rounded-full text-destructive-500 bg-white/50 backdrop-blur-sm" onClick={handleRemoveAvatar} disabled={isUploading || isUpdatingProfile}>
                    <XCircleIcon className="h-4 w-4" />
                    <span className="sr-only">Remove Avatar</span>
                  </Button>
                )}
              </div>
              <p className="text-body-sm text-neutral-500">Click avatar or X icon to change/remove (Max 2MB)</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={updateProfileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your first name" {...field} disabled={isUpdatingProfile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateProfileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your last name" {...field} disabled={isUpdatingProfile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={updateProfileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself..." className="min-h-[100px]" {...field} disabled={isUpdatingProfile} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {authUser.role === UserRole.FREELANCER && ( // Only show skills/portfolio for freelancers
              <>
                <h4 className="text-h5 font-semibold text-neutral-800 mt-8">Skills</h4>
                <FormField
                  control={updateProfileForm.control}
                  name="skills"
                  render={() => ( // Render manually to handle array input
                    <FormItem>
                      <FormLabel>Add Skills (Press Enter to add)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., React, UI/UX Design, Content Writing"
                          onKeyDown={handleAddSkill}
                          disabled={isUpdatingProfile}
                        />
                      </FormControl>
                      <FormMessage>{updateProfileForm.formState.errors.skills?.message}</FormMessage>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(updateProfileForm.watch('skills') || []).map((skill) => (
                          <Badge key={skill} variant="secondary" className="pr-1 text-body-sm font-medium">
                            {skill}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-5 w-5 p-0 hover:bg-transparent text-neutral-500 hover:text-destructive-500"
                              onClick={() => handleRemoveSkill(skill)}
                              disabled={isUpdatingProfile}
                            >
                              <XCircleIcon className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <h4 className="text-h5 font-semibold text-neutral-800 mt-8">Portfolio Links</h4>
                <FormField
                  control={updateProfileForm.control}
                  name="portfolioLinks"
                  render={() => ( // Render manually to handle array input
                    <FormItem>
                      <FormLabel>Add Portfolio Links (Press Enter to add)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., https://behance.net/johndoe"
                          onKeyDown={handleAddPortfolioLink}
                          disabled={isUpdatingProfile}
                        />
                      </FormControl>
                      <FormMessage>{updateProfileForm.formState.errors.portfolioLinks?.message}</FormMessage>
                      <div className="mt-2 space-y-2">
                        {(updateProfileForm.watch('portfolioLinks') || []).map((link) => (
                          <div key={link} className="flex items-center space-x-2 rounded-md bg-neutral-50 p-2 border border-neutral-200">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-body-sm text-primary-500 hover:underline flex-1 truncate">
                              {link}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 hover:bg-transparent text-neutral-500 hover:text-destructive-500"
                              onClick={() => handleRemovePortfolioLink(link)}
                              disabled={isUpdatingProfile}
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}


            <Button type="submit" className="w-full text-body-md shadow-primary group" disabled={isUpdatingProfile || isUploading}>
              {(isUpdatingProfile || isUploading) && <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </section>

      <Separator className="my-12 bg-neutral-200" />

      {/* Change Password Form */}
      <section>
        <h3 className="text-h3 font-bold text-neutral-800 mb-4">Change Password</h3>
        <Form {...changePasswordForm}>
          <form onSubmit={changePasswordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            <FormField
              control={changePasswordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isChangingPassword} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={changePasswordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isChangingPassword} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={changePasswordForm.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isChangingPassword} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-body-md shadow-soft group" disabled={isChangingPassword}>
              {isChangingPassword && <LoadingSpinner size="sm" className="mr-2" />}
              Change Password
            </Button>
          </form>
        </Form>
      </section>
    </div>
  );
}