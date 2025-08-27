
'use client';

import { usePathname } from 'next/navigation';
import { ChatWidget } from './common/ChatWidget';
import { cn } from '@/lib/utils';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const authRoutes = ['/login', '/signup', '/admin/login', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  const isAdminRoute = pathname.startsWith('/admin');
  
  const isUserPanelRoute = [
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
  ].some(route => pathname.startsWith(route));

  const showPublicLayout = !isAuthRoute && !isAdminRoute && !isUserPanelRoute;

  return (
    <div className={cn(showPublicLayout && "relative flex min-h-screen flex-col")}>
      {children}
      {/* Show chat widget on non-admin pages */}
      {!isAdminRoute && <ChatWidget />}
    </div>
  );
}
