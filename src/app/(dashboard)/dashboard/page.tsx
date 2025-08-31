
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, ArrowRight, Newspaper, Package, Star, Megaphone } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAnnouncementsForUser, markAnnouncementsAsRead } from '@/ai/flows/announcement-flow';
import { type Announcement } from '@/ai/flows/announcement-flow.types';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  planId?: string;
  referrals?: number;
  toolsUsed?: number;
  nextPaymentDate?: string;
  subscriptionPrice?: number;
}

const AnnouncementItem = ({ announcement }: { announcement: Announcement }) => (
    <div className="p-4 rounded-lg border bg-background/50">
        <div className="flex items-center justify-between">
            <h4 className="font-semibold">{announcement.title}</h4>
            <div className="flex items-center gap-2">
                {announcement.isNew && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                <p className="text-xs text-muted-foreground">{new Date(announcement.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2 mb-4">{announcement.content}</p>
        {announcement.featureSlug && (
            <Button size="sm" asChild>
                <Link href={`/tools/${announcement.featureSlug}`}>Check it out</Link>
            </Button>
        )}
    </div>
);


export default function UserDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            try {
                const [settings, userDocSnap, fetchedAnnouncements] = await Promise.all([
                    getSettings(),
                    getDoc(doc(db, "users", firebaseUser.uid)),
                    getAnnouncementsForUser(firebaseUser.uid),
                ]);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as UserProfile;
                    setProfile(userData);
                    const userPlan = settings.plan?.plans.find(p => p.id === userData.planId) || settings.plan?.plans.find(p => p.id === 'free') || null;
                    setPlan(userPlan);
                }
                
                setAnnouncements(fetchedAnnouncements);

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
  
  const handleOpenWhatsNew = async () => {
    setIsWhatsNewOpen(true);
    if (user && announcements.some(a => a.isNew)) {
      const newIds = announcements.filter(a => a.isNew).map(a => a.id);
      await markAnnouncementsAsRead(user.uid, newIds);
      // Optimistically update the UI
      setAnnouncements(prev => prev.map(a => ({ ...a, isNew: false })));
    }
  };

  const hasNewAnnouncements = announcements.some(a => a.isNew);
  
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
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="group cursor-pointer p-6 border rounded-lg hover:bg-muted/50 transition-colors" onClick={handleOpenWhatsNew}>
                  <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                          <Megaphone />What's New
                          {hasNewAnnouncements && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Check out the latest updates and new features.</p>
              </div>
              <Link href="/tools" className="group">
                  <div className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2"><Package />Explore All Tools</h3>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Check out our full toolbox of 100+ utilities.</p>
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
      
        <Dialog open={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>What's New at ToolifyAI</DialogTitle>
              <DialogDescription>
                Here are the latest updates, features, and fixes from our team.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {announcements.length > 0 ? (
                    announcements.map(announcement => (
                      <AnnouncementItem key={announcement.id} announcement={announcement} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center pt-8">No announcements yet. Check back soon!</p>
                  )}
                </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
    </div>
  );
}
