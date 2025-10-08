
'use client';

import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/common/Logo';
import { Loader2 } from 'lucide-react';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <Logo className="h-16 w-16 animate-pulse" />
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-lg">Loading...</p>
            </div>
        </div>
    );
  }

  return (
      <AdminLayoutClient user={user} userData={userData}>
        {children}
      </AdminLayoutClient>
  );
}
