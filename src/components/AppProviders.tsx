
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { ChatWidget } from './common/ChatWidget';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoutes = ['/login', '/signup', '/admin/login'];
  const isAdminRoute = pathname.startsWith('/admin');
  
  // New user panel routes that should not have the default header/footer
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
  const isUserPanelRoute = userPanelRoutes.includes(pathname);

  const showHeaderFooter = !authRoutes.includes(pathname) && !isAdminRoute && !isUserPanelRoute;

  return (
    <div className="relative flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      <div className="flex-1">{children}</div>
      {showHeaderFooter && <Footer />}
      {showHeaderFooter && <ChatWidget />}
    </div>
  );
}
