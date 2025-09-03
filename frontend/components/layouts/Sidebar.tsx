'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/zustand';
import { cn } from '@/lib/utils';
import { LayoutDashboardIcon, BriefcaseIcon, UsersIcon, UserIcon, DollarSignIcon, BellIcon, MessageSquareTextIcon, XIcon, BriefcaseBusinessIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/lib/types';
import React from 'react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { AvatarFallback } from '../ui/avatar';

interface SidebarNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function SidebarNavLink({ href, icon, label, onClick }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref onClick={onClick}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start text-body-md font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800',
        )}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </Button>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  React.useEffect(() => {
    // Close sidebar on route change for mobile
    if (isSidebarOpen) {
      toggleSidebar();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: '0%', transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  const navLinks = React.useMemo(() => {
    const links = [];
    if (user?.role === UserRole.CLIENT) {
      links.push(
        { href: '/dashboard/client', icon: <LayoutDashboardIcon className="h-5 w-5" />, label: 'Client Dashboard' },
        { href: '/tasks/new', icon: <BriefcaseIcon className="h-5 w-5" />, label: 'Post New Task' },
        { href: '/dashboard/spending', icon: <DollarSignIcon className="h-5 w-5" />, label: 'Spending History' },
      );
    } else if (user?.role === UserRole.FREELANCER) {
      links.push(
        { href: '/dashboard/freelancer', icon: <LayoutDashboardIcon className="h-5 w-5" />, label: 'Freelancer Dashboard' },
        { href: '/tasks', icon: <BriefcaseIcon className="h-5 w-5" />, label: 'Browse Tasks' },
        { href: '/dashboard/earnings', icon: <DollarSignIcon className="h-5 w-5" />, label: 'My Earnings' },
        { href: '/dashboard/payouts', icon: <DollarSignIcon className="h-5 w-5" />, label: 'Payout Settings' },
      );
    } else if (user?.role === UserRole.ADMIN) {
      links.push(
        { href: '/admin/users', icon: <UsersIcon className="h-5 w-5" />, label: 'Manage Users' },
        // Add more admin links as needed
      );
    }

    // Common links for all authenticated users
    links.push(
      { href: '/dashboard/profile', icon: <UserIcon className="h-5 w-5" />, label: 'Profile Settings' },
      { href: '/dashboard/notifications', icon: <BellIcon className="h-5 w-5" />, label: 'Notifications' },
    );
    return links;
  }, [user]);


  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <motion.aside
        initial="hidden"
        animate={isSidebarOpen ? 'visible' : 'hidden'}
        variants={sidebarVariants}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200 bg-background shadow-lg transition-transform duration-300 md:sticky md:z-auto md:w-64 md:translate-x-0',
          !isSidebarOpen && '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2" aria-label="Home">
            <BriefcaseBusinessIcon className="h-7 w-7 text-primary-500" />
            <span className="text-h5 font-semibold text-neutral-800">Dashboard</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Close mobile menu"
          >
            <XIcon className="h-6 w-6 text-neutral-600" />
          </Button>
        </div>
        <Separator />
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <SidebarNavLink
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  onClick={toggleSidebar} // Close sidebar on click for mobile
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info / Footer in sidebar if needed */}
        {user && (
          <div className="p-4 border-t border-neutral-200">
             <div className="flex items-center space-x-3 text-body-sm text-neutral-600">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user?.profile?.avatarUrl} alt={user.email} />
                 <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div className="flex flex-col">
                 <span className="font-semibold">{user.profile?.firstName || user.email}</span>
                 <span className="text-caption text-neutral-500">{user.role.toLowerCase()}</span>
               </div>
             </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}