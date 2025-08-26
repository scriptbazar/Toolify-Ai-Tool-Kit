
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoutes = ['/login', '/signup', '/admin/login'];
  const showHeaderFooter = !authRoutes.includes(pathname);

  return (
    <div className="relative flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      <main className="flex-1">{children}</main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
