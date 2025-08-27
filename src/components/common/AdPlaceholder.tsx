
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type AdPlaceholderProps = {
  className?: string;
};

interface UserData {
  plan?: 'Free' | 'Pro' | 'Team';
  // other user fields can be added here
}

export function AdPlaceholder({ className }: AdPlaceholderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData);
          } else {
             // Default to free user if no specific data is found
            setUserData({ plan: 'Free' });
          }
        } catch (error) {
           console.error("Failed to fetch user data:", error);
           // Default to showing ad on error
           setUserData({ plan: 'Free' });
        }
      } else {
        setUser(null);
        setUserData(null); // No user, so ads should show
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Skeleton className={cn('h-[100px] w-full', className)} />
    );
  }

  // Hide ads for Pro or Team plan users
  if (userData?.plan === 'Pro' || userData?.plan === 'Team') {
    return null;
  }
  
  // Show ads for free users or non-logged-in users
  return (
    <div
      className={cn(
        'flex w-full min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4 text-center',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Megaphone className="h-5 w-5" />
        <p className="text-sm font-medium">Advertisement</p>
      </div>
    </div>
  );
}
