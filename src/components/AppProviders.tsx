
'use client';

import { usePathname } from 'next/navigation';
import UserPanelLayout from '@/app/dashboard/layout';
import AdminLayout from '@/app/admin/layout';
import PublicLayout from '@/app/(public)/layout';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  
  const authRoutes = ['/login', '/signup', '/admin/login', '/forgot-password'];
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
  const isMaintenanceRoute = pathname === '/maintenance';

  if (authRoutes.includes(pathname) || isMaintenanceRoute) {
    return <>{children}</>;
  }
  
  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (isUserPanelRoute) {
    return <UserPanelLayout>{children}</UserPanelLayout>;
  }

  return (
    <PublicLayout>{children}</PublicLayout>
  );
}
