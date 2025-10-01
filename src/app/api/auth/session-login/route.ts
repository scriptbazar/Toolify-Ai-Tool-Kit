
import { getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    // Set cookie policy for session cookie.
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Session login error:', error);
    return NextResponse.json({ error: 'Failed to create session cookie', details: error.message }, { status: 401 });
  }
}
