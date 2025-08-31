
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getSettings } from '@/ai/flows/settings-management';
import { getReferralStatus, requestToJoinReferralProgram } from '@/ai/flows/user-management';
import type { ReferralSettings } from '@/ai/flows/settings-management.types';
import type { ReferralStatus } from '@/ai/flows/user-management.types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Gift, Copy, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface AppUser {
  firstName: string;
  lastName: string;
}

export default function ReferFriendPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [referralStatus, setReferralStatus] = useState<ReferralStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(true);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const [appSettings, userDocSnap, status] = await Promise.all([
            getSettings(),
            getDoc(userDocRef),
            getReferralStatus(firebaseUser.uid),
          ]);

          setSettings(appSettings.referral || null);
          setReferralStatus(status);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as AppUser);
          }
        } catch (error) {
          console.error("Error fetching page data:", error);
          toast({ title: "Error", description: "Could not load referral program details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login?redirect=/refer-a-friend');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);
  
  const handleJoinProgram = async () => {
    if (!user || !userData) return;
    setIsJoining(true);
    try {
        await requestToJoinReferralProgram({
            userId: user.uid,
            userName: `${userData.firstName} ${userData.lastName}`,
            userEmail: user.email!,
        });
        setReferralStatus({ status: 'pending' });
        toast({
            title: 'Request Sent!',
            description: "Your request to join the referral program has been sent for approval.",
        });
    } catch (error: any) {
        toast({
            title: "Request Failed",
            description: error.message || "Could not send your request. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsJoining(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Referral link copied to clipboard!' });
  };
  
  if (loading) {
      return (
         <div>
            <Skeleton className="h-10 w-1/3 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-48 w-full" />
                   <Skeleton className="h-10 w-48 mt-6" />
                </CardContent>
            </Card>
        </div>
      );
  }
  
  if (!settings || !settings.isReferralEnabled) {
      return (
          <Card>
            <CardHeader>
                <CardTitle>Referral Program</CardTitle>
            </CardHeader>
             <CardContent className="text-center text-muted-foreground py-12">
                <p>The referral program is currently not available.</p>
             </CardContent>
          </Card>
      )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Refer a Friend & Earn</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift className="h-6 w-6 text-primary"/> Share the Love, Get Rewarded!</CardTitle>
          <CardDescription>
            Invite your friends to ToolifyAI and earn commissions on their subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {referralStatus?.status === 'approved' && referralStatus.referralCode ? (
                <div className="space-y-4 text-center p-6 border bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto"/>
                    <h3 className="text-xl font-semibold">You're in the program!</h3>
                    <p className="text-muted-foreground">Start sharing your unique referral link to earn rewards.</p>
                    <div className="flex w-full max-w-md mx-auto items-center space-x-2 pt-4">
                        <Input
                            readOnly
                            value={`${window.location.origin}/?ref=${referralStatus.referralCode}`}
                         />
                        <Button onClick={() => copyToClipboard(`${window.location.origin}/?ref=${referralStatus.referralCode}`)}>
                            <Copy className="mr-2 h-4 w-4"/> Copy Link
                        </Button>
                    </div>
                </div>
            ) : referralStatus?.status === 'pending' ? (
                <div className="space-y-4 text-center p-6 border bg-yellow-50/50 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-12 w-12 text-yellow-500 mx-auto"/>
                    <h3 className="text-xl font-semibold">Request Pending Approval</h3>
                    <p className="text-muted-foreground">Your request to join the referral program is currently under review. We'll notify you once it's approved.</p>
                </div>
            ) : (
                 <>
                    <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: settings.referralProgramDescription || ''}} />
                    </div>
                    <Button onClick={handleJoinProgram} disabled={isJoining} size="lg">
                        {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
                        Join Referral Program
                    </Button>
                 </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
