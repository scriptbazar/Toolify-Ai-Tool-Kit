import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // 1. Redirect root admin to dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 2. Define protected paths
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

  // 3. Handle Unauthorized Admin Access
  if (isAdminRoute && !session && pathname !== '/admin/login') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
  }

  // 4. Handle Unauthorized User Access
  if (isProtectedRoute && !session && pathname !== '/login') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectUrl', pathname);
      return NextResponse.redirect(loginUrl);
  }

  // 5. Prevent double login (If session exists, don't show login pages)
  if (session && (pathname === '/login' || pathname === '/admin/login')) {
      const target = pathname.startsWith('/admin') ? '/admin/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Optimized matcher to exclude static assets
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};
