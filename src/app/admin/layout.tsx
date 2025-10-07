
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import type { User as FirebaseUser } from 'firebase/auth';
import type { DocumentData } from 'firebase-admin/firestore';


async function getAuthenticatedAdmin(): Promise<{ user: FirebaseUser; userData: DocumentData | null; } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const adminAuth = getAdminAuth();
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        
        const userDocRef = getAdminDb().collection('users').doc(decodedToken.uid);
        const userDocSnap = await userDocRef.get();

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as DocumentData;
            // Ensure this is an admin user
            if (userData.role === 'admin') {
                return {
                    user: decodedToken as unknown as FirebaseUser,
                    userData,
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Admin auth check error in layout:', error);
        return null;
    }
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await getAuthenticatedAdmin();

  if (!authData?.user) {
    redirect('/admin/login');
  }

  return (
    <AdminLayoutClient user={authData.user} userData={authData.userData}>
      {children}
    </AdminLayoutClient>
  );
}
