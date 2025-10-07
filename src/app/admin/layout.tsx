
import { getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect, usePathname } from 'next/navigation';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

// This is a server-side layout that wraps the client-side logic
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionCookie = cookies().get('session')?.value;
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  
  let user = null;
  let isAdmin = false;
  if (!isLoginPage) {
      if (!sessionCookie) {
        redirect('/admin/login');
      }

      try {
        const adminAuth = getAdminAuth();
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        user = decodedToken;
        isAdmin = true; // Simplified check for this app
      } catch (error) {
        redirect('/admin/login');
      }
  }
  
  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
