import { useAuthStore } from '@/lib/zustand';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import api from '@/lib/api'; // For fetching historical messages
import { Message, User } from '@/lib/types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ChatMessage extends Message {
  sender: User;
}

interface ChatPaginatedResponse {
  messages: ChatMessage[];
  totalMessages: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useChat(taskId?: string) {
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]); // For messages received in real-time
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // --- TanStack Query for Historical Messages (Infinite Scroll) ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: errorHistory,
  } = useInfiniteQuery<ChatPaginatedResponse, Error>({
    queryKey: ['chatMessages', taskId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!taskId) throw new Error('Task ID is required to fetch chat messages.');
      const response = await api.get(`/messages/tasks/${taskId}`, { params: { page: pageParam, limit: 20 } });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!taskId && isAuthenticated,
  });

  const historicalMessages = data?.pages.flatMap((page) => page.messages) || [];

  // --- Socket.IO for Real-time Chat ---
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !taskId || !process.env.NEXT_PUBLIC_WS_BASE_URL) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_BASE_URL, {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || ''}`,
      },
      query: { taskId }, // Pass task ID during connection
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected for chat:', socket.id);
      socket.emit('join_room', taskId);
    });

    socket.on('joined_room', (room: string) => {
      console.log(`Joined chat room: ${room}`);
    });

    socket.on('receive_message', (message: ChatMessage) => {
      console.log('Received message:', message);
      setLiveMessages((prevMessages) => [...prevMessages, message]);
      // Also invalidate the historical query to pick up new messages when refetching,
      // or append to query data directly if needed.
      queryClient.invalidateQueries({ queryKey: ['chatMessages', taskId] });
    });

    socket.on('typing_start', ({ userId: typingUserId }: { userId: string; taskId: string }) => {
      if (typingUserId !== user.id) { // Don't show typing for self
        setTypingUsers((prev) => new Set(prev).add(typingUserId));
      }
    });

    socket.on('typing_stop', ({ userId: typingUserId }: { userId: string; taskId: string }) => {
      if (typingUserId !== user.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(typingUserId);
          return newSet;
        });
      }
    });

    socket.on('error', (error: string) => {
      console.error('Socket.IO chat error:', error);
      toast.error(`Chat error: ${error}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected for chat');
      setTypingUsers(new Set()); // Clear typing users on disconnect
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setLiveMessages([]);
    };
  }, [isAuthenticated, user?.id, taskId, queryClient]);


  const sendMessage = useCallback((content: string) => {
    if (socketRef.current && taskId && user?.id) {
      const tempMessage: ChatMessage = {
        id: `temp-${Math.random()}`,
        content,
        createdAt: new Date(),
        senderId: user.id,
        taskId,
        sender: {
          id: user.id,
          email: user.email!,
          role: user.role!,
          profile: {
            id: user.id, // Assuming profile ID matches user ID for temp messages
            firstName: user.firstName || user.email!.split('@')[0],
            lastName: user.lastName || '',
            avatarUrl: user.avatarUrl,
            bio: null, skills: [], portfolioLinks: []
          }
        },
      };
      setLiveMessages((prevMessages) => [...prevMessages, tempMessage]); // Optimistic update for self
      socketRef.current.emit('send_message', { taskId, content });
    } else {
      toast.error('Chat not connected. Please refresh the page.');
    }
  }, [taskId, user]);

  const sendTypingStart = useCallback(() => {
    if (socketRef.current && taskId) {
      socketRef.current.emit('typing_start', taskId);
    }
  }, [taskId]);

  const sendTypingStop = useCallback(() => {
    if (socketRef.current && taskId) {
      socketRef.current.emit('typing_stop', taskId);
    }
  }, [taskId]);

  const messages = React.useMemo(() => {
    // Merge historical and live messages, ensuring unique IDs and sorting by date
    const merged = [...historicalMessages, ...liveMessages].reduce((acc, msg) => {
      if (!acc.has(msg.id)) {
        acc.set(msg.id, msg);
      }
      return acc;
    }, new Map<string, ChatMessage>());
    return Array.from(merged.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [historicalMessages, liveMessages]);


  return {
    messages,
    isLoadingHistory,
    isErrorHistory,
    errorHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    sendMessage,
    typingUsers,
    sendTypingStart,
    sendTypingStop,
  };
}