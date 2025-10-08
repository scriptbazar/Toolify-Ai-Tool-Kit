'use client';

import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { useAuth } from '@/hooks/use-auth';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  return (
      <AdminLayoutClient user={user} userData={userData}>
        {children}
      </AdminLayoutClient>
  );
}
