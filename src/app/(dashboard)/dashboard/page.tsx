
'use client';

import { getSettings } from '@/ai/flows/settings-management';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import { DashboardClient } from './_components/DashboardClient';
import { useEffect, useState } from 'react';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Plan } from '@/ai/flows/settings-management.types';
import { type Announcement } from '@/ai/flows/announcement-flow.types';
import { Logo } from '@/components/common/Logo';
import { Loader2 } from 'lucide-react';

// This is a Server Component and will fetch its own data.
export default function UserDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    profile: DocumentData | null,
    plan: Plan | null,
    announcements: Announcement[],
    stats: { toolsUsed: number, referrals: number }
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const getDashboardData = async (uid: string) => {
          const settings = await getSettings();
          const userDocRef = doc(db, "users", uid);
          const referralsQuery = query(collection(db, "users"), where("referredBy", "==", uid));
          const activityQuery = query(collection(db, `users/${uid}/activity`), where('type', '==', 'tool_usage'));

          const [userDocSnap, fetchedAnnouncements, referralsSnapshot, activitySnapshot] = await Promise.all([
            getDoc(userDocRef),
            getAnnouncementsForUser(uid),
            getDocs(referralsQuery),
            getDocs(activityQuery),
          ]);
        
          const userData = userDocSnap.exists() ? userDocSnap.data() : null;
          
          const serializableProfile = userData ? {
              ...userData,
              createdAt: (userData.createdAt as Timestamp)?.toDate().toISOString() || null,
              lastActive: (userData.lastActive as Timestamp)?.toDate().toISOString() || null,
              subscriptionEndDate: (userData.subscriptionEndDate as Timestamp)?.toDate().toISOString() || null,
              referralRequestDate: (userData.referralRequestDate as Timestamp)?.toDate().toISOString() || null,
          } : null;
      
          const userPlan = settings.plan?.plans.find(p => p.id === userData?.planId) || settings.plan?.plans.find(p => p.id === 'free') || null;
        
          const stats = {
            toolsUsed: activitySnapshot.size,
            referrals: referralsSnapshot.size,
          };
        
          setDashboardData({
            profile: serializableProfile,
            plan: userPlan,
            announcements: fetchedAnnouncements,
            stats: stats,
          });
          setLoading(false);
        };
        getDashboardData(user.uid);
    }
  }, [user]);

  if (loading || !dashboardData) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background">
            <Logo className="h-16 w-16 animate-pulse" />
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-lg">Loading...</p>
            </div>
        </div>
      );
  }
  
  const welcomeMessage = dashboardData.profile?.firstName ? `Welcome Back, ${dashboardData.profile.firstName}!` : "User Dashboard";

  return (
    <DashboardClient 
        welcomeMessage={welcomeMessage}
        profile={dashboardData.profile}
        plan={dashboardData.plan}
        stats={dashboardData.stats}
        announcements={dashboardData.announcements}
        uid={user!.uid}
    />
  );
}
