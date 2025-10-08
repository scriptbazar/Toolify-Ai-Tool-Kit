
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // New Rule: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // The maintenance mode logic has been removed from here to prevent build errors.
  // This logic should be handled within page components or layouts if needed,
  // to avoid pulling server-side dependencies into the edge runtime.

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
