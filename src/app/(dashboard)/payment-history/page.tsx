

import { getPayments } from '@/ai/flows/payment-management';
import { getAdminAuth } from '@/lib/firebase-admin-auth';
import { cookies } from 'next/headers';
import { PaymentHistoryClient } from './_components/PaymentHistoryClient';

export default async function PaymentHistoryPage() {
    let uid = '';
    try {
        const session = cookies().get('session')?.value || '';
        const decodedClaims = await getAdminAuth().verifySessionCookie(session);
        uid = decodedClaims.uid;
    } catch (error) {
        console.error("Error getting user session:", error);
    }

    const allPayments = await getPayments();
    const userPayments = uid ? allPayments.filter(p => p.userId === uid) : [];
    
    return (
       <PaymentHistoryClient initialPayments={userPayments} />
    );
}
