
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Users, DollarSign, MousePointerClick, Percent, Calendar, Hourglass, XCircle, Loader2, HelpCircle, Construction } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getSettings } from '@/ai/flows/settings-management';
import { type ReferralSettings, type ReferralStatus, type FaqItem } from '@/ai/flows/settings-management.types';
import { requestToJoinAffiliateProgram } from '@/ai/flows/user-management';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StatCard } from '@/components/common/StatCard';
import * as Icons from 'lucide-react';


interface ReferredUser {
    id: string;
    name: string;
    date: string;
    status: string;
    earnings: string;
}

interface AffiliateStats {
    clicks: number;
    referrals: number;
    earnings: number;
    conversionRate: string;
}

export default function AffiliateProgramPage() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [referralSettings, setReferralSettings] = useState<ReferralSettings | null>(null);
    const [affiliateStatus, setAffiliateStatus] = useState<ReferralStatus>('not_joined');
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [stats, setStats] = useState<AffiliateStats>({ clicks: 0, referrals: 0, earnings: 0, conversionRate: '0.00%' });
    const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
    const { toast } = useToast();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(true);
                try {
                    // Fetch settings and user data in parallel
                    const settingsPromise = getSettings();
                    const userDocPromise = getDoc(doc(db, "users", firebaseUser.uid));
                    
                    const [settings, userDocSnap] = await Promise.all([settingsPromise, userDocPromise]);
                    
                    setReferralSettings(settings.referral || null);
                    setFaqs(settings.faqs?.affiliateFaqs || []);
                    
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        const currentStatus = userData.affiliateStatus || 'not_joined';
                        setAffiliateStatus(currentStatus);

                        // If user is an approved affiliate, fetch their stats
                        if (currentStatus === 'approved') {
                            const clicks = userData.affiliateClicks || 0;
                            const referrals = userData.affiliateReferrals || 0;
                            const earnings = userData.affiliateEarnings || 0;
                            const conversionRate = clicks > 0 ? ((referrals / clicks) * 100).toFixed(2) + '%' : '0.00%';
                            setStats({ clicks, referrals, earnings, conversionRate });

                            // Fetch referred users
                            const q = query(collection(db, "users"), where("referredBy", "==", firebaseUser.uid));
                            const referredUsersSnapshot = await getDocs(q);
                            const fetchedReferredUsers: ReferredUser[] = referredUsersSnapshot.docs.map(doc => {
                                const data = doc.data();
                                return {
                                    id: doc.id,
                                    name: `${data.firstName} ${data.lastName}`,
                                    date: data.createdAt.toDate().toLocaleDateString(),
                                    status: data.planId === 'free' ? 'Free Plan' : 'Pro Plan',
                                    earnings: '$0.00' // This would require more complex logic
                                };
                            });
                            setReferredUsers(fetchedReferredUsers);
                        }
                    }

                } catch (error) {
                    console.error("Failed to load affiliate settings", error);
                    toast({
                        title: "Error",
                        description: "Could not load your affiliate program details.",
                        variant: "destructive"
                    });
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                // Optionally redirect to login
                // router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [toast]);
    
     const handleJoinRequest = async () => {
        if (!user) {
            toast({ title: 'You must be logged in.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await requestToJoinAffiliateProgram(user.uid);
            if (result.success) {
                setAffiliateStatus('pending');
                toast({
                    title: 'Request Submitted!',
                    description: 'Our team will review your request. This can take up to 24-48 hours.',
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Could not submit your request.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    const referralLink = user ? `${window.location.origin}/signup?ref=${user.uid}` : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        toast({
            title: "Copied to clipboard!",
            description: "Your referral link has been copied.",
        });
    };
    
    if (loading) {
        return (
            <div className="space-y-6">
                 <Skeleton className="h-10 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                 </div>
                 <Skeleton className="h-64" />
            </div>
        )
    }
    
    if (!referralSettings?.isReferralEnabled) {
        if (affiliateStatus === 'not_joined') {
             return (
                <Card className="text-center p-8">
                    <CardTitle>Affiliate Program Coming Soon!</CardTitle>
                    <CardDescription className="mt-2">
                        Our affiliate program is currently being revamped. Please check back later for exciting opportunities.
                    </CardDescription>
                </Card>
            );
        } else {
            return (
                <Card className="text-center p-8">
                     <Construction className="mx-auto h-12 w-12 text-primary mb-4"/>
                    <CardTitle>Affiliate Program Under Maintenance</CardTitle>
                    <CardDescription className="mt-2">
                        We are currently performing some updates on the affiliate system. Your dashboard will be back online shortly.
                    </CardDescription>
                </Card>
            );
        }
    }
    
    if (affiliateStatus === 'not_joined') {
         return (
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Join Our Affiliate Program</CardTitle>
                    <CardDescription className="max-w-2xl mx-auto">
                        Earn rewards by sharing ToolifyAI with your audience. Get a commission for every new paying customer you refer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-12">
                         <div className="p-4 border rounded-lg">
                            <Percent className="mx-auto h-8 w-8 mb-2 text-primary"/>
                            <h3 className="font-bold">{referralSettings?.commissionRate || 20}% Commission</h3>
                            <p className="text-sm text-muted-foreground">On all payments for the first year.</p>
                         </div>
                         <div className="p-4 border rounded-lg">
                            <Calendar className="mx-auto h-8 w-8 mb-2 text-primary"/>
                            <h3 className="font-bold">{referralSettings?.cookieDuration || 30}-Day Cookie</h3>
                            <p className="text-sm text-muted-foreground">Get credit for referrals up to a month later.</p>
                         </div>
                          <div className="p-4 border rounded-lg">
                            <DollarSign className="mx-auto h-8 w-8 mb-2 text-primary"/>
                            <h3 className="font-bold">${referralSettings?.payoutThreshold || 50} Payout Threshold</h3>
                            <p className="text-sm text-muted-foreground">Receive your earnings via PayPal.</p>
                         </div>
                    </div>
                    {faqs.length > 0 && (
                         <div className="mt-12 pt-8 border-t">
                          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                            <HelpCircle className="h-6 w-6" />
                            Frequently Asked Questions
                          </h2>
                          <Accordion type="single" collapsible className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {faqs.map((faq) => {
                                const Icon = (Icons as any)[faq.icon] || HelpCircle;
                                return (
                                  <AccordionItem value={faq.question} key={faq.question} className="border-none">
                                    <AccordionTrigger className="faq-accordion-trigger">
                                       <div className="flex items-center gap-4">
                                          <div className="p-2 bg-muted rounded-full">
                                            <Icon className="h-5 w-5 text-primary" />
                                          </div>
                                          <span>{faq.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pl-16">
                                      {faq.answer}
                                    </AccordionContent>
                                  </AccordionItem>
                                )
                            })}
                          </Accordion>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-4 pt-6 border-t mt-8">
                    <p className="text-sm text-muted-foreground">{referralSettings.referralProgramDescription}</p>
                    <Button onClick={handleJoinRequest} disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Request to Join Affiliate Program
                    </Button>
                </CardFooter>
            </Card>
         );
    }
    
    if (affiliateStatus === 'pending') {
        return (
             <Card className="text-center p-8">
                <Hourglass className="mx-auto h-12 w-12 text-primary mb-4 animate-spin"/>
                <CardTitle>Request Pending Approval</CardTitle>
                <CardDescription className="mt-2">
                    Your request to join the affiliate program is under review. You will be notified once it's processed.
                </CardDescription>
            </Card>
        );
    }
    
    if (affiliateStatus === 'rejected') {
        return (
             <Card className="text-center p-8 bg-destructive/10 border-destructive">
                <XCircle className="mx-auto h-12 w-12 text-destructive mb-4"/>
                <CardTitle>Request Denied</CardTitle>
                <CardDescription className="mt-2 text-destructive-foreground">
                    Unfortunately, your request to join the affiliate program was not approved at this time.
                </CardDescription>
            </Card>
        );
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
                <p className="text-muted-foreground">
                    Track your referrals and earnings.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Link</CardTitle>
                    <CardDescription>Share this link to earn commissions on new signups.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input value={referralLink} readOnly />
                        <Button type="button" onClick={copyToClipboard}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Your Referrals" value={stats.referrals.toString()} icon={Users} />
                <StatCard title="Total Clicks" value={stats.clicks.toString()} icon={MousePointerClick} />
                <StatCard title="Conversion Rate" value={stats.conversionRate} icon={Percent} />
                <StatCard title="Total Earnings" value={`$${stats.earnings.toFixed(2)}`} icon={DollarSign} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Referred Users</CardTitle>
                    <CardDescription>A list of users who have signed up using your link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Signup Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Earnings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referredUsers.length > 0 ? referredUsers.map(ref => (
                                <TableRow key={ref.id}>
                                    <TableCell>{ref.name}</TableCell>
                                    <TableCell>{ref.date}</TableCell>
                                    <TableCell>{ref.status}</TableCell>
                                    <TableCell>{ref.earnings}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No referred users yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
