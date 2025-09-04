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


export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  const isClient = isAuthenticated && user?.role === UserRole.CLIENT;
  const isFreelancer = isAuthenticated && user?.role === UserRole.FREELANCER;
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;


  return { user, isAuthenticated, isLoading, login, logout, isClient, isFreelancer, isAdmin };
}