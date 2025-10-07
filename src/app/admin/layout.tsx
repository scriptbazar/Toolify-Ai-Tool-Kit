
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import type { User as FirebaseUser } from 'firebase/auth';
import type { DocumentData } from 'firebase-admin/firestore';
import React from 'react';

async function getAuthenticatedAdmin(): Promise<{ user: FirebaseUser; userData: DocumentData | null; } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        console.log("No session cookie found, redirecting to login.");
        return null;
    };

    try {
        const adminAuth = getAdminAuth();
        if (!adminAuth) {
            console.error("Admin auth is not initialized");
            return null;
        }
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        
        const db = getAdminDb();
        if (!db) {
            console.error("Admin DB is not initialized");
            return null;
        }
        
        const userDocRef = db.collection('users').doc(decodedToken.uid);
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
        // If user doc doesn't exist or user is not an admin
        console.log(`User ${decodedToken.uid} is not an admin or document does not exist.`);
        return null;
    } catch (error: any) {
        console.error('Admin auth check error in layout:', error.code, error.message);
        // Clear the invalid cookie
        cookies().set('session', '', { maxAge: -1 });
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
