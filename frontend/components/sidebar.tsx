"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Building,
  PlusCircle,
  ListChecks,
  BarChart3,
  User,
  Search,
  Heart,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "./logo";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  // Define navigation items based on user role
  const agentNavItems = [
    {
      title: "Dashboard",
      href: "/agent",
      icon: Home,
    },
    {
      title: "Add Property",
      href: "/agent/properties/new",
      icon: PlusCircle,
    },
    {
      title: "My Listings",
      href: "/agent/properties",
      icon: Building,
    },
    {
      title: "Bookings",
      href: "/agent/bookings",
      icon: ListChecks,
    },
    {
      title: "Analytics",
      href: "/agent/analytics",
      icon: BarChart3,
    },
    {
      title: "Profile",
      href: "/agent/profile",
      icon: User,
    },
  ];

  const userNavItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Search",
      href: "/villas",
      icon: Search,
    },
    {
      title: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
    {
      title: "Bookings",
      href: "/bookings",
      icon: Calendar,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const navItems = user?.role === "AGENT" ? agentNavItems : userNavItems;

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-3 py-4">
        <Logo
          size={isCollapsed ? "sm" : "md"}
          textHidden={isCollapsed}
          className={cn(
            "w-full",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        />
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1 py-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center"
                )}
                size={isCollapsed ? "icon" : "default"}
              >
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground",
            isCollapsed && "justify-center"
          )}
          size={isCollapsed ? "icon" : "default"}
          onClick={logout}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
