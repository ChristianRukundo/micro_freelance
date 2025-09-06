// File: frontend/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function verifyToken(token: string, secret: string): any {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FE-DEBUG] ${message}`, data || '');
    }
  },
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[FE-INFO] ${message}`, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[FE-WARN] ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    console.error(`[FE-ERROR] ${message}`, data || '');
  },
};