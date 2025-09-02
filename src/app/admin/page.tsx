
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

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
          await auth.signOut();
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
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <Logo className="h-16 w-16 animate-pulse" />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-lg">Loading Admin Panel...</p>
      </div>
    </div>
  );
}
