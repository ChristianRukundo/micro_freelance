'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/lib/zustand';
import { MessageInput } from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageSquareDashedIcon, CircleDotDashedIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlertIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '../ui/card';

interface ChatWindowProps {
  taskId: string;
}

export function ChatWindow({ taskId }: ChatWindowProps) {
  const { user } = useAuthStore();
  const {
    messages,
    isLoadingHistory,
    isErrorHistory,
    errorHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    typingUsers,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
  } = useChat(taskId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.5,
  });

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, liveMessages.length]); // Scroll when historical or live messages change


  // Load more messages when scroll area is near top AND loadMoreRef is in view
  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, isFetchingNextPage, fetchNextPage]);


  if (isLoadingHistory) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 shadow-soft">
        <LoadingSpinner size="lg" className="mr-3" />
        <span className="text-body-md text-neutral-600">Loading chat history...</span>
      </div>
    );
  }

  if (isErrorHistory) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error loading chat</AlertTitle>
        <AlertDescription>Failed to load chat history: {errorHistory?.message}</AlertDescription>
      </Alert>
    );
  }

  const sortedMessages = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <Card className="h-[500px] flex flex-col shadow-medium border-neutral-200">
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4 pb-0">
            {isFetchingNextPage && (
              <div className="flex justify-center p-2">
                <LoadingSpinner size="sm" className="mr-2" /> Loading old messages...
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <div ref={loadMoreRef} className="flex justify-center p-2">
                <Button onClick={() => fetchNextPage()} variant="outline" size="sm" className="shadow-soft">
                  Load More
                </Button>
              </div>
            )}
            {sortedMessages.map((message) => (
              <ChatMessage key={message.id} message={message} isCurrentUser={message.senderId === user?.id} />
            ))}
            <div ref={messagesEndRef} /> {/* For auto-scrolling to bottom */}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-neutral-200 p-4">
        <MessageInput taskId={taskId} onSendMessage={sendMessage} onTypingStart={sendTypingStart} onTypingStop={sendTypingStop} />
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-caption text-neutral-500 flex items-center"
          >
            <CircleDotDashedIcon className="h-3 w-3 mr-1 animate-pulse" />
            {Array.from(typingUsers).join(', ')} is typing...
          </motion.div>
        )}
      </CardFooter>
    </Card>
  );
}

interface ChatMessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const avatarSeed = message.sender?.profile?.firstName || message.sender?.email || 'User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-end gap-3',
        isCurrentUser ? 'justify-end' : 'justify-start',
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`} alt={avatarSeed} />
          <AvatarFallback>{avatarSeed.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'relative max-w-[70%] rounded-xl px-4 py-2 text-body-md shadow-sm',
          isCurrentUser
            ? 'rounded-br-none bg-primary-500 text-primary-foreground'
            : 'rounded-bl-none bg-neutral-100 text-neutral-900 border border-neutral-200',
        )}
      >
        <p className="font-medium text-caption mb-1">{message.sender?.profile?.firstName || 'Anonymous'}</p>
        <p>{message.content}</p>
        <span className={cn(
          'absolute bottom-1 right-2 text-caption opacity-80',
          isCurrentUser ? 'text-primary-50' : 'text-neutral-500'
        )}>
          {format(new Date(message.createdAt), 'HH:mm')}
        </span>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`} alt={avatarSeed} />
          <AvatarFallback>{avatarSeed.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}