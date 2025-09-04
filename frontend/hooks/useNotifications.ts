import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Notification, NotificationType, PaginatedResponse } from '@/lib/types';
import { toast } from 'sonner';
import React, { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/zustand'; // To get current user for socket connection

interface NotificationsPaginatedResponse extends PaginatedResponse<Notification> {
  notifications: Notification[];
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  // --- Socket.IO for Real-time Notifications ---
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !process.env.NEXT_PUBLIC_WS_BASE_URL) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server
    const socket = io(process.env.NEXT_PUBLIC_WS_BASE_URL, {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || ''}`,
      },
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected for notifications:', socket.id);
      // Join a personal room based on user ID
      socket.emit('join_room', user.id);
    });

    socket.on('new_notification', (notification: Notification) => {
      console.log('Received new notification via socket:', notification);
      toast.info(notification.message, {
        action: {
          label: 'View',
          onClick: () => window.location.href = notification.url,
        },
      });
      // Invalidate the notifications query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Update unread count immediately
      queryClient.setQueryData(['notificationsCount'], (old: any) => (old !== undefined ? old + 1 : 1));
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected for notifications');
    });

    socket.on('error', (error: string) => {
      console.error('Socket.IO error:', error);
      toast.error(`Real-time notification error: ${error}`);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, queryClient]);


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
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: 10 };
      const response = await api.get('/notifications', { params });
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
    queryKey: ['notificationsCount'],
    queryFn: async () => {
      const response = await api.get('/notifications', { params: { isRead: false, limit: 1 } }); // Just need count
      return response.data.data.totalItems;
    },
    enabled: isAuthenticated,
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });


  // Mutation to mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData<NotificationsPaginatedResponse>(['notifications']);
      queryClient.setQueryData<NotificationsPaginatedResponse>(['notifications'], (old) => {
        if (!old) return old;
        const newPages = (old as any).pages.map((page: any) => ({
          ...page,
          notifications: page.notifications.map((n: any) => (n.id === notificationId ? { ...n, isRead: true } : n)),
        }));
        return { ...old, pages: newPages };
      });
      // Decrement unread count optimistically
      queryClient.setQueryData(['notificationsCount'], (old: any) => (old !== undefined && old > 0 ? old - 1 : 0));
      return { previousNotifications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error, _variables, context) => {
      toast.error('Failed to mark notification as read.');
      queryClient.setQueryData(['notifications'], context?.previousNotifications); // Rollback
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] }); // Ensure count is correct
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
      toast.success('All notifications marked as read.');
    },
    onError: (error) => {
      toast.error('Failed to mark all notifications as read.');
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