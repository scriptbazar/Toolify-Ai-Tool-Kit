
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { DashboardLayoutClient } from '@/app/(dashboard)/_components/DashboardLayoutClient';
import type { DocumentData } from 'firebase-admin/firestore';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import React from 'react';

export default function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
             if (data.role === 'admin') {
                // If an admin tries to access the user dashboard, redirect them.
                router.replace('/admin/dashboard');
                return;
             }
            setUser(firebaseUser);
            setUserData(data);
          } else {
             // User exists in auth but not firestore, probably an error state
            await auth.signOut();
            router.replace('/login');
            return;
          }
        } catch (error) {
          console.error("Auth check error in user layout:", error);
          router.replace('/login');
        } finally {
            setLoading(false);
        }
      } else {
        // No user is signed in
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user || !userData) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutClient user={user} userData={userData}>
      {children}
    </DashboardLayoutClient>
  );
}
