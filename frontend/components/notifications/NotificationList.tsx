"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCard } from "@/components/cards/NotificationCard";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TriangleAlertIcon,
  BellOffIcon,
  CheckCheckIcon,
  MoveRightIcon,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/common/SkeletonLoaders";
import { motion } from "framer-motion";

export function NotificationList() {
  const {
    notifications,
    isLoadingNotifications,
    isErrorNotifications,
    errorNotifications,
    fetchNextPageNotifications,
    hasNextPageNotifications,
    isFetchingNextPageNotifications,
    markAllNotificationsAsRead,
    isMarkingAllNotificationsAsRead,
  } = useNotifications();

  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (
      inView &&
      hasNextPageNotifications &&
      !isFetchingNextPageNotifications &&
      !isLoadingNotifications
    ) {
      fetchNextPageNotifications();
    }
  }, [
    inView,
    hasNextPageNotifications,
    isFetchingNextPageNotifications,
    isLoadingNotifications,
    fetchNextPageNotifications,
  ]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      // Toast handled by hook
    }
  };

  const isEmpty = !isLoadingNotifications && notifications.length === 0;

  if (isErrorNotifications) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error loading notifications</AlertTitle>
        <AlertDescription>
          Failed to load notifications: {errorNotifications?.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-bold">Your Notifications</h3>
        {!isEmpty && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllNotificationsAsRead || isLoadingNotifications}
            className="shadow-soft dark:shadow-soft-dark group"
          >
            {isMarkingAllNotificationsAsRead ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckCheckIcon className="mr-2 h-4 w-4" />
            )}
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoadingNotifications && notifications.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BellOffIcon className="h-16 w-16 mb-4" />
          <h2 className="text-h3">No new notifications.</h2>
          <p className="text-body-md">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
          {isFetchingNextPageNotifications && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" className="mr-2" /> Loading more
              notifications...
            </div>
          )}
          {hasNextPageNotifications && !isFetchingNextPageNotifications && (
            <div ref={ref} className="flex justify-center py-4">
              <Button
                onClick={() => fetchNextPageNotifications()}
                disabled={isFetchingNextPageNotifications}
                variant="outline"
                className="shadow-soft dark:shadow-soft-dark group"
              >
                Load More{" "}
                <MoveRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
