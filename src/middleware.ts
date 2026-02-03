import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // Rule 1: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Rule 2: Protect dashboard and admin routes
  const protectedPaths = [
    '/dashboard',
    '/usage-history',
    '/my-favorites',
    '/community-chat',
    '/my-media',
    '/my-tickets',
    '/manage-subscription',
    '/payment-history',
    '/affiliate-program',
    '/admin'
  ];

  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    // Only redirect if it's not a request for a session-login API
    if (!pathname.startsWith('/api/auth')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Optimize matcher to exclude all static assets and internal paths
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};
