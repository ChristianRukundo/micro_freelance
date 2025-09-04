// components/layouts/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image"; // For optimized images
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOutIcon,
  UserIcon,
  LayoutDashboardIcon,
  BriefcaseBusinessIcon,
  UsersIcon,
  MenuIcon,
  XIcon,
  UserCogIcon,
  SettingsIcon,
  CodeIcon,
  ChevronRightIcon,
  BellIcon,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ShadcnThemeToggle } from "@/components/common/ShadcnThemeToggle";
import { useAuthStore, useUIStore } from "@/lib/zustand";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserRole } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      logout();
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out.");
    }
  };

  const logoutMutation = useMutation({
    mutationFn: handleLogout,
  });

  const getDashboardLink = React.useCallback(() => {
    if (!user) return "/login";
    switch (user.role) {
      case UserRole.CLIENT:
        return "/dashboard/client";
      case UserRole.FREELANCER:
        return "/dashboard/freelancer";
      case UserRole.ADMIN:
        return "/admin/users";
      default:
        return "/dashboard";
    }
  }, [user]);

  const mobileNavLinks = [
    {
      href: "/tasks",
      label: "Browse Tasks",
      icon: <BriefcaseBusinessIcon className="mr-2 h-4 w-4" />,
    },
    {
      href: "/freelancers",
      label: "Find Freelancers",
      icon: <UsersIcon className="mr-2 h-4 w-4" />,
    },
  ];

  if (isAuthenticated) {
    mobileNavLinks.push(
      {
        href: getDashboardLink(),
        label: "Dashboard",
        icon: <LayoutDashboardIcon className="mr-2 h-4 w-4" />,
      },
      {
        href: "/dashboard/profile",
        label: "Profile",
        icon: <UserIcon className="mr-2 h-4 w-4" />,
      },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: <BellIcon className="mr-2 h-4 w-4" />,
      }
    );
    if (user?.role === UserRole.ADMIN) {
      mobileNavLinks.push({
        href: "/admin/users",
        label: "Admin Panel",
        icon: <UserCogIcon className="mr-2 h-4 w-4" />,
      });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-background/90 backdrop-blur-sm shadow-soft transition-all duration-300 ease-in-out-quad">
      <div className="container flex h-16 items-center justify-between">
        {/* Toggle button for desktop sidebar (moved to the left of the logo) */}
        {isAuthenticated && ( // Only show sidebar toggle if authenticated (and thus, might be in a dashboard area)
          <Button
            variant="ghost"
            size="icon"
            className="mr-3 hidden md:flex" // Show only on desktop, before logo
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <XIcon className="h-6 w-6 text-neutral-600" />
            ) : (
              <MenuIcon className="h-6 w-6 text-neutral-600" />
            )}
          </Button>
        )}

        {/* Logo and Site Title */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2"
            aria-label="Home"
          >
            <Logo className="h-8 w-auto text-primary-500 transition-colors hover:text-primary-600" />
            <span className="text-h5 font-semibold text-neutral-800 transition-colors hover:text-primary-700">
              FreelanceHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation (Center/Right aligned by flex-1 push) */}
        <nav className="flex-1 hidden items-center justify-center space-x-6 md:flex"> {/* Added justify-center for a potentially more balanced look */}
          <Link
            href="/tasks"
            className="text-body-md font-medium text-neutral-600 hover:text-primary-500 transition-colors duration-200"
            prefetch={false}
          >
            Browse Tasks
          </Link>
          <Link
            href="/freelancers"
            className="text-body-md font-medium text-neutral-600 hover:text-primary-500 transition-colors duration-200"
            prefetch={false}
          >
            Find Freelancers
          </Link>
          {isAuthenticated && (
            <Link
              href={getDashboardLink()}
              className="text-body-md font-medium text-neutral-600 hover:text-primary-500 transition-colors duration-200"
              prefetch={false}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* User Actions, Notifications, Theme Toggle, Mobile Menu */}
        <div className="flex items-center space-x-3 ml-auto md:ml-0"> {/* ml-auto pushes it to the right on small screens if nav is centered */}
          <ShadcnThemeToggle />

          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                    aria-label="User menu"
                  >
                    <Avatar className="h-9 w-9 border border-neutral-200 transition-all duration-200 group-hover:border-primary-500">
                      <AvatarImage
                        src={
                          user?.profile?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || user?.email}`
                        }
                        alt={user?.email || "User"}
                      />
                      <AvatarFallback className="text-body-md font-semibold bg-primary-100 text-primary-700">
                        {(user?.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg shadow-medium border-neutral-200"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="flex flex-col space-y-1 p-2">
                    <p className="text-body-md font-semibold leading-none text-neutral-800">
                      {user?.profile?.firstName || user?.email}
                    </p>
                    <p className="text-caption text-neutral-500">
                      {user?.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-200" />
                  <DropdownMenuItem asChild>
                    <Link
                      href={getDashboardLink()}
                      className="flex cursor-pointer items-center p-2 text-body-sm text-neutral-700 transition-colors hover:text-primary-500 hover:bg-primary-50 rounded-md"
                    >
                      <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex cursor-pointer items-center p-2 text-body-sm text-neutral-700 transition-colors hover:text-primary-500 hover:bg-primary-50 rounded-md"
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === UserRole.ADMIN && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/users"
                        className="flex cursor-pointer items-center p-2 text-body-sm text-neutral-700 transition-colors hover:text-primary-500 hover:bg-primary-50 rounded-md"
                      >
                        <UserCogIcon className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-neutral-200" />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="flex cursor-pointer items-center p-2 text-body-sm text-destructive-500 transition-colors hover:bg-destructive-50 hover:text-destructive-600 focus:bg-destructive-50 focus:text-destructive-600 rounded-md"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-2"
            >
              <Link href="/login" passHref>
                <Button
                  variant="ghost"
                  className="text-body-md font-medium text-neutral-700 hover:text-primary-500"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button
                  variant="default"
                  className="text-body-md font-medium shadow-sm hover:shadow-medium"
                >
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] sm:w-[320px] p-6 pt-12 flex flex-col"
            >
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-h3 font-bold text-neutral-800">
                  Navigation
                </SheetTitle>
                <SheetDescription className="text-body-md text-neutral-600">
                  Explore projects, find freelancers, or manage your account.
                </SheetDescription>
              </SheetHeader>
              <nav className="flex-1 space-y-2">
                {mobileNavLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    passHref
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-body-md font-medium text-neutral-700 hover:text-primary-500"
                    >
                      {item.icon} {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-neutral-200">
                {isAuthenticated ? (
                  <Button
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="w-full justify-start text-destructive-500 hover:bg-destructive-50"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Log out"}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" passHref>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" passHref>
                      <Button variant="default" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}