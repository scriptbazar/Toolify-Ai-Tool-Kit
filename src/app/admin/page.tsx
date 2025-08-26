'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, now check their role.
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          // User is an admin, redirect to the dashboard.
          router.replace('/admin/dashboard');
        } else {
          // User is not an admin, redirect to the admin login page.
          // You might want to sign them out here as well.
          router.replace('/admin/login');
        }
      } else {
        // No user is signed in, redirect to the admin login page.
        router.replace('/admin/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading admin panel...</p>
    </div>
  );
}
