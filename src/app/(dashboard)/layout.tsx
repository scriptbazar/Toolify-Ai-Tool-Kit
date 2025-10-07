
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayoutClient } from '@/app/(dashboard)/_components/DashboardLayoutClient';
import { type User as FirebaseUser } from 'firebase/auth';
import type { DocumentData } from 'firebase-admin/firestore';

async function getAuthenticatedUser(): Promise<{ user: FirebaseUser; userData: DocumentData | null; isAdmin: boolean } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const adminAuth = getAdminAuth();
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        
        const userDocRef = getAdminDb().collection('users').doc(decodedToken.uid);
        const userDocSnap = await userDocRef.get();

        if (userDocSnap.exists) {
            const userData = userDocSnap.data() as DocumentData;
            return {
                user: decodedToken as unknown as FirebaseUser,
                userData,
                isAdmin: userData.role === 'admin'
            };
        }
        
        // This case should ideally not happen for a logged-in user.
        return { user: decodedToken as unknown as FirebaseUser, userData: null, isAdmin: false };
    } catch (error) {
        console.error('Auth check error in layout:', error);
        return null;
    }
}


export default async function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const authData = await getAuthenticatedUser();

    if (!authData?.user) {
        redirect('/login');
    }
    
    // If an admin tries to access the user dashboard, redirect them.
    if (authData.isAdmin) {
        redirect('/admin/dashboard');
    }

  return (
    <DashboardLayoutClient user={authData.user} userData={authData.userData}>
        {children}
    </DashboardLayoutClient>
  );
}
