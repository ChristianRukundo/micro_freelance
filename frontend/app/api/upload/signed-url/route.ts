import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';

const requestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  folder: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    const backendApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

    // Forward the request to your backend to get the S3 pre-signed URL
    const response = await axios.post(`${backendApiBaseUrl}/uploads/signed-url`, validatedData, {
      withCredentials: true, // Important if your backend needs auth for this endpoint
      headers: {
        'Content-Type': 'application/json',
        // Forward any necessary auth headers from the incoming NextRequest if needed
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching signed URL:', error.response?.data || error.message);
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to get signed URL' },
      { status: error.response?.status || 500 }
    );
  }
}