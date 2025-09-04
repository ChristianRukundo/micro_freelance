'use client';

import React from 'react';
import { BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/date';
import { NotificationType } from '@/lib/types';
import { MessageSquareTextIcon, CheckCircle2Icon, DollarSignIcon, AlertCircleIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface NotificationBellProps {
  className?: string;
}

const getNotificationShortIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.NEW_BID: return <MessageSquareTextIcon className="h-4 w-4 text-primary-500" />;
    case NotificationType.BID_ACCEPTED: return <CheckCircle2Icon className="h-4 w-4 text-success-500" />;
    case NotificationType.MILESTONE_APPROVED: return <CheckCircle2Icon className="h-4 w-4 text-success-500" />;
    case NotificationType.PAYMENT_SUCCEEDED: return <DollarSignIcon className="h-4 w-4 text-success-500" />;
    case NotificationType.REVISION_REQUESTED: return <AlertCircleIcon className="h-4 w-4 text-error-500" />;
    default: return <BellIcon className="h-4 w-4 text-neutral-500" />;
  }
};

export function NotificationBell({ className }: NotificationBellProps) {
  const { notifications, unreadCount, isLoadingNotifications, isErrorNotifications, markNotificationAsRead } = useNotifications();

  const handleNotificationClick = async (notificationId: string, url: string) => {
    try {
      await markNotificationAsRead(notificationId);
      window.location.href = url; // Client-side navigation after marking read
    } catch (error) {
      // Toast handled by hook
      window.location.href = url; // Still navigate even if marking read fails
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <BellIcon className="h-6 w-6 text-neutral-600 hover:text-primary-500 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive-500 text-caption font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between text-h6 font-semibold">
          Notifications
          {unreadCount > 0 && <Badge variant="default">{unreadCount} New</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoadingNotifications ? (
          <div className="p-4 text-center text-neutral-500">
            <LoadingSpinner size="sm" className="mr-2" /> Loading notifications...
          </div>
        ) : isErrorNotifications ? (
          <div className="p-4 text-center text-destructive-500">
            Error loading notifications.
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 text-body-sm">No new notifications.</div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => ( // Show top 5 recent notifications
              <DropdownMenuItem
                key={notification.id}
                className={cn("flex cursor-pointer items-start space-x-3 py-3", !notification.isRead && "bg-primary-50")}
                onClick={() => handleNotificationClick(notification.id, notification.url)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationShortIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className={cn("text-body-sm", !notification.isRead && "font-medium text-primary-800")}>
                    {notification.message}
                  </p>
                  <p className="text-caption text-neutral-500 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications" className="flex justify-center text-body-sm text-primary-500 hover:text-primary-600 cursor-pointer py-2">
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