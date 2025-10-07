

import { getSettings } from '@/ai/flows/settings-management';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import { DashboardClient } from './_components/DashboardClient';
import { unstable_cache as cache } from 'next/cache';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp, getCountFromServer, type DocumentData } from 'firebase-admin/firestore';
import type { User as FirebaseUser } from 'firebase/auth';


const getDashboardData = cache(async (uid: string) => {
    const adminDb = getAdminDb();
    const settings = await getSettings(); // Fetch settings outside to leverage its own cache
    
    const userDocRef = adminDb.collection("users").doc(uid);
    const referralsQuery = adminDb.collection("users").where("referredBy", "==", uid);
    const activityQuery = adminDb.collection(`users/${uid}/activity`).where('type', '==', 'tool_usage');

    const [userDocSnap, fetchedAnnouncements, referralsCountSnap, activityCountSnap] = await Promise.all([
      userDocRef.get(),
      getAnnouncementsForUser(uid),
      getCountFromServer(referralsQuery),
      getCountFromServer(activityQuery),
    ]);
  
    const userData = userDocSnap.exists() ? userDocSnap.data() : null;
    
    // Convert Firestore Timestamps to serializable format (ISO strings)
    const serializableProfile = userData ? {
        ...userData,
        createdAt: (userData.createdAt as Timestamp)?.toDate().toISOString() || null,
        lastActive: (userData.lastActive as Timestamp)?.toDate().toISOString() || null,
        subscriptionEndDate: (userData.subscriptionEndDate as Timestamp)?.toDate().toISOString() || null,
        referralRequestDate: (userData.referralRequestDate as Timestamp)?.toDate().toISOString() || null,
    } : null;

    const userPlan = settings.plan?.plans.find(p => p.id === userData?.planId) || settings.plan?.plans.find(p => p.id === 'free') || null;
  
    const stats = {
      toolsUsed: activityCountSnap.data().count,
      referrals: referralsCountSnap.data().count,
    };
  
    return {
      profile: serializableProfile,
      plan: userPlan,
      announcements: fetchedAnnouncements,
      stats: stats,
    };
  }, ['dashboard-data'], { revalidate: 300 }); // Cache for 5 minutes


// This page now receives user and userData from the server-side layout
export default async function UserDashboard(props: { user: FirebaseUser, userData: DocumentData | null }) {
  const { user } = props;
  
  // Ensure user object exists before proceeding
  if (!user) {
    // This should theoretically not be reached if the layout redirects correctly,
    // but it's good practice for robustness.
    return <div>Please log in to view your dashboard.</div>;
  }
  
  const { profile, plan, announcements, stats } = await getDashboardData(user.uid);
  const welcomeMessage = profile?.firstName ? `Welcome Back, ${profile.firstName}!` : "User Dashboard";

  return (
    <DashboardClient 
        welcomeMessage={welcomeMessage}
        profile={profile as any}
        plan={plan as any}
        stats={stats}
        announcements={announcements}
        uid={user.uid}
    />
  );
}
