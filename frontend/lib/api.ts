import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
          toast.error('Session expired. Please log in again.');
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
            const errorDetails = JSON.parse(message);
            if (Array.isArray(errorDetails)) {
              errorDetails.forEach((err: { path: string; message: string }) => {
                toast.error(`${err.path}: ${err.message}`);
              });
            } else {
              toast.error(message);
            }
          } catch (e) {
            toast.error(message);
          }
        } else {
          toast.error('An unexpected error occurred.');
        }
    } else {
        console.error(`[API Interceptor - Server] Status: ${status}, Message: ${message}`);
    }

    return Promise.reject(error);
  },
);

export default api;