import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

// This Route Handler acts as a proxy to the backend's refresh token endpoint.
// It helps in scenarios where a client-side component needs to initiate a refresh,
// but the refresh token is httpOnly and cannot be accessed by client-side JavaScript.
export async function POST(req: NextRequest) {
  try {
    const backendApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

    // Forward the request to the backend's refresh-token endpoint.
    // Axios will automatically include the httpOnly refresh token cookie if sent from the browser.
    const response = await axios.post(`${backendApiBaseUrl}/auth/refresh-token`, {}, {
      withCredentials: true, // Crucial for sending cookies
      headers: req.headers, // Forward relevant headers if any
    });

    // The backend's /auth/refresh-token endpoint should set new access/refresh tokens as httpOnly cookies
    // The browser will handle these cookies automatically. We just pass through the response.

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        // If the backend sets new cookies via `Set-Cookie` header, ensure they are passed through
        // Next.js handles Set-Cookie headers in Route Handlers automatically.
        // It's good practice to log if needed
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error refreshing token via Next.js API route:', error.response?.data || error.message);

    // Clear cookies if refresh fails to ensure a clean state
    cookies().delete('accessToken');
    cookies().delete('refreshToken');

    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to refresh token' },
      { status: error.response?.status || 500 }
    );
  }
}