import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

// This Route Handler acts as a proxy to the backend's refresh token endpoint.
export async function POST(req: NextRequest) {
  try {
    const backendApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

    // Convert Next.js Headers to a plain object for axios
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Forward the request to the backend's refresh-token endpoint.
    const response = await axios.post(`${backendApiBaseUrl}/auth/refresh-token`, {}, {
      withCredentials: true, // Crucial for sending cookies
      headers: headers, // Forward relevant headers
    });

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error refreshing token via Next.js API route:', error.response?.data || error.message);

    // Clear cookies if refresh fails to ensure a clean state
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to refresh token' },
      { status: error.response?.status || 500 }
    );
  }
}
