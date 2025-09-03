'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BellIcon, LogOutIcon, UserIcon, LayoutDashboardIcon, BriefcaseBusinessIcon, UsersIcon, MenuIcon, XIcon } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ShadcnThemeToggle } from '@/components/common/ShadcnThemeToggle';
import { useAuthStore } from '@/lib/zustand';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/zustand'; // For mobile sidebar toggle
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { UserRole } from '@/lib/types'; // Ensure UserRole is imported

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call backend logout API (clears HTTP-only cookies)
      await api.post('/auth/logout');
      logout();
      toast.success('Logged out successfully!');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  const logoutMutation = useMutation({
    mutationFn: handleLogout,
  });

  const getDashboardLink = () => {
    if (!user) return '/login'; // Should ideally not happen if authenticated
    switch (user.role) {
      case UserRole.CLIENT:
        return '/dashboard/client';
      case UserRole.FREELANCER:
        return '/dashboard/freelancer';
      case UserRole.ADMIN:
        return '/admin/users'; // Admin's main dashboard
      default:
        return '/dashboard'; // Generic dashboard for unhandled roles
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-background/90 backdrop-blur-sm shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu Toggle & Logo */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle mobile menu"
          >
            {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
          <Link href="/" className="flex items-center space-x-2" aria-label="Home">
            <Logo className="h-8 w-auto text-primary-500" />
            <span className="text-h5 font-semibold text-neutral-800">FreelanceHub</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <Link href="/tasks" className="text-body-md font-medium text-neutral-600 hover:text-primary-500 transition-colors">
            Browse Tasks
          </Link>
          <Link href="/freelancers" className="text-body-md font-medium text-neutral-600 hover:text-primary-500 transition-colors">
            Find Freelancers
          </Link>
          {isAuthenticated && (
            <Link href={getDashboardLink()} className="text-body-md font-medium text-neutral-600 hover:text-primary-500 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* User Actions & Theme Toggle */}
        <div className="flex items-center space-x-3">
          <ShadcnThemeToggle />

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
                    <Avatar className="h-9 w-9 border border-neutral-200">
                      <AvatarImage src={user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || user?.email}`} alt={user?.email || 'User'} />
                      <AvatarFallback>{(user?.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-body-md font-medium leading-none">{user?.profile?.firstName || user?.email}</p>
                      <p className="text-caption text-neutral-500">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex cursor-pointer items-center text-body-sm text-neutral-700 hover:text-primary-500">
                      <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex cursor-pointer items-center text-body-sm text-neutral-700 hover:text-primary-500">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === UserRole.ADMIN && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="flex cursor-pointer items-center text-body-sm text-neutral-700 hover:text-primary-500">
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} className="text-body-sm text-destructive-500 hover:!bg-destructive-50 hover:!text-destructive-600 focus:bg-destructive-50 focus:text-destructive-600 cursor-pointer">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login" passHref>
                <Button variant="ghost" className="text-body-md font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="default" className="text-body-md font-medium">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}