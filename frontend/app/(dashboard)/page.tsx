'use client';

import { Metadata } from 'next';
import { useAuthStore } from '@/lib/zustand';
import { UserRole } from '@/lib/types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';


export const metadata: Metadata = {
  title: 'Dashboard - Micro Freelance Marketplace',
  description: 'Your personalized dashboard for managing projects and earnings.',
};

export default function DashboardOverviewPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      let targetPath = '/dashboard/client'; 
      switch (user?.role) {
        case UserRole.CLIENT: targetPath = '/dashboard/client'; break;
        case UserRole.FREELANCER: targetPath = '/dashboard/freelancer'; break;
        case UserRole.ADMIN: targetPath = '/admin/users'; break; 
        default: break;
      }
      router.replace(targetPath);
    }
  }, [isLoading, isAuthenticated, user, router]);

  
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center text-body-md text-neutral-500">
        <LoadingSpinner size="lg" className="mr-4" /> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center">
      <h1 className="text-h1 text-neutral-800">Welcome to your Dashboard!</h1>
      <p className="text-body-md text-neutral-600">Redirecting to your role-specific page...</p>
    </div>
  );
}