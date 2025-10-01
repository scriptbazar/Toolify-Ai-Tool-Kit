

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, ArrowRight, Newspaper, Package, Star, Megaphone } from "lucide-react";
import { getSettings } from '@/ai/flows/settings-management';
import type { Plan } from '@/ai/flows/settings-management.types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAnnouncementsForUser } from '@/ai/flows/announcement-flow';
import { type Announcement } from '@/ai/flows/announcement-flow.types';
import { DashboardClient } from './_components/DashboardClient';
import { unstable_cache as cache, revalidatePath } from 'next/cache';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';


const getDashboardData = cache(async (uid: string) => {
    const adminDb = getAdminDb();
    
    const [settings, userDocSnap, fetchedAnnouncements, referralsSnapshot, activitySnapshot] = await Promise.all([
      getSettings(),
      adminDb.collection("users").doc(uid).get(),
      getAnnouncementsForUser(uid),
      adminDb.collection("users").where("referredBy", "==", uid).get(),
      adminDb.collection(`users/${uid}/activity`).where('type', '==', 'tool_usage').get()
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
      toolsUsed: activitySnapshot.size,
      referrals: referralsSnapshot.size,
    };
  
    return {
      profile: serializableProfile,
      plan: userPlan,
      announcements: fetchedAnnouncements,
      stats: stats,
    };
  }, ['dashboard-data'], { revalidate: 300 }); // Cache for 5 minutes


export default async function UserDashboard() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
       return <div className="flex items-center justify-center h-full"><p>Please log in to view your dashboard.</p></div>;
  }
  
  let decodedToken;
  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return <div className="flex items-center justify-center h-full"><p>Your session is invalid. Please log in again.</p></div>;
  }
  
  const uid = decodedToken.uid;
  
  const { profile, plan, announcements, stats } = await getDashboardData(uid);
  const welcomeMessage = profile?.firstName ? `Welcome Back, ${profile.firstName} ${profile.lastName}!` : "User Dashboard";

  return (
    <DashboardClient 
        welcomeMessage={welcomeMessage}
        profile={profile as any}
        plan={plan as any}
        stats={stats}
        announcements={announcements}
        uid={uid}
    />
  );
}
