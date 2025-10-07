
import { getSettings } from '@/ai/flows/settings-management';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import { DashboardClient } from './_components/DashboardClient';
import { unstable_cache as cache } from 'next/cache';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { Timestamp, getCountFromServer, type DocumentData } from 'firebase-admin/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
  
    const userData = userDocSnap.exists ? userDocSnap.data() : null;
    
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

// Helper function to get user from cookie, specific to this Server Component
async function getPageUser(): Promise<FirebaseUser | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const adminAuth = getAdminAuth();
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken as unknown as FirebaseUser;
    } catch (error) {
        return null;
    }
}

// This is a Server Component and will fetch its own data.
export default async function UserDashboard() {
  const user = await getPageUser();
  
  if (!user) {
    // This should not happen if the layout's redirect works, but it's a safeguard.
    redirect('/login');
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
