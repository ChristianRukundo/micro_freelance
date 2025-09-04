import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Clear the authentication cookies (accessToken and refreshToken)
    const cookieStore = await cookies();
    cookieStore.set('accessToken', '', { expires: new Date(0), path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    cookieStore.set('refreshToken', '', { expires: new Date(0), path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ success: false, message: 'Failed to log out' }, { status: 500 });
  }
}
