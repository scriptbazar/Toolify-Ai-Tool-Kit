
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, ArrowRight, Newspaper, Package, Star } from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getSettings } from '@/ai/flows/settings-management';
import type { Plan } from '@/ai/flows/settings-management.types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            try {
                const [settings, userDocSnap] = await Promise.all([
                    getSettings(),
                    getDoc(doc(db, "users", firebaseUser.uid)),
                ]);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as UserProfile;
                    setProfile(userData);
                    const userPlan = settings.plan?.plans.find(p => p.id === userData.planId) || settings.plan?.plans.find(p => p.id === 'free') || null;
                    setPlan(userPlan);
                }

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
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Explore new tools, read our latest articles, or manage your subscription.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/tools" className="group">
                  <div className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2"><Package />Explore New Tools</h3>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Check out the latest additions to our toolbox.</p>
                  </div>
              </Link>
              <Link href="/blog" className="group">
                  <div className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2"><Newspaper />Latest Blog Posts</h3>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Read our tips, tutorials, and announcements.</p>
                  </div>
              </Link>
              <Link href="/manage-subscription" className="group">
                   <div className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2"><Star />Manage Subscription</h3>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Upgrade your plan or view billing details.</p>
                  </div>
              </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
