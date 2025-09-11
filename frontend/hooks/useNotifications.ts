import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import api from "@/lib/api";
import { Notification, NotificationType, PaginatedResponse } from "@/lib/types";
import { toast } from "sonner";
import React, { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/zustand"; // To get current user for socket connection
import { logger } from "@/lib/utils";

interface NotificationsPaginatedResponse
  extends PaginatedResponse<Notification> {
  notifications: Notification[];
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  // --- Socket.IO for Real-time Notifications ---
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user?.id) {
      return;
    }

    if (!socketRef.current) {
      logger.info("useNotifications: Initializing Socket.IO connection.");

      // Revert to the simple initialization. Let the browser handle the cookie.
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_BASE_URL!, {
        withCredentials: true,
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        logger.info("Socket.IO connected for notifications:", {
          socketId: socketRef.current?.id,
        });
      });

      socketRef.current.on("new_notification", (notification: Notification) => {
        logger.info("Received new notification via socket:", { notification });
        toast.info(notification.message, {
          action: {
            label: "View",
            onClick: () => (window.location.href = notification.url),
          },
        });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notificationsCount"] });
      });

      socketRef.current.on("disconnect", (reason) => {
        logger.info("Socket.IO disconnected for notifications", { reason });
        socketRef.current = null;
      });

      socketRef.current.on("connect_error", (error) => {
        logger.error("Socket.IO notification error:", { error: error.message });
      });
    }

    return () => {
      if (socketRef.current) {
        logger.info("useNotifications: Disconnecting socket on cleanup.");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, isAuthLoading, user?.id, queryClient]);
  // --- TanStack Query for Historical Notifications ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<NotificationsPaginatedResponse, Error>({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: 10 };
      const response = await api.get("/notifications", { params });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: isAuthenticated,
  });

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  // Query for unread notification count
  const { data: unreadCount } = useQuery<number, Error>({
    queryKey: ["notificationsCount"],
    queryFn: async () => {
      const response = await api.get("/notifications", {
        params: { isRead: false, limit: 1 },
      }); // Just need count
      return response.data.data.totalNotifications;
    },
    enabled: isAuthenticated,
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });

  // Mutation to mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.patch(`/notifications/${notificationId}/read`),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications =
        queryClient.getQueryData<NotificationsPaginatedResponse>([
          "notifications",
        ]);
      queryClient.setQueryData<NotificationsPaginatedResponse>(
        ["notifications"],
        (old) => {
          if (!old) return old;
          const newPages = (old as any).pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((n: any) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          }));
          return { ...old, pages: newPages };
        }
      );
      // Decrement unread count optimistically
      queryClient.setQueryData(["notificationsCount"], (old: any) =>
        old !== undefined && old > 0 ? old - 1 : 0
      );
      return { previousNotifications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error, _variables, context) => {
      toast.error("Failed to mark notification as read.");
      queryClient.setQueryData(
        ["notifications"],
        context?.previousNotifications
      ); // Rollback
      queryClient.invalidateQueries({ queryKey: ["notificationsCount"] }); // Ensure count is correct
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsCount"] });
      toast.success("All notifications marked as read.");
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read.");
    },
  });

  return {
    notifications,
    unreadCount: unreadCount || 0,
    isLoadingNotifications: isLoading,
    isErrorNotifications: isError,
    errorNotifications: error,
    fetchNextPageNotifications: fetchNextPage,
    hasNextPageNotifications: hasNextPage,
    isFetchingNextPageNotifications: isFetchingNextPage,
    markNotificationAsRead: markAsReadMutation.mutateAsync,
    isMarkingNotificationAsRead: markAsReadMutation.isPending,
    markAllNotificationsAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllNotificationsAsRead: markAllAsReadMutation.isPending,
  };
}
