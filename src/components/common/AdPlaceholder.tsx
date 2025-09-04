
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import type { AdvertisementSettings } from '@/ai/flows/settings-management.types';

type AdPlaceholderProps = {
  className?: string;
  adSlotId?: string;
  adSettings: AdvertisementSettings | null;
};

interface UserData {
  planId?: 'free' | 'pro' | 'team';
  role?: 'user' | 'admin';
}

export function AdPlaceholder({ className, adSlotId, adSettings }: AdPlaceholderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({ planId: data.planId || 'free', role: data.role || 'user' });
          } else {
            setUserData({ planId: 'free', role: 'user' }); // Default if no doc
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUserData({ planId: 'free', role: 'user' }); // Default on error
        }
      } else {
        setUserData({ planId: 'free', role: 'user' }); // Treat non-logged-in users as free users
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Skeleton className={cn('h-[100px] w-full', className)} />;
  }
  
  const isProUser = userData?.planId === 'pro' || userData?.planId === 'team';
  const isAdmin = userData?.role === 'admin';
  const showAdsToPro = adSettings?.showAdsForPro ?? false;
  const adType = adSettings?.adType ?? 'none';
  
  // Rule 1: Ads are globally disabled.
  if (adType === 'none') {
    return null;
  }
  
  // Rule 2: Pro users don't see ads unless specifically enabled.
  // Admins always see placeholders, so we bypass this check for them.
  if (isProUser && !showAdsToPro && !isAdmin) {
      return null;
  }
  
  // Rule 3: Process manual ad slots.
  if (adType === 'manual' && adSlotId) {
    const slot = adSettings?.manualAdSlots?.find(s => s.id === adSlotId);
    
    // Case 3a: The slot has ad code. Render it for everyone (respecting pro user rule).
    if (slot?.code) {
      return (
        <div
          className={cn('ad-slot-container', className)}
          dangerouslySetInnerHTML={{ __html: slot.code }}
        />
      );
    }
    
    // Case 3b: The slot is empty, and the user is an admin. Show the placeholder.
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

    // For all other cases (slot not found, or user is not admin and slot is empty), show nothing.
    return null;
  }

  // Fallback for auto-ads, which are handled by a script in the header.
  // This can show a general placeholder for admins if no specific slot ID is relevant.
  if (adType === 'auto' && isAdmin) {
    // Admins see a general notice for auto-ads, but no specific placeholders
    // as the ad network controls placement. We don't render placeholders for auto-ads.
    return null;
  }

  return null;
}
