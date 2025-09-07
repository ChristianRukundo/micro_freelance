// components/notifications/NotificationBell.tsx
"use client";

import React from "react";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/date";
import { Badge } from "../ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationIcon } from "../common/NotificationIcon";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    isErrorNotifications,
    markNotificationAsRead,
  } = useNotifications();

  const handleNotificationClick = async (
    notificationId: string,
    url: string
  ) => {
    try {
      markNotificationAsRead(notificationId);
      window.location.href = url;
    } catch (error) {
      window.location.href = url;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <BellIcon className="h-6 w-6 hover:text-primary-500 transition-colors" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between text-h6 font-semibold">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} New</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoadingNotifications ? (
          <div className="p-4 text-center">
            <LoadingSpinner size="sm" className="mr-2" /> Loading...
          </div>
        ) : isErrorNotifications ? (
          <div className="p-4 text-center text-destructive-500">
            Error loading.
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-body-sm">
            No new notifications.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex cursor-pointer items-start space-x-3 py-3",
                  !notification.isRead && "bg-primary-50"
                )}
                onSelect={() =>
                  handleNotificationClick(notification.id, notification.url)
                }
              >
                <div className="flex-shrink-0 mt-0.5">
                  <NotificationIcon
                    type={notification.type}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-body-sm",
                      !notification.isRead && "font-medium text-primary-800"
                    )}
                  >
                    {notification.message}
                  </p>
                  <p className="text-caption mt-1">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/notifications"
                    className="flex justify-center text-body-sm text-primary-500 hover:text-primary-600 cursor-pointer py-2"
                  >
                    View All Notifications
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
