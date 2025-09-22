
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDesc, DialogFooter } from '@/components/ui/dialog';
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
            <DialogContent className="sm:max-w-lg text-center">
                <DialogHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <AlertTriangle className="h-10 w-10 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl text-center">Welcome to ToolifyAI!</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-muted-foreground text-sm space-y-4">
                    <p>
                        You may encounter some errors or bugs. If you find any issues, please help us improve by reporting them.
                    </p>
                    <p>
                        Take a screenshot of the error and click the "Raise Complaint" button to let our team know. Your feedback is crucial for making our product better!
                    </p>
                </div>
                <DialogFooter className="sm:justify-center gap-2">
                    <Button onClick={handleClose} variant="outline">
                        Got it, thanks!
                    </Button>
                    <Button asChild>
                        <Link href="/my-tickets">
                            <Bug className="mr-2 h-4 w-4" /> Raise Complaint
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
