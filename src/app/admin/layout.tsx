
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { DashboardLayoutClient } from '@/app/admin/_components/DashboardLayoutClient';
import type { DocumentData } from 'firebase-admin/firestore';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import React from 'react';

export default function AdminPanelLayout({
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

          if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            setUser(firebaseUser);
            setUserData(userDocSnap.data());
          } else {
            // User is not an admin or doesn't exist in Firestore, redirect
            await auth.signOut();
            router.replace('/admin/login');
            return;
          }
        } catch (error) {
          console.error("Auth check error in admin layout:", error);
          router.replace('/admin/login');
        } finally {
            setLoading(false);
        }
      } else {
        // No user is signed in
        router.replace('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-lg">Verifying Admin Access...</p>
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
