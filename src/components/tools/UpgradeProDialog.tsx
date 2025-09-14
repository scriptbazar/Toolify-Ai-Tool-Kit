
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDesc } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradeProDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function UpgradeProDialog({ isOpen, onOpenChange }: UpgradeProDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
           <div className="flex justify-center mb-4">
               <div className="bg-primary/10 p-4 rounded-full">
                  <Star className="h-12 w-12 text-primary" />
               </div>
           </div>
          <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          <DialogDesc>
            This is a Pro feature. Upgrade your plan to unlock this tool and many others.
          </DialogDesc>
        </DialogHeader>
        <div className="py-4">
            <ul className="space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary"/>Access all 100+ tools</li>
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary"/>Unlimited AI generations</li>
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary"/>Ad-free experience</li>
            </ul>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/manage-subscription">Upgrade Plan</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
