import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware runs on the edge runtime.
 * It protects dashboard and admin routes based on the session cookie.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // Rule 1: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Rule 2: Protect dashboard and admin routes
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/usage-history') || pathname.startsWith('/my-favorites') || pathname.startsWith('/community-chat') || pathname.startsWith('/my-media') || pathname.startsWith('/my-tickets') || pathname.startsWith('/manage-subscription') || pathname.startsWith('/payment-history') || pathname.startsWith('/affiliate-program') || pathname.startsWith('/settings');
  const isAdminRoute = pathname.startsWith('/admin');

  if ((isDashboardRoute || isAdminRoute) && !session) {
    // If trying to access protected route without a session, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};