'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/zustand';
import { toast } from 'sonner';

interface MessageInputProps {
  taskId: string;
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export function MessageInput({ taskId, onSendMessage, onTypingStart, onTypingStop }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to send messages.');
      return;
    }
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      onTypingStop(); // Ensure typing stops after sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isAuthenticated || !user) return; // Only send typing if authenticated

    if (!typingTimeoutRef.current) {
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
      typingTimeoutRef.current = null;
    }, 3000); // Stop typing after 3 seconds of no input
  };

  return (
    <form onSubmit={handleSendMessage} className="flex w-full space-x-3">
      <Input
        type="text"
        placeholder="Type your message here..."
        value={message}
        onChange={handleInputChange}
        className="flex-1 rounded-lg border border-neutral-300 bg-background shadow-soft"
        disabled={!isAuthenticated || !user}
      />
      <Button type="submit" disabled={!message.trim() || !isAuthenticated || !user} className="shadow-primary group">
        <SendIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}