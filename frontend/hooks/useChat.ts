import { useAuthStore } from "@/lib/zustand";
import React, { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import api from "@/lib/api";

import { Message, User } from "@/lib/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
  Updater,
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

/**
 * Retrieves a cookie by name from the browser's document.cookie.
 * This is a client-side utility.
 * @param name The name of the cookie to retrieve.
 * @returns The cookie value or undefined if not found.
 */
const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
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

    if (!socketRef.current) {
      logger.info("useChat: Initializing Socket.IO connection.");
      setIsSocketConnecting(true);
      setSocketError(null);

      // Revert to the simple initialization. The browser will handle attaching the HttpOnly cookie.
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_BASE_URL!, {
        withCredentials: true, // This is the key.
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        logger.info("Socket.IO connected for chat.", {
          socketId: socketRef.current?.id,
        });
        setIsSocketConnecting(false);
        socketRef.current?.emit("join_room", taskId);
      });

      socketRef.current.on("receive_message", (newMessage: ChatMessage) => {
        logger.info("Received new message via socket", { message: newMessage });
        queryClient.setQueryData<InfiniteData<ChatPaginatedResponse>>(
          ["chatMessages", taskId],
          (oldData) => {
            if (!oldData) {
              return {
                pages: [
                  {
                    messages: [newMessage],
                    currentPage: 1,
                    totalPages: 1,
                    totalMessages: 1,
                    limit: 20,
                  },
                ],
                pageParams: [1],
              };
            }
            const newData = { ...oldData, pages: [...oldData.pages] };
            const lastPageIndex = newData.pages.length - 1;
            newData.pages[lastPageIndex] = {
              ...newData.pages[lastPageIndex],
              messages: [...newData.pages[lastPageIndex].messages, newMessage],
            };
            return newData;
          }
        );
      });

      socketRef.current.on("connect_error", (err) => {
        logger.error("Socket.IO connection error:", { message: err.message });
        setSocketError(err.message);
        setIsSocketConnecting(false);
        if (err.message.includes("Authentication error")) {
          toast.error(
            "Authentication failed for real-time chat. Please refresh the page."
          );
        }
      });

      socketRef.current.on("disconnect", (reason) => {
        logger.info("Socket.IO disconnected for chat", { reason });
        setIsSocketConnecting(false);
        socketRef.current = null;
      });
    }

    return () => {
      if (socketRef.current) {
        logger.info("useChat: Disconnecting socket on cleanup.");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, isAuthLoading, taskId, queryClient]);

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

  const sendMessage = useCallback(
    (content: string) => {
      if (socketRef.current?.connected && taskId) {
        socketRef.current.emit("send_message", { taskId, content });
      } else {
        toast.error("Chat is not connected. Please wait or refresh the page.");
      }
    },
    [taskId]
  );

  const messages = data?.pages.flatMap((page) => page.messages) || [];

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
