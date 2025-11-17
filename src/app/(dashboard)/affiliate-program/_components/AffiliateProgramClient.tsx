'use client';

import { useState } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Users, DollarSign, MousePointerClick, Percent, Calendar, Hourglass, XCircle, Loader2, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { type ReferralSettings, type FaqItem } from '@/ai/flows/settings-management.types';
import { requestToJoinAffiliateProgram } from '@/ai/flows/user-management';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StatCard } from '@/components/common/StatCard';
import * as Icons from 'lucide-react';

type ReferralStatus = 'not_joined' | 'pending' | 'approved' | 'rejected';

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

interface AffiliateProgramClientProps {
    user: { uid: string } | null;
    initialAffiliateStatus: ReferralStatus;
    referralSettings: ReferralSettings | null;
    faqs: FaqItem[];
    initialStats: AffiliateStats;
    initialReferredUsers: ReferredUser[];
}

const getIconComponent = (iconName?: string): React.ElementType => {
    if (!iconName) return HelpCircle;
    const IconComponent = (Icons as any)[iconName as keyof typeof Icons];
    return IconComponent || HelpCircle;
};

export function AffiliateProgramClient({
    user,
    initialAffiliateStatus,
    referralSettings,
    faqs,
    initialStats,
    initialReferredUsers
}: AffiliateProgramClientProps) {
    const [affiliateStatus, setAffiliateStatus] = useState<ReferralStatus>(initialAffiliateStatus);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

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
                            <h3 className="font-bold">{referralSettings?.commissionRate ?? 20}% Commission</h3>
                            <p className="text-sm text-muted-foreground">On all payments for the first year.</p>
                         </div>
                         <div className="p-4 border rounded-lg">
                            <Calendar className="mx-auto h-8 w-8 mb-2 text-primary"/>
                            <h3 className="font-bold">{referralSettings?.cookieDuration ?? 30}-Day Cookie</h3>
                            <p className="text-sm text-muted-foreground">Get credit for referrals up to a month later.</p>
                         </div>
                          <div className="p-4 border rounded-lg">
                            <DollarSign className="mx-auto h-8 w-8 mb-2 text-primary"/>
                            <h3 className="font-bold">${referralSettings?.payoutThreshold ?? 50} Payout Threshold</h3>
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
                                const Icon = getIconComponent(faq.icon as string);
                                return (
                                  <AccordionItem value={faq.question} key={faq.id} className="border-none">
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
                    <p className="text-sm text-muted-foreground">{referralSettings?.referralProgramDescription ?? ''}</p>
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
                <StatCard title="Your Referrals" value={initialStats.referrals.toString()} icon={Users} />
                <StatCard title="Total Clicks" value={initialStats.clicks.toString()} icon={MousePointerClick} />
                <StatCard title="Conversion Rate" value={initialStats.conversionRate} icon={Percent} />
                <StatCard title="Total Earnings" value={`$${initialStats.earnings.toFixed(2)}`} icon={DollarSign} />
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
                            {initialReferredUsers.length > 0 ? initialReferredUsers.map(ref => (
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