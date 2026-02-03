'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsOldPage() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return (
        <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Redirecting to profile settings...</p>
        </div>
    );
}
