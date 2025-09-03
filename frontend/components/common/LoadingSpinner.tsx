'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string; // Tailwind color class e.g. 'text-primary-500'
}

export function LoadingSpinner({ size = 'md', className, color = 'text-primary-500' }: LoadingSpinnerProps) {
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }[size];

  return (
    <motion.div
      className={cn('inline-block rounded-full border-2 border-current border-t-transparent animate-spin', spinnerSize, color, className)}
      role="status"
      aria-label="Loading..."
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      transition={{
        duration: 0.8,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
}