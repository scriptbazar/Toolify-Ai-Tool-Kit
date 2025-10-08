
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayoutClient } from '@/app/(dashboard)/_components/DashboardLayoutClient';
import type { User as FirebaseUser } from 'firebase/auth';
import type { DocumentData } from 'firebase-admin/firestore';

// Server-side function to get user and check admin role
async function getAdminUser(): Promise<{ user: FirebaseUser, userData: DocumentData } | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection("users").doc(decodedToken.uid);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists() && userDocSnap.data()?.role === 'admin') {
      return { 
        user: decodedToken as unknown as FirebaseUser, 
        userData: userDocSnap.data()! 
      };
    }
    return null;
  } catch (error) {
    console.error("Admin verification failed:", error);
    return null;
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminData = await getAdminUser();
  
  if (!adminData) {
    // If not an admin, redirect to login page at the server level.
    // This is more reliable than client-side redirects.
    redirect('/admin/login');
  }

  const { user, userData } = adminData;

  // Pass the verified user and data to the client component for rendering the UI.
  return (
    <DashboardLayoutClient user={user} userData={userData}>
      {children}
    </DashboardLayoutClient>
  );
}
