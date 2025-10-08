
'use client';

import { AdminLayoutClient } from '@/app/admin/_components/AdminLayoutClient';
import { useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useState } from 'react';

// This is now a simplified root layout for /admin routes
// Authentication logic is moved to the (dashboard) group layout
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setUser(firebaseUser);
                setUserData(data);
            }
        }
    });
    return () => unsubscribe();
  }, []);

  return (
      <AdminLayoutClient user={user} userData={userData}>
        {children}
      </AdminLayoutClient>
  );
}
