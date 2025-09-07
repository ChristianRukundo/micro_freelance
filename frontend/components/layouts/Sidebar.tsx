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
  UserCogIcon,
  LogOutIcon,
  MenuIcon,
  SparklesIcon,
  ListChecksIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShadcnThemeToggle } from "@/components/common/ShadcnThemeToggle"; // Assuming this is correctly named and imported
import { useNotifications } from "@/hooks/useNotifications";
import { Logo } from "../common/Logo";

interface NavLinkItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  roles?: UserRole[];
  badge?: string;
}

const Badge = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning";
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-white",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
    warning: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
  };
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium shadow-sm",
        "backdrop-blur-sm border border-white/20",
        variants[variant]
      )}
    >
      {children}
    </motion.span>
  );
};

interface SidebarNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
  isCollapsed: boolean;
}

function SidebarNavLink({
  href,
  icon,
  label,
  badge,
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
            animate={{ scale: isActive ? 1.02 : 1 }}
            whileHover={{ scale: 1.03, x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.2,
            }}
            className={cn(
              "relative group flex items-center w-full p-3 rounded-xl font-medium transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10",
              isCollapsed ? "justify-center" : "justify-start",
              isActive
                ? cn(
                    "bg-gradient-to-r from-primary/10 to-primary/5 text-primary",
                    "border border-primary/20 shadow-md shadow-primary/10",
                    "dark:from-primary/20 dark:to-primary/10 dark:text-primary-300",
                    "before:absolute before:inset-0 before:rounded-xl",
                    "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                    "before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  )
                : cn(
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent",
                    "dark:hover:from-muted/30"
                  )
            )}
            onClick={handleClick}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && !isCollapsed && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-r-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className="relative flex items-center">
              {cloneElement(icon as ReactElement<SVGProps<SVGSVGElement>>, {
                className: cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-primary drop-shadow-sm" : "",
                  !isCollapsed && "mr-3"
                ),
              })}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center gap-2 whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-sm font-medium">{label}</span>
                    {badge && (
                      <Badge
                        variant={
                          badge === "New"
                            ? "success"
                            : badge === "Hot"
                              ? "warning"
                              : "primary"
                        }
                      >
                        {badge}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              initial={false}
            />
          </motion.div>
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="font-medium">
          <div className="flex items-center gap-2">
            {label}
            {badge && <Badge variant="primary">{badge}</Badge>}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const displayName =
    user?.profile?.firstName || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.profile?.avatarUrl;
  const avatarFallback = (user?.profile?.firstName || user?.email || "U")
    ?.charAt(0)
    .toUpperCase();

  console.log("the avatar url is", avatarUrl);

  const mainNavLinks: NavLinkItem[] = React.useMemo(
    () => [
      {
        href: "/dashboard/client",
        icon: <LayoutDashboardIcon className="h-5 w-5" />,
        label: "Client Dashboard",
        roles: [UserRole.CLIENT],
      },
      {
        href: "/dashboard/client/projects",
        icon: <ListChecksIcon className="h-5 w-5" />,
        label: "My Projects",
        roles: [UserRole.CLIENT],
      },
      {
        href: "/dashboard/freelancer/projects",
        icon: <ListChecksIcon className="h-5 w-5" />,
        label: "My Projects",
        roles: [UserRole.FREELANCER],
      },
      {
        href: "/dashboard/tasks/new",
        icon: <BriefcaseIcon className="h-5 w-5" />,
        label: "Post New Project",
        roles: [UserRole.CLIENT],
        badge: "New",
      },
      {
        href: "/dashboard/client/spending",
        icon: <DollarSignIcon className="h-5 w-5" />,
        label: "Spending History",
        roles: [UserRole.CLIENT],
      },
      {
        href: "/dashboard/freelancer",
        icon: <LayoutDashboardIcon className="h-5 w-5" />,
        label: "Freelancer Dashboard",
        roles: [UserRole.FREELANCER],
      },
      {
        href: "/dashboard/freelancer/earnings",
        icon: <DollarSignIcon className="h-5 w-5" />,
        label: "My Earnings",
        roles: [UserRole.FREELANCER],
      },
      {
        href: "/dashboard/client/payouts",
        icon: <DollarSignIcon className="h-5 w-5" />,
        label: "Payout Settings",
        roles: [UserRole.FREELANCER],
      },
      {
        href: "/admin/users",
        icon: <UserCogIcon className="h-5 w-5" />,
        label: "Manage Users",
        roles: [UserRole.ADMIN],
      },
      {
        href: "/dashboard/profile",
        icon: <UserIcon className="h-5 w-5" />,
        label: "Profile Settings",
      },
      {
        href: "/dashboard/notifications",
        icon: <BellIcon className="h-5 w-5" />,
        label: "Notifications",
        badge: unreadCount > 0 ? unreadCount.toString() : undefined,
      },
    ],
    [unreadCount]
  );

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
    if (user.role === "CLIENT") {
      return mainNavLinks.filter(
        (link) => link.roles?.includes(UserRole.CLIENT) || !link.roles
      );
    }
    if (user.role === "FREELANCER") {
      return mainNavLinks.filter(
        (link) => link.roles?.includes(UserRole.FREELANCER) || !link.roles
      );
    }
    if (user.role === "ADMIN") {
      return mainNavLinks.filter(
        (link) => link.roles?.includes(UserRole.ADMIN) || !link.roles
      );
    }
    return mainNavLinks.filter((link) => !link.roles);
  }, [user, isAuthenticated, mainNavLinks]);

  const desktopExpandedWidth = "18rem";
  const desktopCollapsedWidth = "4.5rem";
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <motion.aside
        initial={false}
        animate={sidebarAnimateProps}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.3,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col",
          "bg-gradient-to-b from-background via-background to-background/95",
          "border-r border-border/50 shadow-2xl shadow-black/10",
          "backdrop-blur-xl",
          "dark:bg-gradient-to-b dark:from-background dark:via-background/95 dark:to-background/90",
          "dark:shadow-black/20",
          !isMobile && "md:sticky md:z-auto",
          !isMobile && isSidebarOpen && "md:w-72",
          !isMobile && !isSidebarOpen && "md:w-18"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div
          className={cn(
            "relative flex items-center px-6 py-4 border-b border-border/30",
            "bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm",
            isSidebarOpen ? "justify-between h-20" : "justify-center h-20"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center group transition-all duration-300",
              isSidebarOpen ? "space-x-3" : "justify-center"
            )}
            aria-label="Home"
          >
            <div className="relative">
              <Logo showText={false} />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent whitespace-nowrap"
                >
                  MicroFreelance
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {!isMobile && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className={cn(
                    "relative p-2 h-10 w-10 rounded-lg transition-all duration-300",
                    "hover:bg-primary/10 hover:text-primary",
                    "before:absolute before:inset-0 before:rounded-lg",
                    "before:bg-gradient-to-r before:from-primary/10 before:to-transparent",
                    "before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  )}
                  aria-label={
                    isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  <motion.div
                    animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MenuIcon className="h-5 w-5" />
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              </TooltipContent>
            </Tooltip>
          )}
          {isSidebarOpen && isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="p-2 h-10 w-10 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Close mobile menu"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
        {isAuthenticated && user && (
          <div
            className={cn(
              "relative p-6 border-b border-border/30",
              "bg-gradient-to-r from-muted/30 to-transparent",
              isDesktopCollapsed && "p-4 flex justify-center"
            )}
          >
            <div
              className={cn(
                "flex items-center transition-all duration-300",
                isSidebarOpen ? "space-x-4" : "flex-col space-y-2"
              )}
            >
              <div className="relative">
                <Avatar
                  className={cn(
                    "border-2 border-primary/20 shadow-lg transition-all duration-300",
                    "ring-2 ring-primary/10",
                    isSidebarOpen ? "h-12 w-12" : "h-10 w-10"
                  )}
                >
                  <AvatarImage
                    src={
                      avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`
                    }
                    alt={displayName}
                  />
                  <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm"
                />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col flex-1 min-w-0"
                  >
                    <span className="text-base font-semibold truncate text-foreground">
                      {displayName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground capitalize">
                        {user.role?.toLowerCase() || "User"}
                      </span>
                      {user.role === UserRole.ADMIN && (
                        <SparklesIcon className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className={cn("space-y-2", isDesktopCollapsed && "space-y-3")}>
            {filteredNavLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <SidebarNavLink
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  badge={link.badge}
                  isCollapsed={isDesktopCollapsed}
                />
              </motion.div>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-border/30 bg-gradient-to-r from-muted/20 to-transparent">
          <div
            className={cn(
              "flex items-center gap-3",
              isDesktopCollapsed && "flex-col space-y-3"
            )}
          >
            <div
              className={cn(
                isDesktopCollapsed ? "w-full flex justify-center" : "flex-1"
              )}
            >
              {isDesktopCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <ShadcnThemeToggle />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Toggle Theme</TooltipContent>
                </Tooltip>
              ) : (
                <ShadcnThemeToggle />
              )}
            </div>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className={cn(
                    "transition-all duration-300 group",
                    "hover:bg-gradient-to-r hover:from-destructive/10 hover:to-transparent",
                    "hover:text-destructive border border-transparent hover:border-destructive/20",
                    isDesktopCollapsed
                      ? "w-10 h-10 p-0 rounded-lg"
                      : "w-full justify-start px-3 py-2 rounded-lg"
                  )}
                  aria-label="Log out"
                >
                  <LogOutIcon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                      !isDesktopCollapsed && "mr-3"
                    )}
                  />
                  <AnimatePresence>
                    {!isDesktopCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium whitespace-nowrap"
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
        </div>
      </motion.aside>
    </>
  );
}
