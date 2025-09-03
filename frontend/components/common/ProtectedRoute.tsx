'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body-md text-neutral-500">
        Redirecting to login...
      </div>
    );
  }

  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    
    
    
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background">
        <h1 className="text-h1 font-bold text-destructive-500">Access Denied</h1>
        <p className="mt-4 text-body-lg text-neutral-600">
          You do not have the necessary permissions to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}