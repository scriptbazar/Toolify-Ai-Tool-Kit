

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
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';


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
    const userPlan = settings.plan?.plans.find(p => p.id === userData?.planId) || settings.plan?.plans.find(p => p.id === 'free') || null;
  
    const stats = {
      toolsUsed: activitySnapshot.size,
      referrals: referralsSnapshot.size,
    };
  
    return {
      profile: userData,
      plan: userPlan,
      announcements: fetchedAnnouncements,
      stats: stats,
    };
  }, ['dashboard-data'], { revalidate: 300 }); // Cache for 5 minutes


export default async function UserDashboard() {
  const cookieStore = cookies();
  const session = cookieStore.get('session');

  // In a real app with proper auth, you'd get the UID from the verified session.
  // For this demo, we'll use a hardcoded UID for caching purposes.
  // This part needs to be replaced with your actual authentication logic.
  const uid = session?.value || 'default-user-id'; 

  if (!session) {
      // Handle unauthenticated user - redirect or show login
      // For now, we'll just show a message.
       return <div>Please log in to view your dashboard.</div>;
  }
  
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
