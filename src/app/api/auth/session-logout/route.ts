
import { cookies } from 'next/headers';
import { type NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the session cookie
    await cookies().set('session', '', {
      maxAge: -1,
      path: '/',
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Session logout error:', error);
    return Response.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
