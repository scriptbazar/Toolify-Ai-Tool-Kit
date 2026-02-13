
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // Rule 1: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Rule 2: Protect dashboard and settings routes
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
    '/settings', 
  ];

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // If trying to access an ADMIN route without a session, redirect to ADMIN login
  if (isAdminRoute && !session && pathname !== '/admin/login') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
  }

  // If trying to access a protected route without a session, redirect to PUBLIC login
  if (isProtectedRoute && !session && pathname !== '/login') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectUrl', pathname);
      return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Optimized matcher
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};
