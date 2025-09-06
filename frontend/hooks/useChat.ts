import { useAuthStore } from "@/lib/zustand";
import React, { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import api from "@/lib/api";

import { Message, User } from "@/lib/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/utils";

export interface ChatMessage extends Message {
  sender: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface ChatPaginatedResponse {
  messages: Message[];
  totalMessages: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

const getAccessTokenFromCookie = (): string => {
  if (typeof document === "undefined") return "";
  const name = "accessToken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

export function useChat(taskId?: string) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isSocketConnecting, setIsSocketConnecting] = useState(false);
  const queryClient = useQueryClient();
  const [socketError, setSocketError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: errorHistory,
    refetch,
  } = useInfiniteQuery<
    ChatPaginatedResponse,
    Error,
    InfiniteData<ChatPaginatedResponse>,
    ["chatMessages", string | undefined],
    number
  >({
    queryKey: ["chatMessages", taskId],
    queryFn: async ({ pageParam = 1 }) => {
      logger.info(
        `useChat: queryFn triggered. TaskId: ${taskId}, Page: ${pageParam}, Authenticated: ${isAuthenticated}, AuthLoading: ${isAuthLoading}, SocketConnecting: ${isSocketConnecting}`
      );

      if (!taskId) {
        logger.warn(
          "useChat: queryFn called with no taskId. Throwing error to prevent API call."
        );
        throw new Error("Task ID is required to fetch chat messages.");
      }

      const response = await api.get(`/messages/tasks/${taskId}`, {
        params: { page: pageParam, limit: 20 },
      });
      logger.info(
        `useChat: API responded for chat history. TaskId: ${taskId}, Status: ${response.status}`
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage: ChatPaginatedResponse) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled:
      !!taskId && isAuthenticated && !isAuthLoading && !isSocketConnecting,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  const historicalMessages = data?.pages.flatMap((page) => page.messages) || [];


  
 
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !taskId) {
      return;
    }

    // FIX: This pattern is robust against React Strict Mode's double invocation.
    // The socket instance is created only once and stored in the ref.
    if (!socketRef.current) {
        logger.info("useChat: Initializing Socket.IO connection.", { taskId });
        setIsSocketConnecting(true);
        setSocketError(null);

        socketRef.current = io(process.env.NEXT_PUBLIC_WS_BASE_URL!, {
            withCredentials: true,
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            logger.info('Socket.IO connected for chat.', { socketId: socketRef.current?.id });
            setIsSocketConnecting(false);
            socketRef.current?.emit('join_room', taskId);
        });
        
        socketRef.current.on('receive_message', (message: ChatMessage) => {
          queryClient.setQueryData(['chatMessages', taskId], (oldData: any) => {
              if (!oldData || !oldData.pages) return { pages: [{ messages: [message] }] };
              const newPages = [...oldData.pages];
              const lastPageIndex = newPages.length - 1;
              
              // Ensure the last page's messages array exists
              if (!newPages[lastPageIndex].messages) {
                  newPages[lastPageIndex].messages = [];
              }
              
              newPages[lastPageIndex].messages.push(message);
              return { ...oldData, pages: newPages };
          });
        });

        socketRef.current.on('connect_error', (err) => {
            logger.error('Socket.IO connection error:', { message: err.message });
            setSocketError(err.message);
            setIsSocketConnecting(false);
            if (err.message.includes('Authentication error')) {
                toast.error('Authentication token missing for real-time chat. Please refresh or log in again.');
            }
        });

        socketRef.current.on('disconnect', (reason) => {
            logger.info('Socket.IO disconnected for chat', { reason });
            setIsSocketConnecting(false);
            socketRef.current = null; // Allow reconnection on next render
        });
    }

    // The cleanup function will run when the component unmounts for real,
    // or when the dependencies (like taskId) change.
    return () => {
      if (socketRef.current) {
        logger.info("useChat: Disconnecting socket on cleanup.");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, isAuthLoading, taskId, queryClient]);
  const sendMessage = useCallback(
    (content: string) => {
      if (!isAuthenticated || !user?.id) {
        toast.error("You must be logged in to send messages.");
        return;
      }
      if (isSocketConnecting) {
        toast.info("Connecting to chat... please wait a moment.");
        return;
      }
      if (socketRef.current && taskId && socketRef.current.connected) {
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
            isSuspended: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: user.profile || {
              id: user.id,
              firstName: user.firstName || user.email!.split("@")[0],
              lastName: user.lastName || "",
              avatarUrl: user.avatarUrl,
              bio: null,
              skills: [],
              portfolioLinks: [],
            },
          },
        };
        setLiveMessages((prevMessages) => [...prevMessages, tempMessage]);
        socketRef.current.emit("send_message", { taskId, content });
        logger.info("useChat: Sent message via socket.emit.", {
          taskId,
          contentPreview: content.substring(0, 50),
        });
      } else {
        logger.warn(
          "useChat: Attempted to send message but socket is not connected.",
          {
            socketConnected: socketRef.current?.connected,
            taskId,
            userId: user?.id,
          }
        );
        toast.error(
          "Real-time chat is not connected. Please refresh the page or check your internet connection."
        );
      }
    },
    [isAuthenticated, taskId, user, isSocketConnecting]
  );

  const sendTypingStart = useCallback(() => {
    if (socketRef.current && taskId && socketRef.current.connected) {
      socketRef.current.emit("typing_start", taskId);
    }
  }, [taskId]);

  const sendTypingStop = useCallback(() => {
    if (socketRef.current && taskId && socketRef.current.connected) {
      socketRef.current.emit("typing_stop", taskId);
    }
  }, [taskId]);

  const messages = React.useMemo(() => {
    const merged = [
      ...(historicalMessages as ChatMessage[]),
      ...liveMessages,
    ].reduce((acc, msg) => {
      if (!acc.has(msg.id)) {
        acc.set(msg.id, msg);
      }
      return acc;
    }, new Map<string, ChatMessage>());

    return Array.from(merged.values()).sort(
      (a: ChatMessage, b: ChatMessage) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
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
    refetchHistory: refetch,
    isSocketConnecting,
    socketError,
    isSocketConnected: socketRef.current?.connected,
  };
}
