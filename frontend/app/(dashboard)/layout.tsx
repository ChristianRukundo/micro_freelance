'use client';

import { Header } from '@/components/layouts/Header';
import { Sidebar } from '@/components/layouts/Sidebar';
import { useAuthStore } from '@/lib/zustand';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/lib/types';
import { ProtectedRoute } from '@/components/common/ProtectedRoute'; 

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  
  useEffect(() => {
    if (!isLoading && isAuthenticated && pathname === '/dashboard') {
      let targetPath = '/dashboard/client'; 
      switch (user?.role) {
        case UserRole.CLIENT: targetPath = '/dashboard/client'; break;
        case UserRole.FREELANCER: targetPath = '/dashboard/freelancer'; break;
        case UserRole.ADMIN: targetPath = '/admin/users'; break;
        
      }
      router.replace(targetPath);
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  
  
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}