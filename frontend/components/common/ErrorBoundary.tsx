'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TriangleAlertIcon, RefreshCcwIcon } from 'lucide-react';
import { logger } from '@/lib/utils'; 

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    
    return { hasError: true, error };
  }

  
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    
    logger.error('Client-side rendering error caught by Error Boundary:', { error, errorInfo });
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      
      return this.props.fallback || (
        <div className="flex min-h-[300px] items-center justify-center p-4">
          <Alert variant="destructive" className="w-full max-w-lg text-center">
            <TriangleAlertIcon className="mx-auto h-6 w-6" />
            <AlertTitle className="text-h4 font-bold mt-2">Something went wrong!</AlertTitle>
            <AlertDescription className="mt-2 text-body-md">
              We're sorry, an unexpected error occurred.
              {this.state.error && (
                <details className="mt-4 text-body-sm text-destructive-400">
                  <summary>Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-left text-xs">
                    {this.state.error.message || 'No message'}
                    {this.state.error.stack && `\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </AlertDescription>
            <Button onClick={() => window.location.reload()} className="mt-6">
              <RefreshCcwIcon className="mr-2 h-4 w-4" /> Reload Page
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}