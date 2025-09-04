'use client';

import { useAuthStore } from '@/lib/zustand';
import { UserState } from '@/lib/zustand';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { useEffect } from 'react'; // Import useEffect

interface UseAuthReturn {
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: any) => void;
  logout: () => void;
  isClient: boolean;
  isFreelancer: boolean;
  isAdmin: boolean;
}

// These are handled by the AuthProvider now, useAuth just provides state
// const publicRoutes = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/tasks', '/tasks/[id]', '/freelancers'];
// const authRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();
  // useRouter and usePathname are still useful if you need to perform
  // direct navigation/path checks within a component using this hook.
  // const router = useRouter();
  // const pathname = usePathname();

  // The main auth check and redirects are now centralized in AuthProvider.tsx
  // This hook just exposes the current auth state from Zustand.

  const isClient = isAuthenticated && user?.role === UserRole.CLIENT;
  const isFreelancer = isAuthenticated && user?.role === UserRole.FREELANCER;
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

  return { user, isAuthenticated, isLoading, login, logout, isClient, isFreelancer, isAdmin };
}