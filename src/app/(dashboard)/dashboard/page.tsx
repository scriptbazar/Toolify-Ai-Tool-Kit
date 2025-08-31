
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, History } from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getSettings } from '@/ai/flows/settings-management';
import type { Plan } from '@/ai/flows/settings-management.types';
import { getUserActivity } from '@/ai/flows/user-activity';
import type { UserActivity } from '@/ai/flows/user-activity.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  planId?: string;
  referrals?: number;
  toolsUsed?: number;
  nextPaymentDate?: string;
  subscriptionPrice?: number;
}

export default function UserDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            try {
                const [settings, userDocSnap, userActivities] = await Promise.all([
                    getSettings(),
                    getDoc(doc(db, "users", firebaseUser.uid)),
                    getUserActivity(firebaseUser.uid)
                ]);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as UserProfile;
                    setProfile(userData);
                    const userPlan = settings.plan?.plans.find(p => p.id === userData.planId) || settings.plan?.plans.find(p => p.id === 'free') || null;
                    setPlan(userPlan);
                }
                setActivities(userActivities);

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                toast({
                    title: "Error",
                    description: "Could not load your dashboard.",
                    variant: "destructive",
                });
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);
  
  const welcomeMessage = profile?.firstName ? `Welcome Back, ${profile.firstName} ${profile.lastName}!` : "User Dashboard";
  
  if (loading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
       <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
        <p className="text-muted-foreground">
          Here's a quick overview of your account and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tools Used
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.toolsUsed || 0}</div>
            <p className="text-xs text-muted-foreground">
              in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan?.name || 'Free Plan'}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.nextPaymentDate ? `Renews on ${profile.nextPaymentDate}` : 'Upgrade to Pro'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{profile?.referrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              friends joined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Payment
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(plan?.price || 0).toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">
              {profile?.nextPaymentDate ? `on ${profile.nextPaymentDate}` : 'No upcoming payment'}
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="w-5 h-5"/>Recent Activity</CardTitle>
          <CardDescription>A log of your most recent actions on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? activities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.details.name}</TableCell>
                  <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">
                        No recent activity found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
