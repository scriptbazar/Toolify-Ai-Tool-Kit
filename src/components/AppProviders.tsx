
'use client';

import { usePathname } from 'next/navigation';
import { ChatWidget } from './common/ChatWidget';
import { cn } from '@/lib/utils';
import Header from './common/Header';
import Footer from './common/Footer';
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

  // If it's an authentication or maintenance page, render it without any layout.
  if (authRoutes.includes(pathname) || isMaintenanceRoute) {
    return <>{children}</>;
  }
  
  // If it's an admin route, render with the AdminLayout.
  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // If it's a user panel route, render with the UserPanelLayout.
  if (isUserPanelRoute) {
    return <UserPanelLayout>{children}</UserPanelLayout>;
  }

  // Otherwise, it's a public page. Render with the public layout.
  return (
    <PublicLayout>{children}</PublicLayout>
  );
}
