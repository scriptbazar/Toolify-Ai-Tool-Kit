
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDesc } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DIALOG_SESSION_KEY = 'developmentNoticeShown';

export function DevelopmentNoticeDialog() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasBeenShown = sessionStorage.getItem(DIALOG_SESSION_KEY);
        if (!hasBeenShown) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        sessionStorage.setItem(DIALOG_SESSION_KEY, 'true');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <AlertTriangle className="h-10 w-10 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl text-center">Beta Phase: Help Us Improve!</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-muted-foreground text-sm space-y-4">
                    <p>
                        Welcome to ToolifyAI! We're currently in our beta phase, which means you might encounter some bugs. Your feedback is crucial in helping us build a better product.
                    </p>
                    <ul className="text-left list-disc pl-5 space-y-1">
                        <li>If you see an error, take a screenshot.</li>
                        <li>Click "Raise Complaint" to report the issue.</li>
                    </ul>
                </div>
                <div className="flex justify-center gap-2">
                    <Button onClick={handleClose} variant="outline" className="w-full">
                        Got it, thanks!
                    </Button>
                    <Button asChild className="w-full">
                        <Link href="/my-tickets">
                            <Bug className="mr-2 h-4 w-4" /> Raise Complaint
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
