

import { getTicketsByUser } from '@/ai/flows/ticket-management';
import { MyTicketsClient } from './_components/MyTicketsClient';
import { getAdminAuth } from '@/lib/firebase-admin-auth';
import { cookies } from 'next/headers';

export default async function MyTicketsPage() {
    let uid = '';
    try {
        const session = cookies().get('session')?.value || '';
        const decodedClaims = await getAdminAuth().verifySessionCookie(session);
        uid = decodedClaims.uid;
    } catch (error) {
        console.error("Error getting user session:", error);
    }
    
    const initialTickets = uid ? await getTicketsByUser(uid) : [];
    
    return (
        <MyTicketsClient initialTickets={initialTickets} />
    );
}
