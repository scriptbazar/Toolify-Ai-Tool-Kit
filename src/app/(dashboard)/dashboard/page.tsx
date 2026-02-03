'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getSettings } from '@/ai/flows/settings-management';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import { DashboardClient } from './_components/DashboardClient';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppSettings } from '@/ai/flows/settings-management.types';
import type { Announcement } from '@/ai/flows/announcement-flow.types';
import { Loader2 } from 'lucide-react';

/**
 * User Dashboard Page - Client Component
 * Handles data fetching for the dashboard overview.
 */
export default function UserDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ toolsUsed: 0, referrals: 0 });
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [settingsData, annData, referralsSnapshot, activitySnapshot] = await Promise.all([
          getSettings(),
          getAnnouncementsForUser(user.uid),
          getDocs(query(collection(db, "users"), where("referredBy", "==", user.uid))),
          getDocs(query(collection(db, `users/${user.uid}/activity`), where('type', '==', 'tool_usage'))),
        ]);

        setSettings(settingsData);
        setAnnouncements(annData);
        setStats({
          toolsUsed: activitySnapshot.size,
          referrals: referralsSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setIsDataLoading(false);
    }
  }, [user, authLoading]);

  // Loading State
  if (authLoading || (isDataLoading && user)) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Not Logged In Fallback (Middleware should prevent this, but we handle it just in case)
  if (!user) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const userPlan = settings?.plan?.plans.find(p => p.id === userData?.planId) || 
                   settings?.plan?.plans.find(p => p.id === 'free') || null;

  const serializableProfile = userData ? {
    ...userData,
    createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt || null,
    lastActive: userData.lastActive?.toDate?.()?.toISOString() || userData.lastActive || null,
  } : null;

  return (
    <DashboardClient 
        welcomeMessage={userData?.firstName ? `Welcome Back, ${userData.firstName}!` : "User Dashboard"}
        profile={serializableProfile}
        plan={userPlan}
        stats={stats}
        announcements={announcements}
        uid={user.uid}
    />
  );
}