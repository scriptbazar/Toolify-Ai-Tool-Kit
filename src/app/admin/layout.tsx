
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import type { User as FirebaseUser } from 'firebase/auth';
import type { DocumentData } from 'firebase-admin/firestore';
import React from 'react';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to safely convert Timestamps to ISO strings
function serializeTimestamps(obj: any): any {
  if (!obj) return obj;
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeTimestamps);
  }
  if (typeof obj === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      newObj[key] = serializeTimestamps(obj[key]);
    }
    return newObj;
  }
  return obj;
}

async function getAuthenticatedAdmin(): Promise<{ user: FirebaseUser; userData: DocumentData | null; } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    };

    try {
        const adminAuth = getAdminAuth();
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        
        const db = getAdminDb();
        const userDocSnap = await db.collection('users').doc(decodedToken.uid).get();
        
        if (!userDocSnap.exists || userDocSnap.data()?.role !== 'admin') {
            return null; // Not an admin or user document doesn't exist
        }

        const userData = userDocSnap.data() as DocumentData;
        const serializableUserData = serializeTimestamps(userData);
        
        return {
            user: decodedToken as unknown as FirebaseUser,
            userData: serializableUserData,
        };

    } catch (error) {
        // If verifySessionCookie fails (e.g., cookie expired), it's not a valid session.
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
