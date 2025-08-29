

'use server';

import { headers } from 'next/headers';
import { ChatWidget } from './common/ChatWidget';
import { cn } from '@/lib/utils';
import Header from './common/Header';
import Footer from './common/Footer';
import UserPanelLayout from '@/app/dashboard/layout';
import AdminLayout from '@/app/admin/layout';

export async function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = headers().get('x-next-pathname') || '';
  
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

  // If it's an authentication page, render it without any layout.
  if (authRoutes.includes(pathname)) {
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

  // Otherwise, it's a public page. Render with the public header, footer, and chat widget.
  return (
    <div className={cn("relative flex min-h-screen flex-col")}>
      <Header />
      <main className="flex-1">{children}</main>
      <ChatWidget />
      <Footer />
    </div>
  );
}
