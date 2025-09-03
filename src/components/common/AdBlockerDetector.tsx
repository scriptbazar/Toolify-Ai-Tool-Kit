
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getSettings } from '@/ai/flows/settings-management';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDesc } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export function AdBlockerDetector() {
  const [isBlocking, setIsBlocking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [adBlockerDetectionEnabled, setAdBlockerDetectionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user and settings in parallel
    Promise.all([
      new Promise<User | null>(resolve => onAuthStateChanged(auth, resolve)),
      getSettings()
    ]).then(async ([user, settings]) => {
      const detectionEnabled = settings.general?.security?.enableAdBlockerDetection ?? false;
      setAdBlockerDetectionEnabled(detectionEnabled);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserPlan(userDocSnap.data().planId || 'free');
        } else {
          setUserPlan('free');
        }
      } else {
        setUserPlan('free'); // Treat non-logged-in users as free users
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    // Only run detection logic if the setting is enabled and the user is on a free plan
    if (loading || !adBlockerDetectionEnabled || userPlan !== 'free') {
      return;
    }

    const adBlockTest = document.createElement('div');
    adBlockTest.innerHTML = '&nbsp;';
    adBlockTest.className = 'adsbox'; // A common class name targeted by ad blockers
    adBlockTest.style.position = 'absolute';
    adBlockTest.style.left = '-9999px';
    adBlockTest.style.top = '-9999px';
    document.body.appendChild(adBlockTest);

    const checkAdBlocker = () => {
      if (adBlockTest.offsetHeight === 0) {
        setIsBlocking(true);
        setIsModalOpen(true);
      }
      document.body.removeChild(adBlockTest);
    };

    // Use a timeout to give the ad blocker time to hide the element
    const detectionTimeout = setTimeout(checkAdBlocker, 1000);

    return () => {
      clearTimeout(detectionTimeout);
      if (document.body.contains(adBlockTest)) {
        document.body.removeChild(adBlockTest);
      }
    };
  }, [loading, adBlockerDetectionEnabled, userPlan]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <DialogTitle className="text-center text-2xl">Ad Blocker Detected</DialogTitle>
          <DialogDesc className="text-center">
            Our free tools are supported by ads. To continue using our services, please disable your ad blocker for this site. Your support helps us keep our tools free!
          </DialogDesc>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.reload()}>
            I've disabled my ad blocker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
