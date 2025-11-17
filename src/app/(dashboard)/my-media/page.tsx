

import { getUserMedia } from '@/ai/flows/user-activity';
import { MyMediaClient } from './_components/MyMediaClient';
import { getAdminAuth } from '@/lib/firebase-admin-auth';
import { cookies } from 'next/headers';

export default async function MyMediaPage() {
    let uid = '';
    try {
        const session = cookies().get('session')?.value || '';
        const decodedClaims = await getAdminAuth().verifySessionCookie(session);
        uid = decodedClaims.uid;
    } catch (error) {
        console.error("Error getting user session:", error);
    }
    
    const initialMedia = uid ? await getUserMedia(uid) : [];

    return (
        <MyMediaClient initialMedia={initialMedia} />
    );
}
