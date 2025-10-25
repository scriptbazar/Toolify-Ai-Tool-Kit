'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getSettings } from '@/ai/flows/settings-management';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export function AdBlockerDetector() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldCheck, setShouldCheck] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      new Promise<User | null>(resolve => onAuthStateChanged(auth, resolve)),
      getSettings()
    ]).then(async ([user, settings]) => {
      const detectionEnabled = settings.general?.security?.enableAdBlockerDetection ?? false;
      let userPlan = 'free';

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          userPlan = userDocSnap.data().planId || 'free';
        }
      }
      
      // Only enable the check if the setting is on AND the user is on a free plan
      if (detectionEnabled && userPlan === 'free') {
        setShouldCheck(true);
      }

      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (loading || !shouldCheck) {
      return;
    }

    const adBlockTest = document.createElement('div');
    adBlockTest.innerHTML = '&nbsp;';
    adBlockTest.className = 'adsbox';
    adBlockTest.style.position = 'absolute';
    adBlockTest.style.left = '-9999px';
    adBlockTest.style.top = '-9999px';
    document.body.appendChild(adBlockTest);

    const checkAdBlocker = () => {
      // Check both offsetHeight and computed style for display property
      const isBlockedByHeight = adBlockTest.offsetHeight === 0;
      const isBlockedByDisplay = window.getComputedStyle(adBlockTest).getPropertyValue('display') === 'none';

      if (isBlockedByHeight || isBlockedByDisplay) {
        setIsModalOpen(true);
      }
      
      // Cleanup
      try {
        if (document.body.contains(adBlockTest)) {
          document.body.removeChild(adBlockTest);
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
    };

    // Use requestAnimationFrame for a more reliable check after render
    const rafId = requestAnimationFrame(() => {
      // And a small timeout to give ad blockers time to act
      setTimeout(checkAdBlocker, 300);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (document.body.contains(adBlockTest)) {
          try {
            document.body.removeChild(adBlockTest);
          } catch(e) {}
      }
    };
  }, [loading, shouldCheck]);

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
