// components/layouts/Sidebar.tsx
"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuthStore, useUIStore } from "@/lib/zustand";
import { cn } from "@/lib/utils";
import React, { cloneElement, ReactElement, SVGProps, useEffect } from "react";
import {
  LayoutDashboardIcon,
  BriefcaseIcon,
  UsersIcon,
  UserIcon,
  DollarSignIcon,
  BellIcon,
  XIcon,
  BriefcaseBusinessIcon,
  UserCogIcon,
  LogOutIcon,
  SearchIcon,
  MenuIcon,
} from "lucide-react"; // Added MenuIcon for toggle
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShadcnThemeToggle } from "@/components/common/ShadcnThemeToggle";

// --- Navigation Link Interface ---
interface NavLinkItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  roles?: UserRole[];
}

// --- Main Navigation Data (Centralized Configuration) ---
const mainNavLinks: NavLinkItem[] = [
  {
    href: "/tasks",
    icon: <BriefcaseIcon className="h-5 w-5" />,
    label: "Browse Projects",
  },
  {
    href: "/freelancers",
    icon: <UsersIcon className="h-5 w-5" />,
    label: "Find Freelancers",
  },

  // Client Dashboard Links
  {
    href: "/dashboard/client",
    icon: <LayoutDashboardIcon className="h-5 w-5" />,
    label: "Client Dashboard",
    roles: [UserRole.CLIENT],
  },
  {
    href: "/tasks/new",
    icon: <BriefcaseIcon className="h-5 w-5" />,
    label: "Post New Project",
    roles: [UserRole.CLIENT],
  },
  {
    href: "/dashboard/spending",
    icon: <DollarSignIcon className="h-5 w-5" />,
    label: "Spending History",
    roles: [UserRole.CLIENT],
  },

  // Freelancer Dashboard Links
  {
    href: "/dashboard/freelancer",
    icon: <LayoutDashboardIcon className="h-5 w-5" />,
    label: "Freelancer Dashboard",
    roles: [UserRole.FREELANCER],
  },
  {
    href: "/dashboard/earnings",
    icon: <DollarSignIcon className="h-5 w-5" />,
    label: "My Earnings",
    roles: [UserRole.FREELANCER],
  },
  {
    href: "/dashboard/payouts",
    icon: <DollarSignIcon className="h-5 w-5" />,
    label: "Payout Settings",
    roles: [UserRole.FREELANCER],
  },

  // Admin Links
  {
    href: "/admin/users",
    icon: <UserCogIcon className="h-5 w-5" />,
    label: "Manage Users",
    roles: [UserRole.ADMIN],
  },

  // Common Links for all Authenticated Users
  {
    href: "/dashboard/profile",
    icon: <UserIcon className="h-5 w-5" />,
    label: "Profile Settings",
  },
  {
    href: "/dashboard/notifications",
    icon: <BellIcon className="h-5 w-5" />,
    label: "Notifications",
  },
];

// --- Sidebar Navigation Link Component ---
interface SidebarNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isCollapsed: boolean;
}

function SidebarNavLink({
  href,
  icon,
  label,
  onClick,
  isCollapsed,
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname.startsWith(href) && href !== "/");
  const { setSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    onClick?.();
  };

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link href={href} passHref>
          <motion.div
            initial={false}
            animate={{
              backgroundColor: isActive
                ? "hsl(var(--primary-50))"
                : "transparent",
              color: isActive
                ? "hsl(var(--primary-700))"
                : "hsl(var(--neutral-600))",
            }}
            whileHover={{
              backgroundColor: isActive
                ? "hsl(var(--primary-100))"
                : "hsl(var(--neutral-100))",
              color: isActive
                ? "hsl(var(--primary-800))"
                : "hsl(var(--neutral-800))",
              scale: 1.02,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center rounded-lg cursor-pointer h-10",
              isCollapsed ? "justify-center w-10 p-0" : "px-4 py-2 w-full",
              isActive ? "font-semibold" : "font-medium"
            )}
            onClick={handleClick}
            aria-current={isActive ? "page" : undefined}
          >
            {cloneElement(icon as ReactElement<SVGProps<SVGSVGElement>>, {
              className: cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-primary-700" : "text-neutral-500",
                isCollapsed ? "" : "mr-3"
              ),
            })}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden text-body-md"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            <span className="sr-only">{label}</span>
          </motion.div>
        </Link>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}

// --- Main Sidebar Component ---
export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore(); // toggleSidebar is used here
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, setSidebarOpen]);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, isSidebarOpen, setSidebarOpen]);

  const filteredNavLinks = React.useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return mainNavLinks.filter((link) => {
      if (!link.roles) return true;
      return link.roles.includes(user.role!);
    });
  }, [user, isAuthenticated]);

  const desktopExpandedWidth = "16rem"; // Tailwind's w-64
  const desktopCollapsedWidth = "4rem"; // Tailwind's w-16

  const isDesktopCollapsed = !isSidebarOpen && !isMobile;

  const sidebarAnimateProps = isMobile
    ? { x: isSidebarOpen ? 0 : "-100%" }
    : { width: isSidebarOpen ? desktopExpandedWidth : desktopCollapsedWidth };

  return (
    <>
      {isSidebarOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <motion.aside
        initial={false}
        animate={sidebarAnimateProps}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
          duration: 0.3,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-neutral-200 bg-background shadow-lg",
          !isMobile && "md:sticky md:z-auto md:w-64",
          !isMobile && !isSidebarOpen && "md:w-16"
        )}
      >
        {/* Sidebar Header */}
        <div
          className={cn(
            "flex items-center px-4",
            isSidebarOpen ? "justify-between h-16" : "justify-center h-16 w-16"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center",
              isSidebarOpen ? "space-x-2" : "justify-center"
            )}
            aria-label="Home"
          >
            {isSidebarOpen && (
              <BriefcaseBusinessIcon
                className={cn("h-7 w-7 text-primary-500")}
              />
            )}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-h5 font-semibold text-neutral-800 whitespace-nowrap overflow-hidden"
                >
                  FreelanceHub
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {/* Toggle button for desktop sidebar (moved here) */}
          {!isMobile && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label={
                    isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                  className="p-0 h-8 w-8 text-neutral-600 hover:text-primary-500"
                >
                  {isSidebarOpen ? (
                    <XIcon className="h-5 w-5" />
                  ) : (
                    <MenuIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              </TooltipContent>
            </Tooltip>
          )}

          {isSidebarOpen && isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close mobile menu"
            >
              <XIcon className="h-6 w-6 text-neutral-600" />
            </Button>
          )}
        </div>

        <Separator />

        {/* User Profile Summary */}
        {isAuthenticated && user && (
          <div
            className={cn(
              "p-4 pb-2",
              isDesktopCollapsed && "p-2 flex justify-center"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isSidebarOpen ? "space-x-3" : "flex-col space-y-1"
              )}
            >
              <Avatar
                className={cn(
                  "border border-neutral-200 shadow-sm",
                  isSidebarOpen ? "h-9 w-9" : "h-8 w-8"
                )}
              >
                <AvatarImage
                  src={
                    user?.profile?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || "User"}`
                  }
                  alt={user?.email || "User"}
                />
                <AvatarFallback className="text-body-md font-semibold bg-primary-100 text-primary-700">
                  {(user?.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-body-md font-semibold text-neutral-800 truncate">
                      {user.profile?.firstName || user.email}
                    </span>
                    <span className="text-caption text-neutral-500 capitalize">
                      {user.role?.toLowerCase() || "User"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <Separator />

        {/* Main Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className={cn("space-y-2", isDesktopCollapsed && "space-y-1")}>
            {filteredNavLinks.map((link) => (
              <li key={link.href}>
                <SidebarNavLink
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  isCollapsed={isDesktopCollapsed}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-200">
          <ul className="space-y-2">
            <li>
              <div
                className={cn(
                  "flex items-center justify-between",
                  isDesktopCollapsed ? "flex-col space-y-2" : "space-x-2"
                )}
              >
                <AnimatePresence>
                  {isSidebarOpen ? (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden flex-shrink-0"
                    >
                      <ShadcnThemeToggle />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <ShadcnThemeToggle />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Toggle Theme
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-destructive-500 hover:bg-destructive-50",
                        isDesktopCollapsed
                          ? "w-10 h-10 p-0 justify-center"
                          : "w-full"
                      )}
                      onClick={() => logout()}
                      aria-label="Log out"
                    >
                      <LogOutIcon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isSidebarOpen ? "mr-3" : ""
                        )}
                      />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap overflow-hidden text-body-md"
                          >
                            Log out
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  {isDesktopCollapsed && (
                    <TooltipContent side="right">Log out</TooltipContent>
                  )}
                </Tooltip>
              </div>
            </li>
          </ul>
        </div>
      </motion.aside>
    </>
  );
}
