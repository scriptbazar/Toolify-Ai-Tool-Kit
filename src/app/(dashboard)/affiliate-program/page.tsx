

import { getSettings } from '@/ai/flows/settings-management';
import { type ReferralSettings, type FaqItem } from '@/ai/flows/settings-management.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { getAdminAuth } from '@/lib/firebase-admin-auth';
import { cookies } from 'next/headers';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AffiliateProgramClient } from './_components/AffiliateProgramClient';

export default async function AffiliateProgramPage() {
    let uid = '';
    let userData: any = null;
    let affiliateStats = { clicks: 0, referrals: 0, earnings: 0, conversionRate: '0.00%' };
    let referredUsersData: any[] = [];
    
    try {
        const session = cookies().get('session')?.value || '';
        const decodedClaims = await getAdminAuth().verifySessionCookie(session);
        uid = decodedClaims.uid;
    } catch (error) {
        console.error("Error getting user session for affiliate page:", error);
    }
    
    const settings = await getSettings();
    
    if (!settings.referral?.isReferralEnabled) {
        return (
            <Card className="text-center p-8">
                <Construction className="mx-auto h-12 w-12 text-primary mb-4"/>
                <CardTitle>Affiliate Program Not Available</CardTitle>
                <CardDescription className="mt-2">
                    Our affiliate program is currently disabled. Please check back later.
                </CardDescription>
            </Card>
        );
    }

    if (uid) {
        const userDocSnap = await getDoc(doc(db, "users", uid));
        if (userDocSnap.exists()) {
            userData = userDocSnap.data();
            const currentStatus = userData.affiliateStatus || 'not_joined';

            if (currentStatus === 'approved') {
                const clicks = userData.affiliateClicks || 0;
                
                const referralsQuery = query(collection(db, "users"), where("referredBy", "==", uid));
                const referralsSnapshot = await getDocs(referralsQuery);
                const referrals = referralsSnapshot.size;
                
                const earnings = userData.affiliateEarnings || 0;
                const conversionRate = clicks > 0 ? ((referrals / clicks) * 100).toFixed(2) + '%' : '0.00%';
                
                affiliateStats = { clicks, referrals, earnings, conversionRate };

                referredUsersData = referralsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const isPro = data.planId && data.planId !== 'free';
                    const planPrice = settings.plan?.plans.find(p => p.id === data.planId)?.price || 0;
                    const commission = settings.referral?.commissionRate || 20;

                    return {
                        id: doc.id,
                        name: `${data.firstName} ${data.lastName}`,
                        date: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                        status: isPro ? 'Pro Plan' : 'Free Plan',
                        earnings: isPro ? `$${(planPrice * (commission / 100)).toFixed(2)}` : '$0.00'
                    };
                });
            }
        }
    }

    return (
        <AffiliateProgramClient
            user={uid ? { uid } : null}
            initialAffiliateStatus={userData?.affiliateStatus || 'not_joined'}
            referralSettings={settings.referral ?? null}
            faqs={settings.faqs?.affiliateFaqs ?? []}
            initialStats={affiliateStats}
            initialReferredUsers={referredUsersData}
        />
    );
}
