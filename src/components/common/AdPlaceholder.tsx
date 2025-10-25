'use client';

import { useState, useEffect, useRef } from 'react';
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

const AdSlot = ({ adCode }: { adCode: string }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adContainer = adRef.current;
    if (adContainer && adCode) {
      // Clear previous content
      adContainer.innerHTML = '';
      
      // Create a script tag and append it. This is a more reliable way to execute ad scripts.
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      
      // This is a tricky part. Some ad codes are just script sources, some are inline scripts.
      // We try to handle both.
      if (adCode.includes('<script')) {
        // If the code is a full script tag, we need to extract its content or src
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adCode;
        const adScript = tempDiv.querySelector('script');
        if (adScript) {
            if (adScript.src) {
                script.src = adScript.src;
            } else {
                try {
                    script.appendChild(document.createTextNode(adScript.innerHTML));
                } catch(e) {
                    script.text = adScript.innerHTML;
                }
            }
        }
      } else {
          // Assume it's just the script content
           try {
                script.appendChild(document.createTextNode(adCode));
            } catch(e) {
                script.text = adCode;
            }
      }
      
      adContainer.appendChild(script);
    }
  }, [adCode]);

  return <div ref={adRef} />;
};


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
  const adType = adSettings?.adType ?? 'none';
  const showAdsToPro = adSettings?.showAdsForPro ?? false;

  // Rule 1: Ads are globally disabled.
  if (adType === 'none') {
    return null;
  }
  
  // Rule 2: Pro users do not see ads, unless specifically enabled. Admins are exempt from this rule for debugging.
  if (isProUser && !showAdsToPro && !isAdmin) {
    return null;
  }

  // Rule 3: Process manual ad slots.
  if (adType === 'manual' && adSlotId) {
    const slot = adSettings?.manualAdSlots?.find(s => s.id === adSlotId);
    
    // If the slot has ad code, render it for everyone (respecting the pro user rule handled above).
    if (slot?.code) {
      return (
        <div className={cn('ad-slot-container', className)}>
            <AdSlot adCode={slot.code} />
        </div>
      );
    }
    
    // If the slot is empty, only show the placeholder for admins.
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

    // For all other cases (slot not found, or user is not admin and slot is empty), render nothing.
    return null;
  }

  // Rule 4: Handle Auto Ads. These are managed by a script in the head,
  // so no specific placeholder needs to be rendered for users.
  // Returning null is the cleanest option for auto-ads.
  return null;
}
