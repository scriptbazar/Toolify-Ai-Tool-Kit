
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the session cookie
    await cookies().set('session', '', {
      maxAge: -1,
      path: '/',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session logout error:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
