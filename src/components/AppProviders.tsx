
'use server';

import { headers } from 'next/headers';
import { ChatWidget } from './common/ChatWidget';
import { cn } from '@/lib/utils';
import Header from './common/Header';
import Footer from './common/Footer';

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

  // Determine if the public layout should be shown
  const isAuthPage = authRoutes.includes(pathname);
  const showPublicLayout = !isAuthPage && !isAdminRoute && !isUserPanelRoute;

  return (
    <div className={cn("relative flex min-h-screen flex-col")}>
      {showPublicLayout && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && !isUserPanelRoute && !isAuthPage && <ChatWidget />}
      {showPublicLayout && <Footer />}
    </div>
  );
}
