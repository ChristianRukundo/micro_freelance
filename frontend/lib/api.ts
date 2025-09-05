// frontend/lib/api.ts
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending cookies from the browser
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR (CORRECTED) ---

api.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    
    const cookieStore = await cookies(); 
    
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (accessToken) {
      config.headers.Cookie = `accessToken=${accessToken}${refreshToken ? `; refreshToken=${refreshToken}` : ''}`;
    }
  }

  return config;
});


// --- RESPONSE INTERCEPTOR (Error Handling) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if running in a browser environment before calling toast
    const isBrowser = typeof window !== 'undefined';

    const message = error.response?.data?.message || error.message;
    const status = error.response?.status;

    if (isBrowser) {
        // --- Client-side Toast Logic ---
        if (status === 401) {
          console.error('Unauthorized API call:', message);
          // Avoid showing generic toast if a specific component handles the redirect
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please log in again.');
          }
        } else if (status === 403) {
          console.error('Forbidden API call:', message);
          toast.error('You do not have permission to perform this action.');
        } else if (status === 404) {
          console.error('Not Found API call:', message);
          toast.error('Resource not found.');
        } else if (status === 429) {
          console.error('Rate Limit Exceeded:', message);
          toast.error('Too many requests. Please try again later.');
        } else if (status >= 500) {
          console.error('Server Error:', message);
          toast.error('A server error occurred. Please try again.');
        } else if (status >= 400) {
          console.error('Client Error:', message);
          try {
            // Handle Zod validation errors from the backend
            const errorDetails = JSON.parse(message);
            if (Array.isArray(errorDetails)) {
              errorDetails.forEach((err: { path: string; message: string }) => {
                toast.error(`${err.path}: ${err.message}`);
              });
            } else {
              toast.error(message);
            }
          } catch (e) {
            // Not a JSON error, show the plain message
            toast.error(message);
          }
        } else {
          toast.error('An unexpected error occurred.');
        }
    } else {
        // Log errors on the server side (e.g., during Server Actions)
        console.error(`[API Interceptor - Server] Status: ${status}, Message: ${message}`);
    }

    return Promise.reject(error);
  },
);

export default api;