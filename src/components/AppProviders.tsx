
'use client';

import { usePathname } from 'next/navigation';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoutes = ['/login', '/signup', '/admin/login', '/forgot-password'];
  const isAdminRoute = pathname.startsWith('/admin');
  
  const userPanelRoutes = [
    '/dashboard',
    '/profile',
    '/manage-subscription',
    '/payment-history',
    '/settings',
    '/usage-history',
    '/login-history',
    '/my-media',
    '/refer-a-friend',
    '/my-tickets',
    '/create-ticket',
    '/community-chat',
  ];

  const isDashboardRoute = (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/manage-subscription') ||
    pathname.startsWith('/payment-history') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/usage-history') ||
    pathname.startsWith('/login-history') ||
    pathname.startsWith('/my-media') ||
    pathname.startsWith('/refer-a-friend') ||
    pathname.startsWith('/my-tickets') ||
    pathname.startsWith('/create-ticket') ||
    pathname.startsWith('/community-chat')
  )


  const showHeaderFooter = !authRoutes.includes(pathname) && !isAdminRoute && !isDashboardRoute;
  
  if (!showHeaderFooter) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
