

import { getSettings } from '@/ai/flows/settings-management';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import { DashboardClient } from './_components/DashboardClient';
import { getAdminAuth } from '@/lib/firebase-admin';
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Plan } from '@/ai/flows/settings-management.types';
import type { Announcement } from '@/ai/flows/announcement-flow.types';
import { cookies } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import type { DocumentData } from 'firebase/firestore';


export default async function UserDashboard() {
  noStore();
  const session = cookies().get('session')?.value || '';
  let uid = '';
  try {
    const decodedClaims = await getAdminAuth().verifySessionCookie(session, true);
    uid = decodedClaims.uid;
  } catch (error) {
    // Should be handled by middleware or layout, but as a fallback:
    return <p>Please log in to view your dashboard.</p>;
  }

  const [settings, userDocSnap, fetchedAnnouncements, referralsSnapshot, activitySnapshot] = await Promise.all([
    getSettings(),
    getDoc(doc(db, "users", uid)),
    getAnnouncementsForUser(uid),
    getDocs(query(collection(db, "users"), where("referredBy", "==", uid))),
    getDocs(query(collection(db, `users/${uid}/activity`), where('type', '==', 'tool_usage'))),
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() as DocumentData : null;

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

  const welcomeMessage = userData?.firstName ? `Welcome Back, ${userData.firstName}!` : "User Dashboard";

  return (
    <DashboardClient 
        welcomeMessage={welcomeMessage}
        profile={serializableProfile}
        plan={userPlan}
        stats={stats}
        announcements={fetchedAnnouncements}
        uid={uid}
    />
  );
}
