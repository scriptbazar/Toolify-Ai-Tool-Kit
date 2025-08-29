
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
  role?: 'user' | 'admin';
}

export function AdPlaceholder({ className, adSlotId }: AdPlaceholderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [adSettings, setAdSettings] = useState<AdvertisementSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const settings = await getSettings();
        setAdSettings(settings.advertisement || null);
      } catch (error) {
        console.error("Failed to fetch ad settings:", error);
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data() as UserData);
            } else {
              setUserData({ plan: 'Free', role: 'user' });
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserData({ plan: 'Free', role: 'user' });
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
  const isAdmin = userData?.role === 'admin';
  const showAdsToPro = adSettings?.showAdsForPro ?? false;
  const adType = adSettings?.adType ?? 'none';
  
  // Rule 1: Globally disabled ads show nothing.
  if (adType === 'none') {
    return null;
  }
  
  // Rule 2: Pro users don't see ads unless specifically enabled.
  if (isProUser && !showAdsToPro) {
      return null;
  }
  
  // Rule 3: For 'manual' ad type, process the slot.
  if (adType === 'manual' && adSlotId) {
    const slot = adSettings?.manualAdSlots?.find(s => s.id === adSlotId);
    
    // If the slot has code, display it for everyone (respecting pro user rules).
    if (slot && slot.code) {
      return (
        <div
          className={cn('ad-slot-container', className)}
          dangerouslySetInnerHTML={{ __html: slot.code }}
        />
      );
    }
    
    // If the slot is empty BUT the user is an admin, show a placeholder.
    if (isAdmin) {
       return (
          <div
            className={cn(
              'flex w-full min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 p-4 text-center text-primary',
              className
            )}
          >
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              <p className="text-sm font-medium">Ad Slot: '{adSlotId}'</p>
            </div>
          </div>
        );
    }

    // If the slot is empty and user is not admin, show nothing.
    return null;
  }

  // Fallback for non-specific ad slots or other conditions.
  // This can also serve as a placeholder for admins if no slot ID is passed.
  if (isAdmin) {
    return (
      <div
        className={cn(
          'flex w-full min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4 text-center',
          className
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Megaphone className="h-5 w-5" />
          <p className="text-sm font-medium">General Advertisement Area</p>
        </div>
      </div>
    );
  }

  return null;
}
