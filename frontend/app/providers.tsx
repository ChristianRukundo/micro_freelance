'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/components/layouts/AuthProvider';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryStreamedHydration>
            {children}
          </ReactQueryStreamedHydration>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}