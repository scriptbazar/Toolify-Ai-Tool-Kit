
'use server';

/**
 * @fileOverview Manages payment history in Firestore.
 */

import { adminDb } from '@/lib/firebase-admin';
import { type Payment } from './payment-management.types';

/**
 * Fetches all payment records from Firestore.
 */
export async function getPayments(): Promise<Payment[]> {
    try {
        const snapshot = await adminDb.collection('payments').orderBy('date', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        
        const payments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                transactionId: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                plan: data.plan,
                amount: data.amount,
                date: data.date.toDate().toISOString(),
                status: data.status,
                paymentMethod: data.paymentMethod,
            } as Payment;
        });

        return payments;
    } catch (error) {
        console.error("Error fetching payments:", error);
        // In a real app, you might want more robust error handling,
        // but for now, we'll return an empty array to prevent crashing the client.
        return [];
    }
}
