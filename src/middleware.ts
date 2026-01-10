
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminAuth } from './lib/firebase-admin';

// NOTE: Middleware is running in the edge runtime.
// It cannot access Node.js APIs or packages that rely on them (like firebase-admin).

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('session')?.value;

  // Rule 1: Redirect from /admin or /admin/ to /admin/dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // If there's no session cookie, allow access only to public pages
  if (!sessionCookie) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/my-')) {
       return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // If there is a session cookie, verify it
  try {
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const isAdmin = decodedClaims.role === 'admin';

    // Rule 2: If user is an admin, allow access to /admin routes
    if (pathname.startsWith('/admin')) {
      if (!isAdmin) {
        // Not an admin, redirect away from admin panel
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Rule 3: If user is logged in, redirect away from login/signup
    if (['/login', '/signup', '/admin/login'].includes(pathname)) {
        return NextResponse.redirect(new URL(isAdmin ? '/admin/dashboard' : '/dashboard', request.url));
    }
    
    // Rule 4: If a logged-in user tries to access a non-admin, non-dashboard page, let them through
    return NextResponse.next();

  } catch (error) {
    // Session cookie is invalid. Clear it and redirect to login.
    console.error("Middleware Auth Error:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session', '', { maxAge: -1, path: '/' });
    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
