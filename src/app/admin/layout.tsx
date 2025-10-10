
'use client';

import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { AuthContextProvider } from '@/context/AuthContext';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <FirebaseErrorListener />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AuthContextProvider>
  );
}
