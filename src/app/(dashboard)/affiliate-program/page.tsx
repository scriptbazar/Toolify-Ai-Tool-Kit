
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Users, DollarSign, MousePointerClick, Percent, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getSettings } from '@/ai/flows/settings-management';
import { type ReferralSettings } from '@/ai/flows/settings-management.types';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const dummyReferredUsers = [
    { id: '1', name: 'Alice', date: '2023-10-15', status: 'Converted', earnings: '$5.00' },
    { id: '2', name: 'Bob', date: '2023-10-18', status: 'Clicked', earnings: '$0.00' },
];

export default function AffiliateProgramPage() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [referralSettings, setReferralSettings] = useState<ReferralSettings | null>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        async function fetchSettings() {
            setLoading(true);
            try {
                const settings = await getSettings();
                setReferralSettings(settings.referral || null);
            } catch (error) {
                console.error("Failed to load affiliate settings", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
        return () => unsubscribe();
    }, []);

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
        return (
            <Card className="text-center p-8">
                <CardTitle>Affiliate Program Not Available</CardTitle>
                <CardDescription className="mt-2">
                    The affiliate program is currently disabled. Please check back later.
                </CardDescription>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
                <p className="text-muted-foreground">
                    Earn rewards by referring new users to ToolifyAI.
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
                <StatCard title="Your Referrals" value="1" icon={Users} />
                <StatCard title="Total Clicks" value="2" icon={MousePointerClick} />
                <StatCard title="Conversion Rate" value="50%" icon={Percent} />
                <StatCard title="Total Earnings" value="$5.00" icon={DollarSign} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
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
                                    {dummyReferredUsers.map(ref => (
                                        <TableRow key={ref.id}>
                                            <TableCell>{ref.name}</TableCell>
                                            <TableCell>{ref.date}</TableCell>
                                            <TableCell>{ref.status}</TableCell>
                                            <TableCell>{ref.earnings}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Program Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                           <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Percent className="h-4 w-4"/>Commission Rate</span>
                                <span className="font-bold">{referralSettings?.commissionRate || 20}%</span>
                           </div>
                           <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Cookie Duration</span>
                                <span className="font-bold">{referralSettings?.cookieDuration || 30} days</span>
                           </div>
                           <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4"/>Payout Threshold</span>
                                <span className="font-bold">${referralSettings?.payoutThreshold || 50}</span>
                           </div>
                           <p className="text-xs text-muted-foreground pt-4 border-t">
                             {referralSettings?.referralProgramDescription || 'Earn a commission for every new paying customer you refer. Payments are made monthly.'}
                           </p>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
