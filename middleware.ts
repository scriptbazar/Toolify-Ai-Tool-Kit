
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSettings } from '@/ai/flows/settings-management';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths to exclude from maintenance mode redirection.
  // This allows the admin panel and the maintenance page itself to be accessible.
  const excludedPaths = [
    '/maintenance',
    '/admin', // This will match /admin and any sub-path like /admin/login
  ];

  // Check if the current path starts with any of the excluded paths.
  if (excludedPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    const settings = await getSettings();
    const securitySettings = settings.general?.security;

    if (securitySettings?.maintenanceMode) {
      const now = new Date();
      const until = securitySettings.maintenanceModeUntil 
        ? new Date(securitySettings.maintenanceModeUntil) 
        : null;

      // If there's an 'until' date and it has passed, don't redirect.
      // In a real app, a background job would be better to toggle `maintenanceMode` off.
      // For now, this prevents users from being locked out if the time expires.
      if (until && now > until) {
        return NextResponse.next();
      }

      // If maintenance mode is active and the path is not excluded, redirect.
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  } catch (error) {
    // If settings can't be fetched, it's safer to let the request go through.
    console.error("Middleware error fetching settings:", error);
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
