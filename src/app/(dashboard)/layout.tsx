
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayoutClient } from '@/app/(dashboard)/_components/DashboardLayoutClient';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/use-auth';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import type { Announcement } from '@/ai/flows/announcement-flow.types';

export default function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  
  React.useEffect(() => {
    if (!loading && user) {
        getAnnouncementsForUser(user.uid).then(setAnnouncements);
    }
  }, [user, loading]);

  // Middleware handles redirection for non-authenticated users.
  // This useEffect will handle cases where the auth state changes on the client-side.
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (isAdmin) {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, isAdmin, loading, router]);


  if (loading || !user || !userData || isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutClient user={user} userData={userData} initialAnnouncements={announcements}>
      {children}
    </DashboardLayoutClient>
  );
}

      