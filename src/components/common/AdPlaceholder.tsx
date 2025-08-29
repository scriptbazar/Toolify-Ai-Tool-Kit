
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { getSettings } from '@/ai/flows/settings-management';
import type { AdvertisementSettings } from '@/ai/flows/settings-management.types';

type AdPlaceholderProps = {
  className?: string;
  adSlotId?: string;
};

interface UserData {
  plan?: 'Free' | 'Pro' | 'Team';
}

export function AdPlaceholder({ className, adSlotId }: AdPlaceholderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [adSettings, setAdSettings] = useState<AdvertisementSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch ad settings first
      try {
        const settings = await getSettings();
        setAdSettings(settings.advertisement || null);
      } catch (error) {
        console.error("Failed to fetch ad settings:", error);
      }

      // Then check auth state
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data() as UserData);
            } else {
              setUserData({ plan: 'Free' });
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserData({ plan: 'Free' });
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className={cn('h-[100px] w-full', className)} />;
  }
  
  const isProUser = userData?.plan === 'Pro' || userData?.plan === 'Team';
  const showAdsToPro = adSettings?.showAdsForPro ?? false;
  const adType = adSettings?.adType ?? 'none';
  
  // If ads are disabled globally, show nothing.
  if (adType === 'none') {
    return null;
  }
  
  // If the user is Pro and we are not showing ads to Pro users, show nothing.
  if (isProUser && !showAdsToPro) {
      return null;
  }

  // Handle manual ad slots
  if (adType === 'manual' && adSlotId) {
    const slot = adSettings?.manualAdSlots?.find(s => s.id === adSlotId);
    if (slot && slot.code) {
      return (
        <div
          className={cn('ad-slot-container', className)}
          dangerouslySetInnerHTML={{ __html: slot.code }}
        />
      );
    }
    // If no code for this manual slot, render nothing.
    return null;
  }
  
  // Fallback for non-specific ad slots (like the original sidebar one)
  if (!adSlotId) {
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

  return null;
}
