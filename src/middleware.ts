
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // Rule 1: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Handle route conflict for settings
  if (pathname === '/settings/profile') {
      return NextResponse.next();
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

  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
