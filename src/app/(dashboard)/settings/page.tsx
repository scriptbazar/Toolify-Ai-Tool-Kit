
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect component to resolve Next.js parallel route conflict.
 * This file replaces the duplicate settings page in the (dashboard) group.
 */
export default function SettingsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground animate-pulse">Redirecting to settings...</p>
        </div>
    );
}
