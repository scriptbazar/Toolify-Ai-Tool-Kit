
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Middleware is running in the edge runtime.
// It cannot access Node.js APIs or packages that rely on them (like firebase-admin).
// The maintenance mode logic has been removed to prevent crashes.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // New Rule: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // This matcher applies the middleware to all routes except for static files
    // and Next.js internal paths.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
