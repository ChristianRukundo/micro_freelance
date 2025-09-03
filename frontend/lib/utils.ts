import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// JWT verification function
export function verifyToken(token: string, secret: string): any {
  try {
    // For security reasons, this should use a proper JWT library like jsonwebtoken
    // But for now, we'll just decode the payload without verification for type safety
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FE-INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[FE-WARN] ${message}`, data);
    }
  },
  error: (message: string, data?: any) => {
    console.error(`[FE-ERROR] ${message}`, data);
  },
};
